// 언어(지역)별 기본 구독 계정 — 각 지역에서 팔로워가 많은 인기인 위주.
// 사용자가 직접 수정하기 전까지는 선택한 언어의 목록이 적용된다.

// X·스레드 기본 계정: 지역별 AI 빌더 + 글로벌 유명 AI 계정
const X_AI_BUILDERS = {
  ko: ["OpenAI", "sama", "AnthropicAI", "GoogleDeepMind", "karpathy",
    "hunkims", "upstageai", "elonmusk"],
  en: ["OpenAI", "sama", "karpathy", "AnthropicAI", "GoogleDeepMind",
    "elonmusk", "ylecun", "gdb", "AndrewYNg", "MistralAI"],
  zh: ["deepseek_ai", "Alibaba_Qwen", "Kimi_Moonshot", "Kling_ai",
    "OpenAI", "sama", "AnthropicAI", "elonmusk"],
  ja: ["SakanaAILabs", "hardmaru", "karaage0703", "shi3z",
    "OpenAI", "sama", "GoogleDeepMind", "elonmusk"],
  es: ["DotCSV", "javilopen", "OpenAI", "sama", "AnthropicAI",
    "GoogleDeepMind", "elonmusk"],
};
const THREADS_AI_BUILDERS = {
  ko: ["openai", "zuck", "mosseri", "google", "nvidia", "samsungelectronics"],
  en: ["openai", "zuck", "mosseri", "meta.ai", "google", "nvidia", "github", "microsoft"],
  zh: ["openai", "zuck", "mosseri", "google", "nvidia", "github"],
  ja: ["openai", "zuck", "mosseri", "google", "nvidia", "sony"],
  es: ["openai", "zuck", "mosseri", "google", "nvidia", "microsoft"],
};

export const LANG_DEFAULT_ACCOUNTS = {
  ko: {
    reels: ["dlwlrma", "jennierubyjane", "xxxibgdrgn", "bts.bighitofficial",
      "blackpinkofficial", "sooyaaa__", "roses_are_rosie", "lalalalisa_m"],
    x: X_AI_BUILDERS.ko,
    threads: THREADS_AI_BUILDERS.ko,
    tiktok: ["ox_zung", "bts_official_bighit", "blackpinkofficial",
      "khaby.lame", "zachking"],
  },
  en: {
    reels: ["cristiano", "selenagomez", "kyliejenner", "therock",
      "arianagrande", "kimkardashian", "beyonce", "natgeo"],
    x: X_AI_BUILDERS.en,
    threads: THREADS_AI_BUILDERS.en,
    tiktok: ["khaby.lame", "charlidamelio", "mrbeast", "zachking",
      "bellapoarch", "therock"],
  },
  zh: {
    reels: ["jaychou", "gem0816", "edcee3000", "angelababyct",
      "cristiano", "leomessi"],
    x: X_AI_BUILDERS.zh,
    threads: THREADS_AI_BUILDERS.zh,
    tiktok: ["khaby.lame", "zachking", "mrbeast", "charlidamelio"],
  },
  ja: {
    reels: ["watanabenaomi703", "hikakin", "shoheiohtani",
      "yuriyan.retriever", "kentooyamazaki", "rolaofficial"],
    x: X_AI_BUILDERS.ja,
    threads: THREADS_AI_BUILDERS.ja,
    tiktok: ["junya1gou", "bayashi.tiktok", "khaby.lame", "zachking"],
  },
  es: {
    reels: ["shakira", "badbunnypr", "jbalvin", "leomessi",
      "georginagio", "sergioramos"],
    x: X_AI_BUILDERS.es,
    threads: THREADS_AI_BUILDERS.es,
    tiktok: ["kimberly.loaiza", "domelipa", "khaby.lame", "zachking"],
  },
};

// 샤오홍슈 기본 계정(검색 바로가기) — 샤오홍슈 내 인기 크리에이터/브랜드
export const XHS_DEFAULTS = [
  "李佳琦Austin", "papi酱", "雷军", "影视飓风", "东方甄选", "董洁", "章小蕙", "可灵KLING",
];
