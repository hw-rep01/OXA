import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function GET(_req: Request, { params }: { params: { quizId: string } }) {
  const quizId = Number(params.quizId);
  const quiz = mockDb.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    return NextResponse.json({ detail: "الكويز غير موجود" }, { status: 404 });
  }

  return NextResponse.json(quiz);
}
