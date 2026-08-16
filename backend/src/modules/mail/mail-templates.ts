const baseStyles = `
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.6;
  color: #1e293b;
`;

const buttonStyles = `
  display: inline-block;
  background: #4f46e5;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
`;

function wrap(title: string, body: string): string {
  return `<div style="max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; ${baseStyles}">
  <h2 style="margin-top: 0;">${title}</h2>
  ${body}
</div>`;
}

export function verificationEmailHtml(name: string, link: string): string {
  return wrap(
    'Verify your email',
    `<p>Hi ${name},</p>
<p>Please confirm your email address to activate your Stream Nepal CMS account.</p>
<p><a href="${link}" style="${buttonStyles}">Verify Email</a></p>
<p style="color: #64748b; font-size: 13px;">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>`,
  );
}

export function verificationEmailText(name: string, link: string): string {
  return `Hi ${name},

Please confirm your email address to activate your Stream Nepal CMS account.

Verify Email: ${link}

This link expires in 24 hours. If you did not create an account, you can safely ignore this email.`;
}

export function resetPasswordEmailHtml(name: string, link: string): string {
  return wrap(
    'Reset your password',
    `<p>Hi ${name},</p>
<p>We received a request to reset your Stream Nepal CMS password.</p>
<p><a href="${link}" style="${buttonStyles}">Reset Password</a></p>
<p style="color: #64748b; font-size: 13px;">This link expires in 1 hour. If you did not request this, you can safely ignore this email and your password will remain unchanged.</p>`,
  );
}

export function resetPasswordEmailText(name: string, link: string): string {
  return `Hi ${name},

We received a request to reset your Stream Nepal CMS password.

Reset Password: ${link}

This link expires in 1 hour. If you did not request this, you can safely ignore this email and your password will remain unchanged.`;
}
