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

function NavButton({ page, menuOpen, id, icon, label, onClick }) {
  return (
    <button
      className={!menuOpen && page === id ? "navBtn active" : "navBtn"}
      onClick={onClick}
    >
      <span className="navIcon">{renderSmartIcon(icon)}</span>
      <span className="navLabel">{label}</span>
    </button>
  );
}

export function BottomNav({ page, goPage, menuOpen, setMenuOpen, config }) {
  const navStyle = {
    position: "fixed",
    left: "50%",
    right: "auto",
    bottom: "calc(10px + env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    width: "min(640px, calc(100vw - 18px))",
    maxWidth: "640px",
    height: "72px",
    minHeight: "72px",
    maxHeight: "72px",
    margin: 0,
    padding: "7px",
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "5px",
    borderRadius: "26px",
    overflow: "hidden",
    background: "linear-gradient(180deg,#081126,#050a17)",
    border: "1px solid rgba(255,255,255,.14)",
    boxShadow:
      "0 -8px 28px rgba(0,0,0,.32), 0 18px 60px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.14)",
    zIndex: 2147483601,
    direction: "rtl",
    boxSizing: "border-box",
  };

  const curtainStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: "calc(92px + env(safe-area-inset-bottom))",
    background: "#020617",
    zIndex: 2147483600,
    pointerEvents: "none",
  };

  const nav = (
    <>
      <div
        className="bottomNavPortalCurtain forceBottomCurtain"
        aria-hidden="true"
        style={curtainStyle}
      />
      <nav className="mainNav glassSoft forceBottomNav" style={navStyle}>
        <NavButton
          page={page}
          menuOpen={menuOpen}
          id="home"
          icon="🏠"
          label="الرئيسية"
          onClick={() => goPage("home")}
          />
        <NavButton
          page={page}
          menuOpen={menuOpen}
          id="myProfile"
          icon="👤"
          label="ملفي"
          onClick={() => goPage("myProfile")}
        />
        {isEnabled(config.showSeasonTournaments) ? (
          <NavButton
            page={page}
            menuOpen={menuOpen}
            id="season"
            icon={config.navSeasonIcon}
            label="الموسم"
            onClick={() => goPage("season", { clearFocusedCompetition: true })}
          />
        ) : null}
        {isEnabled(config.showTransfers) ? (
          <NavButton
            page={page}
            menuOpen={menuOpen}
            id="transfers"
            icon={config.menuTransfersIcon}
            label="الانتقالات"
            onClick={() => goPage("transfers")}
          />
        ) : null}
        <button
          className={menuOpen ? "navBtn active" : "navBtn"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navIcon">{renderSmartIcon(config.navMoreIcon)}</span>
          <span className="navLabel">المزيد</span>
        </button>
      </nav>
    </>
  );

  if (typeof document === "undefined") return nav;
  return createPortal(nav, document.body);
}
