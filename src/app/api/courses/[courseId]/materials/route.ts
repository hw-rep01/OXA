import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import type { Material } from "@/lib/types";

export async function GET() {
  return NextResponse.json(mockDb.materials);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string) || "ملزمة جديدة";

    const newMaterial: Material = {
      id: mockDb.materials.length + 1,
      title,
      status: "ready",
      page_count: 15,
      error_message: null,
      created_at: new Date().toISOString(),
    };

    mockDb.materials.push(newMaterial);
    return NextResponse.json({ duplicate: false });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ أثناء الرفع" }, { status: 500 });
  }
}
