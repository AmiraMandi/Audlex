import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required / Email válido requerido" },
        { status: 400 }
      );
    }

    // In production, you'd store this in a database or send to an email marketing service
    console.log(`[NEWSLETTER] New subscriber: ${email}`);

    // Optionally send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.FROM_EMAIL || process.env.EMAIL_FROM || "Audlex <noreply@audlex.com>",
          to: email,
          subject: "Bienvenido a Audlex Newsletter / Welcome to Audlex Newsletter",
          text: "Gracias por suscribirte. Te mantendremos informado sobre el EU AI Act.\n\nThank you for subscribing. We'll keep you informed about the EU AI Act.",
        });
      } catch (emailErr) {
        console.error("[NEWSLETTER] Welcome email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error processing request / Error procesando solicitud" },
      { status: 500 }
    );
  }
}
