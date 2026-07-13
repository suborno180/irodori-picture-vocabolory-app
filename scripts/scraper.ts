import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://www.irodori.jpf.go.jp";
const PAGES = [
  { book: "starter", bookTitle: "Starter", url: "/en/illust/starter.html", imageDir: "starter", bookImageDir: "starter" },
  { book: "elementary1", bookTitle: "Elementary 1", url: "/en/illust/elementary01.html", imageDir: "elementary1", bookImageDir: "elementary01" },
  { book: "elementary2", bookTitle: "Elementary 2", url: "/en/illust/elementary02.html", imageDir: "elementary2", bookImageDir: "elementary02" },
  { book: "preIntermediate", bookTitle: "Pre-Intermediate", url: "/en/illust/pre-intermediate.html", imageDir: "preIntermediate", bookImageDir: "pre-intermediate" },
];

const KATAKANA_WORDS = new Set([
  "resutoran","hoteru","ofisu","basu","takushii","hikooki",
  "kureepu","pan","koohii","koora","biiru","wain","miruku","juusu",
  "supootsu","baree","tenisu","ragubii","bando","piano",
  "engeki","eiga","oongaku","rajio","terebi","konpyuutaa","keitai",
  "kamera","kankoo","ryokoo","shoppu","depaato",
  "teeburu","beddo","futon","shatsu","zubon","kutsu",
  "tesuto","kuurii","obento","fooku","supuun","naifu","koppu",
  "kinken","genkin","kurejitto","kaado","ryokin",
  "daidokoro","shokudo","hoomu","toire","shower",
  "konbini","suupaa","pasokon","waapuro","puroguramu","gaamee",
  "paatii","konsaato","fesutibaru",
  "shinryou","byouin","kusuri",
  "shinkansen","kuruma","jitensha",
  "garasu","cheezu","toosuto","hamu","bacon","salada","piza","keeki","aisu",
  "nattu","wasabi","negi","mirin","gyuunyuu","osake","soyu","miso",
  "ramen","soba","udon",
  "dansu","uta","paasoku",
  "menyuu","kaisha","nyuushoku","shuushoku","shuukatsu",
  "baito","tiketto",
  "shachoo","buchoo","kyaku","shokuin",
  "sakkingu","goru","shuuto","pasu","driburu",
]);

const BASE: Record<string, string> = {
  kya:"きゃ",kyu:"きゅ",kyo:"きょ",sha:"しゃ",shu:"しゅ",sho:"しょ",
  sya:"しゃ",syu:"しゅ",syo:"しょ",cha:"ちゃ",chu:"ちゅ",cho:"ちょ",
  tya:"ちゃ",tyu:"ちゅ",tyo:"ちょ",nya:"にゃ",nyu:"にゅ",nyo:"にょ",
  hya:"ひゃ",hyu:"ひゅ",hyo:"ひょ",mya:"みゃ",myu:"みゅ",myo:"みょ",
  rya:"りゃ",ryu:"りゅ",ryo:"りょ",gya:"ぎゃ",gyu:"ぎゅ",gyo:"ぎょ",
  ja:"じゃ",ju:"じゅ",jo:"じょ",bya:"びゃ",byu:"びゅ",byo:"びょ",
  pya:"ぴゃ",pyu:"ぴゅ",pyo:"ぴょ",shi:"し",shu:"しゅ",she:"しぇ",sho:"しょ",
  tsu:"つ",chi:"ち",fu:"ふ",fa:"ふぁ",fi:"ふぃ",fe:"ふぇ",fo:"ふぉ",
  ka:"か",ki:"き",ku:"く",ke:"け",ko:"こ",sa:"さ",su:"す",se:"せ",so:"そ",
  ta:"た",ti:"てぃ",te:"て",to:"と",tu:"つ",
  na:"な",ni:"に",nu:"ぬ",ne:"ね",no:"の",
  ha:"は",hi:"ひ",he:"へ",ho:"ほ",hu:"ふ",
  ma:"ま",mi:"み",mu:"む",me:"め",mo:"も",
  ya:"や",yu:"ゆ",yo:"よ",ra:"ら",ri:"り",ru:"る",re:"れ",ro:"ろ",
  wa:"わ",wo:"を",ga:"が",gi:"ぎ",gu:"ぐ",ge:"げ",go:"ご",
  za:"ざ",ji:"じ",zu:"ず",ze:"ぜ",zo:"ぞ",di:"ぢ",du:"づ",de:"で",do:"ど",
  ba:"ば",bi:"び",bu:"ぶ",be:"べ",bo:"ぼ",pa:"ぱ",pi:"ぴ",pu:"ぷ",pe:"ぺ",po:"ぽ",
  a:"あ",i:"い",u:"う",e:"え",o:"お",
};
const BASE_KEYS = Object.keys(BASE).sort((a,b) => b.length - a.length);

function toHiraganaRaw(romaji: string): string {
  const s = romaji.toLowerCase().replace(/[^a-z-]/g, "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "-") { out += "-"; i++; continue; }
    if (i + 1 < s.length && c === s[i+1] && "kbdgptcjsrzfb".includes(c) && c !== "n") { out += "っ"; i++; continue; }
    if (c === "n" && i + 1 < s.length && "bcdfghjklmpqrstvwxyz-".includes(s[i+1])) { out += "ん"; i++; continue; }
    if (c === "n" && i + 1 >= s.length) { out += "ん"; i++; continue; }
    if (c === "n" && i + 1 < s.length && s[i+1] === "n") {
      if (i + 2 < s.length && "aeiou".includes(s[i+2])) { out += "ん"; i++; continue; }
      out += "ん"; i += 2; continue;
    }
    let matched = false;
    for (const key of BASE_KEYS) {
      if (s.startsWith(key, i)) { out += BASE[key]; i += key.length; matched = true; break; }
    }
    if (matched) continue;
    // Skip unmatched consonants (don't leave English letters)
    if ("bcdfghjklmpqrstvwxyz".includes(c)) { i++; continue; }
    out += c; i++;
  }
  return out;
}

const O_ROW_KANA = "おこごそぞとどほぼぽもよろの";
const O_ROW_COMPOUND = ["しょ","ちょ","にょ","ひょ","みょ","りょ","ぎょ","じょ","びょ","ぴょ","きょ"];
const E_ROW_KANA = "えけげせぜてでへべぺめれね";

function fixLongVowels(h: string): string {
  let r = h;
  for (const k of O_ROW_COMPOUND) r = r.replaceAll(k + "お", k + "う");
  for (const k of O_ROW_KANA) r = r.replaceAll(k + "お", k + "う");
  for (const k of E_ROW_KANA) r = r.replaceAll(k + "え", k + "い");
  r = r.replaceAll("ああ", "あ");
  r = r.replaceAll("うう", "う");
  return r;
}

function toHiragana(romaji: string): string {
  let h = fixLongVowels(toHiraganaRaw(romaji));
  // Particle は: "wa" at end of greetings → は not わ
  if (h.endsWith("わ") && (romaji.toLowerCase().endsWith("wa"))) {
    h = h.slice(0, -1) + "は";
  }
  return h;
}

// ═══════════════════════════════════════════════════════════════════
// HIRAGANA → KATAKANA (with long vowel ー)
// ═══════════════════════════════════════════════════════════════════
const KATA: Record<string, string> = {
  "あ":"ア","い":"イ","う":"ウ","え":"エ","お":"オ",
  "か":"カ","き":"キ","く":"ク","け":"ケ","こ":"コ",
  "さ":"サ","し":"シ","す":"ス","せ":"セ","そ":"ソ",
  "た":"タ","ち":"チ","つ":"ツ","て":"テ","と":"ト",
  "な":"ナ","に":"ニ","ぬ":"ヌ","ね":"ネ","の":"ノ",
  "は":"ハ","ひ":"ヒ","ふ":"フ","へ":"ヘ","ほ":"ホ",
  "ま":"マ","み":"ミ","む":"ム","め":"メ","も":"モ",
  "や":"ヤ","ゆ":"ユ","よ":"ヨ",
  "ら":"ラ","り":"リ","る":"ル","れ":"レ","ろ":"ロ",
  "わ":"ワ","を":"ヲ","ん":"ン",
  "が":"ガ","ぎ":"ギ","ぐ":"グ","げ":"ゲ","ご":"ゴ",
  "ざ":"ザ","じ":"ジ","ず":"ズ","ぜ":"ゼ","ぞ":"ゾ",
  "だ":"ダ","ぢ":"ヂ","づ":"ヅ","で":"デ","ど":"ド",
  "ば":"バ","び":"ビ","ぶ":"ブ","べ":"ベ","ぼ":"ボ",
  "ぱ":"パ","ぴ":"ピ","ぷ":"プ","ぺ":"ペ","ぽ":"ポ",
  "きゃ":"キャ","きゅ":"キュ","きょ":"キョ",
  "しゃ":"シャ","しゅ":"シュ","しょ":"ショ",
  "ちゃ":"チャ","ちゅ":"チュ","ちょ":"チョ",
  "にゃ":"ニャ","にゅ":"ニュ","にょ":"ニョ",
  "ひゃ":"ヒャ","ひゅ":"ヒュ","ひょ":"ヒョ",
  "みゃ":"ミャ","みゅ":"ミュ","みょ":"ミョ",
  "りゃ":"リャ","りゅ":"リュ","りょ":"リョ",
  "ぎゃ":"ギャ","ぎゅ":"ギュ","ぎょ":"ギョ",
  "じゃ":"ジャ","じゅ":"ジュ","じょ":"ジョ",
  "びゃ":"ビャ","びゅ":"ビュ","びょ":"ビョ",
  "ぴゃ":"ピャ","ぴゅ":"ピュ","ぴょ":"ピョ",
  "ふぃ":"フィ","ふぇ":"フェ","ふぉ":"フォ",
  "てぃ":"ティ","でぃ":"ディ","でゅ":"デュ",
  "っ":"ッ",
};

function toKatakana(h: string): string {
  let r = h;
  for (const [h2, k] of Object.entries(KATA)) { if (h2.length > 1) r = r.replaceAll(h2, k); }
  r = r.split("").map(c => KATA[c] || c).join("");
  // Katakana long vowels: same-row vowel following a kana → ー
  // ア-row: アカガサザタダナハバパマラワ + ア → ー
  const aRow = "アカガサザタダナハバパマラワァャ";
  const iRow = "イキギシジチニヒビピミリィ";
  const uRow = "ウクグスズツヌフブプムルュ";
  const eRow = "ケゲセゼテネヘベペメレェ";
  const oRow = "コゴソゾトドノホボポモロヲ";
  for (const k of aRow) r = r.replaceAll(k + "ア", k + "ー");
  for (const k of iRow) r = r.replaceAll(k + "イ", k + "ー");
  for (const k of eRow) r = r.replaceAll(k + "イ", k + "ー"); // ei → long vowel
  for (const k of uRow) r = r.replaceAll(k + "ウ", k + "ー");
  for (const k of eRow) r = r.replaceAll(k + "エ", k + "ー");
  for (const k of oRow) r = r.replaceAll(k + "オ", k + "ー");
  return r;
}

function isKata(romaji: string): boolean {
  return KATAKANA_WORDS.has(romaji.toLowerCase().replace(/[^a-z]/g, ""));
}

function toJapanese(romaji: string): string {
  const h = toHiragana(romaji);
  return isKata(romaji) ? toKatakana(h) : h;
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════
const TESTS: [string, string][] = [
  ["shusseki",         "しゅっせき"],
  ["hajimemashoo",     "はじめましょう"],
  ["jugyoo",           "じゅぎょう"],
  ["yasumijikan",      "やすみじかん"],
  ["hai-iie",          "はい-いいえ"],
  ["kiite",            "きいて"],
  ["itte",             "いって"],
  ["mite",             "みて"],
  ["hanashite",        "はなして"],
  ["yonde",            "よんで"],
  ["kaite",            "かいて"],
  ["misete",           "みせて"],
  ["kite",             "きて"],
  ["shitsumon",        "しつもん"],
  ["ohayoo",           "おはよう"],
  ["konnichiwa",       "こんにちは"],
  ["konbanwa",         "こんばんは"],
  ["arigatoo",         "ありがとう"],
  ["sumimasen",        "すみません"],
  ["otsukaresama",     "おつかれさま"],
  ["oyasuminasai",     "おやすみなさい"],
  ["shitsureeshimasu", "しつれいします"],
  ["genki",            "げんき"],
  ["sensei",           "せんせい"],
  ["gakusei",          "がくせい"],
  ["benkyoo",          "べんきょう"],
  ["ryouri",           "りょうり"],
  ["gohan",            "ごはん"],
  ["nomimono",         "のみもの"],
  ["dookun",           "どうくん"],
  ["toire",            "トイレ"],
  ["resutoran",        "レストラン"],
  ["hoteru",           "ホテル"],
  ["terebi",           "テレビ"],
  ["basu",             "バス"],
  ["pan",              "パン"],
  ["biiru",            "ビール"],
  ["konpyuutaa",       "コンピューター"],
  ["keitai",           "ケータイ"],
  ["ofisu",            "オフィス"],
  ["kamera",           "カメラ"],
];

console.log("=== CONVERTER TESTS ===\n");
let passed = 0, failed = 0;
for (const [input, expected] of TESTS) {
  const got = toJapanese(input);
  if (got === expected) { passed++; }
  else { failed++; console.log(`FAIL: ${input} → expected "${expected}", got "${got}"`); }
}
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${TESTS.length}\n`);
if (failed > 0) { console.log("Aborting."); process.exit(1); }

// ═══════════════════════════════════════════════════════════════════
// SCRAPER
// ═══════════════════════════════════════════════════════════════════
function extractLesson(fn: string): number { const m = fn.match(/_(\d+)_/); return m ? +m[1] : 0; }
function extractRomaji(fn: string): string { const p = fn.replace(".png","").split("_"); return p.length >= 2 ? p[p.length-1] : fn.replace(".png",""); }

async function scrapePage(pc: (typeof PAGES)[number]) {
  console.log(`Scraping: ${pc.bookTitle}`);
  const res = await axios.get(`${BASE_URL}${pc.url}`);
  const $ = cheerio.load(res.data);
  const items: { id:string; romaji:string; imageUrl:string; lesson:number; kanji:string; hiragana:string; meaning:string }[] = [];
  $(".img_list ul li").each((_,el) => {
    const src = $(el).find("img").attr("src") || "";
    if (src.includes("/resize/")) {
      const fn = path.basename(src);
      const romaji = extractRomaji(fn);
      items.push({ id: fn.replace(".png","").split("_").slice(0,-1).join("_"), romaji, imageUrl: `/images/${pc.imageDir}/${fn}`, lesson: extractLesson(fn), kanji: "", hiragana: toJapanese(romaji), meaning: "" });
    }
  });
  console.log(`  Found ${items.length} items`);
  return items;
}

async function dl(url:string,dest:string) { try { const r=await axios.get(url,{responseType:"arraybuffer"}); fs.writeFileSync(dest,Buffer.from(r.data)); return true; } catch { return false; } }

async function main() {
  const outDir = path.join(process.cwd(),"data");
  const imgDir = path.join(process.cwd(),"public","images");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  for (const pc of PAGES) {
    const items = await scrapePage(pc);
    fs.writeFileSync(path.join(outDir,`${pc.book}.json`), JSON.stringify({book:pc.book,bookTitle:pc.bookTitle,items},null,2));
    const bid = path.join(imgDir,pc.imageDir);
    if (!fs.existsSync(bid)) fs.mkdirSync(bid,{recursive:true});
    let d=0;
    for (const it of items) {
      const dest = path.join(bid,path.basename(it.imageUrl));
      if (!fs.existsSync(dest)) { if (await dl(`${BASE_URL}/assets/img/illust/${pc.bookImageDir}/resize/${path.basename(it.imageUrl)}`,dest)) d++; } else d++;
    }
    console.log(`  Downloaded ${d}/${items.length}\n`);
  }
  console.log("Done!");
}
main().catch(console.error);
