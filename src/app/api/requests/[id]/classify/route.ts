import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";
import type { EventItem, RequestCategory } from "@/lib/types";

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
    const { category } = (await req.json()) as { category: RequestCategory };
    request.category = category;

    const events = mockDb.requestEvents.get(id) || [];
    const newEvent: EventItem = {
      action: "classified",
      from_stage: request.current_stage,
      to_stage: request.current_stage,
      actor_user_id: user.id,
      note: `تم تصنيف الطلب كطلب ${category === "academic" ? "أكاديمي" : "إداري"}`,
      created_at: new Date().toISOString(),
    };
    events.push(newEvent);
    mockDb.requestEvents.set(id, events);

    return NextResponse.json(request);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ أثناء التصنيف" }, { status: 500 });
  }
}
