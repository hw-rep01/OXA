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
    const { room_id } = await req.json();
    const oldRoom = occ.room_code;
    const room = mockDb.rooms.find((r) => r.id === Number(room_id));
    if (room) {
      occ.room_id = room.id;
      occ.room_code = room.code;
      occ.version += 1;

      mockDb.recordScheduleChange(id, "room_change", oldRoom, room.code, user?.id);

      // Add to notifications
      mockDb.notifications.unshift({
        id: mockDb.notifications.length + 1,
        notification_type: "schedule",
        title: `تغيير قاعة: ${occ.course_name}`,
        body: `تم تغيير قاعة المحاضرة إلى ${room.name || room.code}.`,
        lecture_occurrence_id: occ.id,
        sent_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(occ);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
