import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import type { AnswerResult } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);
  const course = mockDb.courses.find((c) => c.id === courseId);

  try {
    const { question } = await req.json();

    const answer = `بناءً على المادة العلمية المعتمدة لمادة ${course?.name_ar || "المنهج"}:

بالنسبة لسؤالك حول "${question}":
تُعرّف هندسة المتطلبات العملية النظامية لتحديد أهداف أصحاب المصلحة وتوثيقها والتحقق منها. تنقسم المتطلبات عموماً إلى متطلبات وظيفية (Functional) تحدد وظائف وخدمات النظام، ومتطلبات غير وظيفية (Non-Functional) تركز على الأداء، الأمان، وتوافر النظام وسهولة الاستخدام.

يُوصى بمراجعة الفصل الأول والثاني للتوسع في حالات الاستخدام وقوالب صياغة المتطلبات المعتمدة.`;

    const result: AnswerResult = {
      answer,
      grounded: true,
      question_id: Date.now(),
      sources: [
        {
          chunk_id: 101,
          material_title: "مقدمة في هندسة المتطلبات - الوحدة الأولى.pdf",
          page_number: 14,
          similarity: 0.92,
          excerpt: "تحديد المتطلبات الوظيفية وغير الوظيفية بدقة يمثل حجر الأساس لنجاح دورة حياة تطوير البرمجيات.",
        },
        {
          chunk_id: 102,
          material_title: "تقنيات استنباط المتطلبات (Elicitation Techniques).pdf",
          page_number: 22,
          similarity: 0.88,
          excerpt: "تستخدم المقابلات الشخصية وجلسات ورش العمل لتحديد أولويات المتطلبات بدقة بالتعاون مع المستخدمين.",
        },
      ],
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ أثناء معالجة السؤال" }, { status: 500 });
  }
}
