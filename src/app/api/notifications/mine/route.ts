import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }
  return NextResponse.json(mockDb.notifications);
}
