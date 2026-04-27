function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { 
      name, email, phone, course_name, price, status, 
      payment_id, order_id, referral_code, discount_code, 
      coins_applied, failure_source, timestamp 
    } = data;

    // 1. Select the Sheet 
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];

    // --- FAST DEDUPLICATION (Cache & Lock) ---
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const cache = CacheService.getScriptCache();
    const cacheKey = 'pay_' + status + '_' + (order_id || '').replace(/[^a-z0-9]/gi, '_');
    if (order_id && cache.get(cacheKey)) {
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_skipped' })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Prevent Duplicates based on Order ID (prevents double logging from sheet history)
    var existingData = sheet.getDataRange().getValues();
    for (var i = 1; i < existingData.length; i++) {
      if (String(existingData[i][8]) === String(order_id)) {
        lock.releaseLock();
        return ContentService.createTextOutput("Duplicate");
      }
    }

    // Mark as processed in cache
    if (order_id) {
      cache.put(cacheKey, '1', 300); // 5 min window
    }

    // 3. Append row to sheet WITH price and new fields
    // NOTE: Make sure your Google Sheet has at least 12 columns
    sheet.appendRow([
      timestamp || new Date().toLocaleString(),       // Col 1
      name || "Student",            // Col 2
      email || "",           // Col 3
      "'" + (phone || "N/A"),     // Col 4 (Prefix ' prevents scientific notation format)
      course_name || "Unknown Course",     // Col 5
      price || 0,           // Col 6
      status || "UNKNOWN",          // Col 7
      payment_id || "",      // Col 8
      order_id || "N/A",        // Col 9
      referral_code || "N/A",   // Col 10
      discount_code || "N/A",   // Col 11
      coins_applied || 0    // Col 12
    ]);

    lock.releaseLock();

    const studentName = name || 'Student';
    const courseName = course_name || 'your course';
    const orderIdStr = order_id || 'N/A';

    if (status === 'SUCCESS' && email) {
      const successHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#e8edf5; font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8edf5; padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #d0ddf5; border-radius:16px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e4d96; background:linear-gradient(135deg,#0f2a5c 0%,#1e4d96 60%,#1a5fa8 100%); padding:32px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12); border-radius:6px; width:30px; height:30px; text-align:center; vertical-align:middle;">
                    <span style="font-size:14px; color:#ffffff;">&#127891;</span>
                  </td>
                  <td style="padding-left:8px; color:#ffffff; font-size:16px; font-weight:700;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:rgba(72,199,142,0.15); border:1px solid rgba(72,199,142,0.35); border-radius:20px; padding:5px 13px;">
                    <span style="color:#7ee8b8; font-size:12px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase;">&#x25CF; Payment Successful</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px; font-size:28px;">&#127881;</p>
              <p style="margin:0 0 10px; color:#ffffff; font-size:26px; font-weight:400; line-height:1.25; font-family:Georgia, serif;">
                You're in.<br>Welcome aboard.
              </p>
              <div style="width:36px; height:2px; background:#90c4ff; margin-bottom:10px;"></div>
              <p style="margin:0; color:#a8ccee; font-size:13px; line-height:1.6;">
                Your journey starts right now &mdash;<br>
                <span style="color:#cde4ff; font-weight:600;">we're genuinely proud of you.</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:26px 32px; background:#ffffff;">
              <p style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1a3a6e;">
                Hey ${studentName} &#128075;
              </p>
              <p style="margin:0 0 20px; font-size:14px; color:#555555; line-height:1.8;">
                You actually did it. Payment done, access granted. This is the moment a lot of people only think about &mdash; you took action. Now let's make it count. &#128170;
              </p>

              <!-- Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; margin-bottom:18px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:7px; border-bottom:1px solid #eaf0ff; font-size:11px; color:#8aabda; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; width:100px;">&#128218; Course</td>
                        <td style="padding-bottom:7px; border-bottom:1px solid #eaf0ff; font-size:13px; font-weight:600; color:#1a3a6e;">${courseName}</td>
                      </tr>
                      <tr>
                        <td style="padding:7px 0; border-bottom:1px solid #eaf0ff; font-size:11px; color:#8aabda; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; width:100px;">&#128231; Email</td>
                        <td style="padding:7px 0; border-bottom:1px solid #eaf0ff; font-size:13px; font-weight:600; color:#1a3a6e;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding-top:7px; font-size:11px; color:#8aabda; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; width:100px;">&#129534; Order ID</td>
                        <td style="padding-top:7px; font-size:13px; font-weight:600; color:#1a3a6e;">${orderIdStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Access Pill -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:9px; margin-bottom:18px;">
                <tr>
                  <td style="padding:12px 14px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="font-size:16px; padding-right:10px;">&#128275;</td>
                        <td style="font-size:13px; color:#444444; line-height:1.6;">
                          Click <strong style="color:#1a3a6e;">Access Classes</strong> below and log in with <strong style="color:#1a3a6e;">${email}</strong> &mdash; your course is already waiting inside.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center" style="padding-right:5px; width:50%;">
                    <a href="https://class.genziitian.in/login" style="display:block; text-align:center; background:#1a3a6e; color:#ffffff; font-size:12px; font-weight:700; padding:13px 10px; border-radius:9px; text-decoration:none;">
                      &#128218; Access Classes &rarr;
                    </a>
                  </td>
                  <td align="center" style="padding-left:5px; width:50%;">
                    <a href="https://app.genziitian.in" style="display:block; text-align:center; background:#f5f8ff; color:#1a3a6e; font-size:12px; font-weight:600; padding:12px 10px; border-radius:9px; text-decoration:none; border:1px solid #dde9ff;">
                      &#127760; Explore Courses
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Coin Block -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbea; background:linear-gradient(135deg,#fffbea,#fff5cc); border:1px solid #e8cc50; border-radius:12px; margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="60" align="center" valign="top" style="padding-right:14px;">
                          <span style="font-size:28px; display:block; line-height:1; margin-bottom:4px;">&#129353;</span>
                          <span style="font-size:10px; font-weight:700; color:#a07800; background:#fde97a; border-radius:20px; padding:2px 7px; display:inline-block; white-space:nowrap;">Upto &#8377;150/refer</span>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 3px; font-size:13px; font-weight:700; color:#7a5c00;">Earn while your friends learn</p>
                          <p style="margin:0 0 10px; font-size:12px; color:#6b5200; line-height:1.5;">Your friend gets a discount, you get <strong>up to &#8377;150 cashback</strong> &mdash; share your link and start earning.</p>
                          <a href="https://app.genziitian.in/refer" style="display:inline-block; background:#f5c518; color:#1a1a00; font-size:11px; font-weight:700; padding:7px 14px; border-radius:7px; text-decoration:none;">&#128279; Get Referral Link</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px dashed #cdd9f0; margin:20px 0;"></div>

              <!-- Contact -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #d0ddf5; border-radius:10px; margin-bottom:16px;">
                <tr>
                  <td style="padding:13px 15px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width:34px; height:34px; background:#1a3a6e; border-radius:50%; color:#ffffff; font-weight:700; text-align:center; line-height:34px; font-size:14px;">S</div>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 2px; font-size:12px; font-weight:700; color:#1a3a6e;">Sriram &mdash; Founder, GenZ IITIAN</p>
                          <p style="margin:0 0 7px; font-size:11px; color:#6a89bf;">any questions? I'm always here</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:8px; padding-bottom:4px;">
                                <a href="https://wa.me/917970495447" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:11px; font-weight:600; padding:5px 10px; border-radius:20px; text-decoration:none;">&#128241; +91 79704 95447</a>
                              </td>
                              <td style="padding-bottom:4px;">
                                <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:11px; font-weight:600; padding:5px 10px; border-radius:20px; text-decoration:none;">&#9993; admin@genziitian.org</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px; font-size:13px; color:#666666;">Seriously &mdash; we're rooting for you. Let's get that CGPA &#128640;</p>
              <p style="margin:0; font-size:13px; font-weight:700; color:#1a3a6e;">Team GenZ IITIAN</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#eef3fd; border-top:1px solid #d0ddf5; padding:13px 20px; text-align:center;">
              <p style="margin:0; font-size:11px; color:#7a9ac5;">
                &copy; 2026 GenZ IITIAN &middot; <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      MailApp.sendEmail({
        to: email,
        subject: "Payment Successful - GenZ IITIAN",
        htmlBody: successHtml,
        name: "GenZ IITIAN"
      });

    } else if ((status === 'FAILED' || status === 'ENROLLMENT_FAILED') && email) {
      const failHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#e8edf5; font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8edf5; padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #d0ddf5; border-radius:16px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a3a6e; background:linear-gradient(135deg,#1a3a6e 0%,#2a1a4e 100%); padding:30px 32px 26px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12); border-radius:6px; width:30px; height:30px; text-align:center; vertical-align:middle;">
                    <span style="font-size:14px; color:#ffffff;">&#127891;</span>
                  </td>
                  <td style="padding-left:8px; color:#ffffff; font-size:16px; font-weight:700;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>

              <div style="margin-bottom:12px;">
                <span style="display:inline-block; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:4px 10px; border-radius:20px; background:rgba(255,100,100,0.2); color:#ffaaaa; border:1px solid rgba(255,100,100,0.3);">Payment Failed</span>
              </div>

              <p style="margin:0 0 4px; color:#ffffff; font-size:24px; font-weight:400; line-height:1.3; font-family:Georgia, serif;">
                Something went wrong &#128533;
              </p>
              <p style="margin:0; color:#93b8e8; font-size:13px;">
                Don't worry &mdash; your money is safe.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:26px 32px; background:#ffffff;">
              <p style="margin:0 0 12px; font-size:15px; font-weight:600; color:#1a3a6e;">
                Hey ${studentName} &#128075;
              </p>
              <p style="margin:0 0 20px; font-size:14px; color:#555555; line-height:1.8;">
                Your payment didn't go through this time. It happens &mdash; let's get it sorted quickly.
              </p>

              <!-- Warning Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff5f5; border:1px solid #f5c6c6; border-radius:10px; margin-bottom:18px;">
                <tr>
                  <td style="padding:13px 15px; font-size:13px; color:#c0392b; line-height:1.7;">
                    &#128184; If any money was deducted, it'll be refunded automatically within <strong style="color:#c0392b;">3&ndash;5 business days</strong> back to your source.
                  </td>
                </tr>
              </table>

              <!-- Pills -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
                <tr>
                  <td style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:9px;">
                      <tr>
                        <td style="padding:10px 13px; font-size:13px; color:#444444;">
                          <span style="margin-right:10px;">&#128260;</span> Try a different card, UPI, or net banking
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:9px;">
                      <tr>
                        <td style="padding:10px 13px; font-size:13px; color:#444444;">
                          <span style="margin-right:10px;">&#127760;</span> Refresh or switch browsers
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:9px;">
                      <tr>
                        <td style="padding:10px 13px; font-size:13px; color:#444444;">
                          <span style="margin-right:10px;">&#128172;</span> Still stuck? Just reply &mdash; we'll fix it manually
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding-bottom:10px;">
                    <a href="https://class.genziitian.in" style="display:block; text-align:center; background:#c0392b; color:#ffffff; font-size:13px; font-weight:700; padding:13px 24px; border-radius:9px; text-decoration:none;">
                      &#128257; Retry Payment &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="https://app.genziitian.in" style="display:block; text-align:center; background:#f5f8ff; color:#1a3a6e; font-size:13px; font-weight:600; padding:12px 24px; border-radius:9px; text-decoration:none; border:1px solid #dde9ff;">
                      &#127760; Go to Website
                    </a>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px dashed #cdd9f0; margin:20px 0;"></div>

              <!-- Contact -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #d0ddf5; border-radius:10px; margin-bottom:16px;">
                <tr>
                  <td style="padding:13px 15px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="40" valign="top">
                          <div style="width:34px; height:34px; background:#1a3a6e; border-radius:50%; color:#ffffff; font-weight:700; text-align:center; line-height:34px; font-size:14px;">S</div>
                        </td>
                        <td valign="top">
                          <p style="margin:0 0 2px; font-size:12px; font-weight:700; color:#1a3a6e;">Sriram &mdash; Founder, GenZ IITIAN</p>
                          <p style="margin:0 0 7px; font-size:11px; color:#6a89bf;">reply here or WhatsApp directly</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:8px; padding-bottom:4px;">
                                <a href="https://wa.me/917970495447" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:11px; font-weight:600; padding:5px 10px; border-radius:20px; text-decoration:none;">&#128241; +91 79704 95447</a>
                              </td>
                              <td style="padding-bottom:4px;">
                                <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:11px; font-weight:600; padding:5px 10px; border-radius:20px; text-decoration:none;">&#9993; admin@genziitian.org</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px; font-size:13px; color:#666666;">We still want you here &#128153;</p>
              <p style="margin:0; font-size:13px; font-weight:700; color:#1a3a6e;">Team GenZ IITIAN</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#eef3fd; border-top:1px solid #d0ddf5; padding:13px 20px; text-align:center;">
              <p style="margin:0; font-size:11px; color:#7a9ac5;">
                &copy; 2026 GenZ IITIAN &middot; <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      MailApp.sendEmail({
        to: email,
        subject: "Payment Failed - GenZ IITIAN",
        htmlBody: failHtml,
        name: "GenZ IITIAN"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
