import { NextResponse } from "next/server";
import {
  CURATOR_COOKIE,
  checkCuratorPassword,
  curatorPasswordSet,
  makeCuratorToken,
} from "../../../../lib/auth";

export async function POST(req: Request) {
  if (!curatorPasswordSet()) {
    return NextResponse.json(
      { error: "Password kurator belum diset di server (env CURATOR_PASSWORD)." },
      { status: 503 },
    );
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkCuratorPassword(password)) {
    return NextResponse.json({ error: "Password kurator salah." }, { status: 401 });
  }
  const token = makeCuratorToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CURATOR_COOKIE, token ?? "", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
