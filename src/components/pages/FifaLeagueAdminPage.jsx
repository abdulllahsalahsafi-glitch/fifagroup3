import React, { useState, useEffect, useMemo } from "react";

export function FifaLeagueAdminPage({ members = [], seasons = [], activeSeasonId = "S6", competitions = [], trophyMap = {}, config = {}, onCreateLeague, onUpdateMatchResult, onClearMatchResult, onFinalizeLeague, onCancelCompetition, onApplyAbsenceAction, onUpdateCompetitionNote }) {
  const activeMembers = getActiveMembers(members);
  const competitionRows = (competitions || [])
    .filter((item) => ["league", "league_qualifier", "cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(item.type || "league")))
    .sort((a, b) => competitionTimeValue(b) - competitionTimeValue(a));
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(competitionRows[0]?.id || "");
  const selectedCompetition = competitionRows.find((item) => same(item.id, selectedCompetitionId)) || competitionRows[0] || null;
  const [competitionType, setCompetitionType] = useState("league");
  const [leagueName, setLeagueName] = useState("دوري الموسم");
  const [leagueSeasonId, setLeagueSeasonId] = useState(activeSeasonId || "S6");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [roundsMode, setRoundsMode] = useState("single");
  const [leagueFormat, setLeagueFormat] = useState("single_group");
  const leagueTwoGroupsEnabled = competitionType === "league" && leagueFormat === "two_groups";
  const [onlineMemberId, setOnlineMemberId] = useState("");
  const [fifaQuotaPerMember, setFifaQuotaPerMember] = useState("2");
  const [gameDistributionMode, setGameDistributionMode] = useState("auto");
  const [fifa2025MatchCount, setFifa2025MatchCount] = useState("2");
  const [qualifiersCount, setQualifiersCount] = useState("1");
  const [leagueQualifierEnabled, setLeagueQualifierEnabled] = useState(false);
  const [leagueQualifierParticipantIds, setLeagueQualifierParticipantIds] = useState([]);
  const [leagueQualifierQualifiedCount, setLeagueQualifierQualifiedCount] = useState("1");
  const [rewardFirst, setRewardFirst] = useState("20000000");
  const [rewardSecond, setRewardSecond] = useState("10000000");
  const [rewardThird, setRewardThird] = useState("5000000");
  const [rewardFourth, setRewardFourth] = useState("");
  const [autoPayRewards, setAutoPayRewards] = useState(false);
  const [participantIds, setParticipantIds] = useState([]);
  const [manualSeedMap, setManualSeedMap] = useState({});
  const [cupManualPairingsEnabled, setCupManualPairingsEnabled] = useState(false);
  const [cupLinkedLeagueCompetitionId, setCupLinkedLeagueCompetitionId] = useState("");
  const [cupPairings, setCupPairings] = useState([]);
  const [worldCupQualifiersEnabled, setWorldCupQualifiersEnabled] = useState(false);
  const [championsLeagueQualifiersEnabled, setChampionsLeagueQualifiersEnabled] = useState(false);
  const [resultInputs, setResultInputs] = useState({});
  const [relegatedIds, setRelegatedIds] = useState([]);
  const [absentIds, setAbsentIds] = useState([]);
  const [absenceMemberId, setAbsenceMemberId] = useState("");
  const [absenceMode, setAbsenceMode] = useState("exclude");
  const [absenceWinGoals, setAbsenceWinGoals] = useState("3");
  const [absenceLoseGoals, setAbsenceLoseGoals] = useState("0");
  const [absenceNote, setAbsenceNote] = useState("");
  const [competitionAdminNote, setCompetitionAdminNote] = useState("");
  const [cancelReason, setCancelReason] = useState("حذف إداري بسبب خطأ في إنشاء البطولة");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!participantIds.length && activeMembers.length) setParticipantIds(activeMembers.map((member) => cleanId(member.id)).filter(Boolean));
  }, [activeMembers.length]);
  useEffect(() => {
    setManualSeedMap((current) => {
      const next = { ...current };
      participantIds.forEach((id, index) => {
        const safeId = cleanId(id);
        if (safeId && !next[safeId]) next[safeId] = String(index + 1);
      });
      Object.keys(next).forEach((id) => {
        if (!participantIds.some((item) => same(item, id))) delete next[id];
      });
      return next;
    });
  }, [participantIds.join("|")]);

  const linkedLeagueCupOptions = competitionRows.filter((item) => isLeagueGroupsCompetition(item) && !["cancelled"].includes(clean(item.status || "active")));
  const selectedLinkedLeagueCup = linkedLeagueCupOptions.find((item) => same(item.id, cupLinkedLeagueCompetitionId)) || null;
  const linkedCupPreviewGroups = selectedLinkedLeagueCup ? championsLeagueGroupRows(selectedLinkedLeagueCup).slice(0, 2) : [];
  const linkedCupParticipantIds = selectedLinkedLeagueCup ? getLinkedLeagueCupParticipantRows(selectedLinkedLeagueCup).map((row) => cleanId(row.memberId)).filter(Boolean) : [];
  const cupLinkedLeagueGroupsEnabled = competitionType === "cup" && Boolean(cupLinkedLeagueCompetitionId);
  const cupBracketSize = competitionType === "cup" && !cupLinkedLeagueGroupsEnabled ? knockoutBracketSizeForCount(participantIds.length) : 0;
  const cupPairingCount = cupBracketSize ? cupBracketSize / 2 : 0;
  const cupPairingRows = Array.from({ length: cupPairingCount }, (_, index) => cupPairings[index] || { homeMemberId: "", awayMemberId: "" });
  const cupPairingUsedCount = new Set(cupPairingRows.flatMap((row) => [cleanId(row.homeMemberId), cleanId(row.awayMemberId)]).filter(Boolean)).size;
  const cupCreationMode = cupLinkedLeagueGroupsEnabled ? "linked_league_groups" : cupManualPairingsEnabled ? "manual" : "seeded";

  useEffect(() => {
    if (competitionType !== "cup") return;
    const allowedIds = new Set(participantIds.map(cleanId).filter(Boolean));
    setCupPairings((current) =>
      Array.from({ length: cupPairingCount }, (_, index) => {
        const row = current[index] || {};
        const homeMemberId = allowedIds.has(cleanId(row.homeMemberId)) ? cleanId(row.homeMemberId) : "";
        const awayMemberId = allowedIds.has(cleanId(row.awayMemberId)) ? cleanId(row.awayMemberId) : "";
        return { homeMemberId, awayMemberId };
      })
    );
  }, [competitionType, cupPairingCount, participantIds.join("|")]);
  useEffect(() => {
    if (!selectedCompetitionId && competitionRows[0]?.id) setSelectedCompetitionId(competitionRows[0].id);
  }, [competitionRows.length, selectedCompetitionId]);
  useEffect(() => {
    if (selectedCompetition) {
      setRelegatedIds(Array.isArray(selectedCompetition.relegatedMemberIds) ? selectedCompetition.relegatedMemberIds : []);
      setAbsentIds(Array.isArray(selectedCompetition.absentMemberIds) ? selectedCompetition.absentMemberIds : []);
      setAbsenceMemberId("");
      setAbsenceMode("exclude");
      setAbsenceWinGoals("3");
      setAbsenceLoseGoals("0");
      setAbsenceNote("");
      setCompetitionAdminNote(String(selectedCompetition.adminNote || ""));
    }
  }, [selectedCompetition?.id]);

  const selectedTypeKey = competitionTypeKey(selectedCompetition?.type || "league");
  const selectedLeagueGroupsMode = selectedCompetition ? isLeagueGroupsCompetition(selectedCompetition) : false;
  const selectedIsLeague = selectedTypeKey === "league" && !selectedLeagueGroupsMode;
  const selectedIsAnyLeague = selectedTypeKey === "league";
  const selectedMatches = Array.isArray(selectedCompetition?.matches) ? selectedCompetition.matches : [];
  const embeddedLeagueQualifierMatches = selectedTypeKey === "league" && !selectedLeagueGroupsMode && selectedCompetition?.leagueQualifier?.enabled ? (selectedCompetition.leagueQualifier.matches || []).map((match) => ({ ...match, scope: "league_qualifier" })) : [];
  const selectedStandings = useMemo(() => {
    if (!selectedCompetition || !selectedIsLeague) return [];
    return computeLeagueStandings(filterCompetitionParticipantsForCalculation(selectedCompetition), filterCompetitionMatchesForCalculation(selectedCompetition));
  }, [selectedCompetition, selectedIsLeague]);
  const selectedRelegationRows = selectedIsLeague ? selectedStandings : selectedIsAnyLeague ? (selectedCompetition?.participants || []) : [];
  const groupedMatches = groupLeagueMatchesByRound([...embeddedLeagueQualifierMatches, ...selectedMatches]);
  const completedCount = selectedMatches.filter((match) => clean(match.resultStatus || match.status) === "completed").length;
  const qualifiedIds = !selectedIsLeague && selectedCompetition ? (selectedTypeKey === "league_qualifier" ? computeLeagueQualifierQualifiedIds(selectedCompetition) : computeKnockoutQualifiedIds(selectedCompetition)) : [];
  const absenceInfo = selectedCompetition && absenceMemberId ? competitionAbsenceInfoForMember(selectedCompetition, absenceMemberId) : { played: 0, remaining: 0, affected: 0 };

  function toggleParticipant(id) {
    const safeId = cleanId(id);
    setParticipantIds((current) => current.some((item) => same(item, safeId)) ? current.filter((item) => !same(item, safeId)) : [...current, safeId]);
  }
  function toggleLeagueQualifierParticipant(id) {
    const safeId = cleanId(id);
    setLeagueQualifierParticipantIds((current) => current.some((item) => same(item, safeId)) ? current.filter((item) => !same(item, safeId)) : [...current, safeId]);
  }
  function updateManualSeed(memberId, seed) {
    const safeId = cleanId(memberId);
    setManualSeedMap((current) => ({ ...current, [safeId]: String(seed || "") }));
  }
  function updateCupPairing(index, side, value) {
    const safeValue = cleanId(value || "");
    setCupPairings((current) => {
      const next = Array.from({ length: cupPairingCount }, (_, rowIndex) => ({ ...(current[rowIndex] || { homeMemberId: "", awayMemberId: "" }) }));
      next[index] = { ...(next[index] || { homeMemberId: "", awayMemberId: "" }), [side]: safeValue };
      return next;
    });
  }
  function toggleRelegated(id) {
    const safeId = cleanId(id);
    setRelegatedIds((current) => current.some((item) => same(item, safeId)) ? current.filter((item) => !same(item, safeId)) : [...current, safeId]);
  }
  function toggleAbsent(id) {
    const safeId = cleanId(id);
    setAbsentIds((current) => current.some((item) => same(item, safeId)) ? current.filter((item) => !same(item, safeId)) : [...current, safeId]);
  }

  async function submitCreateCompetition(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await onCreateLeague?.({
        competitionType,
        name: leagueName,
        seasonId: leagueSeasonId,
        startDate,
        endDate,
        roundsMode,
        leagueFormat,
        onlineMemberId,
        fifaQuotaPerMember,
        maxFifaPerRound: fifaQuotaPerMember,
        gameDistributionMode,
        fifa2025MatchCount,
        qualifiersCount,
        worldCupQualifiersEnabled,
        championsLeagueQualifiersEnabled,
        leagueQualifierEnabled,
        leagueQualifierParticipantIds,
        leagueQualifierQualifiedCount,
        participantIds: cupLinkedLeagueGroupsEnabled ? linkedCupParticipantIds : participantIds,
        manualSeeds: manualSeedMap,
        cupManualPairingsEnabled: cupManualPairingsEnabled && !cupLinkedLeagueGroupsEnabled,
        cupPairings: cupManualPairingsEnabled && !cupLinkedLeagueGroupsEnabled ? cupPairingRows : [],
        cupLinkedLeagueCompetitionId,
        rewards: { first: rewardFirst, second: rewardSecond, third: rewardThird, fourth: rewardFourth },
        autoPayRewards,
      });
      setMessage(competitionType === "league_qualifier" ? "تم إنشاء ملحق الدوري بنجاح." : competitionType === "cup" && cupLinkedLeagueGroupsEnabled ? "تم إنشاء بطولة الكأس وربطها بدوري المجموعتين. سيتم تعبئة المسارات تلقائيًا عند اكتمال كل مجموعة." : competitionType === "cup" ? "تم إنشاء بطولة الكأس وبناء الأدوار الإقصائية." : competitionType === "super_cup" ? "تم إنشاء كأس السوبر كمباراة نهائية واحدة." : competitionType === "world_cup" ? "تم إنشاء كأس العالم بنظام 3 مجموعات ثم الأدوار الإقصائية." : competitionType === "champions_league" ? "تم إنشاء دوري الأبطال بنظام مجموعتين ثم الأدوار الإقصائية." : leagueTwoGroupsEnabled ? "تم إنشاء الدوري بنظام مجموعتين ثم الأدوار الإقصائية." : leagueQualifierEnabled ? "تم إنشاء الدوري مع ملحق مؤهل مرتبط بنفس النسخة." : "تم إنشاء الدوري وجدولة المباريات بنجاح.");
    } catch (err) { setMessage(err?.message || "تعذر إنشاء البطولة."); }
    finally { setBusy(false); }
  }

  async function submitMatchResult(match) {
    if (!selectedCompetition || busy) return;
    const values = resultInputs[match.id] || {};
    const homeGoals = values.homeGoals ?? (clean(match.resultStatus || match.status) === "completed" ? match.homeGoals : "");
    const awayGoals = values.awayGoals ?? (clean(match.resultStatus || match.status) === "completed" ? match.awayGoals : "");
    const homePens = values.homePens ?? (clean(match.resultStatus || match.status) === "completed" ? match.homePens : "");
    const awayPens = values.awayPens ?? (clean(match.resultStatus || match.status) === "completed" ? match.awayPens : "");
    setBusy(true); setMessage("");
    try {
      await onUpdateMatchResult?.({ competitionId: selectedCompetition.id, matchId: match.id, homeGoals, awayGoals, homePens, awayPens, gameTitle: values.gameTitle ?? match.gameTitle });
      setMessage("تم حفظ النتيجة وتحديث البيانات.");
    } catch (err) { setMessage(err?.message || "تعذر حفظ النتيجة."); }
    finally { setBusy(false); }
  }

  async function submitClearMatchResult(match) {
    if (!selectedCompetition || busy) return;
    if (typeof window !== "undefined" && !window.confirm("حذف نتيجة هذه المباراة وإعادتها إلى انتظار النتيجة؟")) return;
    setBusy(true); setMessage("");
    try {
      await onClearMatchResult?.({ competitionId: selectedCompetition.id, matchId: match.id });
      setResultInputs((current) => ({ ...current, [match.id]: { ...(current[match.id] || {}), homeGoals: "", awayGoals: "", homePens: "", awayPens: "" } }));
      setMessage("تم حذف النتيجة وتحديث الترتيب.");
    } catch (err) { setMessage(err?.message || "تعذر حذف النتيجة."); }
    finally { setBusy(false); }
  }


  async function submitAbsenceAction() {
    if (!selectedCompetition || busy) return;
    if (!absenceMemberId) { setMessage("اختر العضو الغائب أولًا."); return; }
    const modeLabel = absenceMode === "forfeit_loss" ? "تسجيل خسارة إدارية للمباريات المتبقية" : "استبعاد العضو من البطولة";
    if (typeof window !== "undefined" && !window.confirm("تأكيد إجراء الغياب: " + modeLabel + "؟")) return;
    setBusy(true); setMessage("");
    try {
      await onApplyAbsenceAction?.({
        competitionId: selectedCompetition.id,
        memberId: absenceMemberId,
        mode: absenceMode,
        forfeitWinGoals: absenceWinGoals,
        forfeitLoseGoals: absenceLoseGoals,
        note: absenceNote,
      });
      setMessage(absenceMode === "forfeit_loss" ? "تم تسجيل الخسارة الإدارية للمباريات المتبقية وتحديث البطولة." : "تم استبعاد العضو من البطولة وتحديث الجداول.");
      setAbsenceMemberId("");
      setAbsenceNote("");
    } catch (err) { setMessage(err?.message || "تعذر تطبيق إجراء الغياب."); }
    finally { setBusy(false); }
  }

  async function submitFinalizeCompetition() {
    if (!selectedCompetition || busy) return;
    setBusy(true); setMessage("");
    try {
      await onFinalizeLeague?.({ competitionId: selectedCompetition.id, relegatedMemberIds: relegatedIds, absentMemberIds: absentIds });
      setMessage(clean(selectedCompetition.status) === "completed" && ["cup", "super_cup"].includes(selectedTypeKey) ? "تم إعادة اعتماد البطولة وتصحيح المكافآت حسب النتائج الحالية." : "تم اعتماد البطولة وأرشفتها داخل البطولات التنافسية.");
    } catch (err) { setMessage(err?.message || "تعذر اعتماد البطولة."); }
    finally { setBusy(false); }
  }

  async function submitCompetitionAdminNote() {
    if (!selectedCompetition || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await onUpdateCompetitionNote?.({ competitionId: selectedCompetition.id, note: competitionAdminNote });
      setMessage("تم حفظ ملاحظة البطولة بنجاح.");
    } catch (err) {
      setMessage(err?.message || "تعذر حفظ ملاحظة البطولة.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCancelCompetition() {
    if (!selectedCompetition || busy) return;
    setBusy(true); setMessage("");
    try {
      await onCancelCompetition?.({ competitionId: selectedCompetition.id, reason: cancelReason });
      setMessage("تم حذف البطولة نهائيًا مع حفظ أثر القرار في سجل FIFA.");
    } catch (err) { setMessage(err?.message || "تعذر حذف البطولة."); }
    finally { setBusy(false); }
  }

  return (
    <main className="pageShell fifaAdminShell leagueAdminShell">
      <section className="sectionBox glassSoft fifaAdminHero">
        <div><span className="heroKicker">FIFA ADMIN</span><h2>إدارة البطولات التنافسية</h2></div><strong>🏟️</strong>
      </section>
      {message ? <div className="adminMessage glassSoft">{message}</div> : null}

      <section className="adminGrid">
        <form className="sectionBox glassSoft adminForm" onSubmit={submitCreateCompetition}>
          <div className="sectionHead compact"><div><h3>إنشاء بطولة</h3></div></div>
          <label className="moneyField"><span>نوع البطولة</span><select value={competitionType} onChange={(event) => setCompetitionType(event.target.value)}><option value="league">دوري</option><option value="cup">الكأس</option><option value="super_cup">كأس السوبر</option><option value="world_cup">كأس العالم</option><option value="champions_league">دوري الأبطال</option></select></label>
          <label className="moneyField"><span>اسم البطولة</span><input value={leagueName} onChange={(event) => setLeagueName(event.target.value)} placeholder={competitionType === "league_qualifier" ? "مثال: ملحق الدوري" : competitionType === "cup" ? "مثال: كأس الموسم السادس" : competitionType === "super_cup" ? "مثال: كأس السوبر" : competitionType === "world_cup" ? "مثال: كأس العالم" : competitionType === "champions_league" ? "مثال: دوري الأبطال" : "مثال: دوري الموسم السادس"} /></label>
          <label className="moneyField"><span>الموسم</span><select value={leagueSeasonId} onChange={(event) => setLeagueSeasonId(event.target.value)}>{(seasons || []).length ? seasons.map((season) => <option key={season.id || season.seasonId || season.name} value={season.id || season.seasonId || activeSeasonId}>{season.name || season.title || season.id || activeSeasonId}</option>) : <option value={activeSeasonId}>{activeSeasonId}</option>}</select></label>
          {competitionType !== "league" ? <><label className="moneyField"><span>نظام اللعبة للمباريات</span><select value={gameDistributionMode} onChange={(event) => setGameDistributionMode(event.target.value)}><option value="auto">توزيع تلقائي حسب عضو الأونلاين</option><option value="fifa2025_only">كل المباريات FIFA 2025</option><option value="pes2017_only">كل المباريات PES 2017</option><option value="mixed_manual">مكس يدوي بين FIFA 2025 و PES 2017</option></select></label>{gameDistributionMode === "auto" ? <><label className="moneyField"><span>عضو الأونلاين / FIFA 2025</span><select value={onlineMemberId} onChange={(event) => setOnlineMemberId(event.target.value)}><option value="">تلقائي حسب عبد الله</option>{activeMembers.map((member) => <option key={member.id} value={member.id}>{member.name || member.id}</option>)}</select></label><label className="moneyField"><span>عدد مباريات FIFA 2025 في كل جولة</span><input inputMode="numeric" value={fifaQuotaPerMember} onChange={(event) => setFifaQuotaPerMember(event.target.value)} placeholder="2" /></label></> : null}{gameDistributionMode === "mixed_manual" ? <label className="moneyField"><span>عدد مباريات FIFA 2025 في البطولة</span><input inputMode="numeric" value={fifa2025MatchCount} onChange={(event) => setFifa2025MatchCount(event.target.value)} placeholder="مثال: 4" /></label> : null}<div className="leagueRuleNote">{gameDistributionMode === "fifa2025_only" ? "سيتم إنشاء كل المباريات على FIFA 2025." : gameDistributionMode === "pes2017_only" ? "سيتم إنشاء كل المباريات على PES 2017." : gameDistributionMode === "mixed_manual" ? "سيتم توزيع عدد مباريات FIFA 2025 الذي تحدده، والباقي PES 2017." : "توزيع اللعبة تلقائي حسب عضو الأونلاين ثم التوزيع العادل."}</div></> : null}
          <div className="leagueRewardGrid"><label className="moneyField"><span>تاريخ البداية</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="moneyField"><span>تاريخ النهاية</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
          {competitionType === "league" ? <>
            <div className="leagueRuleNote">الدوري يعمل بنظامك المستقر. يمكن إضافة ملحق مؤهل داخل نفس نسخة الدوري، وليس كبطولة مستقلة.</div>
            <label className="moneyField"><span>شكل الدوري</span><select value={leagueFormat} onChange={(event) => { setLeagueFormat(event.target.value); if (event.target.value === "two_groups") { setRoundsMode("single"); setLeagueQualifierEnabled(false); } }}><option value="single_group">مجموعة واحدة</option><option value="two_groups">مجموعتان + أدوار إقصائية</option></select></label>
            {!leagueTwoGroupsEnabled ? <label className="moneyField"><span>نظام الدوري</span><select value={roundsMode} onChange={(event) => setRoundsMode(event.target.value)}><option value="single">ذهاب فقط</option><option value="double">ذهاب وإياب</option></select></label> : <div className="leagueRuleNote">في نظام المجموعتين، التصنيف يصبح مستويات ويمكن تكراره، ويتم توزيع أعضاء كل مستوى على المجموعتين بالقرعة قدر الإمكان.</div>}
            <label className="moneyField"><span>نظام اللعبة للمباريات</span><select value={gameDistributionMode} onChange={(event) => setGameDistributionMode(event.target.value)}><option value="auto">توزيع تلقائي حسب عضو الأونلاين</option><option value="fifa2025_only">كل المباريات FIFA 2025</option><option value="pes2017_only">كل المباريات PES 2017</option><option value="mixed_manual">مكس يدوي بين FIFA 2025 و PES 2017</option></select></label>
            {gameDistributionMode === "auto" ? <><label className="moneyField"><span>عضو الأونلاين / FIFA 2025</span><select value={onlineMemberId} onChange={(event) => setOnlineMemberId(event.target.value)}><option value="">تلقائي حسب عبد الله</option>{activeMembers.map((member) => <option key={member.id} value={member.id}>{member.name || member.id}</option>)}</select></label><label className="moneyField"><span>عدد مباريات FIFA 2025 في كل جولة</span><input inputMode="numeric" value={fifaQuotaPerMember} onChange={(event) => setFifaQuotaPerMember(event.target.value)} placeholder="2" /></label></> : null}
            {gameDistributionMode === "mixed_manual" ? <label className="moneyField"><span>عدد مباريات FIFA 2025 في البطولة</span><input inputMode="numeric" value={fifa2025MatchCount} onChange={(event) => setFifa2025MatchCount(event.target.value)} placeholder="مثال: 4" /></label> : null}
            {competitionType === "league" && !leagueTwoGroupsEnabled ? <><label className="adminCheckLine"><input type="checkbox" checked={leagueQualifierEnabled} onChange={(event) => setLeagueQualifierEnabled(event.target.checked)} /><span>إضافة ملحق مؤهل مرتبط بنفس نسخة الدوري</span></label>
            {leagueQualifierEnabled ? <div className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>ملحق الدوري داخل نفس النسخة</h3><p>المشاركون المختارون في قائمة البطولة هم المشاركون المباشرون في الدوري. اختر هنا أعضاء الملحق فقط، وحدد عدد المتأهلين منهم إلى نفس نسخة الدوري.</p></div></div><label className="moneyField"><span>عدد المتأهلين من الملحق</span><select value={leagueQualifierQualifiedCount} onChange={(event) => setLeagueQualifierQualifiedCount(event.target.value)}><option value="1">متأهل واحد</option><option value="2">متأهلان</option><option value="3">3 متأهلين</option><option value="4">4 متأهلين</option></select></label><div className="leagueMembersGrid compact">{activeMembers.map((member) => <label key={`lq-${member.id}`} className={leagueQualifierParticipantIds.some((id) => same(id, member.id)) ? "leagueMemberPick active" : "leagueMemberPick"}><input type="checkbox" checked={leagueQualifierParticipantIds.some((id) => same(id, member.id))} onChange={() => toggleLeagueQualifierParticipant(member.id)} /><span>{member.name}</span></label>)}</div><div className="leagueRuleNote">لا يظهر الملحق كبطولة مستقلة، ولا يوجد بطل للملحق. الإشعار يكون للمتأهل/المتأهلين فقط.</div></div> : null}</> : null}
          </> : competitionType === "league_qualifier" ? <label className="moneyField"><span>عدد المتأهلين من الملحق</span><select value={qualifiersCount} onChange={(event) => setQualifiersCount(event.target.value)}><option value="1">متأهل واحد</option><option value="2">متأهلان</option></select></label> : competitionType === "super_cup" ? <div className="leagueRuleNote">كأس السوبر مباراة نهائية واحدة فقط. اختر عضوين يدويًا، والمكافآت للبطل والوصيف فقط.</div> : competitionType === "world_cup" ? <><div className="leagueRuleNote">كأس العالم الأساسي: حتى 9 أعضاء في 3 مجموعات. إذا زاد العدد عن 9 فعّل التصفيات داخل نفس النسخة، والتصفيات تكون إقصائية عشوائية لتأهيل 9 أعضاء لدور المجموعات.</div><label className="adminCheckLine"><input type="checkbox" checked={worldCupQualifiersEnabled} onChange={(event) => setWorldCupQualifiersEnabled(event.target.checked)} /><span>تشغيل تصفيات كأس العالم عند اختيار أكثر من 9 أعضاء</span></label></> : competitionType === "champions_league" ? <><div className="leagueRuleNote">دوري الأبطال: حتى 8 أعضاء في مجموعتين، ويتأهل الأول والثاني من كل مجموعة إلى نصف النهائي. إذا زاد العدد عن 8 فعّل الملحق داخل نفس النسخة.</div><label className="adminCheckLine"><input type="checkbox" checked={championsLeagueQualifiersEnabled} onChange={(event) => setChampionsLeagueQualifiersEnabled(event.target.checked)} /><span>تشغيل ملحق دوري الأبطال عند اختيار أكثر من 8 أعضاء</span></label></> : <div className="leagueRuleNote">الكأس بطولة إقصائية كاملة. يمكنك استخدام التصنيف اليدوي، أو تفعيل اختيار المواجهات يدويًا لتحديد من يلعب ضد من.</div>}
          {competitionType === "cup" ? <div className="cupManualMatchupsBox glassSoft">
            <label className="moneyField"><span>طريقة تنظيم الكأس</span><select value={cupCreationMode} onChange={(event) => { const mode = event.target.value; if (mode === "manual") { setCupManualPairingsEnabled(true); setCupLinkedLeagueCompetitionId(""); } else if (mode === "linked_league_groups") { setCupManualPairingsEnabled(false); setCupLinkedLeagueCompetitionId(cupLinkedLeagueCompetitionId || linkedLeagueCupOptions[0]?.id || ""); } else { setCupManualPairingsEnabled(false); setCupLinkedLeagueCompetitionId(""); } }}><option value="seeded">تصنيف الكأس اليدوي</option><option value="manual">اختيار المواجهات يدويًا</option><option value="linked_league_groups">مرتبط بدوري مجموعتين</option></select></label>
            {cupCreationMode === "linked_league_groups" ? <><div className="leagueRuleNote">يرتبط الكأس بنسخة دوري بنظام مجموعتين. كل مجموعة تولّد مسارها حسب ترتيبها: 4 أعضاء = الأول ضد الرابع والثاني ضد الثالث، 3 أعضاء = الأول BYE والثاني ضد الثالث، 2 أعضاء = كلاهما BYE ثم مواجهة حسم المسار.</div><label className="moneyField"><span>الدوري المرتبط بالكأس</span><select value={cupLinkedLeagueCompetitionId} onChange={(event) => setCupLinkedLeagueCompetitionId(event.target.value)}><option value="">اختر دوري مجموعتين</option>{linkedLeagueCupOptions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name || "دوري مجموعتين"}</option>)}</select></label>{!linkedLeagueCupOptions.length ? <div className="leagueRuleNote error">لا توجد نسخة دوري بنظام مجموعتين حاليًا. أنشئ دوري مجموعتين أولًا ثم اربط الكأس به.</div> : null}{selectedLinkedLeagueCup ? <div className="linkedCupPreviewBox"><h4 className="dealSectionTitle">معاينة ربط الكأس</h4>{linkedCupPreviewGroups.map((group, index) => { const groupNumber = linkedCupGroupNumber(group.groupKey, index); const ready = linkedCupGroupIsReady(group); const count = (group.participants || []).length; return <div className="linkedCupGroupPreview" key={`linked-cup-group-${group.groupKey || index}`}><b>المجموعة {groupNumber}</b><small>{ready ? "نتائج المجموعة مكتملة - يمكن تعبئة مسار الكأس" : "بانتظار اكتمال نتائج المجموعة"}</small><p>{count >= 4 ? "الأول ضد الرابع، والثاني ضد الثالث، ثم حسم المسار." : count === 3 ? "الأول يتأهل مباشرة، والثاني ضد الثالث، ثم الفائز يواجه الأول." : count === 2 ? "الأول والثاني يتأهلان مباشرة من الدور الأول، ثم يتواجهان في حسم المسار." : count === 1 ? "المتواجد الوحيد يتأهل مباشرة كفائز مسار المجموعة." : "لا يوجد أعضاء في هذه المجموعة."}</p></div>; })}</div> : null}</> : null}
            {cupCreationMode === "manual" ? <><div className="leagueRuleNote">اختر طرفي كل مباراة من اليمين إلى اليسار. يجب توزيع كل مشارك مرة واحدة فقط. إذا كان عدد المشاركين أقل من حجم القوس، اترك طرفًا واحدًا فارغًا للتأهل المباشر، ولا تترك مباراة كاملة فارغة.</div><div className="cupPairingGrid">{cupPairingRows.map((row, index) => { const homeId = cleanId(row.homeMemberId); const awayId = cleanId(row.awayMemberId); const blockedIds = new Set(cupPairingRows.flatMap((item, rowIndex) => rowIndex === index ? [] : [cleanId(item.homeMemberId), cleanId(item.awayMemberId)]).filter(Boolean)); return <div className="cupPairingRow" key={`cup-pair-${index}`}><strong>مباراة {index + 1}</strong><label className="moneyField"><span>الطرف الأول</span><select value={homeId} onChange={(event) => updateCupPairing(index, "homeMemberId", event.target.value)}><option value="">تأهل مباشر / فارغ</option>{activeMembers.filter((member) => participantIds.some((id) => same(id, member.id))).map((member) => <option key={`cup-home-${index}-${member.id}`} value={member.id} disabled={blockedIds.has(cleanId(member.id)) || same(member.id, awayId)}>{member.name || member.id}</option>)}</select></label><label className="moneyField"><span>الطرف الثاني</span><select value={awayId} onChange={(event) => updateCupPairing(index, "awayMemberId", event.target.value)}><option value="">تأهل مباشر / فارغ</option>{activeMembers.filter((member) => participantIds.some((id) => same(id, member.id))).map((member) => <option key={`cup-away-${index}-${member.id}`} value={member.id} disabled={blockedIds.has(cleanId(member.id)) || same(member.id, homeId)}>{member.name || member.id}</option>)}</select></label></div>; })}</div><div className="leagueRuleNote">تم توزيع {cupPairingUsedCount} من {participantIds.length} مشاركين.</div></> : null}
          </div> : null}
          <div className="leagueRewardGrid">
            <label className="moneyField"><span>مكافأة البطل</span><input inputMode="numeric" value={rewardFirst} onChange={(event) => setRewardFirst(event.target.value)} /></label>
            <label className="moneyField"><span>مكافأة الوصيف</span><input inputMode="numeric" value={rewardSecond} onChange={(event) => setRewardSecond(event.target.value)} /></label>
            {competitionType !== "super_cup" ? <label className="moneyField"><span>مكافأة الثالث</span><input inputMode="numeric" value={rewardThird} onChange={(event) => setRewardThird(event.target.value)} /></label> : null}
            {competitionType !== "super_cup" ? <label className="moneyField"><span>مكافأة الرابع</span><input inputMode="numeric" value={rewardFourth} onChange={(event) => setRewardFourth(event.target.value)} /></label> : null}
          </div>
          {["league", "cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) ? <label className="adminCheckLine"><input type="checkbox" checked={autoPayRewards} onChange={(event) => setAutoPayRewards(event.target.checked)} /><span>{competitionType === "super_cup" ? "صرف مكافآت كأس السوبر تلقائيًا للبطل والوصيف عند الاعتماد" : competitionType === "world_cup" ? "صرف مكافآت كأس العالم تلقائيًا عند اعتماد النتائج" : competitionType === "champions_league" ? "صرف مكافآت دوري الأبطال تلقائيًا عند اعتماد النتائج" : competitionType === "cup" ? "صرف مكافآت الكأس تلقائيًا عند اعتماد النتائج" : "صرف المكافآت تلقائيًا عند اعتماد الدوري"}</span></label> : null}
          {competitionType === "league" ? <div className="leagueRuleNote">{gameDistributionMode === "fifa2025_only" ? "سيتم إنشاء كل مباريات الدوري على FIFA 2025." : gameDistributionMode === "pes2017_only" ? "سيتم إنشاء كل مباريات الدوري على PES 2017." : gameDistributionMode === "mixed_manual" ? "سيتم توزيع عدد مباريات FIFA 2025 الذي تحدده، والباقي PES 2017." : "توزيع اللعبة تلقائي: مباريات عضو الأونلاين على FIFA 2025، والباقي حسب التوزيع العادل."}</div> : null}
          {competitionType === "cup" && cupLinkedLeagueGroupsEnabled ? <div className="leagueRuleNote">المشاركون في هذا الكأس سيتم أخذهم تلقائيًا من الدوري المرتبط: {selectedLinkedLeagueCup?.name || "-"}. عدد المشاركين الحالي: {linkedCupParticipantIds.length}.</div> : <div className="leagueMembersGrid">{activeMembers.map((member) => <label key={member.id} className={participantIds.some((id) => same(id, member.id)) ? "leagueMemberPick active" : "leagueMemberPick"}><input type="checkbox" checked={participantIds.some((id) => same(id, member.id))} onChange={() => toggleParticipant(member.id)} /><img src={member.avatar || avatar(member.name)} alt="" /><span>{member.name || member.id}</span></label>)}</div>}
          {["league", "cup", "world_cup", "champions_league"].includes(competitionType) && !(competitionType === "cup" && (cupManualPairingsEnabled || cupLinkedLeagueGroupsEnabled)) ? <div className="leagueSeedGrid"><h4 className="dealSectionTitle">{competitionType === "league" ? "تصنيف الدوري اليدوي" : competitionType === "world_cup" ? "تصنيف كأس العالم اليدوي" : competitionType === "champions_league" ? "تصنيف دوري الأبطال اليدوي" : "تصنيف الكأس اليدوي"}</h4>{participantIds.map((memberId, index) => { const member = activeMembers.find((item) => same(item.id, memberId)); const maxSeed = competitionType === "cup" ? 8 : Math.max(1, participantIds.length); return <label key={memberId} className="moneyField"><span>{member?.name || memberId}</span><select value={manualSeedMap[cleanId(memberId)] || String(index + 1)} onChange={(event) => updateManualSeed(memberId, event.target.value)}>{Array.from({ length: maxSeed }, (_, i) => i + 1).map((seed) => <option key={seed} value={seed}>تصنيف {seed}</option>)}</select></label>; })}</div> : null}
          <button className="moneySubmitBtn" type="submit" disabled={busy}>{busy ? "جارٍ التنفيذ..." : "إنشاء البطولة"}</button>
        </form>

        <section className="sectionBox glassSoft adminRecentBox">
          <div className="sectionHead compact"><div><h3>البطولات المحفوظة</h3><p>{competitionRows.length ? `${competitionRows.length} بطولة` : "لا توجد بطولات بعد"}</p></div></div>
          <div className="competitionInstanceList adminCompetitionInstanceList">{competitionRows.length ? competitionRows.map((competition) => <button type="button" key={competition.id} className={same(selectedCompetition?.id, competition.id) ? "competitionInstanceCard active" : "competitionInstanceCard"} onClick={() => setSelectedCompetitionId(competition.id)}><CompetitionIcon competition={competition} config={config} trophyMap={trophyMap} className="competitionInstanceIcon" /><div><b>{competition.name || competitionTypeLabel(competition.type)}</b><small>{competitionTypeLabel(competition.type)} • {competitionStatusLabel(competition.status)}</small></div></button>) : <div className="empty">أنشئ أول بطولة من النموذج.</div>}</div>
        </section>
      </section>

      {selectedCompetition ? <>
        <section className="sectionBox glassSoft">
          <div className="sectionHead compact competitionDetailHead"><CompetitionIcon competition={selectedCompetition} config={config} trophyMap={trophyMap} className="competitionDetailIcon" /><div><h3>{selectedCompetition.name}</h3><p>{competitionTypeLabel(selectedCompetition.type)} • {competitionStatusLabel(selectedCompetition.status)} {selectedCompetition.startDate ? `• ${selectedCompetition.startDate}` : ""}{selectedCompetition.endDate ? ` → ${selectedCompetition.endDate}` : ""}</p></div></div>
          <div className="leagueSummaryStrip compactSummaryStrip">
            <div className="leagueSummaryMetric"><span>المشاركون</span><b>{(selectedCompetition.participants || []).length}</b></div>
            <div className="leagueSummaryMetric"><span>المباريات</span><b>{selectedMatches.length}</b></div>
            <div className="leagueSummaryMetric"><span>المكتملة</span><b>{completedCount}</b></div>
            <div className="leagueSummaryMetric"><span>{selectedIsLeague || ["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) ? "البطل" : "المتأهلون"}</span><b>{selectedIsLeague ? getApprovedCompetitionChampionName(selectedCompetition, selectedStandings[0]?.memberName || "") : ["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) ? getApprovedCompetitionChampionName(selectedCompetition, getKnockoutChampion(selectedCompetition)?.memberName || "") : (qualifiedIds.length || "-")}</b></div>
          </div>
          <div className="imageActionRow"><button type="button" onClick={() => downloadCompetitionStandingsImage(selectedCompetition, config, trophyMap)} disabled={!selectedIsLeague && !["world_cup", "champions_league"].includes(selectedTypeKey)}>{["world_cup", "champions_league"].includes(selectedTypeKey) ? "تحميل ترتيب المجموعات" : "تحميل صورة الترتيب"}</button>{(["world_cup", "champions_league"].includes(selectedTypeKey) || selectedLeagueGroupsMode) ? <button type="button" onClick={() => downloadCompetitionScheduleTableImage(selectedCompetition, config, trophyMap)}>{clean(selectedCompetition.status) === "completed" ? "تحميل نتائج المباريات" : "تحميل جدول المباريات"}</button> : null}<button type="button" onClick={() => downloadCompetitionResultsImage(selectedCompetition, config, trophyMap)}>{(["world_cup", "champions_league"].includes(selectedTypeKey) || selectedLeagueGroupsMode) ? "تحميل صورة الأدوار الإقصائية" : clean(selectedCompetition.status) === "completed" ? "تحميل نتائج المباريات" : "تحميل جدول المباريات"}</button></div>
        </section>

        {selectedTypeKey === "world_cup" ? <WorldCupGroupsSection competition={selectedCompetition} config={config} trophyMap={trophyMap} /> : (selectedTypeKey === "champions_league" || selectedLeagueGroupsMode) ? <ChampionsLeagueGroupsSection competition={selectedCompetition} config={config} trophyMap={trophyMap} /> : null}

        {selectedIsLeague ? <section className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>ترتيب الدوري</h3></div></div><div className="leagueTable"><div className="leagueTableHead"><span>#</span><span>العضو</span><span>لعب</span><span>ف</span><span>ت</span><span>خ</span><span>له</span><span>عليه</span><span>فارق</span><span>نقاط</span></div>{selectedStandings.map((row, index) => <div key={row.memberId} className={index === 0 ? "leagueTableRow champion" : relegatedIds.some((id) => same(id, row.memberId)) ? "leagueTableRow relegated" : absentIds.some((id) => same(id, row.memberId)) ? "leagueTableRow absent" : "leagueTableRow"}><span>{index + 1}</span><span>{row.memberName}{row.needsPlayoff ? <em className="playoffBadge">فاصلة</em> : null}{absentIds.some((id) => same(id, row.memberId)) ? <em className="absentBadge">غائب</em> : null}</span><span>{row.played}</span><span>{row.wins}</span><span>{row.draws}</span><span>{row.losses}</span><span>{row.goalsFor}</span><span>{row.goalsAgainst}</span><span>{row.goalDifference}</span><b>{row.points}</b></div>)}</div></section> : <KnockoutBracketSection competition={selectedCompetition} title="الأدوار الإقصائية" />}

        <section className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>{clean(selectedCompetition.status) === "completed" ? "نتائج المباريات" : "جدول المباريات"}</h3></div></div><div className="leagueRoundsList">{groupedMatches.map((round) => <div className="leagueRoundBox" key={round.round}><h4>{selectedIsLeague ? (round.matches?.[0]?.scope === "league_qualifier" ? `ملحق الدوري - ${round.matches?.[0]?.label || roundLabelForBracket(round.round, groupedMatches.length)}` : `الجولة ${round.round}`) : selectedTypeKey === "world_cup" ? worldCupAdminRoundTitle(round.matches?.[0] || {}, round.round) : selectedLeagueGroupsMode ? leagueTwoGroupsAdminRoundTitle(round.matches?.[0] || {}, round.round) : selectedTypeKey === "champions_league" ? championsLeagueAdminRoundTitle(round.matches?.[0] || {}, round.round) : roundLabelForBracket(round.round, groupedMatches.length)}</h4><div className="leagueMatchesList">{round.matches.map((match) => { const values = resultInputs[match.id] || {}; const completed = clean(match.resultStatus || match.status) === "completed"; const waiting = String(match.homeMemberId || "").startsWith("__") || String(match.awayMemberId || "").startsWith("__"); return <article className={completed ? "leagueMatchCard completed" : "leagueMatchCard"} key={match.id}><div className="leagueMatchTeams"><b>{match.homeName}</b><span>vs</span><b>{match.awayName}</b></div><div className="leagueMatchMeta"><span>{match.gameTitle || "PES 2017"}</span><small>{match.label || match.gameReason || ""}</small></div><div className="leagueMatchScore"><input inputMode="numeric" value={values.homeGoals ?? (completed ? match.homeGoals : "")} onChange={(event) => setResultInputs((current) => ({ ...current, [match.id]: { ...(current[match.id] || {}), homeGoals: event.target.value } }))} disabled={waiting || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode)} placeholder="0" /><span>:</span><input inputMode="numeric" value={values.awayGoals ?? (completed ? match.awayGoals : "")} onChange={(event) => setResultInputs((current) => ({ ...current, [match.id]: { ...(current[match.id] || {}), awayGoals: event.target.value } }))} disabled={waiting || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode)} placeholder="0" /></div>{(waiting || clean(selectedCompetition.status) === "cancelled") ? null : <div className="leagueMatchActions"><select value={values.gameTitle ?? match.gameTitle ?? "PES 2017"} onChange={(event) => setResultInputs((current) => ({ ...current, [match.id]: { ...(current[match.id] || {}), gameTitle: event.target.value } }))} disabled={clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode}><option value="FIFA 2025">FIFA 2025</option><option value="PES 2017">PES 2017</option></select><button type="button" disabled={busy || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode) || clean(selectedCompetition.status) === "cancelled"} onClick={() => submitMatchResult(match)}>حفظ النتيجة</button>{completed ? <button type="button" disabled={busy || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode) || clean(selectedCompetition.status) === "cancelled"} onClick={() => submitClearMatchResult(match)}>حذف النتيجة</button> : null}</div>}</article>; })}</div></div>)}</div></section>

        <CompetitionStatsBox competition={selectedCompetition} />

        <section className="sectionBox glassSoft adminForm">
          <div className="sectionHead compact"><div><h3>ملاحظات البطولة</h3><p>خانة يدوية لملاحظات FIFA Admin عن هذه البطولة. لا تغيّر النتائج ولا تؤثر على الجداول.</p></div></div>
          <label className="moneyField"><span>ملاحظات إدارية عن البطولة</span><textarea value={competitionAdminNote} onChange={(event) => setCompetitionAdminNote(event.target.value)} placeholder="مثال: تم تأجيل مباريات المجموعة الثانية بسبب غياب أحد الأعضاء." /></label>
          <button className="moneySubmitBtn" type="button" disabled={busy || !selectedCompetition} onClick={submitCompetitionAdminNote}>حفظ الملاحظة</button>
        </section>

        <section className="sectionBox glassSoft adminForm">
          <div className="sectionHead compact"><div><h3>الاعتماد والغياب{selectedIsAnyLeague ? " والهبوط" : ""}</h3></div></div>
          {selectedIsAnyLeague ? <><h4 className="dealSectionTitle">الهابطون</h4><div className="leagueMembersGrid compact">{selectedRelegationRows.map((row) => <label key={row.memberId} className={relegatedIds.some((id) => same(id, row.memberId)) ? "leagueMemberPick relegated active" : "leagueMemberPick"}><input type="checkbox" checked={relegatedIds.some((id) => same(id, row.memberId))} onChange={() => toggleRelegated(row.memberId)} /><span>{row.memberName}</span></label>)}</div></> : null}
          <h4 className="dealSectionTitle">إدارة الغياب</h4>
          <div className="leagueRuleNote">القرار يدوي من FIFA Admin فقط: اختر استبعاد العضو من البطولة، أو تسجيل خسارة إدارية له في المباريات المتبقية.</div>
          <label className="moneyField"><span>العضو الغائب</span><select value={absenceMemberId} onChange={(event) => setAbsenceMemberId(event.target.value)}><option value="">اختر العضو</option>{(selectedCompetition.participants || []).filter((row) => !isCompetitionExcludedMember(selectedCompetition, row.memberId || row.id)).map((row) => <option key={row.memberId || row.id} value={row.memberId || row.id}>{row.memberName || row.name || row.memberId || row.id}</option>)}</select></label>
          {absenceMemberId ? <div className="leagueRuleNote">لعب: {absenceInfo.played} • مباريات متبقية قابلة للإجراء: {absenceInfo.remaining}</div> : null}
          <label className="moneyField"><span>نوع الإجراء</span><select value={absenceMode} onChange={(event) => setAbsenceMode(event.target.value)}><option value="exclude">استبعاد من البطولة</option><option value="forfeit_loss">خسارة إدارية للمباريات المتبقية</option></select></label>
          {absenceMode === "forfeit_loss" ? <div className="leagueRewardGrid"><label className="moneyField"><span>أهداف الخصم الفائز</span><input inputMode="numeric" value={absenceWinGoals} onChange={(event) => setAbsenceWinGoals(event.target.value)} /></label><label className="moneyField"><span>أهداف العضو الغائب</span><input inputMode="numeric" value={absenceLoseGoals} onChange={(event) => setAbsenceLoseGoals(event.target.value)} /></label></div> : null}
          <label className="moneyField"><span>ملاحظة إدارية اختيارية</span><textarea value={absenceNote} onChange={(event) => setAbsenceNote(event.target.value)} placeholder="مثال: غياب عن منافسات المجموعة الثانية" /></label>
          <button className="moneySubmitBtn" type="button" disabled={busy || !absenceMemberId || clean(selectedCompetition.status) === "completed" || clean(selectedCompetition.status) === "cancelled"} onClick={submitAbsenceAction}>{absenceMode === "forfeit_loss" ? "تسجيل الخسارة الإدارية" : "استبعاد العضو من البطولة"}</button>
          <h4 className="dealSectionTitle">الغائبون عند الاعتماد</h4>
          <div className="leagueMembersGrid compact">{(selectedCompetition.participants || []).map((row) => <label key={row.memberId} className={absentIds.some((id) => same(id, row.memberId)) ? "leagueMemberPick absent active" : "leagueMemberPick"}><input type="checkbox" checked={absentIds.some((id) => same(id, row.memberId))} onChange={() => toggleAbsent(row.memberId)} /><span>{row.memberName}</span></label>)}</div>
          <button className="moneySubmitBtn" type="button" disabled={busy || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode) || clean(selectedCompetition.status) === "cancelled"} onClick={submitFinalizeCompetition}>{clean(selectedCompetition.status) === "completed" && (["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) || selectedLeagueGroupsMode) ? "إعادة اعتماد النتائج وتصحيح المكافآت" : clean(selectedCompetition.status) === "completed" ? "معتمدة" : "اعتماد النتائج"}</button>
        </section>

        <section className="sectionBox glassSoft adminForm dangerZone"><div className="sectionHead compact"><div><h3>حذف البطولة</h3><p>استخدمه عند إنشاء بطولة بالخطأ. سيتم حذفها نهائيًا من البطولات المحفوظة مع حفظ أثر إداري في سجل FIFA.</p></div></div><label className="moneyField"><span>سبب الإلغاء</span><textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label><button className="moneySubmitBtn danger" type="button" disabled={busy || (clean(selectedCompetition.status) === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(selectedTypeKey) && !selectedLeagueGroupsMode) || clean(selectedCompetition.status) === "cancelled"} onClick={submitCancelCompetition}>حذف البطولة نهائيًا</button></section>
      </> : null}
    </main>
  );
}
