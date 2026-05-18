import React from "react";

function BackButton({ onBack }) {
  return (
    <button className="floatingBackBtn" onClick={onBack} aria-label="رجوع">
      <span>←</span>
    </button>
  );
}

export { BackButton };
