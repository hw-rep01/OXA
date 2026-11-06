import type {
  Broadcast,
  Course,
  EventItem,
  GapAlert,
  MakeupSuggestion,
  Material,
  Me,
  NotificationItem,
  Occurrence,
  Quiz,
  Reader,
  RequestCategory,
  RequestItem,
  Role,
  Room,
  ScheduleChange,
  Stage,
  UnitView,
} from "@/lib/types";

export interface MockUser extends Me {
  password: string;
}

// In-memory data store for Next.js server runtime
class MockDatabase {
  users: MockUser[] = [
    {
      id: 1,
      full_name: "رئيس القسم",
      email: "head@sdp.local",
      password: "ChangeMe123!",
      role: "department_head",
      department_id: 1,
      section_id: null,
    },
    {
      id: 2,
      full_name: "مقرر القسم",
      email: "coord@sdp.local",
      password: "ChangeMe123!",
      role: "department_coordinator",
      department_id: 1,
      section_id: null,
    },
    {
      id: 3,
      full_name: "د. أستاذ المادة",
      email: "dr@sdp.local",
      password: "ChangeMe123!",
      role: "instructor",
      department_id: 1,
      section_id: null,
    },
    {
      id: 4,
      full_name: "ممثل الشعبة",
      email: "rep@sdp.local",
      password: "ChangeMe123!",
      role: "class_representative",
      department_id: 1,
      section_id: 1,
    },
    {
      id: 5,
      full_name: "طالب تجريبي",
      email: "student@sdp.local",
      password: "ChangeMe123!",
      role: "student",
      department_id: 1,
      section_id: 1,
    },
  ];

  courses: Course[] = [
    { id: 1, code: "CS301", name_ar: "برمجة التطبيقات", department_id: 1 },
    { id: 2, code: "CS302", name_ar: "الذكاء الاصطناعي", department_id: 1 },
    { id: 3, code: "CS303", name_ar: "الشبكات", department_id: 1 },
    { id: 4, code: "CS304", name_ar: "معالجة الصور", department_id: 1 },
    { id: 5, code: "CS305", name_ar: "تطوير الويب المتقدم", department_id: 1 },
    { id: 6, code: "CS306", name_ar: "معمارية الحاسوب", department_id: 1 },
  ];

  rooms: Room[] = [
    { id: 1, code: "B-203", name: "قاعة 203", capacity: 60, is_available: true },
    { id: 2, code: "B-204", name: "قاعة 204", capacity: 45, is_available: true },
    { id: 3, code: "Lab-1", name: "مختبر البرمجيات 1", capacity: 30, is_available: true },
  ];

  notifications: NotificationItem[] = [
    {
      id: 1,
      notification_type: "broadcast",
      title: "مرحباً بكم في منصة القسم الذكية",
      body: "تم إطلاق المنصة الرقمية للقسم لمتابعة الجداول الدراسية، رفع الطلبات والتظلمات، والتواصل الأكاديمي.",
      lecture_occurrence_id: null,
      sent_at: new Date().toISOString(),
    },
    {
      id: 2,
      notification_type: "schedule",
      title: "تحديث في جدول المحاضرات",
      body: "يرجى مراجعة جدول محاضرات الأسبوع الحالي لمتابعة توزيع القاعات الجديد.",
      lecture_occurrence_id: null,
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  broadcasts: Broadcast[] = [
    {
      id: 1,
      channel_id: 1,
      channel_name: "قسم هندسة البرمجيات",
      scope: "department",
      title: "بدء الفصل الدراسي الجديد",
      body: "نرحب بجميع أعضاء الهيئة التدريسية والطلبة الأعزاء بمناسبة بدء الفصل الدراسي الجديد. نتمنى للجميع فصلاً حافلاً بالنجاح والتميز.",
      is_pinned: true,
      audience_count: 85,
      seen_count: 42,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      channel_id: 2,
      channel_name: "مادة هندسة المتطلبات",
      scope: "course",
      title: "موعد تسليم التكليف الأول",
      body: "نذكّر طلبة الشعبة (أ) بأن موعد مناقشة متطلبات المشروع البرمجي سيكون الأسبوع القادم في القاعة B-203.",
      is_pinned: false,
      audience_count: 40,
      seen_count: 31,
      created_at: new Date().toISOString(),
    },
  ];

  readersMap: Map<number, Reader[]> = new Map([
    [
      1,
      [
        { full_name: "طالب تجريبي", read_at: new Date().toISOString() },
        { full_name: "ممثل الشعبة", read_at: new Date(Date.now() - 10000).toISOString() },
      ],
    ],
  ]);

  requests: RequestItem[] = [
    {
      id: 1,
      course_id: 1,
      subject: "طلب تأجيل موعد تسليم التكليف",
      body: "نظراً لضغط الامتحانات القصيرة هذا الأسبوع نلتمس تمديد موعد التسليم لمدة يومين.",
      category: "academic",
      classification_confidence: 0.94,
      status: "in_review",
      current_stage: "class_representative",
      batch_id: null,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 2,
      course_id: null,
      subject: "طلب صيانة أجهزة العرض في قاعة 203",
      body: "جهاز العرض في القاعة به عطل يؤثر على وضوح المحاضرات الصباحية.",
      category: "administrative",
      classification_confidence: 0.98,
      status: "pending",
      current_stage: "department_coordinator",
      batch_id: null,
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  requestEvents: Map<number, EventItem[]> = new Map([
    [
      1,
      [
        {
          action: "created",
          from_stage: null,
          to_stage: "class_representative",
          actor_user_id: 5,
          note: "تم تقديم الطلب من قبل الطالب",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    ],
    [
      2,
      [
        {
          action: "created",
          from_stage: null,
          to_stage: "class_representative",
          actor_user_id: 4,
          note: "تم تسجيل البلاغ",
          created_at: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          action: "forward",
          from_stage: "class_representative",
          to_stage: "department_coordinator",
          actor_user_id: 4,
          note: "إحالة إلى مقرر القسم لمتابعة الصيانة",
          created_at: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
    ],
  ]);

  batches: {
    id: number;
    section_id: number;
    category: RequestCategory;
    course_id: number | null;
    title: string;
    summary: string;
    request_ids: number[];
    status: string;
    current_stage: Stage;
    created_at: string;
  }[] = [];

  occurrences: Occurrence[] = [];
  scheduleChanges: ScheduleChange[] = [];
  makeupSuggestions: MakeupSuggestion[] = [];

  quizzes: Quiz[] = [
    {
      id: 1,
      course_id: 1,
      title: "كويز سريع: تحليل المتطلبات الوظيفية",
      status: "published",
      opens_at: new Date().toISOString(),
      closes_at: null,
      questions: [
        {
          id: 1,
          position: 1,
          question_type: "mcq",
          question_text: "أي من التالي يُعتبر من المتطلبات غير الوظيفية (Non-functional)؟",
          options: ["تسجيل دخول المستخدم", "زمن استجابة النظام أقل من ثانيتين", "تصدير التقرير بصيغة PDF", "إرسال إشعار بالبريد"],
          correct_option_index: 1,
          explanation: "زمن الاستجابة يصف جودة وأداء النظام (Quality attribute) لذا فهو متطلب غير وظيفي.",
        },
        {
          id: 2,
          position: 2,
          question_type: "true_false",
          question_text: "حالات الاستخدام (Use Cases) تركز على التفاعل بين الفاعل (Actor) والنظام.",
          options: ["صح", "خطأ"],
          correct_option_index: 0,
          explanation: "صحيح، لأن حالة الاستخدام تمثل سيناريو متكامل لتحقيق هدف للفاعل.",
        },
      ],
    },
  ];

  materials: Material[] = [
    {
      id: 1,
      title: "مقدمة في هندسة المتطلبات - الوحدة الأولى.pdf",
      status: "ready",
      page_count: 28,
      error_message: null,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 2,
      title: "تقنيات استنباط المتطلبات (Elicitation Techniques).pdf",
      status: "ready",
      page_count: 34,
      error_message: null,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  gaps: GapAlert[] = [
    {
      id: 1,
      course_id: 1,
      section_id: 1,
      topic_label: "صياغة حالات الاستخدام (Use Cases)",
      distinct_student_count: 14,
      section_student_total: 35,
      affected_ratio: 0.4,
      summary: "لوحظ من نتائج الكويز وأسئلة الطلبة وجود التباس بين المتطلبات الوظيفية وحالات الاستخدام التفصيلية.",
      status: "open",
      created_at: new Date().toISOString(),
    },
  ];

  constructor() {
    this.initSchedule();
  }

  initSchedule() {
    const today = new Date();
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() - today.getDay()); // Sunday as start

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const sunday = dates[0];
    const monday = dates[1];
    const tuesday = dates[2];
    const wednesday = dates[3];
    const thursday = dates[4];

    this.occurrences = [
      // ================= جدول شعبة A =================
      // 1. برمجة التطبيقات | الأحد | 08:30 (التنبيه: 08:20)
      {
        id: 1,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 1,
        course_code: "CS301",
        course_name: "برمجة التطبيقات",
        day_name: "الأحد",
        occurrence_date: sunday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 2. الذكاء الاصطناعي | الأحد | 10:30 (التنبيه: 10:20)
      {
        id: 2,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 2,
        course_code: "CS302",
        course_name: "الذكاء الاصطناعي",
        day_name: "الأحد",
        occurrence_date: sunday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 3. الشبكات | الاثنين | 08:30 (التنبيه: 08:20)
      {
        id: 3,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 3,
        course_code: "CS303",
        course_name: "الشبكات",
        day_name: "الاثنين",
        occurrence_date: monday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 4. معالجة الصور | الاثنين | 10:30 (التنبيه: 10:20)
      {
        id: 4,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 4,
        course_code: "CS304",
        course_name: "معالجة الصور",
        day_name: "الاثنين",
        occurrence_date: monday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 5. برمجة التطبيقات | الثلاثاء | 08:30 (التنبيه: 08:20)
      {
        id: 5,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 1,
        course_code: "CS301",
        course_name: "برمجة التطبيقات",
        day_name: "الثلاثاء",
        occurrence_date: tuesday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 6. تطوير الويب المتقدم | الثلاثاء | 10:30 (التنبيه: 10:20)
      {
        id: 6,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 5,
        course_code: "CS305",
        course_name: "تطوير الويب المتقدم",
        day_name: "الثلاثاء",
        occurrence_date: tuesday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 7. الشبكات | الأربعاء | 08:30 (التنبيه: 08:20)
      {
        id: 7,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 3,
        course_code: "CS303",
        course_name: "الشبكات",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 8. الذكاء الاصطناعي | الأربعاء | 10:30 (التنبيه: 10:20)
      {
        id: 8,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 2,
        course_code: "CS302",
        course_name: "الذكاء الاصطناعي",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 9. معالجة الصور | الأربعاء | 12:30 (التنبيه: 12:20)
      {
        id: 9,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 4,
        course_code: "CS304",
        course_name: "معالجة الصور",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "12:30:00",
        ends_at: "14:00:00",
        alert_time: "12:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 10. تطوير الويب المتقدم | الخميس | 08:30 (التنبيه: 08:20)
      {
        id: 10,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 5,
        course_code: "CS305",
        course_name: "تطوير الويب المتقدم",
        day_name: "الخميس",
        occurrence_date: thursday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 11. معمارية الحاسوب | الخميس | 10:30 (التنبيه: 10:20)
      {
        id: 11,
        enrollment_id: 1,
        section_id: 1,
        section_code: "A",
        course_id: 6,
        course_code: "CS306",
        course_name: "معمارية الحاسوب",
        day_name: "الخميس",
        occurrence_date: thursday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },

      // ================= جدول شعبة B =================
      // 1. الذكاء الاصطناعي | الأحد | 08:30 (التنبيه: 08:20)
      {
        id: 12,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 2,
        course_code: "CS302",
        course_name: "الذكاء الاصطناعي",
        day_name: "الأحد",
        occurrence_date: sunday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 2. برمجة التطبيقات | الأحد | 10:30 (التنبيه: 10:20)
      {
        id: 13,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 1,
        course_code: "CS301",
        course_name: "برمجة التطبيقات",
        day_name: "الأحد",
        occurrence_date: sunday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 3. معالجة الصور | الاثنين | 08:30 (التنبيه: 08:20)
      {
        id: 14,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 4,
        course_code: "CS304",
        course_name: "معالجة الصور",
        day_name: "الاثنين",
        occurrence_date: monday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 4. الشبكات | الاثنين | 10:30 (التنبيه: 10:20)
      {
        id: 15,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 3,
        course_code: "CS303",
        course_name: "الشبكات",
        day_name: "الاثنين",
        occurrence_date: monday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 5. تطوير الويب المتقدم | الثلاثاء | 08:30 (التنبيه: 08:20)
      {
        id: 16,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 5,
        course_code: "CS305",
        course_name: "تطوير الويب المتقدم",
        day_name: "الثلاثاء",
        occurrence_date: tuesday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 6. برمجة التطبيقات | الثلاثاء | 10:30 (التنبيه: 10:20)
      {
        id: 17,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 1,
        course_code: "CS301",
        course_name: "برمجة التطبيقات",
        day_name: "الثلاثاء",
        occurrence_date: tuesday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 7. معالجة الصور | الأربعاء | 08:30 (التنبيه: 08:20)
      {
        id: 18,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 4,
        course_code: "CS304",
        course_name: "معالجة الصور",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 8. الشبكات | الأربعاء | 10:30 (التنبيه: 10:20)
      {
        id: 19,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 3,
        course_code: "CS303",
        course_name: "الشبكات",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 2,
        room_code: "B-204",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 9. الذكاء الاصطناعي | الأربعاء | 12:30 (التنبيه: 12:20)
      {
        id: 20,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 2,
        course_code: "CS302",
        course_name: "الذكاء الاصطناعي",
        day_name: "الأربعاء",
        occurrence_date: wednesday,
        starts_at: "12:30:00",
        ends_at: "14:00:00",
        alert_time: "12:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 10. معمارية الحاسوب | الخميس | 08:30 (التنبيه: 08:20)
      {
        id: 21,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 6,
        course_code: "CS306",
        course_name: "معمارية الحاسوب",
        day_name: "الخميس",
        occurrence_date: thursday,
        starts_at: "08:30:00",
        ends_at: "10:00:00",
        alert_time: "08:20",
        room_id: 1,
        room_code: "B-203",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
      // 11. تطوير الويب المتقدم | الخميس | 10:30 (التنبيه: 10:20)
      {
        id: 22,
        enrollment_id: 2,
        section_id: 2,
        section_code: "B",
        course_id: 5,
        course_code: "CS305",
        course_name: "تطوير الويب المتقدم",
        day_name: "الخميس",
        occurrence_date: thursday,
        starts_at: "10:30:00",
        ends_at: "12:00:00",
        alert_time: "10:20",
        room_id: 3,
        room_code: "Lab-1",
        slot_type: "regular",
        is_cancelled: false,
        note: null,
        version: 1,
      },
    ];

    this.makeupSuggestions = [
      {
        id: 1,
        enrollment_id: 1,
        suggested_date: dates[4] || "2026-11-12",
        starts_at: "11:00:00",
        ends_at: "12:30:00",
        room_id: 1,
        room_code: "B-203",
        score: 0.95,
        is_accepted: false,
      },
    ];
  }

  recordScheduleChange(occurrenceId: number, changeType: any, oldVal: string | null, newVal: string | null, userId?: number | null) {
    const id = this.scheduleChanges.length + 1;
    const change: ScheduleChange = {
      id,
      occurrence_id: occurrenceId,
      change_type: changeType,
      changed_by_user_id: userId ?? null,
      old_value: oldVal,
      new_value: newVal,
      created_at: new Date().toISOString(),
    };
    this.scheduleChanges.push(change);
    return change;
  }
}

// Global singleton for the Node.js process
const globalForDb = globalThis as unknown as { mockDb: MockDatabase };
export const mockDb = globalForDb.mockDb ?? new MockDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.mockDb = mockDb;
