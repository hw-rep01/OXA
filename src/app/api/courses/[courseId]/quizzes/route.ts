import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import type { Quiz, QuizListItem } from "@/lib/types";

export async function GET(_req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);
  const list: QuizListItem[] = mockDb.quizzes
    .filter((q) => q.course_id === courseId)
    .map((q) => ({
      id: q.id,
      title: q.title,
      status: q.status,
      question_count: q.questions.length,
      opens_at: q.opens_at,
      closes_at: q.closes_at,
    }));

  return NextResponse.json(list);
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);
  try {
    const { title, question_count } = await req.json();
    const count = Math.min(Math.max(Number(question_count) || 5, 1), 20);

    const newQuiz: Quiz = {
      id: mockDb.quizzes.length + 1,
      course_id: courseId,
      title: title || "كويز تدريبي جديد",
      status: "draft",
      opens_at: null,
      closes_at: null,
      questions: [
        {
          id: 1,
          position: 1,
          question_type: "mcq" as const,
          question_text: "ما هي المرحلة الأولى في دورة حياة هندسة المتطلبات؟",
          options: ["استنباط وتحديد المتطلبات", "برمجة الواجهات", "اختبار الأداء", "صيانة النظام"],
          correct_option_index: 0,
          explanation: "الاستنباط (Elicitation) هو أول نشاط لجمع المتطلبات من أصحاب المصلحة.",
        },
        {
          id: 2,
          position: 2,
          question_type: "true_false" as const,
          question_text: "وثيقة مواصفات متطلبات البرمجيات (SRS) تكون موجهة فقط للمبرمجين.",
          options: ["صح", "خطأ"],
          correct_option_index: 1,
          explanation: "خطأ، وثيقة SRS تُعد عقداً مشتركاً يقرؤه العميل وفريق العمل والإدارة.",
        },
        {
          id: 3,
          position: 3,
          question_type: "mcq" as const,
          question_text: "أي من المعايير التالية يجب توافره في المتطلب الجيد؟",
          options: ["قابل للتحقق والقياس (Verifiable)", "غامض ومتعدد التأويلات", "يعتمد على تفاصيل تقنية مبكرة", "غير مترابط"],
          correct_option_index: 0,
          explanation: "المتطلب الجيد يجب أن يكون واضحاً وقابلاً للفحص والتحقق.",
        },
      ].slice(0, count),
    };

    mockDb.quizzes.push(newQuiz);
    return NextResponse.json(newQuiz, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
