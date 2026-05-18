import { readFileSync, writeFileSync } from 'fs';
const c = readFileSync('C:/Users/عبدالله صلاح/Downloads/FG_DEEBSEEKTEST/src/App.jsx', 'utf8');

// Get the App component code
const appStart = c.indexOf('export default function App()');
const appEnd = c.indexOf('\n// authCss imported');
const appCode = c.substring(appStart, appEnd);

// Collect ALL imports from the file
const importMap = new Map();
const importBlockRegex = /import .+ from ['"](.+)['"]/g;
let ib;
while ((ib = importBlockRegex.exec(c)) !== null) {
  const path = ib[1];
  const names = [];
  const braceMatch = ib[0].match(/\{([^}]+)\}/);
  if (braceMatch) {
    braceMatch[1].split(',').forEach(n => names.push(n.trim()));
  }
  const defaultMatch = ib[0].match(/import (\w+)/);
  if (defaultMatch && !braceMatch) names.push(defaultMatch[1]);
  importMap.set(path, names);
}

// Collect all defined names in the file
const defined = new Set();
const defRegex = /(?:^|\n)\s*(?:function|async function|const|let|var)\s+(\w+)\s*[=\(]/gm;
let dm;
while ((dm = defRegex.exec(c)) !== null) {
  defined.add(dm[1]);
}
// Also add React hooks
['useState','useEffect','useMemo','useRef','lazy','Suspense'].forEach(n => defined.add(n));

// Find all function calls (excluding React state setters and common methods)
const funcCalls = new Set();
const callRegex = /[^.\w](\w+)\s*\(/g;
let cm;
while ((cm = callRegex.exec(appCode)) !== null) {
  const name = cm[1];
  const skipBuiltins = ['undefined', 'null', 'true', 'false', 'this', 'window', 'document', 'console', 'JSON', 'Math', 'alert', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'Array', 'Object', 'Map', 'Set', 'Promise', 'Error', 'Date', 'Number', 'String', 'Boolean', 'RegExp', 'URLSearchParams'];
  const skipMethods = ['map', 'filter', 'reduce', 'sort', 'find', 'some', 'every', 'forEach', 'includes', 'indexOf', 'slice', 'splice', 'push', 'pop', 'shift', 'unshift', 'concat', 'join', 'split', 'replace', 'trim', 'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'getTime', 'getFullYear', 'getMonth', 'getDate', 'now', 'toISOString', 'stringify', 'parse', 'all', 'race', 'resolve', 'reject', 'keys', 'values', 'entries', 'has', 'get', 'set', 'add', 'delete', 'clear', 'from', 'of', 'querySelector', 'getElementById', 'addEventListener', 'removeEventListener', 'scrollTo', 'requestAnimationFrame', 'setTimeout', 'clearTimeout', 'encodeURIComponent', 'encodeURI'];
  if (!defined.has(name) && !skipBuiltins.includes(name) && !skipMethods.includes(name) && !name.startsWith('set') && name.length > 2) {
    // Check if it's imported
    let isImported = false;
    for (const [, names] of importMap) {
      if (names.includes(name)) { isImported = true; break; }
    }
    if (!isImported) funcCalls.add(name);
  }
}

console.log('Truly missing functions:');
[...funcCalls].sort().forEach(n => console.log('  ' + n));
