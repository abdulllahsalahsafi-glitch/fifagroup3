import React from "react";
import { createPortal } from "react-dom";

/* ============================================================
   Internal helpers – originally colocated in App.jsx
   ============================================================ */

function notificationTimeValue(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?.seconds) return Number(value.seconds) * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getInitialPushStatus() {
  if (typeof window === "undefined") {
    return { state: "ready", message: "فعّل إشعارات الجوال لهذا الجهاز." };
  }

  if (!("Notification" in window)) {
    return { state: "unsupported", message: "هذا المتصفح لا يدعم إشعارات الويب." };
  }

  if (window.Notification.permission === "granted") {
    return { state: "enabled", message: "إشعارات الجوال مفعلة لهذا الجهاز." };
  }

  if (window.Notification.permission === "denied") {
    return { state: "denied", message: "تم رفض الإشعارات من إعدادات المتصفح أو الجهاز." };
  }

  return { state: "ready", message: "فعّل الإشعارات لهذا الجهاز لمتابعة أخبار اللعبة والصفقات والتحويلات." };
}

function notificationDisplayDate(value) {
  const time = notificationTimeValue(value);
  if (!time) return "الآن";
  return new Date(time).toLocaleDateString("ar", { month: "short", day: "numeric" });
}

function clean(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/* ============================================================
   NotificationsPanel (App.jsx lines 13548‑13622)
   ============================================================ */

function NotificationsPanel({ rows, members, currentMemberId, pushStatus, pushBusy, onEnablePushNotifications, onDisablePushNotifications, onOpenNotification, onClearNotifications }) {
  const visibleRows = rows || [];
  const initialPush = getInitialPushStatus();
  const pushState = pushStatus?.state || initialPush.state;
  const pushMessage = pushStatus?.message || initialPush.message;
  const pushEnabled = pushState === "enabled";
  const permissionLabel = pushBusy
    ? "جاري التنفيذ..."
    : pushEnabled
    ? "إيقاف إشعارات هذا الجهاز"
    : "تفعيل إشعارات الجوال";
  const buttonHandler = pushEnabled ? onDisablePushNotifications : onEnablePushNotifications;

  return (
    <section className="notificationsPanel glassSoft">
      <div className="notificationsHead">
        <b>🔔 الإشعارات</b>
        <div className="notificationsHeadActions">
          <small>{visibleRows.length ? `${visibleRows.length} آخر إشعارات` : "لا توجد إشعارات"}</small>
          {visibleRows.length ? (
            <button
              type="button"
              className="clearNotificationsBtn"
              onClick={onClearNotifications}
              disabled={!onClearNotifications}
              title="إخفاء الإشعارات من حسابك"
            >
              تنظيف الإشعارات
            </button>
          ) : null}
          <button
            type="button"
            className={pushEnabled ? "enableDeviceNotifyBtn active stop" : "enableDeviceNotifyBtn"}
            onClick={buttonHandler}
            disabled={pushBusy || !buttonHandler}
            title={pushMessage}
          >
            {permissionLabel}
          </button>
        </div>
      </div>

      <div className={pushEnabled ? "pushNotifyBox active" : pushState === "error" ? "pushNotifyBox error" : "pushNotifyBox"}>
        <div>
          <b>{pushEnabled ? "إشعارات الجوال مفعلة" : "إشعارات الجوال"}</b>
          <small>{pushMessage}</small>
        </div>
      </div>

      {visibleRows.length ? (
        <div className="notificationsList">
          {visibleRows.map((item) => {
            const read = clean(item.status || "unread") === "read";
            const passive = Boolean(item.navigationDisabled);
            return (
              <button
                type="button"
                key={item.id}
                className={(read ? "notificationItem read clickableNotification" : "notificationItem clickableNotification") + (passive ? " disabledNotification" : "")}
                disabled={Boolean(passive)}
                onClick={() => !passive && onOpenNotification?.(item)}
              >
                <b>{item.title || "إشعار"}</b>
                <p>{item.body || "-"}</p>
                <small>{notificationDisplayDate(item.createdAt || item.date)}</small>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty">لا توجد إشعارات حالياً.</div>
      )}
    </section>
  );
}

/* ============================================================
   NotificationsModal (App.jsx lines 13624‑13650)
   Uses createPortal from react-dom to render into document.body.
   CSS classes: .notificationsModalBackdrop .notificationsModal
   ============================================================ */

export function NotificationsModal({ rows, members, currentMemberId, pushStatus, pushBusy, onEnablePushNotifications, onDisablePushNotifications, onClose, onOpenNotification, onClearNotifications }) {
  return createPortal(
    <div className="notificationsModalBackdrop" onClick={onClose}>
      <section className="notificationsModal glass" onClick={(event) => event.stopPropagation()} dir="rtl">
        <header>
          <div>
            <small>FIFA GROUP</small>
            <h3>الإشعارات</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق">×</button>
        </header>
        <NotificationsPanel
          rows={rows}
          members={members}
          currentMemberId={currentMemberId}
          pushStatus={pushStatus}
          pushBusy={pushBusy}
          onEnablePushNotifications={onEnablePushNotifications}
          onDisablePushNotifications={onDisablePushNotifications}
          onOpenNotification={onOpenNotification}
          onClearNotifications={onClearNotifications}
        />
      </section>
    </div>,
    document.body
  );
}
