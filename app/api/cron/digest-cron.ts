import { NextResponse } from "next/server";
import { sendDailyDigestForAllBusinesses } from "@/src/server/services/email.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await sendDailyDigestForAllBusinesses();
  return NextResponse.json({ success: true });
}