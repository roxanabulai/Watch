import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { placeBid } from "@/lib/bidding";
import { parseJson, rateLimit, validateCsrf } from "@/lib/security";
import { bidSchema } from "@/lib/validations";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, 30);
  if (limited) return limited;
  const csrf = validateCsrf(request);
  if (csrf) return csrf;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    const { id } = await params;
    const input = await parseJson(request, bidSchema);
    const result = await placeBid(id, user.id, input.amount, input.maxAmount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bid failed" }, { status: 400 });
  }
}
