import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  const id = Number(params.id);
  const suggestion = mockDb.makeupSuggestions.find((s) => s.id === id);
  if (!suggestion) {
    return NextResponse.json({ detail: "المقترح غير موجود" }, { status: 404 });
  }

  suggestion.is_accepted = true;

  // Add new makeup occurrence
  const newOccId = mockDb.occurrences.length + 1;
  const course = mockDb.courses[0];
  const newOcc = {
    id: newOccId,
    enrollment_id: suggestion.enrollment_id,
    section_id: 1,
    course_id: course.id,
    course_code: course.code,
    course_name: `${course.name_ar} (تعويضية)`,
    occurrence_date: suggestion.suggested_date,
    starts_at: suggestion.starts_at,
    ends_at: suggestion.ends_at,
    room_id: suggestion.room_id,
    room_code: suggestion.room_code,
    slot_type: "makeup" as const,
    is_cancelled: false,
    note: "محاضرة تعويضية معتمدة",
    version: 1,
  };
  mockDb.occurrences.push(newOcc);
  mockDb.recordScheduleChange(newOccId, "makeup_added", null, "إضافة محاضرة تعويضية", user?.id);

  return NextResponse.json({ success: true, occurrence: newOcc });
}
