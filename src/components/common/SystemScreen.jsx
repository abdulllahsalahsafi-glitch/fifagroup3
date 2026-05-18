import React from "react";

export function SystemScreen({ title, subtitle, loading }) {
  return (
    <div className="systemScreen" dir="rtl">
      <div className="systemCard glass">
        {loading ? <div className="spinner" /> : null}
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
