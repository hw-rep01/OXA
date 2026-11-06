import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";
import type { Broadcast } from "@/lib/types";

export async function GET() {
  // Sort pinned first, then by date descending
  const sorted = [...mockDb.broadcasts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return NextResponse.json(sorted);
}

export async function POST(req: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }

  try {
    const { scope, course_id, title, body, is_pinned } = await req.json();
    const course = course_id ? mockDb.courses.find((c) => c.id === Number(course_id)) : null;
    const channelName = scope === "course" && course ? `مادة ${course.name_ar}` : "قسم هندسة البرمجيات";

    const newBroadcast: Broadcast = {
      id: mockDb.broadcasts.length + 1,
      channel_id: scope === "course" ? Number(course_id) : 1,
      channel_name: channelName,
      scope,
      title,
      body,
      is_pinned: Boolean(is_pinned),
      audience_count: 50,
      seen_count: 1,
      created_at: new Date().toISOString(),
    };

    if (is_pinned) {
      mockDb.broadcasts.unshift(newBroadcast);
    } else {
      mockDb.broadcasts.push(newBroadcast);
    }

    mockDb.readersMap.set(newBroadcast.id, [
      { full_name: user.full_name, read_at: new Date().toISOString() },
    ]);

    // Also add to notifications
    mockDb.notifications.unshift({
      id: mockDb.notifications.length + 1,
      notification_type: "broadcast",
      title: `تبليغ جديد: ${title}`,
      body,
      lecture_occurrence_id: null,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json(newBroadcast, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ أثناء النشر" }, { status: 500 });
  }
}
