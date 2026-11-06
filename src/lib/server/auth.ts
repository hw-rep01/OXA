import { headers } from "next/headers";
import { mockDb, type MockUser } from "./mockDb";

export function getCurrentUser(): MockUser | null {
  const reqHeaders = headers();
  const auth = reqHeaders.get("authorization") || reqHeaders.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  
  if (token.startsWith("token_")) {
    const id = Number(token.replace("token_", ""));
    return mockDb.users.find((u) => u.id === id) ?? null;
  }
  
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded?.id) {
      return mockDb.users.find((u) => u.id === decoded.id) ?? null;
    }
  } catch {
    // fallback
  }

  // fallback to first student user if unknown
  return mockDb.users[4] ?? null;
}

export function createToken(user: MockUser): string {
  const payload = { id: user.id, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}
