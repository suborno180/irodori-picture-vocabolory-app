export interface VocabItem {
  id: string;
  romaji: string;
  imageUrl: string;
  lesson: number;
  kanji: string;
  hiragana: string;
  meaning: string;
}

export interface BookData {
  book: string;
  bookTitle: string;
  items: VocabItem[];
}

export interface QuizQuestion {
  id: string;
  imageUrl: string;
  correctAnswer: string;
  options: string[];
  kanji: string;
  hiragana: string;
  meaning: string;
}

export interface QuizState {
  currentQuestion: number;
  score: number;
  answers: Record<string, string>;
  isFinished: boolean;
}

export const BOOKS = {
  starter: {
    slug: "starter",
    title: "Starter",
    color: "bg-green-500",
    url: "https://www.irodori.jpf.go.jp/en/illust/starter.html",
    imagePrefix: "X",
    bookCode: "starter",
    coverImage: "/starter.png",
  },
  elementary1: {
    slug: "elementary1",
    title: "Elementary 1",
    color: "bg-blue-500",
    url: "https://www.irodori.jpf.go.jp/en/illust/elementary01.html",
    imagePrefix: "Y",
    bookCode: "elementary01",
    coverImage: "/elementary_1.png",
  },
  elementary2: {
    slug: "elementary2",
    title: "Elementary 2",
    color: "bg-orange-500",
    url: "https://www.irodori.jpf.go.jp/en/illust/elementary02.html",
    imagePrefix: "Z",
    bookCode: "elementary02",
    coverImage: "/elementary_2.png",
  },
  preIntermediate: {
    slug: "preIntermediate",
    title: "Pre-Intermediate",
    color: "bg-purple-500",
    url: "https://www.irodori.jpf.go.jp/en/illust/pre-intermediate.html",
    imagePrefix: "ZZ",
    bookCode: "pre-intermediate",
    coverImage: "/pre-intermediate.png",
  },
} as const;

export type BookSlug = keyof typeof BOOKS;
