import { Resend } from "resend";

let resend: Resend | null = null;

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set; cannot send login codes.");
    }
    // Local development without an email provider: print the code instead.
    console.log(`\n[dev] BBHub login code for ${to}: ${otp}\n`);
    return;
  }

  resend ??= new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "BBHub <verify@bbhub.app>",
    to,
    subject: `${otp} is your BBHub login code`,
    text: `Your BBHub login code is ${otp}. It expires in 5 minutes. Never share it with anyone.`,
    html: `
      <div style="background:#000;color:#fff;padding:24px;font-family:sans-serif;border-radius:12px">
        <h2 style="margin:0 0 8px">Your BBHub login code</h2>
        <p style="color:#9a9aa3;margin:0 0 16px">Expires in 5 minutes. Never share this code.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#e8262b">${otp}</div>
      </div>`,
  });
  if (error) {
    throw new Error(`Could not send login email: ${error.message}`);
  }
}
