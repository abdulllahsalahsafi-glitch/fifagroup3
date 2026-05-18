import React, { useState } from "react";

const DEFAULT_CONFIG = {
  mainTitle: "FIFA GROUP",
  seasonName: "الموسم السادس",
  seasonTitle: "الموسم السادس 2025",
  membersTitle: "الأعضاء",
  seasonTournamentsTitle: "بطولات الموسم",
  transfersTitle: "انتقالات الموسم",
  rankingTitle: "تصنيف الموسم",
  linksTitle: "روابط هامة",
  playersTitle: "قائمة اللاعبين",
  trophiesTitle: "البطولات",
  financeTitle: "السجل المالي",
  archiveTitle: "السجل العام للبطولات",
  statsTitle: "الإحصائيات العامة",
  transfersSubtitle: "تظهر الفترات تلقائيًا من Google Sheets، ويمكنك إضافة فترة جديدة بدون تعديل الكود.",
  rankingSubtitle: "تصنيف الموسم النشط محسوب تلقائيًا من سجل البطولات.",
  linksSubtitle: "روابط النظام والسجلات والصفحات المهمة.",
  searchPlaceholder: "ابحث عن لاعب أو مركز أو عقد...",
  loadingTitle: "",
  loadingSubtitle: "",
  noDataTitle: "حاول مجددًا",
  errorTitle: "حدث خطأ في تحميل البيانات",
  appStatus: "active",
  maintenanceMessage: "التطبيق تحت الصيانة مؤقتًا",
  showFinance: "true",
  showRanking: "true",
  showTransfers: "true",
  showLinks: "true",
  showSeasonTournaments: "true",
  showMemberTrophies: "true",
  showSearch: "true",
  showArchive: "true",
  showStats: "true",
  defaultPage: "home",
  activeSeasonId: "S6",
  primaryColor: "#00e5ff",
  secondaryColor: "#2f8cff",
  accentColor: "#8b5cf6",
  headerImage: "",
  appIcon: "",
  groupLogo: "",
  exportLogo: "",
  announcement: "",
  coverHeight: "118px",
  coverHeightMobile: "50px",
  balanceIcon: "💰",
  totalTrophiesIcon: "🏆",
  navMembersIcon: "👥",
  navSeasonIcon: "🏆",
  navArchiveIcon: "📚",
  navRankingIcon: "📊",
  navMoreIcon: "☰",
  menuStatsIcon: "📈",
  menuTransfersIcon: "🔁",
  menuLinksIcon: "🔗",
  memberTeamIcon: "⚽",
  memberNationalIcon: "🏳️",
  finalsPlayedIcon: "⚔️",
  finalsWonIcon: "🥇",
  finalsLostIcon: "🥈",
  goalsForIcon: "⚽",
  goalsAgainstIcon: "🥅",
  relegationsIcon: "⬇️",
  seasonCountIcon: "🏆",
  seasonPointsIcon: "⭐",
  rankingTitlesIcon: "🏆",
  rankingPointsIcon: "⭐",
  transferAmountIcon: "💰",
  transferTypeIcon: "📌",
  transferDateIcon: "📅",
  transferNoteIcon: "⏱️",
  linkFacebookIcon: "👥",
  linkTournamentsIcon: "🏆",
  linkSeasonIcon: "📘",
  linkDefaultIcon: "📌",
  memberCardTrophyIcon: "🏆",
  archiveTrophyTabIcon: "🏆",
  archiveSeasonTabIcon: "📅",
  archiveMemberTabIcon: "👤",
};

export function DetailPage({
  config = DEFAULT_CONFIG,
  view,
  members,
  players,
  finance,
  trophyMap = {},
  playerContracts = [],
  freeAgentRegistrations = [],
  freePlayerStatus = [],
  freeAgentQueue = [],
  currentMemberId,
  currentMember,
  currentAvailableBalance = 0,
  currentMemberPlayers = [],
  playerOffers,
  isMarketOpen,
  onBack,
  onOpenView,
  onInfo,
  onCreatePlayerOffer,
  onUpdatePlayerOffer,
  onCancelPlayerOffer,
  onAcceptOffer,
  onRejectOffer,
  onReleasePlayer,
  onTerminateLoan,
  onRegisterFreeAgentFee,
}) {
  const [detailOfferModal, setDetailOfferModal] = useState(null);

  function openDetailPlayerOffer(player, existingOffer = null) {
    setDetailOfferModal({
      player,
      existingOffer,
      targetMember: view?.ownerMember || null,
    });
  }

  async function cancelDetailPlayerOffer(existingOffer) {
    if (!existingOffer?.id) return;
    await onCancelPlayerOffer?.(existingOffer.id);
  }

  if (!view) return null;
  if (view.type === "playerDetailOffer")
    return (
      <main className="widePage glass">
        {detailOfferModal ? (
          <PlayerOfferModal
            targetMember={detailOfferModal.targetMember || view.ownerMember}
            targetPlayer={detailOfferModal.player}
            existingOffer={detailOfferModal.existingOffer}
            currentMemberId={currentMemberId}
            currentAvailableBalance={currentAvailableBalance}
            currentMemberPlayers={currentMemberPlayers}
            onClose={() => setDetailOfferModal(null)}
            onSubmit={detailOfferModal.existingOffer ? onUpdatePlayerOffer : onCreatePlayerOffer}
          />
        ) : null}
        <BackButton onBack={onBack} />
        <PlayerDetailSubPage
          player={view.player}
          ownerMember={view.ownerMember}
          currentMemberId={currentMemberId}
          currentMember={currentMember}
          playerOffers={playerOffers}
          playerContracts={playerContracts}
          freeAgentRegistrations={freeAgentRegistrations}
          freePlayerStatus={freePlayerStatus}
          freeAgentQueue={freeAgentQueue}
          ownerPlayerCount={(players || []).filter((item) => same(item.memberid, view.ownerMember?.id) && !isPlayerReleasedByContracts(playerContracts, getPlayerStableId(item))).length}
          canMakeOffer={Boolean(currentMemberId && view.ownerMember?.id && !same(currentMemberId, view.ownerMember.id))}
          isMarketOpen={isMarketOpen}
          members={members}
          onBack={onBack}
          onOffer={openDetailPlayerOffer}
          onCancelOffer={cancelDetailPlayerOffer}
          onAcceptOffer={onAcceptOffer}
          onRejectOffer={onRejectOffer}
          onReleasePlayer={onReleasePlayer}
          onTerminateLoan={onTerminateLoan}
          onRegisterFreeAgentFee={onRegisterFreeAgentFee}
        />
      </main>
    );
  if (view.type === "record")
    return (
      <RecordDetailPage
        record={view.record}
        members={members}
        onBack={onBack}
      />
    );
  if (view.type === "memberTrophy")
    return (
      <RecordsSubPage
        title={`${view.group.name} — ${view.group.count} بطولة`}
        subtitle={`بطولات ${view.member.name}`}
        rows={view.group.rows}
        members={members}
        hideWinner
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  if (view.type === "memberAllTrophies")
    return (
      <MemberAllTrophiesSubPage
        member={view.member}
        groups={view.groups}
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  if (view.type === "memberFinance")
    return (
      <main className="widePage glass">
        <BackButton onBack={onBack} />
        <header className="pageHead">
          <h2>السجل المالي — {view.member.name}</h2>
          <p>كل الحركات المالية الخاصة بالعضو.</p>
        </header>
        <FinanceSection
          config={{ financeTitle: "السجل المالي" }}
          rows={view.rows || []}
          member={view.member}
          members={members}
        />
      </main>
    );
  if (view.type === "memberPlayers")
    return (
      <main className="widePage glass">
        <BackButton onBack={onBack} />
        <header className="pageHead">
          <h2>لاعبو {view.member.name}</h2>
          <p>قائمة لاعبي العضو.</p>
        </header>
        <PlayersSection
          config={{
            playersTitle: "قائمة اللاعبين",
            showSearch: "false",
            searchPlaceholder: "",
          }}
          rows={view.rows || []}
          search=""
          setSearch={() => {}}
          playerCount={(view.rows || []).length}
        />
      </main>
    );
  if (view.type === "memberFinals")
    return (
      <FinalsSubPage
        title={view.title}
        rows={view.rows || []}
        members={members}
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  if (view.type === "seasonTrophy" || view.type === "archiveTrophy")
    return (
      <RecordsSubPage
        title={view.title}
        rows={view.group.rows}
        members={members}
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  if (view.type === "rankingMemberWins") {
    const groups = groupByTrophy(view.rows || [], trophyMap);
    return (
      <MemberAllTrophiesSubPage
        member={{ name: view.member?.name || "العضو" }}
        groups={groups}
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  }
  if (view.type === "archiveMemberWins")
    return (
      <RecordsSubPage
        title={view.title}
        subtitle="كل البطولات التي فاز بها العضو في جميع المواسم."
        rows={view.rows || []}
        members={members}
        hideWinner
        onBack={onBack}
        onOpenView={onOpenView}
      />
    );
  return (
    <main className="widePage glass">
      <BackButton onBack={onBack} />
      <div className="empty">لا توجد تفاصيل متاحة لهذا الكرت.</div>
    </main>
  );
}
