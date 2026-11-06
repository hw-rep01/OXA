import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  const quizId = Number(params.quizId);
  const quiz = mockDb.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    return NextResponse.json({ detail: "الكويز غير موجود" }, { status: 404 });
  }

  try {
    const { opens_at, closes_at } = await req.json();
    quiz.status = "published";
    quiz.opens_at = opens_at || new Date().toISOString();
    quiz.closes_at = closes_at || null;

    return NextResponse.json(quiz);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
