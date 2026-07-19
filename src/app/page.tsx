import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <a href="#mode-options" className="skip-link">
        Skip to mode selection
      </a>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">
              Irodori
            </span>{" "}
            Vocabulary
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            アイロドリ語彙 - Choose a mode to start
          </p>
          <Link
            href="/jft"
            className="inline-block mt-4 text-xs text-slate-500 hover:text-pink-400 transition-colors"
          >
            🔒 JFT প্রস্তুতি
          </Link>
        </header>

        <nav
          id="mode-options"
          aria-label="App modes"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
        >
          {/* Read Mode Card */}
          <Link
            href="/read"
            className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 sm:p-8 text-left transition-all duration-300 hover:border-green-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1 focus-visible:border-green-400"
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-green-500 opacity-80" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-300 transition-colors">
                  Read Mode
                </h2>
                <p className="text-slate-400 text-sm">
                  Browse vocabulary lesson by lesson with images
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Exam Mode Card */}
          <Link
            href="/exam"
            className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 sm:p-8 text-left transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 focus-visible:border-purple-400"
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-purple-500 opacity-80" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-300 transition-colors">
                  Exam Mode
                </h2>
                <p className="text-slate-400 text-sm">
                  Test your knowledge with image-based quizzes
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </nav>
      </main>
    </div>
  );
}
