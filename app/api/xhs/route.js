import { NextResponse } from "next/server";
import { getXhsHot } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req) {
  const force = req.nextUrl.searchParams.get("force") === "1";
  const { data, fetchedAt } = await getXhsHot(force);
  return NextResponse.json({ hot: data, fetchedAt });
}
