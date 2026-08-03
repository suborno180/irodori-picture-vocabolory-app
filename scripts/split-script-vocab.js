const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'jft_script_vocabulary.json'), 'utf-8'));
const outDir = path.join(__dirname, '..', 'data', 'jft_script_vocabulary');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const question of data.questions) {
  fs.writeFileSync(path.join(outDir, `${question.id}.json`), JSON.stringify(question, null, 4), 'utf-8');
}

console.log(`Split ${data.questions.length} questions into ${outDir}`);
