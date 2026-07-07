import { NextResponse } from "next/server";
import { getReels, DEFAULT_IG_ACCOUNTS } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const accounts = (sp.get("accounts") || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const list = accounts.length ? accounts : DEFAULT_IG_ACCOUNTS;
  const { data, fetchedAt } = await getReels(list, force);
  return NextResponse.json({
    reels: data.reels.slice(0, 80),
    accountStats: data.accountStats,
    accounts: list,
    fetchedAt,
  });
}
