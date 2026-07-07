import { NextResponse } from "next/server";
import { getVideos, CATEGORY_QUERIES } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") || "all";
  const period = sp.get("period") || "week";
  const shorts = sp.get("shorts") === "1";
  const enrich = sp.get("enrich") === "1";
  const force = sp.get("force") === "1";
  const query = (sp.get("q") || "").trim();
  const lang = sp.get("lang") || "ko";
  if (!query && category !== "all" && category !== "ai" && !CATEGORY_QUERIES[category]) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }
  const { data, fetchedAt } = await getVideos({ category, period, shorts, force, enrich, query, lang });
  return NextResponse.json({ videos: data.slice(0, 60), fetchedAt });
}
