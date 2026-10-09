type Accent = "amber" | "rose" | "indigo" | "emerald" | "cyan" | "violet" | "teal";

const ACCENTS: Record<
  Accent,
  { bar: string; hoverBorder: string; hoverShadow: string; focusBorder: string; iconBox: string; iconText: string; titleHover: string }
> = {
  amber: {
    bar: "bg-amber-500",
    hoverBorder: "hover:border-amber-500/50",
    hoverShadow: "hover:shadow-amber-500/10",
    focusBorder: "focus-visible:border-amber-400",
    iconBox: "bg-amber-500/20",
    iconText: "text-amber-400",
    titleHover: "group-hover:text-amber-300",
  },
  rose: {
    bar: "bg-rose-500",
    hoverBorder: "hover:border-rose-500/50",
    hoverShadow: "hover:shadow-rose-500/10",
    focusBorder: "focus-visible:border-rose-400",
    iconBox: "bg-rose-500/20",
    iconText: "text-rose-400",
    titleHover: "group-hover:text-rose-300",
  },
  indigo: {
    bar: "bg-indigo-500",
    hoverBorder: "hover:border-indigo-500/50",
    hoverShadow: "hover:shadow-indigo-500/10",
    focusBorder: "focus-visible:border-indigo-400",
    iconBox: "bg-indigo-500/20",
    iconText: "text-indigo-400",
    titleHover: "group-hover:text-indigo-300",
  },
  emerald: {
    bar: "bg-emerald-500",
    hoverBorder: "hover:border-emerald-500/50",
    hoverShadow: "hover:shadow-emerald-500/10",
    focusBorder: "focus-visible:border-emerald-400",
    iconBox: "bg-emerald-500/20",
    iconText: "text-emerald-400",
    titleHover: "group-hover:text-emerald-300",
  },
  cyan: {
    bar: "bg-cyan-500",
    hoverBorder: "hover:border-cyan-500/50",
    hoverShadow: "hover:shadow-cyan-500/10",
    focusBorder: "focus-visible:border-cyan-400",
    iconBox: "bg-cyan-500/20",
    iconText: "text-cyan-400",
    titleHover: "group-hover:text-cyan-300",
  },
  violet: {
    bar: "bg-violet-500",
    hoverBorder: "hover:border-violet-500/50",
    hoverShadow: "hover:shadow-violet-500/10",
    focusBorder: "focus-visible:border-violet-400",
    iconBox: "bg-violet-500/20",
    iconText: "text-violet-400",
    titleHover: "group-hover:text-violet-300",
  },
  teal: {
    bar: "bg-teal-500",
    hoverBorder: "hover:border-teal-500/50",
    hoverShadow: "hover:shadow-teal-500/10",
    focusBorder: "focus-visible:border-teal-400",
    iconBox: "bg-teal-500/20",
    iconText: "text-teal-400",
    titleHover: "group-hover:text-teal-300",
  },
};

export default function ExternalCard({
  href,
  accent,
  title,
  description,
  icon,
}: {
  href: string;
  accent: Accent;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const a = ACCENTS[accent];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 sm:p-8 text-left transition-all duration-300 hover:bg-slate-800/80 hover:shadow-lg hover:-translate-y-1 ${a.hoverBorder} ${a.hoverShadow} ${a.focusBorder}`}
    >
      <div className={`absolute top-0 left-0 h-1 w-full ${a.bar} opacity-80`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${a.iconBox}`}
          >
            <svg
              className={`w-6 h-6 sm:w-7 sm:h-7 ${a.iconText}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {icon}
            </svg>
          </div>
          <h2
            className={`text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 transition-colors ${a.titleHover}`}
          >
            {title}
          </h2>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${a.iconBox}`}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M4 12h16" />
          </svg>
        </div>
      </div>
    </a>
  );
}
