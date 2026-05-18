import React, { useEffect, useRef, useState } from "react";
// NOTE: Depends on MANY utility functions and sub-components from the main App module:
//   competitionTypeKey, competitionTypeLabel, competitionStatusLabel, competitionTimeValue,
//   CompetitionIcon, CompetitionStatsBox, WorldCupGroupsSection, ChampionsLeagueGroupsSection,
//   ReadonlyLeagueMatch, KnockoutBracketSection, LeagueQualifierSection, EmbeddedQualifierSection,
//   computeLeagueStandings, filterCompetitionParticipantsForCalculation,
//   filterCompetitionMatchesForCalculation, sortedCompetitionMatchesForSchedule,
//   groupLeagueMatchesByRound, computeLeagueQualifierQualifiedIds,
//   getApprovedCompetitionChampionName, getKnockoutChampion, getMemberName,
//   clean, cleanId, same, isLeagueGroupsCompetition, buildLinkedLeagueCupDisplayCompetition,
//   downloadCompetitionFullDetailsImage, downloadCompetitionStandingsImage,
//   downloadCompetitionScheduleTableImage, downloadCompetitionResultsImage,
//   leagueTwoGroupsAdminRoundTitle, StatCard
function CompetitionViewerSection({ competitions = [], currentMemberId = "", focusedCompetitionId = "", config = {}, trophyMap = {}, standalone = false }) {
  const competitionRows = (competitions || [])
    .filter((item) => ["league", "league_qualifier", "cup", "super_cup", "champions_league", "world_cup"].includes(clean(item.type || "league")))
    .sort((a, b) => competitionTimeValue(a) - competitionTimeValue(b));
  const mainCompetitionTypes = ["league", "cup", "super_cup", "world_cup", "champions_league"];
  const rowsForType = (type) => competitionRows.filter((item) => {
    const key = competitionTypeKey(item.type);
    if (type === "league") return key === "league";
    return key === type;
  });
  const typeGroups = mainCompetitionTypes
    .map((type) => ({ type, rows: rowsForType(type) }))
    .filter((group) => group.rows.length)
    .sort((a, b) => competitionTimeValue(a.rows[0]) - competitionTimeValue(b.rows[0]));
  const focusedCompetition = focusedCompetitionId ? competitionRows.find((item) => same(item.id, focusedCompetitionId)) : null;
  const defaultType = focusedCompetition ? (competitionTypeKey(focusedCompetition.type) === "league_qualifier" ? "league" : competitionTypeKey(focusedCompetition.type)) : (typeGroups[0]?.type || "league");
  const [selectedType, setSelectedType] = useState(defaultType);
  const currentTypeRows = rowsForType(selectedType);
  const activeCompetition = currentTypeRows[0] || competitionRows[0] || null;
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(focusedCompetitionId || activeCompetition?.id || "");
  const appliedFocusedCompetitionRef = useRef("");
  const selectedCompetitionRaw = competitionRows.find((item) => same(item.id, selectedCompetitionId)) || activeCompetition;
  const selectedCompetition = competitionTypeKey(selectedCompetitionRaw?.type || "") === "cup"
    ? buildLinkedLeagueCupDisplayCompetition(selectedCompetitionRaw, competitionRows)
    : selectedCompetitionRaw;
  useEffect(() => {
    const nextFocusedId = cleanId(focusedCompetitionId || "");
    if (focusedCompetition && nextFocusedId && appliedFocusedCompetitionRef.current !== nextFocusedId) {
      setSelectedType(competitionTypeKey(focusedCompetition.type) === "league_qualifier" ? "league" : competitionTypeKey(focusedCompetition.type));
      setSelectedCompetitionId(focusedCompetition.id);
      appliedFocusedCompetitionRef.current = nextFocusedId;
      return;
    }
    if (!nextFocusedId) appliedFocusedCompetitionRef.current = "";
    if (!currentTypeRows.some((item) => same(item.id, selectedCompetitionId))) {
      setSelectedCompetitionId(currentTypeRows[0]?.id || activeCompetition?.id || "");
    }
  }, [focusedCompetitionId, focusedCompetition?.id, competitionRows.length, selectedType, currentTypeRows.length]);
  const standings = selectedCompetition && clean(selectedCompetition.type || "league") === "league" && !isLeagueGroupsCompetition(selectedCompetition) ? computeLeagueStandings(filterCompetitionParticipantsForCalculation(selectedCompetition), filterCompetitionMatchesForCalculation(selectedCompetition)) : [];
  const selectedTypeKey = competitionTypeKey(selectedCompetition?.type || "");
  const selectedScheduleMatches = selectedCompetition ? sortedCompetitionMatchesForSchedule(selectedCompetition) : [];
  const groupedMatches = selectedCompetition ? groupLeagueMatchesByRound(selectedCompetition.matches || []) : [];
  const myMatches = currentMemberId ? selectedScheduleMatches.filter((match) => same(match.homeMemberId, currentMemberId) || same(match.awayMemberId, currentMemberId)) : [];
  const viewerLeagueGroupsMode = selectedCompetition ? isLeagueGroupsCompetition(selectedCompetition) : false;
  const isLeague = clean(selectedCompetition?.type || "league") === "league";
  const publicGroupMatches = selectedCompetition && (["world_cup", "champions_league"].includes(selectedTypeKey) || viewerLeagueGroupsMode)
    ? selectedScheduleMatches.filter((match) => clean(match.phase || "") === "group")
    : [];
  const publicGroupedGroupMatches = groupLeagueMatchesByRound(publicGroupMatches);
  const qualifierRowsForSelectedLeague = selectedCompetition && isLeague
    ? competitionRows.filter((item) =>
        competitionTypeKey(item.type) === "league_qualifier" &&
        same(item.seasonId || "", selectedCompetition.seasonId || "")
      )
    : [];
  const qualifiedIds = selectedCompetition?.qualifiedMemberIds || computeLeagueQualifierQualifiedIds(selectedCompetition || {});

  return (
    <>
      {standalone ? (
        <section className="sectionBox glassSoft fifaAdminHero">
          <div><span className="heroKicker">FIFA GROUP</span><h2>البطولات التنافسية</h2></div><strong>📊</strong>
        </section>
      ) : null}
      <section className="sectionBox glassSoft competitionTypeShell">
        <div className="sectionHead compact"><div><h3>البطولات التنافسية</h3></div></div>
        {typeGroups.length ? (
          <>
            <div className="competitionTypeGrid">
              {typeGroups.map((group) => {
                const sample = group.rows[0] || { type: group.type };
                return (
                  <button key={group.type} type="button" className={selectedType === group.type ? "competitionTypeCard active" : "competitionTypeCard"} onClick={() => { setSelectedType(group.type); setSelectedCompetitionId(group.rows[0]?.id || ""); }}>
                    <CompetitionIcon competition={{ ...sample, type: group.type }} config={config} trophyMap={trophyMap} className="competitionTypeIcon" />
                    <b>{competitionTypeLabel(group.type)}</b>
                    <small>{group.rows.length} بطولة</small>
                  </button>
                );
              })}
            </div>
            <div className="competitionInstanceList">
              {currentTypeRows.map((competition) => (
                <button key={competition.id} type="button" className={same(selectedCompetition?.id, competition.id) ? "competitionInstanceCard active" : "competitionInstanceCard"} onClick={() => setSelectedCompetitionId(competition.id)}>
                  <CompetitionIcon competition={competition} config={config} trophyMap={trophyMap} className="competitionInstanceIcon" />
                  <div><b>{competition.name || competitionTypeLabel(competition.type)}</b><small>{competitionStatusLabel(competition.status)}{competition.startDate ? ` • ${competition.startDate}` : ""}</small></div>
                </button>
              ))}
            </div>
          </>
        ) : <div className="empty">لا توجد بطولات تنافسية منشأة بعد.</div>}
      </section>
      {selectedCompetition ? (
        <>
          <section className="sectionBox glassSoft">
            <div className="sectionHead compact competitionDetailHead"><CompetitionIcon competition={selectedCompetition} config={config} trophyMap={trophyMap} className="competitionDetailIcon" /><div><h3>{selectedCompetition.name}</h3><p>{competitionTypeLabel(selectedCompetition.type)} • {competitionStatusLabel(selectedCompetition.status)} {selectedCompetition.startDate ? `• ${selectedCompetition.startDate}` : ""}{selectedCompetition.endDate ? ` → ${selectedCompetition.endDate}` : ""}</p></div></div>
            <div className="leagueSummaryStrip compactSummaryStrip">
              <div className="leagueSummaryMetric"><span>المشاركون</span><b>{(selectedCompetition.participants || []).length}</b></div>
              <div className="leagueSummaryMetric"><span>المباريات</span><b>{(selectedCompetition.matches || []).length}</b></div>
              <div className="leagueSummaryMetric"><span>المكتملة</span><b>{(selectedCompetition.matches || []).filter((m) => clean(m.resultStatus || m.status) === "completed").length}</b></div>
              <div className="leagueSummaryMetric"><span>{isLeague || ["cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) ? "البطل" : "المتأهلون"}</span><b>{isLeague ? getApprovedCompetitionChampionName(selectedCompetition, standings[0]?.memberName || "") : ["cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) ? getApprovedCompetitionChampionName(selectedCompetition, getKnockoutChampion(selectedCompetition)?.memberName || "") : (qualifiedIds.length || "-")}</b></div>
            </div>
            <div className="imageActionRow"><button type="button" onClick={() => downloadCompetitionFullDetailsImage(selectedCompetition, config, trophyMap)}>تحميل صورة تفاصيل البطولة</button><button type="button" onClick={() => downloadCompetitionStandingsImage(selectedCompetition, config, trophyMap)} disabled={!isLeague && !["world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) && !isLeagueGroupsCompetition(selectedCompetition)}>{["world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) || isLeagueGroupsCompetition(selectedCompetition) ? "تحميل ترتيب المجموعات" : "تحميل صورة الترتيب"}</button>{(["world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) || isLeagueGroupsCompetition(selectedCompetition)) ? <button type="button" onClick={() => downloadCompetitionScheduleTableImage(selectedCompetition, config, trophyMap)}>{clean(selectedCompetition.status) === "completed" ? "تحميل نتائج المباريات" : "تحميل جدول المباريات"}</button> : null}<button type="button" onClick={() => downloadCompetitionResultsImage(selectedCompetition, config, trophyMap)}>{(["world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) || isLeagueGroupsCompetition(selectedCompetition)) ? "تحميل صورة الأدوار الإقصائية" : clean(selectedCompetition.status) === "completed" ? "تحميل نتائج المباريات" : "تحميل جدول المباريات"}</button></div>
          </section>
          {String(selectedCompetition.adminNote || "").trim() ? <section className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>ملاحظات البطولة</h3><p>ملاحظات FIFA Admin الخاصة بهذه النسخة.</p></div></div><div className="leagueRuleNote">{selectedCompetition.adminNote}</div></section> : null}
          {competitionTypeKey(selectedCompetition.type) === "world_cup" ? <WorldCupGroupsSection competition={selectedCompetition} config={config} trophyMap={trophyMap} /> : (competitionTypeKey(selectedCompetition.type) === "champions_league" || isLeagueGroupsCompetition(selectedCompetition)) ? <ChampionsLeagueGroupsSection competition={selectedCompetition} config={config} trophyMap={trophyMap} /> : null}
          {publicGroupMatches.length ? (
            <section className="sectionBox glassSoft">
              <div className="sectionHead compact"><div><h3>جدول مباريات دور المجموعات</h3><p>كل مباريات المجموعات ظاهرة للأعضاء.</p></div></div>
              <div className="leagueRoundsList">
                {publicGroupedGroupMatches.map((round) => (
                  <div className="leagueRoundBox" key={round.round}>
                    <h4>{round.matches?.[0]?.groupName ? `المجموعة ${round.matches[0].groupName}` : `الجولة ${round.round}`}</h4>
                    <div className="leagueMatchesList">{round.matches.map((match) => <ReadonlyLeagueMatch key={match.id} match={match} />)}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {isLeague && !isLeagueGroupsCompetition(selectedCompetition) ? (
            <section className="sectionBox glassSoft">
              <div className="sectionHead compact"><div><h3>الترتيب</h3></div></div>
              <div className="leagueTable">
                <div className="leagueTableHead"><span>#</span><span>العضو</span><span>لعب</span><span>ف</span><span>ت</span><span>خ</span><span>له</span><span>عليه</span><span>فارق</span><span>نقاط</span></div>
                {standings.map((row, index) => (
                  <div key={row.memberId} className={index === 0 ? "leagueTableRow champion" : (selectedCompetition.relegatedMemberIds || []).some((id) => same(id, row.memberId)) ? "leagueTableRow relegated" : (selectedCompetition.absentMemberIds || []).some((id) => same(id, row.memberId)) ? "leagueTableRow absent" : "leagueTableRow"}>
                    <span>{index + 1}</span><span>{row.memberName}{row.needsPlayoff ? <em className="playoffBadge">فاصلة</em> : null}{(selectedCompetition.absentMemberIds || []).some((id) => same(id, row.memberId)) ? <em className="absentBadge">غائب</em> : null}</span><span>{row.played}</span><span>{row.wins}</span><span>{row.draws}</span><span>{row.losses}</span><span>{row.goalsFor}</span><span>{row.goalsAgainst}</span><span>{row.goalDifference}</span><b>{row.points}</b>
                  </div>
                ))}
              </div>
            </section>
          ) : !["cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(selectedCompetition.type)) && qualifiedIds.length ? (
            <section className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>المتأهلون</h3></div></div><div className="incomingOfferedPlayers">{qualifiedIds.map((id) => <span key={id}>{getMemberName(selectedCompetition.participants || [], id) || id}</span>)}</div></section>
          ) : null}
          {myMatches.length ? (
            <section className="sectionBox glassSoft"><div className="sectionHead compact"><div><h3>مبارياتي</h3></div></div><div className="leagueMatchesList">{myMatches.map((match) => <ReadonlyLeagueMatch key={match.id} match={match} />)}</div></section>
          ) : null}
          {isLeague ? (
            <section className="sectionBox glassSoft">
              <div className="sectionHead compact"><div><h3>{clean(selectedCompetition.status) === "completed" ? "نتائج المباريات" : "جدول المباريات"}</h3></div></div>
              <div className="leagueRoundsList">{groupedMatches.map((round) => <div className="leagueRoundBox" key={round.round}><h4>{isLeagueGroupsCompetition(selectedCompetition) ? leagueTwoGroupsAdminRoundTitle(round.matches?.[0] || {}, round.round) : `الجولة ${round.round}`}</h4><div className="leagueMatchesList">{round.matches.map((match) => <ReadonlyLeagueMatch key={match.id} match={match} />)}</div></div>)}</div>
            </section>
          ) : (
            <KnockoutBracketSection competition={selectedCompetition} title="الأدوار الإقصائية" />
          )}
          {isLeague && !selectedCompetition?.leagueQualifier?.enabled && qualifierRowsForSelectedLeague.length ? (
            <LeagueQualifierSection qualifiers={qualifierRowsForSelectedLeague} />
          ) : null}
          <EmbeddedQualifierSection competition={selectedCompetition} config={config} trophyMap={trophyMap} />
          <CompetitionStatsBox competition={selectedCompetition} />
        </>
      ) : null}
    </>
  );
}

export { CompetitionViewerSection };

