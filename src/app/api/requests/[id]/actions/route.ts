import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";
import type { EventItem, Stage } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }

  const id = Number(params.id);
  const request = mockDb.requests.find((r) => r.id === id);
  if (!request) {
    return NextResponse.json({ detail: "الطلب غير موجود" }, { status: 404 });
  }

  try {
    const { action, note, course_id } = await req.json();
    if (course_id) {
      request.course_id = Number(course_id);
    }

    const fromStage = request.current_stage;
    let toStage: Stage = request.current_stage;

    if (action === "forward") {
      if (user.role === "class_representative") {
        toStage = request.category === "academic" ? "instructor" : "department_coordinator";
      } else if (user.role === "department_coordinator") {
        toStage = "department_head";
      } else if (user.role === "instructor") {
        toStage = "department_head";
      }
      request.current_stage = toStage;
      request.status = "in_review";
    } else if (action === "approve") {
      request.status = "approved";
    } else if (action === "reject") {
      request.status = "rejected";
    } else if (action === "resolve") {
      request.status = "resolved";
    }

    const events = mockDb.requestEvents.get(id) || [];
    const newEvent: EventItem = {
      action,
      from_stage: fromStage,
      to_stage: toStage,
      actor_user_id: user.id,
      note: note || null,
      created_at: new Date().toISOString(),
    };
    events.push(newEvent);
    mockDb.requestEvents.set(id, events);

    return NextResponse.json(request);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
