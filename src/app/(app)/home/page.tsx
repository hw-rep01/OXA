"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/roles";
import type { Course, NotificationItem, Occurrence } from "@/lib/types";
import { Card, Empty, ErrorText, Spinner, Button } from "@/components/ui";
import { useLectureAlerts } from "@/lib/notifications";

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [notes, setNotes] = useState<NotificationItem[] | null>(null);
  const [todayLectures, setTodayLectures] = useState<Occurrence[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { triggerTestAlert, permission, requestPermission } = useLectureAlerts();

  useEffect(() => {
    Promise.all([
      apiFetch<Course[]>("/api/courses"),
      apiFetch<NotificationItem[]>("/api/notifications/mine"),
      apiFetch<Occurrence[]>("/api/schedule/week?section=A"),
    ])
      .then(([c, n, s]) => {
        setCourses(c);
        setNotes(n);
        // Take first 3 lectures as upcoming highlight
        setTodayLectures(s.slice(0, 3));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-l from-brand-700 to-brand-800 p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block rounded-md bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
              {ROLE_LABELS[user.role]}
            </span>
            <h1 className="text-2xl font-bold">أهلاً بك، {user.full_name}</h1>
            <p className="text-sm text-brand-100">
              تابع جدول المحاضرات الأسبوعي، التنبيهات المسبقة، والتبليغات الرسمية بكل سهولة.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-50 transition-colors shadow-xs"
            >
              <span>📅</span>
              <span>عرض الجدول الأسبوعي</span>
            </Link>
            <Link
              href="/broadcasts"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
            >
              <span>📢</span>
              <span>التبليغات</span>
            </Link>
          </div>
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      {/* Upcoming Lectures Widget */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">محاضراتك القادمة (شعبة A)</h2>
            <p className="text-xs text-slate-500">تصلك إشعارات وتنبيهات واقعية قبل 10 دقائق من موعد المحاضرة</p>
          </div>
          <div className="flex items-center gap-2">
            {permission !== "granted" && (
              <Button variant="secondary" onClick={() => void requestPermission()} className="text-xs">
                🔔 تفعيل التنبيهات
              </Button>
            )}
            <Link href="/schedule" className="text-xs font-bold text-brand-600 hover:underline">
              عرض كل المحاضرات ←
            </Link>
          </div>
        </div>

        {!todayLectures ? (
          <Spinner />
        ) : todayLectures.length === 0 ? (
          <Empty>لا توجد محاضرات قريبة مجدولة اليوم.</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayLectures.map((lec) => (
              <div
                key={lec.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-brand-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-brand-700">{lec.day_name || "الأحد"}</span>
                    <span>القاعة: {lec.room_code || "B-203"}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{lec.course_name}</h3>
                  <div className="mt-2 text-xs text-slate-700 font-mono">
                    الوقت: {formatTime(lec.starts_at)} – {formatTime(lec.ends_at)}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                    🔔 التنبيه: {lec.alert_time || "08:20"}
                  </span>
                  <button
                    onClick={() => triggerTestAlert(lec)}
                    className="text-xs text-brand-700 hover:text-brand-900 font-medium"
                    title="تجربة التنبيه الصوتي والإشعار"
                  >
                    تجربة التنبيه
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Courses & Notifications Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="المواد الدراسية المسجلة">
          {!courses ? (
            <Spinner />
          ) : courses.length === 0 ? (
            <Empty>لا توجد مواد مسجلة بحسابك حالياً.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {courses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center justify-between py-3 hover:text-brand-600 transition-colors"
                  >
                    <span className="font-medium text-slate-800">{course.name_ar}</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="آخر التنبيهات والإشعارات">
          {!notes ? (
            <Spinner />
          ) : notes.length === 0 ? (
            <Empty>لا توجد إشعارات حتى الآن.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {notes.slice(0, 5).map((n) => (
                <li key={n.id} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{n.title}</span>
                    {n.sent_at && (
                      <span className="shrink-0 text-xs text-slate-400 font-mono">
                        {formatDateTime(n.sent_at)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-xs text-slate-600 leading-5">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}