export function AuthMiniBadge({ profile, onLogout }) {
  const displayName = profile?.memberName || profile?.username || "عضو";

  return (
    <div className="authMiniBadge glassSoft">
      <span>أهلاً {displayName}</span>
      <button type="button" onClick={onLogout}>
        خروج
      </button>
    </div>
  );
}
