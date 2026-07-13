import { BookData, QuizQuestion, VocabItem, BookSlug, BOOKS } from "./types";
import starterData from "../../data/starter.json";
import elementary1Data from "../../data/elementary1.json";
import elementary2Data from "../../data/elementary2.json";
import preIntermediateData from "../../data/preIntermediate.json";

const allBooks: Record<BookSlug, BookData> = {
  starter: starterData as BookData,
  elementary1: elementary1Data as BookData,
  elementary2: elementary2Data as BookData,
  preIntermediate: preIntermediateData as BookData,
};

export function getBookData(slug: BookSlug): BookData | null {
  return allBooks[slug] || null;
}

export function getBookList() {
  return Object.entries(BOOKS).map(([slug, config]) => ({
    slug: slug as BookSlug,
    title: config.title,
    color: config.color,
    itemCount: (allBooks[slug as BookSlug]?.items.length) || 0,
  }));
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getWrongAnswers(
  correctItem: VocabItem,
  allItems: VocabItem[],
  count: number = 3
): string[] {
  const others = allItems.filter((item) => item.id !== correctItem.id);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map((item) => item.hiragana || item.romaji);
}

export function generateQuiz(
  slug: BookSlug,
  count: number = 10
): QuizQuestion[] {
  const bookData = getBookData(slug);
  if (!bookData) return [];

  const shuffledItems = shuffleArray(bookData.items);
  const selectedItems = shuffledItems.slice(0, Math.min(count, shuffledItems.length));

  return selectedItems.map((item) => {
    const wrongAnswers = getWrongAnswers(item, bookData.items, 3);
    const correctAnswer = item.hiragana || item.romaji;
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);

    return {
      id: item.id,
      imageUrl: item.imageUrl,
      correctAnswer,
      options,
      kanji: item.kanji,
      hiragana: item.hiragana,
      meaning: item.meaning,
    };
  });
}

export function generateQuizByLessons(
  slug: BookSlug,
  lessons: number[],
  count: number = 10
): QuizQuestion[] {
  const bookData = getBookData(slug);
  if (!bookData || lessons.length === 0) return [];

  const filteredItems = bookData.items.filter((item) =>
    lessons.includes(item.lesson)
  );

  const shuffledItems = shuffleArray(filteredItems);
  const selectedItems = shuffledItems.slice(0, Math.min(count, shuffledItems.length));

  return selectedItems.map((item) => {
    const wrongAnswers = getWrongAnswers(item, filteredItems, 3);
    const correctAnswer = item.hiragana || item.romaji;
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);

    return {
      id: item.id,
      imageUrl: item.imageUrl,
      correctAnswer,
      options,
      kanji: item.kanji,
      hiragana: item.hiragana,
      meaning: item.meaning,
    };
  });
}

export function getLessons(slug: BookSlug): number[] {
  const bookData = getBookData(slug);
  if (!bookData) return [];
  const lessons = [...new Set(bookData.items.map((item) => item.lesson))];
  return lessons.sort((a, b) => a - b);
}

export function getItemsByLesson(slug: BookSlug, lesson: number): VocabItem[] {
  const bookData = getBookData(slug);
  if (!bookData) return [];
  return bookData.items.filter((item) => item.lesson === lesson);
}

export function generateQuizFromAllBooks(count: number = 10): QuizQuestion[] {
  const allItems: VocabItem[] = [];
  Object.values(allBooks).forEach((book) => {
    if (book) allItems.push(...book.items);
  });

  const shuffledItems = shuffleArray(allItems);
  const selectedItems = shuffledItems.slice(0, Math.min(count, shuffledItems.length));

  return selectedItems.map((item) => {
    const wrongAnswers = getWrongAnswers(item, allItems, 3);
    const correctAnswer = item.hiragana || item.romaji;
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);

    return {
      id: item.id,
      imageUrl: item.imageUrl,
      correctAnswer,
      options,
      kanji: item.kanji,
      hiragana: item.hiragana,
      meaning: item.meaning,
    };
  });
}
