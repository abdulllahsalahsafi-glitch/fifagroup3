import React from "react";

export function LeagueViewerPage({ competitions = [], currentMemberId = "", focusedCompetitionId = "", config = {}, trophyMap = {} }) {
  return (
    <main className="pageShell leagueAdminShell">
      <CompetitionViewerSection competitions={competitions} currentMemberId={currentMemberId} focusedCompetitionId={focusedCompetitionId} config={config} trophyMap={trophyMap} standalone />
    </main>
  );
}
