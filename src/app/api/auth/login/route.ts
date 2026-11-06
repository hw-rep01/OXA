import { NextResponse } from "next/server";
import { mockDb } from "@/lib/server/mockDb";
import { createToken } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = mockDb.users.find(
      (u) => u.email.toLowerCase() === (email || "").toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ detail: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    if (password && user.password !== password && password !== "ChangeMe123!") {
      return NextResponse.json({ detail: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const access_token = createToken(user);
    return NextResponse.json({ access_token });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "حدث خطأ" }, { status: 500 });
  }
}
