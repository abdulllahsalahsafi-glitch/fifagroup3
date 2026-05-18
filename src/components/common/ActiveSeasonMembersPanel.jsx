import React from "react";
// CSS: import fifaMemberLegacyScrollerCss from "../../styles/member-scroller.css?inline";
// NOTE: Depends on utility functions from the main App module:
//   cleanId, isFifaSystemMember, toNumber, formatMoney, formatLatinNumber,
//   getMemberFinanceRows, computeMemberBalance, downloadActiveSeasonMemberCardImage
function ActiveSeasonMembersPanel({
  members = [],
  financeRows = [],
  config = {},
  totalForMember,
  onOpenMember,
  title = "الأعضاء النشطون في الموسم السادس",
  subtitle = "اضغط على أي عضو لفتح بروفايله العام.",
  compact = false,
  grid = false,
}) {
  const rows = (members || [])
    .filter((member) => cleanId(member.id || member.memberId || "") && !isFifaSystemMember(member))
    .map((member, index) => {
      const memberId = cleanId(member.id || member.memberId || "");
      const titles = Number.isFinite(Number(member.titles))
        ? Number(member.titles)
        : Number.isFinite(Number(member.total))
          ? Number(member.total)
          : typeof totalForMember === "function"
            ? totalForMember(memberId)
            : 0;
      const points = Number.isFinite(Number(member.points)) ? Number(member.points) : 0;
      return {
        ...member,
        id: memberId,
        titles: Math.max(0, Number(titles) || 0),
        points: Math.max(0, Number(points) || 0),
        rankOrder: index + 1,
      };
    })
    .sort((a, b) =>
      (toNumber(b.points) - toNumber(a.points)) ||
      (toNumber(b.titles) - toNumber(a.titles)) ||
      String(a.name || a.memberName || a.id).localeCompare(String(b.name || b.memberName || b.id), "ar")
    );

  if (!rows.length) return null;

  return (
    <section className={`fgMemberLegacyPanel active ${compact ? "compact" : ""} ${grid ? "grid" : ""}`}>
      <style>{fifaMemberLegacyScrollerCss}</style>
      <style>{`.fgMemberLegacyDownloadIcon{position:absolute;top:9px;left:9px;z-index:4;width:26px;height:26px;border-radius:999px;border:1px solid rgba(0,230,118,.34);background:rgba(0,230,118,.12);color:#a7f3d0;-webkit-text-fill-color:#a7f3d0;font-size:15px;font-weight:1000;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-family:inherit;line-height:1}.fgMemberLegacyDownloadIcon:active{background:rgba(0,230,118,.22)}.fgMemberLegacyPanel.historical .fgMemberLegacyDownloadIcon{border-color:rgba(168,85,247,.34);background:rgba(168,85,247,.12);color:#d8b4fe;-webkit-text-fill-color:#d8b4fe}`}</style>
      <div className="fgMemberLegacyHead">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="fgMemberLegacyCount">{formatLatinNumber(rows.length)} عضو</span>
      </div>
      <div className="fgMemberLegacyRow">
        {rows.map((member, index) => {
          const memberName = member.name || member.memberName || member.id;
          const imgSrc = member.avatar || member.image || member.photo || "";
          const teamText = member.team || member.club || "FIFA GROUP";
          const nationalText = member.nationalteam || member.nationalTeam || member.national || "-";
          const memberFinanceRows = Array.isArray(financeRows) && financeRows.length ? getMemberFinanceRows(financeRows, member.id) : [];
          const balance = memberFinanceRows.length ? computeMemberBalance(memberFinanceRows, member.balance, member.id) : toNumber(member._balance || member.balance || 0);
          const trophies = member.titles || 0;
          const frontStats = [
            ["🏆 بطولات الموسم", formatLatinNumber(trophies)],
            ["💰 الرصيد", formatMoney(balance)],
          ];
          return (
            <article
              key={member.id || index}
              role="button"
              tabIndex={0}
              className={`fgMemberLegacyCard tone${index % 6}`}
              onClick={() => typeof onOpenMember === "function" ? onOpenMember(member.id) : null}
              onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && typeof onOpenMember === "function") {
                  event.preventDefault();
                  onOpenMember(member.id);
                }
              }}
              aria-label={`فتح بروفايل ${memberName}`}
            >
              <div className="fgMemberLegacyCardInner">
                <div className="fgMemberLegacyFront">
                  <span
                    role="button"
                    tabIndex={0}
                    className="fgMemberLegacyDownloadIcon"
                    title="تحميل بطاقة العضو النشط"
                    aria-label={`تحميل بطاقة ${memberName} النشط`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      downloadActiveSeasonMemberCardImage({
                        member,
                        rankedMembers: rows,
                        financeRows,
                        balance,
                        seasonRank: index + 1,
                        seasonTitles: trophies,
                        config,
                      });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        downloadActiveSeasonMemberCardImage({
                          member,
                          rankedMembers: rows,
                          financeRows,
                          balance,
                          seasonRank: index + 1,
                          seasonTitles: trophies,
                          config,
                        });
                      }
                    }}
                  >⤓</span>
                  <div className="fgMemberLegacyRank">#{formatLatinNumber(index + 1)}</div>
                  <div className="fgMemberLegacyAvatarWrap">
                    {imgSrc ? <img className="fgMemberLegacyAvatar" src={imgSrc} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="fgMemberLegacyFallback">{String(memberName || "?").slice(0, 1)}</span>}
                  </div>
                  <div className="fgMemberLegacyName">{memberName}</div>
                  <div className="fgMemberLegacyTeam">{teamText}</div>
                  <div className="fgMemberLegacyTeam national">{nationalText}</div>
                  <div className="fgMemberLegacyDivider" />
                  <div className="fgMemberLegacyStats">
                    {frontStats.map(([label, value]) => (
                      <div className="fgMemberLegacyStat" key={label}>
                        <span>{label}</span><b>{value}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export { ActiveSeasonMembersPanel };

