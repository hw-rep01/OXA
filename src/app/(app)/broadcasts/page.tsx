"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Empty, ErrorText, Field, Input, Notice, Select, Spinner, Textarea } from "@/components/ui";
import { apiFetch, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { Broadcast, Course, Reader } from "@/lib/types";

const POSTERS = new Set(["instructor", "department_coordinator", "department_head"]);

export default function BroadcastsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Broadcast[] | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [readers, setReaders] = useState<{ broadcastId: number; list: Reader[] } | null>(null);
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [courseId, setCourseId] = useState("");

  const canPost = !!user && POSTERS.has(user.role);
  const isStudent = !!user && !canPost;
  const scope = user?.role === "instructor" ? "course" : "department";
  const autoMarkedRef = useRef<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      const list = await apiFetch<Broadcast[]>("/api/broadcasts");
      setItems(list);
      return list;
    } catch (e) {
      setError(errorMessage(e));
      return null;
    }
  }, []);

  // تلقائياً: تسجيل الاطلاع بمجرد دخول الصفحة واحتساب المشاهدة مباشرة
  useEffect(() => {
    load().then((list) => {
      if (!list || !isStudent) return;
      list.forEach((b) => {
        if (!autoMarkedRef.current.has(b.id)) {
          autoMarkedRef.current.add(b.id);
          apiFetch(`/api/broadcasts/${b.id}/read`, { method: "POST" })
            .then(() => {
              setAcknowledged((prev) => new Set(prev).add(b.id));
            })
            .catch(() => {});
        }
      });
    });

    if (user?.role === "instructor") {
      apiFetch<Course[]>("/api/courses")
        .then(setCourses)
        .catch(() => setCourses([]));
    }
  }, [load, user, isStudent]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiFetch("/api/broadcasts", {
        method: "POST",
        json: {
          scope,
          course_id: scope === "course" ? Number(courseId) : null,
          title,
          body,
          is_pinned: pinned,
        },
      });
      setTitle("");
      setBody("");
      setPinned(false);
      setNotice("تم نشر التبليغ بنجاح وإشعار المستهدفين.");
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function showReaders(id: number) {
    if (readers?.broadcastId === id) {
      setReaders(null);
      return;
    }
    try {
      const list = await apiFetch<Reader[]>(`/api/broadcasts/${id}/readers`);
      setReaders({ broadcastId: id, list });
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التبليغات</h1>
          <p className="text-sm text-slate-500">
            {isStudent
              ? "يتم تسجيل مشاهدتك للتبليغات تلقائياً بمجرد فتح الصفحة لتسهيل المتابعة."
              : "نشر التبليغات الرسمية وتتبع إحصائيات قراءتها من قبل الطلبة."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {canPost && (
          <Card title="نشر تبليغ جديد" className="h-fit">
            <form onSubmit={publish} className="space-y-4">
              <Field label="نطاق التبليغ">
                <Input readOnly value={scope === "course" ? "تبليغ لمادة محددة" : "تبليغ عام لكافة القسم"} />
              </Field>
              {scope === "course" && (
                <Field label="المادة">
                  <Select required value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">اختر المادة</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="عنوان التبليغ">
                <Input required minLength={3} maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="نص التبليغ">
                <Textarea
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded" />
                تثبيت التبليغ في أعلى القائمة
              </label>
              {error && <ErrorText>{error}</ErrorText>}
              {notice && <Notice>{notice}</Notice>}
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "جارٍ النشر..." : "نشر التبليغ"}
              </Button>
            </form>
          </Card>
        )}

        <div className={canPost ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          {!items ? (
            <Card><Spinner /></Card>
          ) : items.length === 0 ? (
            <Card><Empty>لا توجد تبليغات حالياً.</Empty></Card>
          ) : (
            items.map((b) => (
              <article
                key={b.id}
                className={`rounded-xl border p-5 transition-all shadow-xs ${
                  b.is_pinned ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {b.is_pinned && <Badge tone="amber">مثبّت</Badge>}
                    <span className="text-xs font-semibold text-brand-700">{b.channel_name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{formatDateTime(b.created_at)}</span>
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900">{b.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{b.body}</p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>قرأه {b.seen_count} من {b.audience_count}</span>
                    {isStudent && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <span>✓</span>
                        <span>تم احتساب الاطلاع تلقائياً</span>
                      </span>
                    )}
                  </div>

                  {canPost && (
                    <Button
                      variant="ghost"
                      onClick={() => void showReaders(b.id)}
                      className="text-xs py-1 px-2.5 text-slate-600"
                    >
                      {readers?.broadcastId === b.id ? "إخفاء القراء" : "من قرأ؟"}
                    </Button>
                  )}
                </div>

                {readers?.broadcastId === b.id && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <p className="mb-2 text-xs font-bold text-slate-600">قائمة الطلبة الذين اطلعوا على التبليغ:</p>
                    {readers.list.length === 0 ? (
                      <p className="text-xs text-slate-500">لم يقرأ أحد التبليغ بعد.</p>
                    ) : (
                      <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
                        {readers.list.map((r, i) => (
                          <li key={i} className="flex justify-between items-center gap-2 rounded bg-white px-2 py-1 border border-slate-100">
                            <span className="font-medium text-slate-800">{r.full_name}</span>
                            <span className="text-slate-400 font-mono">{formatDateTime(r.read_at)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}