import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const events = mockDb.requestEvents.get(id) || [];
  return NextResponse.json(events);
}
