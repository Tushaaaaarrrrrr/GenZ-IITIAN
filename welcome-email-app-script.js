function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { email, name, type, timestamp } = data;

    // --- DEDUPLICATION: prevent duplicate emails from retries ---
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const cache = CacheService.getScriptCache();
    const cacheKey = 'sent_' + type + '_' + (email || '').replace(/[^a-z0-9]/gi, '_');
    if (cache.get(cacheKey)) {
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({ status: 'duplicate_skipped' })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(cacheKey, '1', 300); // 5 min window
    lock.releaseLock();

    // Log signup to sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([timestamp, email, name, type]);

    if (type === 'welcome' && email) {
      const studentName = name || 'Student';
      // ... Welcome Email HTML ...
      const welcomeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to GenZ IITIAN</title>
</head>
<body style="margin:0; padding:0; background-color:#e8f0fe; font-family:Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; color:#e8f0fe; opacity:0; mso-hide:all;">
    Welcome to GenZ IITIAN - your degree journey starts now!
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f0fe; padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="580" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:580px; margin:0 auto; background:#ffffff; border:1px solid #c5d8f8; border-radius:14px; overflow:hidden;">
          <tr>
            <td style="background:#1a3a6e; padding:28px 24px 20px; text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
                <tr>
                  <td style="background:#e8f0fe; border-radius:6px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                    <img src="https://img.icons8.com/ios-filled/20/1a3a6e/graduation-cap.png" width="20" height="20" alt="cap" style="display:block; margin:0 auto;" />
                  </td>
                  <td style="padding-left:10px; color:#ffffff; font-family:Georgia,serif; font-size:20px; font-weight:700;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>

              <div style="width:56px; height:3px; background:#90c4ff; border-radius:2px; margin:0 auto 14px;"></div>

              <p style="margin:0; color:#ffffff; font-family:Georgia,serif; font-size:24px; font-weight:700; line-height:1.4;">
                Welcome to the Family! &#127891;
              </p>
              <p style="margin:10px 0 0; color:#a8c4e8; font-size:14px; line-height:1.6;">
                You've just taken your first step towards excellence
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 28px; background:#ffffff;">
              <p style="margin:0 0 14px; font-size:18px; color:#1a3a6e; line-height:1.7;">
                Hey <strong>${studentName}</strong>! &#128075;
              </p>

              <p style="margin:0 0 14px; font-size:16px; color:#444444; line-height:1.75;">
                We're thrilled to have you on board at <strong style="color:#1a3a6e;">GenZ IITIAN</strong>.
                You've just joined a community of students who are leveling up, and
                <strong style="color:#1a3a6e;">we are absolutely thrilled to help you</strong> every step of the way.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://app.genziitian.in/courses" style="display:inline-block; background:#1a3a6e; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 24px; border-radius:8px; white-space:nowrap;">
                            Explore Courses →
                          </a>
                        </td>
                        <td style="padding-left:8px;">
                          <a href="https://class.genziitian.in/" style="display:inline-block; background:#ffffff; color:#1a3a6e; font-size:15px; font-weight:700; text-decoration:none; padding:14px 24px; border-radius:8px; border:2px solid #1a3a6e; white-space:nowrap;">
                            Demo Courses
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#e8f0fe; border:1.5px dashed #1a3a6e; border-radius:8px; padding:8px 20px; text-align:center;">
                          <p style="margin:0; font-size:13px; color:#4a6fa5; line-height:1.6;">
                            &#127881; Use code &nbsp;<strong style="color:#1a3a6e; font-size:15px; letter-spacing:1px;">GENZ</strong>&nbsp; at checkout to get some discount on <strong style="color:#1a3a6e;">Courses</strong>!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
                <tr>
                  <td width="33.33%" style="padding:0 4px 0 0; vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#e8f0fe; border-radius:10px; padding:18px 8px; text-align:center; min-height:130px; vertical-align:middle;">
                          <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Expert Courses</p>
                          <p style="margin:0; font-size:12px; color:#4a6fa5; line-height:1.3;">By seniors</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="33.33%" style="padding:0 2px; vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#e8f0fe; border-radius:10px; padding:18px 8px; text-align:center; min-height:130px; vertical-align:middle;">
                          <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Live Doubts</p>
                          <p style="margin:0; font-size:12px; color:#4a6fa5; line-height:1.3;">Session</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="33.33%" style="padding:0 0 0 4px; vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:#e8f0fe; border-radius:10px; padding:18px 8px; text-align:center; min-height:130px; vertical-align:middle;">
                          <p style="margin:0 0 4px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Crack IITM BS</p>
                          <p style="margin:0; font-size:12px; color:#4a6fa5; line-height:1.3;">With confidence</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 14px; font-size:16px; color:#444444; line-height:1.75;">
                Our platform is packed with structured courses, doubt-clearing sessions, and resources
                designed to help you in your <strong style="color:#1a3a6e;">Degree journey</strong>,
                whether that's with expert guidance, peer support, or cracking what matters most to you.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #c5d8f8; border-radius:10px; background:#f4f8ff; margin:0 0 20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td width="40" valign="middle" style="width:40px;">
                          <div style="width:36px; height:36px; border-radius:50%; background:#1a3a6e; line-height:36px; text-align:center; font-size:16px; font-weight:700; color:#ffffff;">S</div>
                        </td>
                        <td valign="middle" style="padding-left:10px;">
                          <p style="margin:0; font-size:15px; font-weight:700; color:#1a3a6e;">Sriram &mdash; Founder, GenZ IITIAN</p>
                          <p style="margin:4px 0 0; font-size:13px; color:#4a6fa5;">Contact for direct help &amp; support</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="tel:+917970495447" style="display:inline-block; background:#ddeaff; color:#1a3a6e; font-size:13px; font-weight:600; padding:8px 16px; border-radius:18px; text-decoration:none; white-space:nowrap;">
                            +91 79704 95447
                          </a>
                        </td>
                        <td>
                          <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#ddeaff; color:#1a3a6e; font-size:13px; font-weight:600; padding:8px 16px; border-radius:18px; text-decoration:none; white-space:nowrap;">
                            admin@genziitian.org
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 10px; font-size:15px; color:#555555; line-height:1.7;">
                Keep pushing forward - your journey starts today. We're rooting for you! &#128170;
              </p>
              <p style="margin:0; font-size:15px; color:#1a3a6e; font-weight:700;">&mdash; Sriram &amp; Team GenZ IITIAN</p>
            </td>
          </tr>

          <tr>
            <td style="background:#e8f0fe; padding:14px 20px; border-top:1px solid #c5d8f8; text-align:center;">
              <p style="margin:0 0 4px; font-size:13px; color:#4a6fa5;">&copy; 2026 GenZ IITIAN. All rights reserved.</p>
              <p style="margin:0; font-size:13px; color:#4a6fa5; line-height:1.5;">
                You received this because you signed up at
                <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      GmailApp.sendEmail(email, "Welcome to the Family! - GenZ IITIAN", "", {
        htmlBody: welcomeHtml,
        name: "GenZ IITIAN"
      });
      
    } else if (type === 'nudge' && email) {
      const studentName = name || 'Student';
      
      const nudgeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Still thinking? We're here to help</title>
</head>
<body style="margin:0; padding:0; background-color:#e8f0fe; font-family:Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; color:#e8f0fe; opacity:0; mso-hide:all;">
    Hundreds of students already levelled up. Your seat is still open.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e8f0fe; padding:24px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="580" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:580px; margin:0 auto; background:#ffffff; border:1px solid #c5d8f8; border-radius:14px; overflow:hidden;">
          <tr>
            <td style="background:#1a3a6e; padding:28px 20px 22px; text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px;">
                <tr>
                  <td style="background:#e8f0fe; border-radius:6px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                    <img src="https://img.icons8.com/ios-filled/20/1a3a6e/graduation-cap.png" width="20" height="20" alt="cap" style="display:block; margin:0 auto;" />
                  </td>
                  <td style="padding-left:10px; color:#ffffff; font-family:Georgia,serif; font-size:20px; font-weight:700; white-space:nowrap;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>
              <div style="width:48px; height:3px; background:#90c4ff; border-radius:2px; margin:0 auto 14px;"></div>
              <p style="margin:0; color:#ffffff; font-family:Georgia,serif; font-size:22px; font-weight:700; line-height:1.3;">
                You left something Behind &#128072;
              </p>
              <p style="margin:8px 0 0; color:#a8c4e8; font-size:14px; line-height:1.5;">
                No pressure. Just wanted you to see what you're stepping into.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px 28px; background:#ffffff;">
              <p style="margin:0 0 16px; font-size:17px; color:#1a3a6e; line-height:1.6;">
                Hey <strong>${studentName}</strong> &#128075;
              </p>
              <p style="margin:0 0 14px; font-size:16px; color:#444444; line-height:1.8;">
                We noticed you haven't enrolled yet — and that's completely fine. Big moves deserve a second thought. &#128522;
              </p>
              <p style="margin:0 0 22px; font-size:16px; color:#444444; line-height:1.8;">
                But here's the thing — <strong style="color:#1a3a6e;">the students who joined us</strong> are already ahead. They're getting their doubts cleared, finishing structured courses, and actually making progress on their degree — guided by people who've done it before them.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px; table-layout:fixed;">
                <tr>
                  <td width="33%" valign="top" style="padding:0 3px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background:#e8f0fe; border-radius:10px; padding:14px 6px; height:70px; vertical-align:middle;">
                          <p style="margin:0 0 4px; font-size:20px; font-weight:800; color:#1a3a6e;">500+</p>
                          <p style="margin:0; font-size:12px; color:#4a6fa5; line-height:1.5; font-weight:600;">Students enrolled</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="33%" valign="top" style="padding:0 2px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background:#e8f0fe; border-radius:10px; padding:14px 6px; height:70px; vertical-align:middle;">
                          <p style="margin:0 0 4px; font-size:20px; font-weight:800; color:#1a3a6e;">⭐ 4.8</p>
                          <p style="margin:0; font-size:12px; color:#4a6fa5; line-height:1.5; font-weight:600;">Course rating</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="33%" valign="top" style="padding:0 0 0 3px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background:#e8f0fe; border-radius:10px; padding:14px 6px; height:70px; vertical-align:middle;">
                          <p style="margin:0; font-size:16px; font-weight:800; color:#1a3a6e; line-height:1.4;">Guided By Seniors</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 22px; font-size:16px; color:#444444; line-height:1.8;">
                If you're stuck or confused about which course fits you — <strong style="color:#1a3a6e;">just reply to this email</strong>. We'll sort it out personally.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
                <tr>
                  <td style="background:#f4f8ff; border:1.5px dashed #1a3a6e; border-radius:10px; padding:14px 16px; text-align:center;">
                    <p style="margin:0 0 4px; font-size:13px; color:#4a6fa5;">A little something to get you started &#127881;</p>
                    <p style="margin:0 0 6px; font-size:24px; font-weight:800; color:#1a3a6e; letter-spacing:3px;">WELCOME</p>
                    <p style="margin:0; font-size:13px; color:#555555;">Use this code at checkout to get <strong style="color:#1a3a6e;">some discount</strong> on your course.</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center">
                    <a href="https://app.genziitian.in/courses" style="display:inline-block; background:#1a3a6e; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 40px; border-radius:8px; white-space:nowrap;">
                      Enroll Now →
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
                <tr>
                  <td style="border-top:1px dashed #c5d8f8; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #c5d8f8; border-radius:10px; background:#f4f8ff; margin:0 0 22px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="40" valign="middle" style="width:40px;">
                          <div style="width:36px; height:36px; border-radius:50%; background:#1a3a6e; line-height:36px; text-align:center; font-size:16px; font-weight:700; color:#ffffff;">S</div>
                        </td>
                        <td valign="middle" style="padding-left:10px;">
                          <p style="margin:0; font-size:14px; font-weight:700; color:#1a3a6e;">Sriram &mdash; Founder, GenZ IITIAN</p>
                          <p style="margin:3px 0 0; font-size:12px; color:#4a6fa5;">Reply here or WhatsApp directly</p>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://wa.me/917970495447" style="display:inline-block; background:#ddeaff; color:#1a3a6e; font-size:13px; font-weight:600; padding:8px 14px; border-radius:18px; text-decoration:none; white-space:nowrap;">
                            WhatsApp Us
                          </a>
                        </td>
                        <td>
                          <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#ddeaff; color:#1a3a6e; font-size:13px; font-weight:600; padding:8px 14px; border-radius:18px; text-decoration:none; white-space:nowrap;">
                            admin@genziitian.org
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px; font-size:15px; color:#555555; line-height:1.7;">
                Your seat is open. Whenever you're ready. &#128170;
              </p>
              <p style="margin:0; font-size:15px; color:#1a3a6e; font-weight:700;">
                Team GenZ IITIAN
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#e8f0fe; padding:14px 20px; border-top:1px solid #c5d8f8; text-align:center;">
              <p style="margin:0 0 4px; font-size:13px; color:#4a6fa5;">&copy; 2026 GenZ IITIAN. All rights reserved.</p>
              <p style="margin:0; font-size:13px; color:#4a6fa5; line-height:1.5;">
                You received this because you signed up at
                <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color:#1a3a6e;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      GmailApp.sendEmail(email, "You left something behind - GenZ IITIAN", "", {
        htmlBody: nudgeHtml,
        name: "GenZ IITIAN"
      });

    } else if (type === 'abandoned' && email) {
      const studentName = name || 'Student';
      const courseName = data.courseName || 'your course';

      const abandonedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Did something go wrong?</title>
</head>
<body style="margin:0; padding:0; background-color:#eef3fd; font-family:Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    Your enrollment spot is still open. Let's get you back on track.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef3fd; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="580" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:580px; margin:0 auto; background:#ffffff; border:1px solid #d0ddf5; border-radius:16px; overflow:hidden;">
          <tr>
            <td style="background:#1a3a6e; padding:28px 32px 24px; text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12); border-radius:6px; width:30px; height:30px; text-align:center; vertical-align:middle;">
                    <span style="display:block; font-size:16px;">🎓</span>
                  </td>
                  <td style="padding-left:8px; color:#ffffff; font-family:Georgia,serif; font-size:17px; font-weight:700;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 4px; color:#ffffff; font-family:Georgia,serif; font-size:22px; font-weight:700; line-height:1.3;">
                Did something go wrong? &#129300;
              </p>
              <p style="margin:0; color:#93b8e8; font-size:14px; line-height:1.5;">
                Your spot is still open — let's fix it.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; background:#ffffff;">
              <p style="margin:0 0 12px; font-size:17px; color:#1a3a6e; font-weight:700; line-height:1.6;">
                Hey <strong>${studentName}</strong> 👋
              </p>
              <p style="margin:0 0 24px; font-size:16px; color:#555555; line-height:1.8;">
                You were halfway through enrolling in <strong style="color:#1a3a6e;">${courseName}</strong> but didn't finish. No worries — your spot is saved. Here's what might've gone wrong:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:0 0 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:13px 15px;">
                      <tr>
                        <td width="30" valign="top" style="font-size:18px; padding-right:12px;">&#128179;</td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Payment failed?</p>
                          <p style="margin:0; font-size:13px; color:#666666; line-height:1.55;">Try UPI, a different card! Still stuck? Just reply — we'll sort it manually.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:13px 15px;">
                      <tr>
                        <td width="30" valign="top" style="font-size:18px; padding-right:12px;">&#127760;</td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Site glitched?</p>
                          <p style="margin:0; font-size:13px; color:#666666; line-height:1.55;">Try a quick refresh or switch browsers. If it's still broken, tell us.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:13px 15px;">
                      <tr>
                        <td width="30" valign="top" style="font-size:18px; padding-right:12px;">&#10067;</td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#1a3a6e; line-height:1.3;">Not sure which course?</p>
                          <p style="margin:0; font-size:13px; color:#666666; line-height:1.55;">Hit reply and we'll guide you personally to the right one.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px; background:#1a3a6e; border-radius:12px; padding:20px; text-align:center;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px; font-size:12px; color:rgba(200,220,255,0.7); line-height:1.4;">Your spot is still available</p>
                    <p style="margin:0 0 14px; font-size:15px; font-weight:700; color:#ffffff; line-height:1.4;">&#128205; ${courseName}</p>
                    <a href="https://app.genziitian.in/courses" style="display:inline-block; background:#ffffff; color:#1a3a6e; font-size:14px; font-weight:700; text-decoration:none; padding:11px 28px; border-radius:8px; white-space:nowrap;">
                      Complete Enrollment →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin:0 0 20px; border-top:1px dashed #cdd9f0;"></div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d0ddf5; border-radius:10px; background:#f5f8ff; margin:0 0 20px; padding:14px;">
                <tr>
                  <td width="40" valign="top" style="width:40px; padding-right:12px;">
                    <div style="width:36px; height:36px; background:#1a3a6e; border-radius:50%; text-align:center; line-height:36px; color:#ffffff; font-weight:700; font-size:15px;">S</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#1a3a6e;">Sriram — Founder, GenZ IITIAN</p>
                    <p style="margin:0 0 8px; font-size:12px; color:#6a89bf;">Reply here or reach out directly</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://wa.me/917970495447" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:12px; font-weight:600; padding:6px 12px; border-radius:20px; text-decoration:none; white-space:nowrap;">WhatsApp</a>
                        </td>
                        <td>
                          <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:12px; font-weight:600; padding:6px 12px; border-radius:20px; text-decoration:none; white-space:nowrap;">admin@genziitian.org</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px; font-size:14px; color:#555555; line-height:1.7;">We're here if you need us. &#128170;</p>
              <p style="margin:0; font-size:14px; color:#1a3a6e; font-weight:700;">Team GenZ IITIAN</p>
            </td>
          </tr>
          <tr>
            <td style="background:#eef3fd; border-top:1px solid #d0ddf5; padding:14px 20px; text-align:center;">
              <p style="margin:0 0 4px; font-size:12px; color:#7a9ac5;">&copy; 2026 GenZ IITIAN · <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a> · <a href="#" style="color:#1a3a6e;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      GmailApp.sendEmail(email, "Did something go wrong? Your spot is still open", "", {
        htmlBody: abandonedHtml,
        name: "GenZ IITIAN"
      });

    } else if (type === 'missyou' && email) {
      const studentName = name || 'Student';
      const missYouHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>We miss you</title>
</head>
<body style="margin:0; padding:0; background-color:#eef3fd; font-family:Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; color:#eef3fd; opacity:0; mso-hide:all;">
    We miss you! Come back and level up your CGPA with GenZ IITIAN.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef3fd; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" align="center" width="580" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:580px; margin:0 auto; background:#ffffff; border:1px solid #d0ddf5; border-radius:16px; overflow:hidden;">
          <tr>
            <td style="background:#1a3a6e; padding:24px 32px 22px; text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12); border-radius:6px; width:30px; height:30px; text-align:center; vertical-align:middle;">
                    <span style="display:block; font-size:16px;">&#127891;</span>
                  </td>
                  <td style="padding-left:8px; color:#ffffff; font-family:Georgia,serif; font-size:16px; font-weight:700;">
                    GenZ<span style="color:#90c4ff;">IITIAN</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; background:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px; background:#f5f8ff; border:1px solid #dde9ff; border-radius:14px; padding:22px 20px; text-align:center;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px; font-size:48px; line-height:1;">&#128557;</p>
                    <p style="margin:0 0 6px; font-size:24px; font-weight:700; color:#1a3a6e;">We miss you</p>
                    <p style="margin:0; font-size:14px; color:#666666; line-height:1.6;">It's been 7 days. <strong style="color:#1a3a6e;">7.</strong> We're not okay.</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px; font-size:17px; color:#1a3a6e; font-weight:700; line-height:1.6;">
                Hey <strong>${studentName}</strong> — where did you disappear to? We were waiting for you! &#128522;
              </p>
              <p style="margin:0 0 22px; font-size:16px; color:#444444; line-height:1.8;">
                Real talk — did you forget about that <strong style="color:#1a3a6e;">good CGPA</strong> you promised yourself? &#128064;<br/><br/>
                We haven't. Give us one chance — we'll make sure you actually get there.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:0 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:11px 14px;">
                      <tr>
                        <td width="20" valign="top" style="font-size:16px; padding-right:11px;">&#129309;</td>
                        <td>
                          <p style="margin:0; font-size:13px; color:#333333; line-height:1.6;"><strong style="color:#1a3a6e;">We hold your hand</strong> — literally step by step, no one gets left behind</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:11px 14px;">
                      <tr>
                        <td width="20" valign="top" style="font-size:16px; padding-right:11px;">&#128218;</td>
                        <td>
                          <p style="margin:0; font-size:13px; color:#333333; line-height:1.6;"><strong style="color:#1a3a6e;">Structured courses</strong> — clear lectures, proper flow, nothing random</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff; border:1px solid #dde9ff; border-radius:10px; padding:11px 14px;">
                      <tr>
                        <td width="20" valign="top" style="font-size:16px; padding-right:11px;">&#128683;</td>
                        <td>
                          <p style="margin:0; font-size:13px; color:#333333; line-height:1.6;"><strong style="color:#1a3a6e;">Zero fluff</strong> — no pointless theory, only what actually matters for your exam</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px; background:#1a3a6e; border-radius:12px; padding:20px; text-align:center;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px; font-size:12px; color:rgba(200,220,255,0.6); line-height:1.4;">Your spot is still open</p>
                    <p style="margin:0 0 16px; font-size:17px; font-weight:700; color:#ffffff; line-height:1.4;">C'mon, let's do this already &#128640;</p>
                    <a href="https://app.genziitian.in/courses" style="display:inline-block; background:#ffffff; color:#1a3a6e; font-size:14px; font-weight:700; text-decoration:none; padding:12px 32px; border-radius:8px; white-space:nowrap;">
                      join Now →
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px; border-top:1px dashed #cdd9f0;">
                <tr><td style="font-size:0; line-height:0; height:0;">&nbsp;</td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d0ddf5; border-radius:10px; background:#f5f8ff; margin:0 0 18px; padding:13px 15px;">
                <tr>
                  <td width="40" valign="top" style="width:40px; padding-right:12px;">
                    <div style="width:34px; height:34px; background:#1a3a6e; border-radius:50%; text-align:center; line-height:34px; color:#ffffff; font-weight:700; font-size:14px;">S</div>
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0 0 2px; font-size:13px; font-weight:700; color:#1a3a6e;">Sriram — Founder, GenZ IITIAN</p>
                    <p style="margin:0 0 7px; font-size:12px; color:#6a89bf;">Any doubts? Just ping, I reply fast</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://wa.me/917970495447" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:12px; font-weight:600; padding:6px 12px; border-radius:20px; text-decoration:none; white-space:nowrap;">WhatsApp</a>
                        </td>
                        <td>
                          <a href="mailto:admin@genziitian.org" style="display:inline-block; background:#dde9ff; color:#1a3a6e; font-size:12px; font-weight:600; padding:6px 12px; border-radius:20px; text-decoration:none; white-space:nowrap;">admin@genziitian.org</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 4px; font-size:14px; color:#666666;">We got you &#128170;</p>
              <p style="margin:0; font-size:14px; font-weight:700; color:#1a3a6e;">Team GenZ IITIAN</p>
            </td>
          </tr>
          <tr>
            <td style="background:#eef3fd; border-top:1px solid #d0ddf5; padding:13px 20px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#7a9ac5;">
                © 2026 GenZ IITIAN · <a href="https://app.genziitian.in/" style="color:#1a3a6e;">app.genziitian.in</a> · <a href="#" style="color:#1a3a6e;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      GmailApp.sendEmail(email, "We miss you - GenZ IITIAN", "", {
        htmlBody: missYouHtml,
        name: "GenZ IITIAN"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
