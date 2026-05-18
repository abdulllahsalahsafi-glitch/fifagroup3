import React, { useState, useEffect, useRef } from "react";

export function MyProfilePage({
  config,
  member,
  currentMemberId = "",
  members = [],
  competitions = [],
  transferWindows = [],
  playerOffers = [],
  notifications = [],
  restrictions = [],
  players = [],
  financeRows = [],
  trophyGroups = [],
  stats = null,
  transferHistory = [],
  allPlayerOffers = [],
  allPlayers = [],
  playerContracts = [],
  freeAgentRegistrations = [],
  freePlayerStatus = [],
  freeAgentQueue = [],
  memberRestrictions = [],
  currentMemberRestrictions = [],
  pushStatus = getInitialPushStatus(),
  pushBusy = false,
  balance = 0,
  availableBalance = 0,
  trophiesCount = 0,
  proCount = 0,
  isFifaAdmin = false,
  onEnablePushNotifications,
  onDisablePushNotifications,
  onOpenNotification,
  onClearNotifications,
  onCreatePlayerOffer,
  onUpdatePlayerOffer,
  onCancelPlayerOffer,
  onAcceptOffer,
  onRejectOffer,
  onReleasePlayer,
  onTerminateLoan,
  onRegisterFreeAgentFee,
  isMarketOpen = false,
  onOpenCompetition,
  onGoPage,
  onOpenView,
  onInfo,
}) {
  const memberId = cleanId(currentMemberId);
  const memberName = member?.name || member?.memberName || "عضو FIFA GROUP";
  const memberImage = member?.avatar || member?.image || member?.photo || avatar(memberName);
  const teamLabel = member?.team || member?.club || member?.teamName || "";
  const nationalLabel = member?.nationalteam || member?.nationalTeam || member?.national || "";
  const teamLogo = member?.teamlogo || member?.teamLogo || member?.clubLogo || "";
  const nationalLogo = member?.nationallogo || member?.nationalLogo || member?.flag || "";
  const [profileTab, setProfileTab] = useState("players");
  const [profileSearch, setProfileSearch] = useState("");
  const [offerModal, setOfferModal] = useState(null);
  const [playerDetail, setPlayerDetail] = useState(null);
  const playerDetailReturnScrollRef = useRef(0);

  const activeCompetitions = (competitions || [])
    .filter((competition) => {
      const status = clean(competition.status || "active");
      return !["completed", "cancelled", "deleted", "archived"].includes(status);
    })
    .map((competition) => buildLinkedLeagueCupDisplayCompetition(competition, competitions || []));
  const allOpenMatches = activeCompetitions
    .flatMap((competition) => getSeasonCenterCompetitionMatches(competition))
    .filter(({ match }) => isSeasonCenterOpenMatch(match));
  const myMatches = memberId
    ? allOpenMatches.filter(({ match }) => same(match.homeMemberId, memberId) || same(match.awayMemberId, memberId)).slice(0, 5)
    : [];
  const activeOffers = (playerOffers || []).filter((offer) =>
    isSeasonCenterActiveOffer(offer) && memberId && (same(offer.fromMemberId, memberId) || same(offer.toMemberId, memberId))
  ).slice(0, 5);
  const latestNotifications = (notifications || []).slice(0, 4);
  const marketOpen = isTransferMarketOpen(transferWindows || []);
  const openWindow = (transferWindows || []).find((item) => clean(item.status || "") === "open") || null;
  const ratings = (players || []).map((player) => toNumber(player.rating)).filter((value) => value > 0);
  const avgRating = ratings.length ? Math.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length) : 0;
  const topPlayer = (players || []).slice().sort((a, b) => toNumber(b.rating) - toNumber(a.rating))[0] || null;
  const visibleFinanceRows = Array.isArray(financeRows) ? financeRows : [];
  const visibleTrophyGroups = Array.isArray(trophyGroups) ? trophyGroups : [];
  const memberStats = stats || emptyMemberStats(memberId);
  const q = clean(profileSearch);
  const filteredPlayers = (players || []).filter((player) => {
    if (!q) return true;
    const kindLabel = getPlayerRosterKindLabel(player, playerContracts, memberId);
    return clean([
      player.name,
      player.position,
      player.team,
      player.club,
      player.rating,
      kindLabel,
      kindLabel.replace("لاعب ", ""),
    ].join(" ")).includes(q);
  });

  useEffect(() => {
    if (!playerDetail) return undefined;
    function handlePlayerDetailBack(event) {
      event.stopImmediatePropagation?.();
      closePlayerDetail();
      try { window.history.replaceState({ fifaGroupRoot: true }, ""); } catch {}
    }
    window.addEventListener("popstate", handlePlayerDetailBack, true);
    return () => window.removeEventListener("popstate", handlePlayerDetailBack, true);
  }, [playerDetail]);

  function openPlayerDetail(player) {
    const appNode = document.querySelector(".app");
    playerDetailReturnScrollRef.current = appNode ? appNode.scrollTop : window.scrollY || 0;
    try { window.history.pushState({ fifaGroupPlayerDetail: true }, ""); } catch {}
    setPlayerDetail(player);
    requestAnimationFrame(() => {
      const nextAppNode = document.querySelector(".app");
      if (nextAppNode) nextAppNode.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function closePlayerDetail() {
    const returnTop = Math.max(0, Number(playerDetailReturnScrollRef.current) || 0);
    setPlayerDetail(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const appNode = document.querySelector(".app");
        if (appNode) {
          appNode.style.scrollBehavior = "auto";
          appNode.scrollTop = returnTop;
          requestAnimationFrame(() => {
            appNode.scrollTop = returnTop;
            appNode.style.scrollBehavior = "";
          });
        } else {
          window.scrollTo(0, returnTop);
        }
      });
    });
  }

  function openPlayerOffer(player, existingOffer = null, targetMember = null) {
    setOfferModal({ player, existingOffer, targetMember: targetMember || member });
  }

  async function handleCancelPlayerOffer(existingOffer) {
    if (!existingOffer?.id || !onCancelPlayerOffer) return;
    await onCancelPlayerOffer(existingOffer.id);
  }

  const positionCounts = (players || []).reduce((acc, player) => {
    const key = clean(player.position || "");
    const bucket = key.includes("GK") || key.includes("حارس") ? "gk" : key.includes("CB") || key.includes("LB") || key.includes("RB") || key.includes("DEF") || key.includes("دفاع") ? "def" : key.includes("CM") || key.includes("CDM") || key.includes("CAM") || key.includes("MID") || key.includes("وسط") ? "mid" : "att";
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, { gk: 0, def: 0, mid: 0, att: 0 });

  const summaryCards = [
    { label: "الرصيد", value: formatMoney(balance), tone: "green", tab: "finance" },
    { label: "البطولات", value: formatLatinNumber(trophiesCount || 0), tone: "violet", tab: "trophies" },
    { label: "اللاعبون", value: formatLatinNumber((players || []).length), tone: "green", tab: "players" },
    { label: "المحترفون", value: `${formatLatinNumber(proCount || 0)} / ${MAX_PRO_PLAYERS}`, tone: proCount >= MAX_PRO_PLAYERS ? "violet" : "muted", tab: "players" },
  ];
  const profileTasks = [
    { label: "مباريات قادمة", value: myMatches.length, hint: myMatches.length ? "افتح البطولة من القائمة أدناه" : "لا توجد مباريات مطلوبة الآن" },
    { label: "عروض نشطة", value: activeOffers.length, hint: activeOffers.length ? "تابع عروضك من تبويب العروض" : "لا توجد عروض نشطة تخصك" },
    { label: "إشعارات حديثة", value: latestNotifications.length, hint: latestNotifications.length ? "آخر التنبيهات الخاصة بك" : "لا توجد إشعارات جديدة" },
    { label: "حالة السوق", value: marketOpen ? "مفتوح" : "مغلق", hint: marketOpen ? "يمكن متابعة السوق والعروض" : "السوق مغلق حاليًا" },
  ];
  const profileRadarItems = getSeasonCenterRadarItems({
    activeCompetitions,
    allCompetitions: competitions || [],
    openMatches: allOpenMatches,
    myMatches,
    activeOfferRows: activeOffers,
    marketOpen,
    openWindow,
    isFifaAdmin: false,
    latestNotifications,
  });
  const handleDownloadMyProfile = () => downloadMyProfileSummaryImage({
    config,
    member,
    players,
    balance,
    availableBalance,
    trophiesCount,
    proCount,
    avgRating,
    topPlayer,
    trophyGroups: visibleTrophyGroups,
    contracts: playerContracts,
    memberId,
    upcomingMatchesCount: myMatches.length,
    activeOffersCount: activeOffers.length,
    notificationsCount: latestNotifications.length,
    marketOpen,
  });

  if (!memberId || !member) {
    return (
      <main className="widePage glass myProfilePage">
        <style>{myProfileCss}</style>
        <header className="pageHead">
          <h2>ملفي الشخصي</h2>
          <p>لم يتم ربط هذا الحساب بعضو نشط بعد.</p>
        </header>
        <div className="myProfileEmpty">لا توجد بيانات عضو مرتبطة بحسابك الحالي.</div>
      </main>
    );
  }

  if (playerDetail) {
    return (
      <main className="widePage glass myProfilePage">
        <style>{myProfileCss}</style>
        <PlayerDetailSubPage
          player={playerDetail}
          ownerMember={member}
          currentMemberId={currentMemberId}
          currentMember={member}
          playerOffers={playerOffers}
          playerContracts={playerContracts}
          freeAgentRegistrations={freeAgentRegistrations}
          freePlayerStatus={freePlayerStatus}
          freeAgentQueue={freeAgentQueue}
          memberRestrictions={memberRestrictions}
          ownerPlayerCount={(players || []).length}
          canMakeOffer={false}
          isMarketOpen={isMarketOpen}
          members={members}
          onBack={closePlayerDetail}
          onOffer={openPlayerOffer}
          onCancelOffer={handleCancelPlayerOffer}
          onAcceptOffer={onAcceptOffer}
          onRejectOffer={onRejectOffer}
          onReleasePlayer={onReleasePlayer}
          onTerminateLoan={onTerminateLoan}
          onRegisterFreeAgentFee={onRegisterFreeAgentFee}
        />
        {offerModal ? (
          <PlayerOfferModal
            targetMember={offerModal.targetMember || member}
            targetPlayer={offerModal.player}
            existingOffer={offerModal.existingOffer}
            currentMemberId={currentMemberId}
            currentAvailableBalance={availableBalance}
            currentMemberPlayers={players}
            onClose={() => setOfferModal(null)}
            onSubmit={offerModal.existingOffer ? onUpdatePlayerOffer : onCreatePlayerOffer}
          />
        ) : null}
      </main>
    );
  }

  return (
    <main className="widePage glass myProfilePage">
      <style>{myProfileCss}</style>
      <header className="pageHead">
        <h2>ملفي الشخصي</h2>
        <p>صفحتك الكاملة: القائمة، العروض، السجل المالي، البطولات، الصفقات والإشعارات في مكان واحد.</p>
      </header>

      <section className="myProfileHero glassSoft">
        <div className="myProfileHeroMain">
          <img src={memberImage} alt="" />
          <div>
            <small>{config.mainTitle || "FIFA GROUP"}</small>
            <h1>{memberName}</h1>
            <div className="myProfileChips">
              {teamLabel ? <span>{teamLabel}</span> : null}
              {nationalLabel ? <span>{nationalLabel}</span> : null}
            </div>
            {(teamLogo || nationalLogo) ? (
              <div className="myProfileLogos" aria-hidden="true">
                {teamLogo ? <img src={teamLogo} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
                {nationalLogo ? <img src={nationalLogo} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="myProfileHeroActions">
          <button type="button" className="myProfileExportBtn" onClick={handleDownloadMyProfile} title="تحميل صورة ملفي" aria-label="تحميل صورة ملفي">↓</button>
        </div>
      </section>

      <section className="myProfileSummary">
        {summaryCards.map((card) => (
          <button type="button" className={`myProfileStat ${card.tone}`} key={card.label} onClick={() => setProfileTab(card.tab)}>
            <b>{card.value}</b>
            <span>{card.label}</span>
          </button>
        ))}
      </section>

      <nav className="tabs myProfileTabs">
        <TabButton tab={profileTab} id="players" label="قائمتي" setTab={setProfileTab} />
        <TabButton tab={profileTab} id="matches" label={"مبارياتي" + (myMatches.length ? ` (${formatLatinNumber(myMatches.length)})` : "")} setTab={setProfileTab} />
        {isEnabled(config.showMemberTrophies) ? <TabButton tab={profileTab} id="trophies" label="بطولاتي" setTab={setProfileTab} /> : null}
        <TabButton tab={profileTab} id="memberStats" label="إحصائياتي" setTab={setProfileTab} />
        <TabButton tab={profileTab} id="deals" label="سجل الصفقات" setTab={setProfileTab} />
        <TabButton tab={profileTab} id="offers" label="عروض الانتقالات" setTab={setProfileTab} />
        {isEnabled(config.showFinance) ? <TabButton tab={profileTab} id="finance" label={config.financeTitle} setTab={setProfileTab} /> : null}
        <TabButton tab={profileTab} id="notifications" label={"الإشعارات" + (notifications.length ? ` (${formatLatinNumber(notifications.length)})` : "")} setTab={setProfileTab} />
      </nav>

      <section className="myProfilePrimaryContent">
        {profileTab === "players" ? (
          <PlayersSection
            config={config}
            rows={filteredPlayers}
            search={profileSearch}
            setSearch={setProfileSearch}
            playerCount={(players || []).length}
            showOfferButton={false}
            onOpenPlayerDetail={openPlayerDetail}
            playerContracts={playerContracts}
            selectedMemberId={memberId}
          />
        ) : null}
        {profileTab === "matches" ? (
          <ProfileMatchesSection
            title="مبارياتي"
            subtitle="المباريات غير المسجلة في البطولات النشطة."
            rows={myMatches}
            members={members}
            emptyText="لا توجد مباريات غير مسجلة حالياً."
            onOpenCompetition={onOpenCompetition}
          />
        ) : null}
        {profileTab === "trophies" && isEnabled(config.showMemberTrophies) ? (
          <MemberTrophiesSection rows={visibleTrophyGroups} member={member} onOpenView={onOpenView} />
        ) : null}
        {profileTab === "memberStats" ? (
          <MemberStatsSection config={config} stats={memberStats} member={member} members={members} onOpenView={onOpenView} onInfo={onInfo} />
        ) : null}
        {profileTab === "deals" ? (
          <MemberDealsSection
            member={member}
            members={members}
            transferHistory={transferHistory}
            playerOffers={allPlayerOffers}
            memberRestrictions={memberRestrictions}
            logoUrl={exportBrandLogoUrl(config)}
            onOpenPlayer={(player) => player && openPlayerDetail(player)}
          />
        ) : null}
        {profileTab === "offers" ? (
          <MemberOffersSection
            member={member}
            members={members}
            allPlayers={allPlayers || []}
            playerOffers={allPlayerOffers}
            currentMemberId={currentMemberId}
            isFifaAdmin={isFifaAdmin}
            logoUrl={exportBrandLogoUrl(config)}
            onOpenPlayer={(player) => player && openPlayerDetail(player)}
            onEditOffer={(offer, player, targetMember) => player && targetMember && openPlayerOffer(player, offer, targetMember)}
            onCancelOffer={handleCancelPlayerOffer}
            onAcceptOffer={onAcceptOffer}
            onRejectOffer={onRejectOffer}
          />
        ) : null}
        {profileTab === "finance" && isEnabled(config.showFinance) ? (
          <FinanceSection config={config} rows={visibleFinanceRows} member={member} members={members} />
        ) : null}
        {profileTab === "notifications" ? (
          <NotificationsPanel
            rows={notifications}
            members={members}
            currentMemberId={currentMemberId}
            pushStatus={pushStatus}
            pushBusy={pushBusy}
            onEnablePushNotifications={onEnablePushNotifications}
            onDisablePushNotifications={onDisablePushNotifications}
            onOpenNotification={onOpenNotification}
            onClearNotifications={onClearNotifications}
          />
        ) : null}
      </section>

      {offerModal ? (
        <PlayerOfferModal
          targetMember={offerModal.targetMember || member}
          targetPlayer={offerModal.player}
          existingOffer={offerModal.existingOffer}
          currentMemberId={currentMemberId}
          currentAvailableBalance={availableBalance}
          currentMemberPlayers={players}
          onClose={() => setOfferModal(null)}
          onSubmit={offerModal.existingOffer ? onUpdatePlayerOffer : onCreatePlayerOffer}
        />
      ) : null}

      <section className="myProfileTasks glassSoft">
        <div className="myProfileBoxHead"><h3>استحقاقاتي</h3><span>خاص</span></div>
        <div className="myProfileTaskGrid">
          {profileTasks.map((item) => (
            <div className="myProfileTask" key={item.label}>
              <b>{typeof item.value === "number" ? formatLatinNumber(item.value) : item.value}</b>
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="myProfileGrid">
        <div className="myProfileBox glassSoft myProfileWide">
          <div className="myProfileBoxHead"><h3>الرادار الذكي</h3><span>{formatLatinNumber(profileRadarItems.length)}</span></div>
          <div className="myProfileList">
            {profileRadarItems.length ? profileRadarItems.map((item, index) => {
              const content = (
                <>
                  <b>{item.title}</b>
                  <small>{item.body}</small>
                </>
              );
              return item.competitionId ? (
                <button type="button" className="myProfileMatch" key={(item.competitionId || item.title) + "-" + index} onClick={() => onOpenCompetition && onOpenCompetition(item.competitionId)}>
                  {content}
                </button>
              ) : (
                <div className="myProfileNotice" key={(item.title || "profile-radar") + "-" + index}>{content}</div>
              );
            }) : <div className="myProfileEmpty">لا توجد تنبيهات مهمة حاليًا.</div>}
          </div>
        </div>


        <div className="myProfileBox glassSoft myProfileWide">
          <div className="myProfileBoxHead"><h3>أدوات إضافية</h3><span>فتح</span></div>
          <div className="myProfileQuickLinks">
            <button type="button" onClick={() => onGoPage && onGoPage("transfers")}>سوق الانتقالات</button>
            <button type="button" onClick={() => onGoPage && onGoPage("studio")}>استوديو FIFA GROUP</button>
          </div>
        </div>

        {currentMemberRestrictions.length || restrictions.length || isFifaAdmin ? (
          <div className="myProfileBox glassSoft myProfileWide">
            <div className="myProfileBoxHead"><h3>الملاحظات الإدارية الخاصة</h3><span>{formatLatinNumber((currentMemberRestrictions.length || restrictions.length) || 0)}</span></div>
            <div className="myProfileList">
              {(currentMemberRestrictions.length ? currentMemberRestrictions : restrictions).length ? (currentMemberRestrictions.length ? currentMemberRestrictions : restrictions).map((row) => (
                <div className="myProfileNotice" key={row.id || row.endDate || row.reason}>
                  <b>{transferRestrictionShortText(row)}</b>
                  <small>{row.endDate ? `حتى ${row.endDate}` : "بدون تاريخ نهاية"}{row.reason ? ` · ${row.reason}` : ""}</small>
                </div>
              )) : <div className="myProfileEmpty">لا توجد قيود إدارية نشطة على حسابك.</div>}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
