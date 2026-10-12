import { handlers } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(req: Request) {
  const nextReq = req instanceof NextRequest ? req : new NextRequest(req);
  return handlers.GET(nextReq);
}

export async function POST(req: Request) {
  const nextReq = req instanceof NextRequest ? req : new NextRequest(req);
  return handlers.POST(nextReq);
}

