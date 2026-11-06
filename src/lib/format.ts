import type { RequestCategory, SlotType, ChangeType } from "./types";

const TZ = "Asia/Baghdad";

const DATE_TIME = new Intl.DateTimeFormat("ar", {
  timeZone: TZ,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const TIME = new Intl.DateTimeFormat("ar", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY_LONG = new Intl.DateTimeFormat("ar", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const ISO_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** الخادم يعيد التواريخ بتوقيت UTC، وقد تأتي بلا لاحقة، فنضيف Z عند الغياب، ونتعامل مع الأوقات المجردة بأمان. */
export function parseIso(value: string): Date {
  if (!value) return new Date(NaN);
  const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(normalized)) {
    return new Date(`1970-01-01T${normalized.length === 5 ? `${normalized}:00` : normalized}Z`);
  }
  return new Date(/([zZ]|[+-]\d{2}:?\d{2})$/.test(normalized) ? normalized : `${normalized}Z`);
}

export function formatDateTime(value: string): string {
  if (!value) return "";
  const d = parseIso(value);
  if (isNaN(d.getTime())) return value;
  return DATE_TIME.format(d);
}

export function formatTime(value: string): string {
  if (!value) return "";
  const timeMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, "0");
    const minutes = timeMatch[2];
    return `${hours}:${minutes}`;
  }
  const d = parseIso(value);
  if (isNaN(d.getTime())) return value;
  return TIME.format(d);
}

/** تاريخ اليوم بصيغة YYYY-MM-DD بتوقيت بغداد، يُستخدم كقيمة لحقول التاريخ. */
export function todayIsoDay(): string {
  return ISO_DAY.format(new Date());
}

/** يعرض يوماً بصيغة YYYY-MM-DD باسم اليوم والتاريخ بالعربية. العراق بلا توقيت صيفي، فالإزاحة ثابتة +03:00. */
export function formatDayIso(day: string): string {
  if (!day) return "";
  const d = new Date(`${day}T12:00:00+03:00`);
  if (isNaN(d.getTime())) return day;
  return DAY_LONG.format(d);
}

export const CATEGORY_LABELS: Record<RequestCategory, string> = {
  academic: "أكاديمي",
  administrative: "إداري",
};

export const STATUS_LABELS: Record<string, string> = {
  submitted: "مُرسل",
  in_section_review: "لدى ممثل الشعبة",
  merged: "ضمن بطاقة موحدة",
  forwarded: "أُحيل",
  in_review: "قيد المراجعة",
  approved: "موافقة",
  rejected: "مرفوض",
  resolved: "تمت المعالجة",
  closed: "مغلق",
};

export const STATUS_TONE: Record<string, "slate" | "blue" | "green" | "amber" | "red"> = {
  submitted: "slate",
  in_section_review: "blue",
  merged: "slate",
  forwarded: "blue",
  in_review: "amber",
  approved: "green",
  rejected: "red",
  resolved: "green",
  closed: "slate",
};

export const ACTION_LABELS: Record<string, string> = {
  submitted: "تم تقديم الطلب",
  merged: "دُمج ضمن بطاقة موحدة",
  batch_created: "أُنشئت بطاقة موحدة",
  classified: "صُنّف الطلب",
  forwarded: "أُحيل",
  approved: "وافق",
  rejected: "رفض",
  resolved: "أُغلق بالمعالجة",
};

export const SLOT_LABELS: Record<SlotType, string> = {
  regular: "محاضرة",
  makeup: "تعويضية",
  postponed: "مؤجلة",
  cancelled: "ملغاة",
};

export const CHANGE_LABELS: Record<ChangeType, string> = {
  room_change: "تغيير قاعة",
  time_change: "تغيير موعد",
  postponement: "تأجيل محاضرة",
  cancellation: "إلغاء محاضرة",
  makeup_added: "محاضرة تعويضية جديدة",
};

export const MATERIAL_LABELS: Record<string, string> = {
  pending: "بانتظار المعالجة",
  processing: "جارٍ المعالجة",
  ready: "جاهزة",
  failed: "فشلت",
};

export const GAP_LABELS: Record<string, string> = {
  open: "جديد",
  acknowledged: "تمت المراجعة",
  resolved: "محلول",
};