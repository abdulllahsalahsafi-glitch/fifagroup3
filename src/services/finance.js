import { clean, cleanId, same, toNumber, normalizeDigits, isEnabled, formatMoney, normalizeDate, dateValue } from '../utils/helpers.js';
import { formatTransferDate } from '../utils/authUtils.js';

// ── Internal helpers ────────────────────────────────────────────────────────

function notificationTimeValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?.seconds) return Number(value.seconds) * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateOnlyMs(value, fallback = 0) {
  const text = String(value || "").slice(0, 10);
  if (!text) return fallback;
  const parsed = Date.parse(text + "T00:00:00");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBooleanFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const text = clean(value);
  if (!text) return false;
  return ["true", "1", "yes", "y", "on", "active", "نعم", "صح", "صحيح"].includes(text);
}

function getPlayerStableId(player) {
  return cleanId(player?.playerid || player?.playerId || player?.id || player?.name);
}

function getMemberName(members, memberId) {
  const id = cleanId(memberId);
  const row = (members || []).find((member) => same(member.id || member.memberId || member.memberid, id));
  return row?.name || row?.memberName || row?.membername || memberId || "-";
}

function adminRewardTypeLabel(type) {
  const value = clean(type || "admin_reward");
  const labels = {
    admin_reward: "مكافأة بطولة",
    admin_compensation: "تعويض إداري",
    admin_adjustment: "تسوية مالية",
    admin_bonus: "جائزة خاصة",
    admin_penalty: "غرامة مالية",
    admin_deduction: "خصم إداري",
    admin_member_compensation: "تعويض مالي لعضو",
  };
  return labels[value] || "عملية إدارية";
}

function adminDecisionTypeLabel(type) {
  const value = clean(type || "admin_decision");
  const labels = {
    admin_decision: "قرار إداري",
    admin_notification: "إشعار إداري",
    admin_reward: "مكافأة بطولة",
    admin_compensation: "تعويض إداري من FIFA",
    admin_adjustment: "تسوية مالية",
    admin_bonus: "جائزة خاصة",
    admin_penalty: "غرامة مالية",
    admin_deduction: "خصم إداري",
    admin_member_compensation: "تعويض مالي بين عضوين",
    transfer_restriction: "إيقاف من نظام الانتقالات",
    transfer_restriction_lifted: "رفع إيقاف انتقالات",
    transfer_restriction_cancelled: "إلغاء إيقاف انتقالات",
    admin_financial_reversal: "عكس عملية مالية",
    admin_financial_correction: "تصحيح عملية مالية",
    admin_member_note: "ملاحظة إدارية",
  };
  return labels[value] || adminRewardTypeLabel(value) || "قرار إداري";
}

function isLoanTransferRow(row = {}) {
  const value = clean([row?.type, row?.typeLabel, row?.contractType].join(" "));
  return value.includes("loan") || value.includes("إعارة") || value.includes("اعارة");
}

function loanDurationLabel(months) {
  const value = toNumber(months);
  if (value === 2) return "شهرين";
  if (value === 4) return "4 شهور";
  if (value === 6) return "6 شهور";
  return value ? value + " شهور" : "-";
}

// ── Admin Money Transfers ───────────────────────────────────────────────────

export function isFifaAdminMoneyTransfer(row = {}) {
  const type = clean(row.type || "");
  const direction = clean(row.direction || "");
  const source = clean(row.source || "");
  return (
    same(row.fromMemberId, "FIFA") ||
    same(row.toMemberId, "FIFA") ||
    type.startsWith("admin") ||
    direction.startsWith("admin") ||
    source.startsWith("fifa_admin")
  );
}

export function isCorrectionMoneyTransfer(row = {}) {
  const type = clean(row.type || "");
  return Boolean(row.reversalOfMoneyTransferId || row.correctionOfMoneyTransferId || type.includes("reversal") || type.includes("correction"));
}

export function hasMoneyTransferCorrection(rows = [], id = "") {
  const safeId = cleanId(id);
  if (!safeId) return false;
  return (rows || []).some((row) =>
    same(row.reversalOfMoneyTransferId, safeId) ||
    same(row.correctionOfMoneyTransferId, safeId) ||
    same(row.originalMoneyTransferId, safeId)
  );
}

export function adminDecisionTimeValue(row = {}) {
  return notificationTimeValue(row.createdAt || row.updatedAt || row.date);
}

export function adminMoneyTransferLabel(row = {}, members = []) {
  const amount = formatMoney(row.amount || 0);
  const fromName = row.fromMemberName || getMemberName(members, row.fromMemberId) || row.fromMemberId || "-";
  const toName = row.toMemberName || getMemberName(members, row.toMemberId) || row.toMemberId || "-";
  const label = row.typeLabel || adminDecisionTypeLabel(row.type) || "عملية مالية";
  return `${label} • ${fromName} ← ${toName} • ${amount}`;
}

// ── Transfer Restrictions ───────────────────────────────────────────────────

export function buildAdminTransferRestrictionPayload(payload = {}) {
  const banSendOffers = payload.banSendOffers !== false;
  const banReceiveOffers = payload.banReceiveOffers !== false;
  const banSquadChanges = payload.banSquadChanges !== false;
  return {
    banSendOffers,
    banReceiveOffers,
    banSquadChanges,
    blockedActions: [
      banSendOffers ? "send_offer" : "",
      banReceiveOffers ? "receive_offer" : "",
      banSquadChanges ? "squad_change" : "",
    ].filter(Boolean),
  };
}

export function isTransferRestrictionActive(row) {
  if (!row) return false;
  const status = clean(row.status || "active");
  if (!["active", "enabled"].includes(status)) return false;
  const now = Date.now();
  const start = dateOnlyMs(row.startDate, 0);
  const end = dateOnlyMs(row.endDate, Number.POSITIVE_INFINITY);
  return now >= start && now <= end + 86399999;
}

export function getActiveMemberRestrictions(rows = [], memberId = "") {
  const id = cleanId(memberId);
  if (!id) return [];
  return (rows || [])
    .filter((row) => same(row.memberId, id) && isTransferRestrictionActive(row))
    .sort((a, b) => dateOnlyMs(a.endDate, Number.POSITIVE_INFINITY) - dateOnlyMs(b.endDate, Number.POSITIVE_INFINITY));
}

export function getBlockingTransferRestriction(rows = [], memberId = "", action = "send_offer") {
  return getActiveMemberRestrictions(rows, memberId).find((row) => {
    const actions = Array.isArray(row.blockedActions) ? row.blockedActions.map(clean) : [];
    if (actions.includes(action)) return true;
    if (action === "send_offer" && row.banSendOffers) return true;
    if (action === "receive_offer" && row.banReceiveOffers) return true;
    if (action === "squad_change" && row.banSquadChanges) return true;
    return false;
  }) || null;
}

export function transferActionArabic(action) {
  const labels = {
    send_offer: "إرسال العروض",
    receive_offer: "استقبال العروض",
    squad_change: "تعديل القائمة أو البيع أو الإعارة أو الاستغناء",
  };
  return labels[action] || "نظام الانتقالات";
}

export function transferRestrictionShortText(row) {
  const blocked = [];
  if (row.banSendOffers || (row.blockedActions || []).includes("send_offer")) blocked.push("إرسال العروض");
  if (row.banReceiveOffers || (row.blockedActions || []).includes("receive_offer")) blocked.push("استقبال العروض");
  if (row.banSquadChanges || (row.blockedActions || []).includes("squad_change")) blocked.push("تعديل القائمة والبيع والإعارة والاستغناء");
  return "إيقاف انتقالات" + (blocked.length ? ": " + blocked.join("، ") : " شامل");
}

export function transferRestrictionBlockMessage(row, action) {
  return "لا يمكنك " + transferActionArabic(action) + " بسبب إيقاف إداري من نظام الانتقالات حتى " + (row.endDate || "نهاية المدة") + (row.reason ? " - السبب: " + row.reason : ".");
}

export function formatRestrictionNotificationBody({ reason, startDate, endDate, restriction }) {
  return transferRestrictionShortText(restriction || {}) + " من " + (startDate || "اليوم") + " حتى " + (endDate || "نهاية المدة") + (reason ? " بسبب: " + reason : ".");
}

// ── Exchange Contracts ──────────────────────────────────────────────────────

export function normalizeExchangeContractType(value = "") {
  const kind = clean(value || "owned");
  return kind === "loan" ? "loan" : "owned";
}

export function normalizeExchangeLoanDuration(value) {
  const months = toNumber(value);
  return [2, 4, 6].includes(months) ? months : 2;
}

export function exchangeContractLabel(item = {}) {
  const kind = normalizeExchangeContractType(item.exchangeContractType || item.swapContractType || item.contractMode || item.contractType);
  if (kind === "loan") return "إعارة " + loanDurationLabel(item.exchangeLoanDurationMonths || item.loanDurationMonths || 2);
  return "بيع كامل";
}

export function normalizeOfferExchangeClauseForSave(item = {}) {
  const exchangeContractType = normalizeExchangeContractType(item.exchangeContractType || item.swapContractType || item.contractMode);
  const exchangeLoanDurationMonths = exchangeContractType === "loan"
    ? normalizeExchangeLoanDuration(item.exchangeLoanDurationMonths || item.loanDurationMonths)
    : null;
  return {
    ...item,
    exchangeContractType,
    exchangeLoanDurationMonths,
    exchangeTypeLabel: exchangeContractType === "loan" ? "إعارة" : "بيع كامل",
  };
}

// ── Player Offers ──────────────────────────────────────────────────────────

export function isPlayerReleasedByContracts(contracts = [], playerId = "") {
  const id = cleanId(playerId);
  if (!id) return false;
  return (contracts || []).some((contract) =>
    same(contract.playerId, id) &&
    clean(contract.status || "active") === "active" &&
    (clean(contract.contractType) === "released" || Boolean(contract.permanentlyRemoved))
  );
}

export function isActivePlayerOfferStatus(status) {
  return ["pending", "approvedpendingwindow"].includes(clean(status));
}

export function isBlockingOwnPlayerOfferStatus(status) {
  return ["pending", "approvedpendingwindow"].includes(clean(status));
}

export function isBlockingOwnPlayerOfferStillValid(offer) {
  const status = clean(offer?.status || "");
  if (["approvedpendingwindow"].includes(status)) return true;
  if (status === "pending") return !isOfferExpired(offer);
  return false;
}

export function isAcceptedOrCompletedPlayerOffer(offer) {
  return ["approvedpendingwindow"].includes(clean(offer?.status || ""));
}

export function isFinanciallyReservedPlayerOffer(offer) {
  const status = clean(offer?.status || "");
  if (status === "approvedpendingwindow") return true;
  if (status === "pending") return !isOfferExpired(offer);
  return false;
}

export function isTerminalPlayerOfferStatus(status) {
  return ["completed", "rejected", "cancelledbybuyer", "expired", "cancelled", "cancelledbyseller", "cancelledbecauseplayerunavailable", "cancelledbecauseplayerreleased"].includes(clean(status));
}

export function playerOfferStatusMessage(status) {
  const value = clean(status);
  if (value === "approvedpendingwindow") return "تم قبول عرضك وهو بانتظار فتح سوق الانتقالات.";
  if (value === "completed") return "تم قبول هذا العرض واكتملت الصفقة، ولا يمكن تقديم عرض جديد على نفس اللاعب.";
  if (value === "cancelledbecauseplayerunavailable") return "تم إغلاق العرض لأن اللاعب أصبح مرتبطًا بصفقة أخرى.";
  return "يوجد عرض سابق على هذا اللاعب ولا يمكن تقديم عرض جديد حالياً.";
}

export function isOfferExpired(offer) {
  if (!offer?.expiresAt) return false;
  return new Date(offer.expiresAt).getTime() < Date.now();
}

export function isSeasonCenterActiveOffer(offer = {}) {
  const status = clean(offer.status || "pending");
  return !["completed", "rejected", "cancelled", "canceled", "expired", "executionfailed", "failed"].includes(status);
}

// ── Transfer Windows ────────────────────────────────────────────────────────

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days || 0));
  return next;
}

export function localDateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function transferWindowStatusLabel(row = {}) {
  const status = clean(row.status || "open");
  if (status === "open") return "مفتوحة";
  if (status === "closed") return "مغلقة";
  if (status === "cancelled") return "ملغاة";
  if (status === "ended" || status === "expired") return "منتهية";
  return row.status || "-";
}

export function rowBelongsToTransferWindow(row = {}, windowRow = {}) {
  if (!row || !windowRow) return false;
  const windowId = cleanId(windowRow.id || windowRow.windowId || "");
  const windowName = clean(windowRow.title || windowRow.name || "");
  if (windowId && (same(row.periodId, windowId) || same(row.marketExecutionWindowId, windowId) || same(row.transferWindowId, windowId) || same(row.relatedTransferWindowId, windowId))) return true;
  if (windowName && clean(row.periodName || row.marketExecutionWindowName || row.period || "") === windowName) return true;
  const rowDate = String(row.date || row.completedDate || row.releaseDate || row.releasedDate || "").slice(0, 10);
  const start = String(windowRow.startDate || "").slice(0, 10);
  const end = String(windowRow.endDate || "").slice(0, 10);
  if (rowDate && start && end) return rowDate >= start && rowDate <= end;
  return false;
}

export function computeTransferWindowStats(windowRow = {}, transferHistory = [], moneyTransfers = [], playerReleases = []) {
  const rows = (transferHistory || []).filter((row) => rowBelongsToTransferWindow(row, windowRow));
  const releaseRows = (playerReleases || []).filter((row) => rowBelongsToTransferWindow(row, windowRow));
  const moneyRows = (moneyTransfers || []).filter((row) => rowBelongsToTransferWindow(row, windowRow));
  const isSale = (row) => {
    const value = clean([row.type, row.typeLabel, row.contractType].join(" "));
    return value.includes("buy") || value.includes("sale") || value.includes("شراء") || value.includes("بيع");
  };
  const isLoan = (row) => {
    const value = clean([row.type, row.typeLabel, row.contractType].join(" "));
    return value.includes("loan") || value.includes("إعارة") || value.includes("اعارة");
  };
  const isRelease = (row) => {
    const value = clean([row.type, row.typeLabel, row.status, row.note].join(" "));
    return value.includes("release") || value.includes("استغناء") || value.includes("released");
  };
  const moneyFromTransfers = rows.reduce((sum, row) => sum + Math.max(0, toNumber(row.amount || row.rawAmount || row.amountNumber)), 0);
  const moneyFromMoneyRows = moneyRows.reduce((sum, row) => sum + Math.max(0, toNumber(row.amount)), 0);
  const releaseKeys = new Set();
  const addReleaseKey = (row) => {
    const key = cleanId(row.relatedReleaseId || row.id || [row.playerId || row.playerid, row.memberId || row.fromMemberId, row.date || row.releasedDate || row.createdAt].join("-"));
    if (key) releaseKeys.add(key);
  };
  releaseRows.forEach(addReleaseKey);
  rows.filter(isRelease).forEach(addReleaseKey);
  return {
    moneySpent: Math.max(moneyFromTransfers, moneyFromMoneyRows),
    sales: rows.filter(isSale).length,
    loans: rows.filter(isLoan).length,
    releases: releaseKeys.size,
    pendingExecuted: rows.filter((row) => Boolean(row.marketExecutedAtWindowOpen || row.marketExecutionWindowId || row.marketExecutionCompletedAt)).length,
  };
}

export function isTransferMarketOpen(windows = []) {
  const today = localDateKey();
  return (windows || []).some((windowRow) => {
    const status = clean(windowRow.status || "");
    if (status !== "open") return false;
    const start = String(windowRow.startDate || windowRow.startdate || "").slice(0, 10);
    const end = String(windowRow.endDate || windowRow.enddate || "").slice(0, 10);
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
  });
}

export function normalizeFirebaseTransferRows(rows = []) {
  return (rows || []).map((row) => ({
    ...row,
    playerid: row.playerId || row.playerid || "",
    name: row.playerName || row.name || row.player || "لاعب غير مسجل",
    player: row.playerName || row.name || row.player || "لاعب غير مسجل",
    from: row.fromMemberName || row.from || "-",
    to: row.toMemberName || row.to || "-",
    amount: formatMoney(row.amount || 0),
    type: row.typeLabel || row.type || "انتقال",
    date: row.date || formatTransferDate(row.createdAt),
    note: row.note || row.periodName || row.status || "-",
    period: row.periodName || row.period || "انتقالات Firebase",
  }));
}

export function mergeTransferPeriods(sheetPeriods = [], firebasePeriods = []) {
  const map = new Map();
  [...(sheetPeriods || []), ...(firebasePeriods || [])].forEach((period) => {
    const id = clean(period?.id || period?.name || "");
    if (!id) return;
    if (!map.has(id)) map.set(id, { ...period, rows: [] });
    const current = map.get(id);
    current.name = current.name || period.name;
    current.rows = [...(current.rows || []), ...(period.rows || [])];
  });
  return Array.from(map.values()).map((period) => ({
    ...period,
    rows: (period.rows || []).slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
  }));
}

export function getTransferWindowForDate(windows = [], dateKey = "") {
  const day = String(dateKey || new Date().toISOString().slice(0, 10)).slice(0, 10);
  return (windows || []).find((windowRow) => {
    const start = String(windowRow.startDate || windowRow.startdate || "").slice(0, 10);
    const end = String(windowRow.endDate || windowRow.enddate || "").slice(0, 10);
    if (start && day < start) return false;
    if (end && day > end) return false;
    return true;
  }) || null;
}

export function getTransferWindowNameForDate(windows = [], dateKey = "") {
  const found = getTransferWindowForDate(windows, dateKey);
  return found?.name || found?.title || found?.period || "انتقالات Firebase";
}

export function getTransferWindowIdForDate(windows = [], dateKey = "") {
  const found = getTransferWindowForDate(windows, dateKey);
  return clean(found?.id || found?.name || found?.title || "انتقالات Firebase");
}

export function getTransferPeriods(rows) {
  const names = [];
  rows.forEach((row) => {
    const name = row.period || row["الفترة"] || "الفترة الأولى";
    if (name && !names.includes(name)) names.push(name);
  });
  return names.map((name) => ({
    id: clean(name),
    name,
    rows: rows.filter(
      (row) =>
        clean(row.period || row["الفترة"] || "الفترة الأولى") === clean(name)
    ),
  }));
}

// ── Free Agents ─────────────────────────────────────────────────────────────

export function isFreeAgentPlayer(player = {}) {
  const text = clean([
    player?.rosterType,
    player?.rostertype,
    player?.playerType,
    player?.playertype,
    player?.registrationType,
    player?.registrationtype,
    player?.sourceType,
    player?.sourcetype,
    player?.status,
    player?.notes,
    player?.note,
    player?.freeAgent,
    player?.freeagent,
    player?.isFreeAgent,
    player?.isfreeagent,
  ].join(" "));
  return Boolean(
    text.includes("free_agent") ||
    text.includes("free agent") ||
    text.includes("free") ||
    text.includes("حر") ||
    text.includes("لاعبحر") ||
    text.includes("لاعب حر")
  );
}

export function isFreeOriginContract(contract = {}) {
  if (!contract) return false;
  const rosterType = clean(contract.rosterType || contract.rostertype || "");
  return Boolean(
    toBooleanFlag(contract.isFreeOrigin) ||
      toBooleanFlag(contract.freeAgentOrigin) ||
      rosterType === "free" ||
      rosterType.includes("حر")
  );
}

export function isFreeAgentPoolContract(contract = {}) {
  if (!contract) return false;
  const type = clean(contract.contractType || "");
  const status = clean(contract.status || "active");
  return Boolean(
    status === "active" &&
      !cleanId(contract.currentMemberId) &&
      (type === "free_agent" ||
        type === "freeagent" ||
        toBooleanFlag(contract.availableFreeAgent) ||
        toBooleanFlag(contract.releasedToFreeAgent))
  );
}

export function getFreeAgentSlotOwnerIdFromContract(contract = {}, fallbackOwnerId = "") {
  if (!contract) return cleanId(fallbackOwnerId);
  return cleanId(
    contract.freeAgentSlotOwnerMemberId ||
      contract.freeagentslotownermemberid ||
      (isFreeOriginContract(contract) ? contract.originalOwnerMemberId || contract.ownerMemberId || fallbackOwnerId : fallbackOwnerId)
  );
}

export function hasEverUsedFreeAgentSlot(registrations = [], status = null, activeFreeContract = null, memberId = "") {
  const id = cleanId(memberId);
  if (!id) return false;
  return Boolean(
    activeFreeContract ||
      toBooleanFlag(status?.hasUsedFreeSlot) ||
      cleanId(status?.currentFreePlayerId || status?.lostFreePlayerId || "") ||
      hasAnyFreeAgentRegistrationForMember(registrations, id)
  );
}

export function normalizeOfferAsTransferContractRow(offer = {}) {
  const type = clean(offer?.type || offer?.contractType || "buy") === "loan" ? "loan" : "buy";
  const amountValue = toNumber(offer?.amount || offer?.rawAmount || offer?.amountNumber || 0);
  const status = clean(offer?.status || "completed");
  return {
    ...offer,
    playerId: offer?.targetPlayerId || offer?.playerId || offer?.playerid || "",
    playerid: offer?.targetPlayerId || offer?.playerId || offer?.playerid || "",
    playerName: offer?.targetPlayerName || offer?.playerName || offer?.player || offer?.name || "لاعب",
    playerImage: offer?.targetPlayerImage || offer?.playerImage || "",
    playerRating: offer?.targetPlayerRating || offer?.playerRating || "",
    playerPosition: offer?.targetPlayerPosition || offer?.playerPosition || "",
    type,
    typeLabel: offer?.typeLabel || (type === "loan" ? "عقد إعارة" : (Array.isArray(offer?.offeredPlayers) && offer.offeredPlayers.length ? "عقد شراء + تبادل" : "عقد شراء")),
    amount: amountValue,
    rawAmount: amountValue,
    from: offer?.fromMemberName || offer?.from || "",
    to: offer?.toMemberName || offer?.to || "",
    date: offer?.completedDate || offer?.completedAt || offer?.approvedAt || offer?.date || formatTransferDate(offer?.createdAt),
    status: status === "approvedpendingwindow" && (offer?.completedAt || offer?.marketWasOpenAtApproval || offer?.executedAt || offer?.loanStartDate) ? "completed" : (offer?.status || "completed"),
  };
}

export function getTransferContractParties(row = {}) {
  const loan = isLoanTransferRow(row);
  const seller = row?.fromMemberName || row?.from || row?.previousMemberName || "-";
  const buyer = row?.toMemberName || row?.to || row?.currentMemberName || "-";
  const realOwner = row?.originalOwnerMemberName || row?.ownerMemberName || row?.realOwnerMemberName || seller || "-";
  return {
    from: loan ? realOwner : seller,
    to: buyer,
    fromLabel: loan ? "المالك الحقيقي" : "من",
    toLabel: loan ? "المستعير" : "إلى",
    signerFromLabel: loan ? "توقيع المالك الحقيقي" : "توقيع الطرف الأول",
    signerToLabel: loan ? "توقيع المستلم" : "توقيع الطرف الثاني",
  };
}

export function hasFreeAgentRegistrationRecord(rows = [], playerId = "", memberId = "") {
  const id = cleanId(playerId);
  const ownerId = cleanId(memberId);
  if (!id || !ownerId) return false;
  return (rows || []).some((item) =>
    same(item.playerId, id) &&
    same(item.memberId || item.toMemberId || item.currentMemberId, ownerId) &&
    !["cancelled", "reversed"].includes(clean(item.status || "completed"))
  );
}

export function hasAnyFreeAgentRegistrationForMember(rows = [], memberId = "") {
  const ownerId = cleanId(memberId);
  if (!ownerId) return false;
  return (rows || []).some((item) =>
    same(item.memberId || item.toMemberId || item.currentMemberId, ownerId) &&
    !["cancelled", "reversed"].includes(clean(item.status || "completed"))
  );
}

export function getRosterKindCode({ contractType, originalOwnerMemberId, currentMemberId, freeAgent }) {
  if (freeAgent) return "free";
  const type = clean(contractType || "");
  if (type === "loan") return "pro_loan";
  if (type === "owned" && originalOwnerMemberId && currentMemberId && !same(originalOwnerMemberId, currentMemberId)) return "pro_owned";
  return "base";
}

export function getRosterPlayerKindFromContract(player, contract, memberId = "") {
  if (!contract) return isFreeAgentPlayer(player) ? "free" : "base";
  const type = clean(contract.contractType || "");
  if (type === "free_agent" || isFreeAgentPoolContract(contract)) return "free";
  const currentOwner = cleanId(contract.currentMemberId || memberId || "");
  const freeSlotOwner = getFreeAgentSlotOwnerIdFromContract(contract, contract.originalOwnerMemberId || memberId || "");
  if (type === "loan") return "pro_loan";
  if (type === "owned") {
    if (isFreeAgentPlayer(player) || isFreeOriginContract(contract)) {
      if (freeSlotOwner && currentOwner && same(freeSlotOwner, currentOwner)) return "free";
      return "pro_owned";
    }
    const originalOwner = cleanId(contract.baseOwnerMemberId || contract.baseOwnerId || contract.originalBaseOwnerMemberId || contract.originalOwnerMemberId || player?.memberid || "");
    if (originalOwner && currentOwner && !same(originalOwner, currentOwner)) return "pro_owned";
  }
  return "base";
}

export function getPlayerRosterKindLabel(player, contracts = [], memberId = "") {
  const playerId = getPlayerStableId(player);
  const contract = (contracts || []).find((item) => same(item.playerId, playerId) && clean(item.status || "active") === "active");
  const kind = getRosterPlayerKindFromContract(player, contract, memberId);
  if (kind === "pro_owned") return "محترف شراء";
  if (kind === "pro_loan") return "محترف إعارة";
  if (kind === "free") return "لاعب حر";
  return "لاعب أساسي";
}

// ── Finance Records ─────────────────────────────────────────────────────────

export function getFinanceMemberId(row) {
  return cleanId(
    row?.memberid ||
      row?.memberId ||
      row?.member ||
      row?.member_id ||
      row?.membercode ||
      row?.playerid ||
      row?.userid ||
      row?.["رقمالعضو"] ||
      row?.["العضو"]
  );
}

export function getFinanceFromMemberId(row) {
  return cleanId(
    row?.frommemberid ||
      row?.fromMemberId ||
      row?.from_member_id ||
      row?.fromid ||
      row?.fromId ||
      row?.senderid ||
      row?.senderId ||
      row?.["من"] ||
      row?.["منالعضو"]
  );
}

export function getFinanceToMemberId(row) {
  return cleanId(
    row?.tomemberid ||
      row?.toMemberId ||
      row?.to_member_id ||
      row?.toid ||
      row?.toId ||
      row?.receiverid ||
      row?.receiverId ||
      row?.["إلى"] ||
      row?.["الى"] ||
      row?.["الىالعضو"] ||
      row?.["إلىالعضو"]
  );
}

export function isFinanceTransfer(row) {
  const explicit = clean(
    row?.direction ||
      row?.dir ||
      row?.kind ||
      row?.status ||
      row?.operation ||
      row?.["الاتجاه"] ||
      row?.["نوعالحركة"]
  );

  const text = clean(
    [
      explicit,
      row?.type,
      row?.note,
      row?.description,
      row?.details,
      row?.["النوع"],
      row?.["ملاحظات"],
      row?.["البيان"],
    ].join(" ")
  );

  return (
    explicit === "transfer" ||
    explicit === "تحويل" ||
    text.includes("transfer") ||
    text.includes("تحويل") ||
    Boolean(getFinanceFromMemberId(row) && getFinanceToMemberId(row))
  );
}

export function getMemberFinanceRows(rows, memberId) {
  const id = cleanId(memberId);
  if (!id) return [];
  return (rows || [])
    .filter((item) => {
      if (isFinanceTransfer(item)) {
        return same(getFinanceFromMemberId(item), id) || same(getFinanceToMemberId(item), id);
      }
      return same(getFinanceMemberId(item), id);
    })
    .slice()
    .sort((a, b) => dateValue(b.date || b.createdat) - dateValue(a.date || a.createdat));
}

export function getFinanceRawAmount(row) {
  return (
    row?.amount ??
    row?.value ??
    row?.total ??
    row?.price ??
    row?.cost ??
    row?.fee ??
    row?.money ??
    row?.balance ??
    row?.["المبلغ"] ??
    row?.["القيمة"] ??
    row?.["السعر"] ??
    ""
  );
}

export function parseFinanceAmount(value) {
  let raw = normalizeDigits(value).trim();
  if (!raw) return 0;

  const negative =
    raw.startsWith("-") ||
    raw.includes("(خ") ||
    raw.includes("خصم") ||
    raw.includes("expense") ||
    /^\(.*\)$/.test(raw);

  let multiplier = 1;
  const compact = raw.toLowerCase();

  if (
    compact.includes("مليار") ||
    compact.includes("billion") ||
    compact.includes("bn") ||
    /\bb\b/.test(compact)
  ) {
    multiplier = 1000000000;
  } else if (
    compact.includes("مليون") ||
    compact.includes("ملايين") ||
    compact.includes("million") ||
    compact.includes("mn") ||
    /\bm\b/.test(compact)
  ) {
    multiplier = 1000000;
  } else if (
    compact.includes("ألف") ||
    compact.includes("الف") ||
    compact.includes("thousand") ||
    /\bk\b/.test(compact)
  ) {
    multiplier = 1000;
  }

  raw = raw
    .replace(/[^\d.,-]/g, "")
    .replace(/^\((.*)\)$/, "$1")
    .trim();

  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    if (lastComma > lastDot) {
      raw = raw.replace(/\./g, "").replace(",", ".");
    } else {
      raw = raw.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = raw.split(",");
    const last = parts[parts.length - 1] || "";
    if (last.length === 3 && parts.length > 1) {
      raw = raw.replace(/,/g, "");
    } else {
      raw = raw.replace(",", ".");
    }
  } else if (hasDot) {
    const parts = raw.split(".");
    const allGroupsAreThousands =
      parts.length > 1 && parts.slice(1).every((part) => part.length === 3);
    if (allGroupsAreThousands) raw = raw.replace(/\./g, "");
  }

  const number = Number(raw);
  if (!Number.isFinite(number)) return 0;
  const signed = Math.abs(number) * multiplier;
  return negative || number < 0 ? -signed : signed;
}

export function getFinanceDirection(row, memberId = "") {
  const id = cleanId(memberId);

  if (isFinanceTransfer(row)) {
    if (id && same(getFinanceFromMemberId(row), id)) return "expense";
    if (id && same(getFinanceToMemberId(row), id)) return "income";
    return "transfer";
  }

  const explicit = clean(
    row?.direction ||
      row?.dir ||
      row?.kind ||
      row?.status ||
      row?.operation ||
      row?.["الاتجاه"] ||
      row?.["نوعالحركة"]
  );

  if (["income", "in", "plus", "+", "add", "credit", "deposit", "دخل", "ايراد", "إيراد", "اضافة", "إضافة", "ايداع", "إيداع", "زيادة", "تحصيل", "استلام", "استقبال", "مكافأة", "مكافاه", "جائزة", "جوائز"].includes(explicit)) return "income";
  if (["expense", "out", "minus", "-", "subtract", "debit", "withdraw", "مصروف", "خصم", "شراء", "دفع", "سحب", "غرامة", "غرامه", "خروج", "ناقص", "صرف"].includes(explicit)) return "expense";

  const rawAmount = String(getFinanceRawAmount(row) || "").trim();
  if (parseFinanceAmount(rawAmount) < 0) return "expense";

  const text = clean([row?.type, row?.note, row?.from, row?.description, row?.details, row?.["النوع"], row?.["ملاحظات"], row?.["البيان"]].join(" "));

  if (text.includes("شراء") || text.includes("خصم") || text.includes("غرام") || text.includes("دفع") || text.includes("مصروف") || text.includes("عقد") || text.includes("سحب") || text.includes("صرف") || text.includes("خروج") || text.includes("expense") || text.includes("debit") || text.includes("withdraw")) return "expense";
  if (text.includes("جائزة") || text.includes("جوائز") || text.includes("مكاف") || text.includes("بيع") || text.includes("استقبال") || text.includes("استلام") || text.includes("إيداع") || text.includes("ايداع") || text.includes("دخل") || text.includes("إيراد") || text.includes("ايراد") || text.includes("تحصيل") || text.includes("income") || text.includes("credit") || text.includes("deposit")) return "income";

  return "neutral";
}

export function getFinanceSignedAmount(row, memberId = "") {
  const parsedAmount = parseFinanceAmount(getFinanceRawAmount(row));
  const absoluteAmount = Math.abs(parsedAmount);
  const id = cleanId(memberId);

  if (isFinanceTransfer(row)) {
    if (id && same(getFinanceFromMemberId(row), id)) return -absoluteAmount;
    if (id && same(getFinanceToMemberId(row), id)) return absoluteAmount;
    return 0;
  }

  const direction = getFinanceDirection(row, id);
  if (direction === "expense") return -absoluteAmount;
  if (direction === "income") return absoluteAmount;
  return parsedAmount;
}

export function computeMemberBalance(rows, fallbackValue = 0, memberId = "") {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!safeRows.length) return toNumber(fallbackValue);
  return safeRows.reduce((total, item) => total + getFinanceSignedAmount(item, memberId), 0);
}

export function financeDirectionLabel(direction) {
  if (direction === "income") return "إضافة للرصيد";
  if (direction === "expense") return "خصم من الرصيد";
  if (direction === "transfer") return "تحويل مالي";
  return "حركة مالية";
}

export function getFinanceDisplayTitle(row, memberId = "", members = []) {
  const rowType = clean(row?.type);
  if (rowType === "offer_fee") return "رسوم تقديم عرض لاعب";
  if (rowType === "offer_edit_fee") return "رسوم تعديل عرض لاعب";
  if (isFinanceTransfer(row)) {
    const fromId = getFinanceFromMemberId(row);
    const toId = getFinanceToMemberId(row);
    if (memberId && same(fromId, memberId)) return `تحويل إلى ${getMemberName(members, toId)}`;
    if (memberId && same(toId, memberId)) return `استقبال من ${getMemberName(members, fromId)}`;
    return "تحويل مالي";
  }
  const direction = getFinanceDirection(row, memberId);
  return row.typeLabel || row.type || (direction === "income" ? "إضافة" : direction === "expense" ? "خصم" : "حركة مالية");
}

export function getFinanceRecordDate(row = {}) {
  return row?.date || row?.createdat || row?.createdAt?.toDate?.()?.toISOString?.().slice(0, 10) || (row?.createdAt?.seconds ? new Date(Number(row.createdAt.seconds) * 1000).toISOString().slice(0, 10) : "—");
}

export function getFinanceRecordNote(row = {}) {
  const note = row?.note ?? row?.description ?? row?.details ?? row?.statement ?? row?.memo ?? row?.["ملاحظات"] ?? row?.["البيان"] ?? row?.["تفاصيل"] ?? "";
  const value = String(note || "").trim();
  return value && value !== "-" ? value : "-";
}

export function financeTypeClass(row, memberId = "") {
  const direction = getFinanceDirection(row, memberId);
  if (direction === "income") return "income";
  if (direction === "expense") return "expense";
  return "neutral";
}

export function transferTypeClass(type) {
  const value = clean(type);
  if (value.includes("إعارة")) return "loan";
  if (value.includes("تبديل") || value.includes("تبادل")) return "swap";
  if (value.includes("استغ") || value.includes("استغناء")) return "release";
  if (value.includes("حر") || value.includes("عقد")) return "free";
  return "neutral";
}

export function transferRowTimeValue(row = {}) {
  if (!row) return 0;
  if (row.createdAt?.toDate) return row.createdAt.toDate().getTime();
  if (row.createdAt?.seconds) return Number(row.createdAt.seconds) * 1000;
  const parsed = new Date(row.date || row.createdAt || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export { loanDurationLabel, isLoanTransferRow };

export function transferStatusLabel(status) {
  const value = clean(status || "");
  if (value === "completed") return "مكتملة";
  if (value === "approvedpendingwindow") return "بانتظار فتح السوق";
  if (value === "active") return "نشطة";
  if (value === "terminated") return "منتهية";
  if (value === "cancelled") return "ملغاة";
  return status || "مسجلة";
}

export function effectiveTransferStatusLabel(row = {}) {
  if (clean(row?.status) === "approvedpendingwindow" && (row?.marketWasOpenAtApproval || row?.loanStartDate || row?.completedAt)) return "مكتملة";
  return transferStatusLabel(row?.status);
}

export function formatContractIssuedAt(row = {}) {
  const raw = row?.approvedAt || row?.createdAt || row?.updatedAt || row?.date || null;
  let date = null;
  if (raw?.toDate) date = raw.toDate();
  else if (raw?.seconds) date = new Date(Number(raw.seconds) * 1000);
  else if (typeof raw === "string" && raw.length > 10) date = new Date(raw);
  if (!date || Number.isNaN(date.getTime())) date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function transferTypeDisplayLabel(value = "") {
  const key = clean(value);
  if (key === "loan") return "إعارة";
  if (key === "buy" || key === "owned") return "شراء نهائي";
  if (key === "release") return "إنهاء تعاقد";
  return value || "انتقال";
}

// Also export internal helpers that are useful externally
export {
  notificationTimeValue,
  dateOnlyMs,
  toBooleanFlag,
  getPlayerStableId,
  getMemberName,
  adminRewardTypeLabel,
  adminDecisionTypeLabel,
};
