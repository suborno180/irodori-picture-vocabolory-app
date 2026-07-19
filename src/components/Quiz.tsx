"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { BookSlug, BOOKS, QuizQuestion } from "@/lib/types";
import { generateQuiz, generateQuizByLessons, getBookList, getLessons, getItemsByLesson } from "@/lib/quiz";
import QuizCard from "./QuizCard";
import Pagination from "./Pagination";
import ScoreBoard from "./ScoreBoard";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface QuizProps {
  bookSlug: BookSlug;
}

type QuizPhase = "setup" | "quiz" | "finished";
type ExamType = "instant" | "endReview";

const QUESTIONS_PER_PAGE = 5;

export default function Quiz({ bookSlug }: QuizProps) {
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number | 0>(20);
  const [timeLimit, setTimeLimit] = useState(0);
  const [examType, setExamType] = useState<ExamType>("instant");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submittedByTimeout, setSubmittedByTimeout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const lessons = useMemo(() => getLessons(bookSlug), [bookSlug]);
  const books = getBookList();
  const config = BOOKS[bookSlug];

  const handleLessonToggle = (lesson: number) => {
    setSelectedLessons((prev) =>
      prev.includes(lesson) ? prev.filter((l) => l !== lesson) : [...prev, lesson]
    );
  };

  const handleSelectAll = () => {
    setSelectedLessons(selectedLessons.length === lessons.length ? [] : [...lessons]);
  };

  const totalItems = useMemo(() => {
    if (selectedLessons.length === 0) return 0;
    return selectedLessons.reduce((sum, l) => sum + getItemsByLesson(bookSlug, l).length, 0);
  }, [selectedLessons, bookSlug]);

  const effectiveCount = questionCount === 0 ? totalItems : questionCount;

  const finishQuiz = useCallback((byTimeout = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (byTimeout) setSubmittedByTimeout(true);
    setPhase("finished");
  }, []);

  const startQuiz = () => {
    setPhase("quiz");
    setCurrentPage(1);
    setAnswers({});
    setSubmittedByTimeout(false);
    if (timeLimit > 0) {
      setTimeRemaining(timeLimit * 60);
    }
  };

  const questions = useMemo(() => {
    if (phase !== "quiz" && phase !== "finished") return [];
    if (selectedLessons.length === lessons.length || selectedLessons.length === 0) {
      return generateQuiz(bookSlug, effectiveCount);
    }
    return generateQuizByLessons(bookSlug, selectedLessons, effectiveCount);
  }, [phase, bookSlug, selectedLessons, lessons.length, effectiveCount]);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, currentPage]);

  const answeredCount = Object.keys(answers).length;
  const remainingCount = questions.length - answeredCount;

  const score = useMemo(() => {
    return Object.entries(answers).filter(([id, answer]) => {
      const question = questions.find((q) => q.id === id);
      return question?.correctAnswer === answer;
    }).length;
  }, [answers, questions]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentPage(1);
    setSubmittedByTimeout(false);
    setPhase("quiz");
    if (timeLimit > 0) setTimeRemaining(timeLimit * 60);
  };

  const handleBackToSetup = () => {
    setPhase("setup");
    setAnswers({});
    setCurrentPage(1);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer
  useEffect(() => {
    if (phase === "quiz" && timeLimit > 0 && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            finishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, timeLimit, timeRemaining, finishQuiz]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // SETUP PHASE
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <a href="#lesson-select" className="skip-link">Skip to lesson selection</a>
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/exam" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] justify-center -ml-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="hidden sm:inline">Back</span>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-center truncate px-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">{config?.title}</span>
                <span className="hidden sm:inline text-slate-400 font-normal text-base ml-2">- Exam Setup</span>
              </h1>
              <div className="w-10 sm:w-20" />
            </div>
          </div>
        </header>

        <main id="lesson-select" className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-2xl">
          {/* Select All */}
          <div className="mb-6">
            <button onClick={handleSelectAll} className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium min-h-[56px] flex items-center justify-between ${selectedLessons.length === lessons.length ? "border-green-500 bg-green-500/20 text-green-300" : "border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-green-500/50 hover:bg-slate-700/50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${selectedLessons.length === lessons.length ? "border-green-500 bg-green-500" : "border-slate-500"}`}>
                  {selectedLessons.length === lessons.length && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span>All Lessons</span>
              </div>
              <span className="text-sm text-slate-400">{lessons.length} lessons</span>
            </button>
          </div>

          {/* Individual Lessons */}
          <div className="space-y-2 mb-8">
            {lessons.map((lesson) => {
              const count = getItemsByLesson(bookSlug, lesson).length;
              const isSelected = selectedLessons.includes(lesson);
              return (
                <button key={lesson} onClick={() => handleLessonToggle(lesson)} className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium min-h-[56px] flex items-center justify-between ${isSelected ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? "border-purple-500 bg-purple-500" : "border-slate-500"}`}>
                      {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span>Lesson {lesson}</span>
                  </div>
                  <span className="text-sm text-slate-400">{count} items</span>
                </button>
              );
            })}
          </div>

          {/* Question count */}
          <div className="mb-6 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <label className="text-sm text-slate-400 mb-3 block">How many questions?</label>
            <div className="flex gap-2">
              {[10, 15, 20, 30, 0].map((count) => (
                <button key={count} onClick={() => setQuestionCount(count)} className={`flex-1 py-2.5 rounded-lg font-medium transition-all min-h-[44px] ${questionCount === count ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"}`}>
                  {count === 0 ? "All" : count}
                </button>
              ))}
            </div>
            {selectedLessons.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {totalItems} items available{questionCount !== 0 && `, ${Math.min(questionCount, totalItems)} will be selected`}
              </p>
            )}
          </div>

          {/* Time Limit */}
          <div className="mb-6 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <label className="text-sm text-slate-400 mb-3 block">Time Limit</label>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map((t) => (
                <button key={t} onClick={() => setTimeLimit(t)} className={`flex-1 py-2.5 rounded-lg font-medium transition-all min-h-[44px] ${timeLimit === t ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"}`}>
                  {t === 0 ? "None" : `${t}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Type */}
          <div className="mb-8 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
            <label className="text-sm text-slate-400 mb-3 block">Feedback Type</label>
            <div className="flex gap-2">
              <button onClick={() => setExamType("instant")} className={`flex-1 py-3 rounded-lg font-medium transition-all min-h-[56px] text-left px-4 ${examType === "instant" ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"}`}>
                <span className="block text-sm font-bold">Instant</span>
                <span className="block text-xs opacity-80 mt-0.5">See answer right away</span>
              </button>
              <button onClick={() => setExamType("endReview")} className={`flex-1 py-3 rounded-lg font-medium transition-all min-h-[56px] text-left px-4 ${examType === "endReview" ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"}`}>
                <span className="block text-sm font-bold">End Review</span>
                <span className="block text-xs opacity-80 mt-0.5">See all results at the end</span>
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button onClick={startQuiz} disabled={selectedLessons.length === 0} className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px]">
            {selectedLessons.length === 0 ? "Select lessons to start" : `Start Exam`}
          </button>
          {selectedLessons.length > 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">
              {effectiveCount} questions{timeLimit > 0 && ` • ${timeLimit} min`}{examType === "instant" ? " • Instant feedback" : " • End review"}
            </p>
          )}
        </main>
      </div>
    );
  }

  // FINISHED PHASE
  if (phase === "finished") {
    return (
      <ScoreBoard
        score={score}
        total={questions.length}
        answers={answers}
        questions={questions}
        onRestart={handleRestart}
        bookSlug={bookSlug}
        onBackToSetup={handleBackToSetup}
        timeLimit={timeLimit}
        submittedByTimeout={submittedByTimeout}
      />
    );
  }

  // QUIZ PHASE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <a href="#quiz-content" className="skip-link">Skip to quiz content</a>

      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="mb-2">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>{answeredCount} answered</span>
              <span>{remainingCount} remaining</span>
              <span>{questions.length} total</span>
            </div>
            <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={handleBackToSetup} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] justify-center -ml-2" aria-label="Go back to lesson selection">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">Back</span>
            </button>

            {timeLimit > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeRemaining <= 60 ? "bg-red-500/20 text-red-400 border border-red-500/30" : timeRemaining <= 300 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : "bg-slate-700/50 text-slate-300 border border-slate-600/50"}`} role="timer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formatTime(timeRemaining)}
              </div>
            )}

            <div className="text-sm sm:text-lg text-slate-400">
              <span className="font-bold text-white">{score}</span>
              <span className="text-slate-600">/{answeredCount}</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-all min-h-[44px]" aria-label="Quick menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50" role="menu">
                  <div className="p-2">
                    <Link href={`/read/${bookSlug}`} onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-green-500/20 hover:text-green-300 transition-colors flex items-center gap-3 min-h-[44px]" role="menuitem">📖 Read Mode</Link>
                    <button onClick={() => { handleBackToSetup(); setMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/30 hover:text-white transition-colors flex items-center gap-3 min-h-[44px]" role="menuitem">🔄 Change Lessons</button>
                    <Link href="/" onClick={() => setMenuOpen(false)} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/30 hover:text-white transition-colors flex items-center gap-3 min-h-[44px]" role="menuitem">🏠 Home</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="quiz-content" className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {currentQuestions.map((question, index) => (
            <QuizCard
              key={question.id}
              question={question}
              questionNumber={(currentPage - 1) * QUESTIONS_PER_PAGE + index + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[question.id] || null}
              onAnswer={(answer) => handleAnswer(question.id, answer)}
              showFeedback={examType === "instant"}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button onClick={handlePrev} disabled={currentPage === 1} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all min-h-[44px]">Previous</button>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          <button onClick={handleNext} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25 min-h-[44px]">
            {currentPage === totalPages ? "Finish" : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
}
