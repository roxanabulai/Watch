import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(request: NextRequest, limit = 60, windowMs = 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}

export function validateCsrf(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD" || request.nextUrl.pathname.includes("/webhooks/")) {
    return null;
  }
  const cookie = request.cookies.get("csrf-token")?.value;
  const header = request.headers.get("x-csrf-token");
  if (!cookie || !header || cookie !== header) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }
  return null;
}

export async function parseJson<T extends z.ZodTypeAny>(request: NextRequest, schema: T): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}
