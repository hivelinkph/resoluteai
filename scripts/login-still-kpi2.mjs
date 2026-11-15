// Sunburst edit round 2: agent status, current customer interactions, six channels.
//   node scripts/login-still-kpi2.mjs <landscape|portrait>
import fs from 'node:fs';
process.loadEnvFile('C:/AntiGravity/ResoluteVideoGen/.env');

const orient = process.argv[2] || 'landscape';
const wide = orient === 'landscape';
const OUT = 'C:/AntiGravity/Resolute-h3/Assets/login';
const BASE = wide ? `${OUT}/kpi-landscape-2.png` : `${OUT}/kpi2-portrait-1.png`;

const table = wide ? 'the "RECENT CALLS" panel' : 'the "LIVE CALLS" table';
const prompt = `Edit this photo. Keep EVERYTHING identical (office, people, faces, lighting, logo sign, skyline, camera, dashboard layout, all KPI tiles and their numbers, charts, maps). Change ONLY these three things on the dashboard wall:

1. AGENT STATUS panel: the "Available" row number becomes 70. Keep the other rows exactly (AI Available 50, Human Available 20, After Call Work 0, Break 15).

2. Rename ${table} to the title "CURRENT CUSTOMER INTERACTIONS". Its columns are: Duration, Channel, Queue, Status. Its rows read exactly:
   0:42 | Voice | Support | In Progress
   0:18 | Viber | Billing | In Progress
   0:51 | Chat | Sales | In Progress
   0:09 | Telegram | Support | In Progress
   0:33 | SMS | Technical | In Progress
   0:27 | Email | Billing | In Progress
   Every status is a green "In Progress"; nothing queued or completed.

3. CHANNELS panel: the donut chart has six segments and the legend reads exactly, in this order:
   Viber 18% / Voice 34% / Telegram 9% / Chat 21% / SMS 7% / Email 11%

All text crisp, correctly spelled, same dashboard font and glow. No other changes.`;

const form = new FormData();
form.append('model', process.env.OPENAI_MODEL || 'gpt-image-2.5-sunburst');
form.append('prompt', prompt);
form.append('size', wide ? '1536x1024' : '1024x1536');
form.append('quality', 'high');
form.append('n', '2');
form.append('image[]', new Blob([fs.readFileSync(BASE)], { type: 'image/png' }), 'office.png');

let r;
for (let a = 1; a <= 5; a++) {
  try {
    r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form, signal: AbortSignal.timeout(900000) });
    if (r.ok) break;
    console.log(orient, r.status, (await r.text()).slice(0, 300));
    if (r.status === 401 || r.status === 400) process.exit(1);
  } catch (e) { console.log(orient, 'retry', a, e.cause?.code || e.message); }
  await new Promise((s) => setTimeout(s, 8000 * a));
}
(await r.json()).data.forEach((d, i) => {
  const f = `${OUT}/kpi3-${orient}-${i + 1}.png`;
  fs.writeFileSync(f, Buffer.from(d.b64_json, 'base64'));
  console.log('wrote', f);
});
