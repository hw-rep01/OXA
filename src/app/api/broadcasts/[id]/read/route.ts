import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const user = getCurrentUser();
  const broadcast = mockDb.broadcasts.find((b) => b.id === id);
  if (!broadcast) {
    return NextResponse.json({ detail: "التبليغ غير موجود" }, { status: 404 });
  }

  const readers = mockDb.readersMap.get(id) || [];
  if (user && !readers.some((r) => r.full_name === user.full_name)) {
    readers.push({ full_name: user.full_name, read_at: new Date().toISOString() });
    mockDb.readersMap.set(id, readers);
    broadcast.seen_count = readers.length;
  }

  return NextResponse.json({ success: true });
}
