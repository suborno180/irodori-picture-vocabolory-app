// Romaji → Hiragana/Katakana converter
// Matches the converter in scripts/scraper.ts

const BASE: Record<string, string> = {
  kya:"きゃ",kyu:"きゅ",kyo:"きょ",sha:"しゃ",shu:"しゅ",sho:"しょ",
  sya:"しゃ",syu:"しゅ",syo:"しょ",cha:"ちゃ",chu:"ちゅ",cho:"ちょ",
  tya:"ちゃ",tyu:"ちゅ",tyo:"ちょ",nya:"にゃ",nyu:"にゅ",nyo:"にょ",
  hya:"ひゃ",hyu:"ひゅ",hyo:"ひょ",mya:"みゃ",myu:"みゅ",myo:"みょ",
  rya:"りゃ",ryu:"りゅ",ryo:"りょ",gya:"ぎゃ",gyu:"ぎゅ",gyo:"ぎょ",
  ja:"じゃ",ju:"じゅ",jo:"じょ",bya:"びゃ",byu:"びゅ",byo:"びょ",
  pya:"ぴゃ",pyu:"ぴゅ",pyo:"ぴょ",shi:"し",tsu:"つ",chi:"ち",fu:"ふ",fi:"ふぃ",
  ka:"か",ki:"き",ku:"く",ke:"け",ko:"こ",sa:"さ",su:"す",se:"せ",so:"そ",
  ta:"た",te:"て",to:"と",na:"な",ni:"に",nu:"ぬ",ne:"ね",no:"の",
  ha:"は",hi:"ひ",he:"へ",ho:"ほ",ma:"ま",mi:"み",mu:"む",me:"め",mo:"も",
  ya:"や",yu:"ゆ",yo:"よ",ra:"ら",ri:"り",ru:"る",re:"れ",ro:"ろ",
  wa:"わ",wo:"を",ga:"が",gi:"ぎ",gu:"ぐ",ge:"げ",go:"ご",
  za:"ざ",ji:"じ",zu:"ず",ze:"ぜ",zo:"ぞ",da:"だ",du:"づ",de:"で",do:"ど",
  ba:"ば",bi:"び",bu:"ぶ",be:"べ",bo:"ぼ",pa:"ぱ",pi:"ぴ",pu:"ぷ",pe:"ぺ",po:"ぽ",
  a:"あ",i:"い",u:"う",e:"え",o:"お",
};
const BASE_KEYS = Object.keys(BASE).sort((a, b) => b.length - a.length);

function toHiraganaRaw(romaji: string): string {
  const s = romaji.toLowerCase().replace(/[^a-z-]/g, "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "-") { out += "-"; i++; continue; }
    if (i + 1 < s.length && c === s[i+1] && "kbdgptcjsrzfb".includes(c) && c !== "n") { out += "っ"; i++; continue; }
    if (c === "n" && i + 1 < s.length && "bcdfghjklmpqrstvwxyz".includes(s[i+1])) { out += "ん"; i++; continue; }
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
  if (h.endsWith("わ") && romaji.toLowerCase().endsWith("wa")) {
    h = h.slice(0, -1) + "は";
  }
  return h;
}

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
  "ゃ":"ャ","ゅ":"ュ","ょ":"ョ","っ":"ッ",
  "しゅう":"シュウ","じゅう":"ジュウ","きゅう":"キュウ",
  "しゅく":"シュク","ぎゅう":"ギュウ",
};

function toKatakana(h: string): string {
  let r = h;
  for (const [h2, k] of Object.entries(KATA)) { if (h2.length > 1) r = r.replaceAll(h2, k); }
  r = r.split("").map(c => KATA[c] || c).join("");
  const aRow = "アカガサザタダナハバパマラワァャ";
  const iRow = "イキギシジチニヒビピミリィ";
  const uRow = "ウクグスズツヌフブプムルュ";
  const eRow = "ケゲセゼテネヘベペメレェ";
  const oRow = "コゴソゾトドノホボポモロヲ";
  for (const k of aRow) r = r.replaceAll(k + "ア", k + "ー");
  for (const k of iRow) r = r.replaceAll(k + "イ", k + "ー");
  for (const k of uRow) r = r.replaceAll(k + "ウ", k + "ー");
  for (const k of eRow) { r = r.replaceAll(k + "エ", k + "ー"); r = r.replaceAll(k + "イ", k + "ー"); }
  for (const k of oRow) r = r.replaceAll(k + "オ", k + "ー");
  return r;
}

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

export function romajiToJapanese(romaji: string): string {
  const h = toHiragana(romaji);
  if (KATAKANA_WORDS.has(romaji.toLowerCase())) return toKatakana(h);
  return h;
}

export function isKatakanaWord(romaji: string): boolean {
  return KATAKANA_WORDS.has(romaji.toLowerCase());
}
