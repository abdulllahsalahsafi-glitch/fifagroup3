import React from "react";

export function HomePage({
  config,
  rankedMembers = [],
  members = [],
  allTournaments = [],
  competitions = [],
  financeRows = [],
  currentMember,
  currentMemberId,
  totalForMember,
  transferPeriods = [],
  statsMap = {},
  goPage,
  setSelectedId,
  onOpenView,
  setFocusedCompetitionId,
  setArchiveDefaultMode,
  onOpenMember,
}) {
  // All competitions including completed
  const completedComps = competitions.filter(c =>
    c.status==="completed"||c.status==="finished"||c.status==="done"
  ).sort((a,b)=>{
    const da=new Date(b.endDate||b.date||0).getTime();
    const db=new Date(a.endDate||a.date||0).getTime();
    return da-db;
  }).slice(0,5);
  const SEASONS = [
    { id:"S1", label:"الموسم الاول",  years:"2017-2020", color:"#00D4FF" },
    { id:"S2", label:"الموسم الثاني", years:"2020-2021", color:"#A855F7" },
    { id:"S3", label:"الموسم الثالث", years:"2021-2023", color:"#FF6B35" },
    { id:"S4", label:"الموسم الرابع", years:"2023",      color:"#FFD700" },
    { id:"S5", label:"الموسم الخامس", years:"2024",      color:"#F472B6" },
    { id:"S6", label:"الموسم السادس", years:"2025-الآن", color:"#00E676", active:true },
  ];

  const [flippedCard, setFlippedCard] = React.useState(null);

  // All historical members (exclude FIFA system only)
  const historicalMembers = React.useMemo(() => {
    return members
      .filter(m => cleanId(m.id) && !isFifaSystemMember(m))
      .sort((a,b) => totalForMember(b.id) - totalForMember(a.id));
  }, [members, totalForMember]);

  const activeComps = competitions.filter(c => c.status==="active"||c.status==="inProgress"||c.status==="ongoing");
  const s6Tourns = allTournaments.filter(t => String(t.seasonId||t.season||"").includes("6")||String(t.seasonId||t.season||"").includes("2025"));
  const topSeasonMember = (rankedMembers || [])[0] || null;
  const topSeasonMemberName = topSeasonMember?.name || topSeasonMember?.memberName || "-";
  const appIcon = config.appIcon ? normalizeImageUrl(config.appIcon) : "";
  const openMemberFromHome = React.useCallback((memberId) => {
    if (typeof onOpenMember === "function") onOpenMember(memberId);
    else if (setSelectedId) {
      setSelectedId(memberId);
      goPage("members");
    }
  }, [onOpenMember, setSelectedId, goPage]);

  const allTransfers = React.useMemo(() => {
    const rows = [];
    (transferPeriods||[]).forEach(p => (p.rows||[]).forEach(r => rows.push(r)));
    return rows.slice().sort((a,b) => {
      const da = new Date(a.date||0).getTime();
      const db = new Date(b.date||0).getTime();
      return db - da;
    });
  }, [transferPeriods]);

  const getMemberStats = React.useCallback((memberId) => {
    const s = statsMap[cleanId(memberId)] || {};
    return {
      trophies: totalForMember(memberId),
      finals: s.finalsPlayed||0, wins: s.finalsWon||0,
      losses: s.finalsLost||0, goalsFor: s.finalGoalsFor||0,
      goalsAgainst: s.finalGoalsAgainst||0,
    };
  }, [statsMap, totalForMember]);

  // FIFA GROUP smart news feed — one source for news section and animated ticker
  const newsItems = React.useMemo(() => {
    const items = [];
    const now = Date.now();
    const today = new Date();
    const todayMD = String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");

    const compact = (value) => String(value || "").replace(/\s+/g, "").toLowerCase();
    const memberName = (memberId, fallback = "") => {
      const id = cleanId(memberId);
      const row = members.find((m) => same(m.id, id));
      return row?.name || fallback || id || "";
    };
    const dateValue = (value, fallback = 0) => {
      if (!value) return fallback;
      if (typeof value?.toDate === "function") return value.toDate().getTime();
      if (value?.seconds) return value.seconds * 1000;
      const parsed = new Date(value).getTime();
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const formatEdition = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      return raw.startsWith("#") ? raw : "النسخة " + raw;
    };
    const readableTrophyName = (row = {}) => {
      const name = row.name || row.trophyName || row.typeLabel || row.type || "بطولة";
      const edition = formatEdition(row.edition || row.version || "");
      return edition ? name + " " + edition : name;
    };
    const isWorldCup = (row = {}) => {
      const key = compact([row.name,row.trophyId,row.trophyName,row.type,row.typeLabel,row.competitionType].join(" "));
      return key.includes("كأسالعالم") || key.includes("كاسالعالم") || key.includes("worldcup") || key.includes("world_cup");
    };
    const finalScoreText = (row = {}) => {
      const g1 = toNumber(row.finalPlayer1Goals);
      const g2 = toNumber(row.finalPlayer2Goals);
      if (String(row.finalResult || "").trim()) return String(row.finalResult).trim();
      if ((g1 || g2) && (row.finalPlayer1Id || row.finalPlayer2Id)) return g1 + "-" + g2;
      return "";
    };
    const pushNews = (item) => {
      if (!item?.title) return;
      items.push({
        icon: item.icon || "📰",
        title: item.title,
        sub: item.sub || "",
        type: item.type || "news",
        date: item.date || "الآن",
        ts: Number.isFinite(item.ts) ? item.ts : now,
        nav: item.nav || null,
        priority: item.priority || 0,
      });
    };

    if (config.announcement) {
      pushNews({
        icon: "📢",
        title: config.announcement,
        sub: "إعلان رسمي من FIFA GROUP",
        type: "stat",
        date: "الآن",
        ts: now + 9000000,
        priority: 120,
      });
    }

    // New / live competitions
    activeComps.forEach((c, index) => {
      const createdTs = dateValue(c.createdAt || c.createdAtText || c.startDate || c.date, now - index);
      pushNews({
        icon: "🔴",
        title: "بطولة جديدة: " + (c.name || "بطولة نشطة"),
        sub: (c.typeLabel || c.type || "بطولة") + " ضمن " + (c.seasonId || "الموسم الحالي"),
        type: "competition",
        date: c.startDate || c.date || "الآن",
        ts: createdTs + 8000000,
        priority: 100,
        nav: () => { if(setFocusedCompetitionId) setFocusedCompetitionId(c.id || ""); goPage("season"); },
      });
    });

    // Completed Firebase competitions: champion / trophy count
    completedComps.forEach((c, index) => {
      const winnerId = cleanId(c.championMemberId || c.winnerId || "");
      const winner = c.championMemberName || memberName(winnerId, c.champion || c.championName || "");
      const count = winnerId ? totalForMember(winnerId) : 0;
      const endDate = c.completedDate || c.endDate || c.date || "";
      pushNews({
        icon: isWorldCup(c) ? "🌍" : "🏆",
        title: winner
          ? winner + " يتوج بلقب " + (c.name || "بطولة") + (count ? " ويصبح رصيده " + new Intl.NumberFormat("ar-SA").format(Math.round(count||0)) + " بطولة" : "")
          : "اكتملت " + (c.name || "بطولة"),
        sub: isWorldCup(c) ? "خبر خاص بكأس العالم" : (c.typeLabel || c.type || "بطولة مكتملة"),
        type: isWorldCup(c) ? "worldcup" : "competition",
        date: endDate || "الآن",
        ts: dateValue(endDate, now - index) + 7000000,
        priority: isWorldCup(c) ? 110 : 90,
        nav: () => { if(setFocusedCompetitionId) setFocusedCompetitionId(c.id || ""); goPage("season"); },
      });
    });

    // Latest season trophies from archive/sheets
    s6Tourns
      .filter((t) => cleanId(t.winnerId))
      .slice()
      .sort((a,b) => dateValue(b.date,0) - dateValue(a.date,0))
      .slice(0, 6)
      .forEach((t, index) => {
        const winner = memberName(t.winnerId);
        const count = totalForMember(t.winnerId);
        pushNews({
          icon: isWorldCup(t) ? "🌍" : "🏆",
          title: winner + " يفوز بـ" + readableTrophyName(t) + (count ? " ويصبح رصيده " + new Intl.NumberFormat("ar-SA").format(Math.round(count||0)) + " بطولة" : ""),
          sub: isWorldCup(t) ? "تتويج خاص في كأس العالم" : "تتويج جديد في الموسم",
          type: isWorldCup(t) ? "worldcup" : "competition",
          date: t.date || "",
          ts: dateValue(t.date,0) + 6000000 - index,
          priority: isWorldCup(t) ? 105 : 80,
          nav: () => goPage("archive"),
        });
      });

    // World Cup results only
    allTournaments
      .filter((t) => isWorldCup(t) && (t.finalResult || t.finalPlayer1Id || t.finalPlayer2Id))
      .slice()
      .sort((a,b) => dateValue(b.date,0) - dateValue(a.date,0))
      .slice(0, 4)
      .forEach((t, index) => {
        const p1 = memberName(t.finalPlayer1Id);
        const p2 = memberName(t.finalPlayer2Id);
        const score = finalScoreText(t);
        pushNews({
          icon: "🌍",
          title: "نتيجة كأس العالم: " + (score ? score + " — " : "") + readableTrophyName(t),
          sub: [p1, p2].filter(Boolean).join(" ضد ") || "نتيجة نهائية من كأس العالم",
          type: "worldcup",
          date: t.date || "",
          ts: dateValue(t.date,0) + 5000000 - index,
          priority: 85,
          nav: () => goPage("archive"),
        });
      });

    // "On this day": season starts and big final memories
    const seasonMilestones = [
      { date:"2017-10-01", title:"انطلاق الموسم الأول", sub:"بداية رحلة FIFA GROUP الرسمية." },
      { date:"2020-06-25", title:"انطلاق الموسم الثاني", sub:"مرحلة جديدة من المنافسة التاريخية." },
      { date:"2021-07-25", title:"انطلاق الموسم الثالث", sub:"واحد من أطول مواسم FIFA GROUP." },
      { date:"2023-05-05", title:"انطلاق الموسم الرابع", sub:"عودة بطولات الموسم بنظام جديد." },
      { date:"2024-11-22", title:"انطلاق الموسم الخامس", sub:"موسم قصير لكنه حاضر في السجل." },
      { date:"2025-02-14", title:"انطلاق الموسم السادس", sub:"الموسم النشط الحالي." },
    ];
    seasonMilestones.forEach((m) => {
      const d = new Date(m.date);
      const md = String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      if (md === todayMD) {
        pushNews({
          icon:"📅",
          title:"في مثل هذا اليوم: " + m.title,
          sub:m.sub,
          type:"memory",
          date:m.date,
          ts: now + 3000000,
          priority:70,
          nav: () => goPage("archive"),
        });
      }
    });

    allTournaments.forEach((t) => {
      const d = new Date(t.date || "");
      if (isNaN(d.getTime())) return;
      const md = String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
      if (md !== todayMD) return;
      const g1 = toNumber(t.finalPlayer1Goals);
      const g2 = toNumber(t.finalPlayer2Goals);
      const totalGoals = g1 + g2;
      const score = finalScoreText(t);
      if (totalGoals < 7 && !isWorldCup(t)) return;
      const p1 = memberName(t.finalPlayer1Id);
      const p2 = memberName(t.finalPlayer2Id);
      pushNews({
        icon:"📅",
        title:"في مثل هذا اليوم (" + d.getFullYear() + "): " + readableTrophyName(t),
        sub:(score ? score + " — " : "") + [p1,p2].filter(Boolean).join(" ضد "),
        type:isWorldCup(t) ? "worldcup" : "memory",
        date:t.date,
        ts:dateValue(t.date,0) + 2000000,
        priority:isWorldCup(t) ? 82 : 62,
        nav: () => goPage("archive"),
      });
    });

    // Big transfer deals only
    allTransfers.slice(0, 12).forEach((t, index) => {
      const player = t.player || t.playername || t.playerName || t.targetPlayerName || t.name || "";
      const from = t.from || t.frommember || t.fromMemberName || t.fromName || "";
      const to = t.to || t.tomember || t.toMemberName || t.toName || "";
      const amt = Math.max(0, toNumber(t.amount || t.price || t.value));
      const rawType = clean([t.type,t.contractType,t.dealType,t.note,t.notes].join(" "));
      const isLoan = rawType.includes("loan") || rawType.includes("اعار") || rawType.includes("إعار");
      const hasExchange = rawType.includes("exchange") || rawType.includes("swap") || rawType.includes("تبادل");
      const isHuge = amt >= 100000000;
      const isLarge = amt >= 80000000 || isLoan || hasExchange;
      if(!player || !isLarge) return;
      pushNews({
        icon:"💣",
        title:(isHuge ? "صفقة الموسم: " : "صفقة كبيرة: ") + (to ? to + " يتعاقد مع " : "") + player,
        sub:(from ? "من " + from : "") + (amt ? " مقابل " + formatMoney(amt) : "") + (isLoan ? " على سبيل الإعارة" : hasExchange ? " ضمن صفقة تبادل" : ""),
        type:"transfer",
        date:t.date || "",
        ts:dateValue(t.date,0) + 1000000 - index,
        priority:isHuge ? 75 : 60,
        nav: () => goPage("transfers"),
      });
    });

    if (!items.length) {
      pushNews({ icon:"⚽", title:"FIFA GROUP — السجل الرسمي", sub:"آخر الأخبار ستظهر هنا تلقائيًا.", type:"stat", date:"الآن", ts:now, priority:1 });
    }

    items.sort((a,b) => (b.priority - a.priority) || (b.ts - a.ts));
    const seen = new Set();
    return items.filter((item) => {
      const key = compact(item.title + "|" + item.sub);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0,10);
  }, [allTransfers, allTournaments, s6Tourns, activeComps, completedComps, config.announcement, members, totalForMember, goPage, setFocusedCompetitionId]);

  const tickerItems = React.useMemo(() => {
    const rows = newsItems.map((n) => n.icon + " " + n.title);
    const fallback = rows.length ? rows : ["⚽ FIFA GROUP — السجل الرسمي"];
    return [...fallback, ...fallback];
  }, [newsItems]);

  const fmt = n => new Intl.NumberFormat("ar-SA").format(Math.round(n||0));
  const seasonCount = sid => {
    const map = {S1:["1","2017","2018","2019"],S2:["2","2020","2021"],S3:["3","2021","2022","2023"],S4:["4","2023"],S5:["5","2024"],S6:["6","2025"]};
    const cnt = allTournaments.filter(t=>(map[sid]||[]).some(k=>String(t.seasonId||t.season||"").includes(k))).length;
    return cnt||{S1:153,S2:206,S3:203,S4:22,S5:6,S6:"?"}[sid];
  };

  const css = `
.hp2{padding:0;animation:hp2In .28s ease both}
@keyframes hp2In{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.hp2Hero{border-radius:24px;padding:18px 16px 16px;position:relative;overflow:hidden;margin-bottom:0;background:linear-gradient(145deg,#040C1C,#081830 45%,#050D1E);border:1px solid rgba(0,230,118,.22)}
.hp2Hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 80% 5%,rgba(0,230,118,.14),transparent 50%),radial-gradient(ellipse at 10% 90%,rgba(0,212,255,.07),transparent 50%)}
.hp2Scan{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00E676,transparent);animation:hp2sc 3s ease-in-out infinite;opacity:.65;pointer-events:none}
@keyframes hp2sc{0%,100%{top:0;opacity:0}50%{top:100%;opacity:.8}}
.hp2HeroTop{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.hp2HeroLogo{width:48px;height:48px;border-radius:14px;object-fit:contain;flex-shrink:0;box-shadow:0 0 20px rgba(0,230,118,.3)}
.hp2HeroLogoFb{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#00E676,#00B84C);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#020617;font-family:"Orbitron",sans-serif;flex-shrink:0;box-shadow:0 0 20px rgba(0,230,118,.3)}
.hp2HT{font-size:11px;font-weight:800;color:#00E676;letter-spacing:2px;margin-bottom:4px;display:flex;align-items:center;gap:6px}
.hp2HD{width:7px;height:7px;border-radius:50%;background:#00E676;animation:hp2dp 1.4s infinite;flex-shrink:0}
@keyframes hp2dp{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,230,118,.4)}50%{opacity:.5;box-shadow:0 0 0 5px transparent}}
.hp2HM{font-size:24px;font-weight:900;line-height:1.1;margin-bottom:12px;background:linear-gradient(135deg,#fff 40%,#00E676);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hp2HG{display:grid;grid-template-columns:repeat(3,1fr);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.05)}
.hp2HS{padding:10px 6px;text-align:center;background:rgba(0,0,0,.22);border-left:1px solid rgba(255,255,255,.05)}
.hp2HS:last-child{border-left:none}
.hp2HS .v{font-size:18px;font-weight:900;color:#00E676}
.hp2HS .l{font-size:9px;color:#6270A0;font-weight:700;margin-top:2px}
.hp2Ticker{height:30px;overflow:hidden;display:flex;align-items:center;background:linear-gradient(90deg,rgba(0,230,118,.08),rgba(0,212,255,.05),rgba(0,230,118,.08));border:1px solid rgba(0,230,118,.14);border-radius:14px;margin:10px 0 13px;position:relative}
.hp2Ticker::before,.hp2Ticker::after{content:"";position:absolute;top:0;bottom:0;width:28px;z-index:1}
.hp2Ticker::before{right:0;background:linear-gradient(to right,transparent,#02030A)}
.hp2Ticker::after{left:0;background:linear-gradient(to left,transparent,#02030A)}
.hp2TT{display:flex;white-space:nowrap;animation:hp2Tick 32s linear infinite}
@keyframes hp2Tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.hp2TI{font-size:11px;font-weight:700;color:#9BA0C0;padding:0 18px;flex-shrink:0}
.hp2Lbl{font-size:10px;font-weight:800;color:#6270A0;letter-spacing:2px;text-transform:uppercase;margin:16px 0 10px;display:flex;align-items:center;gap:8px}
.hp2Lbl::after{content:"";flex:1;height:1px;background:linear-gradient(to left,transparent,rgba(255,255,255,.07))}
.hp2CC{background:rgba(255,255,255,.032);border:1px solid rgba(0,230,118,.16);border-radius:20px;padding:13px;margin-bottom:9px;position:relative;overflow:hidden;cursor:pointer;transition:transform .18s;animation:hp2ci .3s ease both}
@keyframes hp2ci{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.hp2CC:active{transform:scale(.98)}
.hp2CC::before{content:"";position:absolute;top:0;right:0;width:80px;height:3px;background:linear-gradient(90deg,#00E676,#00D4FF)}
.hp2CL{display:inline-flex;align-items:center;gap:5px;margin-bottom:7px;background:rgba(0,230,118,.10);border:1px solid rgba(0,230,118,.20);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;color:#00E676}
.hp2LD{width:6px;height:6px;border-radius:50%;background:#00E676;animation:hp2dp 1.4s infinite;flex-shrink:0}
.hp2CN{font-size:15px;font-weight:900;margin-bottom:2px}
.hp2CM{font-size:11px;color:#9BA0C0}
.hp2CS{display:flex;gap:10px;overflow-x:auto;padding:4px 0 12px;scrollbar-width:none}
.hp2CS::-webkit-scrollbar{display:none}
.hp2FC{flex-shrink:0;width:130px;height:250px;cursor:pointer;position:relative}
.hp2FC-inner{position:relative;width:100%;height:100%;transition:transform .55s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d}
.hp2FC.flipped .hp2FC-inner{transform:rotateY(180deg)}
.hp2FF,.hp2FB{position:absolute;top:0;left:0;right:0;bottom:0;backface-visibility:hidden;border-radius:16px;overflow:hidden}
.hp2FB{transform:rotateY(180deg)}
.hp2FF{background:linear-gradient(145deg,#07122A,#0D1E42);border:1px solid rgba(0,230,118,.25);display:flex;flex-direction:column;align-items:center;padding:10px 9px 9px;position:relative}
.hp2FF::before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 20%,rgba(0,230,118,.05) 50%,transparent 80%);animation:hp2sh 4s ease-in-out infinite;pointer-events:none}
@keyframes hp2sh{0%,100%{transform:translateX(-100%) skewX(-15deg)}50%{transform:translateX(180%) skewX(-15deg)}}
.hp2FRank{font-size:11px;font-weight:900;color:#00E676;align-self:flex-start;background:rgba(0,230,118,.12);border:1px solid rgba(0,230,118,.25);border-radius:8px;padding:2px 7px;line-height:1.4}
.hp2AW{width:70px;height:70px;border-radius:50%;overflow:hidden;border:2px solid rgba(0,230,118,.35);margin:6px 0;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hp2AI{width:100%;height:100%;object-fit:cover}
.hp2AT{font-size:26px;font-weight:900;color:#00E676}
.hp2FN{font-size:11px;font-weight:900;color:#fff;text-align:center;margin-bottom:2px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hp2FCl{font-size:8.5px;color:rgba(255,255,255,.5);text-align:center;margin-bottom:5px}
.hp2FD{height:1px;background:linear-gradient(90deg,transparent,rgba(0,230,118,.25),transparent);width:90%;margin-bottom:5px}
.hp2FSt{display:grid;grid-template-columns:1fr 1fr;gap:2px;width:100%}
.hp2FSS{display:flex;align-items:center;gap:2px;padding:2px 0}
.hp2FSV{font-size:11px;font-weight:900;color:#fff;min-width:18px}
.hp2FSL{font-size:7.5px;font-weight:700;color:rgba(255,255,255,.55)}
.hp2FBC{background:linear-gradient(145deg,#050810,#081224);border:1px solid rgba(0,230,118,.18);height:100%;border-radius:16px;padding:11px 9px;display:flex;flex-direction:column;gap:5px}
.hp2FBT{font-size:10px;font-weight:800;color:#00E676;text-align:center;letter-spacing:.5px;margin-bottom:4px}
.hp2FBS{display:flex;align-items:center;gap:5px}
.hp2FBL{font-size:9px;color:#9BA0C0;font-weight:700;width:32px;text-align:right}
.hp2FBB{flex:1;height:5px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.hp2FBF{height:100%;border-radius:3px}
.hp2FBV{font-size:10px;font-weight:900;color:#EDF0FF;min-width:20px;text-align:left}

.hp2SeasGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:4px}
.hp2SCard{border-radius:20px;padding:16px 14px;position:relative;overflow:hidden;cursor:pointer;border:1px solid;transition:transform .2s;animation:hp2ci .3s ease both}
.hp2SCard:active{transform:scale(.97)}
.hp2SCard::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.05),transparent);pointer-events:none}
.hp2SCardAct{position:absolute;top:10px;left:10px;font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;border:1px solid}
.hp2SCardID{font-size:10px;font-weight:800;letter-spacing:1.5px;margin-bottom:4px;opacity:.7}
.hp2SCardName{font-size:14px;font-weight:900;margin-bottom:2px}
.hp2SCardYears{font-size:10px;color:#9BA0C0;margin-bottom:10px}
.hp2SCardCount{font-size:28px;font-weight:900;line-height:1}
.hp2SCardLabel{font-size:9px;color:#9BA0C0;margin-top:2px}
.hp2NewsRow{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.07);border-radius:14px;margin-bottom:7px;position:relative;overflow:hidden}
.hp2NewsRow.transfer{border-right:3px solid #00D4FF}
.hp2NewsRow.final{border-right:3px solid #FFD700}
.hp2NewsRow.memory{border-right:3px solid #FFD700}
.hp2NewsRow.worldcup{border-right:3px solid #FFD700;background:linear-gradient(135deg,rgba(255,215,0,.055),rgba(255,255,255,.026))}
.hp2NewsRow.competition{border-right:3px solid #00E676}
.hp2NewsRow.news{border-right:3px solid #00E676}
.hp2NewsRow.stat{border-right:3px solid #A855F7}
.hp2NewsRowIcon{font-size:16px;flex-shrink:0;width:28px;text-align:center}
.hp2NewsRowBody{flex:1;min-width:0}
.hp2NewsRowTitle{font-size:12px;font-weight:850;color:#EDF0FF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
.hp2NewsRowSub{font-size:10.5px;color:#9BA0C0;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.35}
.hp2NewsRowDate{font-size:9.5px;color:#6270A0;margin-top:2px;direction:ltr;text-align:right}
  `;

  const stColor = v => v>=85?"linear-gradient(90deg,#00E676,#00FFB0)":v>=60?"linear-gradient(90deg,#00D4FF,#00A8CC)":v>=35?"linear-gradient(90deg,#FF6B35,#FF9F43)":"linear-gradient(90deg,#FF4757,#FF6B6B)";

  const maxStats = React.useMemo(()=>{
    let mT=1,mF=1,mW=1,mG=1,mGA=1;
    historicalMembers.forEach(m=>{
      const s=getMemberStats(m.id);
      if(s.trophies>mT) mT=s.trophies;
      if(s.finals>mF)   mF=s.finals;
      if(s.wins>mW)     mW=s.wins;
      if(s.goalsFor>mG) mG=s.goalsFor;
      if(s.goalsAgainst>mGA) mGA=s.goalsAgainst;
    });
    return {mT,mF,mW,mG,mGA};
  },[historicalMembers,getMemberStats]);

  function renderNewsRows(items) {
    const fmtDate = d => {
      if(!d||d==="الآن") return "الآن";
      try {
        const dt = new Date(d);
        if(isNaN(dt.getTime())) return d;
        const day = dt.getDate();
        const month = dt.getMonth()+1;
        const year = dt.getFullYear();
        return year+"/"+month+"/"+day;
      } catch { return d; }
    };
    return items.slice(0,10).map((n,i)=>
      React.createElement("div", {
        key:i,
        className:"hp2NewsRow "+n.type,
        onClick: n.nav || undefined,
        role: n.nav ? "button" : undefined,
      },
        React.createElement("div", {className:"hp2NewsRowIcon"}, n.icon),
        React.createElement("div", {className:"hp2NewsRowBody"},
          React.createElement("div", {className:"hp2NewsRowTitle"}, n.title),
          n.sub && React.createElement("div", {className:"hp2NewsRowSub"}, n.sub),
          React.createElement("div", {className:"hp2NewsRowDate"}, fmtDate(n.date))
        )
      )
    );
  }

  return (
    React.createElement("div", {className:"widePage hp2"},
      React.createElement("style", null, css),

      // HERO with FG logo
      React.createElement("div", {className:"hp2Hero"},
        React.createElement("div", {className:"hp2Scan"}),
        React.createElement("div", {className:"hp2HeroTop"},
          React.createElement("div", null,
            React.createElement("div", {className:"hp2HT"},
              React.createElement("span", {className:"hp2HD"}),
              (config.seasonName||"الموسم السادس")+" "+String.fromCharCode(183)+" "+new Date().getFullYear()
            ),
            React.createElement("div", {className:"hp2HM"}, config.seasonTitle||"الموسم السادس 2025")
          ),
          appIcon
            ? React.createElement("img", {className:"hp2HeroLogo",src:appIcon,alt:"FG"})
            : React.createElement("div", {className:"hp2HeroLogoFb"}, "FG")
        ),
        React.createElement("div", {className:"hp2HG"},
          [
            {v:rankedMembers.length, l:"👥 نشطون"},
            {v:s6Tourns.length||"?", l:"🏆 بطولة"},
            {v:topSeasonMemberName, l:"🏅 متصدر التصنيف"},
          ].map((s,i)=>
            React.createElement("div", {key:i,className:"hp2HS"},
              React.createElement("div", {className:"v"}, s.v),
              React.createElement("div", {className:"l"}, s.l)
            )
          )
        )
      ),

      // TICKER — synced with the same last 10 news items
      React.createElement("div", {className:"hp2Ticker"},
        React.createElement("div", {className:"hp2TT"},
          tickerItems.map((t,i)=>
            React.createElement("span", {key:i,className:"hp2TI"},
              t," ",React.createElement("span",{style:{color:"rgba(0,230,118,.4)"}},String.fromCharCode(9670))," "
            )
          )
        )
      ),

      rankedMembers.length>0 && React.createElement(ActiveSeasonMembersPanel, {
        members: rankedMembers,
        financeRows,
        config,
        totalForMember,
        onOpenMember: openMemberFromHome,
        title: "الأعضاء النشطون في الموسم السادس",
        subtitle: "واجهة سريعة لفتح بروفايل أي عضو نشط بدون الدخول إلى تبويب الأعضاء القديم.",
      }),

      // ACTIVE COMPETITIONS — above historical cards
      activeComps.length>0 && React.createElement(React.Fragment, null,
        React.createElement("div", {className:"hp2Lbl"}, "🔴 بطولات نشطة الآن"),
        activeComps.slice(0,3).map((c,i)=>
          React.createElement("div", {key:i,className:"hp2CC",onClick:()=>{ if(setFocusedCompetitionId) setFocusedCompetitionId(c.id||""); goPage("season"); }},
            React.createElement("div", {className:"hp2CL"},
              React.createElement("span",{className:"hp2LD"}),
              "مباشر"
            ),
            React.createElement("div", {className:"hp2CN"}, c.name||"بطولة"),
            React.createElement("div", {className:"hp2CM"}, (c.typeLabel||c.type||"")+" "+String.fromCharCode(183)+" "+(c.seasonId||"S6"))
          )
        )
      ),

      // HISTORICAL MEMBER CARDS
      false && historicalMembers.length>0 && React.createElement(React.Fragment, null,
        React.createElement("div", {className:"hp2Lbl"}, String.fromCharCode(9733)+" الأعضاء التاريخيون"),
        React.createElement("div", {className:"hp2CS"},
          historicalMembers.map((m,i)=>{
            const st = getMemberStats(m.id);
            const rank = i+1;
            const isFlipped = flippedCard===(m.id||i);
            const {mT,mF,mW,mG,mGA} = maxStats;
            const frontStats = [
              ["ألقاب",st.trophies],["نهائي",st.finals],
              ["فوز",st.wins],["هدف",st.goalsFor],
              ["تلقى",st.goalsAgainst],["خسر",st.losses],
            ];
            const backStats = [
              {l:"ألقاب",v:st.trophies,max:mT},{l:"نهائي",v:st.finals,max:mF},
              {l:"فوز",v:st.wins,max:mW},{l:"هدف",v:st.goalsFor,max:mG},
              {l:"تلقى",v:st.goalsAgainst,max:mGA},
              {l:"خسر",v:st.losses,max:Math.max(1,...historicalMembers.map(x=>getMemberStats(x.id).losses))},
            ];
            const imgSrc = m.avatar||m.image||m.photo||"";
            return React.createElement("div", {
              key:m.id||i,
              className:"hp2FC"+(isFlipped?" flipped":""),
              onClick:()=>setFlippedCard(isFlipped?null:(m.id||i)),
            },
              React.createElement("div", {className:"hp2FC-inner"},
                React.createElement("div", {className:"hp2FF"},
                  React.createElement("div", {className:"hp2FRank"}, "#"+rank),
                  React.createElement("div", {className:"hp2AW"},
                    imgSrc
                      ? React.createElement("img",{className:"hp2AI",src:imgSrc,alt:"",onError:e=>{e.target.style.display="none"}})
                      : React.createElement("div",{className:"hp2AT"},String(m.name||"").charAt(0))
                  ),
                  React.createElement("div", {className:"hp2FN"}, m.name),
                  React.createElement("div", {className:"hp2FCl"}, m.team||m.nationalteam||"FIFA GROUP"),
                  React.createElement("div", {className:"hp2FD"}),
                  React.createElement("div", {className:"hp2FSt"},
                    frontStats.map(([l,v])=>
                      React.createElement("div",{key:l,className:"hp2FSS"},
                        React.createElement("div",{className:"hp2FSV"},v),
                        React.createElement("div",{className:"hp2FSL"},l)
                      )
                    )
                  )
                ),
                React.createElement("div", {className:"hp2FB"},
                  React.createElement("div", {className:"hp2FBC"},
                    React.createElement("div", {className:"hp2FBT"}, m.name),
                    backStats.map(s=>{
                      const pct = s.max>0?Math.round((s.v/s.max)*100):0;
                      return React.createElement("div",{key:s.l,className:"hp2FBS"},
                        React.createElement("div",{className:"hp2FBL"},s.l),
                        React.createElement("div",{className:"hp2FBB"},
                          React.createElement("div",{className:"hp2FBF",style:{width:pct+"%",background:stColor(pct)}})
                        ),
                        React.createElement("div",{className:"hp2FBV"},s.v)
                      );
                    }),
        null
                  )
                )
              )
            );
          })
        )
      ),

      // SEASONS GRID
      React.createElement("div", {className:"hp2Lbl"}, String.fromCharCode(9200)+" المواسم التاريخية"),
      React.createElement("div", {className:"hp2SeasGrid"},
        SEASONS.map(s=>{
          const cnt = seasonCount(s.id);
          return React.createElement("div", {
            key:s.id,
            className:"hp2SCard",
            style:{
              borderColor:s.color+"25",
              background:s.color+"07",
            },
            onClick:()=>{ if(setArchiveDefaultMode) setArchiveDefaultMode("season"); goPage("archive"); },
          },
            s.active&&React.createElement("div",{
              className:"hp2SCardAct",
              style:{background:s.color+"15",borderColor:s.color+"30",color:s.color}
            },"نشط"),
            React.createElement("div",{className:"hp2SCardID",style:{color:s.color}},s.id),
            React.createElement("div",{className:"hp2SCardName"},s.label),
            React.createElement("div",{className:"hp2SCardYears"},s.years),
            React.createElement("div",{className:"hp2SCardCount",style:{color:s.color}},cnt),
            React.createElement("div",{className:"hp2SCardLabel"},"بطولة")
          );
        })
      ),

      // NEWS — single column rows, 10 max
      newsItems.length>0 && React.createElement(React.Fragment, null,
        React.createElement("div",{className:"hp2Lbl"},String.fromCharCode(128240)+" آخر الأخبار"),
        React.createElement("div",null, renderNewsRows(newsItems))
      ),

      React.createElement("div",{style:{height:16}})
    )
  );
}
