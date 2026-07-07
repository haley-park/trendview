import { NextResponse } from "next/server";
import {
  getTiktok, getTiktokTrendingPart, getTiktokAccountsPart,
  DEFAULT_TIKTOK_ACCOUNTS, LOCALES,
} from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const lang = sp.get("lang") || "ko";
  const region = sp.get("region") || (LOCALES[lang] || LOCALES.ko).tiktokRegion;
  const part = sp.get("part") || "";
  const category = sp.get("category") || "all";
  const accounts = (sp.get("accounts") || "")
    .split(",").map((s) => s.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);
  const list = accounts.length ? accounts : DEFAULT_TIKTOK_ACCOUNTS;

  // 경량 파트: 트렌딩/카테고리만 (첫 화면 고속 렌더용)
  if (part === "trending") {
    const { data, fetchedAt } = await getTiktokTrendingPart(region, category, lang, force);
    return NextResponse.json({ posts: data.slice(0, 60), fetchedAt });
  }
  // 구독 계정 파트: 계정 영상 + 팔로워 통계 (백그라운드 병합용)
  if (part === "accounts") {
    const { data, fetchedAt } = await getTiktokAccountsPart(list, force);
    return NextResponse.json({
      posts: data.posts.slice(0, 100),
      accountStats: data.accountStats,
      accounts: list,
      fetchedAt,
    });
  }
  // 기본: 기존 통합 응답 (하위 호환)
  const { data, fetchedAt } = await getTiktok(list, region, force);
  return NextResponse.json({
    posts: data.posts.slice(0, 100),
    accountStats: data.accountStats,
    accounts: list,
    fetchedAt,
  });
}
