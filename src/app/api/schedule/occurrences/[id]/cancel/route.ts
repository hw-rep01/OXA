import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  const id = Number(params.id);
  const occ = mockDb.occurrences.find((o) => o.id === id);
  if (!occ) {
    return NextResponse.json({ detail: "المحاضرة غير موجودة" }, { status: 404 });
  }

  try {
    let reason = "تم إلغاء المحاضرة";
    try {
      const body = await req.json();
      if (body?.reason) reason = body.reason;
    } catch {
      // empty body
    }

    occ.is_cancelled = true;
    occ.slot_type = "cancelled";
    occ.note = reason;
    occ.version += 1;

    mockDb.recordScheduleChange(id, "cancellation", null, reason, user?.id);

    // Notify
    mockDb.notifications.unshift({
      id: mockDb.notifications.length + 1,
      notification_type: "schedule",
      title: `إلغاء محاضرة: ${occ.course_name}`,
      body: `تم إلغاء محاضرة ${occ.course_name} ليوم ${occ.occurrence_date}: ${reason}`,
      lecture_occurrence_id: occ.id,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json(occ);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
