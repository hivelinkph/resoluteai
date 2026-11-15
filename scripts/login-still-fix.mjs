// One-line Sunburst touch-up: node scripts/login-still-fix.mjs <in.png> <out-prefix> "<instruction>"
import fs from 'node:fs';
process.loadEnvFile('C:/AntiGravity/ResoluteVideoGen/.env');
const [inp, outp, instr] = process.argv.slice(2);
const form = new FormData();
form.append('model', process.env.OPENAI_MODEL || 'gpt-image-2.5-sunburst');
form.append('prompt', `Edit this photo. Keep EVERYTHING identical: every person, face, light, sign, panel, number and label. ${instr} No other changes.`);
form.append('size', '1024x1536'); form.append('quality', 'high'); form.append('n', '2');
form.append('image[]', new Blob([fs.readFileSync(inp)], { type: 'image/png' }), 'in.png');
let r;
for (let a = 1; a <= 5; a++) {
  try { r = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form, signal: AbortSignal.timeout(900000) }); if (r.ok) break; console.log(r.status, (await r.text()).slice(0, 200)); }
  catch (e) { console.log('retry', a, e.cause?.code || e.message); }
  await new Promise((s) => setTimeout(s, 8000 * a));
}
(await r.json()).data.forEach((d, i) => { const f = `${outp}-${i + 1}.png`; fs.writeFileSync(f, Buffer.from(d.b64_json, 'base64')); console.log('wrote', f); });
