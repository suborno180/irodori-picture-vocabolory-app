"use client";

import { QuizQuestion } from "@/lib/types";
import Image from "next/image";

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}: QuizCardProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <article className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden" aria-label={`Question ${questionNumber} of ${totalQuestions}`}>
      <div className="p-4 sm:p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Question {questionNumber} / {totalQuestions}</span>
          <span className="text-sm text-slate-500" aria-hidden="true">{Math.round((questionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={questionNumber} aria-valuemin={1} aria-valuemax={totalQuestions}>
          <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-500" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="p-4 sm:p-8">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-xl overflow-hidden border-2 border-slate-600/50 bg-white">
            <Image src={question.imageUrl} alt={`Question ${questionNumber}`} fill className="object-contain p-2" unoptimized />
          </div>
        </div>

        <p className="text-center text-slate-300 mb-2 text-sm sm:text-base">このイラストの vocabulary は？</p>
        <p className="text-center text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">What vocabulary does this illustration show?</p>

        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" aria-label={`Options for question ${questionNumber}`}>
          <legend className="sr-only">Select your answer</legend>
          {question.options.map((option, index) => {
            let buttonClass = "p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-center font-medium cursor-pointer min-h-[48px] sm:min-h-[56px] w-full focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800";

            if (selectedAnswer === null) {
              buttonClass += " border-slate-600/50 bg-slate-700/30 hover:border-purple-500/50 hover:bg-slate-700/50 active:scale-[0.98]";
            } else if (option === question.correctAnswer) {
              buttonClass += " border-green-500 bg-green-500/20 text-green-300";
            } else if (option === selectedAnswer && !isCorrect) {
              buttonClass += " border-red-500 bg-red-500/20 text-red-300";
            } else {
              buttonClass += " border-slate-600/30 bg-slate-700/20 opacity-50 cursor-not-allowed";
            }

            const label = String.fromCharCode(65 + index);

            return (
              <label key={index} className={buttonClass}>
                <input type="radio" name={`q-${question.id}`} value={option} onChange={() => onAnswer(option)} disabled={selectedAnswer !== null} className="sr-only" aria-label={`${label}: ${option}`} />
                <span className="text-base sm:text-xl text-white flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-normal" aria-hidden="true">{label}</span>
                  {option}
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <div className={`mt-4 sm:mt-6 p-3 sm:p-5 rounded-xl ${isCorrect ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`} role="alert" aria-live="assertive">
            <p className={`font-semibold text-base sm:text-lg text-center ${isCorrect ? "text-green-300" : "text-red-300"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            <div className="mt-3 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{question.correctAnswer}</p>
              {question.kanji && <p className="text-base sm:text-lg text-slate-300 mt-1">{question.kanji}</p>}
              <p className="text-sm text-slate-400 mt-0.5">{question.hiragana}</p>
            </div>
            {question.meaning && (
              <div className={`mt-3 pt-3 border-t text-center ${isCorrect ? "border-green-500/20" : "border-red-500/20"}`}>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Meaning</p>
                <p className="text-base sm:text-lg text-purple-300 font-medium">{question.meaning}</p>
              </div>
            )}
            {!isCorrect && (
              <div className="mt-3 pt-3 border-t border-red-500/20 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your answer</p>
                <p className="text-base text-red-400 line-through">{selectedAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
