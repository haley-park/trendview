import { NextResponse } from "next/server";
import { getThreadsPosts, DEFAULT_THREADS_ACCOUNTS } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const accounts = (sp.get("accounts") || "")
    .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const list = accounts.length ? accounts : DEFAULT_THREADS_ACCOUNTS;
  const { data, fetchedAt } = await getThreadsPosts(list, force);
  return NextResponse.json({ posts: data, accounts: list, fetchedAt });
}
