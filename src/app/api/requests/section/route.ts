import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getUnitsForRole } from "@/lib/server/unitHelper";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }

  const units = getUnitsForRole(user.role);
  return NextResponse.json(units);
}
