import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";

export async function POST(req: Request) {
  try {
    const { occurrence_id } = await req.json();
    const occ = mockDb.occurrences.find((o) => o.id === Number(occurrence_id));

    // Return suggested makeup slots
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const suggestedDate = today.toISOString().slice(0, 10);

    const suggestions = [
      {
        id: 1,
        enrollment_id: occ?.enrollment_id || 1,
        suggested_date: suggestedDate,
        starts_at: "12:00:00",
        ends_at: "13:30:00",
        room_id: 1,
        room_code: "B-203",
        score: 0.96,
        is_accepted: false,
      },
      {
        id: 2,
        enrollment_id: occ?.enrollment_id || 1,
        suggested_date: suggestedDate,
        starts_at: "14:00:00",
        ends_at: "15:30:00",
        room_id: 2,
        room_code: "B-204",
        score: 0.91,
        is_accepted: false,
      },
    ];

    mockDb.makeupSuggestions = suggestions;
    return NextResponse.json(suggestions);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
