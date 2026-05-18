// FIFA GROUP — V4 VISUAL MATCH
export const v3OverrideCss = `

@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Orbitron:wght@700;900&display=swap');

:root {
  --cyan:#00E676 !important;
  --blue:#00D4FF !important;
  --violet:#A855F7 !important;
  --g:#00E676;--g2:#00B84C;
  --gdim:rgba(0,230,118,0.10);--gbor:rgba(0,230,118,0.25);
  --glass:rgba(255,255,255,0.032);--gbdr:rgba(255,255,255,0.07);
  --text:#EDF0FF;--sub:#6270A0;--sub2:#9BA0C0;--bg:#02030A;
}

html,body,#root,.app,button,input,select,textarea,
h1,h2,h3,h4,p,span,div,label,
.moneyTransferModal,.playerOfferModal,.notificationsModal,
.sideDrawer,.infoModal,.mainNav,.navBtn {
  font-family:'Tajawal',sans-serif !important;
}

@keyframes v4pgIn   {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes v4cardIn {from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes v4float  {0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes v4glow   {0%,100%{box-shadow:0 0 8px rgba(0,230,118,.20)}50%{box-shadow:0 0 20px rgba(0,230,118,.50)}}
@keyframes v4scan   {0%,100%{top:0;opacity:0}50%{top:100%;opacity:.7}}
@keyframes v4shine  {0%,100%{transform:translateX(-100%) skewX(-15deg)}50%{transform:translateX(180%) skewX(-15deg)}}
@keyframes v4shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes v4bounce {0%,100%{transform:translateY(0)}25%,75%{transform:translateY(-4px)}}
@keyframes v4liveDot{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,230,118,.4)}50%{opacity:.5;box-shadow:0 0 0 5px transparent}}
@keyframes v4splash {from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
@keyframes v4fill   {from{width:0}to{width:100%}}
@keyframes v4fade   {0%{opacity:1}85%{opacity:1}100%{opacity:0;pointer-events:none}}

/* BACKGROUND */
.app::before{
  background:
    radial-gradient(ellipse 320px 160px at 50% -2%,rgba(0,230,118,.08) 0%,transparent 65%),
    radial-gradient(circle at 8% 6%,rgba(0,230,118,.09) 0%,transparent 50%),
    radial-gradient(circle at 94% 10%,rgba(168,85,247,.07) 0%,transparent 50%),
    linear-gradient(rgba(0,230,118,.02) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,230,118,.02) 1px,transparent 1px) !important;
  background-size:100% 100%,100% 100%,100% 100%,44px 44px,44px 44px !important;
  background-color:#02030A !important;
}
.app::after{
  content:'' !important;position:fixed !important;top:38% !important;left:50% !important;
  transform:translate(-50%,-50%) !important;width:200px !important;height:200px !important;
  border-radius:50% !important;border:1px solid rgba(0,230,118,.04) !important;
  pointer-events:none !important;z-index:0 !important;
}

/* ORBS */
.bgOrbOne{background:rgba(0,230,118,.12) !important;width:280px !important;height:280px !important;top:60px !important;left:30px !important;filter:blur(16px) !important;animation:v4float 6s ease-in-out infinite !important;}
.bgOrbTwo{background:rgba(168,85,247,.09) !important;width:260px !important;height:260px !important;top:55px !important;right:20px !important;filter:blur(16px) !important;animation:v4float 8s ease-in-out infinite reverse !important;}

/* SPLASH */
#fifa-splash{background:#02030A !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;gap:20px !important;animation:v4fade .5s ease 2.4s both !important;z-index:9999 !important;}
#fifa-splash img,#fifa-splash .fifaSplashLogo{width:80px !important;height:80px !important;border-radius:22px !important;box-shadow:0 0 50px rgba(0,230,118,.45),0 0 90px rgba(0,212,255,.15) !important;animation:v4splash .6s cubic-bezier(.34,1.56,.64,1) .1s both !important;object-fit:contain !important;}
#fifa-splash h1,#fifa-splash .fifaSplashTitle{font-family:'Orbitron',sans-serif !important;font-size:26px !important;font-weight:900 !important;background:linear-gradient(90deg,#fff 20%,#00E676) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;animation:v4pgIn .5s ease .6s both !important;}
#fifa-splash p,#fifa-splash .fifaSplashSub{font-size:11px !important;font-weight:700 !important;color:#9BA0C0 !important;letter-spacing:2px !important;animation:v4pgIn .5s ease .8s both !important;}
#fifa-splash .fifaSplashBar,#fifa-splash .splashBar{width:170px !important;height:3px !important;background:rgba(255,255,255,.06) !important;border-radius:2px !important;overflow:hidden !important;animation:v4pgIn .5s ease 1s both !important;}
#fifa-splash .fifaSplashFill,#fifa-splash .splashFill{display:block !important;height:100% !important;border-radius:2px !important;background:linear-gradient(90deg,#00E676,#00D4FF) !important;animation:v4fill 1.8s ease 1.1s both !important;}

/* TOPBAR */
.topBar,.topBar.scrolled{position:sticky !important;top:0 !important;z-index:90 !important;background:rgba(2,3,10,.94) !important;backdrop-filter:blur(30px) !important;border-bottom:1px solid rgba(255,255,255,.07) !important;}
.topBar::after{content:'' !important;position:absolute !important;bottom:0 !important;left:0 !important;right:0 !important;height:1px !important;background:linear-gradient(90deg,transparent,#00E676,#00D4FF,#00E676,transparent) !important;opacity:.35 !important;}
.appTitle,.topBarTitle{font-family:'Orbitron',sans-serif !important;font-size:13px !important;font-weight:900 !important;background:linear-gradient(90deg,#fff 20%,#00E676) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}

/* BOTTOM NAV — ثابت */
.mainNav,.mainNav.glassSoft,.forceBottomNav{
  position:fixed !important;bottom:0 !important;left:0 !important;right:0 !important;
  z-index:999 !important;
  background:rgba(4,5,14,.97) !important;
  border-top:1px solid rgba(255,255,255,.07) !important;
  box-shadow:0 -1px 0 rgba(0,230,118,.08),inset 0 1px 0 rgba(255,255,255,.05) !important;
  backdrop-filter:blur(30px) !important;-webkit-backdrop-filter:blur(30px) !important;
}
.mainNav::before,.mainNav.glassSoft::before{content:'' !important;display:block !important;position:absolute !important;top:0 !important;left:0 !important;right:0 !important;height:1px !important;background:linear-gradient(90deg,transparent,#00E676,#00D4FF,#00E676,transparent) !important;opacity:.30 !important;}
.app,.iosSafeApp{padding-bottom:74px !important;}
.navBtn{font-family:'Tajawal',sans-serif !important;font-weight:800 !important;border-radius:13px !important;transition:all .2s !important;position:relative !important;}
.navBtn.active{background:linear-gradient(135deg,rgba(0,230,118,.14),rgba(0,184,92,.08)) !important;border:1px solid rgba(0,230,118,.22) !important;color:#00E676 !important;}
.navBtn .navIcon{transition:transform .2s !important;font-size:20px !important;}
.navBtn.active .navIcon{transform:scale(1.15) !important;}
.navBtn .navLabel{font-size:9px !important;font-weight:700 !important;color:#6270A0 !important;}
.navBtn.active .navLabel{color:#00E676 !important;}

/* GLASS */
.glass{background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.025)) !important;border:1px solid rgba(255,255,255,.12) !important;backdrop-filter:blur(28px) saturate(160%) !important;-webkit-backdrop-filter:blur(28px) saturate(160%) !important;box-shadow:0 20px 60px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.13) !important;}
.glassSoft{background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02)) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(22px) saturate(150%) !important;-webkit-backdrop-filter:blur(22px) saturate(150%) !important;box-shadow:0 14px 40px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.09) !important;}

/* HERO */
.mainHero:not(.hasCoverImage){background:linear-gradient(145deg,#040C1C,#081830 45%,#050D1E) !important;border:1px solid rgba(0,230,118,.20) !important;position:relative !important;overflow:hidden !important;}
.mainHero:not(.hasCoverImage)::before{content:'' !important;position:absolute !important;inset:0 !important;background:radial-gradient(ellipse at 82% 12%,rgba(0,230,118,.12),transparent 48%),radial-gradient(ellipse at 15% 80%,rgba(0,212,255,.07),transparent 48%) !important;pointer-events:none !important;}
.mainHero:not(.hasCoverImage)::after{content:'' !important;position:absolute !important;top:0 !important;left:0 !important;right:0 !important;height:2px !important;background:linear-gradient(90deg,transparent,#00E676,transparent) !important;animation:v4scan 3s ease-in-out infinite !important;opacity:.6 !important;}
.heroKicker{color:#00E676 !important;font-weight:900 !important;}
.heroKicker span{background:#00E676 !important;box-shadow:0 0 18px #00E676 !important;animation:v4liveDot 1.5s infinite !important;}
.mainHero h1{font-size:28px !important;font-weight:900 !important;background:linear-gradient(135deg,#fff 40%,#00E676) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;}

/* MEMBER CARDS */
.seasonMembersGrid,.listGrid{gap:11px !important;}
.seasonMemberCard{border-radius:20px !important;border:1px solid rgba(255,255,255,.07) !important;background:rgba(255,255,255,.032) !important;backdrop-filter:blur(10px) !important;box-shadow:0 4px 24px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08) !important;transition:transform .18s ease,border-color .2s !important;position:relative !important;overflow:hidden !important;animation:v4cardIn .3s ease both !important;}
.seasonMemberCard::before{content:'' !important;position:absolute !important;inset:0 !important;background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.05) 50%,transparent 80%) !important;animation:v4shine 4.5s ease-in-out infinite !important;pointer-events:none !important;}
.seasonMemberCard:active{transform:scale(.98) !important;}
.seasonMembersGrid>:first-child .seasonMemberCard,.listGrid>:first-child .seasonMemberCard{border-color:rgba(0,230,118,.30) !important;background:linear-gradient(135deg,rgba(0,230,118,.06),rgba(255,255,255,.02)) !important;animation:v4glow 3s ease-in-out infinite,v4cardIn .3s ease both !important;}
.seasonMembersGrid>:nth-child(2) .seasonMemberCard,.listGrid>:nth-child(2) .seasonMemberCard{border-color:rgba(0,230,118,.18) !important;}
.seasonMembersGrid>:nth-child(3) .seasonMemberCard,.listGrid>:nth-child(3) .seasonMemberCard{border-color:rgba(0,230,118,.12) !important;}
.seasonMembersGrid>:nth-child(2) .seasonMemberCard{animation-delay:.06s !important;}
.seasonMembersGrid>:nth-child(3) .seasonMemberCard{animation-delay:.12s !important;}
.seasonMembersGrid>:nth-child(4) .seasonMemberCard{animation-delay:.18s !important;}
.seasonMembersGrid>:nth-child(5) .seasonMemberCard{animation-delay:.24s !important;}
.seasonMembersGrid>:nth-child(6) .seasonMemberCard{animation-delay:.30s !important;}
.seasonMemberRank{background:rgba(0,230,118,.10) !important;border:1px solid rgba(0,230,118,.25) !important;color:#00E676 !important;font-weight:900 !important;font-size:13px !important;}
.seasonMemberCard em{background:linear-gradient(90deg,#00E676,#00FFB0,#00E676) !important;background-size:200% auto !important;color:#020617 !important;font-weight:900 !important;box-shadow:0 4px 14px rgba(0,230,118,.32) !important;animation:v4shimmer 2.5s linear infinite !important;border-radius:8px !important;padding:2px 8px !important;}

/* PROFILE CARD */
.profileCard{background:linear-gradient(145deg,rgba(4,8,20,.80),rgba(8,18,36,.60)) !important;border:1px solid rgba(0,230,118,.14) !important;backdrop-filter:blur(18px) !important;box-shadow:0 8px 36px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.09) !important;position:relative !important;overflow:hidden !important;animation:v4pgIn .35s ease both !important;}
.profileCard::before{content:'' !important;position:absolute !important;inset:0 !important;background:linear-gradient(115deg,transparent 25%,rgba(0,230,118,.03) 50%,transparent 75%) !important;animation:v4shine 5s ease-in-out infinite !important;pointer-events:none !important;}
.chips span{background:rgba(0,230,118,.10) !important;border:1px solid rgba(0,230,118,.25) !important;color:#d1fae5 !important;font-size:11px !important;font-weight:700 !important;}

/* STAT CARDS */
.statCard{background:rgba(255,255,255,.032) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:transform .18s,border-color .2s !important;animation:v4cardIn .3s ease both !important;}
.statCard:hover,.statCard:active{transform:scale(.97) !important;border-color:rgba(0,230,118,.20) !important;}
.statCard b{color:#ecfeff !important;font-size:17px !important;font-weight:900 !important;}
.statCard small{font-size:10px !important;color:#6270A0 !important;font-weight:700 !important;}

/* PLAYER CARDS & RATING */
.playerCard{background:rgba(2,6,23,.44) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:transform .18s,border-color .2s !important;animation:v4cardIn .3s ease both !important;}
.playerCard:hover{border-color:rgba(0,230,118,.18) !important;}
.playerMeta span{background:rgba(0,230,118,.10) !important;border-color:rgba(0,230,118,.25) !important;color:#86efac !important;}
.playerRating{background:linear-gradient(135deg,#00E676,#00B84C) !important;color:#020617 !important;font-weight:900 !important;box-shadow:0 4px 12px rgba(0,230,118,.32) !important;}

/* TABS */
.tabBtn{font-family:'Tajawal',sans-serif !important;font-weight:800 !important;height:38px !important;border-radius:20px !important;background:rgba(255,255,255,.032) !important;border:1px solid rgba(255,255,255,.07) !important;color:#9BA0C0 !important;font-size:12px !important;transition:all .18s !important;}
.tabBtn.active{background:linear-gradient(135deg,rgba(0,230,118,.14),rgba(0,184,92,.08)) !important;border-color:rgba(0,230,118,.25) !important;color:#00E676 !important;}

/* SECTION BOX */
.sectionBox{background:rgba(255,255,255,.022) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;animation:v4pgIn .35s ease both !important;}
.sectionHead h3{background:linear-gradient(135deg,#fff 50%,#00E676) !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;background-clip:text !important;font-size:15px !important;font-weight:900 !important;}

/* FINANCE */
.financeCard{background:rgba(2,6,23,.42) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;border-right:3px solid rgba(255,255,255,.07) !important;animation:v4cardIn .3s ease both !important;}
.financeCard.income{border-color:rgba(0,230,118,.30) !important;border-right-color:#00E676 !important;background:rgba(0,230,118,.04) !important;}
.financeCard.expense{border-color:rgba(255,71,87,.28) !important;border-right-color:#FF4757 !important;background:rgba(255,71,87,.04) !important;}

/* TRANSFER CARDS */
.transferCard{background:rgba(2,6,23,.42) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:transform .18s,border-color .2s !important;animation:v4cardIn .3s ease both !important;position:relative !important;overflow:hidden !important;}
.transferCard::before{content:'' !important;position:absolute !important;inset:0 !important;background:linear-gradient(135deg,rgba(255,255,255,.02),transparent) !important;pointer-events:none !important;}
.transferCard:hover{border-color:rgba(0,230,118,.18) !important;}
.transferRating{background:linear-gradient(135deg,#00E676,#00B84C) !important;color:#020617 !important;font-weight:900 !important;box-shadow:0 4px 12px rgba(0,230,118,.30) !important;}

/* RANKING CARDS */
.rankingCard{background:rgba(2,6,23,.42) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;border-radius:14px !important;transition:transform .18s !important;animation:v4cardIn .3s ease both !important;}
.rankingCard.first{border-color:rgba(0,230,118,.38) !important;background:linear-gradient(135deg,rgba(0,230,118,.08),rgba(2,6,23,.42)) !important;box-shadow:0 0 22px rgba(0,230,118,.10) !important;animation:v4glow 3s ease-in-out infinite,v4cardIn .3s ease both !important;}

/* TROPHY */
.trophyCard{background:rgba(2,6,23,.38) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;}
.trophyCard.won{background:linear-gradient(180deg,rgba(0,230,118,.10),rgba(255,255,255,.03)) !important;border-color:rgba(0,230,118,.38) !important;animation:v4glow 3s ease-in-out infinite !important;}
.trophyCard b{color:#00E676 !important;}
.trophyCard img,.trophyCard .trophyIcon{animation:v4bounce 2.5s ease-in-out infinite !important;}

/* CHAMPION & FINAL ROW */
.championRow{background:rgba(2,6,23,.42) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;}
.finalRow{background:rgba(2,6,23,.42) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:all .2s !important;}
.finalRow.win{border-color:rgba(0,230,118,.35) !important;background:rgba(0,230,118,.05) !important;}
.finalRow.loss{border-color:rgba(255,71,87,.32) !important;background:rgba(255,71,87,.04) !important;}
.finalRow em{color:#00E676 !important;font-weight:900 !important;}

/* STATS TABLE */
.statsTableHead{background:rgba(0,230,118,.06) !important;border:1px solid rgba(0,230,118,.12) !important;}
.statsTableRow{background:rgba(2,6,23,.38) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(6px) !important;transition:background .18s !important;}
.statsTableRow:hover{background:rgba(0,230,118,.04) !important;}
.statsTableRow i{background:linear-gradient(90deg,#00E676,#00D4FF) !important;}

/* COMPETITIONS */
.compactResultMatch{background:rgba(2,6,23,.42) !important;border-color:rgba(0,230,118,.14) !important;backdrop-filter:blur(8px) !important;}
.compactResultMatch.completed{background:rgba(0,230,118,.06) !important;border-color:rgba(0,230,118,.28) !important;}
.leagueTableHead{background:rgba(0,230,118,.06) !important;border:1px solid rgba(0,230,118,.14) !important;}
.leagueTableRow{background:rgba(2,6,23,.38) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(6px) !important;}
.worldCupGroupCard,.championsLeagueGroupCard{background:rgba(2,6,23,.50) !important;border-color:rgba(0,230,118,.14) !important;backdrop-filter:blur(10px) !important;}
.worldCupGroupCard h4,.championsLeagueGroupCard h4{color:#00E676 !important;}
.cupChampionBox{background:linear-gradient(135deg,rgba(0,230,118,.10),rgba(0,212,255,.06)) !important;border-color:rgba(0,230,118,.28) !important;animation:v4glow 3s ease-in-out infinite !important;}
.qualifierBracketRound{background:rgba(255,255,255,.032) !important;border-color:rgba(0,230,118,.12) !important;backdrop-filter:blur(8px) !important;}
.qualifierBracketRound h4{color:#00E676 !important;}

/* ARCHIVE & LINKS */
.archiveSeasonCard{border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:border-color .2s !important;animation:v4cardIn .3s ease both !important;}
.archiveSeasonCard:hover{border-color:rgba(0,230,118,.22) !important;}
.archiveSeasonCard em{background:linear-gradient(135deg,#00E676,#00B84C) !important;box-shadow:0 4px 14px rgba(0,230,118,.28) !important;}
.seasonTile{background:rgba(255,255,255,.032) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:transform .18s,border-color .2s !important;animation:v4cardIn .3s ease both !important;}
.seasonTile:hover{background:linear-gradient(180deg,rgba(0,230,118,.08),rgba(255,255,255,.03)) !important;border-color:rgba(0,230,118,.30) !important;transform:scale(.97) !important;}
.linkTile{background:rgba(255,255,255,.032) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(8px) !important;transition:border-color .2s,transform .18s !important;animation:v4cardIn .3s ease both !important;}
.linkTile:hover{border-color:rgba(0,230,118,.22) !important;transform:scale(.97) !important;}

/* NOTIFICATIONS */
.notificationItem{background:rgba(2,6,23,.44) !important;border-color:rgba(0,230,118,.13) !important;backdrop-filter:blur(8px) !important;border-radius:18px !important;animation:v4cardIn .3s ease both !important;}
.notificationItem.read{opacity:.62 !important;}

/* OFFER & MONEY */
.offerSegmented button.active{background:linear-gradient(135deg,#00E676,#00B84C) !important;}
.offerOwnPlayer.active{border-color:rgba(0,230,118,.50) !important;background:rgba(0,230,118,.12) !important;box-shadow:0 0 12px rgba(0,230,118,.14) !important;}
.offerSubmitBtn,.moneySubmitBtn{font-family:'Tajawal',sans-serif !important;font-weight:900 !important;box-shadow:0 8px 24px rgba(0,230,118,.22) !important;transition:all .2s !important;}
.offerSubmitBtn:hover,.moneySubmitBtn:hover{box-shadow:0 12px 32px rgba(0,230,118,.35) !important;transform:translateY(-1px) !important;}
.moneyField input,.moneyField select,.offerField input,.offerField select,.offerField textarea{font-family:'Tajawal',sans-serif !important;background:rgba(2,6,23,.65) !important;border-color:rgba(0,230,118,.14) !important;transition:border-color .2s,box-shadow .2s !important;}
.moneyField input:focus,.offerField input:focus,.offerField textarea:focus{border-color:rgba(0,230,118,.40) !important;box-shadow:0 0 0 3px rgba(0,230,118,.08) !important;outline:none !important;}
.loanedPlayerRow{background:rgba(2,6,23,.38) !important;border-color:rgba(255,255,255,.07) !important;backdrop-filter:blur(6px) !important;}
.loanedPlayerRow span{background:rgba(0,230,118,.10) !important;border-color:rgba(0,230,118,.25) !important;color:#86efac !important;}

/* INPUTS */
.sectionHead input{font-family:'Tajawal',sans-serif !important;background:rgba(2,6,23,.60) !important;border-color:rgba(0,230,118,.12) !important;transition:border-color .2s,box-shadow .2s !important;}
.sectionHead input:focus{border-color:rgba(0,230,118,.38) !important;box-shadow:0 0 0 3px rgba(0,230,118,.07) !important;outline:none !important;}

/* BACK & BUTTONS */
.backToMembersBtn{border-color:rgba(0,230,118,.18) !important;background:rgba(0,230,118,.05) !important;color:#00E676 !important;font-family:'Tajawal',sans-serif !important;font-weight:800 !important;transition:all .18s !important;}
.backToMembersBtn:hover{background:rgba(0,230,118,.10) !important;border-color:rgba(0,230,118,.30) !important;}
.memberActionPanel{border:1px solid rgba(0,230,118,.12) !important;background:rgba(2,6,23,.42) !important;backdrop-filter:blur(10px) !important;}
.memberActionPanel button{font-family:'Tajawal',sans-serif !important;font-weight:900 !important;box-shadow:0 8px 20px rgba(0,230,118,.20) !important;}
.sideDrawer>button{font-family:'Tajawal',sans-serif !important;font-weight:800 !important;border-color:rgba(0,230,118,.12) !important;background:rgba(0,230,118,.04) !important;transition:all .18s !important;}
.sideDrawer>button:hover{border-color:rgba(0,230,118,.24) !important;background:rgba(0,230,118,.08) !important;}

/* PAGE ANIMATIONS */
.widePage,.membersHome,.memberProfilePage{animation:v4pgIn .28s ease both !important;}

/* ═══ UNIFIED PAGE HEADERS — matches v4MLHead design ═══ */
header.pageHead{
  border-radius:22px !important;
  padding:16px 18px !important;
  margin-bottom:14px !important;
  background:linear-gradient(145deg,#040C1C,#081830) !important;
  border:1px solid rgba(0,230,118,.18) !important;
  position:relative !important;
  overflow:hidden !important;
  display:flex !important;
  flex-direction:column !important;
  align-items:flex-end !important;
  justify-content:center !important;
  gap:6px !important;
  text-align:right !important;
  min-height:110px !important;
  box-shadow:0 4px 24px rgba(0,0,0,.32),0 0 0 0 transparent !important;
}
header.pageHead::before{
  content:"" !important;
  position:absolute !important;
  top:0 !important;left:0 !important;right:0 !important;
  height:2px !important;
  background:linear-gradient(90deg,transparent 10%,#00E676 50%,transparent 90%) !important;
  pointer-events:none !important;
  animation:phScanLine 2.8s ease-in-out infinite !important;
}
header.pageHead::after{display:none !important;}
@keyframes phScanLine{
  0%   {transform:translateY(0);    opacity:0}
  14%  {opacity:.80}
  86%  {opacity:.80}
  100% {transform:translateY(108px);opacity:0}
}
header.pageHead h1,
header.pageHead h2,
header.pageHead h3{
  margin:0 !important;
  padding:0 !important;
  font-size:clamp(22px,6vw,32px) !important;
  font-weight:900 !important;
  line-height:1.12 !important;
  font-family:'Tajawal',sans-serif !important;
  text-align:right !important;
  width:100% !important;
  background:linear-gradient(135deg,#fff 40%,#00E676) !important;
  -webkit-background-clip:text !important;
  -webkit-text-fill-color:transparent !important;
  background-clip:text !important;
}
header.pageHead h1::after,
header.pageHead h2::after,
header.pageHead h3::after{display:none !important;content:none !important;}
header.pageHead p{
  margin:0 !important;
  font-size:11px !important;
  font-weight:700 !important;
  color:#9BA0C0 !important;
  text-align:right !important;
  width:100% !important;
  line-height:1.5 !important;
  -webkit-text-fill-color:#9BA0C0 !important;
}
header.pageHead img{display:none !important;}

/* ═══ SEASON HUB HERO — نفس تصميم pageHead ═══ */
.seasonHubHero{
  border-radius:22px !important;
  padding:16px 18px !important;
  margin-bottom:14px !important;
  background:linear-gradient(145deg,#040C1C,#081830) !important;
  border:1px solid rgba(0,230,118,.18) !important;
  position:relative !important;
  overflow:hidden !important;
  display:flex !important;
  flex-direction:row !important;
  align-items:center !important;
  justify-content:space-between !important;
  gap:12px !important;
  min-height:110px !important;
  box-shadow:0 4px 24px rgba(0,0,0,.32) !important;
  box-sizing:border-box !important;
  width:100% !important;
}
.seasonHubHero::before{
  content:"" !important;
  position:absolute !important;
  top:0 !important;left:0 !important;right:0 !important;
  height:2px !important;
  background:linear-gradient(90deg,transparent 10%,#00E676 50%,transparent 90%) !important;
  pointer-events:none !important;
  animation:phScanLine 2.8s ease-in-out infinite !important;
}
.seasonHubHero::after{display:none !important;}
.seasonHubHero h2{
  margin:0 0 4px !important;
  padding:0 !important;
  font-size:clamp(22px,6vw,32px) !important;
  font-weight:900 !important;
  line-height:1.12 !important;
  font-family:'Tajawal',sans-serif !important;
  text-align:right !important;
  background:linear-gradient(135deg,#fff 40%,#00E676) !important;
  -webkit-background-clip:text !important;
  -webkit-text-fill-color:transparent !important;
  background-clip:text !important;
}
.seasonHubHero h2::after{display:none !important;content:none !important;}
.seasonHubHero p{display:none !important;}
.seasonHubHero .heroKicker{
  font-size:10px !important;
  font-weight:900 !important;
  letter-spacing:2px !important;
  color:#9BA0C0 !important;
  display:block !important;
  margin-bottom:6px !important;
  -webkit-text-fill-color:#9BA0C0 !important;
}
.seasonHubHero > strong{
  width:56px !important;
  height:56px !important;
  min-width:56px !important;
  border-radius:18px !important;
  display:grid !important;
  place-items:center !important;
  font-size:28px !important;
  background:rgba(0,230,118,.10) !important;
  border:1px solid rgba(0,230,118,.20) !important;
  box-shadow:none !important;
  color:unset !important;
  -webkit-text-fill-color:unset !important;
}

@media(max-width:720px){
  header.pageHead{
    border-radius:18px !important;
    padding:14px 16px !important;
    min-height:98px !important;
    gap:5px !important;
  }
  header.pageHead h1,header.pageHead h2,header.pageHead h3{
    font-size:clamp(20px,5.5vw,26px) !important;
  }
  .seasonHubHero{
    border-radius:18px !important;
    padding:14px 16px !important;
    min-height:98px !important;
  }
  .seasonHubHero h2{
    font-size:clamp(20px,5.5vw,26px) !important;
  }
  .seasonHubHero > strong{
    width:48px !important;
    height:48px !important;
    min-width:48px !important;
    font-size:24px !important;
  }
}

/* MISC */
.empty{background:rgba(255,255,255,.032) !important;border:1px solid rgba(255,255,255,.07) !important;backdrop-filter:blur(6px) !important;}
.pushNotifyBox{background:rgba(255,255,255,.032) !important;border-color:rgba(255,255,255,.07) !important;}
.pushNotifyBox.active{border-color:rgba(0,230,118,.25) !important;background:rgba(0,230,118,.07) !important;animation:v4glow 3s ease-in-out infinite !important;}
.infoModal{font-family:'Tajawal',sans-serif !important;}
.infoRows div{background:rgba(255,255,255,.032) !important;border:1px solid rgba(255,255,255,.07) !important;border-radius:14px !important;}
.seasonTrophyChips button{border-color:rgba(0,230,118,.14) !important;background:rgba(0,230,118,.10) !important;transition:all .18s !important;}
.seasonTrophyChips button:hover{border-color:rgba(0,230,118,.30) !important;background:rgba(0,230,118,.15) !important;}
.seasonTrophyChips span{color:#00E676 !important;}
.loginCard,.loginContainer>div{background:linear-gradient(145deg,rgba(4,8,20,.92),rgba(8,18,36,.80)) !important;border:1px solid rgba(0,230,118,.18) !important;backdrop-filter:blur(24px) !important;box-shadow:0 0 60px rgba(0,230,118,.08),0 40px 80px rgba(0,0,0,.5) !important;}

::-webkit-scrollbar{width:3px !important;height:3px !important;}
::-webkit-scrollbar-thumb{background:rgba(0,230,118,.22) !important;border-radius:3px !important;}
::-webkit-scrollbar-track{background:transparent !important;}

/* EXPORT — لا تتأثر */
[class*="export"],[class*="Export"],.exportCanvas,.exportImage,.leagueExport,.cupExport,.superCupExport,.worldCupExport{font-family:Tahoma,Arial,sans-serif !important;animation:none !important;}

/* ═══════════════════════════════════════════════════════════
   UNIFIED DARK CARD THEME — Season · Archive · Stats · Links · Ranking
   ─────────────────────────────────────────────────────────── */

/* -- page wrappers ------------------------------------------ */
.widePage.glass{
  background:linear-gradient(150deg,rgba(2,6,18,.96),rgba(3,9,25,.94)) !important;
  border:1px solid rgba(0,230,118,.10) !important;
  box-shadow:0 8px 40px rgba(0,0,0,.44) !important;
  backdrop-filter:blur(20px) saturate(120%) !important;
  -webkit-backdrop-filter:blur(20px) saturate(120%) !important;
}

/* -- sectionBox --------------------------------------------- */
.sectionBox{
  background:linear-gradient(145deg,rgba(4,12,28,.82),rgba(6,15,34,.72)) !important;
  border:1px solid rgba(0,230,118,.13) !important;
  box-shadow:0 4px 18px rgba(0,0,0,.28) !important;
  backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
}

/* -- statCard ----------------------------------------------- */
.statCard,button.statCard{
  background:linear-gradient(145deg,rgba(4,12,28,.90),rgba(6,15,34,.84)) !important;
  border:1px solid rgba(0,230,118,.16) !important;
  box-shadow:0 4px 18px rgba(0,0,0,.28) !important;
  backdrop-filter:none !important;
}
.statCard b{color:#00E676 !important;}
.statCard small{color:#9BA0C0 !important;}
.statCard span{color:#9BA0C0 !important;}

/* -- trophyCard / seasonTile / linkTile --------------------- */
.trophyCard,.seasonTile,.linkTile{
  background:linear-gradient(145deg,#07122A,#0D1E42) !important;
  border:1px solid rgba(0,230,118,.20) !important;
  box-shadow:0 4px 16px rgba(0,0,0,.30) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .3s ease both !important;
  color:#EDF0FF !important;
}
.trophyCard:active,.seasonTile:active,.linkTile:active,
.trophyCard:hover,.seasonTile:hover,.linkTile:hover{
  background:linear-gradient(145deg,rgba(0,230,118,.10),#0D1E42) !important;
  border-color:rgba(0,230,118,.36) !important;
}
.trophyCard.won{
  background:linear-gradient(145deg,rgba(0,230,118,.12),#0D1E42) !important;
  border-color:rgba(0,230,118,.38) !important;
}
.trophyCard h4,.seasonTile b{color:#EDF0FF !important;}
.trophyCard b{color:#00E676 !important;}
.trophyCard span,.seasonTile span{color:#9BA0C0 !important;}

/* -- archiveSeasonCard -------------------------------------- */
.archiveSeasonCard{
  background:linear-gradient(145deg,rgba(4,12,28,.90),rgba(6,15,34,.82)) !important;
  border:1px solid rgba(0,230,118,.16) !important;
  box-shadow:0 4px 18px rgba(0,0,0,.30) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .3s ease both !important;
}
.archiveSeasonCard h3{color:#EDF0FF !important;}
.archiveSeasonCard p,.archiveSeasonCard small{color:#9BA0C0 !important;}
.archiveSeasonCard em{
  background:linear-gradient(135deg,#00E676,#00D4FF) !important;
  color:#02030A !important;
}

/* -- championRow / finalRow --------------------------------- */
.championRow,.finalRow{
  background:linear-gradient(145deg,rgba(4,12,28,.85),rgba(6,15,34,.75)) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  backdrop-filter:none !important;
}
.championRow:active,.finalRow:active{
  background:linear-gradient(145deg,rgba(0,230,118,.07),rgba(6,15,34,.80)) !important;
  border-color:rgba(0,230,118,.28) !important;
}
.championRow div{background:rgba(0,230,118,.05) !important;}
.championRow span,.finalRow small{color:#9BA0C0 !important;}
.championRow b,.finalRow b{color:#EDF0FF !important;}
.finalRow.win{border-color:rgba(34,197,94,.36) !important;}
.finalRow.loss{border-color:rgba(239,68,68,.36) !important;}
.finalRow em{color:#00E676 !important;}

/* -- rankingCard -------------------------------------------- */
.rankingCard{
  background:linear-gradient(145deg,rgba(4,12,28,.88),rgba(6,15,34,.80)) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}
.rankingCard.first{
  background:linear-gradient(135deg,rgba(0,230,118,.14),rgba(4,12,28,.90)) !important;
  border-color:rgba(0,230,118,.38) !important;
}
.rankingCard > span{color:#00E676 !important;}
.rankingCard p strong{color:#EDF0FF !important;}
.rankingCard small{color:#9BA0C0 !important;}

/* -- statsTableHead / statsTableRow ------------------------- */
.statsTableHead{
  background:rgba(0,230,118,.08) !important;
  border-radius:14px !important;
}
.statsTableRow{
  background:linear-gradient(145deg,rgba(4,12,28,.80),rgba(6,15,34,.72)) !important;
  border:1px solid rgba(0,230,118,.10) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}
.statsTableRow:active{border-color:rgba(0,230,118,.24) !important;}
.statsTableRow i{background:linear-gradient(90deg,#00E676,#00D4FF) !important;}

/* -- seasonSimpleRow ---------------------------------------- */
.seasonSimpleRow,.seasonSimpleRow.glassSoft{
  background:linear-gradient(145deg,rgba(4,12,28,.85),rgba(6,15,34,.75)) !important;
  border:1px solid rgba(0,230,118,.16) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}

/* -- tabs --------------------------------------------------- */
.tabBtn{
  background:rgba(4,12,28,.60) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  color:#9BA0C0 !important;
  backdrop-filter:none !important;
}
.tabBtn.active{
  background:linear-gradient(135deg,rgba(0,230,118,.20),rgba(0,212,255,.15)) !important;
  border-color:rgba(0,230,118,.38) !important;
  color:#EDF0FF !important;
}
.archiveModeTabs button,.seasonHubTabs button,.statsModeTabs button,.linksModeTabs button{
  background:rgba(4,12,28,.60) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  color:#9BA0C0 !important;
  backdrop-filter:none !important;
}
.archiveModeTabs button.active,.seasonHubTabs button.active,
.statsModeTabs button.active,.linksModeTabs button.active{
  background:linear-gradient(135deg,rgba(0,230,118,.20),rgba(0,212,255,.15)) !important;
  border-color:rgba(0,230,118,.38) !important;
  color:#EDF0FF !important;
}

/* -- notificationItem --------------------------------------- */
.notificationItem{
  background:linear-gradient(145deg,rgba(4,12,28,.78),rgba(6,15,34,.68)) !important;
  border:1px solid rgba(0,230,118,.10) !important;
  backdrop-filter:none !important;
}

/* -- أزرار التحميل والاستخراج ------------------------------- */
.imageActionRow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.imageActionRow button,.miniDownloadBtn{
  height:40px !important;
  padding:0 16px !important;
  border:1px solid rgba(0,230,118,.28) !important;
  border-radius:999px !important;
  background:rgba(0,230,118,.08) !important;
  color:#00E676 !important;
  font-weight:900 !important;
  font-size:12px !important;
  cursor:pointer !important;
  backdrop-filter:none !important;
  -webkit-text-fill-color:#00E676 !important;
  transition:background .18s,border-color .18s !important;
}
.imageActionRow button:active,.miniDownloadBtn:active{
  background:rgba(0,230,118,.16) !important;
  border-color:rgba(0,230,118,.45) !important;
}
.imageActionRow button:disabled{
  opacity:.38 !important;
  cursor:not-allowed !important;
  filter:grayscale(.5) !important;
}
.profileImageExportBtn{
  background:rgba(0,230,118,.08) !important;
  border:1px solid rgba(0,230,118,.28) !important;
  color:#00E676 !important;
  -webkit-text-fill-color:#00E676 !important;
  box-shadow:none !important;
}

/* -- sectionHead -------------------------------------------- */
.secDlBtn{width:34px;height:34px;flex-shrink:0;border-radius:999px;border:1px solid rgba(0,230,118,.22)!important;background:rgba(0,230,118,.06)!important;color:#00E676!important;-webkit-text-fill-color:#00E676!important;display:grid;place-items:center;cursor:pointer;font-size:16px;transition:background .15s}
.secDlBtn:active{background:rgba(0,230,118,.14)!important}

/* ── financeCard redesign ────────────────────────────── */
.financeCard{
  min-height:unset!important;
  padding:14px 16px!important;
  display:flex!important;
  flex-direction:column!important;
  gap:8px!important;
  grid-template-columns:unset!important;
}
/* هيدر الكارد: النوع + التاريخ */
.fcHeader{display:flex!important;align-items:baseline!important;justify-content:space-between!important;gap:10px!important}
.fcTitle{font-size:15px!important;font-weight:900!important;color:#EDF0FF!important;-webkit-text-fill-color:#EDF0FF!important}
.fcDate{font-size:11px!important;font-weight:700!important;color:#9BA0C0!important;-webkit-text-fill-color:#9BA0C0!important;flex-shrink:0!important}
/* المبلغ — مركزي وبارز */
.fcAmountWrap{text-align:center!important;padding:4px 0!important}
.fcAmount{font-size:clamp(26px,6vw,38px)!important;font-weight:900!important;direction:ltr!important;unicode-bidi:plaintext!important;line-height:1.1!important;display:inline-block!important}
.financeCard.income .fcAmount{color:#22c55e!important;-webkit-text-fill-color:#22c55e!important}
.financeCard.expense .fcAmount{color:rgba(239,68,68,.95)!important;-webkit-text-fill-color:rgba(239,68,68,.95)!important}
.financeCard.neutral .fcAmount{color:#EDF0FF!important;-webkit-text-fill-color:#EDF0FF!important}
/* ملاحظة — سطر أخير صغير */
.fcNote{display:flex!important;align-items:flex-start!important;gap:6px!important;padding:7px 10px!important;border-radius:10px!important;background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.08)!important}
.financeCard.income .fcNote{background:rgba(34,197,94,.07)!important;border-color:rgba(34,197,94,.18)!important}
.financeCard.expense .fcNote{background:rgba(239,68,68,.07)!important;border-color:rgba(239,68,68,.15)!important}
.fcNoteIcon{font-size:12px!important;flex-shrink:0!important;margin-top:1px!important}
.fcNoteText{margin:0!important;font-size:12px!important;font-weight:700!important;color:#C7CCE3!important;-webkit-text-fill-color:#C7CCE3!important;line-height:1.5!important;text-align:right!important;overflow:hidden!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important}

.sectionHead h3{color:#EDF0FF !important;}
.sectionHead p{color:#9BA0C0 !important;}

/* -- transferCard ------------------------------------------- */
.transferCard{
  background:linear-gradient(145deg,rgba(4,12,28,.90),rgba(6,15,34,.82)) !important;
  border:1px solid rgba(0,230,118,.16) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}
.transferCard:active{border-color:rgba(0,230,118,.30) !important;}
.transferMain h3{color:#EDF0FF !important;}
.transferMain p{color:#9BA0C0 !important;}
.transferBadges small{
  background:rgba(0,230,118,.07) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  color:#BDC5DE !important;
}

/* -- financeCard -------------------------------------------- */
.financeCard{
  background:linear-gradient(145deg,rgba(4,12,28,.88),rgba(6,15,34,.80)) !important;
  border:1px solid rgba(0,230,118,.12) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}
.financeCard.income{border-color:rgba(34,197,94,.32) !important;}
.financeCard.expense{border-color:rgba(239,68,68,.30) !important;}
.financeCard > b{color:#EDF0FF !important;}

/* -- playerCard -------------------------------------------- */
.playerCard{
  background:linear-gradient(145deg,rgba(4,12,28,.88),rgba(6,15,34,.80)) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .25s ease both !important;
}
.playerCard:active{border-color:rgba(0,230,118,.28) !important;}
.playerInfo h4{color:#EDF0FF !important;}
.playerMeta span{
  background:rgba(0,230,118,.08) !important;
  border-color:rgba(0,230,118,.18) !important;
  color:#a8f0cd !important;
}
.playerRating{
  background:linear-gradient(135deg,#00E676,#00D4FF) !important;
  color:#02030A !important;
  -webkit-text-fill-color:#02030A !important;
}

/* -- seasonMemberCard --------------------------------------- */
.seasonMemberCard{
  background:linear-gradient(145deg,rgba(4,12,28,.88),rgba(6,15,34,.80)) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  animation:v4cardIn .28s ease both !important;
}
.seasonMemberCard b{color:#EDF0FF !important;}
.seasonMemberCard small{color:#9BA0C0 !important;}
.seasonMemberCard em{
  background:linear-gradient(135deg,#00E676,#00D4FF) !important;
  color:#02030A !important;
  -webkit-text-fill-color:#02030A !important;
}
.seasonMemberRank{
  background:rgba(0,230,118,.08) !important;
  border-color:rgba(0,230,118,.20) !important;
  color:#00E676 !important;
  -webkit-text-fill-color:#00E676 !important;
}

/* -- incomingOfferCard -------------------------------------- */
.incomingOfferCard{
  background:linear-gradient(145deg,rgba(4,12,28,.88),rgba(6,15,34,.80)) !important;
  border:1px solid rgba(0,230,118,.14) !important;
  backdrop-filter:none !important;
  animation:v4cardIn .28s ease both !important;
}
.incomingOfferTop b{color:#EDF0FF !important;}
.incomingOfferMeta span{background:rgba(0,230,118,.05) !important;}
.incomingOfferMeta strong{color:#EDF0FF !important;}

/* -- glassSoft override (non-admin) ------------------------- */
.glassSoft:not(.adminForm):not(.adminRecentBox):not(.moneyTransferModal):not(.playerOfferModal){
  background:linear-gradient(145deg,rgba(4,12,28,.78),rgba(6,15,34,.68)) !important;
  border:1px solid rgba(0,230,118,.12) !important;
  backdrop-filter:none !important;
  -webkit-backdrop-filter:none !important;
}

@media(max-width:720px){
  .trophyCard,.seasonTile,.linkTile{animation-duration:.2s !important;}
  .archiveSeasonCard,.rankingCard,.statsTableRow{animation-duration:.2s !important;}
}


/* ===== FINANCE RTL RECORD FINAL FIX ===== */
.financeSectionBox,
.financeSectionBox *{
  direction:rtl !important;
}
.financeSectionHead{
  display:flex !important;
  align-items:flex-start !important;
  justify-content:space-between !important;
  gap:12px !important;
  text-align:right !important;
}
.financeSectionTitleBlock{
  min-width:0 !important;
  flex:1 1 auto !important;
  text-align:right !important;
}
.financeTitleRow{
  display:flex !important;
  flex-direction:row !important;
  align-items:center !important;
  justify-content:flex-start !important;
  gap:10px !important;
  width:100% !important;
  text-align:right !important;
}
.financeTitleRow h3{
  margin:0 !important;
  text-align:right !important;
  line-height:1.15 !important;
}
.financeTitleRow .financeDownloadBtn,
.financeDownloadBtn{
  width:auto !important;
  min-width:auto !important;
  height:32px !important;
  padding:0 12px !important;
  border-radius:999px !important;
  display:inline-flex !important;
  align-items:center !important;
  justify-content:center !important;
  font-size:11px !important;
  font-weight:900 !important;
  line-height:1 !important;
  white-space:nowrap !important;
  text-align:center !important;
}
.financeBalancePill{
  text-align:right !important;
  justify-items:end !important;
}
.financeBalancePill b{
  direction:ltr !important;
  unicode-bidi:plaintext !important;
}
.financeListGrid{
  gap:10px !important;
}
.financeCard{
  min-height:132px !important;
  padding:14px 16px !important;
  display:flex !important;
  flex-direction:column !important;
  align-items:stretch !important;
  justify-content:flex-start !important;
  gap:9px !important;
  text-align:right !important;
  grid-template-columns:unset !important;
  border-right:3px solid rgba(0,230,118,.18) !important;
}
.financeCard.income{border-right-color:#22c55e !important;}
.financeCard.expense{border-right-color:#ef4444 !important;}
.fcAmountWrap{
  order:1 !important;
  padding:0 !important;
  margin:0 !important;
  text-align:right !important;
  width:100% !important;
}
.fcAmount{
  display:block !important;
  width:100% !important;
  font-size:clamp(28px,6.8vw,38px) !important;
  font-weight:900 !important;
  line-height:1.05 !important;
  text-align:right !important;
  direction:ltr !important;
  unicode-bidi:plaintext !important;
}
.fcMetaRow{
  order:2 !important;
  display:flex !important;
  flex-direction:row !important;
  align-items:center !important;
  justify-content:space-between !important;
  gap:12px !important;
  width:100% !important;
  min-width:0 !important;
  text-align:right !important;
}
.fcTitle{
  min-width:0 !important;
  flex:1 1 auto !important;
  text-align:right !important;
  font-size:14px !important;
  font-weight:900 !important;
  color:#EDF0FF !important;
  -webkit-text-fill-color:#EDF0FF !important;
  white-space:nowrap !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
}
.fcDate{
  flex:0 0 auto !important;
  text-align:left !important;
  direction:ltr !important;
  unicode-bidi:plaintext !important;
  font-size:11px !important;
  font-weight:800 !important;
  color:#9BA0C0 !important;
  -webkit-text-fill-color:#9BA0C0 !important;
}
.fcNote{
  order:3 !important;
  display:block !important;
  width:100% !important;
  min-height:44px !important;
  padding:7px 10px !important;
  border-radius:12px !important;
  background:rgba(255,255,255,.045) !important;
  border:1px solid rgba(255,255,255,.075) !important;
  text-align:right !important;
}
.fcNoteIcon{
  display:none !important;
}
.fcNoteText{
  margin:0 !important;
  width:100% !important;
  font-size:12px !important;
  font-weight:700 !important;
  line-height:1.55 !important;
  color:#C7CCE3 !important;
  -webkit-text-fill-color:#C7CCE3 !important;
  text-align:right !important;
  direction:rtl !important;
  white-space:normal !important;
  overflow:hidden !important;
  display:-webkit-box !important;
  -webkit-line-clamp:2 !important;
  -webkit-box-orient:vertical !important;
}
@media(max-width:720px){
  .financeSectionHead{
    flex-direction:column !important;
    align-items:stretch !important;
  }
  .financeTitleRow{
    justify-content:flex-start !important;
  }
  .financeBalancePill{
    width:100% !important;
    display:flex !important;
    align-items:center !important;
    justify-content:space-between !important;
  }
  .financeCard{
    min-height:130px !important;
    padding:13px 14px !important;
  }
}


/* ═══ MOBILE APP LOCK — prevent iOS/Safari text selection and drag overlays ═══ */
html,
body,
#root,
.app,
.app *{
  -webkit-user-select:none !important;
  user-select:none !important;
  -webkit-touch-callout:none !important;
  -webkit-user-drag:none !important;
}

input,
textarea,
select,
[contenteditable="true"]{
  -webkit-user-select:text !important;
  user-select:text !important;
  -webkit-touch-callout:default !important;
}

img,
svg,
canvas,
.mainHero,
.seasonHubHero,
.pageHead,
.seasonMemberCard,
.memberProfilePage,
.profileCard,
.statCard,
.trophyCard,
.playerCard,
.transferCard,
.financeCard,
.competitionCard,
.competitionTypeCard,
.compactResultMatch,
.leagueTableRow,
.archiveSeasonCard,
.rankingCard,
.notificationItem,
.mainNav,
.navBtn{
  -webkit-user-drag:none !important;
  user-drag:none !important;
  -webkit-touch-callout:none !important;
}

button,
a,
.navBtn,
.tabBtn,
.offerSubmitBtn,
.moneySubmitBtn,
.backToMembersBtn{
  -webkit-tap-highlight-color:transparent !important;
  touch-action:manipulation !important;
}



/* CUP MANUAL MATCHUPS */
.cupManualMatchupsBox{
  margin:12px 0 !important;
  padding:12px !important;
  border-radius:18px !important;
  border:1px solid rgba(0,230,118,.14) !important;
  direction:rtl !important;
  text-align:right !important;
}
.cupPairingGrid{
  display:flex !important;
  flex-direction:column !important;
  gap:10px !important;
  margin-top:10px !important;
}
.cupPairingRow{
  display:grid !important;
  grid-template-columns:74px 1fr 1fr !important;
  gap:8px !important;
  align-items:end !important;
  direction:rtl !important;
  padding:10px !important;
  border-radius:16px !important;
  background:rgba(2,6,23,.42) !important;
  border:1px solid rgba(255,255,255,.07) !important;
}
.cupPairingRow>strong{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  min-height:42px !important;
  border-radius:12px !important;
  background:rgba(0,230,118,.09) !important;
  border:1px solid rgba(0,230,118,.20) !important;
  color:#00E676 !important;
  font-size:11px !important;
  font-weight:900 !important;
  text-align:center !important;
}
.cupPairingRow .moneyField{
  margin:0 !important;
}
.cupPairingRow select{
  text-align:right !important;
  direction:rtl !important;
}
@media (max-width:520px){
  .cupPairingRow{
    grid-template-columns:1fr !important;
  }
  .cupPairingRow>strong{
    justify-content:flex-end !important;
    padding:0 12px !important;
  }
}

/* LINKED CUP WITH TWO-GROUP LEAGUE */
.linkedCupPreviewBox{
  display:flex !important;
  flex-direction:column !important;
  gap:10px !important;
  margin-top:10px !important;
}
.linkedCupGroupPreview{
  width:100% !important;
  box-sizing:border-box !important;
  border:1px solid rgba(0,230,118,.14) !important;
  background:rgba(2,6,23,.42) !important;
  border-radius:16px !important;
  padding:12px !important;
  text-align:right !important;
  direction:rtl !important;
}
.linkedCupGroupPreview b{
  display:block !important;
  font-size:14px !important;
  color:#ecfeff !important;
  font-weight:900 !important;
  text-align:right !important;
}
.linkedCupGroupPreview small{
  display:block !important;
  margin-top:4px !important;
  color:#00E676 !important;
  font-size:11px !important;
  font-weight:800 !important;
  text-align:right !important;
}
.linkedCupGroupPreview p{
  margin:7px 0 0 !important;
  color:#9BA0C0 !important;
  font-size:12px !important;
  line-height:1.7 !important;
  text-align:right !important;
}
.leagueRuleNote.error{
  border-color:rgba(255,71,87,.28) !important;
  color:#fecaca !important;
  background:rgba(255,71,87,.06) !important;
}

`;
