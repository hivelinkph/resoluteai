// Sunburst edit: same office still, dashboard figures set to the values the user specified.
//   node scripts/login-still-kpi.mjs <landscape|portrait> [n]
import fs from 'node:fs';
process.loadEnvFile('C:/AntiGravity/ResoluteVideoGen/.env');

const orient = process.argv[2] || 'landscape';
const n = process.argv[3] || '2';
const wide = orient === 'landscape';
const size = wide ? '1536x1024' : '1024x1536';
const OUT = 'C:/AntiGravity/Resolute-h3/Assets/login';
const BASE = wide ? `${OUT}/noc-landscape-1.png` : `${OUT}/noc-portrait-2.png`;

const prompt = `Edit this photo. Keep EVERYTHING identical (office, people, faces, lighting, logo sign, skyline, camera, the dashboard layout, charts, maps and colours). Change ONLY the text and numbers on the operations dashboard wall so it reads exactly:

TOP ROW of KPI tiles, left to right, each tile a label with one big glowing number:
- CALLS IN QUEUE: 0
- AVG HANDLE TIME: 1:20
- SERVICE LEVEL: 100%
- ACTIVE AI AGENTS: 480
- ACTIVE HUMAN AGENTS: 20
- CSAT: 94%
- ESCALATED TO HUMANS: 50
(make the tiles slightly narrower so all seven fit in the row; remove the small arrow/percentage deltas under the numbers)

AGENT STATUS panel, a list of rows with a coloured dot, label and number:
- Available: 50
- AI Available: 50
- Human Available: 20
- After Call Work: 0
- Break: 15

All numbers crisp, sharp and correctly spelled, same dashboard font and glow. Leave every other panel as it is. No other changes.`;

const form = new FormData();
form.append('model', process.env.OPENAI_MODEL || 'gpt-image-2.5-sunburst');
form.append('prompt', prompt);
form.append('size', size);
form.append('quality', 'high');
form.append('n', n);
form.append('image[]', new Blob([fs.readFileSync(BASE)], { type: 'image/png' }), 'office.png');

let r;
for (let a = 1; a <= 5; a++) {
  try {
    r = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form,
      signal: AbortSignal.timeout(900000),
    });
    if (r.ok) break;
    console.log(orient, r.status, (await r.text()).slice(0, 300));
    if (r.status === 401 || r.status === 400) process.exit(1);
  } catch (e) { console.log(orient, 'retry', a, e.cause?.code || e.message); }
  await new Promise((s) => setTimeout(s, 8000 * a));
}
const j = await r.json();
fs.writeFileSync(`${OUT}/kpi-${orient}.json`, JSON.stringify({ model: process.env.OPENAI_MODEL, size, prompt }, null, 1));
j.data.forEach((d, i) => {
  const f = `${OUT}/kpi-${orient}-${i + 1}.png`;
  fs.writeFileSync(f, Buffer.from(d.b64_json, 'base64'));
  console.log('wrote', f);
});
