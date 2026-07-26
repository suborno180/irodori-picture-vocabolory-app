const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'jft__reading_preparation.json'), 'utf-8'));
const outDir = path.join(__dirname, '..', 'data', 'jft__reading_preparation');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const para of data.paragraphs) {
  const out = {
    ...para,
    isImportent: false
  };
  fs.writeFileSync(path.join(outDir, `${para.id}.json`), JSON.stringify(out, null, 4), 'utf-8');
}

console.log(`Split ${data.paragraphs.length} paragraphs into ${outDir}`);
