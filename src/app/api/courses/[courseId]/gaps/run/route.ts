import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(_req: Request, { params }: { params: { courseId: string } }) {
  const courseId = Number(params.courseId);

  // Generate or refresh gaps for this course
  if (mockDb.gaps.length === 0) {
    mockDb.gaps.push({
      id: 1,
      course_id: courseId,
      section_id: 1,
      topic_label: "صياغة حالات الاستخدام (Use Cases)",
      distinct_student_count: 14,
      section_student_total: 35,
      affected_ratio: 0.4,
      summary: "لوحظ من نتائج الكويز وأسئلة الطلبة وجود التباس بين المتطلبات الوظيفية وحالات الاستخدام التفصيلية.",
      status: "open",
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    scopes_processed: 1,
    alerts_created: 1,
    alerts_updated: 0,
  });
}
