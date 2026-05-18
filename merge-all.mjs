import { readFileSync, writeFileSync } from 'fs';
const base = 'C:/Users/عبدالله صلاح/Downloads/FG_DEEBSEEKTEST/src/';
const p = base + 'App.jsx';
let c = readFileSync(p, 'utf8');

// Remove the 3 service imports
c = c.replace(/\nimport \{ .+ \} from "\.\/utils\/helpers";\n/, '\n');
c = c.replace(/\nimport \{ .+ \} from "\.\/services\/competitions";\n/, '\n');
c = c.replace(/\nimport \{ .+ \} from "\.\/services\/finance";\n/, '\n');

// Read service files and strip 'export' and imports
function stripExports(filePath) {
  let text = readFileSync(filePath, 'utf8');
  text = text.replace(/^import .+;\n/gm, '');
  text = text.replace(/^export (async )?function /gm, '$1function ');
  text = text.replace(/^export \{[\s\S]*?\};\n/gm, '');
  text = text.replace(/^export default /gm, '');
  return text;
}

const helpers = stripExports(base + 'utils/helpers.js');
const competitions = stripExports(base + 'services/competitions.js');
const finance = stripExports(base + 'services/finance.js');

c += '\n// === Service functions ===\n' + helpers + '\n' + competitions + '\n' + finance;

// Deduplicate functions
const funcRegex = /^function (\w+)/gm;
const seen = new Set();
let result = c;
let match;
const allFuncs = [...c.matchAll(funcRegex)];
// Find duplicates
const dupes = new Set();
const seen2 = new Set();
for (const m of allFuncs) {
  if (seen2.has(m[1])) dupes.add(m[1]);
  seen2.add(m[1]);
}
console.log('Duplicates:', [...dupes]);

// Remove duplicate functions (keep first occurrence)
const lines = c.split('\n');
let cleaned = [];
let skipUntilNextFunc = false;
let skipName = '';
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  
  if (!skipUntilNextFunc && dupes.has(lines[i].match(/^function (\w+)/)?.[1])) {
    const name = lines[i].match(/^function (\w+)/)[1];
    // Check if this is the FIRST occurrence
    const beforeLines = lines.slice(0, i + 1).join('\n');
    const firstOcc = beforeLines.indexOf('function ' + name);
    const thisOcc = beforeLines.lastIndexOf('function ' + name);
    if (firstOcc !== thisOcc) {
      // This is a duplicate - skip it
      skipUntilNextFunc = true;
      skipName = name;
      braceCount = 0;
      continue;
    }
  }
  
  if (skipUntilNextFunc) {
    for (const ch of lines[i]) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount <= 0 && trimmed === '}') {
      skipUntilNextFunc = false;
      continue;
    }
    continue;
  }
  
  cleaned.push(lines[i]);
}

c = cleaned.join('\n');
writeFileSync(p, c, 'utf8');
console.log('Deduped. Size:', c.length);
