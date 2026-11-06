import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const batch = mockDb.batches.find((b) => b.id === id);
  if (!batch) {
    return NextResponse.json({ detail: "البطاقة غير موجودة" }, { status: 404 });
  }

  batch.summary = `ملخص موحد محدث لـ ${batch.request_ids.length} طلبات متشابهة في شعبة هندسة البرمجيات.`;
  return NextResponse.json(batch);
}
