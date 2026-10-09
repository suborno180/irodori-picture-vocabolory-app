import Link from "next/link";
import ExternalCard from "@/components/ExternalCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <a href="#mode-options" className="skip-link">
        Skip to mode selection
      </a>

      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-violet-400">
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

        <section aria-label="ইরুদোরি থেরাপী" className="max-w-3xl mx-auto mt-10 sm:mt-14">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-400 mb-4 text-center">
            ইরুদোরি ভাইয়ের থেরাপী সাইট
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <ExternalCard
              href="https://picture-theraphy-irodoribhai-special-forallhwihfjhfkielkps.pages.dev/"
              accent="amber"
              title="পিকচার থেরাপী"
              description="৫৪ লেসনের সব ছবি দিয়ে বানানো টেস্ট"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              }
            />
            <ExternalCard
              href="https://xyz-vocabulary-practice-and-memorising.pages.dev/"
              accent="rose"
              title="ভোকাবুলারি থেরাপী"
              description="ফ্ল্যাশকার্ডে শিখুন, বার বার এক্সাম দিন"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm5 5v8m3-8v8" />
              }
            />
            <ExternalCard
              href="https://kanjitestallxyzbookhjjdfghhgggdtttehhhdggikiiiiujeuujhdjjj.pages.dev/"
              accent="indigo"
              title="কাঞ্জি থেরাপী"
              description="সব বইয়ের ৪৩১টি কাঞ্জি টেস্ট"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5.5A2.5 2.5 0 016.5 3H12v17H6.5A2.5 2.5 0 004 22V5.5zM20 5.5A2.5 2.5 0 0017.5 3H12v17h5.5A2.5 2.5 0 0020 22V5.5z" />
              }
            />
            <ExternalCard
              href="https://expression-theraphy-byirodorivaiuyrhhdhhhjekdhhdhhhhjj.pages.dev/"
              accent="emerald"
              title="এক্সপ্রেশন থেরাপী"
              description="সব এক্সপ্রেশন ও কনভার্সেশন টেস্ট"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5h8m-8 3h5m8.25-6.75a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6.75v7.5A2.25 2.25 0 005.25 16.5h2.6l2.4 3 2.4-3h6.1a2.25 2.25 0 002.25-2.25v-7.5z" />
              }
            />
            <ExternalCard
              href="https://lesson-based-mocktest-54-lesson-xyz-irodorivaii.pages.dev/"
              accent="cyan"
              title="লেসন মক টেস্ট"
              description="৫৪ লেসন ভিত্তিক মক টেস্ট"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              }
            />
            <ExternalCard
              href="https://3637867466783666383883jsukkk.pages.dev/"
              accent="violet"
              title="স্ক্রিপ্ট ও ভোকাবুলারি"
              description="লেসন ৩৬, ৩৭, ৩৮ এর টেস্ট"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              }
            />
            <ExternalCard
              href="https://22-36mocjkfjuurhhfjjfjsiooosijrjfuutrjjfysireujfjryhfijosr.pages.dev/"
              accent="teal"
              title="মক টেস্ট ২২-৩৬"
              description="রিসেন্ট এক্সামের প্রস্তুতি"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
