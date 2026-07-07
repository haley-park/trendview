import { httpGet, IMG_PROXY_ALLOW } from "../../../lib/trend";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 인스타/틱톡 CDN 등 핫링크가 막힌 썸네일을 서버가 대신 받아 전달
export async function GET(req) {
  const url = req.nextUrl.searchParams.get("u") || "";
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {}
  if (!url.startsWith("https://") || !IMG_PROXY_ALLOW.some((h) => host.endsWith(h))) {
    return Response.json({ error: "host not allowed" }, { status: 400 });
  }
  try {
    const res = await httpGet(url, { timeout: 12000 });
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, s-maxage=86400, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "fetch failed" }, { status: 502 });
  }
}
