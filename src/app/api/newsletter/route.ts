import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";

const newsletterSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = newsletterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Valid email required / Email válido requerido" },
        { status: 400 }
      );
    }
    const { email } = result.data;

    // Persist subscriber to database (unique constraint prevents duplicates)
    try {
      await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();
    } catch (dbErr) {
      console.error("[NEWSLETTER] DB insert error:", dbErr);
      // Continue — still try to send welcome email even if DB fails
    }

    // Optionally send welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.FROM_EMAIL || process.env.EMAIL_FROM || "Audlex <info@audlex.com>",
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
