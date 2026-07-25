import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
    const outPath = join(tmpdir(), `tts-${id}.mp3`);

    const script = `edge-tts --voice bn-BD-NabanitaNeural --text "${text.replace(/"/g, '\\"')}" --write-media "${outPath}"`;

    await new Promise<void>((resolve, reject) => {
      exec(script, { timeout: 30000 }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const audioBuffer = await readFile(outPath);
    await unlink(outPath).catch(() => {});

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
