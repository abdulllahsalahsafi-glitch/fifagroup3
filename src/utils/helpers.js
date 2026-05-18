export function stripIcon(s) {
  return (s || '').replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFa-zA-Z0-9\s\-\u2013\u2014\u060C,.!?():[\]{}'"\u00AB\u00BB\u200B-\u200F\u202A-\u202E]+/g, '').trim();
}

export function toLatinDigits(value) {
  const source = String(value ?? "");
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  return source.replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d))).replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)));
}

export function formatLatinNumber(value) {
  const number = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(number)) return toLatinDigits(value);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(number));
}

export function toCssSize(value, fallback = "50px") {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
  return raw;
}

export function normalizeKey(value) {
  return removeBom(String(value || ""))
    .trim()
    .replaceAll(" ", "")
    .toLowerCase();
}

export function removeBom(value) {
  const text = String(value || "");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function clean(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function cleanId(value) {
  return String(value || "").trim();
}

export function same(a, b) {
  return cleanId(a) === cleanId(b);
}

export function hasRecord(row) {
  return cleanId(row.id) || cleanId(row.trophyid) || cleanId(row.edition);
}

export function toNumber(value) {
  const number = Number(String(value || "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

export function formatMoney(value) {
  const raw = String(value || "0").trim();
  const number = Number(raw.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(number)) return raw;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Math.max(Math.min(number, 999999999), -999999999)
  );
}

export function isEnabled(value) {
  return String(value).toLowerCase() !== "false" && String(value) !== "0";
}

export function normalizeDigits(value) {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  return String(value || "")
    .replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)));
}

export function linkIcon(name, config = DEFAULT_CONFIG) {
  const value = clean(name);
  if (value.includes("فيس")) return config.linkFacebookIcon;
  if (value.includes("بطولات")) return config.linkTournamentsIcon;
  if (value.includes("موسم")) return config.linkSeasonIcon;
  return config.linkDefaultIcon;
}

export function unique(items) {
  return Array.from(new Set(items));
}

export function dateValue(date) {
  const match = String(date || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) return 0;
  return Number(match[1]) * 10000 + Number(match[2]) * 100 + Number(match[3]);
}

export function normalizeDate(date) {
  const match = String(date || "").match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) return String(date || "");
  return `${Number(match[1])}/${Number(match[2])}/${Number(match[3])}`;
}

export function seasonNumber(seasonId) {
  const n = String(seasonId || "").match(/\d+/);
  return n ? Number(n[0]) : 999;
}
