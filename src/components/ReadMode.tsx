"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { BookSlug, BOOKS } from "@/lib/types";
import { getBookData, getLessons, getItemsByLesson, getBookList } from "@/lib/quiz";
import VocabCard from "./VocabCard";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ReadModeProps {
  bookSlug: BookSlug;
}

export default function ReadMode({ bookSlug }: ReadModeProps) {
  const searchParams = useSearchParams();
  const initialLesson = searchParams.get("lesson");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(
    initialLesson ? parseInt(initialLesson, 10) : null
  );
  const [showAll, setShowAll] = useState(!initialLesson);
  const [menuOpen, setMenuOpen] = useState(false);
  const lessonScrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const bookData = getBookData(bookSlug);
  const lessons = useMemo(() => getLessons(bookSlug), [bookSlug]);
  const config = BOOKS[bookSlug];
  const books = getBookList();

  const displayItems = useMemo(() => {
    if (showAll && bookData) return bookData.items;
    if (selectedLesson !== null) return getItemsByLesson(bookSlug, selectedLesson);
    return [];
  }, [showAll, selectedLesson, bookSlug, bookData]);

  const handleLessonClick = (lesson: number | null) => {
    if (lesson === null) {
      setShowAll(true);
      setSelectedLesson(null);
      router.replace(`/read/${bookSlug}`);
    } else {
      setSelectedLesson(lesson);
      setShowAll(false);
      router.replace(`/read/${bookSlug}?lesson=${lesson}`);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <a href="#vocab-grid" className="skip-link">
        Skip to vocabulary list
      </a>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/read"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] justify-center -ml-2 focus-visible:border-slate-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>

            <h1 className="text-lg sm:text-2xl font-bold text-center truncate px-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
                {config?.title}
              </span>
              <span className="hidden sm:inline text-slate-400 font-normal text-base ml-2">- Read</span>
            </h1>

            {/* Quick-switch menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-all min-h-[44px]"
                aria-label="Quick menu - switch mode or book"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50" role="menu">
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-xs text-slate-500 uppercase tracking-wider">Switch Mode</p>
                    <Link
                      href={`/read/${bookSlug}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-green-500/20 hover:text-green-300 transition-colors flex items-center gap-3 min-h-[44px]"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read Mode
                      <span className="ml-auto text-xs text-green-400 font-medium">current</span>
                    </Link>
                    <Link
                      href={`/exam/${bookSlug}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors flex items-center gap-3 min-h-[44px]"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Exam Mode
                      <span className="ml-auto text-xs text-slate-600">📝</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-700/50 p-2">
                    <p className="px-3 py-1.5 text-xs text-slate-500 uppercase tracking-wider">Switch Book</p>
                    {books.map((book) => (
                      <Link
                        key={book.slug}
                        href={`/read/${book.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 min-h-[44px] ${
                          book.slug === bookSlug
                            ? "bg-slate-700/50 text-white font-medium"
                            : "text-slate-400 hover:bg-slate-700/30 hover:text-white"
                        }`}
                        role="menuitem"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${BOOKS[book.slug].color}`} />
                        {book.title}
                        {book.slug === bookSlug && (
                          <span className="ml-auto text-xs text-slate-500">current</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-slate-700/50 p-2">
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/30 hover:text-white transition-colors flex items-center gap-3 min-h-[44px]"
                      role="menuitem"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Lesson Selector */}
        <nav
          aria-label="Lesson filter"
          className="mb-6 sm:mb-8"
        >
          <div
            ref={lessonScrollRef}
            className="lesson-scroll flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
            role="radiogroup"
            aria-label="Select a lesson to filter vocabulary"
          >
            <button
              onClick={() => handleLessonClick(null)}
              role="radio"
              aria-checked={showAll}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 snap-start shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                showAll
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50"
              }`}
            >
              All ({bookData?.items.length || 0})
            </button>
            {lessons.map((lesson) => {
              const count = getItemsByLesson(bookSlug, lesson).length;
              const isActive = selectedLesson === lesson && !showAll;
              return (
                <button
                  key={lesson}
                  onClick={() => handleLessonClick(lesson)}
                  role="radio"
                  aria-checked={isActive}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 snap-start shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50"
                  }`}
                >
                  Lesson {lesson} ({count})
                </button>
              );
            })}
          </div>
        </nav>

        {/* Vocab Grid */}
        {(showAll || selectedLesson !== null) ? (
          <section id="vocab-grid" aria-label="Vocabulary items" className="max-w-6xl mx-auto">
            <p className="text-center text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base" aria-live="polite" aria-atomic="true">
              {displayItems.length} vocabulary items
              {selectedLesson !== null && ` in Lesson ${selectedLesson}`}
            </p>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
              role="list"
            >
              {displayItems.map((item) => (
                <div role="listitem" key={item.id}>
                  <VocabCard item={item} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center text-slate-400 mt-12 sm:mt-16 px-4" role="status">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg sm:text-xl">Select a lesson or click &quot;All&quot; to start reading</p>
          </div>
        )}
      </main>
    </div>
  );
}
