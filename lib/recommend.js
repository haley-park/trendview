// 구독 계정 기반 추천 — 플랫폼별 큐레이션 풀에서, 구독 중인 계정과
// 관심사(태그)가 겹치는 미구독 계정을 추천한다.

export const ACCOUNT_POOL = {
  reels: [
    { name: "openai", tags: ["ai"] },
    { name: "runwayapp", tags: ["ai", "video"] },
    { name: "pika_labs", tags: ["ai", "video"] },
    { name: "lumalabsai", tags: ["ai", "video"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "klingai_official", tags: ["ai", "video"] },
    { name: "heygen_official", tags: ["ai", "video"] },
    { name: "higgsfield.ai", tags: ["ai", "video"] },
    { name: "googledeepmind", tags: ["ai"] },
    { name: "anthropic", tags: ["ai"] },
    { name: "stabilityai", tags: ["ai", "art"] },
    { name: "leonardo.ai", tags: ["ai", "art"] },
    { name: "krea.ai", tags: ["ai", "art"] },
    { name: "elevenlabsio", tags: ["ai", "audio"] },
    { name: "meta.ai", tags: ["ai"] },
    { name: "nvidia", tags: ["ai", "tech"] },
    { name: "adobe", tags: ["tech", "art"] },
    { name: "canva", tags: ["tech", "art"] },
    { name: "zachking", tags: ["creator", "video"] },
    { name: "mrbeast", tags: ["creator"] },
    { name: "natgeo", tags: ["creator", "travel"] },
    { name: "nasa", tags: ["tech", "edu"] },
  ],
  x: [
    { name: "OpenAI", tags: ["ai"] },
    { name: "runwayml", tags: ["ai", "video"] },
    { name: "Kling_ai", tags: ["ai", "video"] },
    { name: "GoogleDeepMind", tags: ["ai"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "LumaLabsAI", tags: ["ai", "video"] },
    { name: "pika_labs", tags: ["ai", "video"] },
    { name: "heygen_com", tags: ["ai", "video"] },
    { name: "elevenlabsio", tags: ["ai", "audio"] },
    { name: "AIatMeta", tags: ["ai"] },
    { name: "AnthropicAI", tags: ["ai"] },
    { name: "xai", tags: ["ai"] },
    { name: "MistralAI", tags: ["ai"] },
    { name: "StabilityAI", tags: ["ai", "art"] },
    { name: "krea_ai", tags: ["ai", "art"] },
    { name: "freepik", tags: ["ai", "art"] },
    { name: "higgsfield_ai", tags: ["ai", "video"] },
    { name: "hailuo_ai", tags: ["ai", "video"] },
    { name: "Alibaba_Wan", tags: ["ai", "video"] },
    { name: "sama", tags: ["ai", "people"] },
    { name: "karpathy", tags: ["ai", "people"] },
    { name: "ylecun", tags: ["ai", "people"] },
  ],
  threads: [
    { name: "openai", tags: ["ai"] },
    { name: "runway", tags: ["ai", "video"] },
    { name: "google", tags: ["tech"] },
    { name: "meta.ai", tags: ["ai"] },
    { name: "zuck", tags: ["ai", "people"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "nvidia", tags: ["ai", "tech"] },
    { name: "microsoft", tags: ["tech"] },
    { name: "github", tags: ["tech"] },
    { name: "adobe", tags: ["tech", "art"] },
  ],
  tiktok: [
    { name: "openai", tags: ["ai"] },
    { name: "runwayapp", tags: ["ai", "video"] },
    { name: "krea.ai", tags: ["ai", "art"] },
    { name: "elevenlabs", tags: ["ai", "audio"] },
    { name: "sora", tags: ["ai", "video"] },
    { name: "zachking", tags: ["creator", "video"] },
    { name: "khaby.lame", tags: ["creator"] },
    { name: "google", tags: ["tech"] },
    { name: "mrbeast", tags: ["creator"] },
    { name: "nvidia", tags: ["ai", "tech"] },
    { name: "adobe", tags: ["tech", "art"] },
    { name: "canva", tags: ["tech", "art"] },
    { name: "duolingo", tags: ["creator", "edu"] },
    { name: "nasa", tags: ["tech", "edu"] },
  ],
};

// 계정 태그 → 추천 검색 키워드 (키워드 기반 영상 추천에 사용)
export const TAG_KEYWORDS = {
  ai: { ko: "AI 영상 생성", en: "AI video generation", zh: "AI 视频 生成", ja: "AI動画 生成" },
  video: { ko: "AI 필름메이킹", en: "AI filmmaking", zh: "AI 短片", ja: "AI 映像制作" },
  art: { ko: "AI 아트", en: "AI art", zh: "AI 绘画", ja: "AIアート" },
  audio: { ko: "AI 음성 합성", en: "AI voice", zh: "AI 配音", ja: "AI 音声" },
  tech: { ko: "테크 리뷰", en: "tech review", zh: "科技 测评", ja: "ガジェット レビュー" },
  creator: { ko: "크리에이터 브이로그", en: "creator vlog", zh: "创作者 vlog", ja: "クリエイター vlog" },
  edu: { ko: "지식 교양", en: "educational", zh: "知识 科普", ja: "教養 解説" },
  travel: { ko: "여행", en: "travel", zh: "旅行", ja: "旅行" },
  people: { ko: "AI 인터뷰", en: "AI interview", zh: "AI 访谈", ja: "AI インタビュー" },
};

// 구독 목록과 태그가 겹치는 미구독 계정을 점수순으로 추천
export function recommendAccounts(platform, subscribed, limit = 8) {
  const pool = ACCOUNT_POOL[platform] || [];
  const subLower = new Set(subscribed.map((s) => s.toLowerCase()));
  const tagScore = {};
  for (const acc of pool) {
    if (subLower.has(acc.name.toLowerCase())) {
      for (const t of acc.tags) tagScore[t] = (tagScore[t] || 0) + 1;
    }
  }
  const scored = pool
    .filter((acc) => !subLower.has(acc.name.toLowerCase()))
    .map((acc) => ({
      ...acc,
      score: acc.tags.reduce((s, t) => s + (tagScore[t] || 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// 구독 계정 태그 + 최근 검색어 → 추천 검색 키워드 목록
export function recommendKeywords(lang, recentSearches, subscriptions) {
  const keywords = [];
  const seen = new Set();
  for (const kw of (recentSearches || []).slice(0, 4)) {
    const k = kw.trim();
    if (k && !seen.has(k.toLowerCase())) {
      seen.add(k.toLowerCase());
      keywords.push(k);
    }
  }
  const tagCount = {};
  for (const [platform, subs] of Object.entries(subscriptions || {})) {
    const pool = ACCOUNT_POOL[platform] || [];
    const subLower = new Set((subs || []).map((s) => s.toLowerCase()));
    for (const acc of pool) {
      if (subLower.has(acc.name.toLowerCase())) {
        for (const t of acc.tags) tagCount[t] = (tagCount[t] || 0) + 1;
      }
    }
  }
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [tag] of topTags) {
    const kw = TAG_KEYWORDS[tag]?.[lang] || TAG_KEYWORDS[tag]?.ko;
    if (kw && !seen.has(kw.toLowerCase())) {
      seen.add(kw.toLowerCase());
      keywords.push(kw);
    }
  }
  if (!keywords.length) {
    const fallback = TAG_KEYWORDS.ai[lang] || TAG_KEYWORDS.ai.ko;
    keywords.push(fallback);
  }
  return keywords.slice(0, 5);
}
