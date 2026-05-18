import { createPortal } from "react-dom";

function isEnabled(value) {
  return String(value).toLowerCase() !== "false" && String(value) !== "0";
}

function renderSmartIcon(value) {
  const icon = String(value || "").trim();
  if (!icon) return null;
  if (/^https?:\/\//i.test(icon) || icon.startsWith("data:image")) {
    return <img className="smartIconImg" src={icon} alt="" />;
  }
  return icon;
}

export function SideMenu({ open, setOpen, goPage, config, isFifaAdmin = false, onLogout }) {
  if (!open) return null;

  const items = [
    isFifaAdmin ? ["fifaAdmin", "🛡️", "لوحة FIFA"] : null,
    isFifaAdmin ? ["leagueAdmin", "🏟️", "إدارة البطولات التنافسية"] : null,
    ["studio", "🎬", "استوديو FIFA GROUP"],
    isEnabled(config.showStats) ? ["stats", config.menuStatsIcon, "الإحصائيات العامة"] : null,
    isEnabled(config.showArchive) ? ["archive", config.navArchiveIcon, "السجل العام"] : null,
    isEnabled(config.showLinks) ? ["links", config.menuLinksIcon, config.linksTitle] : null,
  ].filter(Boolean);

  function selectPage(id) {
    setOpen(false);
    goPage(id);
  }

  const drawer = (
    <div className="fgMenuBackdrop" onClick={() => setOpen(false)}>
      <aside
        className="fgMenuPanel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="fgMenuHeader">
          <h2>القائمة</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق"
          >
            ×
          </button>
        </header>

        <div className="fgMenuItems">
          {items.map(([id, icon, label]) => (
            <button
              className="fgMenuItem"
              type="button"
              key={id}
              onClick={() => selectPage(id)}
            >
              <span className="fgMenuIcon">{renderSmartIcon(icon)}</span>
              <b>{label}</b>
            </button>
          ))}
        </div>

        {onLogout && (
          <div className="fgMenuLogoutBox">
            <button
              className="fgMenuItem fgMenuLogout"
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
            >
              <span className="fgMenuIcon">↩️</span>
              <b>تسجيل الخروج</b>
            </button>
          </div>
        )}
      </aside>
    </div>
  );

  if (typeof document === "undefined") return drawer;
  return createPortal(drawer, document.body);
}
