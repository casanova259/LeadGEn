import { NextResponse } from "next/server";
import { sendDailyDigestForAllBusinesses } from "@/src/server/services/email.service";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  // Secure endpoint with CRON_SECRET bearer token
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";

  const report = await sendDailyDigestForAllBusinesses({ force });

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    report,
  });
}