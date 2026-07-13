"use client";

import { useState } from "react";
import { BookSlug, QuizQuestion } from "@/lib/types";
import { AppMode } from "@/app/page";
import Image from "next/image";

interface ScoreBoardProps {
  score: number;
  total: number;
  answers: Record<string, string>;
  questions: QuizQuestion[];
  onRestart: () => void;
  onHome: () => void;
  bookSlug: BookSlug;
  onSwitchMode: (mode: AppMode, book: BookSlug) => void;
  onBackToSetup: () => void;
  timeLimit: number;
  submittedByTimeout: boolean;
}

export default function ScoreBoard({
  score,
  total,
  answers,
  questions,
  onRestart,
  onHome,
  bookSlug,
  onSwitchMode,
  onBackToSetup,
  timeLimit,
  submittedByTimeout,
}: ScoreBoardProps) {
  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState<"all" | "wrong" | "correct">("all");

  const percentage = Math.round((score / total) * 100);
  const wrongCount = total - score;
  const unanswered = total - Object.keys(answers).length;

  let grade = "";
  let gradeColor = "";
  let gradeEmoji = "";
  if (percentage >= 90) { grade = "Excellent!"; gradeColor = "text-green-400"; gradeEmoji = "🎉"; }
  else if (percentage >= 70) { grade = "Good Job!"; gradeColor = "text-blue-400"; gradeEmoji = "👍"; }
  else if (percentage >= 50) { grade = "Keep Practicing!"; gradeColor = "text-yellow-400"; gradeEmoji = "💪"; }
  else { grade = "Don't Give Up!"; gradeColor = "text-orange-400"; gradeEmoji = "📚"; }

  const filteredQuestions = questions.filter((q) => {
    const userAnswer = answers[q.id];
    if (filter === "wrong") return userAnswer !== q.correctAnswer;
    if (filter === "correct") return userAnswer === q.correctAnswer;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-6 sm:py-10">
      <main className="max-w-2xl mx-auto" role="region" aria-label="Quiz results">
        {/* Score Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 sm:p-8 text-center mb-6">
          <div className="mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center mb-4">
              <span className="text-3xl sm:text-4xl font-bold text-white">{percentage}%</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${gradeColor}`}>{grade} {gradeEmoji}</h2>
            {submittedByTimeout && <p className="text-red-400 text-sm mt-2">Time&apos;s up! Auto-submitted</p>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-xs text-green-400/70">Correct</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{wrongCount}</p>
              <p className="text-xs text-red-400/70">Wrong</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
              <p className="text-2xl font-bold text-slate-300">{unanswered}</p>
              <p className="text-xs text-slate-400/70">Skipped</p>
            </div>
          </div>

          {timeLimit > 0 && <p className="text-sm text-slate-400 mb-4">Time limit: {timeLimit} min</p>}

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button onClick={onRestart} className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 min-h-[48px]">Try Again</button>
            <button onClick={onHome} className="flex-1 px-6 py-3 border-2 border-slate-600/50 text-slate-300 rounded-xl font-semibold hover:border-purple-500/50 hover:bg-slate-700/50 transition-all duration-300 min-h-[48px]">Home</button>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={onBackToSetup} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 transition-colors min-h-[44px]">🔄 Change Lessons</button>
              <button onClick={() => onSwitchMode("read", bookSlug)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors min-h-[44px]">📖 Read Mode</button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <button onClick={() => setShowReview(!showReview)} className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-700/20 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-white">Review Answers</h3>
              <p className="text-sm text-slate-400">See what you got right and wrong</p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showReview ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showReview && (
            <div className="border-t border-slate-700/50">
              <div className="flex border-b border-slate-700/50">
                {(["all", "wrong", "correct"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-3 text-sm font-medium transition-colors ${filter === f ? (f === "wrong" ? "text-red-400 border-b-2 border-red-400" : f === "correct" ? "text-green-400 border-b-2 border-green-400" : "text-white border-b-2 border-white") : "text-slate-500 hover:text-slate-300"}`}>
                    {f === "all" ? `All (${total})` : f === "wrong" ? `Wrong (${wrongCount})` : `Correct (${score})`}
                  </button>
                ))}
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {filteredQuestions.map((question) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const wasSkipped = !userAnswer;

                  return (
                    <div key={question.id} className={`p-4 border-b border-slate-700/30 ${isCorrect ? "bg-green-500/5" : wasSkipped ? "bg-slate-500/5" : "bg-red-500/5"}`}>
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-600/50 bg-white shrink-0">
                          <Image src={question.imageUrl} alt={question.hiragana} fill className="object-contain p-1" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isCorrect ? (
                              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Correct</span>
                            ) : wasSkipped ? (
                              <span className="text-xs font-medium text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded">Skipped</span>
                            ) : (
                              <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Wrong</span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-white">{question.correctAnswer}</p>
                          {question.kanji && <p className="text-sm text-slate-300">{question.kanji}</p>}
                          {question.meaning && <p className="text-sm text-purple-300">{question.meaning}</p>}
                          {!isCorrect && userAnswer && (
                            <p className="text-sm text-red-400 mt-1">Your answer: <span className="line-through">{userAnswer}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
