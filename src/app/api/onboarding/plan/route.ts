import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ plan: "free" });
    }

    const [dbUser] = await db
      .select({ organizationId: users.organizationId })
      .from(users)
      .where(eq(users.authProviderId, user.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ plan: "free" });
    }

    const [org] = await db
      .select({ plan: organizations.plan })
      .from(organizations)
      .where(eq(organizations.id, dbUser.organizationId))
      .limit(1);

    return NextResponse.json({ plan: org?.plan || "free" });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}
