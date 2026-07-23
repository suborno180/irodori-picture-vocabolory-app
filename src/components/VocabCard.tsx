"use client";

import { useState, useCallback } from "react";
import { VocabItem } from "@/lib/types";
import Image from "next/image";

interface VocabCardProps {
  item: VocabItem;
  showMeaning?: boolean;
}

export default function VocabCard({ item, showMeaning = true }: VocabCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(item.hiragana || item.romaji);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith("ja"));
    if (jaVoice) utterance.voice = jaVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [isSpeaking, item.hiragana, item.romaji]);

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
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isSpeaking
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : "bg-white/10 text-white border border-white/20 hover:bg-purple-500/20 hover:border-purple-500/30"
                }`}
                aria-label={isSpeaking ? "Speaking..." : `Speak ${item.hiragana || item.romaji}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                {isSpeaking ? "Speaking..." : "Speak"}
              </button>
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
        <button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className={`mt-2 sm:mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] ${
            isSpeaking
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30"
          }`}
          aria-label={isSpeaking ? "Speaking..." : `Speak ${item.hiragana || item.romaji}`}
        >
          {isSpeaking ? (
            <>
              <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              Speaking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              Speak
            </>
          )}
        </button>
      </div>
    </div>
  );
}
