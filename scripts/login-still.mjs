// Sunburst hero still for the resoluteaiph.com login-screen hero (adapted from /loginscreen gen-still.mjs).
// Uses images/edits so the REAL Resolute logo (Resolute_Transparent.png) becomes the lit acrylic sign.
//   node scripts/login-still.mjs <landscape|portrait>
import fs from 'node:fs';
process.loadEnvFile('C:/AntiGravity/ResoluteVideoGen/.env');

const orient = process.argv[2] || 'landscape';
const wide = orient === 'landscape';
const size = wide ? '1536x1024' : '1024x1536';
const OUT = 'C:/AntiGravity/Resolute-h3/Assets/login';
fs.mkdirSync(OUT, { recursive: true });
const LOGO = 'C:/AntiGravity/ResoluteVideoGen/Resolute_Transparent.png';

const scene = `the Resolute A.I. headquarters in Bonifacio Global City, Manila, at night: a sleek high-tech AI operations office. On a dark charcoal feature wall hangs the company logo from the reference image as a premium backlit ACRYLIC CUTOUT SIGN: raised frosted-white and clear acrylic letters and the robot-head emblem, glowing electric blue from LED halo lighting behind, reproduced exactly as in the reference (same emblem, same RESOLUTE A.I. INC lettering, nothing else written). In front of it, a modern open operations floor: a few young Filipino engineers and campaign managers at glass desks with thin monitors, one wearing a headset, calm and confident. Above the floor a huge curved LED video wall and floating holographic light show AI CX running BPO call campaigns in the cloud: a glowing blue cloud shape with many thin light streams flowing out to hundreds of small glowing call nodes, headset and phone glyph icons and soundwave ribbons, like live customer calls being answered by AI across the city, all abstract light with no words or numbers. Floor-to-ceiling windows show the BGC skyline at night`;

const layout = wide
  ? 'Composition for a full-screen website hero background: the glowing logo sign sits LEFT-OF-CENTRE in the upper-middle of the frame, large and clearly readable; the people and desks fill the lower centre and left. The TOP-RIGHT quarter is calm, dark and uncluttered (night skyline, soft out-of-focus cloud glow, deep shadow) so a sign-in card can float over it. The bottom-left is darker for a headline; the bottom 12% is a calm dark floor for a logo strip.'
  : 'Composition for a full-screen phone hero background: the glowing logo sign sits in the MIDDLE band of the frame, clearly readable; people and desks in the lower half. The TOP 35% is calm and dark (ceiling, soft cloud glow) so a sign-in card can float over it.';

const prompt = `A single cinematic, photoreal, premium corporate advertising photograph of ${scene}.
${layout}
All people are Filipino, natural, real skin texture, plain clothes with no logos. Deep midnight-navy shadows with electric blue (#2F8CFF) and pale ice-blue (#A9DBFF) light, a few warm amber practical lights. Shallow depth of field, rich contrast, high-end technology-brand key visual.
The ONLY text anywhere in the image is the logo sign copied from the reference. No other text, letters, numbers, UI labels or watermarks; screens show only abstract glowing graphics.`;

const form = new FormData();
form.append('model', process.env.OPENAI_MODEL || 'gpt-image-2.5-sunburst');
form.append('prompt', prompt);
form.append('size', size);
form.append('quality', 'high');
form.append('n', '2');
form.append('image[]', new Blob([fs.readFileSync(LOGO)], { type: 'image/png' }), 'resolute-logo.png');

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
fs.writeFileSync(`${OUT}/login-${orient}.json`, JSON.stringify({ model: process.env.OPENAI_MODEL, size, prompt }, null, 1));
j.data.forEach((d, i) => {
  const f = `${OUT}/login-${orient}-${i + 1}.png`;
  fs.writeFileSync(f, Buffer.from(d.b64_json, 'base64'));
  console.log('wrote', f);
});
