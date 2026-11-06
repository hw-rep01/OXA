"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { NAV, ROLE_LABELS } from "@/lib/roles";
import { Button } from "@/components/ui";
import { LectureAlertBanner } from "./LectureAlertBanner";
import { useLectureAlerts } from "@/lib/notifications";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { permission, requestPermission } = useLectureAlerts();

  if (!user) return null;
  const items = NAV[user.role];

  return (
    <div className="min-h-screen bg-slate-50/70">
      <LectureAlertBanner />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/home" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm shadow-sm">
                ق
              </span>
              <span className="font-bold text-slate-900 tracking-tight text-lg">منصة القسم الذكية</span>
            </Link>
            <nav className="flex flex-wrap gap-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {permission !== "granted" && (
              <button
                onClick={() => void requestPermission()}
                title="تفعيل إشعارات المتصفح وتنبيهات المحاضرات"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-xs"
              >
                <span>🔔</span>
                <span className="hidden sm:inline">تفعيل التنبيهات</span>
              </button>
            )}

            <div className="text-left rtl:text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800">{user.full_name}</div>
              <div className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</div>
            </div>
            <Button variant="ghost" onClick={logout} className="text-slate-600 hover:text-red-600 text-xs px-2.5 py-1.5">
              خروج
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}