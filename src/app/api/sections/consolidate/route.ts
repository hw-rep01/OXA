import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST() {
  const pendingRequests = mockDb.requests.filter((r) => !r.batch_id && r.category);
  if (pendingRequests.length === 0) {
    return NextResponse.json({ batches_created: 0 });
  }

  const batchId = mockDb.batches.length + 1;
  const first = pendingRequests[0];
  const newBatch = {
    id: batchId,
    section_id: 1,
    category: first.category || "academic",
    course_id: first.course_id,
    title: `بطاقة موحدة: ${first.subject}`,
    summary: `تجميع ذكي لعدد من الطلبات المتشابهة المقدمة من طلبة الشعبة: "${first.body}"`,
    request_ids: pendingRequests.map((r) => r.id),
    status: "pending",
    current_stage: "class_representative" as const,
    created_at: new Date().toISOString(),
  };

  for (const r of pendingRequests) {
    r.batch_id = batchId;
  }
  mockDb.batches.push(newBatch);

  return NextResponse.json({ batches_created: 1 });
}
