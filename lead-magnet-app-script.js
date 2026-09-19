/**
 * ============================================================================
 * GEN-Z IITIAN - "ACCESS PDF" LEAD MAGNET APP SCRIPT
 * ============================================================================
 * Handles:
 *   1. Logging every PDF request into a 'LeadMagnet_PDF' tab of a Google Sheet
 *   2. Emailing the requester a "Download PDF" link (their Google Drive file)
 *      + BCC to the admin inbox
 * ============================================================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Open https://script.google.com/ and click "New Project".
 * 2. Delete any existing code and PASTE this entire script.
 * 3. Open (or create) the Google Sheet you want leads logged into, copy its ID
 *    from the URL (…/spreadsheets/d/<THIS_PART>/edit), and paste it into
 *    SPREADSHEET_ID below. Leave it blank to log to this script's bound sheet.
 * 4. Update PDF_DRIVE_FILE_ID below if you swap the PDF file later — the file
 *    must be shared as "Anyone with the link can view".
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Configuration:
 *    - Description: "Access PDF Lead Magnet Handler"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (allows the website's server to POST to it)
 * 8. Click "Deploy", authorize permissions when prompted, and COPY the Web
 *    App URL.
 * 9. Set the copied URL as LEAD_MAGNET_WEBHOOK_URL in your server/.env (local)
 *    and in your Vercel project's environment variables (production).
 * ============================================================================
 */

const SPREADSHEET_ID = ""; // optional — leave blank to use the script's bound sheet
const PDF_DRIVE_FILE_ID = "1uKq2UKsIkdNiv3VKx2_BV_j2UXkjB2fA";
const BCC_EMAIL = "genziitian@gmail.com, lkiitmng2428@gmail.com";
const WEBSITE_URL = "https://genziitian.in";
const SUPPORT_WHATSAPP = "https://wa.me/917970495447";

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
      name = "Student",
      email,
      phone = "N/A",
      level = "N/A",
      pdf_name = "GenZ IITian Resource",
      timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    } = payload;

    if (!email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Email is required"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- DEDUPLICATION LOCK (prevents double rows/emails on retry) ---
    const lock = LockService.getScriptLock();
    try { lock.waitLock(10000); } catch (err) { /* continue even if wait times out */ }

    const cache = CacheService.getScriptCache();
    const cacheKey = "leadmagnet_" + email.replace(/[^a-z0-9]/gi, "_");
    if (cache.get(cacheKey)) {
      try { lock.releaseLock(); } catch (err) { }
      return ContentService.createTextOutput(JSON.stringify({
        status: "duplicate_skipped",
        message: "Duplicate request filtered within 2 minutes"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(cacheKey, "1", 120); // 2 minute dedup window
    try { lock.releaseLock(); } catch (err) { }

    const driveLink = "https://drive.google.com/uc?export=download&id=" + PDF_DRIVE_FILE_ID;

    logLeadToSheet({ timestamp, name, email, phone, level, pdf_name });
    sendPdfEmail({ name, email, phone, level, pdf_name, driveLink });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      status: "pdf_mail_sent",
      email,
      drive_link: driveLink,
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
 * Log the lead into the "LeadMagnet_PDF" sheet tab
 */
function logLeadToSheet(row) {
  try {
    const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;

    let sheet = ss.getSheetByName("LeadMagnet_PDF");
    if (!sheet) {
      sheet = ss.insertSheet("LeadMagnet_PDF");
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Level", "PDF Requested"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#e2e8f0");
    }

    sheet.appendRow([row.timestamp, row.name, row.email, row.phone, row.level, row.pdf_name]);
  } catch (err) {
    Logger.log("Sheet log error: " + err.toString());
  }
}

/**
 * Email the requester their PDF download link
 */
function sendPdfEmail(data) {
  const subject = "Your Free PDF is Ready to Download 📄 - GenZ IITian";

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your PDF - GenZ IITian</title></head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; margin:0 auto; background:#ffffff; border:2.5px solid #0b1120; border-radius:18px; overflow:hidden; box-shadow: 6px 6px 0px #0b1120;">
          <!-- Header -->
          <tr>
            <td style="background:#070d19; padding:28px 24px; text-align:left; border-bottom: 2.5px solid #0b1120;">
              <span style="display:inline-block; padding:4px 10px; font-size:11px; font-weight:800; color:#10b981; background:#064e3b; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">● Free Resource</span>
              <h1 style="margin:12px 0 0; font-size:24px; font-weight:900; color:#ffffff; line-height:1.2;">Here's your PDF, ${escapeHtml(data.name)}! 📄</h1>
              <p style="margin:6px 0 0; font-size:13px; color:#94a3b8; font-weight:500;">Thanks for requesting it — your download is ready below.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 24px; background:#ffffff;">
              <p style="margin:0 0 18px; font-size:14px; color:#334155; line-height:1.6; font-weight:500;">
                As requested, here is your copy of <strong>${escapeHtml(data.pdf_name)}</strong> for the <strong>${escapeHtml(data.level)}</strong> level.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
                <tr>
                  <td>
                    <a href="${data.driveLink}" style="display:inline-block; background:#10b981; color:#ffffff; font-weight:800; font-size:14px; padding:13px 22px; border-radius:10px; text-decoration:none; border:2px solid #0b1120; box-shadow: 3px 3px 0px #0b1120;">⬇ Download PDF Now</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px; font-size:12px; color:#64748b;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.driveLink}" style="color:#2563eb; word-break:break-all;">${data.driveLink}</a>
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:24px 0 18px;">
              <p style="margin:0; font-size:12px; color:#64748b;">Want more free resources, PYQs, and notes? Browse <a href="${WEBSITE_URL}/resources" style="color:#2563eb; font-weight:700;">genziitian.in/resources</a> or chat with us on <a href="${SUPPORT_WHATSAPP}" style="color:#10b981; font-weight:700;">WhatsApp</a>.<br><br>Rooting for your success,<br><strong style="color:#0b1120;">Team GenZ IITian</strong></p>
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
    name: "GenZ IITIAN"
  });
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
