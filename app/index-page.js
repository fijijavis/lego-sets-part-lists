import fs   from 'fs';
import path from 'path';

function category({ file, SET }) {
  if (file.startsWith('ucs-'))      return 'UCS';
  if (SET.setNumber === null)       return 'MOC';
  return 'Set';
}

function card({ file, SET }) {
  const label    = (SET.setNumber ? SET.setNumber + ' · ' : '') + SET.name;
  const sub      = SET.subtitle ? `<span class="sub">${SET.subtitle}</span>` : '';
  const parts    = SET.parts.length;
  const badge    = SET.features.subModels ? '<span class="tag">sub-models</span>' : '';
  const figBadge = SET.parts.some(p => p.isFig) ? '<span class="tag">minifigs</span>' : '';
  return `    <a href="${file}" class="set-card" style="--accent:${SET.accentColor}">
      <div class="set-name">${label}${sub}</div>
      <div class="set-meta">${parts} types ${badge}${figBadge}</div>
    </a>`;
}

function section(label, items) {
  if (!items.length) return '';
  return `  <h2 class="group-label">${label}</h2>
  <div class="grid">
${items.map(card).join('\n')}
  </div>`;
}

export function buildIndex(distDir, sets) {
  const groups = { UCS: [], Set: [], MOC: [] };
  for (const s of sets) groups[category(s)].push(s);

  const body = [
    section('UCS', groups.UCS),
    section('Standard Sets', groups.Set),
    section('MOCs', groups.MOC),
  ].filter(Boolean).join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LEGO Parts Checklists</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root { --bg:#0a0c10; --surface:#12151c; --border:#252c3a; --text:#d4dce8; --text-dim:#6a7a8e; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:'IBM Plex Mono',monospace; min-height:100vh; padding:48px 24px; }
  h1 { font-family:'Orbitron',sans-serif; font-size:clamp(1.4rem,4vw,2.2rem); font-weight:900; color:#fff; letter-spacing:0.04em; margin-bottom:8px; }
  .subtitle { color:var(--text-dim); font-size:12px; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:40px; }
  .group-label { font-family:'Orbitron',sans-serif; font-size:11px; font-weight:700; color:var(--text-dim); letter-spacing:0.15em; text-transform:uppercase; margin:32px 0 14px; }
  .group-label:first-of-type { margin-top:0; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; max-width:1100px; }
  .set-card {
    display:block; text-decoration:none;
    background:var(--surface); border:1px solid var(--border);
    border-radius:8px; padding:20px 22px;
    transition:border-color 0.2s, transform 0.1s;
    border-left:3px solid var(--accent, #4ab4e8);
  }
  .set-card:hover { border-color:var(--accent,#4ab4e8); transform:translateY(-2px); }
  .set-name { font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700; color:#fff; letter-spacing:0.04em; line-height:1.3; }
  .sub { display:block; font-size:10px; font-weight:400; color:var(--text-dim); margin-top:2px; letter-spacing:0.12em; }
  .set-meta { font-size:10px; color:var(--text-dim); margin-top:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .tag { background:rgba(255,255,255,0.07); border:1px solid var(--border); border-radius:3px; padding:1px 6px; font-size:9px; letter-spacing:0.08em; }
</style>
</head>
<body>
  <h1>LEGO Parts Checklists</h1>
  <div class="subtitle">${sets.length} sets</div>
${body}
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
}
