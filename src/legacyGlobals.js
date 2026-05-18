import * as helpers from './utils/helpers.js';
import * as competitions from './services/competitions.js';
import * as finance from './services/finance.js';

// Compatibility bridge for the current split App.jsx.
// Some helper imports were removed during file splitting while App.jsx still
// references those helper names directly. Expose the existing exported helpers
// as globals before App.jsx is evaluated.
Object.assign(globalThis, helpers, competitions, finance);
