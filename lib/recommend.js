// 구독 계정 기반 추천 — 플랫폼별 큐레이션 풀에서, 구독 중인 계정과
// 관심사(태그)가 겹치는 미구독 계정을 추천한다. 풀은 각 플랫폼의 인기 계정 위주.

export const ACCOUNT_POOL = {
  reels: [
    // 글로벌 인기 셀럽/크리에이터
    { name: "cristiano", tags: ["celebrity", "sports"] },
    { name: "leomessi", tags: ["celebrity", "sports"] },
    { name: "selenagomez", tags: ["celebrity", "music"] },
    { name: "kyliejenner", tags: ["celebrity", "beauty"] },
    { name: "therock", tags: ["celebrity", "movie"] },
    { name: "arianagrande", tags: ["celebrity", "music"] },
    { name: "kimkardashian", tags: ["celebrity", "beauty"] },
    { name: "beyonce", tags: ["celebrity", "music"] },
    { name: "taylorswift", tags: ["celebrity", "music"] },
    { name: "zendaya", tags: ["celebrity", "movie"] },
    { name: "mrbeast", tags: ["creator"] },
    { name: "zachking", tags: ["creator", "video"] },
    { name: "khaby00", tags: ["creator"] },
    { name: "natgeo", tags: ["creator", "travel", "edu"] },
    { name: "nasa", tags: ["tech", "edu"] },
    // K-컬처
    { name: "dlwlrma", tags: ["kpop", "celebrity", "music"] },
    { name: "jennierubyjane", tags: ["kpop", "celebrity"] },
    { name: "sooyaaa__", tags: ["kpop", "celebrity"] },
    { name: "roses_are_rosie", tags: ["kpop", "celebrity"] },
    { name: "lalalalisa_m", tags: ["kpop", "celebrity"] },
    { name: "xxxibgdrgn", tags: ["kpop", "celebrity", "music"] },
    { name: "bts.bighitofficial", tags: ["kpop", "music"] },
    { name: "blackpinkofficial", tags: ["kpop", "music"] },
    // 일본
    { name: "watanabenaomi703", tags: ["celebrity", "fun"] },
    { name: "hikakin", tags: ["creator", "fun"] },
    { name: "shoheiohtani", tags: ["celebrity", "sports"] },
    { name: "kentooyamazaki", tags: ["celebrity", "movie"] },
    // 중화권
    { name: "jaychou", tags: ["celebrity", "music"] },
    { name: "gem0816", tags: ["celebrity", "music"] },
    { name: "angelababyct", tags: ["celebrity"] },
    // 스페인어권
    { name: "shakira", tags: ["celebrity", "music"] },
    { name: "badbunnypr", tags: ["celebrity", "music"] },
    { name: "jbalvin", tags: ["celebrity", "music"] },
    { name: "georginagio", tags: ["celebrity"] },
    // AI/테크
    { name: "openai", tags: ["ai"] },
    { name: "runwayapp", tags: ["ai", "video"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "googledeepmind", tags: ["ai"] },
    { name: "nvidia", tags: ["ai", "tech"] },
    { name: "anthropic", tags: ["ai"] },
  ],
  x: [
    { name: "elonmusk", tags: ["celebrity", "tech"] },
    { name: "BarackObama", tags: ["celebrity", "news"] },
    { name: "justinbieber", tags: ["celebrity", "music"] },
    { name: "rihanna", tags: ["celebrity", "music"] },
    { name: "Cristiano", tags: ["celebrity", "sports"] },
    { name: "taylorswift13", tags: ["celebrity", "music"] },
    { name: "MrBeast", tags: ["creator"] },
    { name: "NASA", tags: ["tech", "edu"] },
    { name: "BTS_twt", tags: ["kpop", "music"] },
    { name: "BLACKPINK", tags: ["kpop", "music"] },
    { name: "Stray_Kids", tags: ["kpop", "music"] },
    { name: "hikakin", tags: ["creator", "fun"] },
    { name: "livedoornews", tags: ["news"] },
    { name: "YahooNewsTopics", tags: ["news"] },
    { name: "TDR_PR", tags: ["fun", "travel"] },
    { name: "bbcchinese", tags: ["news"] },
    { name: "nytchinese", tags: ["news"] },
    { name: "shakira", tags: ["celebrity", "music"] },
    { name: "IbaiLlanos", tags: ["creator", "fun"] },
    { name: "auronplay", tags: ["creator", "fun"] },
    { name: "OpenAI", tags: ["ai"] },
    { name: "runwayml", tags: ["ai", "video"] },
    { name: "GoogleDeepMind", tags: ["ai"] },
    { name: "AnthropicAI", tags: ["ai"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "sama", tags: ["ai", "people"] },
    { name: "karpathy", tags: ["ai", "people"] },
    { name: "ylecun", tags: ["ai", "people"] },
    { name: "gdb", tags: ["ai", "people"] },
    { name: "AndrewYNg", tags: ["ai", "people"] },
    { name: "demishassabis", tags: ["ai", "people"] },
    { name: "DrJimFan", tags: ["ai", "people"] },
    { name: "_akhaliq", tags: ["ai"] },
    { name: "huggingface", tags: ["ai", "tech"] },
    { name: "MistralAI", tags: ["ai"] },
    { name: "xai", tags: ["ai"] },
  ],
  threads: [
    { name: "zuck", tags: ["celebrity", "tech", "people"] },
    { name: "mosseri", tags: ["tech", "people"] },
    { name: "instagram", tags: ["tech"] },
    { name: "netflix", tags: ["movie", "fun"] },
    { name: "nike", tags: ["sports"] },
    { name: "espn", tags: ["sports", "news"] },
    { name: "natgeo", tags: ["travel", "edu"] },
    { name: "9gag", tags: ["fun"] },
    { name: "openai", tags: ["ai"] },
    { name: "runway", tags: ["ai", "video"] },
    { name: "google", tags: ["tech"] },
    { name: "meta.ai", tags: ["ai"] },
    { name: "midjourney", tags: ["ai", "art"] },
    { name: "github", tags: ["tech"] },
  ],
  tiktok: [
    { name: "khaby.lame", tags: ["creator", "fun"] },
    { name: "charlidamelio", tags: ["creator", "celebrity"] },
    { name: "mrbeast", tags: ["creator"] },
    { name: "zachking", tags: ["creator", "video"] },
    { name: "bellapoarch", tags: ["creator", "music"] },
    { name: "therock", tags: ["celebrity", "movie"] },
    { name: "ox_zung", tags: ["creator", "fun"] },
    { name: "bts_official_bighit", tags: ["kpop", "music"] },
    { name: "blackpinkofficial", tags: ["kpop", "music"] },
    { name: "junya1gou", tags: ["creator", "fun"] },
    { name: "bayashi.tiktok", tags: ["creator", "food"] },
    { name: "kimberly.loaiza", tags: ["creator", "music"] },
    { name: "domelipa", tags: ["creator"] },
    { name: "duolingo", tags: ["creator", "edu", "fun"] },
    { name: "nasa", tags: ["tech", "edu"] },
    { name: "openai", tags: ["ai"] },
    { name: "runwayapp", tags: ["ai", "video"] },
    { name: "elevenlabs", tags: ["ai", "audio"] },
    { name: "nvidia", tags: ["ai", "tech"] },
  ],
};

// 계정 태그 → 추천 검색 키워드 (키워드 기반 영상/샤오홍슈 추천에 사용)
export const TAG_KEYWORDS = {
  ai: { ko: "AI 영상 생성", en: "AI video generation", zh: "AI 视频 生成", ja: "AI動画 生成", es: "video generado por IA" },
  video: { ko: "AI 필름메이킹", en: "AI filmmaking", zh: "AI 短片", ja: "AI 映像制作", es: "cortometraje IA" },
  art: { ko: "AI 아트", en: "AI art", zh: "AI 绘画", ja: "AIアート", es: "arte IA" },
  audio: { ko: "AI 음성 합성", en: "AI voice", zh: "AI 配音", ja: "AI 音声", es: "voz IA" },
  tech: { ko: "테크 리뷰", en: "tech review", zh: "科技 测评", ja: "ガジェット レビュー", es: "tecnología review" },
  creator: { ko: "크리에이터 브이로그", en: "creator vlog", zh: "创作者 vlog", ja: "クリエイター vlog", es: "vlog creador" },
  edu: { ko: "지식 교양", en: "educational", zh: "知识 科普", ja: "教養 解説", es: "educativo" },
  travel: { ko: "여행", en: "travel", zh: "旅行", ja: "旅行", es: "viajes" },
  people: { ko: "AI 인터뷰", en: "AI interview", zh: "AI 访谈", ja: "AI インタビュー", es: "entrevista IA" },
  kpop: { ko: "케이팝", en: "kpop", zh: "K-pop", ja: "K-POP", es: "kpop" },
  celebrity: { ko: "연예인 근황", en: "celebrity news", zh: "明星 动态", ja: "芸能人 最新", es: "famosos noticias" },
  music: { ko: "신곡 뮤직비디오", en: "new music video", zh: "新歌 MV", ja: "新曲 MV", es: "video musical nuevo" },
  sports: { ko: "스포츠 하이라이트", en: "sports highlights", zh: "体育 集锦", ja: "スポーツ ハイライト", es: "deportes resumen" },
  news: { ko: "주요 뉴스", en: "top news", zh: "热点 新闻", ja: "最新ニュース", es: "noticias destacadas" },
  fun: { ko: "웃긴 영상", en: "funny videos", zh: "搞笑 视频", ja: "面白 動画", es: "videos graciosos" },
  food: { ko: "먹방", en: "mukbang", zh: "吃播", ja: "モッパン", es: "mukbang" },
  beauty: { ko: "뷰티 메이크업", en: "beauty makeup", zh: "美妆", ja: "メイク", es: "maquillaje" },
  movie: { ko: "영화 명장면", en: "movie scenes", zh: "电影 名场面", ja: "映画 名シーン", es: "escenas de película" },
};

// 구독 목록과 태그가 겹치는 미구독 계정을 점수순으로 추천.
// 겹침이 없으면(신규 사용자) 풀 앞쪽의 인기 계정을 그대로 추천.
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
    .map((acc, i) => ({
      ...acc,
      score: acc.tags.reduce((s, t) => s + (tagScore[t] || 0), 0),
      idx: i,
    }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.slice(0, limit);
}

// 구독 계정 태그 집계 (상위 태그 반환)
function topSubscriptionTags(subscriptions, limit) {
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
  return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

// 구독 계정 태그 + 최근 검색어 → 추천 검색 키워드 목록
export function recommendKeywords(lang, recentSearches, subscriptions, limit = 5) {
  const keywords = [];
  const seen = new Set();
  const push = (k) => {
    const key = (k || "").trim();
    if (key && !seen.has(key.toLowerCase())) {
      seen.add(key.toLowerCase());
      keywords.push(key);
    }
  };
  for (const kw of (recentSearches || []).slice(0, 4)) push(kw);
  for (const tag of topSubscriptionTags(subscriptions, 4)) {
    push(TAG_KEYWORDS[tag]?.[lang] || TAG_KEYWORDS[tag]?.ko);
  }
  if (!keywords.length) push(TAG_KEYWORDS.ai[lang] || TAG_KEYWORDS.ai.ko);
  return keywords.slice(0, limit);
}

// 샤오홍슈 고정 관심 키워드 — 한국 관련은 항상 포함
const XHS_FIXED_KEYWORDS = [
  { label: { ko: "한국", en: "Korea", zh: "韩国", ja: "韓国", es: "Corea" }, query: "韩国" },
  { label: { ko: "한국 여행", en: "Korea travel", zh: "韩国旅行", ja: "韓国旅行", es: "viaje a Corea" }, query: "韩国旅行" },
];

// 샤오홍슈용 관심 키워드 — 검색어 원문 + 태그 키워드의 중국어판을 함께 제공
export function recommendXhsKeywords(lang, recentSearches, subscriptions, limit = 8) {
  const out = [];
  const seen = new Set();
  const push = (label, zh) => {
    const key = (zh || label || "").trim();
    if (key && !seen.has(key.toLowerCase())) {
      seen.add(key.toLowerCase());
      out.push({ label: label || zh, query: zh || label });
    }
  };
  for (const k of XHS_FIXED_KEYWORDS) push(k.label[lang] || k.label.ko, k.query);
  for (const kw of (recentSearches || []).slice(0, 4)) push(kw, kw);
  for (const tag of topSubscriptionTags(subscriptions, 6)) {
    const label = TAG_KEYWORDS[tag]?.[lang] || TAG_KEYWORDS[tag]?.zh;
    push(label, TAG_KEYWORDS[tag]?.zh);
  }
  if (!out.length) {
    push(TAG_KEYWORDS.ai[lang], TAG_KEYWORDS.ai.zh);
    push(TAG_KEYWORDS.beauty[lang], TAG_KEYWORDS.beauty.zh);
    push(TAG_KEYWORDS.travel[lang], TAG_KEYWORDS.travel.zh);
  }
  return out.slice(0, limit);
}
