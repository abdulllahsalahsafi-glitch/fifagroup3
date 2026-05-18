import { createPortal } from "react-dom";

export function TopSystemBar({ title, scrolled, unreadCount = 0, onNotificationsClick, authProfile, canGoBack = false, onBack }) {
  const top = (
    <div className={scrolled ? "topSystemPortalBar scrolled" : "topSystemPortalBar"} aria-hidden="false">
      <div className="topSystemInner">
        <button className="topNotifyBtn" type="button" onClick={onNotificationsClick} aria-label="الإشعارات">
          🔔
          {unreadCount ? <span>{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
        </button>
        <strong className="topSystemTitle">{title || "FIFA GROUP"}</strong>
        {canGoBack ? (
          <button className="topSystemBackBtn" type="button" onClick={onBack} aria-label="رجوع">
            <span>‹</span>
          </button>
        ) : <span className="topSystemBackSpacer" />}
      </div>
    </div>
  );
  if (typeof document === "undefined") return top;
  return createPortal(top, document.body);
}
