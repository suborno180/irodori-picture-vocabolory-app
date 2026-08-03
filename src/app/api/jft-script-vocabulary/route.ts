import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ScriptVocabQuestion {
  id: number;
  type: "fill_blank" | "kanji_reading";
  sentence: string;
  sentence_bn: string;
  underlinedKanji?: string;
  options: string[];
  options_bn: string[];
  correctAnswerIndex: number;
  explanation: string;
  explanation_bn: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1");
    const id = searchParams.get("id");

    const dataDir = path.join(process.cwd(), "data", "jft_script_vocabulary");

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ error: "Data directory not found" }, { status: 404 });
    }

    const files = fs.readdirSync(dataDir)
      .filter((f) => f.endsWith(".json"))
      .sort((a, b) => {
        const numA = parseInt(a.replace(".json", ""));
        const numB = parseInt(b.replace(".json", ""));
        return numA - numB;
      });

    if (files.length === 0) {
      return NextResponse.json({ error: "No questions found" }, { status: 404 });
    }

    if (id) {
      const targetFile = `${id}.json`;
      if (!files.includes(targetFile)) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }
      const filePath = path.join(dataDir, targetFile);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return NextResponse.json({ question: data });
    }

    const totalQuestions = files.length;
    const totalPages = Math.ceil(totalQuestions / limit);
    const validPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (validPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalQuestions);
    const selectedFiles = files.slice(startIndex, endIndex);

    const questions: ScriptVocabQuestion[] = [];
    for (const file of selectedFiles) {
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      questions.push(data);
    }

    return NextResponse.json({
      questions,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalQuestions,
        limit,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
