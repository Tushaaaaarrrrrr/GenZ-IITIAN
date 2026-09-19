/**
 * ============================================================================
 * GEN-Z IITIAN - 1:1 PERSONALISED TEACHING BOOKING APP SCRIPT
 * ============================================================================
 * Handles:
 *   1. Booking Confirmation Email (Booked Mail) + BCC to genziitian@gmail.com
 *   2. Cancellation Email (Cancellation Mail) + BCC to genziitian@gmail.com
 *   3. Reschedule Email (Reschedule Mail) + BCC to genziitian@gmail.com
 *   4. Google Sheets real-time logging into '1on1_Bookings' tab
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open https://script.google.com/ and click "New Project".
 * 2. Delete any existing code and PASTE this entire script.
 * 3. (Optional) Open a Google Sheet and copy its ID, or let it log to the active sheet.
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Configuration:
 *    - Description: "1:1 Booking Handler"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (allows website to POST to it)
 * 7. Click "Deploy", authorize permissions when prompted, and COPY the Web App URL.
 * 8. Set the copied URL as ONE_ON_ONE_WEBHOOK_URL in your server/.env configuration.
 * ============================================================================
 */

const BCC_EMAIL = "genziitian@gmail.com, lkiitmng2428@gmail.com";
const SUPPORT_WHATSAPP = "https://wa.me/917970495447";
const WEBSITE_URL = "https://genziitian.in";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "No payload received" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents);
    const { 
      type = "one_on_one_booking", 
      name = "Student", 
      email, 
      phone = "N/A", 
      level = "N/A", 
      subjects = "N/A", 
      slot_date = "Upcoming", 
      slot_time = "15-min consultation", 
      previous_slot_date,
      previous_slot_time,
      plan = "1:1 Personalised Teaching", 
      notes = "None",
      reason = "Requested by student/support",
      timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    } = payload;

    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Email is required" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- DEDUPLICATION LOCK (prevents double triggers on retry) ---
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
    } catch (err) {
      // Continue even if lock wait times out
    }
    
    const cache = CacheService.getScriptCache();
    const cacheKey = "1on1_" + type + "_" + email.replace(/[^a-z0-9]/gi, "_") + "_" + (slot_date || "").replace(/[^a-z0-9]/gi, "_");
    if (cache.get(cacheKey)) {
      try { lock.releaseLock(); } catch(err){}
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "duplicate_skipped",
        message: "Duplicate request filtered within 2 minutes" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(cacheKey, "1", 120); // 2 minute deduplication window
    try { lock.releaseLock(); } catch(err){}

    // --- LOG TO GOOGLE SHEET ---
    logBookingToSheet({
      timestamp,
      type,
      name,
      email,
      phone,
      level,
      subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects,
      slot_date,
      slot_time,
      plan,
      notes,
      reason
    });

    // --- DISPATCH APPROPRIATE EMAIL TEMPLATE ---
    let resultStatus = "success";

    switch (type) {
      case "one_on_one_booking":
        sendBookedConfirmationEmail({
          name,
          email,
          phone,
          level,
          subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects,
          slot_date,
          slot_time,
          plan,
          notes
        });
        resultStatus = "booked_mail_sent";
        break;

      case "one_on_one_cancelled":
        sendCancellationEmail({
          name,
          email,
          slot_date,
          slot_time,
          subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects,
          reason
        });
        resultStatus = "cancellation_mail_sent";
        break;

      case "one_on_one_rescheduled":
        sendRescheduleEmail({
          name,
          email,
          slot_date,
          slot_time,
          previous_slot_date,
          previous_slot_time,
          subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects
        });
        resultStatus = "reschedule_mail_sent";
        break;

      default:
        sendBookedConfirmationEmail({
          name,
          email,
          phone,
          level,
          subjects: Array.isArray(subjects) ? subjects.join(", ") : subjects,
          slot_date,
          slot_time,
          plan,
          notes
        });
        resultStatus = "default_booked_mail_sent";
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      status: resultStatus, 
      email, 
      bcc: BCC_EMAIL,
      timestamp 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 1. BOOKED CONFIRMATION EMAIL (Sent when slot is booked)
 */
function sendBookedConfirmationEmail(data) {
  const subject = "Confirmed: Your 1:1 Personalised Teaching Slot 🎯 - GenZ IITian";
  
  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>1:1 Slot Confirmed - GenZ IITian</title></head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; margin:0 auto; background:#ffffff; border:2.5px solid #0b1120; border-radius:18px; overflow:hidden; box-shadow: 6px 6px 0px #0b1120;">
          <!-- Header -->
          <tr>
            <td style="background:#070d19; padding:28px 24px; text-align:left; border-bottom: 2.5px solid #0b1120;">
              <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:800; color:#10b981; background:#064e3b; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">● 1:1 Teaching</span>
              <h1 style="margin:12px 0 0; font-size:24px; font-weight:900; color:#ffffff; line-height:1.2;">Your 1:1 Consultation is Confirmed! 🎯</h1>
              <p style="margin:6px 0 0; font-size:13px; color:#94a3b8; font-weight:500;">Zero distraction, zero shared focus. Just like your dedicated personal home tutor.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px; background:#ffffff;">
              <p style="margin:0 0 14px; font-size:15px; font-weight:800; color:#0b1120;">Hey ${escapeHtml(data.name)} 👋,</p>
              <p style="margin:0 0 18px; font-size:14px; color:#334155; line-height:1.6; font-weight:500;">
                We have received your request for a <strong>free 15-minute 1:1 consultation</strong>. A senior coordinator from our teaching team is matching you with a dedicated tutor.
              </p>

              <!-- Slot Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc; border:2px solid #0b1120; border-radius:12px; margin-bottom:22px; box-shadow: 3px 3px 0px #0b1120;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px; font-size:13px; color:#0b1120;"><strong>📅 Booked Date:</strong> <span style="color:#2563eb; font-weight:700;">${escapeHtml(data.slot_date)}</span></p>
                    <p style="margin:0 0 10px; font-size:13px; color:#0b1120;"><strong>⏰ 15-Min Window:</strong> <span style="color:#059669; font-weight:700;">${escapeHtml(data.slot_time)}</span></p>
                    <p style="margin:0 0 10px; font-size:13px; color:#0b1120;"><strong>📚 Subject(s):</strong> ${escapeHtml(data.subjects)}</p>
                    <p style="margin:0 0 10px; font-size:13px; color:#0b1120;"><strong>🎓 Program Level:</strong> ${escapeHtml(data.level)}</p>
                    <p style="margin:0; font-size:13px; color:#0b1120;"><strong>📱 WhatsApp Number:</strong> ${escapeHtml(data.phone)}</p>
                  </td>
                </tr>
              </table>

              <!-- What to expect -->
              <p style="margin:0 0 16px; font-size:13px; color:#475569; line-height:1.6;">
                <strong>What happens next:</strong> Our tutor will connect with you at your chosen time window to discuss your specific subject doubts, past quiz performance, and tailor a weekly schedule that fits your routine.
              </p>

              <!-- Buttons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="${SUPPORT_WHATSAPP}" style="display:inline-block; background:#10b981; color:#ffffff; font-weight:800; font-size:13px; padding:11px 18px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 2px 2px 0px #0b1120;">💬 Chat on WhatsApp</a>
                  </td>
                  <td>
                    <a href="${WEBSITE_URL}/profile" style="display:inline-block; background:#f8fafc; color:#0b1120; font-weight:800; font-size:13px; padding:11px 18px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 2px 2px 0px #0b1120;">View in Profile &rarr;</a>
                  </td>
                </tr>
              </table>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0 18px;">
              <p style="margin:0; font-size:12px; color:#64748b;">Need to reschedule or cancel? You can manage your session anytime from your <a href="${WEBSITE_URL}/profile" style="color:#2563eb; font-weight:700;">student profile</a>.<br><br>Rooting for your success,<br><strong style="color:#0b1120;">Team GenZ IITian</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  MailApp.sendEmail({
    to: data.email,
    bcc: BCC_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: "GenZ IITIAN 1:1 Teaching"
  });
}

/**
 * 2. CANCELLATION EMAIL (Sent when session is cancelled)
 */
function sendCancellationEmail(data) {
  const subject = "Cancelled: 1:1 Consultation Session - GenZ IITian";

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>1:1 Consultation Cancelled - GenZ IITian</title></head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; margin:0 auto; background:#ffffff; border:2.5px solid #0b1120; border-radius:18px; overflow:hidden; box-shadow: 6px 6px 0px #0b1120;">
          <!-- Header -->
          <tr>
            <td style="background:#1e293b; padding:28px 24px; text-align:left; border-bottom: 2.5px solid #0b1120;">
              <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:800; color:#ef4444; background:#450a0a; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">● Session Cancelled</span>
              <h1 style="margin:12px 0 0; font-size:24px; font-weight:900; color:#ffffff; line-height:1.2;">Your 1:1 Consultation has been Cancelled</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px; background:#ffffff;">
              <p style="margin:0 0 14px; font-size:15px; font-weight:800; color:#0b1120;">Hey ${escapeHtml(data.name)} 👋,</p>
              <p style="margin:0 0 18px; font-size:14px; color:#334155; line-height:1.6;">
                This is a confirmation that your upcoming 15-minute 1:1 consultation session has been cancelled as requested.
              </p>

              <!-- Cancelled Session Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fef2f2; border:2px solid #ef4444; border-radius:12px; margin-bottom:22px; box-shadow: 3px 3px 0px #ef4444;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px; font-size:13px; color:#991b1b;"><strong>📅 Cancelled Date:</strong> ${escapeHtml(data.slot_date)}</p>
                    <p style="margin:0 0 8px; font-size:13px; color:#991b1b;"><strong>⏰ Time:</strong> ${escapeHtml(data.slot_time)}</p>
                    <p style="margin:0; font-size:13px; color:#991b1b;"><strong>📚 Subject(s):</strong> ${escapeHtml(data.subjects || 'N/A')}</p>
                    ${data.reason ? `<p style="margin:8px 0 0; font-size:12px; color:#7f1d1d;"><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>` : ''}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px; font-size:14px; color:#475569; line-height:1.6;">
                Need help at a later time? You can always book a fresh slot whenever you are ready.
              </p>

              <!-- Rebook CTA -->
              <a href="${WEBSITE_URL}/one-to-one" style="display:inline-block; background:#10b981; color:#ffffff; font-weight:800; font-size:13px; padding:12px 22px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 2px 2px 0px #0b1120;">
                Book a New Slot &rarr;
              </a>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:26px 0 18px;">
              <p style="margin:0; font-size:12px; color:#64748b;">If this cancellation was an error, simply reply to this email or reach us on <a href="${SUPPORT_WHATSAPP}" style="color:#10b981; font-weight:700;">WhatsApp</a>.<br><br>Team GenZ IITian</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  MailApp.sendEmail({
    to: data.email,
    bcc: BCC_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: "GenZ IITIAN 1:1 Teaching"
  });
}

/**
 * 3. RESCHEDULE EMAIL (Sent when session is rescheduled to a new time)
 */
function sendRescheduleEmail(data) {
  const subject = "Updated: Your 1:1 Session has been Rescheduled 🔄 - GenZ IITian";

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>1:1 Session Rescheduled - GenZ IITian</title></head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; margin:0 auto; background:#ffffff; border:2.5px solid #0b1120; border-radius:18px; overflow:hidden; box-shadow: 6px 6px 0px #0b1120;">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a; padding:28px 24px; text-align:left; border-bottom: 2.5px solid #0b1120;">
              <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:800; color:#38bdf8; background:#082f49; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">● Slot Updated</span>
              <h1 style="margin:12px 0 0; font-size:24px; font-weight:900; color:#ffffff; line-height:1.2;">Your 1:1 Session is Rescheduled 🔄</h1>
              <p style="margin:6px 0 0; font-size:13px; color:#94a3b8;">Your consultation has been moved to your newly selected time.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px; background:#ffffff;">
              <p style="margin:0 0 14px; font-size:15px; font-weight:800; color:#0b1120;">Hey ${escapeHtml(data.name)} 👋,</p>
              <p style="margin:0 0 18px; font-size:14px; color:#334155; line-height:1.6;">
                Your 15-minute 1:1 teaching consultation has been successfully updated with the following new details:
              </p>

              <!-- New Slot Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4; border:2.5px solid #10b981; border-radius:12px; margin-bottom:20px; box-shadow: 3px 3px 0px #10b981;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px; font-size:14px; color:#065f46;"><strong>🗓️ NEW Date:</strong> <span style="font-weight:800; color:#047857;">${escapeHtml(data.slot_date)}</span></p>
                    <p style="margin:0 0 10px; font-size:14px; color:#065f46;"><strong>⏰ NEW Time Window:</strong> <span style="font-weight:800; color:#047857;">${escapeHtml(data.slot_time)}</span> (15 mins)</p>
                    <p style="margin:0; font-size:13px; color:#065f46;"><strong>📚 Subjects:</strong> ${escapeHtml(data.subjects || 'N/A')}</p>
                  </td>
                </tr>
              </table>

              ${data.previous_slot_date ? `
              <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                (Previous slot: <strike>${escapeHtml(data.previous_slot_date)} at ${escapeHtml(data.previous_slot_time || '')}</strike>)
              </p>` : ''}

              <!-- Actions -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="${SUPPORT_WHATSAPP}" style="display:inline-block; background:#10b981; color:#ffffff; font-weight:800; font-size:13px; padding:11px 18px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 2px 2px 0px #0b1120;">💬 Confirm on WhatsApp</a>
                  </td>
                  <td>
                    <a href="${WEBSITE_URL}/profile" style="display:inline-block; background:#ffffff; color:#0b1120; font-weight:800; font-size:13px; padding:11px 18px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 2px 2px 0px #0b1120;">View in Profile &rarr;</a>
                  </td>
                </tr>
              </table>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0 18px;">
              <p style="margin:0; font-size:12px; color:#64748b;">We look forward to speaking with you at your newly confirmed slot.<br><br>Team GenZ IITian</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  MailApp.sendEmail({
    to: data.email,
    bcc: BCC_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: "GenZ IITIAN 1:1 Teaching"
  });
}

/**
 * HELPER: Log booking into Google Sheet
 */
function logBookingToSheet(row) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;

    let sheet = ss.getSheetByName("1on1_Bookings");
    if (!sheet) {
      sheet = ss.insertSheet("1on1_Bookings");
      sheet.appendRow([
        "Timestamp",
        "Action Type",
        "Student Name",
        "Email",
        "WhatsApp Phone",
        "Degree Level",
        "Subjects",
        "Slot Date",
        "Slot Time",
        "Plan",
        "Notes",
        "Reason"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#e2e8f0");
    }

    sheet.appendRow([
      row.timestamp,
      row.type,
      row.name,
      row.email,
      row.phone,
      row.level,
      row.subjects,
      row.slot_date,
      row.slot_time,
      row.plan,
      row.notes,
      row.reason
    ]);
  } catch (err) {
    Logger.log("Sheet log error: " + err.toString());
  }
}

/**
 * Basic HTML escape utility
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
