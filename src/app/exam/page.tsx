"use client";

import Image from "next/image";
import Link from "next/link";
import { BookSlug, BOOKS } from "@/lib/types";
import { getBookList } from "@/lib/quiz";

export default function ExamPage() {
  const books = getBookList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <a href="#book-list" className="skip-link">
        Skip to book list
      </a>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <header className="text-center mb-10 sm:mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 sm:mb-8 focus-visible:border-slate-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
              Irodori
            </span>{" "}
            Exam Mode
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Choose a book to start the quiz
          </p>
        </header>

        <nav
          id="book-list"
          aria-label="Available books"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
        >
          {books.map((book) => {
            const config = BOOKS[book.slug];
            return (
              <Link
                key={book.slug}
                href={`/exam/${book.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 text-left transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 focus-visible:border-purple-400"
              >
                <div className="relative w-full overflow-hidden">
                  <Image
                    src={config.coverImage}
                    alt={`${book.title} book cover`}
                    width={400}
                    height={560}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                      {book.title}
                    </h2>
                    <p className="text-slate-300 text-sm">
                      {book.itemCount} vocabulary items
                    </p>
                  </div>
                </div>
                <div
                  className={`absolute top-0 left-0 h-1 w-full ${config.color} opacity-80`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/exam/starter"
            className="inline-block px-6 sm:px-8 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25"
          >
            Start with Starter
          </Link>
        </div>
      </main>
    </div>
  );
}
