import React from "react";

// NOTE: This component depends on competitionLogoUrl() and competitionDefaultIcon()
// utility functions from the main App module.

function CompetitionIcon({ competition = {}, config = {}, trophyMap = {}, className = "competitionIcon" }) {
  const logo = competitionLogoUrl(competition, config, trophyMap);
  if (logo) return <img className={className} src={logo} alt="" />;
  return <span className={className + " fallbackCompetitionIcon"}>{competitionDefaultIcon(competition.type)}</span>;
}

export { CompetitionIcon };
