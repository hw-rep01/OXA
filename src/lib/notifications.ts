"use client";

import { useEffect, useState, useCallback } from "react";
import type { Occurrence } from "./types";

export interface LectureAlert {
  id: string;
  lectureName: string;
  time: string;
  alertTime: string;
  room: string;
  section: string;
  message: string;
  timestamp: number;
}

// Synthesize a pleasant high-quality chime using Web Audio API
export function playAlertChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Primary bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.05); // D6

    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.05);
    osc1.stop(ctx.currentTime + 0.85);
    osc2.stop(ctx.currentTime + 0.95);
  } catch {
    // Audio context may require prior user interaction
  }
}

// Request and trigger browser notification
export async function sendBrowserNotification(title: string, options: NotificationOptions = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    try {
      new Notification(title, {
        dir: "rtl",
        lang: "ar",
        badge: "/favicon.ico",
        ...options,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

type AlertListener = (alert: LectureAlert) => void;
const listeners = new Set<AlertListener>();

export function emitLectureAlert(alert: LectureAlert) {
  playAlertChime();
  void sendBrowserNotification(`🔔 تنبيه محاضرة قادمة: ${alert.lectureName}`, {
    body: `تبدأ المحاضرة في تمام الساعة ${alert.time} (${alert.room}) - شعبة ${alert.section}`,
  });
  listeners.forEach((listener) => listener(alert));
}

export function subscribeLectureAlerts(listener: AlertListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLectureAlerts() {
  const [activeAlert, setActiveAlert] = useState<LectureAlert | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }

    const unsubscribe = subscribeLectureAlerts((alert) => {
      setActiveAlert(alert);
    });

    return unsubscribe;
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        emitLectureAlert({
          id: `test-${Date.now()}`,
          lectureName: "تم تفعيل الإشعارات بنجاح",
          time: "الآن",
          alertTime: "فوري",
          room: "النظام",
          section: "A",
          message: "ستصلك الآن تنبيهات المحاضرات قبل 10 دقائق من موعدها الفعلي.",
          timestamp: Date.now(),
        });
      }
      return result;
    }
    return "denied";
  }, []);

  const triggerTestAlert = useCallback((lecture?: Occurrence) => {
    const alert: LectureAlert = {
      id: `alert-${Date.now()}`,
      lectureName: lecture?.course_name || "برمجة التطبيقات",
      time: lecture ? lecture.starts_at.slice(0, 5) : "08:30",
      alertTime: lecture?.alert_time || "08:20",
      room: lecture ? `القاعة ${lecture.room_code || "B-203"}` : "القاعة B-203",
      section: lecture?.section_code || "A",
      message: `تنبيه مسبق (10 دقائق): تبدأ محاضرة ${lecture?.course_name || "برمجة التطبيقات"} قريباً.`,
      timestamp: Date.now(),
    };
    emitLectureAlert(alert);
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    activeAlert,
    permission,
    requestPermission,
    triggerTestAlert,
    dismissAlert,
  };
}
