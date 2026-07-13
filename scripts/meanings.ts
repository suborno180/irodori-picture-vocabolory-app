import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const MEANINGS_FILE = path.join(DATA_DIR, "meanings.json");

async function lookupMeaning(romaji: string): Promise<string> {
  try {
    const res = await axios.get(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(romaji)}`, { timeout: 5000 });
    const data = res.data;
    if (!data.data || data.data.length === 0) return "";
    
    // Try to find exact match by reading
    for (const entry of data.data) {
      for (const jp of entry.japanese) {
        if (jp.reading && jp.reading.toLowerCase().replace(/[ー]/g, "") === romaji.toLowerCase()) {
          if (entry.senses && entry.senses[0]) {
            return entry.senses[0].english_definitions.join(", ");
          }
        }
      }
    }
    // Fallback: use first result
    if (data.data[0].senses && data.data[0].senses[0]) {
      return data.data[0].senses[0].english_definitions.join(", ");
    }
    return "";
  } catch {
    return "";
  }
}

async function main() {
  // Collect all unique romaji from all books
  const files = ["starter", "elementary1", "elementary2", "preIntermediate"];
  const allRomaji = new Set<string>();
  const itemsByRomaji: Record<string, any[]> = {};

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${f}.json`), "utf8"));
    for (const item of data.items) {
      allRomaji.add(item.romaji);
      if (!itemsByRomaji[item.romaji]) itemsByRomaji[item.romaji] = [];
      itemsByRomaji[item.romaji].push({ file: f, item });
    }
  }

  console.log(`Total unique romaji: ${allRomaji.size}`);

  // Load existing meanings
  let existing: Record<string, string> = {};
  if (fs.existsSync(MEANINGS_FILE)) {
    existing = JSON.parse(fs.readFileSync(MEANINGS_FILE, "utf8"));
  }

  const meanings: Record<string, string> = { ...existing };
  let looked = 0;
  let cached = 0;

  for (const romaji of allRomaji) {
    if (meanings[romaji]) {
      cached++;
      continue;
    }
    
    looked++;
    if (looked % 50 === 0) console.log(`Looking up ${looked}... (${cached} cached)`);
    
    const meaning = await lookupMeaning(romaji);
    if (meaning) {
      meanings[romaji] = meaning;
    }
    
    // Save every 100 lookups
    if (looked % 100 === 0) {
      fs.writeFileSync(MEANINGS_FILE, JSON.stringify(meanings, null, 2));
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(MEANINGS_FILE, JSON.stringify(meanings, null, 2));
  
  // Apply meanings to all JSON files
  for (const f of files) {
    const filePath = path.join(DATA_DIR, `${f}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let filled = 0;
    for (const item of data.items) {
      if (!item.meaning && meanings[item.romaji]) {
        item.meaning = meanings[item.romaji];
        filled++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`${f}: filled ${filled} meanings`);
  }

  console.log(`Done! Looked up: ${looked}, Cached: ${cached}`);
}

main().catch(console.error);
