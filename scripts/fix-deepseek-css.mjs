import { readFileSync, writeFileSync } from 'node:fs';

const cssPath = 'src/styles/main.css';
let css = readFileSync(cssPath, 'utf8');
const original = css;

const mobileChampionTail = '.championRow{grid-template-columns:repeat(2,1fr);padding:10px}.championRow div:nth-child(3){grid-column:1/-1}.championRow b{font-size:14px}.finalRow{grid-template-columns:62px 1fr 54px}.transferCard{grid-template-columns:64px 1fr;align-items:start}.transferRating{position:absolute;left:14px;top:14px}.transferBadges{grid-template-columns:repeat(2,1fr)}.rankingCard{grid-template-columns:42px 52px 1fr;gap:10px}.rankingCard p{grid-column:1/-1;display:flex;justify-content:space-between;background:rgba(255,255,255,.06);border-radius:12px;padding:8px}.statsTable{overflow-x:auto}.statsTableHead,.statsTableRow{min-width:680px}.modalStatsGrid,.detailsGridPage{grid-template-columns:1fr}.recordHero h2{font-size:22px}.mainNav{width:calc(100% - 18px);max-width:430px;height:72px;bottom:calc(10px + env(safe-area-inset-bottom))}.sideDrawer{border-radius:0 24px 24px 0}}';

const splitMarker = '.championRow{grid-template-columns\n\n/* ===== 2026-04 FINAL HOTFIX';
if (css.includes(splitMarker)) {
  css = css.replace(splitMarker, `${mobileChampionTail}\n\n/* ===== 2026-04 FINAL HOTFIX`);
}

const danglingRule = /\n?:repeat\(2,1fr\);padding:10px\}\.championRow div:nth-child\(3\)\{grid-column:1\/-1\}\.championRow b\{font-size:14px\}\.finalRow\{grid-template-columns:62px 1fr 54px\}\.transferCard\{grid-template-columns:64px 1fr;align-items:start\}\.transferRating\{position:absolute;left:14px;top:14px\}\.transferBadges\{grid-template-columns:repeat\(2,1fr\)\}\.rankingCard\{grid-template-columns:42px 52px 1fr;gap:10px\}\.rankingCard p\{grid-column:1\/-1;display:flex;justify-content:space-between;background:rgba\(255,255,255,\.06\);border-radius:12px;padding:8px\}\.statsTable\{overflow-x:auto\}\.statsTableHead,\.statsTableRow\{min-width:680px\}\.modalStatsGrid,\.detailsGridPage\{grid-template-columns:1fr\}\.recordHero h2\{font-size:22px\}\.mainNav\{width:calc\(100% - 18px\);max-width:430px;height:72px;bottom:calc\(10px \+ env\(safe-area-inset-bottom\)\)\}\.sideDrawer\{border-radius:0 24px 24px 0\}\}/;
css = css.replace(danglingRule, '\n');

if (css.includes(':repeat(2,1fr)')) {
  throw new Error('CSS hotfix failed: dangling :repeat(2,1fr) still exists.');
}

if (css.includes('.championRow{grid-template-columns\n')) {
  throw new Error('CSS hotfix failed: split championRow grid-template-columns still exists.');
}

if (css !== original) {
  writeFileSync(cssPath, css, 'utf8');
  console.log('[fix-deepseek-css] repaired src/styles/main.css');
} else {
  console.log('[fix-deepseek-css] no CSS repair needed');
}
