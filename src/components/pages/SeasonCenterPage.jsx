import React from "react";

export function SeasonCenterPage({
  config,
  members = [],
  competitions = [],
  transferWindows = [],
  playerOffers = [],
  notifications = [],
  currentMember,
  currentMemberId = "",
  isFifaAdmin = false,
  onOpenCompetition,
}) {
  const memberId = cleanId(currentMemberId);
  const activeCompetitions = (competitions || [])
    .filter((competition) => {
      const status = clean(competition.status || "active");
      return !["completed", "cancelled", "deleted", "archived"].includes(status);
    })
    .map((competition) => buildLinkedLeagueCupDisplayCompetition(competition, competitions || []))
    .sort((a, b) => notificationTimeValue(b.createdAt || b.updatedAt || b.startDate) - notificationTimeValue(a.createdAt || a.updatedAt || a.startDate));

  const allMatches = activeCompetitions.flatMap((competition) => getSeasonCenterCompetitionMatches(competition));
  const openMatches = allMatches.filter((item) => isSeasonCenterOpenMatch(item.match));
  const myMatches = memberId
    ? openMatches.filter(({ match }) => same(match.homeMemberId, memberId) || same(match.awayMemberId, memberId))
    : [];

  const visibleMatches = (isFifaAdmin ? openMatches : myMatches).slice(0, 8);
  const visibleCompetitions = activeCompetitions.slice(0, 6);
  const activeOfferRows = (playerOffers || []).filter((offer) => {
    if (!isSeasonCenterActiveOffer(offer)) return false;
    if (isFifaAdmin) return true;
    return memberId && (same(offer.fromMemberId, memberId) || same(offer.toMemberId, memberId));
  });

  const marketOpen = isTransferMarketOpen(transferWindows || []);
  const openWindow = (transferWindows || []).find((item) => clean(item.status || "") === "open") || null;
  const waitingLinkedCups = activeCompetitions.filter((competition) =>
    clean(competition.competitionType || competition.type) === "cup" && clean(competition.cupMode || competition.cupScheduleMode || "").includes("linked")
  );

  const latestNotifications = (notifications || []).slice(0, 4);
  const radarItems = getSeasonCenterRadarItems({
    activeCompetitions,
    allCompetitions: competitions || [],
    openMatches,
    myMatches,
    activeOfferRows,
    marketOpen,
    openWindow,
    isFifaAdmin,
    latestNotifications,
  });
  const summaryCards = [
    { label: "بطولات نشطة", value: activeCompetitions.length, tone: "green" },
    { label: isFifaAdmin ? "مباريات غير مسجلة" : "مبارياتك القادمة", value: isFifaAdmin ? openMatches.length : myMatches.length, tone: "blue" },
    { label: isFifaAdmin ? "عروض منظورة" : "عروضك النشطة", value: activeOfferRows.length, tone: "violet" },
    { label: "سوق الانتقالات", value: marketOpen ? "مفتوح" : "مغلق", tone: marketOpen ? "green" : "muted" },
  ];

  return (
    <main className="widePage glass seasonCenterPage">
      <style>{seasonCenterCss}</style>
      <header className="pageHead">
        <h2>مركز الموسم</h2>
        <p>نظرة سريعة على البطولات النشطة، المباريات القادمة، سوق الانتقالات، والتنبيهات المهمة.</p>
      </header>

      <section className="seasonCenterSummary">
        {summaryCards.map((card) => (
          <div className={`seasonCenterStat ${card.tone}`} key={card.label}>
            <b>{card.value}</b>
            <span>{card.label}</span>
          </div>
        ))}
      </section>

      <section className="seasonCenterGrid">
        <div className="seasonCenterBox glassSoft">
          <div className="seasonCenterBoxHead">
            <div>
              <h3>{isFifaAdmin ? "المباريات غير المسجلة" : "مبارياتك القادمة"}</h3>
              <p>{isFifaAdmin ? "كل المواجهات التي تحتاج نتيجة في البطولات النشطة." : "مبارياتك التي لم تُسجل نتيجتها بعد."}</p>
            </div>
            <span>{visibleMatches.length}</span>
          </div>
          <div className="seasonCenterList">
            {visibleMatches.length ? visibleMatches.map(({ competition, match }, index) => (
              <button
                type="button"
                className="seasonCenterMatch"
                key={(competition.id || competition.name || "competition") + "-" + (match.id || index)}
                onClick={() => onOpenCompetition && onOpenCompetition(competition.id)}
              >
                <small>{competition.name || competition.title || "بطولة"} · {match.label || seasonCenterPhaseLabel(match.phase) || "مباراة"}</small>
                <b>{match.homeName || getMemberName(members, match.homeMemberId) || "بانتظار"} <em>ضد</em> {match.awayName || getMemberName(members, match.awayMemberId) || "بانتظار"}</b>
                <span>{match.gameTitle || match.game || match.gameCode || "—"}</span>
              </button>
            )) : (
              <div className="seasonCenterEmpty">لا توجد مباريات مطلوبة الآن.</div>
            )}
          </div>
        </div>

        <div className="seasonCenterBox glassSoft">
          <div className="seasonCenterBoxHead">
            <div>
              <h3>حالة البطولات</h3>
              <p>ملخص البطولات النشطة ونسبة اكتمال النتائج.</p>
            </div>
            <span>{visibleCompetitions.length}</span>
          </div>
          <div className="seasonCenterList">
            {visibleCompetitions.length ? visibleCompetitions.map((competition) => {
              const stats = getSeasonCenterCompetitionStats(competition, competitions);
              return (
                <button
                  type="button"
                  className="seasonCenterCompetition"
                  key={competition.id || competition.name}
                  onClick={() => onOpenCompetition && onOpenCompetition(competition.id)}
                >
                  <div>
                    <b>{competition.name || competition.title || "بطولة"}</b>
                    <small>{competitionTypeArabic(competition.competitionType || competition.type)} · {stats.completed}/{stats.total} {stats.unitLabel || "مكتملة"}</small>
                  </div>
                  <span>{stats.percent ?? (stats.total ? Math.round((stats.completed / stats.total) * 100) : 0)}%</span>
                </button>
              );
            }) : (
              <div className="seasonCenterEmpty">لا توجد بطولات نشطة حاليًا.</div>
            )}
          </div>
        </div>

        <div className="seasonCenterBox glassSoft">
          <div className="seasonCenterBoxHead">
            <div>
              <h3>سوق الانتقالات</h3>
              <p>{isFifaAdmin ? "ملخص إداري مختصر للعروض والسوق." : "عروضك أنت فقط مع حالة السوق، بدون كشف عروض الآخرين."}</p>
            </div>
            <span className={marketOpen ? "open" : "closed"}>{marketOpen ? "مفتوح" : "مغلق"}</span>
          </div>
          <div className="seasonCenterMarketState">
            <b>{marketOpen ? (openWindow?.title || openWindow?.name || "فترة انتقالات مفتوحة") : "لا توجد فترة انتقالات مفتوحة"}</b>
            <small>{marketOpen && openWindow?.endDate ? "حتى " + openWindow.endDate : "العروض والصفقات تظهر في صفحة الانتقالات."}</small>
          </div>
          {activeOfferRows.length ? (
            <div className="seasonCenterMiniRows">
              {activeOfferRows.slice(0, 3).map((offer) => (
                <div key={offer.id || offer.targetPlayerId || offer.playerId}>
                  <b>{offer.targetPlayerName || offer.playerName || "عرض انتقال"}</b>
                  <span>{formatMoney(offer.amount || 0)}</span>
                </div>
              ))}
            </div>
          ) : <div className="seasonCenterEmpty">{isFifaAdmin ? "لا توجد عروض نشطة الآن." : "لا توجد عروض نشطة تخصك الآن."}</div>}
        </div>

        <div className="seasonCenterBox glassSoft">
          <div className="seasonCenterBoxHead">
            <div>
              <h3>الرادار الذكي</h3>
              <p>تنبيهات قراءة فقط لما يحتاج انتباه داخل الموسم.</p>
            </div>
            <span>{radarItems.length}</span>
          </div>
          <div className="seasonCenterAlerts">
            {radarItems.length ? radarItems.map((item, index) => {
              const content = (
                <>
                  <b>{item.title}</b>
                  <small>{item.body}</small>
                </>
              );
              return item.competitionId ? (
                <button
                  type="button"
                  key={(item.competitionId || item.title) + "-" + index}
                  onClick={() => onOpenCompetition && onOpenCompetition(item.competitionId)}
                >
                  {content}
                </button>
              ) : (
                <div key={(item.title || "radar") + "-" + index}>{content}</div>
              );
            }) : <div className="seasonCenterEmpty">لا توجد تنبيهات مهمة حاليًا.</div>}
          </div>
        </div>

      </section>
    </main>
  );
}
