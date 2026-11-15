// Sunburst edit of the chosen hero still: realistic NOC/call-centre operations dashboard on the video wall,
// and the logo sign lower in frame (more headroom so it is never trimmed under the header).
//   node scripts/login-still-edit.mjs <landscape|portrait>
import fs from 'node:fs';
process.loadEnvFile('C:/AntiGravity/ResoluteVideoGen/.env');

const orient = process.argv[2] || 'landscape';
const wide = orient === 'landscape';
const size = wide ? '1536x1024' : '1024x1536';
const OUT = 'C:/AntiGravity/Resolute-h3/Assets/login';
const BASE = wide ? `${OUT}/login-landscape-2.png` : `${OUT}/login-portrait-1.png`;
const LOGO = 'C:/AntiGravity/ResoluteVideoGen/Resolute_Transparent.png';

const wall = wide ? 'the big video wall to the RIGHT of the logo sign' : 'the big curved video wall above the logo sign';
const prompt = `Edit the first image (the Resolute A.I. office at night). Keep the same office, the same people at their desks, the same lighting, palette, BGC skyline and camera style.

1. Reframe slightly: tilt the camera up a little so there is clear dark wall and ceiling ABOVE the robot-head emblem; the whole logo sign (emblem, RESOLUTE lettering and A.I. INC line) sits lower in the frame, fully visible with generous space above the top of the head${wide ? ', its top edge at roughly 22% of the frame height' : ''}. The sign must be reproduced exactly as the second image (the real logo): same emblem, same RESOLUTE A.I. INC lettering, as a backlit acrylic cutout glowing electric blue.

2. Replace the content of ${wall} with a REALISTIC call-centre / network operations centre (NOC) operations dashboard, like a real enterprise contact-centre wallboard: a dark navy UI split into tidy panels with thin borders: a row of big KPI tiles (calls in queue, average handle time, service level, active AI agents, CSAT) with large glowing numerals; line and area charts of call volume over 24 hours; a bar chart per campaign; a donut chart of channels; a world/Philippines map with glowing live-call dots; a grid of green / amber / red status tiles for agents and campaigns; a scrolling table of live calls. Crisp, flat, professional dashboard graphics in blue, cyan, green and amber, slightly glowing, viewed in perspective on the wall. Any small labels are short, generic and legible-looking; no brand names other than the logo sign.
${wide ? 'Keep the TOP-RIGHT corner of the frame (night skyline, dark sky) calm and dark.' : 'Keep the very top of the frame dark enough for a header.'}
No other new text, no watermarks.`;

const form = new FormData();
form.append('model', process.env.OPENAI_MODEL || 'gpt-image-2.5-sunburst');
form.append('prompt', prompt);
form.append('size', size);
form.append('quality', 'high');
form.append('n', '2');
form.append('image[]', new Blob([fs.readFileSync(BASE)], { type: 'image/png' }), 'office.png');
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
fs.writeFileSync(`${OUT}/noc-${orient}.json`, JSON.stringify({ model: process.env.OPENAI_MODEL, size, prompt }, null, 1));
j.data.forEach((d, i) => {
  const f = `${OUT}/noc-${orient}-${i + 1}.png`;
  fs.writeFileSync(f, Buffer.from(d.b64_json, 'base64'));
  console.log('wrote', f);
});
