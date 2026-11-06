"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/home");
  }, [loading, user, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/home");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-700">منصة القسم الذكية</h1>
        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="البريد الإلكتروني">
              <Input
                type="email"
                dir="ltr"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="كلمة المرور">
              <Input
                type="password"
                dir="ltr"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "جارٍ الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">حسابات تجريبية سريعة:</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { label: "طالب", email: "student@sdp.local" },
                { label: "ممثل الشعبة", email: "rep@sdp.local" },
                { label: "أستاذ المادة", email: "dr@sdp.local" },
                { label: "مقرر القسم", email: "coord@sdp.local" },
                { label: "رئيس القسم", email: "head@sdp.local" },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("ChangeMe123!");
                  }}
                  className="rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}