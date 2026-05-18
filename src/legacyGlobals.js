import * as helpers from './utils/helpers.js';
import * as competitions from './services/competitions.js';
import * as finance from './services/finance.js';

// Compatibility bridge for the current split App.jsx.
// Some helper imports were removed during file splitting while App.jsx still
// references those helper names directly. Expose the existing exported helpers
// as globals before App.jsx is evaluated.
Object.assign(globalThis, helpers, competitions, finance);

function legacyClean(value) {
  return String(value || '').trim().toLowerCase();
}

function legacyCleanId(value) {
  return String(value || '').trim();
}

function legacySame(a, b) {
  return legacyCleanId(a) === legacyCleanId(b);
}

function legacyNormalizeImageUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch?.[1]) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
  const imgurMatch = url.match(/^https?:\/\/imgur\.com\/([A-Za-z0-9]+)$/);
  if (imgurMatch?.[1]) return `https://i.imgur.com/${imgurMatch[1]}.png`;
  return url;
}

function legacyAvatar(seed) {
  return 'https://api.dicebear.com/8.x/initials/svg?seed=' + encodeURIComponent(seed || 'user');
}

function legacyGetMemberName(members, memberId) {
  const id = legacyCleanId(memberId);
  const row = (members || []).find((member) => legacySame(member.id || member.memberId || member.memberid, id));
  return row?.name || row?.memberName || row?.membername || memberId || '-';
}

function legacyIsFifaSystemMember(member) {
  return legacySame(member?.id || member?.memberId || member?.memberid, 'FIFA') || legacyClean(member?.name || member?.memberName) === 'fifa';
}

function legacyIsActiveSeasonMember(member) {
  if (!member || !legacyCleanId(member.id || member.memberId || member.memberid) || legacyIsFifaSystemMember(member)) return false;
  const status = legacyClean(member.status ?? member.memberstatus ?? member.active ?? member.isactive ?? '');
  return ['active', 'true', 'yes', '1', 'نشط', 'فعال'].includes(status);
}

function legacyGetActiveMembers(members) {
  const source = Array.isArray(members) ? members : [];
  const active = source.filter(legacyIsActiveSeasonMember);
  return active.length ? active : source.filter((member) => legacyCleanId(member.id || member.memberId || member.memberid) && !legacyIsFifaSystemMember(member));
}

function legacyNotificationTimeValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (value?.seconds) return Number(value.seconds) * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function legacyTopMap(map, members) {
  const rows = Object.entries(map || {})
    .map(([id, value]) => ({ id, name: legacyGetMemberName(members, id), value }))
    .sort((a, b) => b.value - a.value);
  return rows[0] || null;
}

Object.assign(globalThis, {
  normalizeImageUrl: globalThis.normalizeImageUrl || legacyNormalizeImageUrl,
  avatar: globalThis.avatar || legacyAvatar,
  getMemberName: globalThis.getMemberName || legacyGetMemberName,
  isFifaSystemMember: globalThis.isFifaSystemMember || legacyIsFifaSystemMember,
  isActiveSeasonMember: globalThis.isActiveSeasonMember || legacyIsActiveSeasonMember,
  getActiveMembers: globalThis.getActiveMembers || legacyGetActiveMembers,
  notificationTimeValue: globalThis.notificationTimeValue || legacyNotificationTimeValue,
  topMap: globalThis.topMap || legacyTopMap,
});
