import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import type { AnswerResult } from "@/lib/types";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);
  const course = mockDb.courses.find((c) => c.id === courseId);

  try {
    const { topic } = await req.json();

    const answer = `ملخص موضوع "${topic}" لمادة ${course?.name_ar || "المنهج"}:

1. المفهوم الأساسي:
يتناول هذا الموضوع دراسة شاملة لكيفية نمذجة وتوثيق المتطلبات البرمجية لضمان توافق المنتج النهائي مع توقعات أصحاب المصلحة.

2. النقاط الجوهرية:
• تحديد أصحاب المصلحة (Stakeholders) واحتياجاتهم بدقة.
• استخدام نماذج حالات الاستخدام (Use Cases) والقصص البرمجية (User Stories).
• التحقق المستمر ومراجعة وثيقة مواصفات متطلبات البرمجيات (SRS).

3. خلاصة تطبيقية:
الوضوح والقابلية للقياس هما معيارا نجاح أي متطلب في هذا المحور.`;

    const result: AnswerResult = {
      answer,
      grounded: true,
      question_id: Date.now(),
      sources: [
        {
          chunk_id: 201,
          material_title: "مقدمة في هندسة المتطلبات - الوحدة الأولى.pdf",
          page_number: 18,
          similarity: 0.95,
          excerpt: "الملخص الشامل للوحدة يستعرض الأدوات الأساسية والتقنيات المعيارية لتحليل المتطلبات.",
        },
      ],
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ أثناء إعداد الملخص" }, { status: 500 });
  }
}
