import { NextResponse } from "next/server";
import { getXPosts, DEFAULT_X_ACCOUNTS } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const accounts = (sp.get("accounts") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const list = accounts.length ? accounts : DEFAULT_X_ACCOUNTS;
  const { data, fetchedAt } = await getXPosts(list, force);
  return NextResponse.json({ posts: data, accounts: list, fetchedAt });
}
