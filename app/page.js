"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { T, LANGS, makeFmt } from "../lib/i18n";
import { recommendAccounts, recommendKeywords, recommendXhsKeywords } from "../lib/recommend";
import { LANG_DEFAULT_ACCOUNTS, XHS_DEFAULTS } from "../lib/defaults";

const CATEGORY_IDS = ["all", "foryou", "ai", "food", "beauty", "vlog", "fun", "movie", "tech", "edu", "travel", "animal"];

const ls = {
  get(key, fallback) {
    if (typeof window === "undefined") return fallback;
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

function timeAgoFn(t) {
  return (ts) => {
    if (!ts) return "";
    const s = Date.now() / 1000 - ts;
    if (s < 3600) return t.minAgo(Math.max(1, Math.floor(s / 60)));
    if (s < 86400) return t.hourAgo(Math.floor(s / 3600));
    return t.dayAgo(Math.floor(s / 86400));
  };
}

function SortMenu({ t, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const cur = options.find((o) => o.key === value);
  return (
    <div className={"sortmenu" + (open ? " open" : "")} ref={ref}>
      <button className="sorttoggle" onClick={() => setOpen(!open)}>
        {t.sortLabel}: <span>{cur ? cur.label : ""}</span> <span className="caret">▼</span>
      </button>
      <div className="sortlist">
        {options.map((o) => (
          <button key={o.key} className={o.key === value ? "sel" : ""}
            onClick={() => { setOpen(false); if (o.key !== value) onChange(o.key); }}>
            <span>{o.icon}</span><span>{o.label}</span><span className="check">✓</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AccountManager({ t, platform, accounts, onAdd, onRemove, stats }) {
  const [input, setInput] = useState("");
  const recos = useMemo(() => recommendAccounts(platform, accounts, 8), [platform, accounts]);
  const rising = useMemo(() => {
    if (!stats) return [];
    return stats
      .filter((s) => s.followers > 0 && s.avgEngagement > 0)
      .slice()
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }, [stats]);
  const fmt = makeFmt("en");
  const add = () => {
    const name = input.trim().replace(/^@/, "");
    if (!name) return;
    setInput("");
    onAdd(name);
  };
  return (
    <div>
      <h2 style={{ fontSize: 16, marginBottom: 10 }}>{t.subAccounts}</h2>
      <div className="acc-chips">
        {accounts.map((name) => (
          <span className="acc-chip" key={name}>
            @<b>{name}</b>
            <button title={t.removeTitle} onClick={() => onRemove(name)}>✕</button>
          </span>
        ))}
      </div>
      <div className="addbar">
        <input value={input} placeholder={t.accountPlaceholder[platform]}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <button onClick={add}>{t.addAccount}</button>
      </div>
      {recos.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, margin: "16px 0 6px" }}>{t.recommendedAccounts}</h2>
          <p className="note" style={{ marginBottom: 8 }}>{t.recoNote}</p>
          <div className="acc-chips">
            {recos.map((r) => (
              <span className="acc-chip reco" key={r.name}>
                @<b>{r.name}</b>
                <button title={t.addAccount} onClick={() => onAdd(r.name)}>＋</button>
              </span>
            ))}
          </div>
        </div>
      )}
      {rising.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, margin: "16px 0 6px" }}>{t.risingAccounts}</h2>
          <p className="note" style={{ marginBottom: 8 }}>{t.risingNote}</p>
          <div className="acc-chips">
            {rising.map((s) => (
              <span className="acc-chip rising" key={s.account}>
                🚀 <b>@{s.account}</b>
                <span style={{ color: "var(--muted)" }}>
                  {t.followers} {fmt(s.followers)}
                </span>
                <span className="rate">{(s.rate * 100).toFixed(1)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState("ko");
  const [tab, setTab] = useState("youtube");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("week");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [updated, setUpdated] = useState(null);
  const [modal, setModal] = useState(null); // {id, vertical}

  // 사용자가 직접 수정한 플랫폼만 저장 — 나머지는 언어별 인기인 디폴트를 따른다
  const [customAccounts, setCustomAccounts] = useState({});
  const [xhsAccounts, setXhsAccounts] = useState(XHS_DEFAULTS);
  const [recentSearches, setRecentSearches] = useState([]);

  const accounts = useMemo(() => {
    const base = LANG_DEFAULT_ACCOUNTS[lang] || LANG_DEFAULT_ACCOUNTS.ko;
    return {
      reels: customAccounts.reels || base.reels,
      x: customAccounts.x || base.x,
      threads: customAccounts.threads || base.threads,
      tiktok: customAccounts.tiktok || base.tiktok,
    };
  }, [customAccounts, lang]);

  // 탭별 데이터/상태
  const [vid, setVid] = useState({ data: [], status: "loading", hasLikes: false, sort: "views" });
  const [reels, setReels] = useState({ data: [], stats: [], status: "loading", sort: "views" });
  const [xp, setXp] = useState({ data: [], status: "loading", sort: "likes" });
  const [th, setTh] = useState({ data: [], status: "loading", sort: "likes" });
  const [tt, setTt] = useState({ data: [], stats: [], status: "loading", sort: "views" });
  const [xhs, setXhs] = useState({ data: [], status: "loading" });
  const [ai, setAi] = useState({ data: null, status: "loading" });

  const t = T[lang] || T.ko;
  const fmt = useMemo(() => makeFmt(lang), [lang]);
  const timeAgo = useMemo(() => timeAgoFn(t), [t]);
  const seq = useRef({});

  // 초기 로컬스토리지 복원
  useEffect(() => {
    const savedLang = ls.get("tv_lang", null);
    if (savedLang && T[savedLang]) setLang(savedLang);
    else {
      const nav = (navigator.language || "ko").slice(0, 2);
      if (T[nav]) setLang(nav);
    }
    setCustomAccounts(ls.get("tv_accounts2", {}));
    setXhsAccounts(ls.get("tv_xhs2", XHS_DEFAULTS));
    setRecentSearches(ls.get("tv_searches", []));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const bump = (key) => (seq.current[key] = (seq.current[key] || 0) + 1);
  const fresh = (key, n) => seq.current[key] === n;

  const markUpdated = (fetchedAt) => setUpdated(fetchedAt ? new Date(fetchedAt * 1000) : new Date());

  // ---------------- 유튜브/쇼츠 (+ 추천)
  const loadVideos = useCallback(async (force = false, sortOverride) => {
    const n = bump("vid");
    const sort = sortOverride || vid.sort;
    const wantLikes = sort === "likes";
    setVid((s) => ({ ...s, data: [], status: wantLikes ? "loadingLikes" : "loading" }));
    try {
      let url;
      if (category === "foryou" && !search) {
        const kws = recommendKeywords(lang, recentSearches, accounts);
        url = `/api/foryou?keywords=${encodeURIComponent(kws.join("|"))}&lang=${lang}&period=${period}&shorts=${tab === "shorts" ? 1 : 0}${force ? "&force=1" : ""}`;
      } else {
        const q = new URLSearchParams({
          category: category === "foryou" ? "all" : category,
          period, lang,
          shorts: tab === "shorts" ? "1" : "0",
          force: force ? "1" : "0",
          enrich: wantLikes ? "1" : "0",
          q: search,
        });
        url = "/api/videos?" + q;
      }
      const data = await (await fetch(url)).json();
      if (!fresh("vid", n)) return;
      markUpdated(data.fetchedAt);
      setVid((s) => ({
        ...s, data: data.videos || [], hasLikes: wantLikes,
        status: (data.videos || []).length ? "ok" : "empty",
      }));
    } catch {
      if (fresh("vid", n)) setVid((s) => ({ ...s, status: "error" }));
    }
  }, [category, period, tab, search, lang, recentSearches, accounts, vid.sort]);

  // ---------------- 릴스
  const loadReels = useCallback(async (force = false) => {
    const n = bump("reels");
    setReels((s) => ({ ...s, data: [], status: "loading" }));
    try {
      const data = await (await fetch(
        `/api/reels?accounts=${encodeURIComponent(accounts.reels.join(","))}${force ? "&force=1" : ""}`
      )).json();
      if (!fresh("reels", n)) return;
      markUpdated(data.fetchedAt);
      setReels((s) => ({
        ...s, data: data.reels || [], stats: data.accountStats || [],
        status: (data.reels || []).length ? "ok" : "empty",
      }));
    } catch {
      if (fresh("reels", n)) setReels((s) => ({ ...s, status: "error" }));
    }
  }, [accounts.reels]);

  // ---------------- X / 스레드
  const loadX = useCallback(async (force = false) => {
    const n = bump("x");
    setXp((s) => ({ ...s, data: [], status: "loading" }));
    try {
      const data = await (await fetch(
        `/api/x?accounts=${encodeURIComponent(accounts.x.join(","))}${force ? "&force=1" : ""}`
      )).json();
      if (!fresh("x", n)) return;
      markUpdated(data.fetchedAt);
      setXp((s) => ({ ...s, data: data.posts || [], status: (data.posts || []).length ? "ok" : "empty" }));
    } catch {
      if (fresh("x", n)) setXp((s) => ({ ...s, status: "error" }));
    }
  }, [accounts.x]);

  const loadThreads = useCallback(async (force = false) => {
    const n = bump("th");
    setTh((s) => ({ ...s, data: [], status: "loading" }));
    try {
      const data = await (await fetch(
        `/api/threads?accounts=${encodeURIComponent(accounts.threads.join(","))}${force ? "&force=1" : ""}`
      )).json();
      if (!fresh("th", n)) return;
      markUpdated(data.fetchedAt);
      setTh((s) => ({ ...s, data: data.posts || [], status: (data.posts || []).length ? "ok" : "empty" }));
    } catch {
      if (fresh("th", n)) setTh((s) => ({ ...s, status: "error" }));
    }
  }, [accounts.threads]);

  // ---------------- 틱톡
  const loadTiktok = useCallback(async (force = false) => {
    const n = bump("tt");
    setTt((s) => ({ ...s, data: [], status: "loading" }));
    try {
      const data = await (await fetch(
        `/api/tiktok?accounts=${encodeURIComponent(accounts.tiktok.join(","))}&lang=${lang}${force ? "&force=1" : ""}`
      )).json();
      if (!fresh("tt", n)) return;
      markUpdated(data.fetchedAt);
      setTt((s) => ({
        ...s, data: data.posts || [], stats: data.accountStats || [],
        status: (data.posts || []).length ? "ok" : "empty",
      }));
    } catch {
      if (fresh("tt", n)) setTt((s) => ({ ...s, status: "error" }));
    }
  }, [accounts.tiktok, lang]);

  // ---------------- 샤오홍슈 / AI
  const loadXhs = useCallback(async (force = false) => {
    const n = bump("xhs");
    setXhs({ data: [], status: "loading" });
    try {
      const data = await (await fetch(`/api/xhs${force ? "?force=1" : ""}`)).json();
      if (!fresh("xhs", n)) return;
      markUpdated(data.fetchedAt);
      setXhs({ data: data.hot || [], status: (data.hot || []).length ? "ok" : "empty" });
    } catch {
      if (fresh("xhs", n)) setXhs((s) => ({ ...s, status: "error" }));
    }
  }, []);

  const loadAi = useCallback(async (force = false) => {
    const n = bump("ai");
    setAi((s) => ({ ...s, status: s.data && !force ? "ok" : "loading" }));
    try {
      const data = await (await fetch(`/api/ai?lang=${lang}${force ? "&force=1" : ""}`)).json();
      if (!fresh("ai", n)) return;
      markUpdated(data.fetchedAt);
      setAi({ data, status: "ok" });
    } catch {
      if (fresh("ai", n)) setAi((s) => ({ ...s, status: "error" }));
    }
  }, [lang]);

  // 탭/조건 변화 시 로드
  useEffect(() => {
    if (tab === "youtube" || tab === "shorts") loadVideos();
  }, [tab, category, period, search, lang]); // eslint-disable-line
  useEffect(() => { if (tab === "reels") loadReels(); }, [tab, accounts.reels]); // eslint-disable-line
  useEffect(() => { if (tab === "x") loadX(); }, [tab, accounts.x]); // eslint-disable-line
  useEffect(() => { if (tab === "threads") loadThreads(); }, [tab, accounts.threads]); // eslint-disable-line
  useEffect(() => { if (tab === "tiktok") loadTiktok(); }, [tab, accounts.tiktok, lang]); // eslint-disable-line
  useEffect(() => { if (tab === "xhs") loadXhs(); }, [tab]); // eslint-disable-line
  useEffect(() => { if (tab === "ai") loadAi(); }, [tab, lang]); // eslint-disable-line

  const refresh = () => {
    if (tab === "ai") loadAi(true);
    else if (tab === "reels") loadReels(true);
    else if (tab === "x") loadX(true);
    else if (tab === "threads") loadThreads(true);
    else if (tab === "tiktok") loadTiktok(true);
    else if (tab === "xhs") loadXhs(true);
    else loadVideos(true);
  };

  const changeLang = (code) => {
    setLang(code);
    ls.set("tv_lang", code);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const kw = searchInput.trim();
    setSearch(kw);
    if (kw) {
      const next = [kw, ...recentSearches.filter((s) => s.toLowerCase() !== kw.toLowerCase())].slice(0, 10);
      setRecentSearches(next);
      ls.set("tv_searches", next);
    }
    if (tab !== "youtube" && tab !== "shorts") setTab("youtube");
  };

  const updateAccounts = (platform, action, name) => {
    setCustomAccounts((prev) => {
      const list = prev[platform] || accounts[platform] || [];
      let next;
      if (action === "add") {
        const key = platform === "x" ? name : name.toLowerCase();
        next = list.some((a) => a.toLowerCase() === key.toLowerCase()) ? list : [...list, key];
      } else {
        next = list.filter((a) => a !== name);
      }
      const merged = { ...prev, [platform]: next };
      ls.set("tv_accounts2", merged);
      return merged;
    });
  };

  const updateXhs = (action, name) => {
    setXhsAccounts((prev) => {
      const next = action === "add"
        ? (prev.includes(name) ? prev : [...prev, name])
        : prev.filter((a) => a !== name);
      ls.set("tv_xhs2", next);
      return next;
    });
  };

  // 정렬된 목록
  const risingScore = (p) => (p.followers > 0 ? ((p.likes || 0) + (p.comments || 0)) / p.followers : 0);
  const sortedVideos = useMemo(() => {
    const f = vid.sort;
    return vid.data.slice().sort((a, b) => (b[f] || 0) - (a[f] || 0));
  }, [vid.data, vid.sort]);
  const sortedReels = useMemo(() => {
    if (reels.sort === "rising") return reels.data.slice().sort((a, b) => risingScore(b) - risingScore(a));
    const f = reels.sort;
    return reels.data.slice().sort((a, b) => (b[f] || 0) - (a[f] || 0));
  }, [reels.data, reels.sort]);
  const sortedX = useMemo(() => {
    const f = xp.sort === "reposts" ? "retweets" : xp.sort;
    return xp.data.slice().sort((a, b) => (b[f] || 0) - (a[f] || 0));
  }, [xp.data, xp.sort]);
  const sortedTh = useMemo(() => {
    const f = th.sort;
    return th.data.slice().sort((a, b) => (b[f] || 0) - (a[f] || 0));
  }, [th.data, th.sort]);
  const sortedTt = useMemo(() => {
    if (tt.sort === "rising") return tt.data.slice().sort((a, b) => risingScore(b) - risingScore(a));
    const f = tt.sort;
    return tt.data.slice().sort((a, b) => (b[f] || 0) - (a[f] || 0));
  }, [tt.data, tt.sort]);

  const rankLabel = (i) => `${i + 1}${t.rankSuffix}`;
  const statusMsg = (status) =>
    status === "loading" ? t.loading
      : status === "loadingLikes" ? t.loadingLikes
        : status === "error" ? t.loadFailed
          : status === "empty" ? t.noResults : "";

  const isVideoTab = tab === "youtube" || tab === "shorts";

  const proxied = (u) => (u ? `/api/img?u=${encodeURIComponent(u)}` : "");

  const today = useMemo(() => {
    const localeMap = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP" };
    return new Date().toLocaleDateString(localeMap[lang] || "ko-KR", {
      year: "numeric", month: "long", day: "numeric", weekday: "long",
    });
  }, [lang]);

  return (
    <>
      <header>
        <h1>{t.title1} <span>{t.title2}</span> {t.title3}</h1>
        <div id="today">{today}</div>
        <form className="search-form" onSubmit={submitSearch}>
          <input type="search" placeholder={t.searchPlaceholder}
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <button type="submit">{t.searchBtn}</button>
        </form>
        <select className="langsel" value={lang} onChange={(e) => changeLang(e.target.value)}>
          {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button className="refresh-btn" onClick={refresh}>{t.refreshBtn}</button>
        {updated && (
          <div className="updated">
            {t.updated}: {updated.toLocaleTimeString()}
          </div>
        )}
      </header>

      <nav className="tabs">
        {["youtube", "shorts", "ai", "reels", "x", "threads", "tiktok", "xhs"].map((id) => (
          <button key={id} className={"tab" + (tab === id ? " active" : "")}
            onClick={() => setTab(id)}>
            {t.tabs[id]}
          </button>
        ))}
      </nav>

      {isVideoTab && (
        <div className="toolbar">
          <div className="chips">
            {CATEGORY_IDS.map((c) => (
              <button key={c}
                className={"chip" + (c === "foryou" ? " foryou" : "") + (c === category && !search ? " active" : "")}
                onClick={() => { setCategory(c); setSearch(""); setSearchInput(""); }}>
                {t.categories[c]}
              </button>
            ))}
          </div>
          <div className="periods">
            {["day", "week", "month"].map((p) => (
              <button key={p} className={"period" + (p === period ? " active" : "")}
                onClick={() => setPeriod(p)}>
                {t.periods[p]}
              </button>
            ))}
          </div>
          <SortMenu t={t} value={vid.sort}
            options={[
              { key: "views", label: t.sorts.views, icon: "👁️" },
              { key: "likes", label: t.sorts.likes, icon: "👍" },
            ]}
            onChange={(key) => {
              setVid((s) => ({ ...s, sort: key }));
              if (key === "likes" && !vid.hasLikes) loadVideos(false, key);
            }} />
        </div>
      )}

      <main>
        {/* ---------------- 유튜브 / 쇼츠 ---------------- */}
        {isVideoTab && (
          <div>
            {category === "foryou" && !search && <p className="note">{t.foryouNote}</p>}
            {vid.status !== "ok" && <div className="status">{statusMsg(vid.status)}</div>}
            <div className={"grid" + (tab === "shorts" ? " shorts" : "")}>
              {sortedVideos.map((v, i) => (
                <div className="card" key={v.id} onClick={() => setModal({ id: v.id, vertical: tab === "shorts" })}>
                  <div style={{ position: "relative" }}>
                    {v.thumbnail && <img className="thumb" loading="lazy" src={v.thumbnail} alt="" />}
                    <div className={"rank" + (i < 3 ? " top" : "")}>{rankLabel(i)}</div>
                    {v.length && <div className="len">{v.length}</div>}
                  </div>
                  <div className="meta">
                    <div className="title">{v.title}</div>
                    <div className="sub">
                      <span className={vid.sort === "views" ? "views" : ""}>{t.viewsWord} {fmt(v.views)}</span>
                      {v.likes ? <span className="views">👍 {fmt(v.likes)}</span> : null}
                      <span>{v.channel}</span>
                      <span>{v.published || ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- AI ---------------- */}
        {tab === "ai" && (
          <div>
            {ai.status === "error" && <div className="status">{t.loadFailed}</div>}
            {ai.status === "loading" && <div className="status">{t.loading}</div>}
            {ai.data && (
              <>
                <div className="ai-section">
                  <h2>{t.aiLatest} <small>{t.aiLatestSub}</small></h2>
                  <div className="modelrow">
                    {(ai.data.models?.latest || []).map((m) => (
                      <a className="modelcard" key={m.id} href={"https://huggingface.co/" + m.id}
                        target="_blank" rel="noopener noreferrer">
                        <div className="mid">{m.id}</div>
                        <div className="msub">
                          <span className={"pill " + (m.pipeline === "text-to-video" ? "t2v" : "i2v")}>
                            {m.pipeline === "text-to-video" ? t.t2v : t.i2v}
                          </span>
                          <span>❤️ {(m.likes || 0).toLocaleString()}</span>
                          <span>⬇️ {(m.downloads || 0).toLocaleString()}</span>
                          <span>{m.createdAt ? m.createdAt.slice(0, 10) : ""}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="ai-section">
                  <h2>{t.aiTrending} <small>{t.aiTrendingSub}</small></h2>
                  <div className="modelrow">
                    {(ai.data.models?.trending || []).map((m) => (
                      <a className="modelcard" key={m.id} href={"https://huggingface.co/" + m.id}
                        target="_blank" rel="noopener noreferrer">
                        <div className="mid">{m.id}</div>
                        <div className="msub">
                          <span className={"pill " + (m.pipeline === "text-to-video" ? "t2v" : "i2v")}>
                            {m.pipeline === "text-to-video" ? t.t2v : t.i2v}
                          </span>
                          <span>❤️ {(m.likes || 0).toLocaleString()}</span>
                          <span>⬇️ {(m.downloads || 0).toLocaleString()}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="ai-section">
                  <h2>{t.aiNews} <small>{t.aiNewsSub}</small></h2>
                  <div className="newslist">
                    {(ai.data.news || []).slice(0, 20).map((n, i) => (
                      <a className="newsitem" key={i} href={n.link} target="_blank" rel="noopener noreferrer">
                        <span className={"badge " + (n.region === "local" ? "kr" : "gl")}>
                          {n.region === "local" ? t.newsLocal : t.newsGlobal}
                        </span>
                        <span className="ntitle">{n.title}</span>
                        <span className="nsrc">{(n.source ? n.source + " · " : "") + timeAgo(n.ts)}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <p className="note">{t.aiTip}</p>
              </>
            )}
          </div>
        )}

        {/* ---------------- 릴스 ---------------- */}
        {tab === "reels" && (
          <div className="ext-section">
            <p className="note">{t.reelsNote}</p>
            <AccountManager t={t} platform="reels" accounts={accounts.reels}
              stats={reels.stats}
              onAdd={(n) => updateAccounts("reels", "add", n)}
              onRemove={(n) => updateAccounts("reels", "remove", n)} />
            <h2 style={{ fontSize: 16, margin: "22px 0 12px" }}>{t.popularReels}</h2>
            <div className="sortbar">
              <SortMenu t={t} value={reels.sort}
                options={[
                  { key: "views", label: t.sorts.views, icon: "👁️" },
                  { key: "likes", label: t.sorts.likes, icon: "❤️" },
                  { key: "comments", label: t.sorts.comments, icon: "💬" },
                  { key: "rising", label: t.sorts.rising, icon: "🚀" },
                ]}
                onChange={(key) => setReels((s) => ({ ...s, sort: key }))} />
              {reels.status === "ok" && <span className="sortcount">{t.totalPosts(sortedReels.length)}</span>}
            </div>
            {reels.status === "loading" && <div className="status">{t.loadingSlow}</div>}
            {reels.status === "error" && <div className="status">{t.loadFailed}</div>}
            {reels.status === "empty" && (
              <>
                <p className="note">{t.reelsEmpty}</p>
                <div className="linkgrid">
                  {accounts.reels.map((name) => (
                    <a className="linkcard" key={name}
                      href={`https://www.instagram.com/${name}/reels/`}
                      target="_blank" rel="noopener noreferrer">
                      📸 @{name}<small>{t.openIn("Instagram")}</small>
                    </a>
                  ))}
                </div>
              </>
            )}
            <div className="grid shorts">
              {sortedReels.map((r, i) => (
                <div className="card" key={r.url + i} onClick={() => window.open(r.url, "_blank")}>
                  <div style={{ position: "relative" }}>
                    {r.thumbnail && <img className="thumb" loading="lazy" src={proxied(r.thumbnail)} alt="" />}
                    <div className={"rank" + (i < 3 ? " top" : "")}>{rankLabel(i)}</div>
                  </div>
                  <div className="meta">
                    <div className="title">{r.title || t.noDesc}</div>
                    <div className="sub">
                      <span className={reels.sort === "views" ? "views" : ""}>👁️ {fmt(r.views)}</span>
                      <span className={reels.sort === "likes" ? "views" : ""}>❤️ {fmt(r.likes || 0)}</span>
                      <span className={reels.sort === "comments" ? "views" : ""}>💬 {fmt(r.comments || 0)}</span>
                    </div>
                    <div className="sub" style={{ marginTop: 3 }}><span>@{r.account}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- X ---------------- */}
        {tab === "x" && (
          <div className="ext-section">
            <p className="note">{t.xNote}</p>
            <AccountManager t={t} platform="x" accounts={accounts.x}
              onAdd={(n) => updateAccounts("x", "add", n)}
              onRemove={(n) => updateAccounts("x", "remove", n)} />
            <div className="sortbar" style={{ marginTop: 20 }}>
              <SortMenu t={t} value={xp.sort}
                options={[
                  { key: "likes", label: t.sorts.likes, icon: "❤️" },
                  { key: "replies", label: t.sorts.replies, icon: "💬" },
                  { key: "reposts", label: t.sorts.retweets, icon: "🔁" },
                  { key: "views", label: t.sorts.views, icon: "👁️" },
                ]}
                onChange={(key) => setXp((s) => ({ ...s, sort: key }))} />
              {xp.status === "ok" && <span className="sortcount">{t.totalPostsWord(sortedX.length)}</span>}
            </div>
            {xp.status === "loading" && <div className="status">{t.loadingSlow}</div>}
            {xp.status === "error" && <div className="status">{t.loadFailed}</div>}
            {xp.status === "empty" && (
              <>
                <p className="note">{t.xEmpty}</p>
                <div className="linkgrid">
                  {accounts.x.map((name) => (
                    <a className="linkcard" key={name}
                      href={"https://x.com/" + name}
                      target="_blank" rel="noopener noreferrer">
                      𝕏 @{name}<small>{t.openIn("X")}</small>
                    </a>
                  ))}
                </div>
              </>
            )}
            <div className="postlist">
              {sortedX.map((p, i) => (
                <div className="postcard" key={p.url + i} onClick={() => window.open(p.url, "_blank")}>
                  <div className="phead">
                    <span className={"prank" + (i < 3 ? " top" : "")}>{rankLabel(i)}</span>
                    <span className="pacct">@{p.account}</span>
                  </div>
                  <div className="ptext">{p.text}</div>
                  {p.media && <img className="pmedia" loading="lazy" src={proxied(p.media)} alt="" />}
                  <div className="pstats">
                    <span className={xp.sort === "likes" ? "hot" : ""}>❤️ <b>{fmt(p.likes)}</b></span>
                    <span className={xp.sort === "replies" ? "hot" : ""}>💬 <b>{fmt(p.replies)}</b></span>
                    <span className={xp.sort === "reposts" ? "hot" : ""}>🔁 <b>{fmt(p.retweets)}</b></span>
                    {p.views ? <span className={xp.sort === "views" ? "hot" : ""}>👁️ <b>{fmt(p.views)}</b></span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 스레드 ---------------- */}
        {tab === "threads" && (
          <div className="ext-section">
            <p className="note">{t.threadsNote}</p>
            <AccountManager t={t} platform="threads" accounts={accounts.threads}
              onAdd={(n) => updateAccounts("threads", "add", n)}
              onRemove={(n) => updateAccounts("threads", "remove", n)} />
            <div className="sortbar" style={{ marginTop: 20 }}>
              <SortMenu t={t} value={th.sort}
                options={[
                  { key: "likes", label: t.sorts.likes, icon: "❤️" },
                  { key: "replies", label: t.sorts.replies, icon: "💬" },
                  { key: "reposts", label: t.sorts.reposts, icon: "🔁" },
                ]}
                onChange={(key) => setTh((s) => ({ ...s, sort: key }))} />
              {th.status === "ok" && <span className="sortcount">{t.totalPostsWord(sortedTh.length)}</span>}
            </div>
            {th.status === "loading" && <div className="status">{t.loadingSlow}</div>}
            {th.status === "error" && <div className="status">{t.loadFailed}</div>}
            {th.status === "empty" && (
              <>
                <p className="note">{t.threadsBlocked}</p>
                <div className="linkgrid">
                  {accounts.threads.map((name) => (
                    <a className="linkcard" key={name}
                      href={"https://www.threads.com/@" + name}
                      target="_blank" rel="noopener noreferrer">
                      🧵 @{name}<small>{t.openIn("Threads")}</small>
                    </a>
                  ))}
                </div>
              </>
            )}
            <div className="postlist">
              {sortedTh.map((p, i) => (
                <div className="postcard" key={p.url + i} onClick={() => window.open(p.url, "_blank")}>
                  <div className="phead">
                    <span className={"prank" + (i < 3 ? " top" : "")}>{rankLabel(i)}</span>
                    <span className="pacct">@{p.account}</span>
                  </div>
                  <div className="ptext">{p.text}</div>
                  {p.media && <img className="pmedia" loading="lazy" src={proxied(p.media)} alt="" />}
                  <div className="pstats">
                    <span className={th.sort === "likes" ? "hot" : ""}>❤️ <b>{fmt(p.likes)}</b></span>
                    <span className={th.sort === "replies" ? "hot" : ""}>💬 <b>{fmt(p.replies)}</b></span>
                    <span className={th.sort === "reposts" ? "hot" : ""}>🔁 <b>{fmt(p.reposts)}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 틱톡 ---------------- */}
        {tab === "tiktok" && (
          <div className="ext-section">
            <p className="note">{t.tiktokNote}</p>
            <AccountManager t={t} platform="tiktok" accounts={accounts.tiktok}
              stats={tt.stats}
              onAdd={(n) => updateAccounts("tiktok", "add", n)}
              onRemove={(n) => updateAccounts("tiktok", "remove", n)} />
            <div className="sortbar" style={{ marginTop: 20 }}>
              <SortMenu t={t} value={tt.sort}
                options={[
                  { key: "views", label: t.sorts.views, icon: "👁️" },
                  { key: "likes", label: t.sorts.likes, icon: "❤️" },
                  { key: "comments", label: t.sorts.comments, icon: "💬" },
                  { key: "rising", label: t.sorts.rising, icon: "🚀" },
                ]}
                onChange={(key) => setTt((s) => ({ ...s, sort: key }))} />
              {tt.status === "ok" && <span className="sortcount">{t.totalPosts(sortedTt.length)}</span>}
            </div>
            {tt.status === "loading" && <div className="status">{t.loadingSlow}</div>}
            {tt.status === "error" && <div className="status">{t.loadFailed}</div>}
            {tt.status === "empty" && <div className="status">{t.tiktokEmpty}</div>}
            <div className="grid shorts">
              {sortedTt.map((p, i) => (
                <div className="card" key={p.id + i} onClick={() => window.open(p.url, "_blank")}>
                  <div style={{ position: "relative" }}>
                    {p.thumbnail && <img className="thumb" loading="lazy" src={proxied(p.thumbnail)} alt="" />}
                    <div className={"rank" + (i < 3 ? " top" : "")}>{rankLabel(i)}</div>
                  </div>
                  <div className="meta">
                    <div className="title">{p.title || t.noDesc}</div>
                    <div className="sub">
                      <span className={tt.sort === "views" ? "views" : ""}>👁️ {fmt(p.views)}</span>
                      <span className={tt.sort === "likes" ? "views" : ""}>❤️ {fmt(p.likes)}</span>
                      <span className={tt.sort === "comments" ? "views" : ""}>💬 {fmt(p.comments)}</span>
                    </div>
                    <div className="sub" style={{ marginTop: 3 }}><span>@{p.account}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 샤오홍슈 ---------------- */}
        {tab === "xhs" && (
          <div className="ext-section">
            <p className="note">{t.xhsNote}</p>
            <h2>{t.xhsKeywords}</h2>
            <p className="note" style={{ marginBottom: 10 }}>{t.xhsKeywordsNote}</p>
            <div className="linkgrid" style={{ marginBottom: 26 }}>
              {recommendXhsKeywords(lang, recentSearches, accounts).map((k, i) => (
                <a className="linkcard" key={i}
                  href={"https://www.xiaohongshu.com/search_result?keyword=" + encodeURIComponent(k.query)}
                  target="_blank" rel="noopener noreferrer">
                  ✨ {k.label}
                  <small>{k.query !== k.label ? k.query : t.openIn("小红书")}</small>
                </a>
              ))}
            </div>
            <h2>{t.xhsHot}</h2>
            {xhs.status === "loading" && <div className="status">{t.loading}</div>}
            {(xhs.status === "error" || xhs.status === "empty") && (
              <div className="status">{t.xhsEmpty}</div>
            )}
            <div className="hotlist" style={{ marginBottom: 30 }}>
              {xhs.data.map((h, i) => (
                <a className={"hotitem" + (i < 3 ? " top3" : "")} key={i}
                  href={h.link} target="_blank" rel="noopener noreferrer">
                  <span className="hrank">{h.rank || i + 1}</span>
                  <span className="htitle">{h.title}</span>
                  {h.type && h.type !== "无" ? <span className="htag">{h.type}</span> : null}
                  <span className="hscore">{h.score}</span>
                </a>
              ))}
            </div>
            <h2 style={{ marginBottom: 10 }}>{t.subAccounts}</h2>
            <div className="acc-chips">
              {xhsAccounts.map((name) => (
                <span className="acc-chip" key={name}>
                  <b>{name}</b>
                  <button title={t.removeTitle} onClick={() => updateXhs("remove", name)}>✕</button>
                </span>
              ))}
            </div>
            <XhsAddBar t={t} onAdd={(n) => updateXhs("add", n)} />
            <div className="linkgrid">
              {xhsAccounts.map((name) => (
                <a className="linkcard" key={name}
                  href={"https://www.xiaohongshu.com/search_result?keyword=" + encodeURIComponent(name)}
                  target="_blank" rel="noopener noreferrer">
                  📕 {name}<small>{t.openIn("小红书")}</small>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ---------------- 재생 모달 ---------------- */}
      {modal && (
        <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className={"modal-box" + (modal.vertical ? " vertical" : "")}>
            <iframe className="player" allow="autoplay; encrypted-media" allowFullScreen
              src={`https://www.youtube.com/embed/${modal.id}?autoplay=1`} />
            <div className="modal-actions">
              <a href={`https://www.youtube.com/watch?v=${modal.id}`}
                target="_blank" rel="noopener noreferrer">{t.openExternal}</a>
              <button onClick={() => setModal(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function XhsAddBar({ t, onAdd }) {
  const [input, setInput] = useState("");
  const add = () => {
    const name = input.trim();
    if (!name) return;
    setInput("");
    onAdd(name);
  };
  return (
    <div className="addbar">
      <input value={input} placeholder="小红书 (예: 可灵KLING)"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()} />
      <button onClick={add}>{t.addAccount}</button>
    </div>
  );
}
