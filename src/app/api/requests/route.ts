import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";
import type { EventItem, RequestItem } from "@/lib/types";

export async function POST(req: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }

  try {
    const { course_id, subject, body } = await req.json();

    const id = mockDb.requests.length + 1;
    // Auto-detect category or default to academic if course selected, else administrative
    const category = course_id ? "academic" : null;

    const newRequest: RequestItem = {
      id,
      course_id: course_id ? Number(course_id) : null,
      subject,
      body,
      category,
      classification_confidence: 0.9,
      status: "pending",
      current_stage: "class_representative",
      batch_id: null,
      created_at: new Date().toISOString(),
    };

    mockDb.requests.unshift(newRequest);

    const initialEvent: EventItem = {
      action: "created",
      from_stage: null,
      to_stage: "class_representative",
      actor_user_id: user.id,
      note: "تم تقديم الطلب بنجاح",
      created_at: new Date().toISOString(),
    };
    mockDb.requestEvents.set(id, [initialEvent]);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
