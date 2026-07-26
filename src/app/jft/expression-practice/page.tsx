"use client";

import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/Pagination";

interface Dialogue {
  A: string;
  A_bn: string;
  B: string;
  B_bn: string;
  [key: string]: string;
}

interface Question {
  id: number;
  dialogue: Dialogue;
  options: string[] | string[][];
  options_bn: string[] | string[][];
  correctAnswerIndex: number;
  explanation: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AnswerState {
  [questionId: number]: number | null;
}

const JFT_PASSWORD = "suborno.dev";

export default function ExpressionPracticePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<AnswerState>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showBn, setShowBn] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const storedVersion = localStorage.getItem("jft_auth_version");
    if (storedVersion !== JFT_PASSWORD) {
      localStorage.removeItem("jft_auth");
      localStorage.setItem("jft_auth_version", JFT_PASSWORD);
    } else {
      const stored = localStorage.getItem("jft_auth");
      if (stored === "true") setAuthenticated(true);
    }
    const savedAnswers = localStorage.getItem("jft_expression_answers");
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
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

  const fetchQuestion = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jft-expression?page=${page}&limit=1`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setQuestion(data.question?.[0] ?? data.questions?.[0] ?? null);
      setPagination(data.pagination);
    } catch {
      setError("প্রশ্ন লোড করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchQuestion(currentPage);
    }
  }, [authenticated, currentPage, fetchQuestion]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShowExplanation(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: optionIndex };
      localStorage.setItem("jft_expression_answers", JSON.stringify(next));
      return next;
    });
  };

  const speakText = (text: string, id: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jpVoice) utterance.voice = jpVoice;

    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const getScore = () => {
    let correct = 0;
    let total = 0;
    Object.entries(answers).forEach(([qId, selectedIdx]) => {
      if (selectedIdx !== null && selectedIdx !== undefined) {
        total++;
        // We only have current question's correctAnswerIndex handy
        // So score is tracked per-visit
      }
    });
    return { correct, total };
  };

  const isMultiBlank = question && Array.isArray(question.options[0]);

  const getDialogueEntries = (dialogue: Dialogue) => {
    return Object.entries(dialogue).filter(
      ([key]) => !key.endsWith("_bn")
    );
  };

  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a3e)",
          backgroundSize: "400% 400%",
        }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Expression & Conversation
            </h1>
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
                  border: passwordError
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm text-center font-medium">
                ভুল পাসওয়ার্ড!
              </p>
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

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = pagination?.totalQuestions ?? 10;

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background:
          "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a3e)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div
          className="rounded-3xl p-5 md:p-7 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-fuchsia-500/10 to-pink-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative flex flex-wrap justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl md:text-4xl">💬</span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Expression & Conversation
                </h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-3 py-0.5 rounded-full text-xs text-white font-bold"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  JFT প্রস্তুতি
                </span>
                <span
                  className="px-3 py-0.5 rounded-full text-xs text-pink-300 font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(240,147,251,0.2), rgba(245,87,108,0.2))",
                    border: "1px solid rgba(245,87,108,0.2)",
                  }}
                >
                  {totalQuestions}টি প্রশ্ন
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div
                className="px-3 py-1.5 rounded-full text-white text-sm font-bold flex items-center gap-1.5"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>✅</span>
                <span>
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("jft_auth");
                  setAuthenticated(false);
                }}
                className="px-3 py-1.5 rounded-full text-white text-sm font-medium transition hover:bg-red-500/20 hover:text-red-300"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                🚪
              </button>
              <a
                href="/jft"
                className="px-3 py-1.5 rounded-full text-white text-sm font-medium transition"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                🏠
              </a>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            <p className="text-white/60 mt-3 text-sm">লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={() => fetchQuestion(currentPage)}
              className="px-5 py-2 rounded-full text-sm font-bold text-white transition"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Question Card */}
        {!loading && !error && question && (
          <div>
            {/* Question Number Badge */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #f093fb, #f5576c)",
                  boxShadow: "0 4px 20px rgba(245,87,108,0.3)",
                }}
              >
                প্রশ্ন #{question.id}
              </span>
              <span className="text-white/40 text-sm">
                {pagination?.currentPage} / {pagination?.totalPages}
              </span>
            </div>

            {/* Dialogue Card */}
            <div
              className="rounded-2xl p-5 md:p-6 mb-5"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🇯🇵</span>
                <h3 className="text-base font-bold text-white">
                  কথোপকথন (Dialogue)
                </h3>
                <button
                  onClick={() => setShowBn(!showBn)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: showBn
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "rgba(255,255,255,0.08)",
                    color: "white",
                    border: showBn
                      ? "none"
                      : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: showBn
                      ? "0 4px 16px rgba(59,130,246,0.3)"
                      : "none",
                  }}
                >
                  {showBn ? "🇧🇩 বাংলা দেখাচ্ছে" : "🇧🇩 বাংলা দেখুন"}
                </button>
                <button
                  onClick={() =>
                    speakText(
                      getDialogueEntries(question.dialogue)
                        .map(([, v]) => v)
                        .join(" "),
                      `dialogue-${question.id}`
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background:
                      speakingId === `dialogue-${question.id}`
                        ? "linear-gradient(135deg, #ef4444, #dc2626)"
                        : "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "white",
                    boxShadow:
                      speakingId === `dialogue-${question.id}`
                        ? "0 4px 16px rgba(239,68,68,0.4)"
                        : "0 4px 16px rgba(34,197,94,0.3)",
                  }}
                >
                  {speakingId === `dialogue-${question.id}` ? (
                    <>
                      <span className="w-1.5 h-3 bg-white rounded-sm animate-pulse" />
                      বন্ধ
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                      শুনুন
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {getDialogueEntries(question.dialogue).map(
                  ([speaker, japanese]) => {
                    const banglaKey = `${speaker}_bn` as keyof Dialogue;
                    const bangla = question.dialogue[banglaKey] || "";
                    const isBlank = japanese.includes("[ ______ ]");

                    return (
                      <div
                        key={speaker}
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #3b82f6, #2563eb)",
                            }}
                          >
                            {speaker}
                          </span>
                          <div className="flex-1">
                            <p
                              className="text-base text-white/90"
                              style={{
                                fontFamily: "'Noto Sans JP', sans-serif",
                              }}
                            >
                              {isBlank ? (
                                <>
                                  {japanese.split("[ ______ ]")[0]}
                                  <span
                                    className="inline-block mx-1 px-3 py-0.5 rounded-lg font-bold"
                                    style={{
                                      background:
                                        "rgba(251,191,36,0.2)",
                                      border:
                                        "2px dashed rgba(251,191,36,0.5)",
                                      color: "#fcd34d",
                                    }}
                                  >
                                    ?
                                  </span>
                                  {japanese.split("[ ______ ]")[1]}
                                </>
                              ) : (
                                japanese
                              )}
                            </p>
                            {showBn && (
                              <p className="text-sm text-white/50 mt-1">
                                {bangla}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Options Card */}
            <div
              className="rounded-2xl p-5 md:p-6 mb-5"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎯</span>
                <h3 className="text-base font-bold text-white">
                  {isMultiBlank ? "উত্তর বাছাই করুন" : "উত্তর বাছাই করুন"}
                </h3>
              </div>

              {isMultiBlank ? (
                // Multi-blank: nested arrays
                <div className="space-y-3">
                  {(question.options as string[][]).map(
                    (optionGroup, optIdx) => {
                      const isSelected =
                        answers[question.id] === optIdx;
                      const isCorrect =
                        optIdx === question.correctAnswerIndex;
                      const showResult =
                        answers[question.id] !== null &&
                        answers[question.id] !== undefined;

                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            handleAnswer(question.id, optIdx)
                          }
                          className="w-full text-left rounded-xl p-4 transition-all"
                          style={{
                            background: showResult
                              ? isSelected
                                ? isCorrect
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(239,68,68,0.2)"
                                : isCorrect
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(255,255,255,0.05)"
                              : isSelected
                              ? "rgba(139,92,246,0.2)"
                              : "rgba(255,255,255,0.05)",
                            border: showResult
                              ? isSelected
                                ? isCorrect
                                  ? "2px solid rgba(34,197,94,0.4)"
                                  : "2px solid rgba(239,68,68,0.4)"
                                : isCorrect
                                ? "2px solid rgba(34,197,94,0.3)"
                                : "1px solid rgba(255,255,255,0.08)"
                              : isSelected
                              ? "2px solid rgba(139,92,246,0.5)"
                              : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                background: isSelected
                                  ? "linear-gradient(135deg, #f093fb, #f5576c)"
                                  : "rgba(255,255,255,0.1)",
                                color: "white",
                              }}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {optionGroup.map((opt, subIdx) => (
                                <span
                                  key={subIdx}
                                  className="px-3 py-1.5 rounded-lg text-sm font-bold"
                                  style={{
                                    background: "rgba(255,255,255,0.08)",
                                    color:
                                      showResult && isSelected
                                        ? isCorrect
                                          ? "#4ade80"
                                          : "#f87171"
                                        : "rgba(255,255,255,0.9)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }}
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                          {showBn && (
                            <div className="flex flex-wrap gap-2 ml-10">
                              {(question.options_bn as string[][])[
                                optIdx
                              ]?.map((bn, subIdx) => (
                                <span
                                  key={subIdx}
                                  className="text-xs text-white/40"
                                >
                                  {bn}
                                  {subIdx <
                                    (question.options_bn as string[][])[
                                      optIdx
                                    ].length -
                                      1 && " / "}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                // Single-blank: flat arrays
                <div className="space-y-3">
                  {(question.options as string[]).map(
                    (option, optIdx) => {
                      const isSelected =
                        answers[question.id] === optIdx;
                      const isCorrect =
                        optIdx === question.correctAnswerIndex;
                      const showResult =
                        answers[question.id] !== null &&
                        answers[question.id] !== undefined;

                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            handleAnswer(question.id, optIdx)
                          }
                          className="w-full text-left rounded-xl px-4 py-3.5 transition-all flex items-center gap-3"
                          style={{
                            background: showResult
                              ? isSelected
                                ? isCorrect
                                  ? "rgba(34,197,94,0.2)"
                                  : "rgba(239,68,68,0.2)"
                                : isCorrect
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(255,255,255,0.05)"
                              : isSelected
                              ? "rgba(139,92,246,0.2)"
                              : "rgba(255,255,255,0.05)",
                            border: showResult
                              ? isSelected
                                ? isCorrect
                                  ? "2px solid rgba(34,197,94,0.4)"
                                  : "2px solid rgba(239,68,68,0.4)"
                                : isCorrect
                                ? "2px solid rgba(34,197,94,0.3)"
                                : "1px solid rgba(255,255,255,0.08)"
                              : isSelected
                              ? "2px solid rgba(139,92,246,0.5)"
                              : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              background: isSelected
                                ? "linear-gradient(135deg, #f093fb, #f5576c)"
                                : "rgba(255,255,255,0.1)",
                              color: "white",
                            }}
                          >
                            {showResult && isSelected ? (
                              isCorrect ? (
                                "✓"
                              ) : (
                                "✗"
                              )
                            ) : (
                              String.fromCharCode(65 + optIdx)
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-base font-bold"
                              style={{
                                fontFamily:
                                  "'Noto Sans JP', sans-serif",
                                color:
                                  showResult && isSelected
                                    ? isCorrect
                                      ? "#4ade80"
                                      : "#f87171"
                                    : "rgba(255,255,255,0.9)",
                              }}
                            >
                              {option}
                            </p>
                            {showBn && (
                              <p className="text-xs text-white/40 mt-0.5">
                                {
                                  (question.options_bn as string[])[
                                    optIdx
                                  ]
                                }
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            {answers[question.id] !== null &&
              answers[question.id] !== undefined && (
                <div className="mb-5">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-2 text-white/60 hover:text-white/90 transition text-sm font-medium"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showExplanation ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {showExplanation ? "ব্যাখ্যা লুকান" : "💡 ব্যাখ্যা দেখুন"}
                  </button>

                  {showExplanation && (
                    <div
                      className="mt-3 rounded-2xl p-5"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <p className="text-sm text-white/70 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

            {/* Prev / Next Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination?.hasPrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                আগের প্রশ্ন
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination?.hasNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: pagination?.hasNext
                    ? "linear-gradient(135deg, #f093fb, #f5576c)"
                    : "rgba(255,255,255,0.08)",
                  boxShadow: pagination?.hasNext
                    ? "0 4px 20px rgba(245,87,108,0.3)"
                    : "none",
                  border: pagination?.hasNext
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                পরের প্রশ্ন
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-8 text-center text-xs text-white/30 pt-6 mb-20"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          ইরোদোরি ভাই - JFT Expression & Conversation
        </div>
      </div>
    </div>
  );
}
