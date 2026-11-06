import { mockDb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const afterId = Number(searchParams.get("after_id") ?? -1);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send any existing changes after afterId
      const pending = mockDb.scheduleChanges.filter((c) => c.id > afterId);
      for (const change of pending) {
        const payload = `event: schedule_change\ndata: ${JSON.stringify(change)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      }

      // Keep connection open with keep-alive heartbeat comments
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      // Clean up if closed
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
