import { NextResponse } from "next/server";
import { getAiData } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const force = sp.get("force") === "1";
  const lang = sp.get("lang") || "ko";
  const { data, fetchedAt } = await getAiData(lang, force);
  return NextResponse.json({ ...data, fetchedAt });
}
