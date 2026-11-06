"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch, errorMessage } from "@/lib/api";
import { subscribeSchedule, type StreamStatus } from "@/lib/stream";
import { CHANGE_LABELS, SLOT_LABELS, formatDateTime, formatTime, todayIsoDay } from "@/lib/format";
import type { MakeupSuggestion, Occurrence, Room, ScheduleChange } from "@/lib/types";
import { Badge, Button, Card, Empty, ErrorText, Input, Notice, Select, Spinner } from "@/components/ui";
import { useLectureAlerts } from "@/lib/notifications";

const EDIT_ROLES = new Set(["instructor", "department_coordinator", "department_head"]);

export default function SchedulePage() {
  const { user } = useAuth();
  const [day, setDay] = useState(todayIsoDay());
  const [selectedSection, setSelectedSection] = useState<"A" | "B">("A");
  const [rows, setRows] = useState<Occurrence[] | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [feed, setFeed] = useState<ScheduleChange[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { permission, requestPermission, triggerTestAlert } = useLectureAlerts();

  const loadRef = useRef<() => Promise<void>>(async () => {});
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Occurrence[]>(`/api/schedule/week?day=${day}&section=${selectedSection}`);
      setRows(data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [day, selectedSection]);

  loadRef.current = load;

  useEffect(() => {
    void load();
  }, [load]);

  const canEdit = !!user && EDIT_ROLES.has(user.role);

  useEffect(() => {
    if (!canEdit) return;
    apiFetch<Room[]>("/api/rooms")
      .then(setRooms)
      .catch(() => setRooms([]));
  }, [canEdit]);

  useEffect(() => {
    if (!user) return;
    const stop = subscribeSchedule((change) => {
      setFeed((prev) => [change, ...prev].slice(0, 30));
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => void loadRef.current(), 400);
    }, setStatus);
    return () => {
      stop();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [user]);

  if (!user) return null;

  const currentSectionRows = rows ? rows.filter((r) => !r.section_code || r.section_code === selectedSection) : [];

  return (
    <div className="space-y-6">
      {/* Header with Title and Section Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">📅 جدول المحاضرات الأسبوعي</h1>
          <p className="text-sm text-slate-500">
            تنبيهات تلقائية واقعية ترسل للطلبة قبل 10 دقائق من موعد كل محاضرة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusDot status={status} />
          {permission !== "granted" ? (
            <Button variant="secondary" onClick={() => void requestPermission()} className="text-xs">
              🔔 تفعيل تنبيهات المتصفح
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
              ✓ التنبيهات مفعلة
            </span>
          )}
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      {notice && <Notice>{notice}</Notice>}

      {/* Section Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSection("A")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              selectedSection === "A"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>جدول شعبة A</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${selectedSection === "A" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              11 محاضرة
            </span>
          </button>

          <button
            onClick={() => setSelectedSection("B")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              selectedSection === "B"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>جدول شعبة B</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${selectedSection === "B" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              11 محاضرة
            </span>
          </button>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            const first = currentSectionRows[0];
            triggerTestAlert(first);
            setNotice("تم إطلاق إشعار تجريبي واقعي مع نغمة التنبيه المسبق!");
          }}
          className="text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 font-semibold"
        >
          🔊 اختبار نغمة وتنبيه المحاضرة الآن
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          {!rows ? (
            <Card><Spinner /></Card>
          ) : currentSectionRows.length === 0 ? (
            <Card><Empty>لا توجد محاضرات مجدولة لهذه الشعبة.</Empty></Card>
          ) : (
            groupByDayName(currentSectionRows).map(([dayName, items]) => (
              <div key={dayName} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700 font-bold text-xs">
                      {dayName.slice(0, 3)}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{dayName}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {items.length} {items.length === 1 ? "محاضرة" : "محاضرات"}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((row, index) => (
                    <OccurrenceCard
                      key={row.id}
                      index={index + 1}
                      row={row}
                      canEdit={canEdit}
                      rooms={rooms}
                      onTriggerAlert={() => {
                        triggerTestAlert(row);
                        setNotice(`تم إرسال تنبيه مسبق لمحاضرة ${row.course_name}!`);
                      }}
                      onDone={(message) => {
                        setNotice(message);
                        void load();
                      }}
                      onError={setError}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Info & Live Updates */}
        <div className="space-y-6">
          {/* Notification Feature Card */}
          <Card title="نظام التنبيهات المسبقة 🔔">
            <div className="space-y-3 text-sm text-slate-600">
              <p className="leading-6">
                يقوم النظام بإشعارك تلقائياً قبل <strong>10 دقائق</strong> من بداية كل محاضرة بنغمة صوتية واضحة وبنر تفاعلي.
              </p>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>محاضرة 08:30:</span>
                  <span className="font-bold text-amber-700 font-mono">تنبيه 08:20</span>
                </div>
                <div className="flex justify-between">
                  <span>محاضرة 10:30:</span>
                  <span className="font-bold text-amber-700 font-mono">تنبيه 10:20</span>
                </div>
                <div className="flex justify-between">
                  <span>محاضرة 12:30:</span>
                  <span className="font-bold text-amber-700 font-mono">تنبيه 12:20</span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full text-xs"
                onClick={() => {
                  triggerTestAlert();
                  setNotice("تم تشغيل صوت التنبيه وإرسال الإشعار بنجاح.");
                }}
              >
                تجربة الإشعار الصوتي الفوري
              </Button>
            </div>
          </Card>

          {/* Live Feed */}
          <Card title="التحديثات والتغييرات المباشرة">
            {feed.length === 0 ? (
              <Empty>ستظهر هنا أي تعديلات فورية في القاعات أو المواعيد عبر البث الحي.</Empty>
            ) : (
              <ul className="space-y-2 text-sm">
                {feed.map((c) => (
                  <li key={c.id} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <div className="font-semibold text-slate-800">{CHANGE_LABELS[c.change_type] ?? c.change_type}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">
                      محاضرة #{c.occurrence_id} · {formatDateTime(c.created_at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: StreamStatus }) {
  const map = {
    live: ["bg-emerald-500", "البث المباشر متصل"],
    connecting: ["bg-amber-400", "جارٍ الاتصال بالبث"],
    offline: ["bg-red-500", "البث غير متصل"],
  } as const;
  const [color, label] = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

function groupByDayName(rows: Occurrence[]): [string, Occurrence[]][] {
  const map = new Map<string, Occurrence[]>();
  for (const row of rows) {
    const key = row.day_name || "الأحد";
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()];
}

function OccurrenceCard({
  index,
  row,
  canEdit,
  rooms,
  onTriggerAlert,
  onDone,
  onError,
}: {
  index: number;
  row: Occurrence;
  canEdit: boolean;
  rooms: Room[];
  onTriggerAlert: () => void;
  onDone: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [roomId, setRoomId] = useState(row.room_id ? String(row.room_id) : "");
  const [suggestions, setSuggestions] = useState<MakeupSuggestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [showManage, setShowManage] = useState(false);

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await action();
      onDone(message);
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const cancelled = row.is_cancelled;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        cancelled ? "border-amber-200 bg-amber-50/40" : "border-slate-150 bg-slate-50/50 hover:bg-slate-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-mono">[{index}]</span>
            <h4 className="text-base font-bold text-slate-900">{row.course_name}</h4>
            <Badge tone={cancelled ? "amber" : row.slot_type === "makeup" ? "green" : "slate"}>
              {SLOT_LABELS[row.slot_type] ?? "منتظمة"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              الوقت: {formatTime(row.starts_at)} – {formatTime(row.ends_at)}
            </span>
            <span>·</span>
            <span>القاعة: {row.room_code ?? "B-203"}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
              🔔 التنبيه: {row.alert_time || "08:20"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerAlert}
            title="تجربة إرسال تنبيه هذه المحاضرة"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <span>🔔</span>
            <span>تجربة التنبيه</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setShowManage(!showManage)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              {showManage ? "إغلاق الإدارة" : "إدارة"}
            </button>
          )}
        </div>
      </div>

      {canEdit && showManage && !cancelled && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
          <Select className="w-auto text-xs" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">اختر قاعة بديلة</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || r.code}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            disabled={busy || !roomId}
            onClick={() =>
              run(
                () =>
                  apiFetch(`/api/schedule/occurrences/${row.id}/room`, {
                    method: "POST",
                    json: { room_id: Number(roomId) },
                  }),
                "تم تغيير القاعة بنجاح",
              )
            }
            className="text-xs"
          >
            تغيير القاعة
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              void run(
                () =>
                  apiFetch(`/api/schedule/occurrences/${row.id}/cancel`, {
                    method: "POST",
                    json: { as_postponement: true },
                  }),
                "تم تأجيل المحاضرة",
              );
            }}
            className="text-xs"
          >
            تأجيل
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              void run(
                () =>
                  apiFetch(`/api/schedule/occurrences/${row.id}/cancel`, {
                    method: "POST",
                    json: { as_postponement: false },
                  }),
                "تم إلغاء المحاضرة",
              );
            }}
            className="text-xs"
          >
            إلغاء
          </Button>
        </div>
      )}

      {cancelled && canEdit && (
        <div className="mt-3 space-y-2 border-t border-amber-200 pt-3">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              apiFetch<MakeupSuggestion[]>("/api/schedule/makeup/suggest", {
                method: "POST",
                json: { occurrence_id: row.id },
              })
                .then(setSuggestions)
                .catch((e) => onError(errorMessage(e)));
            }}
            className="text-xs"
          >
            اقتراح موعد بديل (محاضرة تعويضية)
          </Button>

          {suggestions && (
            <div className="rounded-lg bg-white p-3 border border-amber-200">
              <p className="mb-2 text-xs font-bold text-slate-700">المواعيد البديلة المقترحة:</p>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50">
                    <div>
                      <span className="font-medium">{s.suggested_date}</span> · {formatTime(s.starts_at)} – {formatTime(s.ends_at)} · القاعة {s.room_code}
                    </div>
                    <Button
                      variant="primary"
                      disabled={busy}
                      onClick={() => {
                        void run(
                          () =>
                            apiFetch(`/api/schedule/makeup/suggestions/${s.id}/accept`, {
                              method: "POST",
                            }),
                          "تم اعتماد المحاضرة التعويضية بنجاح",
                        );
                      }}
                      className="text-xs py-1 px-2"
                    >
                      اعتماد
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}