import { readFileSync } from 'fs';
const c = readFileSync('C:/Users/عبدالله صلاح/Downloads/FG_DEEBSEEKTEST/src/App.jsx', 'utf8');

// Find all function calls in the App component (between export default function and the end)
const appStart = c.indexOf('export default function App()');
const appEnd = c.indexOf('\n// authCss imported');
const appCode = c.substring(appStart, appEnd);

// Find all function references (word followed by '(')
const funcCalls = new Set();
const regex = /\b([a-zA-Z_$][\w$]+)\s*\(/g;
let match;
while ((match = regex.exec(appCode)) !== null) {
  // Skip language keywords and React APIs
  const name = match[1];
  const skip = ['if', 'for', 'while', 'switch', 'case', 'catch', 'typeof', 'delete', 'return', 
                'throw', 'new', 'else', 'try', 'case', 'default', 'break', 'continue',
                'console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean',
                'Date', 'Promise', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
                'undefined', 'null', 'true', 'false', 'this', 'window', 'document',
                'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
                'requestAnimationFrame', 'fetch', 'encodeURIComponent',
                'setMembers', 'setPlayers', 'setTrophiesMaster', 'setLeagueArchive',
                'setTournamentsArchive', 'setSeasons', 'setFinance', 'setTransfers',
                'setImportantLinks', 'setConfig', 'setPage', 'setSelectedId',
                'setMemberTab', 'setTransferPeriod', 'setSearch', 'setDetailView',
                'setDetailStack', 'setInfoModal', 'setMenuOpen', 'setLoading',
                'setError', 'setTopBarScrolled', 'setAuthUser', 'setAuthProfile',
                'setAuthLoading', 'setFirebaseMoneyTransfers', 'setFirebasePlayerOffers',
                'setNotificationsOpen', 'setPushStatus', 'setPushBusy',
                'setFocusedCompetitionId', 'setSeasonHubTab', 'setArchiveDefaultMode',
                'setFirebaseNotifications', 'setFirebaseTransferWindows',
                'setFirebasePlayerContracts', 'setFirebaseTransferHistory',
                'setFirebasePlayerReleases', 'setFirebaseFreeAgentRegistrations',
                'setFirebaseFreePlayerStatus', 'setFirebaseFreeAgentQueue',
                'setFirebaseMemberRestrictions', 'setFirebaseAdminDecisions',
                'setFirebaseAdminNotes', 'setFirebasePushTokens', 'setFirebaseCompetitions',
                'useState', 'useEffect', 'useMemo', 'useRef', 'React', 'auth', 'db',
                'collection', 'onSnapshot', 'doc', 'getDoc', 'setDoc', 'updateDoc',
                'deleteDoc', 'addDoc', 'serverTimestamp', 'arrayUnion',
                'createUserWithEmailAndPassword', 'onAuthStateChanged',
                'sendPasswordResetEmail', 'signInWithEmailAndPassword', 'signOut',
                'lazy', 'Suspense', 'ErrorBoundary', 'SystemScreen',
                'clean', 'cleanId', 'same', 'toNumber', 'isEnabled', 'formatMoney',
                'normalizeDigits', 'toLatinDigits', 'formatLatinNumber', 'stripIcon',
                'normalizeKey', 'removeBom', ''];
  if (!skip.includes(name) && !name.startsWith('set')) {
    funcCalls.add(name);
  }
}

// Now find what's defined in the file (function declarations, const arrow functions)
const defined = new Set();
const defRegex = /(?:function|const|let|var)\s+([a-zA-Z_$][\w$]+)\s*[=\(]/g;
while ((match = defRegex.exec(c)) !== null) {
  defined.add(match[1]);
}

// Also add known global React objects
defined.add('createPortal');

// Check what's not defined
const imported = new Set();
const importRegex = /import .+ from/g;
const importNames = c.match(/\{([^}]+)\}/g);
if (importNames) {
  importNames.forEach(block => {
    block.replace(/{([^}]+)}/).split(',').forEach(n => imported.add(n.trim()));
  });
}

const missing = [...funcCalls].filter(name => !defined.has(name) && !imported.has(name));
console.log('Missing function definitions:');
missing.sort().forEach(name => console.log('  ' + name));
