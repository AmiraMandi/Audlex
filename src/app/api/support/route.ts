import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required / Asunto y mensaje son obligatorios" },
        { status: 400 }
      );
    }

    // Input length limits to prevent oversized payloads
    if (typeof subject !== "string" || subject.length > 200) {
      return NextResponse.json({ error: "Subject too long (max 200 chars)" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
      return NextResponse.json({ error: "Message too long (max 5000 chars)" }, { status: 400 });
    }

    // Log ticket receipt without PII (full content sent via email)
    console.log(`[SUPPORT] Ticket received from user ${user.id}`);

    // Optionally send email if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.FROM_EMAIL || process.env.EMAIL_FROM || "Audlex <info@audlex.com>",
          to: "info@audlex.com",
          subject: `[Soporte] ${subject}`,
          text: `De: ${user.email}\n\n${message}`,
        });
      } catch (emailErr) {
        console.error("[SUPPORT] Email send failed:", emailErr);
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
