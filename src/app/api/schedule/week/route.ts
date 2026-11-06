import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const section = searchParams.get("section");

  if (mockDb.occurrences.length === 0 || !mockDb.occurrences[0].section_code) {
    mockDb.initSchedule();
  }

  let list = mockDb.occurrences;
  if (section && (section === "A" || section === "B")) {
    list = list.filter((o) => o.section_code === section);
  }

  // Return sorted by date and time
  const sorted = [...list].sort((a, b) => {
    const diff = a.occurrence_date.localeCompare(b.occurrence_date);
    if (diff !== 0) return diff;
    return a.starts_at.localeCompare(b.starts_at);
  });

  return NextResponse.json(sorted);
}
