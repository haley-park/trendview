import { NextResponse } from "next/server";
import { getVideos } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 키워드 목록(최근 검색어 + 구독 태그 기반)을 합쳐 추천 영상을 만든다.
export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const lang = sp.get("lang") || "ko";
  const period = sp.get("period") || "week";
  const shorts = sp.get("shorts") === "1";
  const force = sp.get("force") === "1";
  const keywords = (sp.get("keywords") || "")
    .split("|").map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (!keywords.length) return NextResponse.json({ videos: [], fetchedAt: 0 });

  const results = await Promise.all(
    keywords.map((q) =>
      getVideos({ category: "", period, shorts, force, enrich: false, query: q, lang })
        .then((r) => r.data)
        .catch(() => [])
    )
  );
  const seen = new Set();
  const merged = [];
  for (const chunk of results) {
    for (const v of chunk) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        merged.push(v);
      }
    }
  }
  merged.sort((a, b) => b.views - a.views);
  return NextResponse.json({ videos: merged.slice(0, 60), fetchedAt: Date.now() / 1000 });
}
