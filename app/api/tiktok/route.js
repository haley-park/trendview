import { NextResponse } from "next/server";
import { getTiktok, DEFAULT_TIKTOK_ACCOUNTS, LOCALES } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const lang = sp.get("lang") || "ko";
  const region = sp.get("region") || (LOCALES[lang] || LOCALES.ko).tiktokRegion;
  const accounts = (sp.get("accounts") || "")
    .split(",").map((s) => s.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);
  const list = accounts.length ? accounts : DEFAULT_TIKTOK_ACCOUNTS;
  const { data, fetchedAt } = await getTiktok(list, region, force);
  return NextResponse.json({
    posts: data.posts.slice(0, 100),
    accountStats: data.accountStats,
    accounts: list,
    fetchedAt,
  });
}
