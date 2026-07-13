"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400"
        aria-label="Go to previous page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-slate-500" aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-medium transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400 ${
                page === currentPage
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/25"
                  : "border border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-purple-500/50 hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400"
        aria-label="Go to next page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
