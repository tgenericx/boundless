export function emailVerificationTemplate(
  name: string,
  verificationUrl: string,
  expiryHours: number,
  companyName: string,
  supportEmail: string,
  logoUrl: string,
): string {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Verify your email</title>
  </head>
  <body style="margin:0;padding:0;font-family:Helvetica,Arial,sans-serif;background:#f4f6f8;">
    <table role="presentation" width="100%" style="padding:24px 0;background:#f4f6f8;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
            
            <!-- Header -->
            <tr>
              <td style="padding:24px;text-align:center;">
                <img src="${logoUrl}" alt="${companyName} logo" style="width:110px;height:auto;margin:0 auto;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px;">
                <h1 style="font-size:20px;margin:0 0 12px;color:#0f172a;">Verify your email address</h1>
                <p style="font-size:15px;color:#4b5563;line-height:1.45;margin:0 0 18px;">
                  Hi ${name || 'there'},<br><br>
                  Thanks for creating an account with ${companyName}. Tap the button below to verify your email address and finish setting up your account.
                </p>

                <p style="text-align:center;margin:22px 0;">
                  <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background-color:#2563eb;color:#ffffff;font-weight:600;text-decoration:none;">Verify my email</a>
                </p>

                <p style="font-size:13px;color:#6b7280;margin-top:18px;line-height:1.4;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color:#2563eb;word-break:break-all;">${verificationUrl}</a>
                </p>

                <p style="font-size:13px;color:#6b7280;margin-top:18px;line-height:1.4;">
                  This link will expire in ${expiryHours} hours. If you didn't create an account, ignore this email or contact <a href="mailto:${supportEmail}" style="color:#2563eb;">${supportEmail}</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="font-size:12px;color:#9ca3af;text-align:center;padding:20px;">
                © ${new Date().getFullYear()} ${companyName} — All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
