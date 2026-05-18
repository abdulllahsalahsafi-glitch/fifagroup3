import React from 'react';
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

function LegacyActiveSeasonMembersPanel({ members = [], financeRows = [], totalForMember, onOpenMember, title, subtitle }) {
  const rows = Array.isArray(members) ? members.slice(0, 12) : [];
  if (!rows.length) return null;
  const css = `
    .legacyActivePanel{margin:14px 0;padding:13px;border-radius:20px;background:rgba(255,255,255,.035);border:1px solid rgba(0,230,118,.16)}
    .legacyActivePanelHead{margin-bottom:10px}
    .legacyActivePanelTitle{font-size:13px;font-weight:900;color:#edf0ff}
    .legacyActivePanelSub{font-size:10px;color:#8f98bd;margin-top:4px;line-height:1.45}
    .legacyActivePanelGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .legacyActiveMemberCard{border:1px solid rgba(255,255,255,.08);background:rgba(5,12,28,.78);border-radius:15px;padding:9px;display:flex;gap:8px;align-items:center;text-align:right;cursor:pointer;color:#edf0ff}
    .legacyActiveMemberAvatar{width:34px;height:34px;border-radius:12px;object-fit:cover;background:rgba(0,230,118,.12);flex:0 0 auto}
    .legacyActiveMemberInitial{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#00E676,#00D4FF);display:grid;place-items:center;color:#020617;font-weight:900;flex:0 0 auto}
    .legacyActiveMemberBody{min-width:0;flex:1}
    .legacyActiveMemberName{font-size:11.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .legacyActiveMemberMeta{font-size:9.5px;color:#8f98bd;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  `;
  return React.createElement('section', { className: 'legacyActivePanel' },
    React.createElement('style', null, css),
    React.createElement('div', { className: 'legacyActivePanelHead' },
      React.createElement('div', { className: 'legacyActivePanelTitle' }, title || 'الأعضاء النشطون'),
      subtitle ? React.createElement('div', { className: 'legacyActivePanelSub' }, subtitle) : null
    ),
    React.createElement('div', { className: 'legacyActivePanelGrid' },
      rows.map((member, index) => {
        const id = legacyCleanId(member.id || member.memberId || member.memberid);
        const name = member.name || member.memberName || id || '-';
        const image = legacyNormalizeImageUrl(member.image || member.avatar || member.photo || '');
        const trophies = typeof totalForMember === 'function' ? totalForMember(id) : (member.trophies || member.titles || 0);
        const balanceRow = (financeRows || []).find((row) => legacySame(row.memberId || row.memberid || row.id, id));
        const balance = balanceRow?.balance || member.balance || '';
        return React.createElement('button', {
          key: id || index,
          type: 'button',
          className: 'legacyActiveMemberCard',
          onClick: () => typeof onOpenMember === 'function' ? onOpenMember(id) : null,
        },
          image
            ? React.createElement('img', { className: 'legacyActiveMemberAvatar', src: image, alt: '' })
            : React.createElement('div', { className: 'legacyActiveMemberInitial' }, String(name).charAt(0) || '?'),
          React.createElement('div', { className: 'legacyActiveMemberBody' },
            React.createElement('div', { className: 'legacyActiveMemberName' }, name),
            React.createElement('div', { className: 'legacyActiveMemberMeta' }, `${trophies || 0} بطولة${balance ? ' · ' + balance : ''}`)
          )
        );
      })
    )
  );
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
  ActiveSeasonMembersPanel: globalThis.ActiveSeasonMembersPanel || LegacyActiveSeasonMembersPanel,
});
