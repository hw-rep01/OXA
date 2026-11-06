import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ detail: "غير مصرح" }, { status: 401 });
  }

  const id = Number(params.id);
  const batch = mockDb.batches.find((b) => b.id === id);
  if (!batch) {
    return NextResponse.json({ detail: "البطاقة الموحدة غير موجودة" }, { status: 404 });
  }

  try {
    const { action } = await req.json();
    if (action === "forward") {
      batch.current_stage = user.role === "class_representative" ? "department_coordinator" : "department_head";
      batch.status = "in_review";
    } else if (action === "approve") {
      batch.status = "approved";
    } else if (action === "reject") {
      batch.status = "rejected";
    } else if (action === "resolve") {
      batch.status = "resolved";
    }

    return NextResponse.json(batch);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
