import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const gap = mockDb.gaps.find((g) => g.id === id);
  if (!gap) {
    return NextResponse.json({ detail: "التنبيه غير موجود" }, { status: 404 });
  }

  gap.status = "acknowledged";
  return NextResponse.json(gap);
}
