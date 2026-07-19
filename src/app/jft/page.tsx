"use client";

import { useState, useEffect, useMemo } from "react";
import {
  jftResources,
  JFT_PASSWORD,
  typeLabels,
  typeIcons,
  JftResource,
} from "@/lib/jft-data";

type ResourceType = "all" | "mocktest" | "coupon" | "kanji" | "class" | "pdf" | "listening" | "expression";

const filterOptions: { label: string; value: ResourceType }[] = [
  { label: "সব", value: "all" },
  { label: "মকটেস্ট", value: "mocktest" },
  { label: "কুপন টেস্ট", value: "coupon" },
  { label: "কাঞ্জি", value: "kanji" },
  { label: "এক্সপ্রেশন", value: "expression" },
  { label: "ক্লাস", value: "class" },
  { label: "পিডিএফ", value: "pdf" },
  { label: "লিসেনিং", value: "listening" },
];

interface ScoreState {
  [id: string]: { preScore: number | null; postScore: number | null; completed: boolean };
}

export default function JftPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ResourceType>("all");
  const [scores, setScores] = useState<ScoreState>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jft_auth");
    if (stored === "true") setAuthenticated(true);
    const savedScores = localStorage.getItem("jft_scores");
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch {}
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === JFT_PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem("jft_auth", "true");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  const updateScore = (id: string, field: "preScore" | "postScore", value: string) => {
    const num = value === "" ? null : Math.min(250, Math.max(0, parseInt(value, 10)));
    setScores((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          preScore: prev[id]?.preScore ?? null,
          postScore: prev[id]?.postScore ?? null,
          completed: prev[id]?.completed ?? false,
          [field]: isNaN(num as number) ? null : num,
        },
      };
      localStorage.setItem("jft_scores", JSON.stringify(next));
      return next;
    });
  };

  const toggleComplete = (id: string) => {
    setScores((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          preScore: prev[id]?.preScore ?? null,
          postScore: prev[id]?.postScore ?? null,
          completed: !(prev[id]?.completed ?? false),
        },
      };
      localStorage.setItem("jft_scores", JSON.stringify(next));
      return next;
    });
  };

  const copyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredResources = useMemo(() => {
    let result = jftResources;
    if (filterType !== "all") {
      result = result.filter((r) => r.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.note.toLowerCase().includes(q) ||
          r.password.toLowerCase().includes(q)
      );
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...result].sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 0;
      const pb = priorityOrder[b.priority] ?? 0;
      return pa - pb;
    });
  }, [filterType, searchQuery]);

  const sections = useMemo(() => {
    const groups: Record<string, JftResource[]> = {
      mocktest: [],
      coupon: [],
      kanji: [],
      expression: [],
      class: [],
      others: [],
    };
    filteredResources.forEach((item) => {
      if (item.type === "mocktest") groups.mocktest.push(item);
      else if (item.type === "coupon") groups.coupon.push(item);
      else if (item.type === "kanji") groups.kanji.push(item);
      else if (item.type === "expression") groups.expression.push(item);
      else if (item.type === "class") groups.class.push(item);
      else groups.others.push(item);
    });
    const result: { key: string; label: string; icon: string; items: JftResource[] }[] = [];
    if (groups.mocktest.length) result.push({ key: "mocktest", label: "মকটেস্ট (সিরিয়াল অনুযায়ী)", icon: "📝", items: groups.mocktest });
    if (groups.coupon.length) result.push({ key: "coupon", label: "কুপন টেস্ট", icon: "🎟️", items: groups.coupon });
    if (groups.kanji.length) result.push({ key: "kanji", label: "কাঞ্জি টেস্ট", icon: "📖", items: groups.kanji });
    if (groups.expression.length) result.push({ key: "expression", label: "এক্সপ্রেশন", icon: "💬", items: groups.expression });
    if (groups.class.length) result.push({ key: "class", label: "সমাধান ক্লাস ও প্লেলিস্ট", icon: "🎬", items: groups.class });
    if (groups.others.length) result.push({ key: "others", label: "পিডিএফ ও লিসেনিং", icon: "📚", items: groups.others });
    return result;
  }, [filteredResources]);

  const completedCount = jftResources.filter(
    (r) => (r.type === "mocktest" || r.type === "coupon") && scores[r.id]?.completed
  ).length;
  const totalTestCount = jftResources.filter((r) => r.type === "mocktest" || r.type === "coupon").length;
  const completionPercent = totalTestCount > 0 ? Math.round((completedCount / totalTestCount) * 100) : 0;

  const scoredCount = jftResources.filter(
    (r) => (r.type === "mocktest" || r.type === "coupon") && scores[r.id]?.postScore != null
  ).length;
  const totalScore = jftResources.reduce((sum, r) => {
    if ((r.type === "mocktest" || r.type === "coupon") && scores[r.id]?.postScore != null) {
      return sum + (scores[r.id].postScore ?? 0);
    }
    return sum;
  }, 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a3e)",
        backgroundSize: "400% 400%",
      }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">সিক্রেট পেজ</h1>
            <p className="text-white/60 text-sm">পাসওয়ার্ড দিন</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="w-full px-5 py-4 rounded-2xl text-white text-center text-lg tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: passwordError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm text-center font-medium">ভুল পাসওয়ার্ড!</p>
            )}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #f093fb, #f5576c)",
                boxShadow: "0 8px 32px rgba(245,87,108,0.4)",
              }}
            >
              প্রবেশ করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a3e)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div
          className="rounded-3xl p-5 md:p-7 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative flex flex-wrap justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl md:text-4xl">📚</span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">ইরোদোরি ভাই</h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs text-white font-bold" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  JFT প্রস্তুতি
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs text-pink-300 font-bold" style={{ background: "linear-gradient(135deg, rgba(240,147,251,0.2), rgba(245,87,108,0.2))", border: "1px solid rgba(245,87,108,0.2)" }}>
                  ⚡ ১০০% মার্ক
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="px-3 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-1.5" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span>🧠</span>
                <span>{jftResources.length}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("jft_auth");
                  setAuthenticated(false);
                }}
                className="px-3 py-1.5 rounded-full text-white text-sm font-medium transition hover:bg-red-500/20 hover:text-red-300"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                🚪
              </button>
              <a href="/" className="px-3 py-1.5 rounded-full text-white text-sm font-medium transition" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
                🏠
              </a>
            </div>
          </div>
          {completedCount > 0 && (
            <div className="relative mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>সম্পন্ন: {completedCount}/{totalTestCount}</span>
                <span className="text-xs text-green-400 font-bold">{completionPercent}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Total Score */}
        <div className="rounded-2xl p-5 sm:p-6 mb-6 flex items-center gap-5" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="relative shrink-0">
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
              <circle
                cx="45" cy="45" r="38" fill="none"
                stroke="url(#scoreGrad2)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={238.76}
                strokeDashoffset={238.76 - (238.76 * totalScore / 250)}
                transform="rotate(-90 45 45)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <defs>
                <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f093fb" />
                  <stop offset="100%" stopColor="#f5576c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white leading-none">{totalScore}</span>
              <span className="text-white/40 font-bold text-xs">/250</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🏆</span>
              <span className="font-extrabold text-white text-lg">মোট স্কোর</span>
            </div>
            <div className="h-2 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(totalScore / 250) * 100}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)" }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/50 text-sm">{scoredCount}টি টেস্ট দিয়েছেন</span>
              <span className="text-white/50 text-sm">250 এ {Math.round((totalScore / 250) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Study Plan */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span className="font-bold text-white text-base">পড়ার ক্রম:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm px-4 py-1.5 rounded-full font-bold" style={{ background: "rgba(239,68,68,0.25)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>🔴 ১. মকটেস্ট</span>
              <span className="text-sm px-4 py-1.5 rounded-full font-bold" style={{ background: "rgba(251,191,36,0.25)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.3)" }}>🟡 ২. সমাধান</span>
              <span className="text-sm px-4 py-1.5 rounded-full font-bold" style={{ background: "rgba(96,165,250,0.25)", color: "#93c5fd", border: "1px solid rgba(96,165,250,0.3)" }}>🔵 ৩. PDF & লিসেনিং</span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="rounded-2xl p-4 md:p-5 mb-6" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 সার্চ করুন..."
                className="w-full rounded-full px-5 py-3.5 text-base text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition pl-12"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">🔍</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  className="px-4 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap"
                  style={
                    filterType === opt.value
                      ? { background: "linear-gradient(135deg, #f093fb, #f5576c)", color: "white", border: "none", boxShadow: "0 4px 20px rgba(245,87,108,0.3)" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.key} className="mb-6">
            <div className="flex items-center gap-3 rounded-2xl p-3 md:p-4 mb-4" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-base md:text-lg font-extrabold text-white">{section.label}</h2>
              <span className="ml-auto text-xs px-3 py-0.5 rounded-full font-bold text-white/60" style={{ background: "rgba(255,255,255,0.1)" }}>
                {section.items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const itemScore = scores[item.id];
                const isCompleted = itemScore?.completed ?? false;
                const preScore = itemScore?.preScore ?? null;
                const postScore = itemScore?.postScore ?? null;
                const hasScore = preScore != null && postScore != null;
                const scoreDiff = hasScore ? (postScore ?? 0) - (preScore ?? 0) : 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl p-4 md:p-5 transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(16px)",
                      border: isCompleted
                        ? "1px solid rgba(34,197,94,0.3)"
                        : item.priority === "high"
                        ? "3px solid rgba(239,68,68,0.5)"
                        : item.priority === "medium"
                        ? "3px solid rgba(251,191,36,0.5)"
                        : "3px solid rgba(96,165,250,0.5)",
                      boxShadow: isCompleted
                        ? "inset 0 0 40px rgba(34,197,94,0.08)"
                        : "0 8px 32px rgba(0,0,0,0.25)",
                      opacity: isCompleted ? 0.85 : 1,
                    }}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                          style={{
                            background: isCompleted
                              ? "linear-gradient(135deg, #22c55e, #16a34a)"
                              : "linear-gradient(135deg, #f093fb, #f5576c)",
                            boxShadow: isCompleted
                              ? "0 4px 20px rgba(34,197,94,0.4)"
                              : "0 4px 20px rgba(245,87,108,0.4)",
                          }}
                        >
                          {isCompleted ? "✓" : typeIcons[item.type]}
                        </div>
                        <span
                          className="text-white/70 px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {typeLabels[item.type]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isCompleted && (
                          <span className="text-green-400 px-2.5 py-1 rounded-full font-bold whitespace-nowrap" style={{ fontSize: "10px", background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.3)" }}>
                            ✅ সম্পন্ন
                          </span>
                        )}
                        {item.password && (
                          <span className="text-yellow-400 px-2.5 py-1 rounded-full font-bold whitespace-nowrap" style={{ fontSize: "10px", background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.3)" }}>
                            🔑 পাসওয়ার্ড
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-extrabold text-white leading-snug mb-1.5">{item.title}</h3>

                    {/* Password */}
                    {item.password && (
                      <div className="text-yellow-400 font-mono px-3 py-1 rounded-full inline-block mb-1.5" style={{ fontSize: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {item.password}
                      </div>
                    )}

                    {/* Priority Badge */}
                    <div className="mb-2.5">
                      {item.priority === "high" && (
                        <span className="text-red-300 px-3 py-0.5 rounded-full font-bold" style={{ fontSize: "10px", background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.3)" }}>
                          🔴 প্রথমে পড়ুন
                        </span>
                      )}
                      {item.priority === "medium" && (
                        <span className="text-yellow-300 px-3 py-0.5 rounded-full font-bold" style={{ fontSize: "10px", background: "rgba(251,191,36,0.25)", border: "1px solid rgba(251,191,36,0.3)" }}>
                          🟡 এরপর পড়ুন
                        </span>
                      )}
                      {item.priority === "low" && (
                        <span className="text-blue-300 px-3 py-0.5 rounded-full font-bold" style={{ fontSize: "10px", background: "rgba(96,165,250,0.25)", border: "1px solid rgba(96,165,250,0.3)" }}>
                          🔵 পরে পড়ুন
                        </span>
                      )}
                    </div>

                    {/* Score Section */}
                    {(item.type === "mocktest" || item.type === "coupon") && (
                      <div className="rounded-xl p-4 mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 font-bold whitespace-nowrap text-xs sm:text-sm">ভিডিও আগে:</span>
                            <input
                              type="number"
                              min="0"
                              max="250"
                              value={preScore ?? ""}
                              onChange={(e) => updateScore(item.id, "preScore", e.target.value)}
                              className="w-20 text-center rounded-xl px-2 py-2 text-base font-bold text-white focus:outline-none transition-all"
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                              }}
                              placeholder="-"
                            />
                            <span className="text-white/50 text-sm">/250</span>
                          </div>
                          <span className="text-white/30 text-lg">→</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/60 font-bold whitespace-nowrap text-xs sm:text-sm">ভিডিও পরে:</span>
                            <input
                              type="number"
                              min="0"
                              max="250"
                              value={postScore ?? ""}
                              onChange={(e) => updateScore(item.id, "postScore", e.target.value)}
                              className="w-20 text-center rounded-xl px-2 py-2 text-base font-bold text-white focus:outline-none transition-all"
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                              }}
                              placeholder="-"
                            />
                            <span className="text-white/50 text-sm">/250</span>
                          </div>
                          {hasScore && (
                            <span
                              className="font-bold px-2 py-0.5 rounded-full"
                              style={{
                                fontSize: "10px",
                                color: scoreDiff > 0 ? "#4ade80" : scoreDiff < 0 ? "#f87171" : "#fcd34d",
                                background: scoreDiff > 0 ? "rgba(34,197,94,0.15)" : scoreDiff < 0 ? "rgba(239,68,68,0.15)" : "rgba(251,191,36,0.15)",
                              }}
                            >
                              {scoreDiff > 0 ? `+ ${scoreDiff}` : scoreDiff < 0 ? `${scoreDiff}` : "0"}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Link */}
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener"
                      className="block rounded-xl px-3.5 py-2.5 transition-all hover:shadow-lg"
                      title={item.link}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#93c5fd",
                        fontSize: "12px",
                        fontFamily: "'Courier New', monospace",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.link}
                    </a>

                    {/* Note */}
                    {item.note && (
                      <p className="text-white/60 bg-white/5 rounded-xl px-3 py-2 mt-2 flex items-start gap-1.5" style={{ border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px" }}>
                        <span>💡</span>
                        <span>{item.note}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      {(item.type === "mocktest" || item.type === "coupon") && (
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-full transition"
                          style={
                            isCompleted
                              ? { color: "#4ade80", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }
                              : { color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
                          }
                        >
                          {isCompleted ? "✅ সম্পন্ন" : "☐ সম্পন্ন করুন"}
                        </button>
                      )}
                      <button
                        onClick={() => copyLink(item.id, item.link)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full transition"
                        style={{ color: copiedId === item.id ? "#4ade80" : "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {copiedId === item.id ? "✅ কপি হয়েছে" : "📋 কপি"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-16 rounded-3xl" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-extrabold text-white">কিছু পাওয়া যায়নি</h3>
            <p className="text-white/60 mt-1">সার্চ বা ফিল্টার পরিবর্তন করুন</p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-white/30 pt-6 mb-20" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          ইরোদোরি ভাই - JFT প্রস্তুতি অ্যাপ
        </div>
      </div>
    </div>
  );
}
