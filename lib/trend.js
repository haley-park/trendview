// 트렌드 뷰어 서버 로직 — 원본 server.py를 Next.js(Node)로 포팅.
// 모든 외부 API는 무인증 공개 엔드포인트만 사용합니다.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const CACHE_TTL = 3600 * 1000; // 1시간

// 서버리스 인스턴스 생존 동안 유지되는 메모리 캐시
const g = globalThis;
if (!g.__tvCache) g.__tvCache = new Map();

export async function cached(key, force, fn) {
  const now = Date.now();
  const hit = g.__tvCache.get(key);
  if (hit && !force && now - hit.at < CACHE_TTL) {
    return { data: hit.data, fetchedAt: hit.at / 1000 };
  }
  const data = await fn();
  const at = Date.now();
  g.__tvCache.set(key, { at, data });
  return { data, fetchedAt: at / 1000 };
}

async function httpGet(url, { payload, headers, timeout = 15000, method } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: method || (payload !== undefined ? "POST" : "GET"),
      headers: {
        "User-Agent": UA,
        ...(payload !== undefined && typeof payload !== "string"
          ? { "Content-Type": "application/json" }
          : {}),
        ...(headers || {}),
      },
      body:
        payload === undefined
          ? undefined
          : typeof payload === "string"
            ? payload
            : JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function httpJSON(url, opts) {
  const res = await httpGet(url, opts);
  return res.json();
}

async function httpText(url, opts) {
  const res = await httpGet(url, opts);
  return res.text();
}

// ================================================================ 로케일
export const LOCALES = {
  ko: { hl: "ko", gl: "KR", tiktokRegion: "KR" },
  en: { hl: "en", gl: "US", tiktokRegion: "US" },
  zh: { hl: "zh-CN", gl: "TW", tiktokRegion: "TW" },
  ja: { hl: "ja", gl: "JP", tiktokRegion: "JP" },
  es: { hl: "es", gl: "MX", tiktokRegion: "MX" },
};

// 카테고리 id → 언어별 유튜브 검색어
export const CATEGORY_QUERIES = {
  food: { ko: "먹방", en: "mukbang food", zh: "吃播 美食", ja: "モッパン 大食い", es: "mukbang comida" },
  beauty: { ko: "뷰티 메이크업 패션", en: "beauty makeup fashion", zh: "美妆 穿搭", ja: "メイク 美容", es: "belleza maquillaje moda" },
  vlog: { ko: "브이로그", en: "vlog", zh: "vlog 日常", ja: "vlog 日常", es: "vlog en español" },
  fun: { ko: "예능 웃긴 영상", en: "comedy funny videos", zh: "搞笑 综艺", ja: "お笑い 面白", es: "comedia videos graciosos" },
  movie: { ko: "영화 드라마 리뷰", en: "movie drama review", zh: "电影 电视剧 解说", ja: "映画 ドラマ 考察", es: "película serie reseña" },
  tech: { ko: "테크 리뷰", en: "tech review", zh: "科技 测评", ja: "ガジェット レビュー", es: "tecnología review" },
  edu: { ko: "지식 교양", en: "educational explained", zh: "知识 科普", ja: "教養 解説", es: "educativo explicado" },
  travel: { ko: "여행", en: "travel", zh: "旅行", ja: "旅行", es: "viajes" },
  china: { ko: "중국 근황 중국 여행", en: "china vlog china travel", zh: "中国 生活 旅行", ja: "中国 旅行 生活", es: "china viaje vlog" },
  expat: { ko: "해외생활 브이로그 이민", en: "living abroad expat vlog", zh: "海外生活 移民 vlog", ja: "海外生活 移住 vlog", es: "vida en el extranjero expat" },
  animal: { ko: "강아지 고양이", en: "dog cat pets", zh: "狗 猫 宠物", ja: "犬 猫", es: "perros gatos mascotas" },
};

export const AI_YT_QUERIES = {
  ko: ["AI 영상 제작", "AI 영상 생성", "sora ai video", "runway kling veo"],
  en: ["AI video generation", "AI filmmaking", "sora ai video", "runway kling veo"],
  zh: ["AI 视频 生成", "AI 影片", "sora ai video", "runway kling veo"],
  ja: ["AI動画 生成", "AI映像", "sora ai video", "runway kling veo"],
  es: ["video generado por IA", "IA video", "sora ai video", "runway kling veo"],
};

// "전체" 탭에서 합칠 카테고리
const ALL_MERGE = ["food", "vlog", "fun", "beauty", "movie", "travel"];

const PERIOD_CODE = { day: 2, week: 3, month: 4 };

// 검색 결과에 끼어드는 추천 영상이 기간 필터를 우회하는 경우를 게시일 문구로 필터링
const PERIOD_EXCLUDE = {
  ko: {
    day: ["일 전", "주 전", "개월 전", "년 전"],
    week: ["주 전", "개월 전", "년 전"],
    month: ["개월 전", "년 전"],
  },
  en: {
    day: ["day ago", "days ago", "week ago", "weeks ago", "month ago", "months ago", "year ago", "years ago"],
    week: ["week ago", "weeks ago", "month ago", "months ago", "year ago", "years ago"],
    month: ["month ago", "months ago", "year ago", "years ago"],
  },
  zh: {
    day: ["天前", "周前", "週前", "个月前", "年前"],
    week: ["周前", "週前", "个月前", "年前"],
    month: ["个月前", "年前"],
  },
  ja: {
    day: ["日前", "週間前", "か月前", "ヶ月前", "年前"],
    week: ["週間前", "か月前", "ヶ月前", "年前"],
    month: ["か月前", "ヶ月前", "年前"],
  },
  es: {
    day: ["día", "semana", "mes", "año"],
    week: ["semana", "mes", "año"],
    month: ["mes", "año"],
  },
};

function withinPeriod(published, period, lang) {
  if (!published) return true;
  const words = (PERIOD_EXCLUDE[lang] || PERIOD_EXCLUDE.ko)[period] || [];
  return !words.some((w) => published.includes(w));
}

// ================================================================ 유튜브
function buildSearchParams(period, shorts) {
  // 정렬=조회수(3) + 필터(업로드날짜/동영상/길이) protobuf
  let filters = [0x08, PERIOD_CODE[period] || 3, 0x10, 0x01];
  if (shorts) filters = filters.concat([0x18, 0x01]);
  const raw = Buffer.from([0x08, 0x03, 0x12, filters.length, ...filters]);
  return raw.toString("base64url");
}

function parseViewCount(text) {
  const digits = (text || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function extractVideos(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) extractVideos(item, out);
  } else if (node && typeof node === "object") {
    if (node.videoRenderer) {
      const v = node.videoRenderer;
      const title = (v.title?.runs || []).map((r) => r.text || "").join("");
      const viewsText = v.viewCountText?.simpleText || "";
      const thumbs = v.thumbnail?.thumbnails || [];
      out.push({
        id: v.videoId || "",
        title,
        channel: (v.ownerText?.runs || []).map((r) => r.text || "").join(""),
        views: parseViewCount(viewsText),
        viewsText,
        length: v.lengthText?.simpleText || "",
        published: v.publishedTimeText?.simpleText || "",
        thumbnail: thumbs.length ? thumbs[thumbs.length - 1].url : "",
      });
    }
    for (const value of Object.values(node)) extractVideos(value, out);
  }
}

async function ytSearch(query, period, shorts, lang) {
  const loc = LOCALES[lang] || LOCALES.ko;
  const payload = {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20250624.01.00",
        hl: loc.hl,
        gl: loc.gl,
      },
    },
    query,
    params: buildSearchParams(period, shorts),
  };
  let data;
  try {
    data = await httpJSON("https://www.youtube.com/youtubei/v1/search", { payload });
  } catch {
    return [];
  }
  const videos = [];
  extractVideos(data, videos);
  const seen = new Set();
  const unique = [];
  for (const v of videos) {
    if (v.id && !seen.has(v.id) && withinPeriod(v.published, period, lang)) {
      seen.add(v.id);
      unique.push(v);
    }
  }
  return unique;
}

const LIKE_PATTERNS = [
  /다른 사용자 ([0-9,]+)명/, // ko
  /along with ([0-9,]+) other/, // en
  /他 ?([0-9,]+) ?人/, // ja
  /以及其他 ?([0-9,]+) ?位/, // zh
  /a ([0-9.,]+) personas más/, // es
];

async function ytLikeCount(videoId, lang) {
  const loc = LOCALES[lang] || LOCALES.ko;
  const payload = {
    context: { client: { clientName: "WEB", clientVersion: "2.20250624.01.00", hl: loc.hl, gl: loc.gl } },
    videoId,
  };
  try {
    const s = await httpText("https://www.youtube.com/youtubei/v1/next", { payload, timeout: 10000 });
    for (const re of LIKE_PATTERNS) {
      const m = s.match(re);
      if (m) return parseInt(m[1].replace(/,/g, ""), 10) + 1;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function enrichLikes(videos, lang, limit = 45) {
  const todo = videos.slice(0, limit).filter((v) => !v.likes);
  if (!todo.length) return videos;
  const counts = await mapPool(todo, 12, (v) => ytLikeCount(v.id, lang));
  todo.forEach((v, i) => (v.likes = counts[i]));
  return videos;
}

async function mergeYtSearches(queries, period, shorts, lang) {
  const results = await mapPool(queries, 6, (q) => ytSearch(q, period, shorts, lang));
  const merged = [];
  const seen = new Set();
  for (const chunk of results) {
    for (const v of chunk) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        merged.push(v);
      }
    }
  }
  merged.sort((a, b) => b.views - a.views);
  return merged;
}

export async function getVideos({ category, period, shorts, force, enrich, query, lang }) {
  const fetchFn = async () => {
    let queries;
    if (query) queries = [query];
    else if (category === "all") queries = ALL_MERGE.map((c) => CATEGORY_QUERIES[c][lang] || CATEGORY_QUERIES[c].ko);
    else if (category === "ai") queries = AI_YT_QUERIES[lang] || AI_YT_QUERIES.ko;
    else {
      const cq = CATEGORY_QUERIES[category];
      queries = [cq ? cq[lang] || cq.ko : category];
    }
    const vids = await mergeYtSearches(queries, period, shorts, lang);
    if (enrich) await enrichLikes(vids, lang);
    return vids;
  };
  return cached(`yt:${query || category}:${period}:${shorts}:${enrich}:${lang}`, force, fetchFn);
}

// ================================================================ 인스타그램 릴스
const IG_APP_ID = "936619743392459";

export const DEFAULT_IG_ACCOUNTS = [
  "openai", "runwayapp", "pika_labs", "lumalabsai", "midjourney",
  "klingai_official", "heygen_official", "higgsfield.ai", "googledeepmind",
];

async function fetchIgProfile(username) {
  const url =
    "https://www.instagram.com/api/v1/users/web_profile_info/?username=" +
    encodeURIComponent(username);
  let data = null;
  for (let i = 0; i < 2 && !data; i++) {
    try {
      data = await httpJSON(url, { headers: { "x-ig-app-id": IG_APP_ID }, timeout: 12000 });
    } catch {
      await new Promise((r) => setTimeout(r, 800 + i * 700));
    }
  }
  if (!data) return { reels: [], followers: 0 };
  const user = data?.data?.user || {};
  const followers = user?.edge_followed_by?.count || 0;
  const reels = [];
  for (const edge of user?.edge_owner_to_timeline_media?.edges || []) {
    const n = edge.node || {};
    if (!n.is_video) continue;
    const caps = n.edge_media_to_caption?.edges || [];
    const title = caps.length ? caps[0].node.text.split("\n")[0].slice(0, 120) : "";
    reels.push({
      account: username,
      title: title || "",
      views: n.video_view_count || 0,
      likes: n.edge_liked_by?.count || 0,
      comments: n.edge_media_to_comment?.count || 0,
      thumbnail: n.thumbnail_src || "",
      url: `https://www.instagram.com/reel/${n.shortcode || ""}/`,
      takenAt: n.taken_at_timestamp || 0,
      followers,
    });
  }
  return { reels, followers };
}

export async function getReels(accounts, force) {
  const fetchFn = async () => {
    const results = await mapPool(accounts, 6, (a) => fetchIgProfile(a));
    const reels = results.flatMap((r) => r.reels);
    reels.sort((a, b) => b.views - a.views);
    const accountStats = accounts.map((a, i) => {
      const r = results[i];
      const eng = r.reels.reduce((s, x) => s + (x.likes || 0) + (x.comments || 0), 0);
      const avg = r.reels.length ? eng / r.reels.length : 0;
      return {
        account: a,
        followers: r.followers,
        avgEngagement: Math.round(avg),
        rate: r.followers > 0 ? avg / r.followers : 0,
      };
    });
    return { reels, accountStats };
  };
  return cached(`reels:${accounts.join(",")}`, force, fetchFn);
}

// ================================================================ X (트위터)
export const DEFAULT_X_ACCOUNTS = [
  "OpenAI", "runwayml", "Kling_ai", "GoogleDeepMind", "midjourney",
  "LumaLabsAI", "pika_labs", "heygen_com", "elevenlabsio", "AIatMeta",
];

function findTimelineEntries(node) {
  if (Array.isArray(node)) {
    for (const v of node) {
      const r = findTimelineEntries(v);
      if (r) return r;
    }
  } else if (node && typeof node === "object") {
    const tl = node.timeline;
    if (tl && typeof tl === "object" && Array.isArray(tl.entries)) return tl.entries;
    for (const v of Object.values(node)) {
      const r = findTimelineEntries(v);
      if (r) return r;
    }
  }
  return null;
}

// r.jina.ai 무료 리더 — 데이터센터 IP 차단을 우회해 대상 페이지를 대신 렌더링/반환
const JINA_BASE = "https://r.jina.ai/";

async function jinaText(targetUrl, format, timeout = 30000) {
  const headers = { Accept: "text/plain" };
  if (format === "html") headers["X-Return-Format"] = "html";
  return httpText(JINA_BASE + targetUrl, { headers, timeout });
}

function parseXHtml(html, username) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return [];
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return [];
  }
  const entries = findTimelineEntries(data) || [];
  const posts = [];
  for (const e of entries) {
    const content = (e && e.content) || {};
    let t = content.tweet;
    if (!t || typeof t !== "object") {
      const tr = content.tweetResult || {};
      t = tr.result;
    }
    if (!t || typeof t !== "object" || t.favorite_count == null) continue;
    const user = typeof t.user === "object" && t.user ? t.user : {};
    let media = "";
    for (const mm of t.mediaDetails || []) {
      if (mm.media_url_https) {
        media = mm.media_url_https;
        break;
      }
    }
    posts.push({
      account: username,
      name: user.name || username,
      followers: user.followers_count || 0,
      text: (t.full_text || t.text || "").trim(),
      likes: t.favorite_count || 0,
      replies: t.reply_count || 0,
      retweets: t.retweet_count || 0,
      views: typeof t.views === "object" && t.views ? parseInt(t.views.count || 0, 10) || 0 : 0,
      media,
      url: `https://x.com/${username}/status/${t.id_str || ""}`,
      createdAt: t.created_at || "",
    });
  }
  return posts;
}

async function fetchXPosts(username) {
  const url =
    "https://syndication.twitter.com/srv/timeline-profile/screen-name/" +
    encodeURIComponent(username);
  try {
    const html = await httpText(url, { headers: { Accept: "text/html" }, timeout: 12000 });
    const posts = parseXHtml(html, username);
    if (posts.length) return posts;
  } catch {}
  return [];
}

async function fetchXPostsViaJina(username) {
  const url =
    "https://syndication.twitter.com/srv/timeline-profile/screen-name/" +
    encodeURIComponent(username);
  try {
    const html = await jinaText(url, "html", 28000);
    return parseXHtml(html, username);
  } catch {
    return [];
  }
}

export async function getXPosts(accounts, force) {
  const fetchFn = async () => {
    // 1차: syndication 직접 호출 (동시 요청이 많으면 빈 응답 → 동시성 3)
    const results = await mapPool(accounts, 3, (a) => fetchXPosts(a));
    let posts = results.flat();
    if (posts.length) return posts;
    // 2차: 데이터센터 IP 차단 시 Jina 리더 경유 (계정 수 제한으로 시간 확보)
    const subset = accounts.slice(0, 6);
    const viaJina = await mapPool(subset, 3, (a) => fetchXPostsViaJina(a));
    return viaJina.flat();
  };
  return cached(`x:${accounts.join(",")}`, force, fetchFn);
}

// ================================================================ 스레드(Threads)
export const DEFAULT_THREADS_ACCOUNTS = ["openai", "runway", "google", "meta.ai", "zuck"];
const IG_APP_ID_THREADS = "238260118697367";
const THREADS_DOC_IDS = [
  "25073444226023094", "7451607104958938", "23996318550159868",
  "9925907010825989", "26286467210919721",
];

async function threadsLsdAndUserId(username) {
  let lsd = null;
  try {
    const body = await httpText("https://www.threads.com/@" + encodeURIComponent(username), { timeout: 12000 });
    const m = body.match(/"LSD",\[\],\{"token":"([^"]+)"/);
    lsd = m ? m[1] : null;
  } catch {}
  let userId = null;
  try {
    const info = await httpJSON(
      "https://www.instagram.com/api/v1/users/web_profile_info/?username=" + encodeURIComponent(username),
      { headers: { "x-ig-app-id": IG_APP_ID }, timeout: 12000 }
    );
    userId = info?.data?.user?.id || null;
  } catch {}
  return [lsd, userId];
}

function parseThreads(data, username) {
  const posts = [];
  function walk(o) {
    if (Array.isArray(o)) {
      for (const v of o) walk(v);
    } else if (o && typeof o === "object") {
      if (o.post && typeof o.post === "object" && o.post.caption !== undefined && o.post.caption !== null) {
        const p = o.post;
        const caption = typeof p.caption === "object" && p.caption ? p.caption.text || "" : "";
        const info = p.text_post_app_info || {};
        const imgs = p.image_versions2?.candidates || [];
        posts.push({
          account: username,
          text: caption.slice(0, 280),
          likes: p.like_count || 0,
          replies: info.direct_reply_count || 0,
          reposts: info.repost_count || 0,
          views: 0,
          media: imgs.length ? imgs[0].url : "",
          url: `https://www.threads.com/@${username}/post/${p.code || ""}`,
          createdAt: p.taken_at || 0,
        });
      }
      for (const v of Object.values(o)) walk(v);
    }
  }
  walk(data);
  return posts;
}

async function fetchThreadsPosts(username) {
  const [lsd, userId] = await threadsLsdAndUserId(username);
  if (!lsd || !userId) return [];
  for (const docId of THREADS_DOC_IDS) {
    const payload = new URLSearchParams({
      lsd,
      doc_id: docId,
      variables: JSON.stringify({
        userID: String(userId),
        __relay_internal__pv__BarcelonaIsLoggedInrelayprovider: false,
      }),
    }).toString();
    let data;
    try {
      data = await httpJSON("https://www.threads.com/api/graphql", {
        payload,
        headers: {
          "X-FB-LSD": lsd,
          "X-IG-App-ID": IG_APP_ID_THREADS,
          "Sec-Fetch-Site": "same-origin",
          "X-FB-Friendly-Name": "BarcelonaProfileThreadsTabQuery",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 12000,
      });
    } catch {
      continue;
    }
    if (data.errors) continue;
    const posts = parseThreads(data, username);
    if (posts.length) return posts;
  }
  return [];
}

// "1.2K" / "1,234" / "3.4M" 형태의 참여수 문자열 파싱
function parseCompactNum(s) {
  const m = String(s).trim().match(/^([\d.,]+)\s*([KMB만억])?$/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (isNaN(n)) return null;
  const mul = { K: 1e3, M: 1e6, B: 1e9, "만": 1e4, "억": 1e8 }[(m[2] || "").toUpperCase()] || 1;
  return Math.round(n * mul);
}

// Jina 리더가 렌더링한 스레드 프로필 마크다운에서 글·참여수 추출.
// 패턴: [6h](https://www.threads.com/@user/post/CODE) → 본문 → 숫자 4줄(좋아요·답글·리포스트·공유)
function parseThreadsMarkdown(md, username) {
  const posts = [];
  const re = new RegExp(
    "\\[[^\\]]{1,12}\\]\\(https://www\\.threads\\.com/@" +
    username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
    "/post/([A-Za-z0-9_-]+)\\)", "g");
  const matches = [...md.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const code = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : md.length;
    const block = md.slice(start, end);
    const lines = block.split("\n").map((l) => l.trim());
    const textLines = [];
    const nums = [];
    let media = "";
    for (const line of lines) {
      if (!line) continue;
      const img = line.match(/^!\[Image \d+[^\]]*\]\((https:\/\/[^)]+)\)/);
      if (img) {
        if (!media && !/profile picture/i.test(line)) media = img[1];
        continue;
      }
      if (/^Sorry, we're having trouble/.test(line)) continue;
      if (/^\[Learn more\]/.test(line) || /^\[Translate\]/i.test(line)) continue;
      const n = parseCompactNum(line);
      if (n !== null) {
        nums.push(n);
        continue;
      }
      if (/^\[?!?\[Image/.test(line)) continue;
      if (nums.length === 0 && textLines.length < 8) {
        // 링크 마크다운은 라벨만 남긴다
        textLines.push(line.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"));
      }
    }
    const text = textLines.join("\n").trim();
    if (!text && !media) continue;
    posts.push({
      account: username,
      text: text.slice(0, 280),
      likes: nums[0] || 0,
      replies: nums[1] || 0,
      reposts: nums[2] || 0,
      views: 0,
      media,
      url: `https://www.threads.com/@${username}/post/${code}`,
      createdAt: 0,
    });
  }
  return posts;
}

async function fetchThreadsViaJina(username) {
  try {
    const md = await jinaText("https://www.threads.com/@" + encodeURIComponent(username), "markdown", 28000);
    return parseThreadsMarkdown(md, username);
  } catch {
    return [];
  }
}

export async function getThreadsPosts(accounts, force) {
  const fetchFn = async () => {
    // 1차: 무인증 GraphQL 직접 조회
    const results = await mapPool(accounts, 5, (a) => fetchThreadsPosts(a));
    let posts = results.flat();
    if (posts.length) return posts;
    // 2차: Jina 리더가 렌더링한 프로필 페이지 파싱
    const viaJina = await mapPool(accounts.slice(0, 5), 3, (a) => fetchThreadsViaJina(a));
    return viaJina.flat();
  };
  return cached(`threads:${accounts.join(",")}`, force, fetchFn);
}

// ================================================================ 틱톡(TikTok)
export const DEFAULT_TIKTOK_ACCOUNTS = [
  "openai", "runwayapp", "krea.ai", "elevenlabs", "sora",
  "zachking", "khaby.lame", "google",
];
const TIKWM_BASE = "https://www.tikwm.com/api";

function tiktokItem(v) {
  const author = typeof v.author === "object" && v.author ? v.author : {};
  const handle = String(author.unique_id || "");
  const vid = v.video_id || "";
  return {
    account: handle,
    name: author.nickname || handle,
    title: (v.title || "").trim(),
    views: v.play_count || 0,
    likes: v.digg_count || 0,
    comments: v.comment_count || 0,
    shares: v.share_count || 0,
    thumbnail: v.cover || v.origin_cover || "",
    url: `https://www.tiktok.com/@${handle}/video/${vid}`,
    id: vid,
    createdAt: v.create_time || 0,
  };
}

// tikwm 무료 티어는 초당 1회 제한(code:-1) — 실패 시 잠시 대기 후 재시도
async function tikwmJSON(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const d = await httpJSON(url, { timeout: 15000 });
      if (d && d.code === 0) return d;
    } catch {}
    await new Promise((r) => setTimeout(r, 1100 + i * 500));
  }
  return null;
}

async function fetchTiktokUser(handle) {
  const d = await tikwmJSON(`${TIKWM_BASE}/user/posts?unique_id=${encodeURIComponent(handle)}&count=12`);
  return (d?.data?.videos || []).map(tiktokItem);
}

async function fetchTiktokUserInfo(handle) {
  const d = await tikwmJSON(`${TIKWM_BASE}/user/info?unique_id=${encodeURIComponent(handle)}`);
  return d?.data?.stats?.followerCount || 0;
}

async function fetchTiktokTrending(region) {
  const d = await tikwmJSON(`${TIKWM_BASE}/feed/list?region=${region}&count=20`);
  return (d?.data || []).map(tiktokItem);
}

export async function getTiktok(accounts, region, force) {
  const fetchFn = async () => {
    // 트렌딩 + 구독 계정 최신 영상 병합. 무료 티어 레이트리밋 회피용 동시성 3
    const posts = await fetchTiktokTrending(region);
    const chunks = await mapPool(accounts, 2, (a) => fetchTiktokUser(a));
    for (const c of chunks) posts.push(...c);
    const followerCounts = await mapPool(accounts, 2, (a) => fetchTiktokUserInfo(a));
    const followerMap = {};
    accounts.forEach((a, i) => (followerMap[a.toLowerCase()] = followerCounts[i]));
    const seen = new Set();
    const unique = [];
    for (const p of posts) {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        p.followers = followerMap[String(p.account || "").toLowerCase()] || 0;
        unique.push(p);
      }
    }
    const accountStats = accounts.map((a, i) => {
      const mine = unique.filter((p) => (p.account || "").toLowerCase() === a.toLowerCase());
      const eng = mine.reduce((s, x) => s + (x.likes || 0) + (x.comments || 0), 0);
      const avg = mine.length ? eng / mine.length : 0;
      return {
        account: a,
        followers: followerCounts[i],
        avgEngagement: Math.round(avg),
        rate: followerCounts[i] > 0 ? avg / followerCounts[i] : 0,
      };
    });
    return { posts: unique, accountStats };
  };
  return cached(`tiktok:${region}:${accounts.join(",")}`, force, fetchFn);
}

// ================================================================ 샤오홍슈(小红书)
export const DEFAULT_XHS_ACCOUNTS = [
  "OpenAI", "Runway", "可灵KLING", "即梦AI", "MiniMax", "通义万相", "海螺AI", "剪映",
];

export async function getXhsHot(force) {
  const fetchFn = async () => {
    // 1순위: 60s API (Cloudflare Workers, 무료 공개)
    try {
      const d = await httpJSON("https://60s.viki.moe/v2/rednote", { timeout: 12000 });
      const items = (d?.data || []).map((it) => ({
        rank: it.rank,
        title: it.title,
        score: it.score || "",
        type: it.word_type || "",
        link:
          it.link ||
          "https://www.xiaohongshu.com/search_result?keyword=" + encodeURIComponent(it.title),
      }));
      if (items.length) return items;
    } catch {}
    // 2순위: vvhan hotlist API
    try {
      const d = await httpJSON("https://api.vvhan.com/api/hotlist/xhs", { timeout: 12000 });
      const items = (d?.data || []).map((it, i) => ({
        rank: i + 1,
        title: it.title,
        score: String(it.hot || ""),
        type: "",
        link:
          it.url ||
          "https://www.xiaohongshu.com/search_result?keyword=" + encodeURIComponent(it.title),
      }));
      if (items.length) return items;
    } catch {}
    return [];
  };
  return cached("xhs:hot", force, fetchFn);
}

// ================================================================ AI 소식
const NEWS_FEEDS = {
  ko: [
    ["local", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('AI 영상 생성 OR "AI 비디오" OR 영상생성모델') + "&hl=ko&gl=KR&ceid=KR:ko"],
    ["global", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"AI video" model OR Sora OR Runway OR Kling OR Veo') + "&hl=en-US&gl=US&ceid=US:en"],
  ],
  en: [
    ["local", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"AI video" generation OR Sora OR Runway OR Kling OR Veo') + "&hl=en-US&gl=US&ceid=US:en"],
    ["global", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"generative video" OR "text to video" model') + "&hl=en-US&gl=US&ceid=US:en"],
  ],
  zh: [
    ["local", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('AI 视频 生成 OR 可灵 OR 即梦 OR Sora') + "&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"],
    ["global", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"AI video" model OR Sora OR Runway OR Kling OR Veo') + "&hl=en-US&gl=US&ceid=US:en"],
  ],
  ja: [
    ["local", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('AI動画 生成 OR Sora OR Runway OR 動画生成AI') + "&hl=ja&gl=JP&ceid=JP:ja"],
    ["global", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"AI video" model OR Sora OR Runway OR Kling OR Veo') + "&hl=en-US&gl=US&ceid=US:en"],
  ],
  es: [
    ["local", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('video IA generación OR "inteligencia artificial" video OR Sora OR Runway') + "&hl=es-419&gl=MX&ceid=MX:es-419"],
    ["global", "https://news.google.com/rss/search?q=" +
      encodeURIComponent('"AI video" model OR Sora OR Runway OR Kling OR Veo') + "&hl=en-US&gl=US&ceid=US:en"],
  ],
};

function parseRssItems(xml, label) {
  const items = [];
  const blocks = xml.split("<item>").slice(1);
  for (const block of blocks.slice(0, 25)) {
    const pick = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      if (!m) return "";
      return m[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim();
    };
    const pub = pick("pubDate");
    let ts = 0;
    if (pub) {
      const d = new Date(pub);
      if (!isNaN(d)) ts = d.getTime() / 1000;
    }
    items.push({ region: label, title: pick("title"), source: pick("source"), link: pick("link"), ts });
  }
  return items;
}

async function fetchNews(lang) {
  const feeds = NEWS_FEEDS[lang] || NEWS_FEEDS.ko;
  const results = await Promise.all(
    feeds.map(async ([label, url]) => {
      try {
        const xml = await httpText(url, { timeout: 12000 });
        return parseRssItems(xml, label);
      } catch {
        return [];
      }
    })
  );
  const merged = results.flat();
  merged.sort((a, b) => b.ts - a.ts);
  return merged.slice(0, 40);
}

const HF_PIPELINES = ["text-to-video", "image-to-video"];

async function fetchHfModels() {
  const jobs = [];
  for (const p of HF_PIPELINES) for (const s of ["createdAt", "trendingScore"]) jobs.push([p, s]);
  const results = await Promise.all(
    jobs.map(async ([pipeline, sort]) => {
      try {
        const data = await httpJSON(
          `https://huggingface.co/api/models?pipeline_tag=${pipeline}&sort=${sort}&direction=-1&limit=12`,
          { timeout: 12000 }
        );
        return data.map((m) => ({
          id: m.id || "",
          likes: m.likes || 0,
          downloads: m.downloads || 0,
          pipeline,
          createdAt: m.createdAt || "",
        }));
      } catch {
        return [];
      }
    })
  );
  const dedupe = (lists) => {
    const seen = new Set();
    const out = [];
    for (const chunk of lists)
      for (const m of chunk)
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
    return out;
  };
  const latest = dedupe([results[0], results[2]]);
  latest.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  const trending = dedupe([results[1], results[3]]);
  return { latest: latest.slice(0, 12), trending: trending.slice(0, 12) };
}

export async function getAiData(lang, force) {
  const fetchFn = async () => {
    const [news, models] = await Promise.all([fetchNews(lang), fetchHfModels()]);
    return { news, models };
  };
  return cached(`ai:${lang}`, force, fetchFn);
}

// ================================================================ 이미지 프록시 허용 호스트
export const IMG_PROXY_ALLOW = [
  ".cdninstagram.com", ".fbcdn.net", ".ytimg.com", ".googleusercontent.com",
  ".twimg.com", ".tiktokcdn.com", ".tiktokcdn-eu.com", ".tiktokcdn-us.com",
  ".xiaohongshu.com", ".xhscdn.com",
];

export { httpGet, httpJSON, httpText, UA, parseThreadsMarkdown, parseXHtml };
