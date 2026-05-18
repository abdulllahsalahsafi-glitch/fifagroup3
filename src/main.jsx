import React from 'react'
import ReactDOM from 'react-dom/client'
import './theme/fifa-theme.css'
import './theme/member-page-theme.css'
import './theme/transfers-theme.css'
import './theme/season-theme.css'
import './theme/archive-stats-links-theme.css'
import './theme/unified-page-headers.css'
import './v4SplashHold.js'
import './v4BottomCurtainFix.js'
import './legacyGlobals.js'
import App from './App.jsx'
import './v4ProductionUiPatch.js'
import './theme/unifiedPageHeadersPatch.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
