"use client";

import { useState } from "react";
import { VocabItem } from "@/lib/types";
import Image from "next/image";

interface VocabCardProps {
  item: VocabItem;
  showMeaning?: boolean;
}

export default function VocabCard({ item, showMeaning = true }: VocabCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-purple-500/30 transition-all duration-300 group"
      role="article"
      aria-label={`Vocabulary: ${item.hiragana || item.romaji}`}
    >
      <button
        onClick={handleFlip}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400"
        aria-label={`Tap to ${isFlipped ? 'show image' : 'show details'} for ${item.hiragana || item.romaji}`}
      >
        <div className="relative w-full aspect-square bg-white">
          <Image
            src={item.imageUrl}
            alt={`Illustration for ${item.hiragana || item.romaji}`}
            fill
            className={`object-contain p-3 transition-opacity duration-300 ${isFlipped ? 'opacity-30' : 'opacity-100'}`}
            unoptimized
          />
          {isFlipped && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-3">
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">
                {item.hiragana || item.romaji}
              </p>
              {item.kanji && (
                <p className="text-base sm:text-lg text-slate-300 mb-1">{item.kanji}</p>
              )}
              <p className="text-xs sm:text-sm text-slate-400">{item.romaji}</p>
              {showMeaning && item.meaning && (
                <p className="text-xs sm:text-sm text-purple-300 mt-2 font-medium">
                  {item.meaning}
                </p>
              )}
            </div>
          )}
        </div>
      </button>

      <div className="p-3 sm:p-4 text-center">
        <p className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
          {item.hiragana || item.romaji}
        </p>
        {item.kanji && (
          <p className="text-sm sm:text-lg text-slate-300 mb-0.5 sm:mb-1">{item.kanji}</p>
        )}
        <p className="text-xs sm:text-sm text-slate-400">{item.romaji}</p>
        {showMeaning && item.meaning && (
          <p className="text-xs sm:text-sm text-purple-300 mt-1 sm:mt-2 font-medium">
            {item.meaning}
          </p>
        )}
      </div>
    </div>
  );
}
