export function FifaStudioPage({
  config = DEFAULT_CONFIG,
  members = [],
  competitions = [],
  allTournaments = [],
  transferHistory = [],
  trophyMap = {},
  currentMember = null,
  currentMemberId = "",
  players = [],
  financeRows = [],
  playerContracts = [],
  statsMap = {},
  rankedMembers = [],
  getMemberPlayersForExport = null,
}) {
  const [template, setTemplate] = useState("champion");
  const [championId, setChampionId] = useState("");
  const [matchId, setMatchId] = useState("");
  const [dealId, setDealId] = useState("");
  const [memberId, setMemberId] = useState("");

  const completedCompetitions = useMemo(() => {
    return (competitions || [])
      .filter((competition) => clean(competition.status || "") === "completed")
      .slice()
      .sort((a, b) => studioTimeValue(b.completedAt || b.updatedAt || b.endDate || b.date) - studioTimeValue(a.completedAt || a.updatedAt || a.endDate || a.date));
  }, [competitions]);

  const championOptions = useMemo(() => {
    const rows = [];
    completedCompetitions.forEach((competition) => {
      const champion = getCompetitionChampionInfo(competition);
      const championName = competition.championMemberName || competition.championName || champion?.memberName || "";
      if (!championName) return;
      rows.push({
        id: "competition:" + (competition.id || rows.length),
        source: "competition",
        competition,
        title: competition.name || competition.title || "بطولة",
        subtitle: competitionTypeArabic(competition.type || competition.competitionType) + " · " + studioEventDateLabel(competition.completedDate, competition.completedAt, competition.endDate, competition.date, competition.updatedAt),
        championName,
      });
    });
    (allTournaments || [])
      .filter((row) => cleanId(row.winnerId || row.winnerid || ""))
      .slice()
      .sort((a, b) => studioTimeValue(b.date || b.endDate || b.createdAt) - studioTimeValue(a.date || a.endDate || a.createdAt))
      .slice(0, 40)
      .forEach((row, index) => {
        const trophy = trophyMap[cleanId(row.trophyId || row.trophyid || row.type || "")] || {};
        const name = row.name || row.trophyName || trophy.name || competitionTypeArabic(row.type || row.trophyId || "بطولة");
        rows.push({
          id: "archive:" + (row.id || row.recordId || index),
          source: "archive",
          row,
          title: name + (row.edition ? " " + row.edition : ""),
          subtitle: studioEventDateLabel(row.date, row.endDate) || "السجل العام",
          championName: getMemberName(members, row.winnerId || row.winnerid) || row.winnerName || row.winner || "البطل",
        });
      });
    return rows.slice(0, 60);
  }, [completedCompetitions, allTournaments, trophyMap, members]);

  const resultOptions = useMemo(() => {
    const rows = [];
    (competitions || []).forEach((competition) => {
      sortedCompetitionMatchesForSchedule(competition)
        .filter((match) => clean(match.resultStatus || match.status) === "completed" && clean(match.phase || "") !== "bye")
        .forEach((match) => {
          rows.push({
            id: (competition.id || "competition") + "::" + (match.id || rows.length),
            competition,
            match,
            title: (competition.name || competition.title || "بطولة") + " · " + (match.label || scheduleStageTitleForMatch(competition, match)),
            subtitle: (match.homeName || getMemberName(members, match.homeMemberId) || "طرف أول") + " " + (match.homeGoals ?? "-") + " - " + (match.awayGoals ?? "-") + " " + (match.awayName || getMemberName(members, match.awayMemberId) || "طرف ثاني") + " · " + studioEventDateLabel(match.completedAt, match.date, match.updatedAt, competition.updatedAt),
            time: studioTimeValue(match.completedAt || match.updatedAt || match.date || competition.updatedAt || competition.createdAt),
          });
        });
    });
    return rows.sort((a, b) => b.time - a.time).slice(0, 80);
  }, [competitions, members]);

  const dealOptions = useMemo(() => {
    return (transferHistory || [])
      .filter((row) => !["cancelled", "canceled", "rejected", "failed"].includes(clean(row.status || "completed")))
      .slice()
      .sort((a, b) => studioTimeValue(b.completedAt || b.createdAt || b.date) - studioTimeValue(a.completedAt || a.createdAt || a.date))
      .slice(0, 80)
      .map((row, index) => ({
        id: row.id || row.relatedOfferId || ("deal-" + index),
        row,
        title: row.playerName || row.targetPlayerName || "صفقة انتقال",
        subtitle: (row.fromMemberName || getMemberName(members, row.fromMemberId) || "طرف") + " ← " + (row.toMemberName || getMemberName(members, row.toMemberId) || "طرف") + " · " + formatMoney(row.amount || row.loanAmount || 0) + " · " + studioEventDateLabel(row.completedAt, row.date, row.createdAt),
      }));
  }, [transferHistory, members]);

  const memberOptions = useMemo(() => {
    const rows = [];
    (members || [])
      .filter((member) => cleanId(member.id) && !same(member.id, "FIFA"))
      .forEach((member) => {
        const id = cleanId(member.id);
        const name = member.name || member.memberName || id;
        const activeIndex = (rankedMembers || []).findIndex((row) => same(row.id || row.memberId, id));
        const activeRow = activeIndex >= 0 ? (rankedMembers || [])[activeIndex] : null;
        if (isActiveSeasonMember(member) || activeRow) {
          rows.push({
            id: `active:${id}`,
            variant: "active",
            member: activeRow ? { ...member, ...activeRow, id } : member,
            seasonRank: activeRow?.rankOrder || (activeIndex >= 0 ? activeIndex + 1 : 1),
            seasonTitles: toNumber(activeRow?.titles ?? member.titles ?? 0),
            title: `${name} — بطاقة نشط`,
            subtitle: "عضو نشط في الموسم · " + (activeRow?.team || member.team || member.club || member.nationalteam || "FIFA GROUP"),
          });
        }
        rows.push({
          id: `historical:${id}`,
          variant: "historical",
          member,
          title: `${name} — بطاقة تاريخي`,
          subtitle: (isActiveSeasonMember(member) ? "نسخة تاريخية للعضو النشط" : "عضو تاريخي") + " · " + (member.team || member.club || member.nationalteam || "FIFA GROUP"),
        });
      });
    return rows;
  }, [members, rankedMembers]);

  const selectedChampion = championOptions.find((item) => item.id === championId) || championOptions[0] || null;
  const selectedMatch = resultOptions.find((item) => item.id === matchId) || resultOptions[0] || null;
  const selectedDeal = dealOptions.find((item) => item.id === dealId) || dealOptions[0] || null;
  const selectedMember = memberOptions.find((item) => item.id === memberId) || memberOptions[0] || null;

  useEffect(() => { if (!championId && championOptions[0]) setChampionId(championOptions[0].id); }, [championId, championOptions]);
  useEffect(() => { if (!matchId && resultOptions[0]) setMatchId(resultOptions[0].id); }, [matchId, resultOptions]);
  useEffect(() => { if (!dealId && dealOptions[0]) setDealId(dealOptions[0].id); }, [dealId, dealOptions]);
  useEffect(() => {
    if (!memberOptions.length) return;
    if (memberId && memberOptions.some((item) => item.id === memberId)) return;
    const preferred = memberOptions.find((item) => item.variant === "active" && same(item.member?.id, currentMemberId))
      || memberOptions.find((item) => same(item.member?.id, currentMemberId))
      || memberOptions[0];
    if (preferred) setMemberId(preferred.id);
  }, [memberId, memberOptions, currentMemberId]);
  useEffect(() => { if (!memberId && memberOptions[0]) setMemberId(memberOptions[0].id); }, [memberId, memberOptions]);

  function handleDownload() {
    if (template === "champion") return downloadStudioChampionImage({ item: selectedChampion, members, config, trophyMap });
    if (template === "result") return downloadStudioResultImage({ item: selectedMatch, members, config, trophyMap });
    if (template === "deal") return downloadStudioDealImage({ item: selectedDeal, members, config });
    const exportMemberId = cleanId(selectedMember?.member?.id || selectedMember?.id || "");
    const exportPlayers = typeof getMemberPlayersForExport === "function"
      ? getMemberPlayersForExport(exportMemberId)
      : (players || []).filter((player) => same(player.memberid || player.memberId, exportMemberId));
    return downloadStudioMemberCardImage({
      item: selectedMember,
      members,
      allTournaments,
      trophyMap,
      config,
      players: exportPlayers,
      financeRows,
      contracts: playerContracts,
      statsMap,
      rankedMembers,
    });
  }

  const currentPreview = template === "champion" ? selectedChampion : template === "result" ? selectedMatch : template === "deal" ? selectedDeal : selectedMember;
  const templateText = template === "champion" ? "إعلان بطل بطولة" : template === "result" ? "نتيجة مباراة" : template === "deal" ? "إعلان صفقة" : "بطاقة عضو";

  return (
    <main className="widePage glass fifaStudioPage">
      <style>{fifaStudioCss}</style>
      <header className="pageHead">
        <h2>استوديو FIFA GROUP</h2>
        <p>قوالب نشر رسمية من بيانات التطبيق — قراءة وتصدير فقط بدون تعديل أي بيانات.</p>
      </header>

      <section className="studioTemplates glassSoft">
        {[
          ["champion", "🏆", "بطل بطولة"],
          ["result", "⚔️", "نتيجة مباراة"],
          ["deal", "🔁", "صفقة انتقال"],
          ["member", "🪪", "بطاقة عضو"],
        ].map(([id, icon, label]) => (
          <button type="button" key={id} className={template === id ? "active" : ""} onClick={() => setTemplate(id)}>
            <span>{icon}</span>
            <b>{label}</b>
          </button>
        ))}
      </section>

      <section className="studioGrid">
        <div className="studioPanel glassSoft">
          <div className="sectionHead compact"><div><h3>اختيار القالب</h3><p>اختر نوع الصورة ثم البيانات المراد تصديرها.</p></div></div>
          <div className="studioField">
            <label>{templateText}</label>
            {template === "champion" ? (
              <select value={selectedChampion?.id || ""} onChange={(event) => setChampionId(event.target.value)}>
                {championOptions.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.championName}</option>)}
              </select>
            ) : template === "result" ? (
              <select value={selectedMatch?.id || ""} onChange={(event) => setMatchId(event.target.value)}>
                {resultOptions.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.subtitle}</option>)}
              </select>
            ) : template === "deal" ? (
              <select value={selectedDeal?.id || ""} onChange={(event) => setDealId(event.target.value)}>
                {dealOptions.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.subtitle}</option>)}
              </select>
            ) : (
              <select value={selectedMember?.id || ""} onChange={(event) => setMemberId(event.target.value)}>
                {memberOptions.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.subtitle}</option>)}
              </select>
            )}
          </div>
          <button type="button" className="studioDownloadBtn" onClick={handleDownload} disabled={!currentPreview}>تحميل الصورة</button>
          <p className="studioSafeNote">هذا الاستوديو لا يكتب في Firebase ولا يغير أي سجل. التصدير فقط.</p>
        </div>

        <div className="studioPreview glassSoft">
          <div className="studioPreviewCard">
            <small>FIFA GROUP STUDIO</small>
            <h3>{templateText}</h3>
            <b>{currentPreview?.title || currentPreview?.member?.name || "لا توجد بيانات"}</b>
            <p>{currentPreview?.subtitle || currentPreview?.championName || "اختر بيانات القالب لتجهيز الصورة."}</p>
            <span>جاهز للنشر</span>
          </div>
        </div>
      </section>
    </main>
  );
}
