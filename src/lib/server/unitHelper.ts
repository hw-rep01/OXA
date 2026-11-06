import { mockDb } from "./mockDb";
import type { Role, UnitView } from "@/lib/types";

export function getUnitsForRole(role: Role): UnitView[] {
  const units: UnitView[] = [];

  // 1. Add individual requests
  for (const r of mockDb.requests) {
    if (r.batch_id) continue; // batched requests grouped into batch unit

    // Check if relevant to this role
    let include = false;
    if (role === "class_representative") {
      include = true; // rep sees section requests
    } else if (r.current_stage === role) {
      include = true;
    } else if (role === "department_head") {
      include = true;
    } else if (role === "department_coordinator" && r.category === "administrative") {
      include = true;
    } else if (role === "instructor" && r.category === "academic") {
      include = true;
    }

    if (include) {
      units.push({
        kind: "request",
        id: r.id,
        section_id: 1,
        category: r.category,
        course_id: r.course_id,
        title: r.subject,
        summary: r.body,
        request_count: 1,
        status: r.status,
        current_stage: r.current_stage,
        created_at: r.created_at,
      });
    }
  }

  // 2. Add batches
  for (const b of mockDb.batches) {
    let include = false;
    if (role === "class_representative") {
      include = true;
    } else if (b.current_stage === role) {
      include = true;
    } else if (role === "department_head") {
      include = true;
    } else if (role === "department_coordinator" && b.category === "administrative") {
      include = true;
    } else if (role === "instructor" && b.category === "academic") {
      include = true;
    }

    if (include) {
      units.push({
        kind: "batch",
        id: b.id,
        section_id: b.section_id,
        category: b.category,
        course_id: b.course_id,
        title: b.title,
        summary: b.summary,
        request_count: b.request_ids.length,
        status: b.status,
        current_stage: b.current_stage,
        created_at: b.created_at,
      });
    }
  }

  return units;
}
