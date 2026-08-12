import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Real (not fabricated) concurrent-listener tracking, shared across both
// "Prem Bhai Ke Gaane" and "Himesh Ka Suroor" - they read/write the same
// Redis sorted set, so the number is one honest combined total.
//
// Each open tab heartbeats its own random session id with the current
// timestamp as the score. Anything older than WINDOW_SECONDS is treated as
// gone (tab closed / phone locked / connection dropped) and pruned on every
// call, so the count only ever reflects sessions actually seen recently.

export const dynamic = "force-dynamic";

const redis = Redis.fromEnv();
const KEY = "presence:global";
const WINDOW_SECONDS = 45;

async function countActive(sessionId?: string) {
  const now = Date.now();
  if (sessionId) {
    await redis.zadd(KEY, { score: now, member: sessionId });
  }
  await redis.zremrangebyscore(KEY, 0, now - WINDOW_SECONDS * 1000);
  return redis.zcard(KEY);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  if (!sessionId || sessionId.length > 100) {
    return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
  }
  const count = await countActive(sessionId);
  return NextResponse.json({ count });
}

export async function GET() {
  const count = await countActive();
  return NextResponse.json({ count });
}
