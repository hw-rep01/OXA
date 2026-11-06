import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  const quizId = Number(params.quizId);
  const quiz = mockDb.quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    return NextResponse.json({ detail: "الكويز غير موجود" }, { status: 404 });
  }

  try {
    const { answers } = (await req.json()) as { answers: Record<number, number> };

    let correctCount = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] !== undefined && answers[q.id] === q.correct_option_index) {
        correctCount += 1;
      }
    }

    const score = quiz.questions.length > 0 ? (correctCount / quiz.questions.length) * 100 : 100;
    return NextResponse.json({
      attempt_id: Date.now(),
      score: Math.round(score),
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
