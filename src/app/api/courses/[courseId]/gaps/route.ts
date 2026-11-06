import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function GET(_req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);
  const gaps = mockDb.gaps.filter((g) => g.course_id === courseId);
  return NextResponse.json(gaps);
}
