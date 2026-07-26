"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface KanjiItem {
  kanji: string;
  furigana: string;
  bangla: string;
}

interface Question {
  id: string;
  question: string;
  question_bangla: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Paragraph {
  id: number;
  title: string;
  title_furigana: string;
  title_bangla: string;
  title_english: string;
  reading: {
    with_kanji: string;
    furigana: string;
    bangla: string;
  };
  questions: Question[];
  kanji_list: KanjiItem[];
  isImportent: boolean;
}

interface AnswerState {
  [paragraphId: number]: {
    [questionId: string]: string | null;
  };
}

interface KanjiKnownState {
  [paragraphId: number]: { [kanji: string]: boolean };
}

export default function JftReadingPreparationPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<Paragraph | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [showExplanations, setShowExplanations] = useState<{
    [key: string]: boolean;
  }>({});
  const [kanjiKnown, setKanjiKnown] = useState<KanjiKnownState>({});
  const [showFurigana, setShowFurigana] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [activeKanji, setActiveKanji] = useState<{ char: string; reading: string; meaning: string; x: number; y: number } | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const banglaAudioRef = useRef<HTMLAudioElement | null>(null);
  const [banglaLoading, setBanglaLoading] = useState(false);
  const [filterImportant, setFilterImportant] = useState(false);

  const JFT_PASSWORD = "suborno.dev";

  const fetchParagraphs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jft-reading?limit=100${filterImportant ? "&important=true" : ""}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setParagraphs(data.paragraphs || []);
    } catch {
      setParagraphs([]);
    } finally {
      setLoading(false);
    }
  }, [filterImportant]);

  const fetchSingleParagraph = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/jft-reading?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setActiveParagraph(data.paragraph);
    } catch {
      setActiveParagraph(null);
    }
  }, []);

  const toggleImportant = useCallback(async (id: number, current: boolean) => {
    try {
      const res = await fetch("/api/jft-reading", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isImportent: !current }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setParagraphs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isImportent: data.paragraph.isImportent } : p))
      );
      if (activeParagraph?.id === id) {
        setActiveParagraph(data.paragraph);
      }
    } catch {}
  }, [activeParagraph]);

  useEffect(() => {
    fetchParagraphs();
  }, [fetchParagraphs]);

  useEffect(() => {
    return () => {
      if (banglaAudioRef.current) {
        banglaAudioRef.current.pause();
        banglaAudioRef.current = null;
      }
    };
  }, []);

  const speakText = async (text: string, paragraphId: number, lang: string = "ja-JP") => {
    if (typeof window === "undefined") return;

    if (speakingId === paragraphId) {
      if (banglaAudioRef.current) {
        banglaAudioRef.current.pause();
        banglaAudioRef.current.currentTime = 0;
        banglaAudioRef.current = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setSpeakingId(null);
      setBanglaLoading(false);
      setCurrentWordIndex(-1);
      setSpokenWords([]);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpokenWords([]);
    setCurrentWordIndex(-1);

    if (lang === "bn-BD") {
      setBanglaLoading(true);
      setSpeakingId(paragraphId);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error("TTS failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        banglaAudioRef.current = audio;
        setBanglaLoading(false);

        audio.onended = () => {
          setSpeakingId(null);
          banglaAudioRef.current = null;
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          setSpeakingId(null);
          banglaAudioRef.current = null;
          URL.revokeObjectURL(url);
        };

        await audio.play();
      } catch {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "bn-BD";
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find((v) => v.lang.startsWith("bn"))
          || voices.find((v) => v.name.toLowerCase().includes("bengali"))
          || voices.find((v) => v.lang.startsWith("hi"));
        if (bnVoice) utterance.voice = bnVoice;

        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);

        setBanglaLoading(false);
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    const words = text.split(/(?<=[。、！？\s])|(?=[。、！？\s])/).filter(w => w.trim());
    setSpokenWords(words);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jpVoice) utterance.voice = jpVoice;

    utterance.onstart = () => {
      setSpeakingId(paragraphId);
      setCurrentWordIndex(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        let charCount = 0;
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length;
          if (event.charIndex < charCount) {
            setCurrentWordIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setSpeakingId(null);
      setCurrentWordIndex(-1);
      setSpokenWords([]);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
      setCurrentWordIndex(-1);
      setSpokenWords([]);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (banglaAudioRef.current) {
      banglaAudioRef.current.pause();
      banglaAudioRef.current.currentTime = 0;
      banglaAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setBanglaLoading(false);
    setCurrentWordIndex(-1);
    setSpokenWords([]);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const isKanji = (char: string): boolean => {
    const code = char.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF);
  };

  interface TextSegment {
    text: string;
    isKanjiWord: boolean;
    reading?: string;
    meaning?: string;
  }

  const parseTextWithKanji = (text: string, kanjiList: KanjiItem[]): TextSegment[] => {
    const segments: TextSegment[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let found = false;

      const sortedKanji = [...kanjiList].sort((a, b) => b.kanji.length - a.kanji.length);

      for (const entry of sortedKanji) {
        const idx = remaining.indexOf(entry.kanji);
        if (idx === 0) {
          segments.push({
            text: entry.kanji,
            isKanjiWord: true,
            reading: entry.furigana,
            meaning: entry.bangla,
          });
          remaining = remaining.slice(entry.kanji.length);
          found = true;
          break;
        }
      }

      if (!found) {
        if (segments.length > 0 && !segments[segments.length - 1].isKanjiWord) {
          segments[segments.length - 1].text += remaining[0];
        } else {
          segments.push({ text: remaining[0], isKanjiWord: false });
        }
        remaining = remaining.slice(1);
      }
    }

    return segments;
  };

  const handleKanjiClick = (reading: string, meaning: string, kanji: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveKanji({
      char: kanji,
      reading,
      meaning,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const speakKanji = (reading: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(reading);
    utterance.lang = "ja-JP";
    utterance.rate = 0.7;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const storedVersion = localStorage.getItem("jft_auth_version");
    if (storedVersion !== JFT_PASSWORD) {
      localStorage.removeItem("jft_auth");
      localStorage.setItem("jft_auth_version", JFT_PASSWORD);
    } else {
      const stored = localStorage.getItem("jft_auth");
      if (stored === "true") setAuthenticated(true);
    }
    const savedAnswers = localStorage.getItem("jft_reading_answers");
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch {}
    }
    const savedKanji = localStorage.getItem("jft_reading_kanji");
    if (savedKanji) {
      try {
        setKanjiKnown(JSON.parse(savedKanji));
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

  const handleAnswer = (
    paragraphId: number,
    questionId: string,
    answer: string
  ) => {
    setAnswers((prev) => {
      const next = {
        ...prev,
        [paragraphId]: {
          ...prev[paragraphId],
          [questionId]: answer,
        },
      };
      localStorage.setItem("jft_reading_answers", JSON.stringify(next));
      return next;
    });
  };

  const toggleExplanation = (key: string) => {
    setShowExplanations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleKanjiKnown = (paragraphId: number, kanji: string) => {
    setKanjiKnown((prev) => {
      const next = {
        ...prev,
        [paragraphId]: {
          ...prev[paragraphId],
          [kanji]: !prev[paragraphId]?.[kanji],
        },
      };
      localStorage.setItem("jft_reading_kanji", JSON.stringify(next));
      return next;
    });
  };

  const getParagraphScore = (paragraph: Paragraph) => {
    const paragraphAnswers = answers[paragraph.id] || {};
    let correct = 0;
    paragraph.questions.forEach((q) => {
      if (paragraphAnswers[q.id] === q.correct_answer) correct++;
    });
    return { correct, total: paragraph.questions.length };
  };

  const getTotalScore = () => {
    let correct = 0;
    let total = 0;
    paragraphs.forEach((p) => {
      const score = getParagraphScore(p);
      correct += score.correct;
      total += score.total;
    });
    return { correct, total };
  };

  const handleSelectParagraph = async (id: number) => {
    setSelectedParagraph(id);
    await fetchSingleParagraph(id);
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
              JFT Reading Preparation
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

  const totalScore = getTotalScore();
  const totalParagraphs = paragraphs.length;

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background:
          "linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a3e)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
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
                <span className="text-3xl md:text-4xl">📖</span>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Reading Preparation
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
                  ২০টি প্যারাগ্রাফ
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
                  {totalScore.correct}/{totalScore.total}
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

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className="px-4 py-2.5 rounded-full text-sm font-bold transition"
            style={{
              background: showFurigana
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "rgba(255,255,255,0.05)",
              color: showFurigana ? "white" : "rgba(255,255,255,0.6)",
              border: showFurigana
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: showFurigana ? "0 4px 20px rgba(34,197,94,0.3)" : "none",
            }}
          >
            {showFurigana ? "📝 Furigana দেখাচ্ছে - ক্লিক করে Kanji দেখুন" : "📝 Furigana দেখুন"}
          </button>
          <button
            onClick={() => setFilterImportant(!filterImportant)}
            className="px-4 py-2.5 rounded-full text-sm font-bold transition"
            style={{
              background: filterImportant
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(255,255,255,0.05)",
              color: filterImportant ? "white" : "rgba(255,255,255,0.6)",
              border: filterImportant
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: filterImportant ? "0 4px 20px rgba(245,158,11,0.3)" : "none",
            }}
          >
            {filterImportant ? "⭐ গুরুত্বপূর্ণ দেখাচ্ছে" : "⭐ গুরুত্বপূর্ণ ফিল্টার"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/50 text-sm mt-3">লোড হচ্ছে...</p>
          </div>
        )}

        {/* Paragraph List */}
        {!loading && selectedParagraph === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paragraphs.map((paragraph) => {
              const score = getParagraphScore(paragraph);
              const hasAnswers = Object.keys(
                answers[paragraph.id] || {}
              ).length > 0;
              const isCompleted = hasAnswers && score.correct === score.total;

              return (
                <div key={paragraph.id} className="relative">
                  <button
                    onClick={() => handleSelectParagraph(paragraph.id)}
                    className="w-full text-left rounded-2xl p-4 transition-all duration-300"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(16px)",
                      border: paragraph.isImportent
                        ? "2px solid rgba(245,158,11,0.5)"
                        : isCompleted
                        ? "2px solid rgba(34,197,94,0.4)"
                        : hasAnswers
                        ? "2px solid rgba(251,191,36,0.4)"
                        : "2px solid rgba(255,255,255,0.1)",
                      boxShadow: paragraph.isImportent
                        ? "0 8px 32px rgba(245,158,11,0.15)"
                        : "0 8px 32px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        #{paragraph.id}
                      </span>
                      {isCompleted && (
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(34,197,94,0.2)",
                            color: "#4ade80",
                          }}
                        >
                          ✅ সম্পন্ন
                        </span>
                      )}
                      {hasAnswers && !isCompleted && (
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(251,191,36,0.2)",
                            color: "#fcd34d",
                          }}
                        >
                          {score.correct}/{score.total}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {paragraph.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {paragraph.title_bangla}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {paragraph.title_english}
                    </p>
                  </button>
                  {/* Important Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleImportant(paragraph.id, paragraph.isImportent);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all z-10"
                    style={{
                      background: paragraph.isImportent
                        ? "rgba(245,158,11,0.3)"
                        : "rgba(255,255,255,0.08)",
                      border: paragraph.isImportent
                        ? "1px solid rgba(245,158,11,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                    title={paragraph.isImportent ? "গুরুত্বপূর্ণ থেকে সরান" : "গুরুত্বপূর্ণ করুন"}
                  >
                    {paragraph.isImportent ? "⭐" : "☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Single Paragraph View */}
        {!loading && selectedParagraph !== null && activeParagraph && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedParagraph(null);
                setActiveParagraph(null);
              }}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              সব প্যারাগ্রাফে ফিরুন
            </button>

            <div key={activeParagraph.id}>
              {/* Paragraph Header */}
              <div
                className="rounded-2xl p-5 mb-6"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    প্যারাগ্রাফ #{activeParagraph.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleImportant(activeParagraph.id, activeParagraph.isImportent)}
                      className="text-xs font-bold px-3 py-1 rounded-full transition-all"
                      style={{
                        background: activeParagraph.isImportent
                          ? "rgba(245,158,11,0.2)"
                          : "rgba(255,255,255,0.1)",
                        color: activeParagraph.isImportent ? "#fbbf24" : "rgba(255,255,255,0.7)",
                        border: activeParagraph.isImportent
                          ? "1px solid rgba(245,158,11,0.4)"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {activeParagraph.isImportent ? "⭐ গুরুত্বপূর্ণ" : "☆ গুরুত্বপূর্ণ করুন"}
                    </button>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background:
                          getParagraphScore(activeParagraph).correct === getParagraphScore(activeParagraph).total
                            ? "rgba(34,197,94,0.2)"
                            : "rgba(255,255,255,0.1)",
                        color:
                          getParagraphScore(activeParagraph).correct === getParagraphScore(activeParagraph).total
                            ? "#4ade80"
                            : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {getParagraphScore(activeParagraph).correct}/{getParagraphScore(activeParagraph).total} সঠিক
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-white mb-1">
                  {activeParagraph.title}
                </h2>
                <p className="text-base text-white/60 mb-1">
                  {activeParagraph.title_bangla}
                </p>
                <p className="text-sm text-white/40">
                  {activeParagraph.title_english}
                </p>
              </div>

              {/* Japanese Text */}
              <div
                className="rounded-2xl p-5 mb-6"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇯🇵</span>
                  <h3 className="text-base font-bold text-white">
                    {showFurigana ? "ফুরিগানা (Furigana)" : "কাঞ্জি সহ পাঠ্য"}
                  </h3>
                  {!showFurigana && speakingId !== activeParagraph.id && (
                    <span className="text-xs text-purple-300/60 ml-auto">
                      👆 কাঞ্জি শব্দে ক্লিক করুন
                    </span>
                  )}
                  {speakingId === activeParagraph.id && (
                    <span className="text-xs text-yellow-300/80 ml-auto animate-pulse">
                      🔊 শুনছেন...
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(Number(e.target.value))}
                      className="text-xs px-2 py-1 rounded-lg focus:outline-none"
                      style={{
                        background: "rgba(30,27,75,0.9)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                      }}
                    >
                      <option value={0.5} style={{ color: "white", background: "#1e1b4b" }}>0.5x</option>
                      <option value={0.6} style={{ color: "white", background: "#1e1b4b" }}>0.6x</option>
                      <option value={0.7} style={{ color: "white", background: "#1e1b4b" }}>0.7x</option>
                      <option value={0.8} style={{ color: "white", background: "#1e1b4b" }}>0.8x</option>
                      <option value={1} style={{ color: "white", background: "#1e1b4b" }}>1x</option>
                      <option value={1.2} style={{ color: "white", background: "#1e1b4b" }}>1.2x</option>
                    </select>
                    <button
                      onClick={() =>
                        speakText(
                          showFurigana ? activeParagraph.reading.furigana : activeParagraph.reading.with_kanji,
                          activeParagraph.id
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={{
                        background:
                          speakingId === activeParagraph.id
                            ? "linear-gradient(135deg, #ef4444, #dc2626)"
                            : "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "white",
                        boxShadow:
                          speakingId === activeParagraph.id
                            ? "0 4px 16px rgba(239,68,68,0.4)"
                            : "0 4px 16px rgba(34,197,94,0.3)",
                      }}
                    >
                      {speakingId === activeParagraph.id ? (
                        <>
                          <span className="w-1.5 h-3 bg-white rounded-sm animate-pulse" />
                          বন্ধ করুন
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                          শুনুন
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {showFurigana ? (
                  <p
                    className="text-lg leading-relaxed text-white/90"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {activeParagraph.reading.furigana}
                  </p>
                ) : speakingId === activeParagraph.id ? (
                  <p
                    className="text-lg leading-relaxed"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {spokenWords.map((word, i) => (
                      <span
                        key={i}
                        className="inline-block transition-all duration-300"
                        style={{
                          color: i === currentWordIndex ? "#fbbf24" : i < currentWordIndex ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
                          fontWeight: i === currentWordIndex ? "900" : "400",
                          textShadow: i === currentWordIndex ? "0 0 20px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3)" : "none",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          background: i === currentWordIndex ? "rgba(251,191,36,0.15)" : "transparent",
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p
                    className="text-lg leading-relaxed text-white/90"
                    style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                  >
                    {parseTextWithKanji(activeParagraph.reading.with_kanji, activeParagraph.kanji_list).map((segment, i) => {
                      if (segment.isKanjiWord) {
                        return (
                          <span
                            key={i}
                            onClick={(e) => handleKanjiClick(segment.reading!, segment.meaning!, segment.text, e)}
                            className="cursor-pointer px-1 py-0.5 rounded-lg transition-all hover:bg-purple-500/30 inline-block"
                            style={{
                              background: "rgba(139,92,246,0.15)",
                              borderBottom: "2px solid rgba(139,92,246,0.4)",
                            }}
                          >
                            {segment.text}
                          </span>
                        );
                      }
                      return <span key={i}>{segment.text}</span>;
                    })}
                  </p>
                )}
              </div>

              {/* Bangla Translation */}
              <div
                className="rounded-2xl p-5 mb-6"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🇧🇩</span>
                  <h3 className="text-base font-bold text-white">
                    বাংলা অনুবাদ
                  </h3>
                  <button
                    onClick={() => speakText(activeParagraph.reading.bangla, activeParagraph.id + 100, "bn-BD")}
                    disabled={banglaLoading}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{
                      background:
                        speakingId === activeParagraph.id + 100
                          ? "linear-gradient(135deg, #ef4444, #dc2626)"
                          : banglaLoading
                          ? "linear-gradient(135deg, #f59e0b, #d97706)"
                          : "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white",
                      boxShadow:
                        speakingId === activeParagraph.id + 100
                          ? "0 4px 16px rgba(239,68,68,0.4)"
                          : banglaLoading
                          ? "0 4px 16px rgba(245,158,11,0.4)"
                          : "0 4px 16px rgba(59,130,246,0.3)",
                      opacity: banglaLoading ? 0.8 : 1,
                    }}
                  >
                    {banglaLoading ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        লোড হচ্ছে...
                      </>
                    ) : speakingId === activeParagraph.id + 100 ? (
                      <>
                        <span className="w-1.5 h-3 bg-white rounded-sm animate-pulse" />
                        বন্ধ করুন
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                        শুনুন
                      </>
                    )}
                  </button>
                </div>
                <p className="text-base leading-relaxed text-white/80">
                  {activeParagraph.reading.bangla}
                </p>
              </div>

              {/* Questions */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">❓</span>
                  <h3 className="text-base font-bold text-white">
                    প্রশ্নোত্তর
                  </h3>
                </div>
                <div className="space-y-4">
                  {activeParagraph.questions.map((question, qIndex) => {
                    const currentAnswer =
                      answers[activeParagraph.id]?.[question.id] || null;
                    const isCorrect =
                      currentAnswer === question.correct_answer;
                    const showExplanation =
                      showExplanations[
                        `${activeParagraph.id}-${question.id}`
                      ];

                    return (
                      <div
                        key={question.id}
                        className="rounded-2xl p-5"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          backdropFilter: "blur(16px)",
                          border:
                            currentAnswer !== null
                              ? isCorrect
                                ? "2px solid rgba(34,197,94,0.4)"
                                : "2px solid rgba(239,68,68,0.4)"
                              : "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #f093fb, #f5576c)",
                            }}
                          >
                            {qIndex + 1}
                          </span>
                          <div>
                            <p className="text-base font-bold text-white">
                              {question.question}
                            </p>
                            <p className="text-sm text-white/50 mt-0.5">
                              {question.question_bangla}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {question.options.map((option) => {
                            const isSelected = currentAnswer === option;
                            const isOptionCorrect =
                              option === question.correct_answer;
                            return (
                              <button
                                key={option}
                                onClick={() =>
                                  handleAnswer(
                                    activeParagraph.id,
                                    question.id,
                                    option
                                  )
                                }
                                className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                style={{
                                  background: isSelected
                                    ? isOptionCorrect
                                      ? "rgba(34,197,94,0.2)"
                                      : "rgba(239,68,68,0.2)"
                                    : isOptionCorrect &&
                                      currentAnswer !== null
                                    ? "rgba(34,197,94,0.1)"
                                    : "rgba(255,255,255,0.05)",
                                  border: isSelected
                                    ? isOptionCorrect
                                      ? "1px solid rgba(34,197,94,0.4)"
                                      : "1px solid rgba(239,68,68,0.4)"
                                    : isOptionCorrect &&
                                      currentAnswer !== null
                                    ? "1px solid rgba(34,197,94,0.3)"
                                    : "1px solid rgba(255,255,255,0.1)",
                                  color: isSelected
                                    ? isOptionCorrect
                                      ? "#4ade80"
                                      : "#f87171"
                                    : isOptionCorrect &&
                                      currentAnswer !== null
                                    ? "#4ade80"
                                    : "rgba(255,255,255,0.7)",
                                }}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() =>
                            toggleExplanation(
                              `${activeParagraph.id}-${question.id}`
                            )
                          }
                          className="text-xs text-white/50 hover:text-white/80 transition flex items-center gap-1"
                        >
                          <span>
                            {showExplanation ? "ভাষ্ট" : "ব্যাখ্যা দেখুন"}
                          </span>
                          <svg
                            className={`w-3 h-3 transition-transform ${
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
                        </button>

                        {showExplanation && (
                          <div
                            className="mt-3 p-3 rounded-xl text-sm text-white/70"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            💡 {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kanji List */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📝</span>
                  <h3 className="text-base font-bold text-white">
                    কাঞ্জি তালিকা
                  </h3>
                  <span className="text-xs text-white/40 ml-auto">
                    {activeParagraph.kanji_list.length}টি
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeParagraph.kanji_list.map((kanji) => {
                    const isKnown =
                      kanjiKnown[activeParagraph.id]?.[kanji.kanji] || false;
                    return (
                      <button
                        key={kanji.kanji}
                        onClick={() =>
                          toggleKanjiKnown(activeParagraph.id, kanji.kanji)
                        }
                        className="text-left p-3 rounded-xl transition-all"
                        style={{
                          background: isKnown
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(255,255,255,0.05)",
                          border: isKnown
                            ? "1px solid rgba(34,197,94,0.3)"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="text-lg font-bold text-white mb-0.5">
                          {kanji.kanji}
                        </div>
                        <div className="text-xs text-white/50">
                          {kanji.furigana}
                        </div>
                        <div className="text-xs text-white/40">
                          {kanji.bangla}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                {activeParagraph.id > 1 && (
                  <button
                    onClick={() => handleSelectParagraph(activeParagraph.id - 1)}
                    className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    ← আগের প্যারাগ্রাফ
                  </button>
                )}
                {activeParagraph.id < totalParagraphs && (
                  <button
                    onClick={() => handleSelectParagraph(activeParagraph.id + 1)}
                    className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition ml-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, #f093fb, #f5576c)",
                      boxShadow: "0 4px 20px rgba(245,87,108,0.3)",
                    }}
                  >
                    পরের প্যারাগ্রাফ →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="mt-8 text-center text-xs text-white/30 pt-6 mb-20"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          ইরোদোরি ভাই - JFT Reading Preparation
        </div>

        {/* Kanji Popup */}
        {activeKanji && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setActiveKanji(null)}
            />
            <div
              className="fixed z-50 animate-in fade-in zoom-in duration-200"
              style={{
                left: `${Math.min(activeKanji.x, window.innerWidth - 200)}px`,
                top: `${Math.max(activeKanji.y - 120, 10)}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="rounded-2xl p-4 shadow-2xl min-w-[180px]"
                style={{
                  background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: "2px solid rgba(139,92,246,0.5)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.3)",
                }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {activeKanji.char}
                  </div>
                  <div
                    className="text-lg font-bold mb-1"
                    style={{ color: "#a78bfa" }}
                  >
                    {activeKanji.reading}
                  </div>
                  <div className="text-sm text-white/60 mb-3">
                    {activeKanji.meaning}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakKanji(activeKanji.reading);
                    }}
                    className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                    }}
                  >
                    🔊 শুনুন
                  </button>
                </div>
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45"
                  style={{ background: "#312e81", border: "2px solid rgba(139,92,246,0.5)", borderTop: "none", borderLeft: "none" }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
