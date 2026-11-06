"use client";

import { useEffect } from "react";
import { useLectureAlerts } from "@/lib/notifications";

export function LectureAlertBanner() {
  const { activeAlert, dismissAlert } = useLectureAlerts();

  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      dismissAlert();
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeAlert, dismissAlert]);

  if (!activeAlert) return null;

  return (
    <div className="relative isolate z-50 flex items-center justify-between gap-4 border-b border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm transition-all sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-lg">
          🔔
        </span>
        <div className="text-sm">
          <p className="font-bold">
            {activeAlert.message}
          </p>
          <p className="text-xs text-amber-800">
            المادة: {activeAlert.lectureName} · الموعد: {activeAlert.time} · {activeAlert.room} · شعبة {activeAlert.section}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={dismissAlert}
          className="rounded-md bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition-colors"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
}
