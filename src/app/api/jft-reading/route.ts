import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface KanjiItem {
  kanji: string;
  furigana: string;
  bangla: string;
}

interface Question {
  id: string;
  question: string;
  question_bangla: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Paragraph {
  id: number;
  title: string;
  title_furigana: string;
  title_bangla: string;
  title_english: string;
  reading: {
    with_kanji: string;
    furigana: string;
    bangla: string;
  };
  questions: Question[];
  kanji_list: KanjiItem[];
  isImportent: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data", "jft__reading_preparation");

function readAllFiles(): { files: string[]; exists: boolean } {
  if (!fs.existsSync(DATA_DIR)) {
    return { files: [], exists: false };
  }
  const files = fs.readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => {
      const numA = parseInt(a.replace(".json", ""));
      const numB = parseInt(b.replace(".json", ""));
      return numA - numB;
    });
  return { files, exists: true };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const id = searchParams.get("id");
    const importantOnly = searchParams.get("important") === "true";

    const { files, exists } = readAllFiles();
    if (!exists || files.length === 0) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    if (id) {
      const targetFile = `${id}.json`;
      if (!files.includes(targetFile)) {
        return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
      }
      const filePath = path.join(DATA_DIR, targetFile);
      const data: Paragraph = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return NextResponse.json({ paragraph: data });
    }

    let filteredFiles = files;
    if (importantOnly) {
      filteredFiles = files.filter((f) => {
        const data: Paragraph = JSON.parse(
          fs.readFileSync(path.join(DATA_DIR, f), "utf-8")
        );
        return data.isImportent;
      });
    }

    const totalParagraphs = filteredFiles.length;
    const totalPages = Math.ceil(totalParagraphs / limit);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));

    const startIndex = (validPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalParagraphs);
    const selectedFiles = filteredFiles.slice(startIndex, endIndex);

    const paragraphs: Paragraph[] = [];
    for (const file of selectedFiles) {
      const filePath = path.join(DATA_DIR, file);
      const data: Paragraph = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      paragraphs.push(data);
    }

    return NextResponse.json({
      paragraphs,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalParagraphs,
        limit,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isImportent } = body;

    if (typeof id !== "number" || typeof isImportent !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const targetFile = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(targetFile)) {
      return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
    }

    const data: Paragraph = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
    data.isImportent = isImportent;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 4), "utf-8");

    return NextResponse.json({ paragraph: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
