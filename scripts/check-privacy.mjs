// Fails the build if published content looks like it contains a street address
// or a banned private term. Banned terms live in notes/banned-terms.txt, which
// is gitignored (listing them in a committed file would leak them).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const roots = ['src/content', 'src/pages', 'src/components', 'src/layouts', 'src/lib', 'src/scripts'];
const exts = new Set(['.yaml', '.yml', '.md', '.mdx', '.astro', '.ts', '.json']);

// A street address: a number, 1-4 capitalized words, then a capitalized street suffix.
// ("2026 for trail" does not match; "817 Driftwood Avenue" does.)
const streetSuffix =
  'Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Court|Ct|Boulevard|Blvd|Way|Place|Pl|Highway|Hwy|Parkway|Pkwy|Circle|Cir';
const addressRe = new RegExp(`\\b\\d{1,6}\\s+(?:[A-Z][A-Za-z0-9.'-]*\\s+){1,4}(?:${streetSuffix})\\b\\.?`);
const zipRe = /\b(?:NY|NJ|CT|MA|VT|NH|ME|PA|TN|NC|VA|UT|CO|AZ|WY|NV|CA)\s+\d{5}\b/;

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (exts.has(extname(p))) yield p;
  }
}

let banned = [];
if (existsSync('notes/banned-terms.txt')) {
  banned = readFileSync('notes/banned-terms.txt', 'utf8')
    .split('\n').map((l) => l.trim().toLowerCase()).filter((l) => l && !l.startsWith('#'));
} else {
  console.warn('privacy check: notes/banned-terms.txt not found, skipping the banned-terms check (address patterns still checked).');
}

const problems = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      if (addressRe.test(line)) problems.push(`${file}:${i + 1} looks like a street address: ${line.trim()}`);
      if (zipRe.test(line)) problems.push(`${file}:${i + 1} has a state + ZIP code: ${line.trim()}`);
      for (const t of banned) if (lower.includes(t)) problems.push(`${file}:${i + 1} contains banned term "${t}"`);
    });
  }
}

if (problems.length) {
  console.error('\nPrivacy check FAILED:\n' + problems.map((p) => '  - ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log('privacy check: ok');
