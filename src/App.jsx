//import { fifaTheme } from "./fifaTheme";//
import { v3OverrideCss } from "./v3Override";
import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { auth, db } from "./firebase";
import { enableFifaPushNotifications, syncFifaPushTokenIfAllowed, listenToForegroundPushMessages } from "./pushNotifications";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
const LoginPage = lazy(() => import("./components/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const HomePageLazy = lazy(() => import("./components/pages/HomePage").then(m => ({ default: m.HomePage })));
const MembersPageLazy = lazy(() => import("./components/pages/MembersPage").then(m => ({ default: m.MembersPage })));
const MyProfilePageLazy = lazy(() => import("./components/pages/MyProfilePage").then(m => ({ default: m.MyProfilePage })));
const SeasonCenterPageLazy = lazy(() => import("./components/pages/SeasonCenterPage").then(m => ({ default: m.SeasonCenterPage })));
const SeasonHubPageLazy = lazy(() => import("./components/pages/SeasonHubPage").then(m => ({ default: m.SeasonHubPage })));
const LeagueViewerPageLazy = lazy(() => import("./components/pages/LeagueViewerPage").then(m => ({ default: m.LeagueViewerPage })));
const ArchivePageLazy = lazy(() => import("./components/pages/ArchivePage").then(m => ({ default: m.ArchivePage })));
const RankingPageLazy = lazy(() => import("./components/pages/RankingPage").then(m => ({ default: m.RankingPage })));
const GeneralStatsPageLazy = lazy(() => import("./components/pages/GeneralStatsPage").then(m => ({ default: m.GeneralStatsPage })));
const TransfersPageLazy = lazy(() => import("./components/pages/TransfersPage").then(m => ({ default: m.TransfersPage })));
const LinksPageLazy = lazy(() => import("./components/pages/LinksPage").then(m => ({ default: m.LinksPage })));
const FifaStudioPageLazy = lazy(() => import("./components/pages/FifaStudioPage").then(m => ({ default: m.FifaStudioPage })));
const FifaAdminPageLazy = lazy(() => import("./components/pages/FifaAdminPage").then(m => ({ default: m.FifaAdminPage })));
const FifaLeagueAdminPageLazy = lazy(() => import("./components/pages/FifaLeagueAdminPage").then(m => ({ default: m.FifaLeagueAdminPage })));
const DetailPageLazy = lazy(() => import("./components/common/DetailPage").then(m => ({ default: m.DetailPage })));
import { AuthMiniBadge } from "./components/auth/AuthMiniBadge";
import { formatTransferDate, usernameKey, usernameToFirebaseEmail, firebaseAuthMessage } from "./utils/authUtils";
import finalMinorSafeCss from "./styles/final-fixes.css?inline";
import moneyCss from "./styles/money-transfer.css?inline";
import dealCss from "./styles/deal-contract.css?inline";
import leagueAdminCss from "./styles/league-admin.css?inline";
import authCss from "./styles/auth.css?inline";
import { TopSystemBar } from "./components/layout/TopSystemBar";
import { BottomNav } from "./components/layout/BottomNav";
import { SideMenu } from "./components/layout/SideMenu";
import { InfoModal } from "./components/common/InfoModal";
import { SystemScreen } from "./components/common/SystemScreen";
import { NotificationsModal } from "./components/common/NotificationsModal";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import css from "./styles/main.css?inline";
import { stripIcon, clean, cleanId, same, toNumber, isEnabled, formatMoney, normalizeDigits, toLatinDigits, formatLatinNumber, toCssSize, normalizeKey, removeBom, hasRecord, unique, dateValue, normalizeDate, seasonNumber, linkIcon } from "./utils/helpers";
import { competitionTypeKey, competitionTypeLabel, isKnockoutCompetitionType, isLeagueGroupsCompetition, isLinkedLeagueGroupsCup, competitionDefaultIcon, competitionStatusLabel, uniqueCleanIds, getCompetitionExcludedMemberIds, isCompetitionExcludedMember, isCompetitionExcludedMatch, filterCompetitionParticipantsForCalculation, filterCompetitionMatchesForCalculation, matchInvolvesMember, isWaitingCompetitionMatch, isGroupOrLeagueStageMatch, competitionAbsenceInfoForMember, getApprovedCompetitionChampionName, compareLeagueStanding, leagueStandingTieKey, annotateLeagueStandings, computeLeagueStandings, generateLeagueRoundRobinMatches, assignLeagueGamePlatforms, applyCompetitionGameMode, generateLeagueQualifierMatches, groupLetterName, shuffleRows, distributeSeedPotsToGroups, buildBalancedGroupMatchPairs, generateWorldCupMatches, linkedCupGroupIsReady, worldCupGroupStageReady, worldCupGroupRows, computeWorldCupQualifiedRows, computeWorldCupQualifiedIds, worldCupQualifierTokenMap, matchLoserInfo, resolveWorldCupDependencies, getWorldCupThirdPlace, championsLeagueGroupLetterName, generateChampionsLeagueMatches, generateLeagueTwoGroupsMatches, championsLeagueGroupStageReady, championsLeagueGroupRows, computeChampionsLeagueQualifiedRows, computeChampionsLeagueQualifiedIds, championsLeagueQualifierTokenMap, resolveChampionsLeagueDependencies, knockoutBracketSizeForCount, normalizeCupManualPairings, validateCupManualPairings, buildManualKnockoutBracketSlots, buildSeededBracketSlots, generateSeededKnockoutBracketMatches, roundLabelForBracket, matchShortLabel, resolveKnockoutBracketDependencies, resolveLeagueQualifierDependencies, computeKnockoutQualifiedIds, computeLeagueQualifierQualifiedIds, getKnockoutChampion, getKnockoutRewardRows, getLeagueQualifierChampion, getCompetitionChampionInfo, isCompetitionCompleted, competitionMatchSortValue, sortedCompetitionMatchesForSchedule, scheduleStageTitleForMatch, linkedCupGroupNumber, linkedCupRankText, linkedCupRankSlot, buildLinkedCupGroupPath, mergeLinkedCupGeneratedMatches, generateLinkedLeagueGroupsCupPlan, buildLinkedLeagueCupDisplayCompetition, getLinkedLeagueCupParticipantRows, leagueTwoGroupsAdminRoundTitle, worldCupAdminRoundTitle, championsLeagueAdminRoundTitle, normalizeCompetitionRewards, rewardRankLabel, groupLeagueMatchesByRound, competitionTrophyLookupKeys, competitionLogoFromTrophyMap, competitionLogoFromConfig, competitionLogoUrl, competitionTimeValue, worldCupKnockoutColumns, championsLeagueKnockoutColumns, embeddedQualifierCompetitionForDisplay, buildCompetitionStats } from "./services/competitions";
import { isFifaAdminMoneyTransfer, isCorrectionMoneyTransfer, hasMoneyTransferCorrection, adminDecisionTimeValue, adminMoneyTransferLabel, buildAdminTransferRestrictionPayload, isTransferRestrictionActive, getActiveMemberRestrictions, getBlockingTransferRestriction, transferActionArabic, transferRestrictionShortText, transferRestrictionBlockMessage, formatRestrictionNotificationBody, normalizeExchangeContractType, normalizeExchangeLoanDuration, exchangeContractLabel, normalizeOfferExchangeClauseForSave, isPlayerReleasedByContracts, isActivePlayerOfferStatus, isBlockingOwnPlayerOfferStatus, isBlockingOwnPlayerOfferStillValid, isAcceptedOrCompletedPlayerOffer, isFinanciallyReservedPlayerOffer, isTerminalPlayerOfferStatus, playerOfferStatusMessage, isOfferExpired, isSeasonCenterActiveOffer, addDays, localDateKey, transferWindowStatusLabel, rowBelongsToTransferWindow, computeTransferWindowStats, isTransferMarketOpen, normalizeFirebaseTransferRows, mergeTransferPeriods, getTransferWindowForDate, getTransferWindowNameForDate, getTransferWindowIdForDate, getTransferPeriods, isFreeAgentPlayer, isFreeOriginContract, isFreeAgentPoolContract, getFreeAgentSlotOwnerIdFromContract, hasEverUsedFreeAgentSlot, normalizeOfferAsTransferContractRow, getTransferContractParties, hasFreeAgentRegistrationRecord, hasAnyFreeAgentRegistrationForMember, getRosterKindCode, getRosterPlayerKindFromContract, getPlayerRosterKindLabel, getFinanceMemberId, getFinanceFromMemberId, getFinanceToMemberId, isFinanceTransfer, getMemberFinanceRows, getFinanceRawAmount, parseFinanceAmount, getFinanceDirection, getFinanceSignedAmount, computeMemberBalance, financeDirectionLabel, getFinanceDisplayTitle, getFinanceRecordDate, getFinanceRecordNote, financeTypeClass, transferTypeClass, transferRowTimeValue, transferStatusLabel, effectiveTransferStatusLabel, formatContractIssuedAt, transferTypeDisplayLabel } from "./services/finance";

const DEFAULT_CONFIG = {
  mainTitle: "FIFA GROUP",
  seasonName: "الموسم السادس",
  seasonTitle: "الموسم السادس 2025",
  membersTitle: "الأعضاء",
  seasonTournamentsTitle: "بطولات الموسم",
  transfersTitle: "انتقالات الموسم",
  rankingTitle: "تصنيف الموسم",
  linksTitle: "روابط هامة",
  playersTitle: "قائمة اللاعبين",
  trophiesTitle: "البطولات",
  financeTitle: "السجل المالي",
  archiveTitle: "السجل العام للبطولات",
  statsTitle: "الإحصائيات العامة",
  transfersSubtitle: "تظهر الفترات تلقائيًا من Google Sheets، ويمكنك إضافة فترة جديدة بدون تعديل الكود.",
  rankingSubtitle: "تصنيف الموسم النشط محسوب تلقائيًا من سجل البطولات.",
  linksSubtitle: "روابط النظام والسجلات والصفحات المهمة.",
  searchPlaceholder: "ابحث عن لاعب أو مركز أو عقد...",
  loadingTitle: "",
  loadingSubtitle: "",
  noDataTitle: "حاول مجددًا",
  errorTitle: "حدث خطأ في تحميل البيانات",
  appStatus: "active",
  maintenanceMessage: "التطبيق تحت الصيانة مؤقتًا",
  showFinance: "true",
  showRanking: "true",
  showTransfers: "true",
  showLinks: "true",
  showSeasonTournaments: "true",
  showMemberTrophies: "true",
  showSearch: "true",
  showArchive: "true",
  showStats: "true",
  defaultPage: "home",
  activeSeasonId: "S6",
  primaryColor: "#00e5ff",
  secondaryColor: "#2f8cff",
  accentColor: "#8b5cf6",
  headerImage: "",
  appIcon: "",
  groupLogo: "",
  exportLogo: "",
  announcement: "",
  coverHeight: "118px",
  coverHeightMobile: "50px",
  balanceIcon: "💰",
  totalTrophiesIcon: "🏆",
  navMembersIcon: "👥",
  navSeasonIcon: "🏆",
  navArchiveIcon: "📚",
  navRankingIcon: "📊",
  navMoreIcon: "☰",
  menuStatsIcon: "📈",
  menuTransfersIcon: "🔁",
  menuLinksIcon: "🔗",
  memberTeamIcon: "⚽",
  memberNationalIcon: "🏳️",
  finalsPlayedIcon: "⚔️",
  finalsWonIcon: "🥇",
  finalsLostIcon: "🥈",
  goalsForIcon: "⚽",
  goalsAgainstIcon: "🥅",
  relegationsIcon: "⬇️",
  seasonCountIcon: "🏆",
  seasonPointsIcon: "⭐",
  rankingTitlesIcon: "🏆",
  rankingPointsIcon: "⭐",
  transferAmountIcon: "💰",
  transferTypeIcon: "📌",
  transferDateIcon: "📅",
  transferNoteIcon: "⏱️",
  linkFacebookIcon: "👥",
  linkTournamentsIcon: "🏆",
  linkSeasonIcon: "📘",
  linkDefaultIcon: "📌",
  memberCardTrophyIcon: "🏆",
  archiveTrophyTabIcon: "🏆",
  archiveSeasonTabIcon: "📅",
  archiveMemberTabIcon: "👤",
};

const FALLBACK_PLAYER_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const PUSH_SW_PATH_FOR_FOREGROUND = "/firebase-messaging-sw.js";

const OFFER_FEE = 500000;
const MAX_DAILY_PLAYER_OFFERS = 5;
const PLAYER_OFFER_EXPIRE_DAYS = 3;
const MAX_PRO_PLAYERS = 5;
const MIN_SQUAD_PLAYERS = 17;
const MAX_SQUAD_PLAYERS = 32;
const LOAN_TERMINATION_COMPENSATION = 10000000;
const FREE_AGENT_REPLACEMENT_FEE = 5000000;

// يحذف الإيموجي والأيقونات من النصوص — يُستخدم في هيدرات الصفحات
// stripIcon imported from helpers

const URLS = {
  members:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=0&single=true&output=csv",
  players:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1768795422&single=true&output=csv",
  trophiesLegacy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1777972903&single=true&output=csv",
  trophiesMaster:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=694104264&single=true&output=csv",
  leagueArchive:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1337187883&single=true&output=csv",
  tournamentsArchive:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1271747498&single=true&output=csv",
  seasons:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1861704915&single=true&output=csv",
  finance:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1521741565&single=true&output=csv",
  transfers:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=157620707&single=true&output=csv",
  importantLinks:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1147950511&single=true&output=csv",
  settings:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDrHv3359NOsLcR5FqhRLs4MyYBxWzKI1iVZNVKT1_8vIPMOyqqzJF5qSah5cmYIuj182gYQAVwccm/pub?gid=1487747915&single=true&output=csv",
};

export default function App() {
  const [members, setMembers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [trophiesMaster, setTrophiesMaster] = useState([]);
  const [leagueArchive, setLeagueArchive] = useState([]);
  const [tournamentsArchive, setTournamentsArchive] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [finance, setFinance] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [importantLinks, setImportantLinks] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const [page, setPage] = useState(DEFAULT_CONFIG.defaultPage);
  const [selectedId, setSelectedId] = useState("");
  const [memberTab, setMemberTab] = useState("players");
  const [transferPeriod, setTransferPeriod] = useState("");
  const [search, setSearch] = useState("");
  const [detailView, setDetailView] = useState(null);
  const [detailStack, setDetailStack] = useState([]);
  const baseScrollRef = useRef(0);
  const memberReturnRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const restoringScrollRef = useRef(false);
  const [infoModal, setInfoModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topBarScrolled, setTopBarScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authProfile, setAuthProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseMoneyTransfers, setFirebaseMoneyTransfers] = useState([]);
  const [firebasePlayerOffers, setFirebasePlayerOffers] = useState([]);
  const [firebaseNotifications, setFirebaseNotifications] = useState([]);
  const [firebaseTransferWindows, setFirebaseTransferWindows] = useState([]);
  const [firebasePlayerContracts, setFirebasePlayerContracts] = useState([]);
  const [firebaseTransferHistory, setFirebaseTransferHistory] = useState([]);
  const [firebasePlayerReleases, setFirebasePlayerReleases] = useState([]);
  const [firebaseFreeAgentRegistrations, setFirebaseFreeAgentRegistrations] = useState([]);
  const [firebaseFreePlayerStatus, setFirebaseFreePlayerStatus] = useState([]);
  const [firebaseFreeAgentQueue, setFirebaseFreeAgentQueue] = useState([]);
  const [firebaseMemberRestrictions, setFirebaseMemberRestrictions] = useState([]);
  const [firebaseAdminDecisions, setFirebaseAdminDecisions] = useState([]);
  const [firebaseAdminNotes, setFirebaseAdminNotes] = useState([]);
  const [firebasePushTokens, setFirebasePushTokens] = useState([]);
  const [firebaseCompetitions, setFirebaseCompetitions] = useState([]);
  const [focusedCompetitionId, setFocusedCompetitionId] = useState("");
  const [seasonHubTab, setSeasonHubTab] = useState("members");
  const [archiveDefaultMode, setArchiveDefaultMode] = useState("trophy");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState(getInitialPushStatus());
  const [pushBusy, setPushBusy] = useState(false);

  function getInitialPushStatus() {
    return { state: "unchecked", token: null };
  }

  function isFifaAdminProfile(profile) {
    if (!profile) return false;
    return clean(profile.role || "") === "fifa_admin";
  }

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport)
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    document.title = "FIFA GROUP";
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setAuthUser(null);
          setAuthProfile(null);
          setAuthLoading(false);
          return;
        }

        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        setAuthUser(user);
        setAuthProfile(profileSnap.exists() ? profileSnap.data() : null);
      } catch (err) {
        console.error("Auth profile failed:", err);
        setAuthUser(user || null);
        setAuthProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!authUser) {
      setFirebaseMoneyTransfers([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "moneyTransfers"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => {
          const data = item.data() || {};
          return {
            id: item.id,
            ...data,
            type: data.type || "تحويل مالي",
            direction: "transfer",
            amount: data.amount,
            fromMemberId: data.fromMemberId,
            toMemberId: data.toMemberId,
            date: data.date || formatTransferDate(data.createdAt),
            note: data.note || "تحويل تلقائي من التطبيق",
          };
        });
        setFirebaseMoneyTransfers(rows);
      },
      (err) => {
        console.error("Money transfers listener failed:", err);
        setFirebaseMoneyTransfers([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebasePlayerOffers([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "playerOffers"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebasePlayerOffers(rows);
      },
      (err) => {
        console.error("Player offers listener failed:", err);
        setFirebasePlayerOffers([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseNotifications([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseNotifications(rows);
      },
      (err) => {
        console.error("Notifications listener failed:", err);
        setFirebaseNotifications([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseTransferWindows([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "transferWindows"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseTransferWindows(rows);
      },
      (err) => {
        console.error("Transfer windows listener failed:", err);
        setFirebaseTransferWindows([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebasePlayerContracts([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "playerContracts"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebasePlayerContracts(rows);
      },
      (err) => {
        console.error("Player contracts listener failed:", err);
        setFirebasePlayerContracts([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseTransferHistory([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "transferHistory"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseTransferHistory(rows);
      },
      (err) => {
        console.error("Transfer history listener failed:", err);
        setFirebaseTransferHistory([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);


  useEffect(() => {
    if (!authUser) {
      setFirebasePlayerReleases([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "playerReleases"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebasePlayerReleases(rows);
      },
      (err) => {
        console.error("Player releases listener failed:", err);
        setFirebasePlayerReleases([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseFreeAgentRegistrations([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "freeAgentRegistrations"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseFreeAgentRegistrations(rows);
      },
      (err) => {
        console.error("Free agent registrations listener failed:", err);
        setFirebaseFreeAgentRegistrations([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseFreePlayerStatus([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "freePlayerStatus"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseFreePlayerStatus(rows);
      },
      (err) => {
        console.error("Free player status listener failed:", err);
        setFirebaseFreePlayerStatus([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseFreeAgentQueue([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "freeAgentQueue"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseFreeAgentQueue(rows);
      },
      (err) => {
        console.error("Free agent queue listener failed:", err);
        setFirebaseFreeAgentQueue([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);


  useEffect(() => {
    if (!authUser) {
      setFirebaseMemberRestrictions([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "memberRestrictions"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseMemberRestrictions(rows);
      },
      (err) => {
        console.error("Member restrictions listener failed:", err);
        setFirebaseMemberRestrictions([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);


  useEffect(() => {
    if (!authUser) {
      setFirebaseAdminDecisions([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "adminDecisions"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseAdminDecisions(rows);
      },
      (err) => {
        console.error("Admin decisions listener failed:", err);
        setFirebaseAdminDecisions([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setFirebaseAdminNotes([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "adminNotes"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseAdminNotes(rows);
      },
      (err) => {
        console.error("Admin notes listener failed:", err);
        setFirebaseAdminNotes([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !isFifaAdminProfile(authProfile)) {
      setFirebasePushTokens([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "pushTokens"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebasePushTokens(rows);
      },
      (err) => {
        console.error("Push tokens listener failed:", err);
        setFirebasePushTokens([]);
      }
    );

    return () => unsubscribe();
  }, [authUser, authProfile]);


  useEffect(() => {
    if (!authUser) {
      setFirebaseCompetitions([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "competitions"),
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() || {}),
        }));
        setFirebaseCompetitions(rows);
      },
      (err) => {
        console.error("Competitions listener failed:", err);
        setFirebaseCompetitions([]);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    // Keep the professional V4 splash visible until BOTH data loading and auth check finish.
    // This prevents the internal loading card/text from flashing after the splash.
    if (loading || authLoading) return;

    const splash = document.getElementById("fifa-splash");
    if (!splash) return;

    const timer = window.setTimeout(() => {
      splash.classList.add("fifa-splash-hide");

      window.setTimeout(() => {
        splash.remove();
      }, 460);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [loading, authLoading]);

  useEffect(() => {
    if (loading) return undefined;
    const appNode = document.querySelector(".app");
    if (!appNode) return undefined;

    let ticking = false;
    function updateTopBarState() {
      ticking = false;
      setTopBarScrolled(appNode.scrollTop > 12);
    }

    function handleAppScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateTopBarState);
    }

    updateTopBarState();
    appNode.addEventListener("scroll", handleAppScroll, { passive: true });

    return () => {
      appNode.removeEventListener("scroll", handleAppScroll);
    };
  }, [loading]);

  useEffect(() => {
    window.history.replaceState({ fifaGroupRoot: true }, "");

    function handleNativeBack() {
      if (infoModal) {
        setInfoModal(null);
        window.history.replaceState({ fifaGroupRoot: true }, "");
        return;
      }

      if (menuOpen) {
        setMenuOpen(false);
        window.history.replaceState({ fifaGroupRoot: true }, "");
        return;
      }

      if (detailView) {
        if (detailStack.length) {
          const previousEntry = detailStack[detailStack.length - 1];
          setDetailStack((stack) => stack.slice(0, -1));
          setDetailView(previousEntry.view);
          restoreScrollPosition(previousEntry.scrollTop);
        } else {
          setDetailView(null);
          restoreScrollPosition(baseScrollRef.current || 0);
        }
        window.history.replaceState({ fifaGroupRoot: true }, "");
        return;
      }

      if (selectedId) {
        closePublicMemberProfile();
        window.history.replaceState({ fifaGroupRoot: true }, "");
        return;
      }

      if (page !== "home") {
        setPage("home");
        setSelectedId("");
        setDetailView(null);
        setDetailStack([]);
        setInfoModal(null);
        setMenuOpen(false);
        window.history.replaceState({ fifaGroupRoot: true }, "");
        scrollAppToTop("auto");
        return;
      }

      window.history.pushState({ fifaGroupRoot: true }, "");
    }

    window.addEventListener("popstate", handleNativeBack);
    return () => window.removeEventListener("popstate", handleNativeBack);
  }, [page, selectedId, detailView, detailStack, menuOpen, infoModal]);

  async function loadData() {
    try {
      const [
        membersRows,
        playersRows,
        masterRows,
        leagueRows,
        tournamentRows,
        seasonRows,
        financeRows,
        transferRows,
        linkRows,
        settingsRows,
      ] = await Promise.all([
        loadCSV(URLS.members),
        loadCSV(URLS.players),
        loadCSV(URLS.trophiesMaster),
        loadCSV(URLS.leagueArchive),
        loadCSV(URLS.tournamentsArchive),
        loadCSV(URLS.seasons),
        loadCSV(URLS.finance),
        loadCSV(URLS.transfers),
        loadCSV(URLS.importantLinks),
        loadOptionalCSV(URLS.settings),
      ]);

      const nextConfig = buildConfig(settingsRows);
      const periods = getTransferPeriods(transferRows);
      setMembers(membersRows);
      setPlayers(playersRows);
      setTrophiesMaster(masterRows);
      setLeagueArchive(leagueRows);
      setTournamentsArchive(tournamentRows);
      setSeasons(seasonRows);
      setFinance(financeRows);
      setTransfers(transferRows);
      setImportantLinks(linkRows);
      setConfig(nextConfig);
      setPage("home");
      setTransferPeriod(periods[0]?.id || "");
    } catch (err) {
      console.error(err);
      setError(DEFAULT_CONFIG.errorTitle);
    } finally {
      setLoading(false);
    }
  }

  async function loadCSV(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSV(text);
  }

  async function loadOptionalCSV(url) {
    try {
      return await loadCSV(url);
    } catch {
      return [];
    }
  }

  function parseCSV(text) {
    const lines = (text || "").split("\n").filter(Boolean);
    if (!lines.length) return [];
    return lines.slice(1).map((line) => {
      const parts = [];
      let current = "";
      let inQuotes = false;
      for (const ch of line) {
        if (ch === '"') { inQuotes = !inQuotes; continue; }
        if (ch === "," && !inQuotes) { parts.push(current.trim()); current = ""; continue; }
        current += ch;
      }
      parts.push(current.trim());
      const [id, ...rest] = parts;
      const row = { id: cleanId(id) };
      const remaining = rest.join(" ").trim();
      const words = remaining.split(/\s+/);
      return { ...row, words, raw: remaining };
    });
  }

  function buildConfig(rows) {
    if (!Array.isArray(rows) || !rows.length) return DEFAULT_CONFIG;
    const configRow = rows.find((row) => row.id);
    if (!configRow) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...configRow };
  }

  function buildTrophyMap(rows) {
    const map = {};
    (rows || []).forEach((row) => {
      const id = cleanId(row.id);
      if (id) map[id] = row;
    });
    return map;
  }

  function normalizeTournamentRow(row, source, trophyMap) {
    const trophy = trophyMap[cleanId(row.tournamentId || row.trophyId || "")] || {};
    return {
      ...row,
      source: source || row.source || "",
      name: row.name || trophy.name || "بطولة",
      seasonId: cleanId(row.seasonId || "") || "S6",
      winnerId: cleanId(row.winnerId || row.winner || ""),
      runnerUpId: cleanId(row.runnerUpId || row.runnerUp || ""),
      date: row.date || row.createdAt || new Date().toISOString().slice(0, 10),
    };
  }

  function sortByDateAsc(a, b) {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    return da - db;
  }

  function hasRecord(row) {
    return row && row.id;
  }

  function getActiveSeasonId(seasons, config) {
    return cleanId(config?.activeSeasonId || "") || cleanId((seasons || []).find(() => true)?.id || "") || "S6";
  }

  function findSeason(seasons, seasonId) {
    return (seasons || []).find((s) => same(s.id, seasonId)) || { id: seasonId || "S6", name: "الموسم السادس" };
  }

  function getActiveMembers(members) {
    return (members || []).filter((m) => m?.status !== "inactive" && m?.hidden !== true);
  }

  function normalizeImageUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch?.[1]) return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
    const imgurMatch = url.match(/^https?:\/\/imgur\.com\/([A-Za-z0-9]+)$/);
    if (imgurMatch?.[1]) return `https://i.imgur.com/${imgurMatch[1]}.png`;
    return url;
  }

  const trophyMap = useMemo(
    () => buildTrophyMap(trophiesMaster),
    [trophiesMaster]
  );

  const allTournaments = useMemo(() => {
    const league = leagueArchive
      .filter(hasRecord)
      .map((row) => normalizeTournamentRow(row, "league", trophyMap));
    const other = tournamentsArchive
      .filter(hasRecord)
      .map((row) => normalizeTournamentRow(row, "tournament", trophyMap));
    return [...league, ...other].sort(sortByDateAsc);
  }, [leagueArchive, tournamentsArchive, trophyMap]);

  const activeSeasonId = getActiveSeasonId(seasons, config);
  const activeSeason = findSeason(seasons, activeSeasonId);
  const activeSeasonRows = useMemo(
    () =>
      allTournaments
        .filter((item) => same(item.seasonId, activeSeasonId))
        .sort(sortByDateAsc),
    [allTournaments, activeSeasonId]
  );
  const activeMembers = useMemo(() => getActiveMembers(members), [members]);
  const finalStatsByMember = useMemo(
    () => computeMemberStats(members, allTournaments),
    [members, allTournaments]
  );

  function totalForMember(memberId) {
    return allTournaments.filter((item) => same(item.winnerId, memberId))
      .length;
  }

  const rankedMembers = useMemo(() => {
    const seasonRows = computeSeasonRanking(activeMembers, activeSeasonRows, trophyMap);
    const memberMap = new Map(activeMembers.map((member) => [cleanId(member.id || member.memberId || ""), member]));
    return seasonRows.map((row, index) => {
      const memberId = cleanId(row.memberId || row.id || "");
      const base = memberMap.get(memberId) || {};
      return {
        ...base,
        ...row,
        id: memberId,
        memberId,
        name: row.name || base.name || base.memberName || memberId,
        team: row.team || base.team || "",
        avatar: row.avatar || base.avatar || base.image || "",
        teamLogo: row.teamLogo || base.teamlogo || base.teamLogo || "",
        nationalLogo: row.nationalLogo || base.nationallogo || base.nationalLogo || "",
        titles: Math.max(0, toNumber(row.titles || 0)),
        points: Math.max(0, toNumber(row.points || 0)),
        rankOrder: index + 1,
      };
    });
  }, [activeMembers, activeSeasonRows, trophyMap]);

  const currentMemberId = cleanId(authProfile?.memberId || authProfile?.memberid || "");
  const currentMember = members.find((member) => same(member.id, currentMemberId));
  const isFifaAdmin = isFifaAdminProfile(authProfile);
  const activeCurrentMemberRestrictions = useMemo(
    () => getActiveMemberRestrictions(firebaseMemberRestrictions, currentMemberId),
    [firebaseMemberRestrictions, currentMemberId]
  );
  const combinedFinance = useMemo(
    () => [...finance, ...firebaseMoneyTransfers],
    [finance, firebaseMoneyTransfers]
  );
  const currentMemberFinance = useMemo(
    () => getMemberFinanceRows(combinedFinance, currentMemberId),
    [combinedFinance, currentMemberId]
  );
  const currentMemberBalance = useMemo(
    () => computeMemberBalance(currentMemberFinance, currentMember?.balance, currentMemberId),
    [currentMemberFinance, currentMember?.balance, currentMemberId]
  );
  const activeCurrentMemberOffers = useMemo(
    () =>
      firebasePlayerOffers.filter((offer) => {
        if (!same(offer.fromMemberId, currentMemberId)) return false;
        return isFinanciallyReservedPlayerOffer(offer);
      }),
    [firebasePlayerOffers, currentMemberId]
  );
  const activeCurrentMemberFreeAgentQueue = useMemo(
    () =>
      firebaseFreeAgentQueue.filter((item) =>
        same(item.memberId, currentMemberId) &&
        ["pending_window", "processing"].includes(clean(item.status || "pending_window"))
      ),
    [firebaseFreeAgentQueue, currentMemberId]
  );
  const reservedOfferAmount = useMemo(
    () => activeCurrentMemberOffers.reduce((sum, offer) => sum + Math.max(0, toNumber(offer.amount)), 0),
    [activeCurrentMemberOffers]
  );
  const reservedFreeAgentAmount = useMemo(
    () => activeCurrentMemberFreeAgentQueue.reduce((sum, item) => sum + Math.max(0, toNumber(item.cost || item.feeAmount)), 0),
    [activeCurrentMemberFreeAgentQueue]
  );
  const currentMemberAvailableBalance = Math.max(0, currentMemberBalance - reservedOfferAmount - reservedFreeAgentAmount);
  const transferMarketOpen = isTransferMarketOpen(firebaseTransferWindows);
  const activePlayerContracts = useMemo(
    () => firebasePlayerContracts.filter((contract) => clean(contract.status || "active") === "active"),
    [firebasePlayerContracts]
  );
  const currentMemberPlayers = useMemo(
    () => getVisiblePlayersForMember(currentMemberId).sort((a, b) => toNumber(b.rating) - toNumber(a.rating)),
    [players, currentMemberId, activePlayerContracts]
  );
  const currentMemberNotifications = useMemo(
    () => firebaseNotifications
      .filter((item) => isNotificationVisibleToMember(item, currentMemberId))
      .sort((a, b) => notificationTimeValue(b.createdAt || b.date) - notificationTimeValue(a.createdAt || a.date)),
    [firebaseNotifications, currentMemberId]
  );
  const topBarNotifications = useMemo(
    () => currentMemberNotifications.slice(0, 10),
    [currentMemberNotifications]
  );
  const unreadNotificationsCount = currentMemberNotifications.filter((item) => clean(item.status || "unread") !== "read").length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search || "");
    const targetPage = cleanId(params.get("fgPage") || params.get("page"));
    const competitionId = cleanId(params.get("fgCompetitionId") || params.get("competitionId"));
    const memberIdParam = cleanId(params.get("fgMemberId") || params.get("memberId"));
    if (competitionId) {
      setFocusedCompetitionId(competitionId);
      setPage("season");
    } else if (targetPage === "finance" && memberIdParam) {
      setSelectedId(memberIdParam);
      setMemberTab("finance");
      setPage("members");
    } else if (targetPage === "notifications") {
      setNotificationsOpen(true);
    }
    if (targetPage || competitionId || memberIdParam) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({ fifaGroupRoot: true }, "", cleanUrl);
    }
  }, []);

  useEffect(() => {
    if (!authUser || pushStatus?.state !== "enabled") return undefined;
    if (typeof window === "undefined") return undefined;

    const unsubscribe = listenToForegroundPushMessages(async (payload) => {
      try {
        if (!("Notification" in window) || window.Notification.permission !== "granted") return;
        if (!("serviceWorker" in navigator)) return;

        const title =
          payload?.notification?.title ||
          payload?.data?.title ||
          "FIFA GROUP";
        const body =
          payload?.notification?.body ||
          payload?.data?.body ||
          "لديك إشعار جديد من FIFA GROUP.";
        const icon =
          payload?.notification?.icon ||
          payload?.data?.icon ||
          "/icon-192.png";
        const tag =
          payload?.data?.notificationId ||
          payload?.data?.id ||
          payload?.data?.relatedOfferId ||
          `fifa-group-${Date.now()}`;

        const registration =
          (await navigator.serviceWorker.getRegistration(PUSH_SW_PATH_FOR_FOREGROUND)) ||
          (await navigator.serviceWorker.ready);

        await registration.showNotification(title, {
          body,
          icon,
          badge: "/icon-192.png",
          tag,
          renotify: true,
          dir: "rtl",
          data: {
            url: window.location.origin,
            ...(payload?.data || {}),
          },
        });
      } catch (err) {
        console.error("Foreground push notification failed:", err);
      }
    });

    return unsubscribe;
  }, [authUser, pushStatus?.state]);

  async function handleEnablePushNotifications() {
    if (!authUser || !currentMemberId) {
      setPushStatus({
        state: "error",
        message: "اربط الحساب بعضو قبل تفعيل إشعارات الجوال.",
      });
      return;
    }

    setPushBusy(true);
    setPushStatus((current) => ({
      ...(current || getInitialPushStatus()),
      message: "جاري طلب إذن إشعارات الجوال...",
    }));

    try {
      const result = await enableFifaPushNotifications({
        authUser,
        memberId: currentMemberId,
        memberName: currentMember?.name || authProfile?.memberName || "",
        username: authProfile?.username || "",
      });
      setPushStatus(result);
    } catch (err) {
      console.error("Enable push notifications failed:", err);
      setPushStatus({
        state: "error",
        message: err?.message || "تعذر تفعيل إشعارات الجوال حاليًا.",
      });
    } finally {
      setPushBusy(false);
    }
  }


  async function handleDisablePushNotifications() {
    const token = cleanId(pushStatus?.token || "");
    if (!token) {
      setPushStatus({
        state: "error",
        message: "لا يوجد رمز إشعارات محفوظ لهذا الجهاز. يمكنك إيقاف الإشعارات من إعدادات الجهاز.",
      });
      return;
    }

    setPushBusy(true);
    try {
      await setDoc(
        doc(db, "pushTokens", pushTokenDocId(token)),
        {
          token,
          active: false,
          disabledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          disabledByMemberId: currentMemberId || "",
          disabledByUid: authUser?.uid || "",
        },
        { merge: true }
      );
      setPushStatus({
        state: "ready",
        message: "تم إيقاف إشعارات الجوال لهذا الجهاز. يمكنك إعادة تفعيلها لاحقًا.",
      });
    } catch (err) {
      console.error("Disable push notifications failed:", err);
      setPushStatus({
        state: "error",
        message: err?.message || "تعذر إيقاف إشعارات هذا الجهاز حاليًا.",
        token,
      });
    } finally {
      setPushBusy(false);
    }
  }

  async function recordFifaAdminDecision(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    return addDoc(collection(db, "adminDecisions"), {
      status: payload.status || "active",
      source: payload.source || "fifa_admin_panel",
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      clickUrl: payload.clickUrl || "/",
      ...payload,
    });
  }

  async function createAdminNotificationDoc(payload = {}) {
    return addDoc(collection(db, "notifications"), {
      status: "unread",
      fromMemberId: "FIFA",
      fromMemberName: "FIFA",
      source: payload.source || "fifa_admin_panel",
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...payload,
    });
  }

  async function createFifaAdminDecisionLog(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const type = clean(payload.type || payload.actionType || "admin_decision") || "admin_decision";
    const title = payload.title || adminDecisionTypeLabel(type);
    return addDoc(collection(db, "adminDecisions"), {
      type,
      title,
      status: payload.status || "completed",
      reason: String(payload.reason || payload.note || "").trim(),
      amount: Math.max(0, toNumber(payload.amount || 0)),
      fromMemberId: cleanId(payload.fromMemberId || ""),
      fromMemberName: payload.fromMemberName || "",
      toMemberId: cleanId(payload.toMemberId || ""),
      toMemberName: payload.toMemberName || "",
      memberId: cleanId(payload.memberId || payload.toMemberId || payload.fromMemberId || ""),
      memberName: payload.memberName || payload.toMemberName || payload.fromMemberName || "",
      beneficiaryMemberId: cleanId(payload.beneficiaryMemberId || ""),
      beneficiaryMemberName: payload.beneficiaryMemberName || "",
      relatedMoneyTransferId: payload.relatedMoneyTransferId || "",
      relatedCorrectionTransferId: payload.relatedCorrectionTransferId || "",
      relatedRestrictionId: payload.relatedRestrictionId || "",
      relatedNotificationId: payload.relatedNotificationId || "",
      originalAmount: payload.originalAmount || null,
      correctedAmount: payload.correctedAmount || null,
      source: "fifa_admin_panel",
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function createFifaAdminNotification(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const mode = payload.targetMode === "member" ? "member" : "all";
    const targetMemberId = cleanId(payload.targetMemberId || "");
    const type = clean(payload.type || "system_news") || "system_news";
    const title = String(payload.title || "").trim();
    const body = String(payload.body || "").trim();
    if (!title) throw new Error("اكتب عنوان الإشعار.");
    if (!body) throw new Error("اكتب نص الإشعار.");
    if (mode === "member" && !targetMemberId) throw new Error("اختر العضو المستلم.");
    const targetMember = mode === "member" ? members.find((member) => same(member.id, targetMemberId)) : null;
    const notificationRef = await createAdminNotificationDoc({
      type,
      title,
      body,
      audience: mode === "all" ? "all" : "member",
      toMemberId: mode === "member" ? targetMemberId : "",
      toMemberName: targetMember?.name || "",
      source: "fifa_admin_panel",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
    });
    await recordFifaAdminDecision({
      type: "admin_notification",
      typeLabel: "إشعار إداري",
      targetMode: mode,
      targetMemberId: mode === "member" ? targetMemberId : "",
      targetMemberName: targetMember?.name || "",
      title,
      body,
      relatedNotificationId: notificationRef.id,
      reversible: false,
      source: "fifa_admin_notifications",
    });
  }

  async function createFifaAdminReward(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const toMemberId = cleanId(payload.toMemberId || "");
    const amount = parseFinanceAmount(payload.amount);
    const rewardType = clean(payload.rewardType || "admin_reward") || "admin_reward";
    const note = String(payload.note || "").trim();
    if (!toMemberId) throw new Error("اختر العضو المستفيد.");
    if (same(toMemberId, "FIFA")) throw new Error("لا يمكن صرف مكافأة لحساب FIFA.");
    if (!amount || amount <= 0) throw new Error("أدخل مبلغًا صحيحًا أكبر من صفر.");
    const receiver = members.find((member) => same(member.id, toMemberId));
    if (!receiver) throw new Error("العضو المستفيد غير موجود.");
    const typeLabel = adminRewardTypeLabel(rewardType);
    const transferDate = new Date().toISOString().slice(0, 10);
    const transferRef = await addDoc(collection(db, "moneyTransfers"), {
      fromMemberId: "FIFA",
      fromMemberName: "FIFA",
      toMemberId,
      toMemberName: receiver.name || "",
      amount,
      type: rewardType,
      typeLabel,
      direction: "admin_reward",
      status: "approved",
      approvedBy: "FIFA",
      createdBy: authUser?.uid || "",
      username: authProfile?.username || "fifa",
      note: note || typeLabel,
      date: transferDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const notificationRef = await createAdminNotificationDoc({
      type: rewardType,
      title: typeLabel,
      body: "تمت إضافة " + formatMoney(amount) + " إلى حسابك من FIFA" + (note ? " - " + note : "."),
      audience: "member",
      toMemberId,
      toMemberName: receiver.name || "",
      relatedMoneyTransferId: transferRef.id,
      amount,
      source: "fifa_admin_panel",
    });
    await recordFifaAdminDecision({
      type: rewardType,
      typeLabel,
      status: "active",
      fromMemberId: "FIFA",
      fromMemberName: "FIFA",
      toMemberId,
      toMemberName: receiver.name || "",
      amount,
      note: note || typeLabel,
      relatedMoneyTransferId: transferRef.id,
      relatedNotificationId: notificationRef.id,
      reversible: true,
      correctionMode: "money_transfer",
      source: "fifa_admin_finance",
    });
  }


  async function createFifaAdminDiscipline(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const actionType = clean(payload.actionType || "financial_penalty");
    const memberId = cleanId(payload.memberId || "");
    const beneficiaryMemberId = cleanId(payload.beneficiaryMemberId || "");
    const amount = parseFinanceAmount(payload.amount);
    const reason = String(payload.reason || "").trim();
    const startDate = String(payload.startDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
    const endDate = String(payload.endDate || "").slice(0, 10);
    const member = members.find((item) => same(item.id, memberId));
    if (!memberId || !member) throw new Error("اختر العضو صاحب العقوبة.");
    if (same(memberId, "FIFA")) throw new Error("لا يمكن تطبيق عقوبة على حساب FIFA.");
    if (!reason) throw new Error("اكتب سبب القرار الإداري.");

    if (["financial_penalty", "financial_deduction"].includes(actionType)) {
      if (!amount || amount <= 0) throw new Error("أدخل مبلغ الخصم أو الغرامة.");
      const typeLabel = actionType === "financial_deduction" ? "خصم إداري" : "غرامة مالية";
      const transferRef = await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: memberId,
        fromMemberName: member.name || "",
        toMemberId: "FIFA",
        toMemberName: "FIFA",
        amount,
        type: actionType === "financial_deduction" ? "admin_deduction" : "admin_penalty",
        typeLabel,
        direction: "admin_penalty",
        status: "approved",
        approvedBy: "FIFA",
        createdBy: authUser?.uid || "",
        username: authProfile?.username || "fifa",
        note: reason,
        date: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: actionType === "financial_deduction" ? "admin_deduction" : "admin_penalty",
        title: typeLabel,
        body: "تم تطبيق " + typeLabel + " بقيمة " + formatMoney(amount) + " بسبب: " + reason,
        status: "unread",
        audience: "member",
        toMemberId: memberId,
        toMemberName: member.name || "",
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        relatedMoneyTransferId: transferRef.id,
        amount,
        source: "fifa_admin_penalties",
        createdBy: authUser?.uid || "",
        createdByMemberId: currentMemberId || "FIFA",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await recordFifaAdminDecision({
        type: actionType === "financial_deduction" ? "admin_deduction" : "admin_penalty",
        typeLabel,
        status: "active",
        fromMemberId: memberId,
        fromMemberName: member.name || "",
        toMemberId: "FIFA",
        toMemberName: "FIFA",
        amount,
        note: reason,
        reason,
        category: clean(payload.category || "financial_violation") || "financial_violation",
        relatedMoneyTransferId: transferRef.id,
        reversible: true,
        correctionMode: "money_transfer",
        source: "fifa_admin_penalties",
      });
      return;
    }

    if (actionType === "member_compensation") {
      if (!beneficiaryMemberId) throw new Error("اختر العضو المستفيد من التعويض.");
      if (same(memberId, beneficiaryMemberId)) throw new Error("لا يمكن أن يكون المتضرر والمستفيد نفس العضو.");
      if (!amount || amount <= 0) throw new Error("أدخل مبلغ التعويض.");
      const beneficiary = members.find((item) => same(item.id, beneficiaryMemberId));
      if (!beneficiary) throw new Error("العضو المستفيد غير موجود.");
      const transferRef = await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: memberId,
        fromMemberName: member.name || "",
        toMemberId: beneficiaryMemberId,
        toMemberName: beneficiary.name || "",
        amount,
        type: "admin_member_compensation",
        typeLabel: "تعويض مالي لعضو",
        direction: "admin_compensation_transfer",
        status: "approved",
        approvedBy: "FIFA",
        createdBy: authUser?.uid || "",
        username: authProfile?.username || "fifa",
        note: reason,
        date: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: "admin_compensation_out",
        title: "تعويض مالي صادر",
        body: "تم خصم " + formatMoney(amount) + " من رصيدك كتعويض إداري بسبب: " + reason,
        status: "unread",
        audience: "member",
        toMemberId: memberId,
        toMemberName: member.name || "",
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        relatedMoneyTransferId: transferRef.id,
        amount,
        source: "fifa_admin_penalties",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: "admin_compensation_in",
        title: "تعويض مالي وارد",
        body: "تمت إضافة تعويض مالي إلى حسابك بقيمة " + formatMoney(amount) + " بسبب: " + reason,
        status: "unread",
        audience: "member",
        toMemberId: beneficiaryMemberId,
        toMemberName: beneficiary.name || "",
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        relatedMoneyTransferId: transferRef.id,
        amount,
        source: "fifa_admin_penalties",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await recordFifaAdminDecision({
        type: "admin_member_compensation",
        typeLabel: "تعويض مالي بين عضوين",
        status: "active",
        fromMemberId: memberId,
        fromMemberName: member.name || "",
        toMemberId: beneficiaryMemberId,
        toMemberName: beneficiary.name || "",
        amount,
        note: reason,
        reason,
        category: clean(payload.category || "financial_compensation") || "financial_compensation",
        relatedMoneyTransferId: transferRef.id,
        reversible: true,
        correctionMode: "money_transfer",
        source: "fifa_admin_penalties",
      });
      return;
    }

    if (actionType === "transfer_restriction") {
      if (!endDate) throw new Error("حدد تاريخ نهاية الإيقاف.");
      const restrictionPayload = buildAdminTransferRestrictionPayload(payload);
      const restrictionRef = await addDoc(collection(db, "memberRestrictions"), {
        memberId,
        memberName: member.name || "",
        type: "transfer_restriction",
        status: "active",
        reason,
        startDate,
        endDate,
        ...restrictionPayload,
        createdBy: authUser?.uid || "",
        createdByMemberId: currentMemberId || "FIFA",
        createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: "transfer_restriction",
        title: "قرار إيقاف من نظام الانتقالات",
        body: formatRestrictionNotificationBody({ reason, startDate, endDate, restriction: restrictionPayload }),
        status: "unread",
        audience: "member",
        toMemberId: memberId,
        toMemberName: member.name || "",
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        relatedRestrictionId: restrictionRef.id,
        source: "fifa_admin_penalties",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await recordFifaAdminDecision({
        type: "transfer_restriction",
        typeLabel: "إيقاف من نظام الانتقالات",
        status: "active",
        memberId,
        memberName: member.name || "",
        targetMemberId: memberId,
        targetMemberName: member.name || "",
        reason,
        category: clean(payload.category || "transfer_violation") || "transfer_violation",
        startDate,
        endDate,
        ...restrictionPayload,
        relatedRestrictionId: restrictionRef.id,
        reversible: true,
        correctionMode: "restriction",
        source: "fifa_admin_penalties",
      });
      return;
    }

    if (actionType === "lift_transfer_restriction") {
      const activeRows = getActiveMemberRestrictions(firebaseMemberRestrictions, memberId);
      if (!activeRows.length) throw new Error("لا يوجد إيقاف انتقالات نشط على هذا العضو.");
      await Promise.allSettled(activeRows.map((row) => updateDoc(doc(db, "memberRestrictions", row.id), {
        status: "lifted",
        liftedAt: serverTimestamp(),
        liftedBy: authUser?.uid || "",
        liftedByMemberId: currentMemberId || "FIFA",
        liftReason: reason,
        updatedAt: serverTimestamp(),
      })));
      await addDoc(collection(db, "notifications"), {
        type: "transfer_restriction_lifted",
        title: "تم رفع إيقاف الانتقالات",
        body: "تم رفع إيقافك من نظام الانتقالات" + (reason ? " - " + reason : "."),
        status: "unread",
        audience: "member",
        toMemberId: memberId,
        toMemberName: member.name || "",
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        source: "fifa_admin_penalties",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await recordFifaAdminDecision({
        type: "transfer_restriction_lifted",
        typeLabel: "رفع إيقاف انتقالات",
        status: "completed",
        memberId,
        memberName: member.name || "",
        targetMemberId: memberId,
        targetMemberName: member.name || "",
        reason,
        relatedRestrictionIds: activeRows.map((row) => row.id),
        reversible: false,
        source: "fifa_admin_penalties",
      });
      return;
    }

    throw new Error("نوع القرار غير معروف.");
  }

  async function createFifaAdminMoneyCorrection(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const transferId = cleanId(payload.transferId || "");
    const mode = clean(payload.mode || "full_reverse") === "amount_correction" ? "amount_correction" : "full_reverse";
    const reason = String(payload.reason || "").trim();
    if (!transferId) throw new Error("اختر العملية المالية المراد تصحيحها.");
    if (!reason) throw new Error("اكتب سبب التصحيح أو التراجع.");

    const original = firebaseMoneyTransfers.find((item) => same(item.id, transferId));
    if (!original) throw new Error("العملية المالية غير موجودة أو ليست من Firebase.");
    if (clean(original.adminCorrectionStatus || original.reversalStatus || "") === "reversed") {
      throw new Error("تم عكس هذه العملية سابقًا.");
    }

    const originalAmount = Math.max(0, toNumber(original.amount));
    if (!originalAmount) throw new Error("لا يمكن تصحيح عملية بدون مبلغ صالح.");

    const fromId = cleanId(original.fromMemberId || "");
    const toId = cleanId(original.toMemberId || "");
    const fromName = original.fromMemberName || getMemberName(members, fromId) || fromId || "-";
    const toName = original.toMemberName || getMemberName(members, toId) || toId || "-";
    if (!fromId || !toId) throw new Error("العملية الأصلية لا تحتوي أطرافًا واضحة.");

    let correctionAmount = originalAmount;
    let reverseFromId = toId;
    let reverseFromName = toName;
    let reverseToId = fromId;
    let reverseToName = fromName;
    let correctionTitle = "عكس عملية مالية";
    let correctionType = "admin_money_reversal";
    let correctAmount = null;

    if (mode === "amount_correction") {
      correctAmount = parseFinanceAmount(payload.correctAmount);
      if (correctAmount < 0) throw new Error("أدخل المبلغ الصحيح.");
      const diff = originalAmount - correctAmount;
      if (!diff) throw new Error("المبلغ الصحيح يساوي المبلغ الأصلي، لا يوجد فرق للتصحيح.");
      correctionAmount = Math.abs(diff);
      correctionTitle = "تصحيح مبلغ عملية مالية";
      correctionType = "admin_money_amount_correction";
      if (diff < 0) {
        reverseFromId = fromId;
        reverseFromName = fromName;
        reverseToId = toId;
        reverseToName = toName;
      }
    }

    const correctionRef = await addDoc(collection(db, "moneyTransfers"), {
      fromMemberId: reverseFromId,
      fromMemberName: reverseFromName,
      toMemberId: reverseToId,
      toMemberName: reverseToName,
      amount: correctionAmount,
      type: correctionType,
      typeLabel: correctionTitle,
      direction: "admin_money_correction",
      status: "approved",
      approvedBy: "FIFA",
      relatedOriginalMoneyTransferId: transferId,
      originalAmount,
      correctAmount: mode === "amount_correction" ? correctAmount : 0,
      correctionMode: mode,
      createdBy: authUser?.uid || "",
      username: authProfile?.username || "fifa",
      note: reason,
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "moneyTransfers", transferId), {
      adminCorrectionStatus: mode === "full_reverse" ? "reversed" : "corrected",
      adminCorrectedAt: serverTimestamp(),
      adminCorrectedBy: authUser?.uid || "",
      adminCorrectionReason: reason,
      adminCorrectionTransferId: correctionRef.id,
      adminCorrectAmount: mode === "amount_correction" ? correctAmount : 0,
      updatedAt: serverTimestamp(),
    });

    const relatedDecision = firebaseAdminDecisions.find((item) => same(item.relatedMoneyTransferId, transferId));
    if (relatedDecision?.id) {
      await updateDoc(doc(db, "adminDecisions", relatedDecision.id), {
        status: mode === "full_reverse" ? "reversed" : "corrected",
        reversedAt: mode === "full_reverse" ? serverTimestamp() : null,
        correctedAt: mode === "amount_correction" ? serverTimestamp() : null,
        correctionReason: reason,
        correctionTransferId: correctionRef.id,
        updatedAt: serverTimestamp(),
      });
    }

    const body = mode === "full_reverse"
      ? "تم عكس عملية مالية بقيمة " + formatMoney(correctionAmount) + " بقرار FIFA. السبب: " + reason
      : "تم تصحيح عملية مالية. الفرق المصحح: " + formatMoney(correctionAmount) + ". السبب: " + reason;

    const notifyTargets = [
      { id: reverseFromId, name: reverseFromName, title: correctionTitle + " - صادر" },
      { id: reverseToId, name: reverseToName, title: correctionTitle + " - وارد" },
    ].filter((item) => item.id && !same(item.id, "FIFA"));

    await Promise.allSettled(notifyTargets.map((target) => createAdminNotificationDoc({
      type: correctionType,
      title: target.title,
      body,
      audience: "member",
      toMemberId: target.id,
      toMemberName: target.name,
      relatedMoneyTransferId: correctionRef.id,
      amount: correctionAmount,
      source: "fifa_admin_corrections",
    })));

    await recordFifaAdminDecision({
      type: correctionType,
      typeLabel: correctionTitle,
      status: "completed",
      fromMemberId: reverseFromId,
      fromMemberName: reverseFromName,
      toMemberId: reverseToId,
      toMemberName: reverseToName,
      amount: correctionAmount,
      originalAmount,
      correctAmount: mode === "amount_correction" ? correctAmount : 0,
      reason,
      relatedMoneyTransferId: correctionRef.id,
      relatedOriginalMoneyTransferId: transferId,
      source: "fifa_admin_corrections",
      reversible: false,
    });
  }

  async function cancelFifaAdminRestriction(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const restrictionId = cleanId(payload.restrictionId || "");
    const reason = String(payload.reason || "").trim();
    if (!restrictionId) throw new Error("اختر إيقاف الانتقالات المراد رفعه أو إلغاؤه.");
    if (!reason) throw new Error("اكتب سبب رفع أو إلغاء الإيقاف.");
    const restriction = firebaseMemberRestrictions.find((item) => same(item.id, restrictionId));
    if (!restriction) throw new Error("قرار الإيقاف غير موجود.");
    const memberId = cleanId(restriction.memberId || "");
    const memberName = restriction.memberName || getMemberName(members, memberId) || "";
    await updateDoc(doc(db, "memberRestrictions", restrictionId), {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      cancelledBy: authUser?.uid || "",
      cancelledByMemberId: currentMemberId || "FIFA",
      cancelReason: reason,
      updatedAt: serverTimestamp(),
    });
    const relatedDecision = firebaseAdminDecisions.find((item) => same(item.relatedRestrictionId, restrictionId));
    if (relatedDecision?.id) {
      await updateDoc(doc(db, "adminDecisions", relatedDecision.id), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelReason: reason,
        updatedAt: serverTimestamp(),
      });
    }
    await createAdminNotificationDoc({
      type: "transfer_restriction_cancelled",
      title: "تم إلغاء إيقاف الانتقالات",
      body: "تم إلغاء إيقافك من نظام الانتقالات بقرار FIFA. السبب: " + reason,
      audience: "member",
      toMemberId: memberId,
      toMemberName: memberName,
      relatedRestrictionId: restrictionId,
      source: "fifa_admin_corrections",
    });
    await recordFifaAdminDecision({
      type: "transfer_restriction_cancelled",
      typeLabel: "إلغاء إيقاف انتقالات",
      status: "completed",
      memberId,
      memberName,
      targetMemberId: memberId,
      targetMemberName: memberName,
      relatedRestrictionId: restrictionId,
      reason,
      source: "fifa_admin_corrections",
      reversible: false,
    });
  }

  async function createFifaAdminNote(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const memberId = cleanId(payload.memberId || "");
    const note = String(payload.note || "").trim();
    const category = clean(payload.category || "general_note") || "general_note";
    if (!memberId) throw new Error("اختر العضو.");
    if (!note) throw new Error("اكتب الملاحظة الإدارية.");
    const member = members.find((item) => same(item.id, memberId));
    if (!member || same(memberId, "FIFA")) throw new Error("اختر عضوًا صحيحًا.");
    const noteRef = await addDoc(collection(db, "adminNotes"), {
      memberId,
      memberName: member.name || "",
      category,
      note,
      status: "active",
      private: true,
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await recordFifaAdminDecision({
      type: "admin_note",
      typeLabel: "ملاحظة إدارية",
      status: "completed",
      memberId,
      memberName: member.name || "",
      category,
      note,
      relatedAdminNoteId: noteRef.id,
      source: "fifa_admin_notes",
      reversible: false,
    });
  }

  async function sendRosterUpdateNotification({ toMemberId, fromMemberId = "system", playerId = "", title = "تحديث على قائمة فريقك", body = "", targetStatus = "roster_updated", relatedOfferId = "", relatedQueueId = "" } = {}) {
    const targetMemberId = cleanId(toMemberId);
    if (!targetMemberId || !body) return;
    await addDoc(collection(db, "notifications"), {
      type: "roster_update",
      status: "unread",
      toMemberId: targetMemberId,
      fromMemberId: cleanId(fromMemberId) || "system",
      relatedOfferId: relatedOfferId || "",
      relatedQueueId: relatedQueueId || "",
      targetPlayerId: playerId || "",
      targetMemberId,
      targetStatus,
      navigationDisabled: true,
      title,
      body,
      createdAt: serverTimestamp(),
    });
  }

  async function processPendingPlayerOfferOnMarketOpen(existing, windowInfo = {}) {
    if (!existing?.id) return { ok: false, reason: "missing_offer" };
    if (clean(existing.status || "") !== "approvedpendingwindow") return { ok: false, reason: "not_pending_window" };
    if (existing.marketExecutionCompletedAt || existing.completedAt) return { ok: false, reason: "already_completed" };

    const offerId = existing.id;
    const buyerId = cleanId(existing.fromMemberId);
    const sellerId = cleanId(existing.toMemberId);
    const numericAmount = Math.max(0, toNumber(existing.amount));
    const contractType = clean(existing.type) === "loan" ? "loan" : "buy";
    const targetPlayerId = cleanId(existing.targetPlayerId || existing.playerId);
    const targetPlayerRow = players.find((player) => same(getPlayerStableId(player), targetPlayerId));
    if (!buyerId || !sellerId || !targetPlayerId) return { ok: false, reason: "missing_data" };

    const previousActiveContract = getActivePlayerContract(targetPlayerId);
    const previousActiveContractType = clean(previousActiveContract?.contractType || "");
    if (previousActiveContractType === "released") {
      await updateDoc(doc(db, "playerOffers", offerId), {
        status: "executionFailed",
        pendingExecutionStatus: "failed",
        pendingExecutionFailureReason: "اللاعب خارج اللعبة.",
        updatedAt: serverTimestamp(),
      });
      return { ok: false, reason: "released_target" };
    }

    const baseOwnerId = cleanId(
      previousActiveContract?.baseOwnerMemberId ||
        previousActiveContract?.baseOwnerId ||
        previousActiveContract?.originalBaseOwnerMemberId ||
        previousActiveContract?.originalOwnerMemberId ||
        targetPlayerRow?.memberid ||
        sellerId
    );
    const baseOwner = members.find((member) => same(member.id, baseOwnerId));
    const baseOwnerName = previousActiveContract?.baseOwnerMemberName || previousActiveContract?.originalBaseOwnerMemberName || baseOwner?.name || previousActiveContract?.originalOwnerMemberName || existing.toMemberName || "";
    const sourceOwnerId = cleanId(previousActiveContract?.currentMemberId || sellerId);
    const sourceOwnerName = previousActiveContract?.currentMemberName || existing.toMemberName || getMemberName(members, sellerId) || "";
    const loanRealOwnerId = previousActiveContractType === "loan"
      ? cleanId(previousActiveContract?.originalOwnerMemberId || previousActiveContract?.ownerMemberId || baseOwnerId || sellerId)
      : sourceOwnerId;
    const loanRealOwnerName = previousActiveContractType === "loan"
      ? (previousActiveContract?.originalOwnerMemberName || previousActiveContract?.ownerMemberName || baseOwnerName || sourceOwnerName)
      : sourceOwnerName;
    if (sourceOwnerId && !same(sourceOwnerId, sellerId)) {
      await updateDoc(doc(db, "playerOffers", offerId), {
        status: "executionFailed",
        pendingExecutionStatus: "failed",
        pendingExecutionFailureReason: "ملكية اللاعب تغيرت قبل فتح السوق.",
        updatedAt: serverTimestamp(),
      });
      return { ok: false, reason: "ownership_changed" };
    }

    const offeredPlayersRaw = Array.isArray(existing.offeredPlayers) ? existing.offeredPlayers : [];
    const buyerVisiblePlayers = getVisiblePlayersForMember(buyerId);
    const buyerVisibleMap = new Map(buyerVisiblePlayers.map((player) => [cleanId(getPlayerStableId(player)), player]));
    const offeredPlayerIds = new Set();
    const offeredPlayers = [];

    for (const item of offeredPlayersRaw) {
      const playerId = cleanId(item.playerId || item.playerid || item.id);
      if (!playerId || same(playerId, targetPlayerId) || offeredPlayerIds.has(playerId)) {
        await updateDoc(doc(db, "playerOffers", offerId), {
          status: "executionFailed",
          pendingExecutionStatus: "failed",
          pendingExecutionFailureReason: "بيانات أحد لاعبي التبادل غير صحيحة.",
          updatedAt: serverTimestamp(),
        });
        return { ok: false, reason: "bad_exchange_player" };
      }
      offeredPlayerIds.add(playerId);
      const row = buyerVisibleMap.get(playerId) || players.find((player) => same(getPlayerStableId(player), playerId));
      if (!row || !buyerVisibleMap.has(playerId)) {
        await updateDoc(doc(db, "playerOffers", offerId), {
          status: "executionFailed",
          pendingExecutionStatus: "failed",
          pendingExecutionFailureReason: "أحد لاعبي التبادل لم يعد في قائمة مقدم العرض عند فتح السوق.",
          updatedAt: serverTimestamp(),
        });
        return { ok: false, reason: "exchange_player_unavailable" };
      }
      const activeContract = getActivePlayerContract(playerId);
      const activeType = clean(activeContract?.contractType || "");
      if (activeType === "released" || activeType === "loan" || (activeContract && !same(activeContract.currentMemberId, buyerId))) {
        await updateDoc(doc(db, "playerOffers", offerId), {
          status: "executionFailed",
          pendingExecutionStatus: "failed",
          pendingExecutionFailureReason: "تعذر تنفيذ أحد لاعبي التبادل بسبب تغير حالته.",
          updatedAt: serverTimestamp(),
        });
        return { ok: false, reason: "exchange_contract_changed" };
      }
      const exchangeContractType = normalizeExchangeContractType(item.exchangeContractType || item.swapContractType || item.contractMode);
      const exchangeLoanDurationMonths = exchangeContractType === "loan" ? normalizeExchangeLoanDuration(item.exchangeLoanDurationMonths || item.loanDurationMonths) : null;
      offeredPlayers.push({
        ...item,
        row,
        activeContract,
        playerId,
        exchangeContractType,
        exchangeLoanDurationMonths,
        exchangeTypeLabel: exchangeContractType === "loan" ? "إعارة" : "بيع كامل",
        playerName: item.playerName || row.name || "",
        playerImage: item.playerImage || item.image || row.image || "",
        playerPosition: item.playerPosition || item.position || row.position || "",
        playerRating: item.playerRating || item.rating || row.rating || "",
      });
    }

    const nowDate = new Date();
    const todayDateKey = nowDate.toISOString().slice(0, 10);
    const loanMonths = contractType === "loan" ? toNumber(existing.loanDurationMonths) : null;
    const loanEndDate = loanMonths
      ? new Date(nowDate.getFullYear(), nowDate.getMonth() + loanMonths, nowDate.getDate()).toISOString().slice(0, 10)
      : null;

    const targetFreeOrigin = isFreeOriginContract(previousActiveContract);
    const targetFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(previousActiveContract, targetFreeOrigin ? baseOwnerId || sellerId : "");

    if (previousActiveContract?.id) {
      await updateDoc(doc(db, "playerContracts", previousActiveContract.id), {
        status: "replaced",
        replacedByOfferId: offerId,
        replacedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, sellerId) && !same(targetFreeSlotOwnerId, buyerId)) {
      await setDoc(doc(db, "freePlayerStatus", sellerId), {
        memberId: toNumber(sellerId),
        hasUsedFreeSlot: true,
        currentFreePlayerId: "",
        currentFreePlayerName: "",
        lostFreePlayerId: targetPlayerId,
        lostFreePlayerName: existing.targetPlayerName || targetPlayerRow?.name || "",
        lostFreePlayerAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    await addDoc(collection(db, "playerContracts"), {
      status: "active",
      playerId: targetPlayerId,
      playerName: existing.targetPlayerName || targetPlayerRow?.name || "",
      playerImage: existing.targetPlayerImage || targetPlayerRow?.image || "",
      playerPosition: existing.targetPlayerPosition || targetPlayerRow?.position || "",
      playerRating: existing.targetPlayerRating || targetPlayerRow?.rating || "",
      ownerMemberId: contractType === "loan" ? loanRealOwnerId : buyerId,
      ownerMemberName: contractType === "loan" ? loanRealOwnerName : (existing.fromMemberName || getMemberName(members, buyerId)),
      originalOwnerMemberId: contractType === "loan" ? loanRealOwnerId : baseOwnerId,
      originalOwnerMemberName: contractType === "loan" ? loanRealOwnerName : baseOwnerName,
      baseOwnerMemberId: baseOwnerId,
      baseOwnerMemberName: baseOwnerName,
      currentMemberId: buyerId,
      currentMemberName: existing.fromMemberName || getMemberName(members, buyerId),
      previousMemberId: sourceOwnerId,
      previousMemberName: sourceOwnerName,
      contractType: contractType === "loan" ? "loan" : "owned",
      rosterType: getRosterKindCode({ contractType: contractType === "loan" ? "loan" : "owned", originalOwnerMemberId: baseOwnerId, currentMemberId: buyerId, freeAgent: targetFreeOrigin && same(targetFreeSlotOwnerId, buyerId) }),
      isFreeOrigin: targetFreeOrigin,
      freeAgentOrigin: targetFreeOrigin,
      freeAgentSlotOwnerMemberId: targetFreeSlotOwnerId || "",
      sourceOfferId: offerId,
      amount: numericAmount,
      loanAmount: contractType === "loan" ? numericAmount : 0,
      loanDurationMonths: loanMonths,
      loanStartDate: todayDateKey,
      loanEndDate,
      pendingWindow: false,
      marketWasOpenAtApproval: false,
      marketExecutedAtWindowOpen: true,
      marketExecutionWindowId: windowInfo.windowId || "",
      marketExecutionWindowName: windowInfo.windowTitle || "",
      createdBy: authUser?.uid || "system",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, buyerId)) {
      await setDoc(doc(db, "freePlayerStatus", buyerId), {
        memberId: toNumber(buyerId),
        hasUsedFreeSlot: false,
        currentFreePlayerId: targetPlayerId,
        currentFreePlayerName: existing.targetPlayerName || targetPlayerRow?.name || "",
        returnedFreePlayerAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    const enrichedOfferedPlayers = [];
    for (const item of offeredPlayers) {
      const swapBaseOwnerId = cleanId(item.activeContract?.baseOwnerMemberId || item.activeContract?.baseOwnerId || item.activeContract?.originalBaseOwnerMemberId || item.activeContract?.originalOwnerMemberId || item.row?.memberid || buyerId);
      const swapBaseOwner = members.find((member) => same(member.id, swapBaseOwnerId));
      const swapBaseOwnerName = item.activeContract?.baseOwnerMemberName || item.activeContract?.originalBaseOwnerMemberName || item.activeContract?.originalOwnerMemberName || swapBaseOwner?.name || getMemberName(members, swapBaseOwnerId) || existing.fromMemberName || "";
      const swapSourceOwnerId = cleanId(item.activeContract?.currentMemberId || buyerId);
      const swapSourceOwnerName = item.activeContract?.currentMemberName || existing.fromMemberName || getMemberName(members, buyerId) || "";
      const swapFreeOrigin = isFreeOriginContract(item.activeContract);
      const swapFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(item.activeContract, swapFreeOrigin ? swapBaseOwnerId || buyerId : "");
      const exchangeContractType = normalizeExchangeContractType(item.exchangeContractType);
      const exchangeLoanMonths = exchangeContractType === "loan" ? normalizeExchangeLoanDuration(item.exchangeLoanDurationMonths) : null;
      const exchangeLoanEndDate = exchangeLoanMonths
        ? new Date(nowDate.getFullYear(), nowDate.getMonth() + exchangeLoanMonths, nowDate.getDate()).toISOString().slice(0, 10)
        : null;
      const exchangeOwnerId = exchangeContractType === "loan" ? swapSourceOwnerId : sellerId;
      const exchangeOwnerName = exchangeContractType === "loan" ? swapSourceOwnerName : (existing.toMemberName || getMemberName(members, sellerId));
      const exchangeOriginalOwnerId = exchangeContractType === "loan" ? swapSourceOwnerId : swapBaseOwnerId;
      const exchangeOriginalOwnerName = exchangeContractType === "loan" ? swapSourceOwnerName : swapBaseOwnerName;

      if (item.activeContract?.id) {
        await updateDoc(doc(db, "playerContracts", item.activeContract.id), {
          status: "replaced_exchange",
          replacedByOfferId: offerId,
          replacedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, buyerId) && !same(swapFreeSlotOwnerId, sellerId)) {
        await setDoc(doc(db, "freePlayerStatus", buyerId), {
          memberId: toNumber(buyerId),
          hasUsedFreeSlot: true,
          currentFreePlayerId: "",
          currentFreePlayerName: "",
          lostFreePlayerId: item.playerId,
          lostFreePlayerName: item.playerName || "",
          lostFreePlayerAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      await addDoc(collection(db, "playerContracts"), {
        status: "active",
        contractType: exchangeContractType === "loan" ? "loan" : "owned",
        playerId: item.playerId,
        playerName: item.playerName || "",
        playerImage: item.playerImage || "",
        playerPosition: item.playerPosition || "",
        playerRating: item.playerRating || "",
        ownerMemberId: exchangeOwnerId,
        ownerMemberName: exchangeOwnerName,
        originalOwnerMemberId: exchangeOriginalOwnerId,
        originalOwnerMemberName: exchangeOriginalOwnerName,
        baseOwnerMemberId: swapBaseOwnerId,
        baseOwnerMemberName: swapBaseOwnerName,
        currentMemberId: sellerId,
        currentMemberName: existing.toMemberName || getMemberName(members, sellerId),
        previousMemberId: swapSourceOwnerId,
        previousMemberName: swapSourceOwnerName,
        contractTypeLabel: exchangeContractType === "loan" ? ("تبادل - إعارة " + loanDurationLabel(exchangeLoanMonths)) : "تبادل - بيع كامل",
        rosterType: getRosterKindCode({ contractType: exchangeContractType === "loan" ? "loan" : "owned", originalOwnerMemberId: exchangeOriginalOwnerId, currentMemberId: sellerId, freeAgent: swapFreeOrigin && same(swapFreeSlotOwnerId, sellerId) }),
        isFreeOrigin: swapFreeOrigin,
        freeAgentOrigin: swapFreeOrigin,
        freeAgentSlotOwnerMemberId: swapFreeSlotOwnerId || "",
        sourceOfferId: offerId,
        source: "exchange_player",
        exchangeContractType,
        exchangeLoanDurationMonths: exchangeLoanMonths,
        amount: 0,
        loanAmount: 0,
        loanDurationMonths: exchangeLoanMonths,
        loanStartDate: exchangeContractType === "loan" ? todayDateKey : null,
        loanEndDate: exchangeContractType === "loan" ? exchangeLoanEndDate : null,
        marketWasOpenAtApproval: false,
        marketExecutedAtWindowOpen: true,
        marketExecutionWindowId: windowInfo.windowId || "",
        marketExecutionWindowName: windowInfo.windowTitle || "",
        createdBy: authUser?.uid || "system",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, sellerId)) {
        await setDoc(doc(db, "freePlayerStatus", sellerId), {
          memberId: toNumber(sellerId),
          hasUsedFreeSlot: false,
          currentFreePlayerId: item.playerId,
          currentFreePlayerName: item.playerName || "",
          returnedFreePlayerAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      enrichedOfferedPlayers.push({
        playerId: item.playerId,
        playerName: item.playerName || "",
        playerImage: item.playerImage || "",
        playerPosition: item.playerPosition || "",
        playerRating: item.playerRating || "",
        fromMemberId: buyerId,
        fromMemberName: existing.fromMemberName || getMemberName(members, buyerId),
        toMemberId: sellerId,
        toMemberName: existing.toMemberName || getMemberName(members, sellerId),
        exchangeContractType,
        exchangeLoanDurationMonths: exchangeLoanMonths,
        exchangeTypeLabel: exchangeContractType === "loan" ? "إعارة" : "بيع كامل",
        originalOwnerMemberId: swapBaseOwnerId,
        originalOwnerMemberName: swapBaseOwnerName,
        isFreeOrigin: swapFreeOrigin,
        freeAgentSlotOwnerMemberId: swapFreeSlotOwnerId || "",
      });
    }

    const historyPayload = {
      status: "completed",
      type: contractType === "loan" ? "loan" : "buy",
      typeLabel: contractType === "loan" ? "عقد إعارة" : (enrichedOfferedPlayers.length ? "عقد شراء + تبادل" : "عقد شراء"),
      playerId: targetPlayerId,
      playerName: existing.targetPlayerName || targetPlayerRow?.name || "",
      playerImage: existing.targetPlayerImage || targetPlayerRow?.image || "",
      playerPosition: existing.targetPlayerPosition || targetPlayerRow?.position || "",
      playerRating: existing.targetPlayerRating || targetPlayerRow?.rating || "",
      fromMemberId: sourceOwnerId,
      fromMemberName: sourceOwnerName,
      toMemberId: buyerId,
      toMemberName: existing.fromMemberName || getMemberName(members, buyerId),
      originalOwnerMemberId: contractType === "loan" ? loanRealOwnerId : baseOwnerId,
      originalOwnerMemberName: contractType === "loan" ? loanRealOwnerName : baseOwnerName,
      baseOwnerMemberId: baseOwnerId,
      baseOwnerMemberName: baseOwnerName,
      ownerMemberId: contractType === "loan" ? loanRealOwnerId : buyerId,
      ownerMemberName: contractType === "loan" ? loanRealOwnerName : (existing.fromMemberName || getMemberName(members, buyerId)),
      amount: numericAmount,
      loanDurationMonths: loanMonths,
      loanStartDate: contractType === "loan" ? todayDateKey : null,
      loanEndDate: contractType === "loan" ? loanEndDate : null,
      date: todayDateKey,
      periodId: windowInfo.windowId || getTransferWindowIdForDate(firebaseTransferWindows, todayDateKey),
      periodName: windowInfo.windowTitle || getTransferWindowNameForDate(firebaseTransferWindows, todayDateKey),
      seasonId: activeSeasonId,
      relatedOfferId: offerId,
      marketWasOpenAtApproval: false,
      marketExecutedAtWindowOpen: true,
      completedAt: serverTimestamp(),
      offeredPlayers: enrichedOfferedPlayers,
      exchangePlayerCount: enrichedOfferedPlayers.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "transferHistory"), historyPayload);

    await updateDoc(doc(db, "playerOffers", offerId), {
      status: "completed",
      completedAt: serverTimestamp(),
      marketExecutionCompletedAt: serverTimestamp(),
      marketExecutionWindowId: windowInfo.windowId || "",
      marketExecutionWindowName: windowInfo.windowTitle || "",
      pendingWindow: false,
      updatedAt: serverTimestamp(),
    });

    const targetPlayerName = existing.targetPlayerName || targetPlayerRow?.name || "";
    const buyerName = existing.fromMemberName || getMemberName(members, buyerId);
    const sellerName = existing.toMemberName || getMemberName(members, sellerId);
    const incomingTargetLabel = contractType === "loan" ? "كمحترف إعارة" : (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, buyerId) ? "كلاعب حر" : "كمحترف شراء");
    const outgoingTargetLabel = contractType === "loan" ? ("على سبيل الإعارة " + loanDurationLabel(loanMonths)) : "انتقالًا نهائيًا";

    await Promise.allSettled([
      sendRosterUpdateNotification({
        toMemberId: buyerId,
        fromMemberId: "FIFA",
        playerId: targetPlayerId,
        relatedOfferId: offerId,
        targetStatus: "incoming_player_registered",
        body: "تحديث على قائمة فريقك: تم تسجيل اللاعب " + targetPlayerName + " " + incomingTargetLabel,
      }),
      sendRosterUpdateNotification({
        toMemberId: sellerId,
        fromMemberId: "FIFA",
        playerId: targetPlayerId,
        relatedOfferId: offerId,
        targetStatus: "outgoing_player_transferred",
        body: "تحديث على قائمة فريقك: تم نقل اللاعب " + targetPlayerName + " إلى " + buyerName + " " + outgoingTargetLabel,
      }),
      ...enrichedOfferedPlayers.flatMap((item) => {
        const exchangeLoan = clean(item.exchangeContractType) === "loan";
        const exchangeIncomingLabel = exchangeLoan ? "كمحترف إعارة" : (item.isFreeOrigin && item.freeAgentSlotOwnerMemberId && same(item.freeAgentSlotOwnerMemberId, sellerId) ? "كلاعب حر" : "كمحترف شراء");
        const exchangeOutgoingLabel = exchangeLoan ? ("على سبيل الإعارة " + loanDurationLabel(item.exchangeLoanDurationMonths)) : "انتقالًا نهائيًا";
        return [
          sendRosterUpdateNotification({
            toMemberId: sellerId,
            fromMemberId: "FIFA",
            playerId: item.playerId,
            relatedOfferId: offerId,
            targetStatus: "incoming_exchange_player_registered",
            body: "تحديث على قائمة فريقك: تم تسجيل اللاعب " + (item.playerName || "") + " " + exchangeIncomingLabel,
          }),
          sendRosterUpdateNotification({
            toMemberId: buyerId,
            fromMemberId: "FIFA",
            playerId: item.playerId,
            relatedOfferId: offerId,
            targetStatus: "outgoing_exchange_player_transferred",
            body: "تحديث على قائمة فريقك: تم نقل اللاعب " + (item.playerName || "") + " إلى " + sellerName + " " + exchangeOutgoingLabel,
          }),
        ];
      }),
    ]);

    return { ok: true, offerId, playerId: targetPlayerId };
  }

  async function processPendingMarketActionsOnOpen(windowInfo = {}) {
    const pendingOffers = (firebasePlayerOffers || []).filter((offer) => clean(offer.status || "") === "approvedpendingwindow");
    const pendingFreeAgents = (firebaseFreeAgentQueue || []).filter((item) => clean(item.status || "") === "pending_window");

    const offerResults = [];
    const proCountLedger = new Map();
    const ledgerProCount = (memberId) => {
      const id = cleanId(memberId);
      if (!id) return 0;
      if (!proCountLedger.has(id)) proCountLedger.set(id, countMemberProPlayers(id));
      return proCountLedger.get(id) || 0;
    };
    const applyLedgerDelta = (memberId, delta) => {
      const id = cleanId(memberId);
      if (!id || !delta) return;
      proCountLedger.set(id, Math.max(0, ledgerProCount(id) + delta));
    };

    for (const offer of pendingOffers) {
      try {
        const deltas = getOfferProjectedProDeltas(offer);
        const buyerProjectedProCount = ledgerProCount(deltas.buyerId) + deltas.buyerDelta;
        const sellerProjectedProCount = ledgerProCount(deltas.sellerId) + deltas.sellerDelta;
        if (buyerProjectedProCount > MAX_PRO_PLAYERS || sellerProjectedProCount > MAX_PRO_PLAYERS) {
          const failureReason = buyerProjectedProCount > MAX_PRO_PLAYERS
            ? "تعذر تنفيذ الصفقة عند فتح السوق لأن قائمة المستفيد ستتجاوز حد 5 محترفين."
            : "تعذر تنفيذ الصفقة عند فتح السوق لأن قائمة صاحب لاعب التبادل ستتجاوز حد 5 محترفين.";
          await updateDoc(doc(db, "playerOffers", offer.id), {
            status: "executionFailed",
            pendingExecutionStatus: "failed",
            pendingExecutionFailureReason: failureReason,
            updatedAt: serverTimestamp(),
          });
          offerResults.push({ ok: false, offerId: offer.id, reason: "pro_limit_exceeded" });
          continue;
        }
        const result = await processPendingPlayerOfferOnMarketOpen(offer, windowInfo);
        offerResults.push(result);
        if (result?.ok) {
          applyLedgerDelta(deltas.buyerId, deltas.buyerDelta);
          applyLedgerDelta(deltas.sellerId, deltas.sellerDelta);
        }
      } catch (err) {
        console.error("Pending offer execution failed:", err);
        offerResults.push({ ok: false, offerId: offer.id, reason: err?.message || "unknown_error" });
      }
    }

    const freeAgentResults = [];
    for (const item of pendingFreeAgents) {
      try {
        await executeFreeAgentQueueItem(item, { marketOpenWindowInfo: windowInfo });
        freeAgentResults.push({ ok: true, queueId: item.id });
      } catch (err) {
        console.error("Pending free agent execution failed:", err);
        freeAgentResults.push({ ok: false, queueId: item.id, reason: err?.message || "unknown_error" });
      }
    }

    return {
      offers: offerResults,
      freeAgents: freeAgentResults,
      completedOffers: offerResults.filter((item) => item?.ok).length,
      completedFreeAgents: freeAgentResults.filter((item) => item?.ok).length,
    };
  }

  async function createFifaAdminMarketControl(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const action = clean(payload.action || "open_window");
    const title = String(payload.title || "").trim() || "فترة انتقالات";
    const startDate = String(payload.startDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
    const endDate = String(payload.endDate || "").slice(0, 10);
    const note = String(payload.note || "").trim();

    if (action === "open_window") {
      if (!endDate) throw new Error("حدد تاريخ نهاية فترة الانتقالات.");
      const windowRef = await addDoc(collection(db, "transferWindows"), {
        name: title,
        title,
        status: "open",
        startDate,
        endDate,
        note,
        source: "fifa_admin_market_control",
        createdBy: authUser?.uid || "",
        createdByMemberId: currentMemberId || "FIFA",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const notificationRef = await createAdminNotificationDoc({
        type: "transfer_window_open",
        title: "فتح سوق الانتقالات",
        body: note || ("تم فتح " + title + " حتى " + endDate + "."),
        audience: "all",
        relatedTransferWindowId: windowRef.id,
        source: "fifa_admin_market_control",
      });
      const pendingExecutionSummary = await processPendingMarketActionsOnOpen({
        windowId: windowRef.id,
        windowTitle: title,
        startDate,
        endDate,
      });
      await recordFifaAdminDecision({
        type: "transfer_window_open",
        typeLabel: "فتح سوق الانتقالات",
        status: "active",
        title,
        startDate,
        endDate,
        note,
        relatedTransferWindowId: windowRef.id,
        relatedNotificationId: notificationRef.id,
        pendingExecutionSummary,
        source: "fifa_admin_market_control",
        reversible: false,
      });
      return;
    }

    if (action === "close_windows") {
      const openRows = (firebaseTransferWindows || []).filter((item) => clean(item.status || "") === "open");
      await Promise.allSettled(openRows.map((item) => updateDoc(doc(db, "transferWindows", item.id), {
        status: "closed",
        closedAt: serverTimestamp(),
        closedBy: authUser?.uid || "",
        closeReason: note,
        updatedAt: serverTimestamp(),
      })));
      const notificationRef = await createAdminNotificationDoc({
        type: "transfer_window_closed",
        title: "إغلاق سوق الانتقالات",
        body: note || "تم إغلاق سوق الانتقالات بقرار FIFA.",
        audience: "all",
        source: "fifa_admin_market_control",
      });
      await recordFifaAdminDecision({
        type: "transfer_window_closed",
        typeLabel: "إغلاق سوق الانتقالات",
        status: "completed",
        relatedTransferWindowIds: openRows.map((item) => item.id),
        relatedNotificationId: notificationRef.id,
        note,
        source: "fifa_admin_market_control",
        reversible: false,
      });
      return;
    }


    if (action === "update_window") {
      const windowId = cleanId(payload.windowId || "");
      if (!windowId) throw new Error("اختر فترة الانتقالات المراد تعديلها.");
      const existingWindow = (firebaseTransferWindows || []).find((item) => same(item.id, windowId));
      if (!existingWindow) throw new Error("فترة الانتقالات غير موجودة.");
      const nextTitle = String(payload.title || existingWindow.title || existingWindow.name || "فترة انتقالات").trim() || "فترة انتقالات";
      const nextStartDate = String(payload.startDate || existingWindow.startDate || startDate).slice(0, 10);
      const nextEndDate = String(payload.endDate || existingWindow.endDate || "").slice(0, 10);
      if (!nextEndDate) throw new Error("حدد تاريخ نهاية فترة الانتقالات.");
      await updateDoc(doc(db, "transferWindows", windowId), {
        name: nextTitle,
        title: nextTitle,
        startDate: nextStartDate,
        endDate: nextEndDate,
        note: note || existingWindow.note || "",
        updatedAt: serverTimestamp(),
        updatedBy: authUser?.uid || "",
        updatedByMemberId: currentMemberId || "FIFA",
      });
      await recordFifaAdminDecision({
        type: "transfer_window_updated",
        typeLabel: "تعديل فترة انتقالات",
        status: "completed",
        title: nextTitle,
        startDate: nextStartDate,
        endDate: nextEndDate,
        note,
        relatedTransferWindowId: windowId,
        source: "fifa_admin_market_control",
        reversible: false,
      });
      return;
    }

    if (action === "cancel_window") {
      const windowId = cleanId(payload.windowId || "");
      if (!windowId) throw new Error("اختر فترة الانتقالات المراد إلغاؤها.");
      const existingWindow = (firebaseTransferWindows || []).find((item) => same(item.id, windowId));
      if (!existingWindow) throw new Error("فترة الانتقالات غير موجودة.");
      await updateDoc(doc(db, "transferWindows", windowId), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancelledBy: authUser?.uid || "",
        cancelledByMemberId: currentMemberId || "FIFA",
        cancelReason: note || "إلغاء إداري لفترة الانتقالات",
        updatedAt: serverTimestamp(),
      });
      await recordFifaAdminDecision({
        type: "transfer_window_cancelled",
        typeLabel: "إلغاء فترة انتقالات",
        status: "cancelled",
        title: existingWindow.title || existingWindow.name || "فترة انتقالات",
        startDate: existingWindow.startDate || "",
        endDate: existingWindow.endDate || "",
        note: note || "إلغاء إداري لفترة الانتقالات",
        relatedTransferWindowId: windowId,
        source: "fifa_admin_market_control",
        reversible: false,
      });
      return;
    }

    if (action === "delete_window") {
      const windowId = cleanId(payload.windowId || "");
      if (!windowId) throw new Error("اختر فترة الانتقالات المراد حذفها.");
      const existingWindow = (firebaseTransferWindows || []).find((item) => same(item.id, windowId));
      if (!existingWindow) throw new Error("فترة الانتقالات غير موجودة.");
      await deleteDoc(doc(db, "transferWindows", windowId));
      await recordFifaAdminDecision({
        type: "transfer_window_deleted",
        typeLabel: "حذف فترة انتقالات",
        status: "completed",
        title: existingWindow.title || existingWindow.name || "فترة انتقالات",
        startDate: existingWindow.startDate || "",
        endDate: existingWindow.endDate || "",
        note: note || "حذف إداري من السجلات",
        relatedTransferWindowId: windowId,
        source: "fifa_admin_market_control",
        reversible: false,
      });
      return;
    }

    throw new Error("إجراء سوق الانتقالات غير معروف.");
  }

  function assertTransferAllowed(memberId, action) {
    const restriction = getBlockingTransferRestriction(firebaseMemberRestrictions, memberId, action);
    if (!restriction) return;
    throw new Error(transferRestrictionBlockMessage(restriction, action));
  }


  async function createFifaLeagueCompetition(payload = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const requestedCompetitionType = competitionTypeKey(payload.competitionType || "league");
    const competitionType = ["league", "league_qualifier", "cup", "super_cup", "world_cup", "champions_league"].includes(requestedCompetitionType) ? requestedCompetitionType : "league";
    const name = String(payload.name || "").trim();
    const seasonId = cleanId(payload.seasonId || activeSeasonId || "S6");
    let participantIds = Array.isArray(payload.participantIds) ? payload.participantIds.map(cleanId).filter(Boolean) : [];
    const cupLinkedLeagueCompetitionId = competitionType === "cup" ? cleanId(payload.cupLinkedLeagueCompetitionId || payload.linkedLeagueCompetitionId || "") : "";
    const linkedLeagueCompetition = cupLinkedLeagueCompetitionId ? (firebaseCompetitions || []).find((item) => same(item.id, cupLinkedLeagueCompetitionId)) : null;
    const cupLinkedLeagueGroupsEnabled = competitionType === "cup" && Boolean(cupLinkedLeagueCompetitionId);
    if (cupLinkedLeagueGroupsEnabled) {
      if (!linkedLeagueCompetition) throw new Error("اختر نسخة دوري مجموعتين موجودة لربط الكأس بها.");
      if (!isLeagueGroupsCompetition(linkedLeagueCompetition)) throw new Error("ربط الكأس متاح فقط مع نسخة دوري بنظام مجموعتين.");
      participantIds = getLinkedLeagueCupParticipantRows(linkedLeagueCompetition).map((row) => cleanId(row.memberId)).filter(Boolean);
    }
    if (!name) {
      const nameError = competitionType === "league_qualifier" ? "اكتب اسم ملحق الدوري." : competitionType === "cup" ? "اكتب اسم بطولة الكأس." : competitionType === "super_cup" ? "اكتب اسم كأس السوبر." : competitionType === "world_cup" ? "اكتب اسم كأس العالم." : competitionType === "champions_league" ? "اكتب اسم دوري الأبطال." : "اكتب اسم الدوري.";
      throw new Error(nameError);
    }
    if (participantIds.length < 2) throw new Error("اختر عضوين على الأقل لإنشاء البطولة.");
    const worldCupQualifiersEnabled = Boolean(payload.worldCupQualifiersEnabled);
    const championsLeagueQualifiersEnabled = Boolean(payload.championsLeagueQualifiersEnabled);
    const leagueFormat = competitionType === "league" && ["two_groups", "league_two_groups_knockout"].includes(clean(payload.leagueFormat || payload.leagueGroupMode || "")) ? "two_groups" : "single_group";
    const leagueTwoGroupsEnabled = competitionType === "league" && leagueFormat === "two_groups";
    if (competitionType === "super_cup" && participantIds.length !== 2) throw new Error("كأس السوبر مباراة نهائية بين عضوين فقط. اختر عضوين بالضبط.");
    if (competitionType === "world_cup" && participantIds.length < 4) throw new Error("كأس العالم يحتاج 4 مشاركين على الأقل حتى يمكن تكوين المتأهلين الأربعة للأدوار الإقصائية.");
    if (competitionType === "champions_league" && participantIds.length < 4) throw new Error("دوري الأبطال يحتاج 4 مشاركين على الأقل حتى يمكن تكوين مجموعتين ونصف النهائي.");
    if (leagueTwoGroupsEnabled && participantIds.length < 4) throw new Error("الدوري بنظام مجموعتين يحتاج 4 مشاركين على الأقل.");
    if (leagueTwoGroupsEnabled && participantIds.length > 8) throw new Error("الدوري بنظام مجموعتين يدعم حتى 8 مشاركين حاليًا.");
    const leagueQualifierEnabled = competitionType === "league" && !leagueTwoGroupsEnabled && Boolean(payload.leagueQualifierEnabled);
    const leagueQualifierParticipantIds = Array.isArray(payload.leagueQualifierParticipantIds) ? payload.leagueQualifierParticipantIds.map(cleanId).filter(Boolean) : [];
    const leagueQualifierQualifiedCount = Math.max(1, Math.min(toNumber(payload.leagueQualifierQualifiedCount || payload.qualifiersCount || 1), 5));
    if (competitionType === "world_cup" && participantIds.length > 9 && !worldCupQualifiersEnabled) throw new Error("كأس العالم الأساسي حده 9 أعضاء. عند اختيار أكثر من 9 فعّل خيار تصفيات كأس العالم داخل نفس النسخة.");
    if (competitionType === "world_cup" && participantIds.length > 18) throw new Error("تصفيات كأس العالم الحالية تدعم حتى 18 مشاركًا كحد أقصى حتى يتم تأهيل 9 أعضاء لدور المجموعات.");
    if (competitionType === "champions_league" && participantIds.length > 8 && !championsLeagueQualifiersEnabled) throw new Error("دوري الأبطال الأساسي حده 8 أعضاء. عند اختيار أكثر من 8 فعّل ملحق دوري الأبطال داخل نفس النسخة.");
    if (competitionType === "champions_league" && participantIds.length > 16) throw new Error("ملحق دوري الأبطال الحالي يدعم حتى 16 مشاركًا كحد أقصى حتى يتم تأهيل 8 أعضاء لدور المجموعات.");
    if (competitionType === "cup" && participantIds.length > 8) throw new Error("بطولة الكأس تدعم حتى 8 مشاركين، ومع العدد الأقل يتم تطبيق التأهل المباشر / BYE تلقائيًا.");
    if (leagueQualifierEnabled) {
      if (leagueQualifierParticipantIds.length < 2) throw new Error("اختر عضوين على الأقل لملحق الدوري داخل نفس النسخة.");
      if (leagueQualifierParticipantIds.length > 5) throw new Error("ملحق الدوري يدعم من 2 إلى 5 أعضاء كحد أقصى.");
      if (leagueQualifierQualifiedCount >= leagueQualifierParticipantIds.length) throw new Error("عدد المتأهلين من الملحق يجب أن يكون أقل من عدد أعضاء الملحق.");
      const overlap = participantIds.some((id) => leagueQualifierParticipantIds.some((qid) => same(id, qid)));
      if (overlap) throw new Error("لا يمكن أن يكون العضو مشاركًا مباشرًا في الدوري وداخل الملحق في نفس الوقت.");
      if (participantIds.length + leagueQualifierQualifiedCount > 8) throw new Error("عدد المشاركين المباشرين + المتأهلين من الملحق يجب ألا يتجاوز 8 أعضاء في الدوري.");
    }

    const manualSeeds = payload.manualSeeds && typeof payload.manualSeeds === "object" ? payload.manualSeeds : {};
    const cupManualPairingsEnabled = competitionType === "cup" && !cupLinkedLeagueGroupsEnabled && Boolean(payload.cupManualPairingsEnabled);
    const cupManualPairings = cupManualPairingsEnabled ? normalizeCupManualPairings(payload.cupPairings) : [];
    const participantRows = participantIds
      .map((id) => members.find((member) => same(member.id, id)))
      .filter(Boolean)
      .map((member, index) => ({
        memberId: cleanId(member.id),
        memberName: member.name || cleanId(member.id),
        avatar: member.avatar || avatar(member.name || member.id),
        image: member.avatar || avatar(member.name || member.id),
        order: index + 1,
        seed: ["league", "cup", "world_cup", "champions_league"].includes(competitionType) ? Math.max(1, toNumber(manualSeeds[cleanId(member.id)] || index + 1)) : index + 1,
        status: "active",
      }))
      .sort((a, b) => ["league", "cup", "world_cup", "champions_league"].includes(competitionType) ? (toNumber(a.seed) - toNumber(b.seed) || clean(a.memberName).localeCompare(clean(b.memberName), "ar")) : 0);

    if (["league", "cup", "world_cup", "champions_league"].includes(competitionType)) {
      const seedValues = participantRows.map((item) => toNumber(item.seed)).filter(Boolean);
      const requiresUniqueSeeds = (competitionType === "cup" && !cupManualPairingsEnabled && !cupLinkedLeagueGroupsEnabled) || (competitionType === "league" && !leagueTwoGroupsEnabled);
      if (requiresUniqueSeeds && new Set(seedValues).size !== seedValues.length) throw new Error(competitionType === "league" ? "لا يمكن تكرار نفس تصنيف الدوري في نظام المجموعة الواحدة." : "لا يمكن تكرار نفس التصنيف في بطولة الكأس.");
      if (competitionType === "cup" && seedValues.some((seed) => seed < 1 || seed > 8)) throw new Error("تصنيف الكأس يجب أن يكون من 1 إلى 8.");
      if (competitionType === "league" && seedValues.some((seed) => seed < 1)) throw new Error("تصنيف الدوري يجب أن يبدأ من 1 ولا يمكن أن يكون صفرًا أو أقل.");
      if (competitionType === "world_cup" && seedValues.some((seed) => seed < 1)) throw new Error("تصنيف كأس العالم يجب أن يبدأ من 1 ولا يمكن أن يكون صفرًا أو أقل.");
      if (competitionType === "champions_league" && seedValues.some((seed) => seed < 1)) throw new Error("تصنيف دوري الأبطال يجب أن يبدأ من 1 ولا يمكن أن يكون صفرًا أو أقل.");
    }
    if (cupManualPairingsEnabled) validateCupManualPairings(cupManualPairings, participantRows);

    const roundsMode = clean(payload.roundsMode || "single") === "double" ? "double" : "single";
    const rewards = normalizeCompetitionRewards(payload.rewards || {});
    const autoPayRewards = Boolean(payload.autoPayRewards);
    const onlineMemberId = cleanId(payload.onlineMemberId || participantRows.find(isAbdullahLike)?.memberId || "");
    const fifaQuotaPerMember = Math.max(0, toNumber(payload.fifaQuotaPerMember ?? 2));
    const maxFifaPerRound = Math.max(1, toNumber(payload.maxFifaPerRound ?? fifaQuotaPerMember ?? 2));
    const gameDistributionMode = ["auto", "fifa2025_only", "pes2017_only", "mixed_manual"].includes(clean(payload.gameDistributionMode || "auto")) ? clean(payload.gameDistributionMode || "auto") : "auto";
    const fifa2025MatchCount = Math.max(0, toNumber(payload.fifa2025MatchCount ?? payload.fifaTargetCount ?? 0));
    const startDate = String(payload.startDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
    const endDate = String(payload.endDate || "").slice(0, 10);
    const qualifiersCount = Math.max(1, Math.min(toNumber(payload.qualifiersCount || 1), Math.max(1, participantRows.length - 1)));
    let matches = [];
    let standings = [];
    let gameQuota = null;
    let competitionParticipants = participantRows;
    let leagueQualifierObject = null;

    if (competitionType === "league") {
      if (leagueTwoGroupsEnabled) {
        const leagueGroupsPlan = generateLeagueTwoGroupsMatches(participantRows, { onlineMemberId });
        matches = leagueGroupsPlan.matches;
        gameQuota = leagueGroupsPlan.gameQuota;
        competitionParticipants = leagueGroupsPlan.participants || participantRows;
        standings = [];
      } else {
        let leagueParticipantsForSchedule = participantRows;
        if (leagueQualifierEnabled) {
          const qualifierRows = leagueQualifierParticipantIds
            .map((id) => members.find((member) => same(member.id, id)))
            .filter(Boolean)
            .map((member, index) => ({
              memberId: cleanId(member.id),
              memberName: member.name || cleanId(member.id),
              avatar: member.avatar || avatar(member.name || member.id),
              image: member.avatar || avatar(member.name || member.id),
              order: index + 1,
              seed: index + 1,
              status: "qualifier",
            }));
          const qualifierPlan = generateLeagueQualifierMatches(qualifierRows, leagueQualifierQualifiedCount, { onlineMemberId });
          const qualifierSlots = Array.from({ length: leagueQualifierQualifiedCount }, (_, index) => ({
            memberId: `__league_qualifier_winner_${index + 1}`,
            memberName: `المتأهل من ملحق الدوري ${index + 1}`,
            avatar: avatar(`متأهل ${index + 1}`),
            image: avatar(`متأهل ${index + 1}`),
            order: participantRows.length + index + 1,
            seed: participantRows.length + index + 1,
            status: "pending_qualifier",
            isLeagueQualifierWinnerSlot: true,
            qualifierWinnerIndex: index + 1,
          }));
          leagueParticipantsForSchedule = [...participantRows, ...qualifierSlots];
          leagueQualifierObject = {
            enabled: true,
            type: "league",
            name: `ملحق ${name}`,
            linkedCompetitionName: name,
            qualifiedCount: leagueQualifierQualifiedCount,
            participantIds: qualifierRows.map((row) => row.memberId),
            participants: qualifierRows,
            matches: qualifierPlan.matches.map((match) => ({ ...match, scope: "league_qualifier", parentCompetitionType: "league" })),
            qualifiedMemberIds: [],
            status: "active",
            createdAtText: new Date().toISOString(),
          };
        }
        const baseMatches = generateLeagueRoundRobinMatches(leagueParticipantsForSchedule, roundsMode);
        const platformPlan = assignLeagueGamePlatforms(baseMatches, leagueParticipantsForSchedule, { onlineMemberId, maxFifaPerRound });
        matches = platformPlan.matches;
        gameQuota = platformPlan.gameQuota;
        competitionParticipants = leagueParticipantsForSchedule;
        standings = computeLeagueStandings(leagueParticipantsForSchedule, matches);
      }
    } else if (competitionType === "league_qualifier") {
      const qualifierPlan = generateLeagueQualifierMatches(participantRows, qualifiersCount, { onlineMemberId });
      matches = qualifierPlan.matches;
      gameQuota = qualifierPlan.gameQuota;
      standings = [];
    } else if (competitionType === "cup") {
      if (cupLinkedLeagueGroupsEnabled) {
        const cupPlan = generateLinkedLeagueGroupsCupPlan({ linkedLeague: linkedLeagueCompetition, onlineMemberId });
        matches = cupPlan.matches;
        gameQuota = cupPlan.gameQuota;
        competitionParticipants = cupPlan.participants.length ? cupPlan.participants : participantRows;
      } else {
        const cupPlan = generateSeededKnockoutBracketMatches(participantRows, { onlineMemberId, prefix: "CUP", title: "الكأس", manualPairings: cupManualPairingsEnabled ? cupManualPairings : [] });
        matches = cupPlan.matches;
        gameQuota = cupPlan.gameQuota;
      }
      standings = [];
    } else if (competitionType === "super_cup") {
      const superCupPlan = generateSeededKnockoutBracketMatches(participantRows, { onlineMemberId, prefix: "SUPER", title: "كأس السوبر" });
      matches = superCupPlan.matches.map((match) => ({ ...match, label: "نهائي كأس السوبر", phase: "final", round: 1 }));
      gameQuota = { ...(superCupPlan.gameQuota || {}), format: "single_final" };
      standings = [];
    } else if (competitionType === "world_cup") {
      const worldCupPlan = generateWorldCupMatches(participantRows, { onlineMemberId, enableQualifiers: worldCupQualifiersEnabled });
      matches = worldCupPlan.matches;
      gameQuota = worldCupPlan.gameQuota;
      competitionParticipants = worldCupPlan.participants || participantRows;
      standings = [];
    } else if (competitionType === "champions_league") {
      const championsPlan = generateChampionsLeagueMatches(participantRows, { onlineMemberId, enableQualifiers: championsLeagueQualifiersEnabled });
      matches = championsPlan.matches;
      gameQuota = championsPlan.gameQuota;
      competitionParticipants = championsPlan.participants || participantRows;
      standings = [];
    }

    if (leagueQualifierObject?.enabled) {
      const qualifierMatchCount = Array.isArray(leagueQualifierObject.matches) ? leagueQualifierObject.matches.length : 0;
      const combinedGameMatches = applyCompetitionGameMode([...(leagueQualifierObject.matches || []), ...matches], { gameDistributionMode, fifa2025MatchCount });
      leagueQualifierObject = { ...leagueQualifierObject, matches: combinedGameMatches.slice(0, qualifierMatchCount) };
      matches = combinedGameMatches.slice(qualifierMatchCount);
    } else {
      matches = applyCompetitionGameMode(matches, { gameDistributionMode, fifa2025MatchCount });
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const typeLabel = competitionTypeLabel(competitionType);

    const competitionRef = await addDoc(collection(db, "competitions"), {
      type: competitionType,
      typeLabel,
      name,
      logo: competitionLogoUrl({ type: competitionType }, config, trophyMap),
      seasonId,
      status: "active",
      startDate,
      endDate,
      roundsMode: competitionType === "league" ? (leagueTwoGroupsEnabled ? "groups_knockout" : roundsMode) : competitionType === "super_cup" ? "single_final" : ["world_cup", "champions_league"].includes(competitionType) ? "groups_knockout" : "knockout",
      leagueFormat: competitionType === "league" ? leagueFormat : "",
      bracketMode: competitionType === "super_cup" ? "single_final" : competitionType === "cup" ? (cupLinkedLeagueGroupsEnabled ? "linked_league_groups" : cupManualPairingsEnabled ? "manual_knockout" : "seeded_knockout") : competitionType === "world_cup" ? "world_cup_groups_knockout" : competitionType === "champions_league" ? "champions_league_groups_knockout" : (competitionType === "league_qualifier" ? "qualifier_knockout" : leagueTwoGroupsEnabled ? "league_two_groups_knockout" : "league"),
      cupMode: competitionType === "cup" ? (cupLinkedLeagueGroupsEnabled ? "linked_league_groups" : cupManualPairingsEnabled ? "manual" : "seeded") : "",
      cupLinkedLeagueGroupsEnabled,
      linkedLeagueCompetitionId: cupLinkedLeagueCompetitionId,
      linkedLeagueCompetitionName: linkedLeagueCompetition?.name || "",
      cupManualPairingsEnabled,
      cupPairings: cupManualPairings,
      qualifiersCount: competitionType === "league_qualifier" ? qualifiersCount : ["world_cup", "champions_league"].includes(competitionType) ? 4 : null,
      rewards,
      autoPayRewards,
      gameRules: {
        mainGames: ["PES 2017", "FIFA 2025"],
        onlineMemberId,
        fifaQuotaPerMember,
        maxFifaPerRound,
        gameDistributionMode,
        fifa2025MatchCount,
        gameQuota,
        rule: gameDistributionMode === "fifa2025_only" ? "اختيار إداري: كل المباريات على FIFA 2025." : gameDistributionMode === "pes2017_only" ? "اختيار إداري: كل المباريات على PES 2017." : gameDistributionMode === "mixed_manual" ? `اختيار إداري: مكس بين اللعبتين، ${fifa2025MatchCount} مباراة على FIFA 2025 والباقي PES 2017.` : "أي مباراة تشمل عضو الأونلاين تكون FIFA 2025، وكل جولة تحاول احتواء مباريات FIFA 2025 والباقي PES 2017 مع توزيع عادل.",
      },
      participants: competitionParticipants,
      matches,
      standings,
      relegatedMemberIds: [],
      absentMemberIds: [],
      qualifiedMemberIds: [],
      leagueQualifier: leagueQualifierObject,
      championMemberId: "",
      championMemberName: "",
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: todayDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "adminDecisions"), {
      type: competitionType === "league_qualifier" ? "league_qualifier_created" : competitionType === "cup" ? "cup_created" : competitionType === "super_cup" ? "super_cup_created" : competitionType === "world_cup" ? "world_cup_created" : "league_created",
      status: "active",
      title: competitionType === "league_qualifier" ? "إنشاء ملحق دوري" : competitionType === "cup" ? "إنشاء بطولة الكأس" : competitionType === "super_cup" ? "إنشاء كأس السوبر" : competitionType === "world_cup" ? "إنشاء كأس العالم" : competitionType === "champions_league" ? "إنشاء دوري الأبطال" : "إنشاء دوري",
      body: "تم إنشاء " + name + " بعدد " + participantRows.length + " مشاركين.",
      competitionId: competitionRef.id,
      competitionName: name,
      competitionType,
      seasonId,
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: todayDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      type: competitionType === "league_qualifier" ? "league_qualifier_created" : competitionType === "cup" ? "cup_created" : competitionType === "super_cup" ? "super_cup_created" : competitionType === "world_cup" ? "world_cup_created" : "league_created",
      title: competitionType === "league_qualifier" ? "تم إنشاء ملحق دوري" : competitionType === "cup" ? "تم إنشاء بطولة الكأس" : competitionType === "super_cup" ? "تم إنشاء كأس السوبر" : competitionType === "world_cup" ? "تم إنشاء كأس العالم" : competitionType === "champions_league" ? "تم إنشاء دوري الأبطال" : "تم إنشاء دوري جديد",
      body: "تم إنشاء " + name + " في FIFA GROUP. يمكنك متابعة الجدول والنتائج من صفحة " + (config.seasonName || "الموسم") + " داخل التطبيق.",
      status: "unread",
      audience: "all",
      fromMemberId: "FIFA",
      fromMemberName: "FIFA",
      source: "fifa_admin_competitions",
      relatedCompetitionId: competitionRef.id,
      clickUrl: "/?fgPage=season&fgCompetitionId=" + encodeURIComponent(competitionRef.id),
      createdBy: authUser?.uid || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function syncLinkedCupsForLeagueCompetition(leagueCompetition = {}) {
    if (!leagueCompetition?.id || !isLeagueGroupsCompetition(leagueCompetition)) return;
    const linkedCups = (firebaseCompetitions || []).filter((item) =>
      isLinkedLeagueGroupsCup(item) &&
      same(item.linkedLeagueCompetitionId || item.linkedLeagueId, leagueCompetition.id) &&
      !["cancelled", "completed"].includes(clean(item.status || "active"))
    );
    if (!linkedCups.length) return;

    await Promise.allSettled(linkedCups.map(async (cup) => {
      const plan = generateLinkedLeagueGroupsCupPlan({
        linkedLeague: leagueCompetition,
        existingCup: cup,
        onlineMemberId: cup?.gameRules?.onlineMemberId || leagueCompetition?.gameRules?.onlineMemberId || "",
      });
      const oldMatchesJson = JSON.stringify(cup.matches || []);
      const newMatchesJson = JSON.stringify(plan.matches || []);
      const oldParticipantsJson = JSON.stringify(cup.participants || []);
      const newParticipantsJson = JSON.stringify(plan.participants || []);
      if (oldMatchesJson === newMatchesJson && oldParticipantsJson === newParticipantsJson) return;
      await updateDoc(doc(db, "competitions", cup.id), {
        matches: plan.matches,
        participants: plan.participants.length ? plan.participants : (cup.participants || []),
        gameRules: {
          ...(cup.gameRules || {}),
          gameQuota: {
            ...((cup.gameRules || {}).gameQuota || {}),
            ...(plan.gameQuota || {}),
          },
        },
        linkedCupLastSyncedAt: serverTimestamp(),
        linkedCupLastSyncedFromLeagueId: leagueCompetition.id,
        updatedAt: serverTimestamp(),
      });
    }));
  }

  function resolveEmbeddedLeagueQualifierLinks(competition = {}, nextQualifier = null, baseMatchesArg = null, baseParticipantsArg = null) {
    const qualifier = nextQualifier || competition.leagueQualifier || {};
    const qCount = Math.max(1, toNumber(qualifier.qualifiedCount || competition.leagueQualifier?.qualifiedCount || 1));
    const qualifiedIds = computeLeagueQualifierQualifiedIds({ matches: qualifier.matches || [], qualifiersCount: qCount });
    const qualifiedRows = qualifiedIds.map((id) => {
      const row = (qualifier.participants || []).find((item) => same(item.memberId || item.id, id)) || (competition.participants || []).find((item) => same(item.memberId || item.id, id)) || members.find((item) => same(item.id, id));
      return { memberId: cleanId(id), memberName: row?.memberName || row?.name || getMemberName(members, id) || id, avatar: row?.avatar || row?.image || avatar(row?.memberName || row?.name || id), image: row?.image || row?.avatar || avatar(row?.memberName || row?.name || id) };
    });
    const slotMap = new Map();
    qualifiedRows.forEach((row, index) => slotMap.set(`__league_qualifier_winner_${index + 1}`, row));
    const replaceSide = (memberId, name) => {
      const safe = String(memberId || "");
      const row = slotMap.get(safe);
      if (!row) return { memberId, name };
      return { memberId: row.memberId, name: row.memberName };
    };
    const baseMatches = Array.isArray(baseMatchesArg) ? baseMatchesArg : (Array.isArray(competition.matches) ? competition.matches : []);
    const baseParticipants = Array.isArray(baseParticipantsArg) ? baseParticipantsArg : (Array.isArray(competition.participants) ? competition.participants : []);
    const resolvedParticipants = baseParticipants.map((participant) => {
      const row = slotMap.get(String(participant.memberId || participant.id || ""));
      return row ? { ...participant, ...row, status: "active", resolvedFromLeagueQualifier: true } : participant;
    });
    const resolvedMatches = baseMatches.map((match) => {
      const home = replaceSide(match.homeMemberId, match.homeName);
      const away = replaceSide(match.awayMemberId, match.awayName);
      return { ...match, homeMemberId: home.memberId, homeName: home.name, awayMemberId: away.memberId, awayName: away.name };
    });
    return { qualifiedIds, resolvedParticipants, resolvedMatches, qualifier: { ...qualifier, qualifiedMemberIds: qualifiedIds, status: qualifiedIds.length >= qCount ? "completed" : (qualifier.status || "active") } };
  }

  async function updateFifaLeagueMatchResult({ competitionId, matchId, homeGoals, awayGoals, homePens, awayPens, gameTitle }) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const competition = firebaseCompetitions.find((item) => same(item.id, competitionId));
    if (!competition) throw new Error("البطولة غير موجودة.");
    const competitionType = competitionTypeKey(competition.type || "league");
    const leagueGroupsMode = isLeagueGroupsCompetition(competition);
    if (!["league", "league_qualifier", "cup", "super_cup", "world_cup", "champions_league"].includes(competitionType)) throw new Error("هذه العملية مخصصة للبطولات التنافسية المدعومة فقط.");
    if (["completed", "cancelled"].includes(clean(competition.status || "active")) && !["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) && !leagueGroupsMode) throw new Error("لا يمكن تعديل نتائج بطولة مغلقة أو ملغاة.");
    const h = toNumber(homeGoals);
    const a = toNumber(awayGoals);
    if (h < 0 || a < 0 || String(homeGoals).trim() === "" || String(awayGoals).trim() === "") {
      throw new Error("أدخل نتيجة صحيحة للطرفين.");
    }

    const embeddedLeagueQualifier = competitionType === "league" && competition.leagueQualifier?.enabled ? competition.leagueQualifier : null;
    if (embeddedLeagueQualifier && (embeddedLeagueQualifier.matches || []).some((match) => same(match.id, matchId))) {
      const beforeQualifiedIds = computeLeagueQualifierQualifiedIds({ matches: embeddedLeagueQualifier.matches || [], qualifiersCount: embeddedLeagueQualifier.qualifiedCount || 1 });
      let nextQualifierMatches = (embeddedLeagueQualifier.matches || []).map((match) => {
        if (!same(match.id, matchId)) return match;
        if (String(match.homeMemberId || "").startsWith("__") || String(match.awayMemberId || "").startsWith("__")) throw new Error("هذه المباراة بانتظار تحديد المتأهل من مرحلة سابقة.");
        const hp = String(homePens ?? "").trim() === "" ? null : toNumber(homePens);
        const ap = String(awayPens ?? "").trim() === "" ? null : toNumber(awayPens);
        let winnerMemberId = h > a ? cleanId(match.homeMemberId) : a > h ? cleanId(match.awayMemberId) : "";
        let winnerName = h > a ? match.homeName : a > h ? match.awayName : "";
        if (!winnerMemberId) {
          if (hp === null || ap === null || hp === ap) throw new Error("في مباريات الملحق الإقصائية، أدخل ركلات الترجيح عند التعادل وحدد متأهلًا.");
          winnerMemberId = hp > ap ? cleanId(match.homeMemberId) : cleanId(match.awayMemberId);
          winnerName = hp > ap ? match.homeName : match.awayName;
        }
        return { ...match, homeGoals: h, awayGoals: a, homePens: hp, awayPens: ap, resultStatus: "completed", status: "completed", winnerMemberId, winnerName, gameTitle: String(gameTitle || match.gameTitle || "").trim() || match.gameTitle || "PES 2017", gameCode: clean(gameTitle || match.gameTitle || "").includes("fifa") || String(gameTitle || match.gameTitle || "").includes("2025") ? "fifa25" : match.gameCode || "pes17", updatedAtText: new Date().toISOString() };
      });
      nextQualifierMatches = resolveLeagueQualifierDependencies(nextQualifierMatches);
      const resolved = resolveEmbeddedLeagueQualifierLinks(competition, { ...embeddedLeagueQualifier, matches: nextQualifierMatches }, competition.matches || [], competition.participants || []);
      const standings = computeLeagueStandings(resolved.resolvedParticipants, resolved.resolvedMatches);
      await updateDoc(doc(db, "competitions", competitionId), { matches: resolved.resolvedMatches, participants: resolved.resolvedParticipants, standings, leagueQualifier: resolved.qualifier, updatedAt: serverTimestamp(), lastResultAt: serverTimestamp() });
      const qCount = Math.max(1, toNumber(embeddedLeagueQualifier.qualifiedCount || 1));
      if (beforeQualifiedIds.length < qCount && resolved.qualifiedIds.length >= qCount) {
        const names = resolved.qualifiedIds.map((id) => getMemberName(members, id) || id).join("، ");
        await addDoc(collection(db, "notifications"), { type: "league_qualifier_completed", title: "نتيجة ملحق الدوري", body: `نتيجة ${embeddedLeagueQualifier.name || ("ملحق " + (competition.name || "الدوري"))}: المتأهلون إلى الدوري هم ${names}.`, audience: "all", fromMemberId: "FIFA", fromMemberName: "FIFA", source: "fifa_admin_competitions", relatedCompetitionId: competitionId, clickUrl: "/?fgPage=season&fgCompetitionId=" + encodeURIComponent(competitionId), createdBy: authUser?.uid || "", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      return;
    }

    const matches = Array.isArray(competition.matches) ? competition.matches : [];
    let nextMatches = matches.map((match) => {
      if (!same(match.id, matchId)) return match;
      if (String(match.homeMemberId || "").startsWith("__") || String(match.awayMemberId || "").startsWith("__")) {
        throw new Error("هذه المباراة بانتظار تحديد المتأهل من مرحلة سابقة.");
      }
      const hp = String(homePens ?? "").trim() === "" ? null : toNumber(homePens);
      const ap = String(awayPens ?? "").trim() === "" ? null : toNumber(awayPens);
      let winnerMemberId = h > a ? cleanId(match.homeMemberId) : a > h ? cleanId(match.awayMemberId) : "";
      let winnerName = h > a ? match.homeName : a > h ? match.awayName : "";
      const matchPhase = clean(match.phase || "");
      const needsPenaltyWinner = !winnerMemberId && (
        competitionType === "league_qualifier" ||
        ((isKnockoutCompetitionType(competitionType) || leagueGroupsMode) && !((["world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode) && matchPhase === "group"))
      );
      if (needsPenaltyWinner) {
        if (hp === null || ap === null || hp === ap) throw new Error("في المباريات الإقصائية، أدخل ركلات الترجيح عند التعادل وحدد فائزًا.");
        winnerMemberId = hp > ap ? cleanId(match.homeMemberId) : cleanId(match.awayMemberId);
        winnerName = hp > ap ? match.homeName : match.awayName;
      }
      return {
        ...match,
        homeGoals: h,
        awayGoals: a,
        homePens: hp,
        awayPens: ap,
        resultStatus: "completed",
        status: "completed",
        winnerMemberId,
        winnerName,
        gameTitle: String(gameTitle || match.gameTitle || "").trim() || match.gameTitle || "PES 2017",
        gameCode: clean(gameTitle || match.gameTitle || "").includes("fifa") || String(gameTitle || match.gameTitle || "").includes("2025") ? "fifa25" : match.gameCode || "pes17",
        updatedAtText: new Date().toISOString(),
      };
    });

    if (competitionType === "league_qualifier") {
      nextMatches = resolveLeagueQualifierDependencies(nextMatches);
    } else if (competitionType === "world_cup") {
      nextMatches = resolveWorldCupDependencies({ ...competition, matches: nextMatches });
    } else if (competitionType === "champions_league" || leagueGroupsMode) {
      nextMatches = resolveChampionsLeagueDependencies({ ...competition, matches: nextMatches });
    } else if (isKnockoutCompetitionType(competitionType)) {
      nextMatches = resolveKnockoutBracketDependencies(nextMatches);
    }

    const participants = Array.isArray(competition.participants) ? competition.participants : [];
    const standings = competitionType === "league" && !leagueGroupsMode ? computeLeagueStandings(filterCompetitionParticipantsForCalculation({ ...competition, participants, matches: nextMatches }), filterCompetitionMatchesForCalculation({ ...competition, participants, matches: nextMatches })) : [];
    const qualifiedMemberIds = competitionType === "league_qualifier" ? computeLeagueQualifierQualifiedIds({ ...competition, matches: nextMatches }) : competitionType === "world_cup" ? computeWorldCupQualifiedIds({ ...competition, matches: nextMatches }) : (competitionType === "champions_league" || leagueGroupsMode) ? computeChampionsLeagueQualifiedIds({ ...competition, matches: nextMatches }) : computeKnockoutQualifiedIds({ ...competition, matches: nextMatches });
    const nextChampion = (isKnockoutCompetitionType(competitionType) || leagueGroupsMode) ? getKnockoutChampion({ ...competition, matches: nextMatches }) : null;
    const nextStatus = (["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode) && clean(competition.status || "active") === "completed" ? "completed" : "active";
    const nextCompetitionForSync = {
      ...competition,
      matches: nextMatches,
      standings,
      qualifiedMemberIds,
      status: nextStatus,
      championMemberId: nextChampion?.memberId || (competitionType === "league" && !leagueGroupsMode ? "" : competition.championMemberId || ""),
      championMemberName: nextChampion?.memberName || (competitionType === "league" && !leagueGroupsMode ? "" : competition.championMemberName || ""),
    };
    await updateDoc(doc(db, "competitions", competitionId), {
      matches: nextCompetitionForSync.matches,
      standings: nextCompetitionForSync.standings,
      qualifiedMemberIds: nextCompetitionForSync.qualifiedMemberIds,
      status: nextCompetitionForSync.status,
      championMemberId: nextCompetitionForSync.championMemberId,
      championMemberName: nextCompetitionForSync.championMemberName,
      updatedAt: serverTimestamp(),
      lastResultAt: serverTimestamp(),
      rewardsNeedReview: (["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode) && clean(competition.status || "active") === "completed" ? true : Boolean(competition.rewardsNeedReview),
    });
    if (leagueGroupsMode) await syncLinkedCupsForLeagueCompetition(nextCompetitionForSync);
  }

  async function clearFifaLeagueMatchResult({ competitionId, matchId }) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const competition = firebaseCompetitions.find((item) => same(item.id, competitionId));
    if (!competition) throw new Error("البطولة غير موجودة.");
    if (["completed", "cancelled"].includes(clean(competition.status || "active")) && !["cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(competition.type || "league"))) throw new Error("لا يمكن حذف نتيجة بطولة مغلقة أو ملغاة.");
    const competitionType = competitionTypeKey(competition.type || "league");
    const leagueGroupsMode = isLeagueGroupsCompetition(competition);
    const embeddedLeagueQualifier = competitionType === "league" && !leagueGroupsMode && competition.leagueQualifier?.enabled ? competition.leagueQualifier : null;
    if (embeddedLeagueQualifier && (embeddedLeagueQualifier.matches || []).some((match) => same(match.id, matchId))) {
      let nextQualifierMatches = (embeddedLeagueQualifier.matches || []).map((match) => {
        if (!same(match.id, matchId)) return match;
        return { ...match, homeGoals: "", awayGoals: "", homePens: null, awayPens: null, resultStatus: "pending", status: "scheduled", winnerMemberId: "", winnerName: "", updatedAtText: new Date().toISOString() };
      });
      nextQualifierMatches = resolveLeagueQualifierDependencies(nextQualifierMatches);
      const nextQualifier = { ...embeddedLeagueQualifier, matches: nextQualifierMatches, qualifiedMemberIds: computeLeagueQualifierQualifiedIds({ matches: nextQualifierMatches, qualifiersCount: embeddedLeagueQualifier.qualifiedCount || 1 }), status: "active" };
      await updateDoc(doc(db, "competitions", competitionId), { leagueQualifier: nextQualifier, updatedAt: serverTimestamp(), lastResultClearedAt: serverTimestamp() });
      return;
    }
    const nextMatches = (Array.isArray(competition.matches) ? competition.matches : []).map((match) => {
      if (!same(match.id, matchId)) return match;
      return {
        ...match,
        homeGoals: "",
        awayGoals: "",
        homePens: null,
        awayPens: null,
        resultStatus: "pending",
        status: "scheduled",
        winnerMemberId: "",
        winnerName: "",
        updatedAtText: new Date().toISOString(),
      };
    });
    const resolvedMatches = competitionType === "league_qualifier" ? resolveLeagueQualifierDependencies(nextMatches) : competitionType === "world_cup" ? resolveWorldCupDependencies({ ...competition, matches: nextMatches }) : (competitionType === "champions_league" || leagueGroupsMode) ? resolveChampionsLeagueDependencies({ ...competition, matches: nextMatches }) : isKnockoutCompetitionType(competitionType) ? resolveKnockoutBracketDependencies(nextMatches) : nextMatches;
    const standings = competitionType === "league" && !leagueGroupsMode ? computeLeagueStandings(filterCompetitionParticipantsForCalculation({ ...competition, matches: resolvedMatches }), filterCompetitionMatchesForCalculation({ ...competition, matches: resolvedMatches })) : [];
    const qualifiedMemberIds = competitionType === "league_qualifier" ? computeLeagueQualifierQualifiedIds({ ...competition, matches: resolvedMatches }) : competitionType === "world_cup" ? computeWorldCupQualifiedIds({ ...competition, matches: resolvedMatches }) : (competitionType === "champions_league" || leagueGroupsMode) ? computeChampionsLeagueQualifiedIds({ ...competition, matches: resolvedMatches }) : computeKnockoutQualifiedIds({ ...competition, matches: resolvedMatches });
    const nextChampion = (isKnockoutCompetitionType(competitionType) || leagueGroupsMode) ? getKnockoutChampion({ ...competition, matches: resolvedMatches }) : null;
    const nextStatus = (["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode) && clean(competition.status || "active") === "completed" ? "completed" : "active";
    const nextCompetitionForSync = {
      ...competition,
      matches: resolvedMatches,
      standings,
      qualifiedMemberIds,
      status: nextStatus,
      championMemberId: nextChampion?.memberId || "",
      championMemberName: nextChampion?.memberName || "",
    };
    await updateDoc(doc(db, "competitions", competitionId), {
      matches: nextCompetitionForSync.matches,
      standings: nextCompetitionForSync.standings,
      qualifiedMemberIds: nextCompetitionForSync.qualifiedMemberIds,
      status: nextCompetitionForSync.status,
      championMemberId: nextCompetitionForSync.championMemberId,
      championMemberName: nextCompetitionForSync.championMemberName,
      updatedAt: serverTimestamp(),
      lastResultClearedAt: serverTimestamp(),
      rewardsNeedReview: (["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode) && clean(competition.status || "active") === "completed" ? true : Boolean(competition.rewardsNeedReview),
    });
    if (leagueGroupsMode) await syncLinkedCupsForLeagueCompetition(nextCompetitionForSync);
  }


  async function applyFifaCompetitionAbsenceAction({ competitionId, memberId, mode = "exclude", forfeitWinGoals = 3, forfeitLoseGoals = 0, note = "" } = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const competition = firebaseCompetitions.find((item) => same(item.id, competitionId));
    if (!competition) throw new Error("البطولة غير موجودة.");
    if (["completed", "cancelled"].includes(clean(competition.status || "active"))) throw new Error("لا يمكن تطبيق إدارة الغياب على بطولة معتمدة أو ملغاة.");

    const safeMemberId = cleanId(memberId || "");
    if (!safeMemberId) throw new Error("اختر العضو الغائب.");
    const competitionType = competitionTypeKey(competition.type || "league");
    const leagueGroupsMode = isLeagueGroupsCompetition(competition);
    const actionMode = clean(mode || "exclude") === "forfeit_loss" ? "forfeit_loss" : "exclude";
    const memberRow = (competition.participants || []).find((item) => same(item.memberId || item.id, safeMemberId));
    const memberName = memberRow?.memberName || memberRow?.name || getMemberName(members, safeMemberId) || safeMemberId;
    const todayText = new Date().toISOString();
    const existingActions = Array.isArray(competition.absenceActions) ? competition.absenceActions : [];
    const nextAbsentIds = uniqueCleanIds([...(competition.absentMemberIds || []), safeMemberId]);
    let nextExcludedIds = uniqueCleanIds([...(competition.excludedMemberIds || [])]);
    let nextParticipants = Array.isArray(competition.participants) ? competition.participants.map((item) => ({ ...item })) : [];
    let nextMatches = Array.isArray(competition.matches) ? competition.matches.map((item) => ({ ...item })) : [];
    let affectedMatchCount = 0;

    if (actionMode === "exclude") {
      nextExcludedIds = uniqueCleanIds([...nextExcludedIds, safeMemberId]);
      nextParticipants = nextParticipants.map((item) => same(item.memberId || item.id, safeMemberId) ? {
        ...item,
        status: "excluded",
        absent: true,
        excludedFromCompetition: true,
        absenceAction: "excluded",
        absenceActionAtText: todayText,
      } : item);
      nextMatches = nextMatches.map((match) => {
        if (!matchInvolvesMember(match, safeMemberId)) return match;
        if (!isGroupOrLeagueStageMatch(competition, match)) return match;
        affectedMatchCount += 1;
        return {
          ...match,
          status: "excluded",
          resultStatus: "excluded",
          absenceAction: "excluded",
          absenceMemberId: safeMemberId,
          absenceMemberName: memberName,
          winnerMemberId: "",
          winnerName: "",
          homeGoals: "",
          awayGoals: "",
          homePens: null,
          awayPens: null,
          updatedAtText: todayText,
        };
      });
      if (!affectedMatchCount && !nextParticipants.some((item) => same(item.memberId || item.id, safeMemberId))) {
        throw new Error("العضو غير موجود داخل هذه البطولة.");
      }
    } else {
      const winGoals = Math.max(0, toNumber(forfeitWinGoals || 0));
      const loseGoals = Math.max(0, toNumber(forfeitLoseGoals || 0));
      if (winGoals === loseGoals) throw new Error("نتيجة الخسارة الإدارية يجب أن تحدد فائزًا.");
      nextMatches = nextMatches.map((match) => {
        if (!matchInvolvesMember(match, safeMemberId)) return match;
        if (!isGroupOrLeagueStageMatch(competition, match)) return match;
        if (clean(match.resultStatus || match.status) === "completed") return match;
        if (isWaitingCompetitionMatch(match) || clean(match.phase || "") === "bye") return match;
        const homeIsAbsent = same(match.homeMemberId, safeMemberId);
        const opponentId = cleanId(homeIsAbsent ? match.awayMemberId : match.homeMemberId);
        const opponentName = homeIsAbsent ? match.awayName : match.homeName;
        if (!opponentId || String(opponentId).startsWith("__") || same(opponentId, "__bye__")) return match;
        affectedMatchCount += 1;
        return {
          ...match,
          homeGoals: homeIsAbsent ? loseGoals : winGoals,
          awayGoals: homeIsAbsent ? winGoals : loseGoals,
          homePens: null,
          awayPens: null,
          resultStatus: "completed",
          status: "completed",
          winnerMemberId: opponentId,
          winnerName: opponentName || getMemberName(members, opponentId) || opponentId,
          adminResult: true,
          forfeitResult: true,
          absenceAction: "forfeit_loss",
          absenceMemberId: safeMemberId,
          absenceMemberName: memberName,
          gameReason: "خسارة إدارية بسبب الغياب",
          updatedAtText: todayText,
        };
      });
      if (!affectedMatchCount) throw new Error("لا توجد مباريات متبقية قابلة لتسجيل خسارة إدارية لهذا العضو.");
    }

    const nextCompetitionBase = {
      ...competition,
      participants: nextParticipants,
      matches: nextMatches,
      absentMemberIds: nextAbsentIds,
      excludedMemberIds: nextExcludedIds,
      absenceActions: [
        ...existingActions,
        {
          id: `absence-${Date.now()}`,
          memberId: safeMemberId,
          memberName,
          mode: actionMode,
          forfeitWinGoals: actionMode === "forfeit_loss" ? Math.max(0, toNumber(forfeitWinGoals || 0)) : null,
          forfeitLoseGoals: actionMode === "forfeit_loss" ? Math.max(0, toNumber(forfeitLoseGoals || 0)) : null,
          affectedMatchCount,
          note: String(note || "").trim(),
          createdBy: authUser?.uid || "",
          createdByMemberId: currentMemberId || "FIFA",
          createdAtText: todayText,
        },
      ],
    };

    let resolvedMatches = nextCompetitionBase.matches;
    if (competitionType === "league_qualifier") {
      resolvedMatches = resolveLeagueQualifierDependencies(resolvedMatches);
    } else if (competitionType === "world_cup") {
      resolvedMatches = resolveWorldCupDependencies(nextCompetitionBase);
    } else if (competitionType === "champions_league" || leagueGroupsMode) {
      resolvedMatches = resolveChampionsLeagueDependencies(nextCompetitionBase);
    } else if (isKnockoutCompetitionType(competitionType)) {
      resolvedMatches = resolveKnockoutBracketDependencies(resolvedMatches);
    }

    const resolvedCompetition = { ...nextCompetitionBase, matches: resolvedMatches };
    const standings = competitionType === "league" && !leagueGroupsMode
      ? computeLeagueStandings(filterCompetitionParticipantsForCalculation(resolvedCompetition), filterCompetitionMatchesForCalculation(resolvedCompetition))
      : [];
    const qualifiedMemberIds = competitionType === "league_qualifier"
      ? computeLeagueQualifierQualifiedIds(resolvedCompetition)
      : competitionType === "world_cup"
        ? computeWorldCupQualifiedIds(resolvedCompetition)
        : (competitionType === "champions_league" || leagueGroupsMode)
          ? computeChampionsLeagueQualifiedIds(resolvedCompetition)
          : computeKnockoutQualifiedIds(resolvedCompetition);

    const updatePayload = {
      participants: resolvedCompetition.participants,
      matches: resolvedCompetition.matches,
      standings,
      qualifiedMemberIds,
      absentMemberIds: nextAbsentIds,
      excludedMemberIds: nextExcludedIds,
      absenceActions: resolvedCompetition.absenceActions,
      updatedAt: serverTimestamp(),
      lastAbsenceActionAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "competitions", competitionId), updatePayload);
    const nextCompetitionForSync = { ...competition, ...updatePayload };
    if (leagueGroupsMode) await syncLinkedCupsForLeagueCompetition(nextCompetitionForSync);

    await addDoc(collection(db, "adminDecisions"), {
      type: actionMode === "exclude" ? "competition_absence_exclusion" : "competition_absence_forfeit_loss",
      status: "completed",
      title: actionMode === "exclude" ? "استبعاد عضو من بطولة" : "تسجيل خسارة إدارية بسبب الغياب",
      body: actionMode === "exclude"
        ? "تم استبعاد " + memberName + " من " + (competition.name || "البطولة") + "."
        : "تم تسجيل خسارة إدارية للعضو " + memberName + " في " + affectedMatchCount + " مباراة متبقية ضمن " + (competition.name || "البطولة") + ".",
      competitionId,
      competitionName: competition.name || "",
      competitionType,
      memberId: safeMemberId,
      memberName,
      actionMode,
      affectedMatchCount,
      note: String(note || "").trim(),
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateFifaCompetitionAdminNote({ competitionId, note = "" } = {}) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const id = cleanId(competitionId || "");
    if (!id) throw new Error("اختر البطولة أولًا.");
    const existing = firebaseCompetitions.find((item) => same(item.id, id));
    if (!existing) throw new Error("البطولة غير موجودة.");
    await updateDoc(doc(db, "competitions", id), {
      adminNote: String(note || "").trim(),
      adminNoteUpdatedAt: serverTimestamp(),
      adminNoteUpdatedBy: authUser?.uid || "",
      adminNoteUpdatedByMemberId: currentMemberId || "FIFA",
      updatedAt: serverTimestamp(),
    });
  }


  async function reverseCompetitionRewardTransfersIfNeeded(competitionId, reason = "تصحيح مكافآت بطولة") {
    const id = cleanId(competitionId);
    if (!id) return [];
    const existingRewards = (firebaseMoneyTransfers || []).filter((item) =>
      same(item.relatedCompetitionId, id) &&
      clean(item.source || "") === "competitionreward" &&
      !["reversed", "cancelled"].includes(clean(item.status || "approved")) &&
      clean(item.adminCorrectionStatus || item.reversalStatus || "") !== "reversed"
    );
    const reversalIds = [];
    for (const item of existingRewards) {
      const amount = Math.max(0, toNumber(item.amount));
      const memberId = cleanId(item.toMemberId || "");
      if (!amount || !memberId || same(memberId, "FIFA")) continue;
      const memberName = item.toMemberName || getMemberName(members, memberId) || "";
      const reversalRef = await addDoc(collection(db, "moneyTransfers"), {
        type: "competition_reward_reversal",
        typeLabel: "تصحيح مكافأة بطولة",
        status: "approved",
        fromMemberId: memberId,
        fromMemberName: memberName,
        toMemberId: "FIFA",
        toMemberName: "FIFA",
        amount,
        note: reason,
        source: "competition_reward_correction",
        relatedCompetitionId: id,
        relatedOriginalMoneyTransferId: item.id,
        approvedBy: authUser?.uid || "",
        createdBy: authUser?.uid || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      reversalIds.push(reversalRef.id);
      await updateDoc(doc(db, "moneyTransfers", item.id), {
        adminCorrectionStatus: "reversed",
        reversalStatus: "reversed",
        reversedAt: serverTimestamp(),
        reversalTransferId: reversalRef.id,
        correctionReason: reason,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: "competition_reward_correction",
        title: "تصحيح مكافأة بطولة",
        body: "تم تصحيح مكافأة بطولة سابقة بقيمة " + formatMoney(amount) + " بسبب تعديل نتائج البطولة.",
        status: "unread",
        audience: "member",
        toMemberId: memberId,
        toMemberName: memberName,
        fromMemberId: "FIFA",
        fromMemberName: "FIFA",
        source: "competition_reward_correction",
        relatedCompetitionId: id,
        relatedMoneyTransferId: reversalRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return reversalIds;
  }

  async function finalizeFifaLeagueCompetition({ competitionId, relegatedMemberIds = [], absentMemberIds = [] }) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const competition = firebaseCompetitions.find((item) => same(item.id, competitionId));
    if (!competition) throw new Error("البطولة غير موجودة.");
    const competitionType = competitionTypeKey(competition.type || "league");
    const leagueGroupsMode = isLeagueGroupsCompetition(competition);
    if (!["league", "league_qualifier", "cup", "super_cup", "world_cup", "champions_league"].includes(competitionType)) throw new Error("هذه العملية مخصصة للبطولات التنافسية المدعومة فقط.");
    if (clean(competition.status || "active") === "cancelled") throw new Error("لا يمكن اعتماد بطولة ملغاة.");
    const participants = Array.isArray(competition.participants) ? competition.participants : [];
    const matches = competitionType === "world_cup" ? resolveWorldCupDependencies(competition) : (competitionType === "champions_league" || leagueGroupsMode) ? resolveChampionsLeagueDependencies(competition) : (Array.isArray(competition.matches) ? competition.matches : []);
    const standings = competitionType === "league" && !leagueGroupsMode ? computeLeagueStandings(filterCompetitionParticipantsForCalculation({ ...competition, participants, matches }), filterCompetitionMatchesForCalculation({ ...competition, participants, matches })) : [];
    const champion = competitionType === "league" && !leagueGroupsMode ? standings[0] || null : competitionType === "league_qualifier" ? null : getKnockoutChampion({ ...competition, matches });
    const relegated = (Array.isArray(relegatedMemberIds) ? relegatedMemberIds : []).map(cleanId).filter(Boolean);
    const absent = (Array.isArray(absentMemberIds) ? absentMemberIds : []).map(cleanId).filter(Boolean);
    const qualifiedMemberIds = competitionType === "league_qualifier" ? computeLeagueQualifierQualifiedIds({ ...competition, matches }) : competitionType === "world_cup" ? computeWorldCupQualifiedIds({ ...competition, matches }) : (competitionType === "champions_league" || leagueGroupsMode) ? computeChampionsLeagueQualifiedIds({ ...competition, matches }) : [];
    const todayDate = new Date().toISOString().slice(0, 10);
    const typeLabel = competitionTypeLabel(competitionType);

    await updateDoc(doc(db, "competitions", competitionId), {
      status: "completed",
      standings,
      championMemberId: champion?.memberId || "",
      championMemberName: champion?.memberName || "",
      relegatedMemberIds: competitionType === "league" && !leagueGroupsMode ? relegated : [],
      absentMemberIds: absent,
      qualifiedMemberIds,
      completedAt: serverTimestamp(),
      completedDate: todayDate,
      rewardsNeedReview: false,
      updatedAt: serverTimestamp(),
    });

    const rewards = normalizeCompetitionRewards(competition.rewards || {});
    const rewardRows = competitionType === "league" && !leagueGroupsMode
      ? standings.slice(0, 4).map((row, index) => ({ ...row, rank: index + 1 }))
      : (["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) || leagueGroupsMode)
        ? getKnockoutRewardRows({ ...competition, matches })
        : [];
    const shouldPayRewards = (competition.autoPayRewards === true || clean(competition.autoPayRewards) === "true") && rewardRows.length > 0;
    const reversedRewardTransferIds = ["cup", "super_cup", "world_cup", "champions_league"].includes(competitionType) && shouldPayRewards
      ? await reverseCompetitionRewardTransfersIfNeeded(competitionId, "تصحيح مكافآت البطولة بعد تعديل النتائج")
      : [];
    const paidRewardTransfers = [];
    if (shouldPayRewards) {
      const rewardLimit = competitionType === "super_cup" ? 2 : 4;
      for (let index = 0; index < Math.min(rewardLimit, rewardRows.length); index += 1) {
        const row = rewardRows[index];
        const rank = row.rank || index + 1;
        const amount = rewards[["first", "second", "third", "fourth"][rank - 1]] || 0;
        if (!amount || !row?.memberId) continue;
        const transferRef = await addDoc(collection(db, "moneyTransfers"), {
          type: "admin_reward",
          typeLabel: "مكافأة " + rewardRankLabel(rank),
          status: "approved",
          fromMemberId: "FIFA",
          fromMemberName: "FIFA",
          toMemberId: row.memberId,
          toMemberName: row.memberName || "",
          amount,
          note: "مكافأة " + rewardRankLabel(rank) + " في " + (competition.name || typeLabel),
          source: "competition_reward",
          relatedCompetitionId: competitionId,
          approvedBy: authUser?.uid || "",
          createdBy: authUser?.uid || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        paidRewardTransfers.push(transferRef.id);
        await addDoc(collection(db, "notifications"), {
          type: "competition_reward",
          title: "مكافأة بطولة",
          body: "تمت إضافة " + formatMoney(amount) + " إلى حسابك عن " + rewardRankLabel(rank) + " في " + (competition.name || typeLabel) + ".",
          status: "unread",
          audience: "member",
          toMemberId: row.memberId,
          toMemberName: row.memberName || "",
          fromMemberId: "FIFA",
          fromMemberName: "FIFA",
          source: "competition_reward",
          relatedCompetitionId: competitionId,
          clickUrl: "/?fgPage=season&fgCompetitionId=" + encodeURIComponent(competitionId),
          relatedMoneyTransferId: transferRef.id,
          createdBy: authUser?.uid || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    const absentText = absent.length ? " الغائبون: " + absent.map((id) => getMemberName(members, id) || id).join("، ") + "." : "";
    const relegatedText = competitionType === "league" && !leagueGroupsMode && relegated.length ? " الهابطون: " + relegated.map((id) => standings.find((row) => same(row.memberId, id))?.memberName || getMemberName(members, id) || id).join("، ") + "." : "";
    const qualifiedText = competitionType === "league_qualifier" && qualifiedMemberIds.length ? " المتأهلون إلى الدوري: " + qualifiedMemberIds.map((id) => getMemberName(members, id) || id).join("، ") + "." : "";

    await addDoc(collection(db, "adminDecisions"), {
      type: competitionType === "league_qualifier" ? "league_qualifier_completed" : competitionType === "cup" ? "cup_completed" : competitionType === "super_cup" ? "super_cup_completed" : competitionType === "world_cup" ? "world_cup_completed" : competitionType === "champions_league" ? "champions_league_completed" : "league_completed",
      status: "completed",
      title: competitionType === "league_qualifier" ? "اعتماد ملحق دوري" : competitionType === "cup" ? "اعتماد بطولة الكأس" : competitionType === "super_cup" ? "اعتماد كأس السوبر" : competitionType === "world_cup" ? "اعتماد كأس العالم" : competitionType === "champions_league" ? "اعتماد دوري الأبطال" : "إغلاق دوري",
      body: "تم اعتماد " + (competition.name || typeLabel) + (champion?.memberName ? "، والبطل هو " + champion.memberName + "." : ".") + relegatedText + absentText + qualifiedText,
      competitionId,
      competitionName: competition.name || "",
      competitionType,
      championMemberId: champion?.memberId || "",
      championMemberName: champion?.memberName || "",
      relegatedMemberIds: relegated,
      absentMemberIds: absent,
      qualifiedMemberIds,
      rewards,
      autoPaidRewards: shouldPayRewards,
      paidRewardTransferIds: paidRewardTransfers,
      reversedRewardTransferIds,
      rewardsNeedReview: false,
      seasonId: competition.seasonId || activeSeasonId,
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: todayDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      type: competitionType === "league_qualifier" ? "league_qualifier_completed" : competitionType === "cup" ? "cup_completed" : competitionType === "super_cup" ? "super_cup_completed" : competitionType === "world_cup" ? "world_cup_completed" : competitionType === "champions_league" ? "champions_league_completed" : "league_completed",
      title: competitionType === "league_qualifier" ? "تم اعتماد ملحق الدوري" : competitionType === "cup" ? "تم اعتماد بطولة الكأس" : competitionType === "super_cup" ? "تم اعتماد كأس السوبر" : competitionType === "world_cup" ? "تم اعتماد كأس العالم" : competitionType === "champions_league" ? "تم اعتماد دوري الأبطال" : "تم اعتماد نتيجة الدوري",
      body: "تم اعتماد " + (competition.name || typeLabel) + (champion?.memberName ? "، والبطل هو " + champion.memberName + "." : ".") + relegatedText + absentText + qualifiedText,
      status: "unread",
      audience: "all",
      fromMemberId: "FIFA",
      fromMemberName: "FIFA",
      source: "fifa_admin_competitions",
      relatedCompetitionId: competitionId,
      clickUrl: "/?fgPage=season&fgCompetitionId=" + encodeURIComponent(competitionId),
      createdBy: authUser?.uid || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function cancelFifaCompetition({ competitionId, reason = "" }) {
    if (!isFifaAdmin) throw new Error("هذه الصلاحية مخصصة لحساب FIFA فقط.");
    const competition = firebaseCompetitions.find((item) => same(item.id, competitionId));
    if (!competition) throw new Error("البطولة غير موجودة.");
    if (clean(competition.status || "active") === "completed" && !["cup", "super_cup", "world_cup", "champions_league"].includes(competitionTypeKey(competition.type || "league"))) throw new Error("لا يمكن إلغاء بطولة معتمدة. استخدم سجل قرارات FIFA للتصحيح لاحقًا.");
    if (clean(competition.status || "active") === "cancelled") throw new Error("هذه البطولة ملغاة بالفعل.");
    const body = "تم إلغاء " + (competition.name || "البطولة") + (reason ? " - السبب: " + reason : " بقرار FIFA.");
    await deleteDoc(doc(db, "competitions", competitionId));
    await addDoc(collection(db, "adminDecisions"), {
      type: "competition_cancelled",
      status: "cancelled",
      title: "إلغاء بطولة",
      body,
      competitionId,
      competitionName: competition.name || "",
      competitionType: competition.type || "league",
      reason: reason || "إلغاء إداري من FIFA",
      createdBy: authUser?.uid || "",
      createdByMemberId: currentMemberId || "FIFA",
      createdByName: authProfile?.memberName || authProfile?.username || "FIFA",
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }


  function getActivePlayerContract(playerId) {
    const id = cleanId(playerId);
    if (!id) return null;
    return activePlayerContracts.find((contract) => same(contract.playerId, id)) || null;
  }

  function getPlayerBaseOwnerId(playerOrId) {
    const playerId = typeof playerOrId === "object" ? getPlayerStableId(playerOrId) : cleanId(playerOrId);
    const playerRow = typeof playerOrId === "object" ? playerOrId : players.find((item) => same(getPlayerStableId(item), playerId));
    const activeContract = getActivePlayerContract(playerId);
    return cleanId(activeContract?.baseOwnerMemberId || activeContract?.baseOwnerId || activeContract?.originalBaseOwnerMemberId || activeContract?.originalOwnerMemberId || playerRow?.memberid || playerRow?.memberId || playerRow?.member_id || "");
  }

  function getRosterPlayerKind(player, memberId) {
    const playerId = getPlayerStableId(player);
    const activeContract = getActivePlayerContract(playerId);
    return getRosterPlayerKindFromContract(player, activeContract, memberId);
  }

  function isProRosterKind(kind) {
    return kind === "pro_owned" || kind === "pro_loan";
  }

  function countMemberProPlayers(memberId) {
    const id = cleanId(memberId);
    if (!id) return 0;
    const uniqueProPlayerIds = new Set();
    getVisiblePlayersForMember(id).forEach((player) => {
      const playerId = cleanId(getPlayerStableId(player));
      if (!playerId || uniqueProPlayerIds.has(playerId)) return;
      const kind = getRosterPlayerKind(player, id);
      if (isProRosterKind(kind)) uniqueProPlayerIds.add(playerId);
    });
    return uniqueProPlayerIds.size;
  }

  function getOfferProjectedProDeltas(offer) {
    const buyerId = cleanId(offer?.fromMemberId);
    const sellerId = cleanId(offer?.toMemberId);
    const targetPlayerId = cleanId(offer?.targetPlayerId || offer?.playerId);
    const contractType = clean(offer?.type) === "loan" ? "loan" : "buy";
    const targetPlayerRow = players.find((player) => same(getPlayerStableId(player), targetPlayerId)) || {};
    const previousActiveContract = getActivePlayerContract(targetPlayerId);
    const baseOwnerId = cleanId(
      previousActiveContract?.baseOwnerMemberId ||
        previousActiveContract?.baseOwnerId ||
        previousActiveContract?.originalBaseOwnerMemberId ||
        previousActiveContract?.originalOwnerMemberId ||
        targetPlayerRow?.memberid ||
        sellerId
    );
    const targetFreeOrigin = isFreeOriginContract(previousActiveContract);
    const targetFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(previousActiveContract, targetFreeOrigin ? baseOwnerId || sellerId : "");

    const targetRosterKindForSeller = getRosterPlayerKindFromContract(targetPlayerRow, previousActiveContract, sellerId);
    const targetProLeavingSeller = isProRosterKind(targetRosterKindForSeller) ? 1 : 0;
    const targetProEnteringBuyer = (() => {
      if (contractType === "loan") return same(baseOwnerId, buyerId) ? 0 : 1;
      if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, buyerId)) return 0;
      return baseOwnerId && !same(baseOwnerId, buyerId) ? 1 : 0;
    })();

    let offeredProLeavingBuyer = 0;
    let offeredProEnteringSeller = 0;
    const seenOfferedIds = new Set();
    (Array.isArray(offer?.offeredPlayers) ? offer.offeredPlayers : []).forEach((item) => {
      const playerId = cleanId(item.playerId || item.playerid || item.id);
      if (!playerId || seenOfferedIds.has(playerId)) return;
      seenOfferedIds.add(playerId);
      const row = players.find((player) => same(getPlayerStableId(player), playerId)) || {};
      const activeContract = getActivePlayerContract(playerId);
      const swapBaseOwnerId = cleanId(activeContract?.baseOwnerMemberId || activeContract?.baseOwnerId || activeContract?.originalBaseOwnerMemberId || activeContract?.originalOwnerMemberId || row?.memberid || buyerId);
      const swapFreeOrigin = isFreeOriginContract(activeContract);
      const swapFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(activeContract, swapFreeOrigin ? swapBaseOwnerId || buyerId : "");
      const currentKindForBuyer = getRosterPlayerKindFromContract(row, activeContract, buyerId);
      if (isProRosterKind(currentKindForBuyer)) offeredProLeavingBuyer += 1;
      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, sellerId)) return;
      if (swapBaseOwnerId && !same(swapBaseOwnerId, sellerId)) offeredProEnteringSeller += 1;
    });

    return {
      buyerId,
      sellerId,
      buyerDelta: targetProEnteringBuyer - offeredProLeavingBuyer,
      sellerDelta: offeredProEnteringSeller - targetProLeavingSeller,
      buyerEntering: targetProEnteringBuyer,
      sellerEntering: offeredProEnteringSeller,
    };
  }

  function getPendingAcceptedProDeltaForMember(memberId, excludedOfferId = "") {
    const id = cleanId(memberId);
    if (!id) return 0;
    return (firebasePlayerOffers || []).reduce((sum, offer) => {
      if (same(offer.id, excludedOfferId)) return sum;
      if (clean(offer.status || "") !== "approvedpendingwindow") return sum;
      const deltas = getOfferProjectedProDeltas(offer);
      if (same(deltas.buyerId, id)) return sum + deltas.buyerDelta;
      if (same(deltas.sellerId, id)) return sum + deltas.sellerDelta;
      return sum;
    }, 0);
  }

  function wouldOfferCreateProPlayer(targetPlayerId, buyerId) {
    const baseOwnerId = getPlayerBaseOwnerId(targetPlayerId);
    if (!baseOwnerId) return false;
    return !same(baseOwnerId, buyerId);
  }

  function isPlayerLockedByContract(playerId, requestedType = "") {
    const activeContract = getActivePlayerContract(playerId);
    if (!activeContract) return false;
    const contractType = clean(activeContract.contractType || "");
    if (contractType === "released") return true;
    if (contractType === "loan") {
      if (clean(requestedType) === "loan") return false;
      return true;
    }
    return false;
  }

  function isPlayerReleased(playerId) {
    return isPlayerReleasedByContracts(activePlayerContracts, playerId);
  }

  function hasFreeAgentRegistration(playerId, memberId) {
    const id = cleanId(playerId);
    const ownerId = cleanId(memberId);
    if (!id || !ownerId) return false;
    return firebaseFreeAgentRegistrations.some((item) =>
      same(item.playerId, id) &&
      same(item.memberId || item.toMemberId || item.currentMemberId, ownerId) &&
      !["cancelled", "reversed"].includes(clean(item.status || "completed"))
    );
  }

  function getFreePlayerStatusForMember(memberId) {
    const id = cleanId(memberId);
    if (!id) return null;
    return firebaseFreePlayerStatus.find((item) => same(item.memberId || item.id, id)) || null;
  }

  function getActiveFreeAgentContractForMember(memberId) {
    const id = cleanId(memberId);
    if (!id) return null;
    return activePlayerContracts.find((contract) =>
      same(contract.currentMemberId, id) &&
      isFreeOriginContract(contract) &&
      same(getFreeAgentSlotOwnerIdFromContract(contract, contract.originalOwnerMemberId || contract.ownerMemberId || id), id) &&
      clean(contract.contractType || "owned") === "owned"
    ) || null;
  }

  function getPendingFreeAgentQueueForMember(memberId) {
    const id = cleanId(memberId);
    if (!id) return null;
    return firebaseFreeAgentQueue.find((item) =>
      same(item.memberId, id) && ["pending_window", "processing"].includes(clean(item.status || "pending_window"))
    ) || null;
  }

  function isFreeAgentUnavailable(playerId, exceptQueueId = "") {
    const id = cleanId(playerId);
    if (!id) return true;
    const hasContract = activePlayerContracts.some((contract) =>
      same(contract.playerId, id) &&
      clean(contract.status || "active") === "active" &&
      !isFreeAgentPoolContract(contract)
    );
    if (hasContract) return true;
    return firebaseFreeAgentQueue.some((item) =>
      !same(item.id, exceptQueueId) &&
      same(item.newPlayerId, id) && ["pending_window", "processing"].includes(clean(item.status || "pending_window"))
    );
  }

  function getVisiblePlayersForMember(memberId, sourceRows = players) {
    const id = cleanId(memberId);
    if (!id) return [];
    return (sourceRows || []).filter((player) => {
      const playerId = getPlayerStableId(player);
      if (isPlayerReleased(playerId)) return false;
      const activeContract = getActivePlayerContract(playerId);
      const contractType = clean(activeContract?.contractType || "");
      if (activeContract && contractType !== "released") {
        return same(activeContract.currentMemberId, id);
      }
      return same(player.memberid, id);
    });
  }

  async function deactivateOfferNotifications(offerId, reason = "updated") {
    const id = cleanId(offerId);
    if (!id) return;
    const relatedRows = firebaseNotifications.filter((item) =>
      same(item.relatedOfferId, id) && !item.navigationDisabled
    );
    await Promise.allSettled(
      relatedRows.map((item) =>
        updateDoc(doc(db, "notifications", item.id), {
          navigationDisabled: true,
          disabledReason: reason,
          status: "read",
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      )
    );
  }


  const selectedMember = selectedId
    ? members.find((member) => same(member.id, selectedId))
    : null;
  const selectedMemberId = cleanId(selectedMember?.id);

  const memberPlayers = useMemo(() => {
    const q = clean(search);
    return getVisiblePlayersForMember(selectedMemberId)
      .filter((player) => {
        if (!q) return true;
        const kindLabel = getPlayerRosterKindLabel(player, activePlayerContracts, selectedMemberId);
        return clean([
          player.name,
          player.position,
          player.team,
          player.rating,
          kindLabel,
          kindLabel.replace("لاعب ", ""),
        ].join(" ")).includes(q);
      })
      .sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
  }, [players, selectedMemberId, search, activePlayerContracts]);

  const memberFinance = useMemo(
    () => getMemberFinanceRows(combinedFinance, selectedMemberId),
    [combinedFinance, selectedMemberId]
  );
  const selectedMemberBalance = useMemo(
    () => computeMemberBalance(memberFinance, selectedMember?.balance, selectedMemberId),
    [memberFinance, selectedMember?.balance, selectedMemberId]
  );
  const memberTrophyGroups = useMemo(
    () => groupMemberTrophies(allTournaments, selectedMemberId, trophyMap),
    [allTournaments, selectedMemberId, trophyMap]
  );
  const selectedMemberStats =
    finalStatsByMember[cleanId(selectedMemberId)] ||
    emptyMemberStats(selectedMemberId);
  const seasonGroups = useMemo(
    () => groupByTrophy(activeSeasonRows, trophyMap),
    [activeSeasonRows, trophyMap]
  );
  const archiveSeasons = useMemo(
    () => buildArchiveSeasons(seasons, allTournaments, trophyMap),
    [seasons, allTournaments, trophyMap]
  );
  const seasonRanking = useMemo(
    () => computeSeasonRanking(activeMembers, activeSeasonRows, trophyMap),
    [activeMembers, activeSeasonRows, trophyMap]
  );
  const firebaseTransferRows = useMemo(
    () => normalizeFirebaseTransferRows(firebaseTransferHistory),
    [firebaseTransferHistory]
  );
  const transferPeriods = useMemo(
    () => mergeTransferPeriods(getTransferPeriods(transfers), getTransferPeriods(firebaseTransferRows)),
    [transfers, firebaseTransferRows]
  );
  const activeTransferPeriod =
    transferPeriods.find((period) => same(period.id, transferPeriod)) ||
    transferPeriods[0];
  const currentTransfers = activeTransferPeriod?.rows || [];

  useEffect(() => {
    if (!authUser || !transferMarketOpen) return;
    const pendingItems = firebaseFreeAgentQueue.filter((item) =>
      clean(item.status || "pending_window") === "pending_window"
    );
    if (!pendingItems.length) return;
    pendingItems.forEach((item) => {
      executeFreeAgentQueueItem(item).catch((err) => {
        console.error("Free agent queue execution failed:", err);
      });
    });
  }, [authUser, transferMarketOpen, firebaseFreeAgentQueue, activePlayerContracts, players, combinedFinance]);

  const headerCoverImage = normalizeImageUrl(config.headerImage);
  const appIconImage = normalizeImageUrl(config.appIcon);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (pendingScrollRef.current !== null) {
        const nextTop = pendingScrollRef.current;
        pendingScrollRef.current = null;
        scrollAppTo(nextTop, "auto");
        return;
      }
      scrollAppToTop("auto");
    });
  }, [page, selectedMemberId]);

  function getCurrentScrollTop() {
    const appNode = document.querySelector(".app");
    return appNode ? appNode.scrollTop : window.scrollY || 0;
  }

  function restoreScrollPosition(top) {
    const safeTop = Math.max(0, Number(top) || 0);
    pendingScrollRef.current = safeTop;
    restoringScrollRef.current = true;

    function applyRestore() {
      if (pendingScrollRef.current === null) {
        restoringScrollRef.current = false;
        return;
      }

      const nextTop = pendingScrollRef.current;
      const appNode = document.querySelector(".app");

      if (appNode) {
        appNode.style.scrollBehavior = "auto";
        appNode.scrollTop = nextTop;
        requestAnimationFrame(() => {
          appNode.scrollTop = nextTop;
          appNode.style.scrollBehavior = "";
          pendingScrollRef.current = null;
          restoringScrollRef.current = false;
        });
        return;
      }

      window.scrollTo(0, nextTop);
      pendingScrollRef.current = null;
      restoringScrollRef.current = false;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(applyRestore);
    });
  }

  function openView(view) {
    const currentScrollTop = getCurrentScrollTop();
    try {
      window.history.pushState({ fifaGroupDetail: true }, "");
    } catch {}
    if (detailView) {
      setDetailStack((stack) => [
        ...stack,
        { view: detailView, scrollTop: currentScrollTop },
      ]);
    } else {
      baseScrollRef.current = currentScrollTop;
      setDetailStack([]);
    }
    setDetailView(view);
    setInfoModal(null);
    setMenuOpen(false);
    requestAnimationFrame(() => scrollAppToTop("auto"));
  }

  function closeView() {
    if (detailStack.length) {
      const previousEntry = detailStack[detailStack.length - 1];
      setDetailStack((stack) => stack.slice(0, -1));
      setDetailView(previousEntry.view);
      restoreScrollPosition(previousEntry.scrollTop);
    } else {
      setDetailView(null);
      restoreScrollPosition(baseScrollRef.current || 0);
    }
  }

  useEffect(() => {
    function setStableBounds() {
      const root = document.documentElement;
      const narrow = window.innerWidth <= 380;
      root.style.setProperty("--fg-top-bound", narrow ? "40px" : "44px");
      root.style.setProperty("--fg-bottom-bound", narrow ? "88px" : "92px");
      root.style.setProperty("--fg-nav-bottom", "10px");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.background = "#020617";
    }

    setStableBounds();
    window.addEventListener("orientationchange", setStableBounds);
    return () =>
      window.removeEventListener("orientationchange", setStableBounds);
  }, []);

  function scrollAppTo(top = 0, behavior = "auto") {
    const safeTop = Math.max(0, Number(top) || 0);
    const appNode = document.querySelector(".app");

    if (appNode) {
      if (behavior === "smooth") {
        appNode.scrollTo({ top: safeTop, behavior });
      } else {
        appNode.style.scrollBehavior = "auto";
        appNode.scrollTop = safeTop;
        requestAnimationFrame(() => {
          appNode.style.scrollBehavior = "";
        });
      }
      return;
    }

    window.scrollTo({ top: safeTop, behavior });
  }

  function scrollAppToTop(behavior = "auto") {
    scrollAppTo(0, behavior);
  }

  function goPage(nextPage, options = {}) {
    memberReturnRef.current = null;
    if (nextPage === "season" && !options.preserveSeasonTab) setSeasonHubTab(options.seasonTab || "members");
    setPage(nextPage);
    if (options.clearFocusedCompetition) setFocusedCompetitionId("");
    setSelectedId("");
    setMemberTab("players");
    setSearch("");
    setMenuOpen(false);
    setDetailView(null);
    setDetailStack([]);
    setInfoModal(null);

    requestAnimationFrame(() => {
      scrollAppToTop("auto");
    });
  }

  function openPublicMemberProfile(memberId, tabId = "players") {
    const id = cleanId(memberId || "");
    if (!id) return;
    if (currentMemberId && same(id, currentMemberId)) {
      goPage("myProfile");
      return;
    }

    memberReturnRef.current = {
      page,
      selectedId,
      memberTab,
      search,
      focusedCompetitionId,
      scrollTop: getCurrentScrollTop(),
    };

    setPage("members");
    setSelectedId(id);
    setMemberTab(tabId || "players");
    setSearch("");
    setMenuOpen(false);
    setDetailView(null);
    setDetailStack([]);
    setInfoModal(null);
    requestAnimationFrame(() => {
      scrollAppToTop("auto");
    });
  }

  function closePublicMemberProfile() {
    const previous = memberReturnRef.current || {};
    memberReturnRef.current = null;

    setPage(previous.page || "home");
    setSelectedId(previous.selectedId || "");
    setMemberTab(previous.memberTab || "players");
    setSearch(previous.search || "");
    setFocusedCompetitionId(previous.focusedCompetitionId || "");
    setDetailView(null);
    setDetailStack([]);
    setInfoModal(null);
    setMenuOpen(false);
    restoreScrollPosition(previous.scrollTop || 0);
  }

  async function createMoneyTransfer({ toMemberId, amount, note }) {
    const fromMemberId = cleanId(currentMemberId);
    const receiverId = cleanId(toMemberId);
    const numericAmount = parseFinanceAmount(amount);

    if (!authUser || !fromMemberId) throw new Error("لم يتم ربط الحساب بعضو بعد.");
    if (!receiverId) throw new Error("اختر العضو المستقبل.");
    if (same(fromMemberId, receiverId)) throw new Error("لا يمكن التحويل لنفس العضو.");
    if (!numericAmount || numericAmount <= 0) throw new Error("أدخل مبلغًا صحيحًا أكبر من صفر.");
    if (numericAmount > currentMemberBalance) throw new Error("الرصيد غير كافٍ لإتمام التحويل.");

    const receiver = getActiveMembers(members).find((member) => same(member.id, receiverId));
    if (!receiver) throw new Error("العضو المستقبل غير موجود ضمن أعضاء الموسم الحالي النشط.");

    const transferRef = await addDoc(collection(db, "moneyTransfers"), {
      fromMemberId,
      fromMemberName: currentMember?.name || authProfile?.memberName || "",
      toMemberId: receiverId,
      toMemberName: receiver.name || "",
      amount: numericAmount,
      type: "transfer",
      status: "approved",
      approvedBy: "system",
      createdBy: authUser.uid,
      username: authProfile?.username || "",
      note: String(note || "").trim() || "تحويل تلقائي من التطبيق",
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await Promise.allSettled([
      addDoc(collection(db, "notifications"), {
        type: "money_transfer_in",
        status: "unread",
        toMemberId: receiverId,
        fromMemberId,
        relatedMoneyTransferId: transferRef.id,
        financeMemberId: receiverId,
        clickUrl: "/?fgPage=finance&fgMemberId=" + encodeURIComponent(receiverId),
        title: "تحويل مالي وارد",
        body: "وصلك تحويل بقيمة " + formatMoney(numericAmount) + " من " + (currentMember?.name || authProfile?.memberName || "عضو") + ".",
        createdAt: serverTimestamp(),
      }),
      addDoc(collection(db, "notifications"), {
        type: "money_transfer_out",
        status: "unread",
        toMemberId: fromMemberId,
        fromMemberId,
        relatedMoneyTransferId: transferRef.id,
        financeMemberId: fromMemberId,
        clickUrl: "/?fgPage=finance&fgMemberId=" + encodeURIComponent(fromMemberId),
        title: "تحويل مالي صادر",
        body: "تم تحويل " + formatMoney(numericAmount) + " إلى " + (receiver.name || "عضو") + ".",
        createdAt: serverTimestamp(),
      }),
    ]);
  }


  async function createPlayerOffer(payload) {
    const fromMemberId = cleanId(currentMemberId);
    const targetMemberId = cleanId(payload?.targetMemberId);
    const targetPlayerId = cleanId(payload?.targetPlayerId);
    const contractType = clean(payload?.contractType) === "loan" ? "loan" : "buy";
    const numericAmount = Math.max(0, parseFinanceAmount(payload?.amount));
    const offeredPlayers = (Array.isArray(payload?.offeredPlayers) ? payload.offeredPlayers : []).map(normalizeOfferExchangeClauseForSave);
    const todayKey = new Date().toISOString().slice(0, 10);
    const expiresAt = addDays(new Date(), PLAYER_OFFER_EXPIRE_DAYS).toISOString();

    if (!authUser || !fromMemberId) throw new Error("لم يتم ربط الحساب بعضو بعد.");
    if (!targetMemberId || !targetPlayerId) throw new Error("بيانات اللاعب غير مكتملة.");
    assertTransferAllowed(fromMemberId, "send_offer");
    const targetReceiveRestriction = getBlockingTransferRestriction(firebaseMemberRestrictions, targetMemberId, "receive_offer");
    if (targetReceiveRestriction) {
      throw new Error("لا يمكنك إرسال العروض لهذا العضو بسبب إيقاف إداري من نظام الانتقالات حتى " + (targetReceiveRestriction.endDate || "نهاية المدة") + (targetReceiveRestriction.reason ? " - السبب: " + targetReceiveRestriction.reason : "."));
    }
    if (offeredPlayers.length) assertTransferAllowed(fromMemberId, "squad_change");
    if (same(fromMemberId, targetMemberId)) throw new Error("لا يمكنك تقديم عرض على لاعب من قائمتك.");
    if (contractType === "loan" && ![2, 4, 6].includes(toNumber(payload?.loanDurationMonths))) {
      throw new Error("اختر مدة عقد الإعارة.");
    }

    const targetMember = members.find((member) => same(member.id, targetMemberId));
    if (!targetMember) throw new Error("العضو صاحب اللاعب غير موجود.");

    const offeredPlayersCount = offeredPlayers.length;
    const targetMemberPlayerCount = getVisiblePlayersForMember(targetMemberId).length;
    const targetMemberCountAfterOffer = targetMemberPlayerCount - 1 + offeredPlayersCount;
    if (targetMemberCountAfterOffer < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تقديم عرض يجعل قائمة صاحب اللاعب أقل من 17 لاعبًا بعد احتساب لاعبي التبادل.");
    }
    if (targetMemberCountAfterOffer > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تقديم عرض يجعل قائمة صاحب اللاعب تتجاوز الحد الأقصى 32 لاعبًا.");
    }

    const fromMemberVisiblePlayers = getVisiblePlayersForMember(fromMemberId);
    const fromMemberPlayerCount = fromMemberVisiblePlayers.length;
    if (offeredPlayersCount > 0 && fromMemberPlayerCount - offeredPlayersCount < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن إدراج لاعبين من قائمتك في الصفقة إذا كان ذلك سيجعل قائمتك أقل من 17 لاعبًا.");
    }
    if (fromMemberPlayerCount - offeredPlayersCount + 1 > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تقديم العرض لأن قائمتك ستتجاوز الحد الأقصى 32 لاعبًا.");
    }

    const fromMemberVisiblePlayerIds = new Set(fromMemberVisiblePlayers.map((player) => cleanId(getPlayerStableId(player))));
    const invalidOfferedPlayer = offeredPlayers.find((item) => !fromMemberVisiblePlayerIds.has(cleanId(item.playerId)));
    if (invalidOfferedPlayer) {
      throw new Error("لا يمكن إدراج لاعب غير موجود في قائمتك الحالية ضمن الصفقة.");
    }
    const duplicateOfferedPlayers = new Set();
    const duplicatedOfferedPlayer = offeredPlayers.find((item) => {
      const playerId = cleanId(item.playerId);
      if (!playerId) return true;
      if (duplicateOfferedPlayers.has(playerId)) return true;
      duplicateOfferedPlayers.add(playerId);
      return false;
    });
    if (duplicatedOfferedPlayer) {
      throw new Error("لا يمكن تكرار نفس اللاعب في صفقة التبادل.");
    }
    const loanedOfferedPlayer = offeredPlayers.find((item) => clean(getActivePlayerContract(item.playerId)?.contractType || "") === "loan");
    if (loanedOfferedPlayer) {
      throw new Error("لا يمكن إدراج لاعب تستعيره حاليًا ضمن بنود التبادل.");
    }

    const activeTargetContract = getActivePlayerContract(targetPlayerId);
    const activeTargetContractType = clean(activeTargetContract?.contractType || "");
    const playerLockedByAcceptedDeal = firebasePlayerOffers.some((offer) =>
      same(offer.targetPlayerId, targetPlayerId) && isAcceptedOrCompletedPlayerOffer(offer)
    );
    if (playerLockedByAcceptedDeal || isPlayerLockedByContract(targetPlayerId, contractType)) {
      throw new Error("لا يمكن تقديم عرض على هذا اللاعب لأنه مرتبط بصفقة أو عقد نشط.");
    }
    if (activeTargetContractType === "loan") {
      if (contractType !== "loan") throw new Error("اللاعب المعار يستقبل عروض إعارة فقط.");
      const requiredLoanMonths = toNumber(activeTargetContract.loanDurationMonths);
      if (requiredLoanMonths && toNumber(payload?.loanDurationMonths) !== requiredLoanMonths) {
        throw new Error("مدة إعادة الإعارة يجب أن تطابق مدة عقد الإعارة الأصلي.");
      }
    }

    const createsProPlayer = wouldOfferCreateProPlayer(targetPlayerId, fromMemberId);
    const offeredProLeavingCount = offeredPlayers.reduce((sum, item) => {
      const row = fromMemberVisiblePlayers.find((player) => same(getPlayerStableId(player), item.playerId));
      const kind = row ? getRosterPlayerKind(row, fromMemberId) : "base";
      return sum + (kind === "pro_owned" || kind === "pro_loan" ? 1 : 0);
    }, 0);
    const proCount = countMemberProPlayers(fromMemberId);
    // الحد الأقصى للمحترفين يُحسب من القائمة الفعلية الحالية فقط.
    // لا نضيف عروضًا قديمة/معلقة هنا حتى لا يبقى لاعب خرج من القائمة محسوبًا ضمن حد 5 محترفين.
    if (proCount - offeredProLeavingCount + (createsProPlayer ? 1 : 0) > MAX_PRO_PLAYERS) {
      throw new Error("لا يمكنك إتمام الصفقة، ستتجاوز الحد الأقصى للمحترفين (5) حسب قائمتك الحالية.");
    }

    const alreadyBlocking = firebasePlayerOffers.some((offer) =>
      same(offer.fromMemberId, fromMemberId) &&
      same(offer.targetPlayerId, targetPlayerId) &&
      isBlockingOwnPlayerOfferStillValid(offer)
    );
    if (alreadyBlocking) throw new Error("لديك عرض نشط أو مقبول سابق على نفس اللاعب.");

    const todayOffersCount = firebasePlayerOffers.filter((offer) =>
      same(offer.fromMemberId, fromMemberId) && String(offer.dateKey || "") === todayKey
    ).length;
    if (todayOffersCount >= MAX_DAILY_PLAYER_OFFERS) {
      throw new Error("وصلت للحد اليومي للعروض (" + MAX_DAILY_PLAYER_OFFERS + ").");
    }

    const neededNow = numericAmount + OFFER_FEE;
    if (neededNow > currentMemberAvailableBalance) {
      throw new Error("الرصيد المتاح لا يكفي لقيمة العرض مع رسوم التقديم.");
    }

    const offerRef = await addDoc(collection(db, "playerOffers"), {
      type: contractType,
      typeLabel: contractType === "loan" ? "عقد إعارة" : "عقد شراء",
      status: "pending",
      version: 1,
      editCount: 0,
      maxEdits: 1,
      fromMemberId,
      fromMemberName: currentMember?.name || authProfile?.memberName || "",
      toMemberId: targetMemberId,
      toMemberName: targetMember.name || "",
      targetPlayerId,
      targetPlayerName: payload?.targetPlayerName || "",
      targetPlayerImage: payload?.targetPlayerImage || "",
      targetPlayerPosition: payload?.targetPlayerPosition || "",
      targetPlayerRating: payload?.targetPlayerRating || "",
      amount: numericAmount,
      reservedAmount: numericAmount,
      offeredPlayers,
      loanDurationMonths: contractType === "loan" ? toNumber(payload?.loanDurationMonths) : null,
      notes: String(payload?.notes || "").trim(),
      feeAmount: OFFER_FEE,
      expiresAt,
      dateKey: todayKey,
      createdBy: authUser.uid,
      username: authProfile?.username || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addOfferFee({
      fromMemberId,
      relatedOfferId: offerRef.id,
      note: "رسوم تقديم عرض على اللاعب " + (payload?.targetPlayerName || ""),
      type: "offer_fee",
      dateKey: todayKey,
    });

    await addDoc(collection(db, "notifications"), {
      type: "player_offer",
      status: "unread",
      toMemberId: targetMemberId,
      fromMemberId,
      relatedOfferId: offerRef.id,
      targetPlayerId,
      targetMemberId,
      offerVersion: 1,
      targetStatus: "pending",
      navigationDisabled: false,
      title: "عرض انتقال جديد",
      body: (currentMember?.name || "عضو") + " قدم عرض " + (contractType === "loan" ? "عقد إعارة" : "عقد شراء") + " للاعب " + (payload?.targetPlayerName || "") + ".",
      createdAt: serverTimestamp(),
    });
  }

  async function updatePlayerOffer(offerId, payload) {
    const fromMemberId = cleanId(currentMemberId);
    const existing = firebasePlayerOffers.find((offer) => same(offer.id, offerId));
    if (!existing) throw new Error("العرض غير موجود.");
    if (!same(existing.fromMemberId, fromMemberId)) throw new Error("لا يمكنك تعديل عرض لا يخصك.");
    if (!isActivePlayerOfferStatus(existing.status) || isOfferExpired(existing)) throw new Error("لا يمكن تعديل هذا العرض.");
    if (toNumber(existing.editCount) >= toNumber(existing.maxEdits || 1)) throw new Error("تم استنفاد تعديل هذا العرض.");
    const playerLockedByOtherAcceptedDeal = firebasePlayerOffers.some((offer) =>
      !same(offer.id, existing.id) && same(offer.targetPlayerId, existing.targetPlayerId) && isAcceptedOrCompletedPlayerOffer(offer)
    );
    if (playerLockedByOtherAcceptedDeal || isPlayerLockedByContract(existing.targetPlayerId, payload?.contractType)) {
      throw new Error("لا يمكن تعديل العرض لأن اللاعب أصبح مرتبطًا بعقد نشط.");
    }

    const contractType = clean(payload?.contractType) === "loan" ? "loan" : "buy";
    assertTransferAllowed(fromMemberId, "send_offer");
    const existingTargetReceiveRestriction = getBlockingTransferRestriction(firebaseMemberRestrictions, existing.toMemberId, "receive_offer");
    if (existingTargetReceiveRestriction) {
      throw new Error("لا يمكنك إرسال العروض لهذا العضو بسبب إيقاف إداري من نظام الانتقالات حتى " + (existingTargetReceiveRestriction.endDate || "نهاية المدة") + (existingTargetReceiveRestriction.reason ? " - السبب: " + existingTargetReceiveRestriction.reason : "."));
    }
    const numericAmount = Math.max(0, parseFinanceAmount(payload?.amount));
    const offeredPlayers = (Array.isArray(payload?.offeredPlayers) ? payload.offeredPlayers : []).map(normalizeOfferExchangeClauseForSave);
    if (offeredPlayers.length) assertTransferAllowed(fromMemberId, "squad_change");
    const previousReserved = Math.max(0, toNumber(existing.reservedAmount ?? existing.amount));
    const availableForEdit = currentMemberAvailableBalance + previousReserved;

    const offeredPlayersCount = offeredPlayers.length;
    const targetMemberPlayerCount = getVisiblePlayersForMember(existing.toMemberId).length;
    const targetMemberCountAfterOffer = targetMemberPlayerCount - 1 + offeredPlayersCount;
    if (targetMemberCountAfterOffer < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تعديل العرض لأنه سيجعل قائمة صاحب اللاعب أقل من 17 لاعبًا بعد احتساب التبادل.");
    }
    if (targetMemberCountAfterOffer > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تعديل العرض لأنه سيجعل قائمة صاحب اللاعب تتجاوز الحد الأقصى 32 لاعبًا.");
    }

    const fromMemberVisiblePlayers = getVisiblePlayersForMember(fromMemberId);
    const fromMemberPlayerCount = fromMemberVisiblePlayers.length;
    if (offeredPlayersCount > 0 && fromMemberPlayerCount - offeredPlayersCount < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن إدراج لاعبين من قائمتك في الصفقة إذا كان ذلك سيجعل قائمتك أقل من 17 لاعبًا.");
    }
    if (fromMemberPlayerCount - offeredPlayersCount + 1 > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تعديل العرض لأن قائمتك ستتجاوز الحد الأقصى 32 لاعبًا.");
    }

    const fromMemberVisiblePlayerIds = new Set(fromMemberVisiblePlayers.map((player) => cleanId(getPlayerStableId(player))));
    const invalidOfferedPlayer = offeredPlayers.find((item) => !fromMemberVisiblePlayerIds.has(cleanId(item.playerId)));
    if (invalidOfferedPlayer) {
      throw new Error("لا يمكن إدراج لاعب غير موجود في قائمتك الحالية ضمن الصفقة.");
    }
    const duplicateOfferedPlayers = new Set();
    const duplicatedOfferedPlayer = offeredPlayers.find((item) => {
      const playerId = cleanId(item.playerId);
      if (!playerId) return true;
      if (duplicateOfferedPlayers.has(playerId)) return true;
      duplicateOfferedPlayers.add(playerId);
      return false;
    });
    if (duplicatedOfferedPlayer) {
      throw new Error("لا يمكن تكرار نفس اللاعب في صفقة التبادل.");
    }
    const loanedOfferedPlayer = offeredPlayers.find((item) => clean(getActivePlayerContract(item.playerId)?.contractType || "") === "loan");
    if (loanedOfferedPlayer) {
      throw new Error("لا يمكن إدراج لاعب تستعيره حاليًا ضمن بنود التبادل.");
    }

    const createsProPlayer = wouldOfferCreateProPlayer(existing.targetPlayerId, fromMemberId);
    const offeredProLeavingCount = offeredPlayers.reduce((sum, item) => {
      const row = fromMemberVisiblePlayers.find((player) => same(getPlayerStableId(player), item.playerId));
      const kind = row ? getRosterPlayerKind(row, fromMemberId) : "base";
      return sum + (kind === "pro_owned" || kind === "pro_loan" ? 1 : 0);
    }, 0);
    if (countMemberProPlayers(fromMemberId) - offeredProLeavingCount + (createsProPlayer ? 1 : 0) > MAX_PRO_PLAYERS) {
      throw new Error("لا يمكن تعديل العرض لأنه سيتجاوز الحد الأقصى للمحترفين (5) حسب قائمتك الحالية.");
    }

    if (contractType === "loan" && ![2, 4, 6].includes(toNumber(payload?.loanDurationMonths))) {
      throw new Error("اختر مدة عقد الإعارة.");
    }
    if (numericAmount + OFFER_FEE > availableForEdit) {
      throw new Error("الرصيد المتاح لا يكفي لتعديل العرض مع رسوم التعديل.");
    }

    const nextVersion = toNumber(existing.version || 1) + 1;
    await deactivateOfferNotifications(offerId, "offer_updated");

    await updateDoc(doc(db, "playerOffers", offerId), {
      type: contractType,
      typeLabel: contractType === "loan" ? "عقد إعارة" : "عقد شراء",
      amount: numericAmount,
      reservedAmount: numericAmount,
      offeredPlayers,
      loanDurationMonths: contractType === "loan" ? toNumber(payload?.loanDurationMonths) : null,
      notes: String(payload?.notes || "").trim(),
      editCount: toNumber(existing.editCount) + 1,
      version: nextVersion,
      updatedAt: serverTimestamp(),
      lastEditedAt: serverTimestamp(),
    });

    await addOfferFee({
      fromMemberId,
      relatedOfferId: offerId,
      note: "رسوم تعديل عرض اللاعب " + (existing.targetPlayerName || ""),
      type: "offer_edit_fee",
      dateKey: new Date().toISOString().slice(0, 10),
    });

    await addDoc(collection(db, "notifications"), {
      type: "player_offer_updated",
      status: "unread",
      toMemberId: existing.toMemberId,
      fromMemberId,
      relatedOfferId: offerId,
      targetPlayerId: existing.targetPlayerId || "",
      targetMemberId: existing.toMemberId || "",
      offerVersion: nextVersion,
      targetStatus: "pending",
      navigationDisabled: false,
      title: "تم تعديل عرض انتقال",
      body: (currentMember?.name || "عضو") + " عدّل عرضه على اللاعب " + (existing.targetPlayerName || "") + ".",
      createdAt: serverTimestamp(),
    });
  }

  async function cancelPlayerOffer(offerId) {
    const fromMemberId = cleanId(currentMemberId);
    const existing = firebasePlayerOffers.find((offer) => same(offer.id, offerId));
    if (!existing) throw new Error("العرض غير موجود.");
    if (!same(existing.fromMemberId, fromMemberId)) throw new Error("لا يمكنك إلغاء عرض لا يخصك.");
    if (!isActivePlayerOfferStatus(existing.status) || isOfferExpired(existing)) throw new Error("لا يمكن إلغاء هذا العرض.");

    await deactivateOfferNotifications(offerId, "offer_cancelled");

    await updateDoc(doc(db, "playerOffers", offerId), {
      status: "cancelledByBuyer",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      type: "player_offer_cancelled",
      status: "unread",
      toMemberId: existing.toMemberId,
      fromMemberId,
      relatedOfferId: offerId,
      targetPlayerId: existing.targetPlayerId || "",
      targetMemberId: existing.toMemberId || "",
      offerVersion: toNumber(existing.version || 1),
      targetStatus: "cancelledByBuyer",
      navigationDisabled: true,
      title: "تم إلغاء عرض",
      body: (currentMember?.name || "عضو") + " ألغى عرضه على اللاعب " + (existing.targetPlayerName || "") + ".",
      createdAt: serverTimestamp(),
    });
  }

  async function acceptPlayerOffer(offerId) {
    const ownerId = cleanId(currentMemberId);
    const existing = firebasePlayerOffers.find((offer) => same(offer.id, offerId));
    if (!existing) throw new Error("العرض غير موجود.");
    if (!same(existing.toMemberId, ownerId)) throw new Error("لا يمكنك قبول عرض لا يخص لاعبك.");
    if (!isActivePlayerOfferStatus(existing.status) || isOfferExpired(existing)) throw new Error("لا يمكن قبول هذا العرض.");

    const buyerId = cleanId(existing.fromMemberId);
    const sellerId = cleanId(existing.toMemberId);
    assertTransferAllowed(sellerId, "squad_change");
    assertTransferAllowed(buyerId, "squad_change");
    assertTransferAllowed(sellerId, "receive_offer");
    const numericAmount = Math.max(0, toNumber(existing.amount));
    const contractType = clean(existing.type) === "loan" ? "loan" : "buy";
    const nextStatus = transferMarketOpen ? "completed" : "approvedPendingWindow";
    const targetPlayerId = cleanId(existing.targetPlayerId || existing.playerId);
    const targetPlayerRow = players.find((player) => same(getPlayerStableId(player), targetPlayerId));
    if (!buyerId || !sellerId || !targetPlayerId) throw new Error("بيانات العرض غير مكتملة.");

    const previousActiveContract = getActivePlayerContract(targetPlayerId);
    const previousActiveContractType = clean(previousActiveContract?.contractType || "");
    if (previousActiveContractType === "released") throw new Error("لا يمكن قبول العرض لأن اللاعب خارج اللعبة.");

    const baseOwnerId = cleanId(
      previousActiveContract?.baseOwnerMemberId ||
        previousActiveContract?.baseOwnerId ||
        previousActiveContract?.originalBaseOwnerMemberId ||
        previousActiveContract?.originalOwnerMemberId ||
        targetPlayerRow?.memberid ||
        sellerId
    );
    const baseOwner = members.find((member) => same(member.id, baseOwnerId));
    const baseOwnerName = previousActiveContract?.baseOwnerMemberName || previousActiveContract?.originalBaseOwnerMemberName || baseOwner?.name || previousActiveContract?.originalOwnerMemberName || existing.toMemberName || currentMember?.name || "";
    const sourceOwnerId = cleanId(previousActiveContract?.currentMemberId || sellerId);
    const sourceOwnerName = previousActiveContract?.currentMemberName || existing.toMemberName || currentMember?.name || "";
    const loanRealOwnerId = previousActiveContractType === "loan"
      ? cleanId(previousActiveContract?.originalOwnerMemberId || previousActiveContract?.ownerMemberId || baseOwnerId || sellerId)
      : sourceOwnerId;
    const loanRealOwnerName = previousActiveContractType === "loan"
      ? (previousActiveContract?.originalOwnerMemberName || previousActiveContract?.ownerMemberName || baseOwnerName || sourceOwnerName)
      : sourceOwnerName;
    if (sourceOwnerId && !same(sourceOwnerId, sellerId)) {
      throw new Error("لا يمكن قبول العرض لأن ملكية اللاعب تغيرت بعد تقديم العرض.");
    }

    const offeredPlayersRaw = Array.isArray(existing.offeredPlayers) ? existing.offeredPlayers : [];
    const buyerVisiblePlayers = getVisiblePlayersForMember(buyerId);
    const buyerVisibleMap = new Map(
      buyerVisiblePlayers.map((player) => [cleanId(getPlayerStableId(player)), player])
    );
    const offeredPlayerIds = new Set();
    const offeredPlayers = offeredPlayersRaw.map((item) => {
      const playerId = cleanId(item.playerId || item.playerid || item.id);
      if (!playerId) throw new Error("يوجد لاعب غير مكتمل في صفقة التبادل.");
      if (same(playerId, targetPlayerId)) throw new Error("لا يمكن إدراج نفس اللاعب المستهدف ضمن لاعبي التبادل.");
      if (offeredPlayerIds.has(playerId)) throw new Error("لا يمكن تكرار نفس اللاعب في صفقة التبادل.");
      offeredPlayerIds.add(playerId);
      const row = buyerVisibleMap.get(playerId) || players.find((player) => same(getPlayerStableId(player), playerId));
      if (!row || !buyerVisibleMap.has(playerId)) {
        throw new Error("لا يمكن قبول العرض لأن أحد لاعبي التبادل لم يعد في قائمة مقدم العرض.");
      }
      const activeContract = getActivePlayerContract(playerId);
      const activeType = clean(activeContract?.contractType || "");
      if (activeType === "released") throw new Error("لا يمكن إدراج لاعب تم الاستغناء عنه ضمن التبادل.");
      if (activeType === "loan") throw new Error("لا يمكن قبول العرض لأن أحد لاعبي التبادل معار حاليًا لدى مقدم العرض.");
      if (activeContract && !same(activeContract.currentMemberId, buyerId)) {
        throw new Error("لا يمكن قبول العرض لأن ملكية أحد لاعبي التبادل تغيرت.");
      }
      const exchangeContractType = normalizeExchangeContractType(item.exchangeContractType || item.swapContractType || item.contractMode);
      const exchangeLoanDurationMonths = exchangeContractType === "loan" ? normalizeExchangeLoanDuration(item.exchangeLoanDurationMonths || item.loanDurationMonths) : null;
      return {
        ...item,
        row,
        activeContract,
        playerId,
        exchangeContractType,
        exchangeLoanDurationMonths,
        exchangeTypeLabel: exchangeContractType === "loan" ? "إعارة" : "بيع كامل",
        playerName: item.playerName || row.name || "",
        playerImage: item.playerImage || item.image || row.image || "",
        playerPosition: item.playerPosition || item.position || row.position || "",
        playerRating: item.playerRating || item.rating || row.rating || "",
      };
    });

    const sellerPlayerCount = getVisiblePlayersForMember(sellerId).length;
    const buyerPlayerCount = buyerVisiblePlayers.length;
    const sellerCountAfterDeal = sellerPlayerCount - 1 + offeredPlayers.length;
    const buyerCountAfterDeal = buyerPlayerCount - offeredPlayers.length + 1;
    if (sellerCountAfterDeal < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن قائمة العضو لا يجوز أن تقل عن 17 لاعبًا بعد الصفقة.");
    }
    if (sellerCountAfterDeal > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن قائمة صاحب اللاعب ستتجاوز الحد الأقصى 32 لاعبًا بعد الصفقة.");
    }
    if (buyerCountAfterDeal < MIN_SQUAD_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن قائمة مقدم العرض ستصبح أقل من 17 لاعبًا بعد الصفقة.");
    }
    if (buyerCountAfterDeal > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن قائمة مقدم العرض ستتجاوز الحد الأقصى 32 لاعبًا بعد الصفقة.");
    }

    const targetFreeOrigin = isFreeOriginContract(previousActiveContract);
    const targetFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(previousActiveContract, targetFreeOrigin ? baseOwnerId || sellerId : "");
    const targetRosterKindForSeller = getRosterPlayerKindFromContract(targetPlayerRow || {}, previousActiveContract, sellerId);
    const targetProLeavingSeller = isProRosterKind(targetRosterKindForSeller) ? 1 : 0;
    const targetProEnteringBuyer = (() => {
      if (contractType === "loan") return same(baseOwnerId, buyerId) ? 0 : 1;
      if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, buyerId)) return 0;
      return baseOwnerId && !same(baseOwnerId, buyerId) ? 1 : 0;
    })();

    let offeredProLeavingBuyer = 0;
    let offeredProEnteringSeller = 0;
    offeredPlayers.forEach((item) => {
      const swapBaseOwnerId = cleanId(item.activeContract?.baseOwnerMemberId || item.activeContract?.baseOwnerId || item.activeContract?.originalBaseOwnerMemberId || item.activeContract?.originalOwnerMemberId || item.row?.memberid || buyerId);
      const swapFreeOrigin = isFreeOriginContract(item.activeContract);
      const swapFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(item.activeContract, swapFreeOrigin ? swapBaseOwnerId || buyerId : "");
      const currentKindForBuyer = getRosterPlayerKindFromContract(item.row, item.activeContract, buyerId);
      if (isProRosterKind(currentKindForBuyer)) offeredProLeavingBuyer += 1;
      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, sellerId)) return;
      if (swapBaseOwnerId && !same(swapBaseOwnerId, sellerId)) offeredProEnteringSeller += 1;
    });

    const buyerPendingProDelta = getPendingAcceptedProDeltaForMember(buyerId, offerId);
    const sellerPendingProDelta = getPendingAcceptedProDeltaForMember(sellerId, offerId);
    const buyerProAfterDeal = countMemberProPlayers(buyerId) + buyerPendingProDelta - offeredProLeavingBuyer + targetProEnteringBuyer;
    const sellerProAfterDeal = countMemberProPlayers(sellerId) + sellerPendingProDelta - targetProLeavingSeller + offeredProEnteringSeller;
    if (buyerProAfterDeal > MAX_PRO_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن مقدم العرض سيتجاوز الحد الأقصى للمحترفين (5) بعد احتساب الصفقات المعلقة.");
    }
    if (sellerProAfterDeal > MAX_PRO_PLAYERS) {
      throw new Error("لا يمكن قبول العرض لأن صاحب اللاعب سيتجاوز الحد الأقصى للمحترفين (5) بسبب لاعبي التبادل أو الصفقات المعلقة.");
    }

    await deactivateOfferNotifications(offerId, "offer_accepted");

    const acceptanceDate = new Date();
    const acceptanceDateKey = acceptanceDate.toISOString().slice(0, 10);

    await updateDoc(doc(db, "playerOffers", offerId), {
      status: nextStatus,
      approvedAt: serverTimestamp(),
      completedAt: transferMarketOpen ? serverTimestamp() : null,
      approvedByMemberId: ownerId,
      marketWasOpenAtApproval: transferMarketOpen,
      paymentDueAtApproval: numericAmount > 0,
      paymentTransferredAtApproval: numericAmount > 0,
      paymentTransferredAt: numericAmount > 0 ? serverTimestamp() : null,
      paymentTransferDate: numericAmount > 0 ? acceptanceDateKey : null,
      updatedAt: serverTimestamp(),
    });

    const competingOffers = firebasePlayerOffers.filter((offer) =>
      !same(offer.id, offerId) &&
      same(offer.targetPlayerId, existing.targetPlayerId) &&
      clean(offer.status || "pending") === "pending" &&
      !isOfferExpired(offer)
    );

    await Promise.allSettled(
      competingOffers.map(async (offer) => {
        await deactivateOfferNotifications(offer.id, "player_offer_closed");
        await updateDoc(doc(db, "playerOffers", offer.id), {
          status: "cancelledBecausePlayerUnavailable",
          cancelledAt: serverTimestamp(),
          cancelledReason: "تم قبول عرض آخر على نفس اللاعب",
          updatedAt: serverTimestamp(),
        });
        await addDoc(collection(db, "notifications"), {
          type: "player_offer_closed",
          status: "unread",
          toMemberId: offer.fromMemberId,
          fromMemberId: ownerId,
          relatedOfferId: offer.id,
          targetPlayerId: offer.targetPlayerId || "",
          targetMemberId: ownerId,
          offerVersion: toNumber(offer.version || 1),
          targetStatus: "cancelledBecausePlayerUnavailable",
          navigationDisabled: true,
          title: "تم إغلاق عرضك",
          body: "تم قبول عرض آخر على اللاعب " + (offer.targetPlayerName || "") + "، لذلك أُغلق عرضك تلقائيًا.",
          createdAt: serverTimestamp(),
        });
      })
    );

    if (!transferMarketOpen) {
      if (numericAmount > 0) {
        await addDoc(collection(db, "moneyTransfers"), {
          fromMemberId: buyerId,
          fromMemberName: existing.fromMemberName || "",
          toMemberId: sellerId,
          toMemberName: existing.toMemberName || currentMember?.name || "",
          amount: numericAmount,
          type: "player_offer_payment",
          status: "approved",
          approvedBy: ownerId,
          relatedOfferId: offerId,
          note: "قيمة عرض اللاعب " + (existing.targetPlayerName || "") + " - تم تحويلها فور قبول الصفقة بانتظار فتح السوق",
          date: acceptanceDateKey,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await Promise.allSettled([
        addDoc(collection(db, "notifications"), {
          type: "player_offer_accepted_pending_window",
          status: "unread",
          toMemberId: buyerId,
          fromMemberId: sellerId,
          relatedOfferId: offerId,
          targetPlayerId,
          targetMemberId: sellerId,
          title: "تم قبول عرضك بانتظار السوق",
          body: "تم قبول عرضك للاعب " + (existing.targetPlayerName || "") + "، ولن ينتقل اللاعب أو تتحدث القوائم إلا عند فتح سوق الانتقالات.",
          createdAt: serverTimestamp(),
        }),
        addDoc(collection(db, "notifications"), {
          type: "player_offer_accepted_pending_window",
          status: "unread",
          toMemberId: sellerId,
          fromMemberId: buyerId,
          relatedOfferId: offerId,
          targetPlayerId,
          targetMemberId: sellerId,
          title: "صفقة مقبولة بانتظار السوق",
          body: "تم اعتماد قبول عرض " + (existing.targetPlayerName || "") + "، وستنفذ الصفقة عند فتح سوق الانتقالات فقط.",
          createdAt: serverTimestamp(),
        }),
      ]);
      return;
    }

    const loanMonths = contractType === "loan" ? toNumber(existing.loanDurationMonths) : null;
    const nowDate = new Date();
    const todayDateKey = nowDate.toISOString().slice(0, 10);
    const loanEndDate = loanMonths
      ? new Date(nowDate.getFullYear(), nowDate.getMonth() + loanMonths, nowDate.getDate()).toISOString().slice(0, 10)
      : null;

    if (previousActiveContract?.id) {
      await updateDoc(doc(db, "playerContracts", previousActiveContract.id), {
        status: "replaced",
        replacedByOfferId: offerId,
        replacedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, sellerId) && !same(targetFreeSlotOwnerId, buyerId)) {
      await setDoc(doc(db, "freePlayerStatus", sellerId), {
        memberId: toNumber(sellerId),
        hasUsedFreeSlot: true,
        currentFreePlayerId: "",
        currentFreePlayerName: "",
        lostFreePlayerId: targetPlayerId,
        lostFreePlayerName: existing.targetPlayerName || targetPlayerRow?.name || "",
        lostFreePlayerAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    const newContractPayload = {
      status: "active",
      playerId: targetPlayerId,
      playerName: existing.targetPlayerName || targetPlayerRow?.name || "",
      playerImage: existing.targetPlayerImage || targetPlayerRow?.image || "",
      playerPosition: existing.targetPlayerPosition || targetPlayerRow?.position || "",
      playerRating: existing.targetPlayerRating || targetPlayerRow?.rating || "",
      ownerMemberId: contractType === "loan" ? loanRealOwnerId : buyerId,
      ownerMemberName: contractType === "loan" ? loanRealOwnerName : (existing.fromMemberName || getMemberName(members, buyerId)),
      originalOwnerMemberId: contractType === "loan" ? loanRealOwnerId : baseOwnerId,
      originalOwnerMemberName: contractType === "loan" ? loanRealOwnerName : baseOwnerName,
      baseOwnerMemberId: baseOwnerId,
      baseOwnerMemberName: baseOwnerName,
      currentMemberId: buyerId,
      currentMemberName: existing.fromMemberName || getMemberName(members, buyerId),
      previousMemberId: sourceOwnerId,
      previousMemberName: sourceOwnerName,
      contractType: contractType === "loan" ? "loan" : "owned",
      rosterType: getRosterKindCode({ contractType: contractType === "loan" ? "loan" : "owned", originalOwnerMemberId: baseOwnerId, currentMemberId: buyerId, freeAgent: targetFreeOrigin && same(targetFreeSlotOwnerId, buyerId) }),
      isFreeOrigin: targetFreeOrigin,
      freeAgentOrigin: targetFreeOrigin,
      freeAgentSlotOwnerMemberId: targetFreeSlotOwnerId || "",
      sourceOfferId: offerId,
      amount: numericAmount,
      loanAmount: contractType === "loan" ? numericAmount : 0,
      loanDurationMonths: loanMonths,
      loanStartDate: transferMarketOpen ? todayDateKey : null,
      loanEndDate: transferMarketOpen ? loanEndDate : null,
      pendingWindow: !transferMarketOpen,
      marketWasOpenAtApproval: transferMarketOpen,
      createdBy: ownerId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "playerContracts"), newContractPayload);

    if (targetFreeOrigin && targetFreeSlotOwnerId && same(targetFreeSlotOwnerId, buyerId)) {
      await setDoc(doc(db, "freePlayerStatus", buyerId), {
        memberId: toNumber(buyerId),
        hasUsedFreeSlot: false,
        currentFreePlayerId: targetPlayerId,
        currentFreePlayerName: existing.targetPlayerName || targetPlayerRow?.name || "",
        returnedFreePlayerAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    const enrichedOfferedPlayers = [];
    for (const item of offeredPlayers) {
      const swapBaseOwnerId = cleanId(item.activeContract?.baseOwnerMemberId || item.activeContract?.baseOwnerId || item.activeContract?.originalBaseOwnerMemberId || item.activeContract?.originalOwnerMemberId || item.row?.memberid || buyerId);
      const swapBaseOwner = members.find((member) => same(member.id, swapBaseOwnerId));
      const swapBaseOwnerName = item.activeContract?.baseOwnerMemberName || item.activeContract?.originalBaseOwnerMemberName || item.activeContract?.originalOwnerMemberName || swapBaseOwner?.name || getMemberName(members, swapBaseOwnerId) || existing.fromMemberName || "";
      const swapSourceOwnerId = cleanId(item.activeContract?.currentMemberId || buyerId);
      const swapSourceOwnerName = item.activeContract?.currentMemberName || existing.fromMemberName || getMemberName(members, buyerId) || "";
      const swapFreeOrigin = isFreeOriginContract(item.activeContract);
      const swapFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(item.activeContract, swapFreeOrigin ? swapBaseOwnerId || buyerId : "");
      const exchangeContractType = normalizeExchangeContractType(item.exchangeContractType);
      const exchangeLoanMonths = exchangeContractType === "loan" ? normalizeExchangeLoanDuration(item.exchangeLoanDurationMonths) : null;
      const exchangeLoanEndDate = exchangeLoanMonths
        ? new Date(nowDate.getFullYear(), nowDate.getMonth() + exchangeLoanMonths, nowDate.getDate()).toISOString().slice(0, 10)
        : null;
      const exchangeOwnerId = exchangeContractType === "loan" ? swapSourceOwnerId : sellerId;
      const exchangeOwnerName = exchangeContractType === "loan" ? swapSourceOwnerName : (existing.toMemberName || getMemberName(members, sellerId));
      const exchangeOriginalOwnerId = exchangeContractType === "loan" ? swapSourceOwnerId : swapBaseOwnerId;
      const exchangeOriginalOwnerName = exchangeContractType === "loan" ? swapSourceOwnerName : swapBaseOwnerName;

      if (item.activeContract?.id) {
        await updateDoc(doc(db, "playerContracts", item.activeContract.id), {
          status: "replaced_exchange",
          replacedByOfferId: offerId,
          replacedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, buyerId) && !same(swapFreeSlotOwnerId, sellerId)) {
        await setDoc(doc(db, "freePlayerStatus", buyerId), {
          memberId: toNumber(buyerId),
          hasUsedFreeSlot: true,
          currentFreePlayerId: "",
          currentFreePlayerName: "",
          lostFreePlayerId: item.playerId,
          lostFreePlayerName: item.playerName || "",
          lostFreePlayerAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      await addDoc(collection(db, "playerContracts"), {
        status: "active",
        contractType: exchangeContractType === "loan" ? "loan" : "owned",
        playerId: item.playerId,
        playerName: item.playerName || "",
        playerImage: item.playerImage || "",
        playerPosition: item.playerPosition || "",
        playerRating: item.playerRating || "",
        ownerMemberId: exchangeOwnerId,
        ownerMemberName: exchangeOwnerName,
        originalOwnerMemberId: exchangeOriginalOwnerId,
        originalOwnerMemberName: exchangeOriginalOwnerName,
        baseOwnerMemberId: swapBaseOwnerId,
        baseOwnerMemberName: swapBaseOwnerName,
        currentMemberId: sellerId,
        currentMemberName: existing.toMemberName || getMemberName(members, sellerId),
        previousMemberId: swapSourceOwnerId,
        previousMemberName: swapSourceOwnerName,
        contractTypeLabel: exchangeContractType === "loan" ? ("تبادل - إعارة " + loanDurationLabel(exchangeLoanMonths)) : "تبادل - بيع كامل",
        rosterType: getRosterKindCode({ contractType: exchangeContractType === "loan" ? "loan" : "owned", originalOwnerMemberId: exchangeOriginalOwnerId, currentMemberId: sellerId, freeAgent: swapFreeOrigin && same(swapFreeSlotOwnerId, sellerId) }),
        isFreeOrigin: swapFreeOrigin,
        freeAgentOrigin: swapFreeOrigin,
        freeAgentSlotOwnerMemberId: swapFreeSlotOwnerId || "",
        sourceOfferId: offerId,
        source: "exchange_player",
        exchangeContractType,
        exchangeLoanDurationMonths: exchangeLoanMonths,
        amount: 0,
        loanAmount: 0,
        loanDurationMonths: exchangeLoanMonths,
        loanStartDate: exchangeContractType === "loan" ? todayDateKey : null,
        loanEndDate: exchangeContractType === "loan" ? exchangeLoanEndDate : null,
        marketWasOpenAtApproval: transferMarketOpen,
        createdBy: ownerId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (swapFreeOrigin && swapFreeSlotOwnerId && same(swapFreeSlotOwnerId, sellerId)) {
        await setDoc(doc(db, "freePlayerStatus", sellerId), {
          memberId: toNumber(sellerId),
          hasUsedFreeSlot: false,
          currentFreePlayerId: item.playerId,
          currentFreePlayerName: item.playerName || "",
          returnedFreePlayerAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      enrichedOfferedPlayers.push({
        playerId: item.playerId,
        playerName: item.playerName || "",
        playerImage: item.playerImage || "",
        playerPosition: item.playerPosition || "",
        playerRating: item.playerRating || "",
        fromMemberId: buyerId,
        fromMemberName: existing.fromMemberName || getMemberName(members, buyerId),
        toMemberId: sellerId,
        toMemberName: existing.toMemberName || getMemberName(members, sellerId),
        exchangeContractType,
        exchangeLoanDurationMonths: exchangeLoanMonths,
        exchangeTypeLabel: exchangeContractType === "loan" ? "إعارة" : "بيع كامل",
        originalOwnerMemberId: swapBaseOwnerId,
        originalOwnerMemberName: swapBaseOwnerName,
        isFreeOrigin: swapFreeOrigin,
        freeAgentSlotOwnerMemberId: swapFreeSlotOwnerId || "",
      });
    }

    const transferHistoryPayload = {
      status: nextStatus,
      type: contractType === "loan" ? "loan" : "buy",
      typeLabel: contractType === "loan" ? "عقد إعارة" : (enrichedOfferedPlayers.length ? "عقد شراء + تبادل" : "عقد شراء"),
      playerId: targetPlayerId,
      playerName: existing.targetPlayerName || targetPlayerRow?.name || "",
      playerImage: existing.targetPlayerImage || targetPlayerRow?.image || "",
      playerPosition: existing.targetPlayerPosition || targetPlayerRow?.position || "",
      playerRating: existing.targetPlayerRating || targetPlayerRow?.rating || "",
      fromMemberId: sourceOwnerId,
      fromMemberName: sourceOwnerName,
      toMemberId: buyerId,
      toMemberName: existing.fromMemberName || getMemberName(members, buyerId),
      originalOwnerMemberId: contractType === "loan" ? loanRealOwnerId : baseOwnerId,
      originalOwnerMemberName: contractType === "loan" ? loanRealOwnerName : baseOwnerName,
      baseOwnerMemberId: baseOwnerId,
      baseOwnerMemberName: baseOwnerName,
      ownerMemberId: contractType === "loan" ? loanRealOwnerId : buyerId,
      ownerMemberName: contractType === "loan" ? loanRealOwnerName : (existing.fromMemberName || getMemberName(members, buyerId)),
      amount: numericAmount,
      loanDurationMonths: loanMonths,
      loanStartDate: transferMarketOpen ? todayDateKey : null,
      loanEndDate: transferMarketOpen ? loanEndDate : null,
      date: todayDateKey,
      periodId: getTransferWindowIdForDate(firebaseTransferWindows, todayDateKey),
      periodName: getTransferWindowNameForDate(firebaseTransferWindows, todayDateKey),
      seasonId: activeSeasonId,
      relatedOfferId: offerId,
      marketWasOpenAtApproval: transferMarketOpen,
      completedAt: transferMarketOpen ? serverTimestamp() : null,
      offeredPlayers: enrichedOfferedPlayers,
      exchangePlayerCount: enrichedOfferedPlayers.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "transferHistory"), transferHistoryPayload);

    if (transferMarketOpen && numericAmount > 0 && !existing.paymentTransferredAtApproval) {
      await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: buyerId,
        fromMemberName: existing.fromMemberName || "",
        toMemberId: sellerId,
        toMemberName: existing.toMemberName || currentMember?.name || "",
        amount: numericAmount,
        type: "player_offer_payment",
        status: "approved",
        approvedBy: ownerId,
        relatedOfferId: offerId,
        note: "قيمة عرض اللاعب " + (existing.targetPlayerName || ""),
        date: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "playerOffers", offerId), {
        paymentTransferredAtApproval: true,
        paymentTransferredAt: serverTimestamp(),
        paymentTransferDate: todayDateKey,
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "notifications"), {
      type: "player_offer_accepted",
      status: "unread",
      toMemberId: buyerId,
      fromMemberId: ownerId,
      relatedOfferId: offerId,
      targetPlayerId: existing.targetPlayerId || "",
      targetMemberId: sellerId,
      offerVersion: toNumber(existing.version || 1),
      targetStatus: nextStatus,
      navigationDisabled: true,
      title: "تم قبول عرضك",
      body: (currentMember?.name || "العضو") + " وافق على عرضك للاعب " + (existing.targetPlayerName || "") + (transferMarketOpen ? "." : "، والصفقة بانتظار فتح سوق الانتقالات."),
      createdAt: serverTimestamp(),
    });

    return {
      instantContract: {
        row: transferHistoryPayload,
        player: {
          name: existing.targetPlayerName || targetPlayerRow?.name || "",
          image: existing.targetPlayerImage || targetPlayerRow?.image || FALLBACK_PLAYER_IMAGE,
          rating: existing.targetPlayerRating || targetPlayerRow?.rating || "",
          position: existing.targetPlayerPosition || targetPlayerRow?.position || "",
        },
      },
    };
  }

  async function rejectPlayerOffer(offerId) {
    const ownerId = cleanId(currentMemberId);
    const existing = firebasePlayerOffers.find((offer) => same(offer.id, offerId));
    if (!existing) throw new Error("العرض غير موجود.");
    if (!same(existing.toMemberId, ownerId)) throw new Error("لا يمكنك رفض عرض لا يخص لاعبك.");
    if (!isActivePlayerOfferStatus(existing.status) || isOfferExpired(existing)) throw new Error("لا يمكن رفض هذا العرض.");

    await deactivateOfferNotifications(offerId, "offer_rejected");

    await updateDoc(doc(db, "playerOffers", offerId), {
      status: "rejected",
      rejectedAt: serverTimestamp(),
      rejectedByMemberId: ownerId,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      type: "player_offer_rejected",
      status: "unread",
      toMemberId: existing.fromMemberId,
      fromMemberId: ownerId,
      relatedOfferId: offerId,
      targetPlayerId: existing.targetPlayerId || "",
      targetMemberId: existing.toMemberId || "",
      offerVersion: toNumber(existing.version || 1),
      targetStatus: "rejected",
      navigationDisabled: true,
      title: "تم رفض عرضك",
      body: (currentMember?.name || "العضو") + " رفض عرضك للاعب " + (existing.targetPlayerName || "") + ".",
      createdAt: serverTimestamp(),
    });
  }

  async function releasePlayerFromSquad(player) {
    const ownerId = cleanId(currentMemberId);
    const playerId = getPlayerStableId(player);
    if (!ownerId || !playerId) throw new Error("بيانات اللاعب غير مكتملة.");
    assertTransferAllowed(ownerId, "squad_change");
    if (!transferMarketOpen) throw new Error("الاستغناء متاح فقط خلال فترة الانتقالات وقيد اللاعبين.");

    const activeContract = getActivePlayerContract(playerId);
    const contractType = clean(activeContract?.contractType || "");
    if (contractType === "released") throw new Error("تم الاستغناء عن هذا اللاعب سابقًا ولا يمكن تنفيذ الإجراء مرة أخرى.");

    const effectiveOwnerId = activeContract && contractType !== "released"
      ? cleanId(activeContract.currentMemberId)
      : cleanId(player.memberid);

    if (!same(effectiveOwnerId, ownerId)) throw new Error("لا يمكنك الاستغناء عن لاعب لا يخص قائمتك.");
    const ownerRosterKind = getRosterPlayerKindFromContract(player, activeContract, ownerId);
    if (ownerRosterKind === "free") {
      throw new Error("لا يمكن الاستغناء عن اللاعب الحر. يمكن تبديله فقط من صفحة اللاعبين الأحرار خلال سوق الانتقالات.");
    }
    if (activeContract && contractType !== "owned") throw new Error("لا يمكن الاستغناء عن لاعب معار أو مرتبط بعقد غير مملوك ملكية كاملة.");

    const activeAcceptedDeal = firebasePlayerOffers.find((offer) =>
      same(offer.targetPlayerId, playerId) && isAcceptedOrCompletedPlayerOffer(offer)
    );
    if (activeAcceptedDeal) throw new Error("لا يمكن الاستغناء عن لاعب عليه صفقة مقبولة أو مكتملة.");

    const ownerPlayersCount = getVisiblePlayersForMember(ownerId).length;
    if (ownerPlayersCount <= MIN_SQUAD_PLAYERS) throw new Error("لا يمكن الاستغناء عندما تكون قائمة العضو 17 لاعبًا حسب نظام الموسم السادس.");

    const releaseDate = new Date().toISOString().slice(0, 10);
    const releaseWindowId = getTransferWindowIdForDate(firebaseTransferWindows, releaseDate);
    const releaseWindowName = getTransferWindowNameForDate(firebaseTransferWindows, releaseDate);

    const activeOffersForPlayer = firebasePlayerOffers.filter((offer) =>
      same(offer.targetPlayerId, playerId) &&
      clean(offer.status || "pending") === "pending" &&
      !isOfferExpired(offer)
    );

    await Promise.allSettled(
      activeOffersForPlayer.map(async (offer) => {
        await deactivateOfferNotifications(offer.id, "player_released");
        await updateDoc(doc(db, "playerOffers", offer.id), {
          status: "cancelledBecausePlayerReleased",
          cancelledAt: serverTimestamp(),
          cancelledReason: "تم الاستغناء عن اللاعب وإنهاء عقده مع الفريق",
          navigationDisabled: true,
          updatedAt: serverTimestamp(),
        });
        if (!same(offer.fromMemberId, ownerId)) {
          await addDoc(collection(db, "notifications"), {
            type: "player_offer_closed",
            status: "unread",
            toMemberId: offer.fromMemberId,
            fromMemberId: ownerId,
            relatedOfferId: offer.id,
            targetPlayerId: playerId,
            targetMemberId: ownerId,
            offerVersion: toNumber(offer.version || 1),
            targetStatus: "cancelledBecausePlayerReleased",
            navigationDisabled: true,
            title: "تم إغلاق عرضك",
            body: "تم الاستغناء عن اللاعب " + (player.name || "") + "، لذلك أُغلق عرضك تلقائيًا.",
            createdAt: serverTimestamp(),
          });
        }
      })
    );

    if (activeContract?.id) {
      await updateDoc(doc(db, "playerContracts", activeContract.id), {
        status: "released_to_free_agent",
        releasedToFreeAgentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "playerContracts"), {
      status: "active",
      contractType: "free_agent",
      rosterType: "free",
      isFreeOrigin: true,
      freeAgentOrigin: true,
      releasedToFreeAgent: true,
      availableFreeAgent: true,
      playerId,
      playerName: player.name || "",
      playerImage: player.image || "",
      playerPosition: player.position || "",
      playerRating: player.rating || "",
      ownerMemberId: "free_agents",
      ownerMemberName: "اللاعبون الأحرار",
      originalOwnerMemberId: ownerId,
      originalOwnerMemberName: currentMember?.name || authProfile?.memberName || "",
      baseOwnerMemberId: ownerId,
      baseOwnerMemberName: currentMember?.name || authProfile?.memberName || "",
      currentMemberId: "",
      currentMemberName: "لاعب حر متاح",
      previousMemberId: ownerId,
      previousMemberName: currentMember?.name || authProfile?.memberName || "",
      permanentlyRemoved: false,
      releasedAt: serverTimestamp(),
      releasedDate: releaseDate,
      marketWasOpenAtRelease: transferMarketOpen,
      transferWindowId: releaseWindowId,
      transferWindowName: releaseWindowName,
      periodId: releaseWindowId,
      periodName: releaseWindowName,
      createdBy: authUser?.uid || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const releaseRef = await addDoc(collection(db, "playerReleases"), {
      status: "completed",
      type: "release",
      typeLabel: "إنهاء تعاقد",
      memberId: ownerId,
      memberName: currentMember?.name || authProfile?.memberName || "",
      fromMemberId: ownerId,
      fromMemberName: currentMember?.name || authProfile?.memberName || "",
      toMemberId: "free_agents",
      toMemberName: "اللاعبون الأحرار",
      playerId,
      playerName: player.name || "",
      playerImage: player.image || "",
      playerPosition: player.position || "",
      playerRating: player.rating || "",
      amount: 0,
      permanentlyRemoved: false,
      releasedToFreeAgent: true,
      marketWasOpen: transferMarketOpen,
      transferWindowId: releaseWindowId,
      transferWindowName: releaseWindowName,
      periodId: releaseWindowId,
      periodName: releaseWindowName,
      seasonId: activeSeasonId,
      createdBy: authUser?.uid || "",
      date: releaseDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "transferHistory"), {
      status: "completed",
      type: "release",
      typeLabel: "إنهاء تعاقد",
      playerId,
      playerName: player.name || "",
      playerImage: player.image || "",
      playerPosition: player.position || "",
      playerRating: player.rating || "",
      fromMemberId: ownerId,
      fromMemberName: currentMember?.name || authProfile?.memberName || "",
      toMemberId: "free_agents",
      toMemberName: "اللاعبون الأحرار",
      amount: 0,
      date: releaseDate,
      periodId: releaseWindowId,
      periodName: releaseWindowName,
      seasonId: activeSeasonId,
      relatedReleaseId: releaseRef.id,
      marketWasOpenAtRelease: transferMarketOpen,
      note: "إنهاء تعاقد ونقل اللاعب إلى قائمة اللاعبين الأحرار",
      completedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      type: "player_released",
      status: "unread",
      toMemberId: ownerId,
      fromMemberId: ownerId,
      targetPlayerId: playerId,
      targetMemberId: ownerId,
      targetStatus: "released_to_free_agent",
      navigationDisabled: true,
      title: "تم الاستغناء عن لاعب",
      body: "تم إنهاء عقد اللاعب " + (player.name || "") + " ونقله إلى قائمة اللاعبين الأحرار.",
      createdAt: serverTimestamp(),
    });
  }

  async function terminateLoanContract(contract) {
    const actorId = cleanId(currentMemberId);
    if (!actorId) throw new Error("لم يتم ربط الحساب بعضو بعد.");
    assertTransferAllowed(actorId, "squad_change");
    if (!contract?.id) throw new Error("عقد الإعارة غير موجود.");
    if (clean(contract.contractType) !== "loan") throw new Error("هذا اللاعب ليس على عقد إعارة.");
    if (!transferMarketOpen) throw new Error("فسخ الإعارة متاح فقط خلال فترة الانتقالات وقيد اللاعبين.");

    const currentHolderId = cleanId(contract.currentMemberId);
    const originalOwnerId = cleanId(contract.originalOwnerMemberId || contract.ownerMemberId);
    const isCurrentHolder = same(actorId, currentHolderId);
    const isOriginalOwner = same(actorId, originalOwnerId);
    if (!isCurrentHolder && !isOriginalOwner) throw new Error("لا يمكنك فسخ عقد إعارة لا يخصك.");

    const compensation = LOAN_TERMINATION_COMPENSATION;
    const loanAmount = Math.max(0, toNumber(contract.loanAmount || contract.amount || 0));
    const todayDateKey = new Date().toISOString().slice(0, 10);
    const actorName = currentMember?.name || authProfile?.memberName || "";
    const otherMemberId = isCurrentHolder ? originalOwnerId : currentHolderId;

    await updateDoc(doc(db, "playerContracts", contract.id), {
      status: "terminated",
      terminatedAt: serverTimestamp(),
      terminatedByMemberId: actorId,
      terminatedByMemberName: actorName,
      updatedAt: serverTimestamp(),
    });

    const returningFreeOrigin = isFreeOriginContract(contract);
    const returningFreeSlotOwnerId = getFreeAgentSlotOwnerIdFromContract(contract, returningFreeOrigin ? originalOwnerId : "");
    const returningBaseOwnerId = cleanId(
      contract.baseOwnerMemberId ||
        contract.baseOwnerId ||
        contract.originalBaseOwnerMemberId ||
        contract.sourceBaseOwnerMemberId ||
        contract.baseMemberId ||
        originalOwnerId
    );
    const returningBaseOwnerName = contract.baseOwnerMemberName || contract.originalBaseOwnerMemberName || getMemberName(members, returningBaseOwnerId) || contract.originalOwnerMemberName || contract.ownerMemberName || "";
    const returningOwnerName = contract.originalOwnerMemberName || contract.ownerMemberName || getMemberName(members, originalOwnerId) || "";
    const returningRosterType = getRosterKindCode({
      contractType: "owned",
      originalOwnerMemberId: returningBaseOwnerId,
      currentMemberId: originalOwnerId,
      freeAgent: returningFreeOrigin && same(returningFreeSlotOwnerId, originalOwnerId),
    });

    await addDoc(collection(db, "playerContracts"), {
      status: "active",
      contractType: "owned",
      rosterType: returningRosterType,
      playerId: contract.playerId || "",
      playerName: contract.playerName || "",
      playerImage: contract.playerImage || "",
      playerPosition: contract.playerPosition || "",
      playerRating: contract.playerRating || "",
      ownerMemberId: originalOwnerId,
      ownerMemberName: returningOwnerName,
      originalOwnerMemberId: returningBaseOwnerId,
      originalOwnerMemberName: returningBaseOwnerName,
      baseOwnerMemberId: returningBaseOwnerId,
      baseOwnerMemberName: returningBaseOwnerName,
      currentMemberId: originalOwnerId,
      currentMemberName: returningOwnerName,
      previousMemberId: currentHolderId,
      previousMemberName: contract.currentMemberName || "",
      sourceContractId: contract.id,
      source: "loan_terminated",
      isFreeOrigin: returningFreeOrigin,
      freeAgentOrigin: returningFreeOrigin,
      freeAgentSlotOwnerMemberId: returningFreeSlotOwnerId, 
      marketWasOpenAtTermination: transferMarketOpen,
      createdBy: actorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (isOriginalOwner) {
      if (loanAmount > 0) {
        await addDoc(collection(db, "moneyTransfers"), {
          fromMemberId: originalOwnerId,
          fromMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
          toMemberId: currentHolderId,
          toMemberName: contract.currentMemberName || "",
          amount: loanAmount,
          type: "loan_refund_by_owner_termination",
          status: "approved",
          note: "استرجاع مبلغ إعارة اللاعب " + (contract.playerName || ""),
          relatedContractId: contract.id,
          date: todayDateKey,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: originalOwnerId,
        fromMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
        toMemberId: currentHolderId,
        toMemberName: contract.currentMemberName || "",
        amount: compensation,
        type: "loan_termination_compensation",
        status: "approved",
        note: "تعويض فسخ إعارة اللاعب " + (contract.playerName || ""),
        relatedContractId: contract.id,
        date: todayDateKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: currentHolderId,
        fromMemberName: contract.currentMemberName || "",
        toMemberId: originalOwnerId,
        toMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
        amount: compensation,
        type: "loan_termination_compensation",
        status: "approved",
        note: "تعويض فسخ إعارة اللاعب " + (contract.playerName || ""),
        relatedContractId: contract.id,
        date: todayDateKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "transferHistory"), {
      status: "completed",
      type: "loan_terminated",
      typeLabel: "فسخ إعارة",
      playerId: contract.playerId || "",
      playerName: contract.playerName || "",
      playerImage: contract.playerImage || "",
      playerPosition: contract.playerPosition || "",
      playerRating: contract.playerRating || "",
      fromMemberId: currentHolderId,
      fromMemberName: contract.currentMemberName || "",
      toMemberId: originalOwnerId,
      toMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
      originalOwnerMemberId: originalOwnerId,
      originalOwnerMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
      baseOwnerMemberId: returningBaseOwnerId,
      baseOwnerMemberName: returningBaseOwnerName,
      ownerMemberId: originalOwnerId,
      ownerMemberName: contract.originalOwnerMemberName || contract.ownerMemberName || "",
      amount: compensation,
      date: todayDateKey,
      periodId: getTransferWindowIdForDate(firebaseTransferWindows, todayDateKey),
      periodName: getTransferWindowNameForDate(firebaseTransferWindows, todayDateKey),
      seasonId: activeSeasonId,
      relatedContractId: contract.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (returningFreeOrigin && returningFreeSlotOwnerId && same(returningFreeSlotOwnerId, originalOwnerId)) {
      await setDoc(doc(db, "freePlayerStatus", originalOwnerId), {
        memberId: toNumber(originalOwnerId),
        hasUsedFreeSlot: false,
        currentFreePlayerId: contract.playerId || "",
        currentFreePlayerName: contract.playerName || "",
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    await addDoc(collection(db, "notifications"), {
      type: "loan_terminated",
      status: "unread",
      toMemberId: otherMemberId,
      fromMemberId: actorId,
      targetPlayerId: contract.playerId || "",
      targetStatus: "loan_terminated",
      navigationDisabled: true,
      title: "تم فسخ إعارة",
      body: (actorName || "عضو") + " قام بفسخ إعارة اللاعب " + (contract.playerName || "") + ".",
      createdAt: serverTimestamp(),
    });
  }

  async function registerFreeAgentFee(player) {
    const ownerId = cleanId(currentMemberId);
    const playerId = getPlayerStableId(player);
    if (!authUser || !ownerId) throw new Error("لم يتم ربط الحساب بعضو بعد.");
    assertTransferAllowed(ownerId, "squad_change");
    if (!playerId) throw new Error("بيانات اللاعب غير مكتملة.");
    const freeAgentPoolContract = getActivePlayerContract(playerId);
    const playerAvailableAsFreeAgent = isFreeAgentPlayer(player) || isFreeAgentPoolContract(freeAgentPoolContract);
    if (!playerAvailableAsFreeAgent) throw new Error("هذا اللاعب غير متاح ضمن قائمة اللاعبين الأحرار.");
    if (isFreeAgentUnavailable(playerId)) throw new Error("هذا اللاعب الحر غير متاح حاليًا لأنه مسجل أو عليه طلب قيد.");

    const memberName = currentMember?.name || authProfile?.memberName || "";
    const currentFreeContract = getActiveFreeAgentContractForMember(ownerId);
    const currentFreePlayerId = cleanId(currentFreeContract?.playerId || "");
    const memberFreeStatus = getFreePlayerStatusForMember(ownerId);
    const slotEverUsed = hasEverUsedFreeAgentSlot(firebaseFreeAgentRegistrations, memberFreeStatus, currentFreeContract, ownerId);
    const pendingQueue = getPendingFreeAgentQueueForMember(ownerId);

    if (pendingQueue) {
      throw new Error("لديك طلب لاعب حر بانتظار التنفيذ عند فتح سوق الانتقالات.");
    }

    if (currentFreePlayerId && same(currentFreePlayerId, playerId)) {
      throw new Error("هذا اللاعب الحر مسجل في قائمتك بالفعل.");
    }

    if (slotEverUsed && !currentFreeContract) {
      throw new Error("لا يمكنك تسجيل لاعب حر جديد بعد بيع أو إعارة لاعبك الحر السابق إلا إذا عاد نفس اللاعب الحر إلى قائمتك.");
    }

    const isReplacement = Boolean(currentFreeContract);
    const feeAmount = isReplacement ? FREE_AGENT_REPLACEMENT_FEE : 0;
    const currentRosterCount = getVisiblePlayersForMember(ownerId).length;
    if (!isReplacement && currentRosterCount + 1 > MAX_SQUAD_PLAYERS) {
      throw new Error("لا يمكن تسجيل لاعب حر لأن قائمتك ستتجاوز الحد الأقصى 32 لاعبًا.");
    }

    if (feeAmount > currentMemberAvailableBalance) {
      throw new Error("الرصيد المتاح لا يكفي لرسوم تبديل اللاعب الحر.");
    }

    const todayDateKey = new Date().toISOString().slice(0, 10);
    const basePayload = {
      memberId: ownerId,
      memberName,
      oldPlayerId: currentFreePlayerId || "",
      oldPlayerName: currentFreeContract?.playerName || "",
      oldPlayerImage: currentFreeContract?.playerImage || "",
      newPlayerId: playerId,
      newPlayerName: player.name || "",
      newPlayerImage: player.image || "",
      newPlayerPosition: player.position || "",
      newPlayerRating: player.rating || "",
      cost: feeAmount,
      feeAmount,
      registrationType: isReplacement ? "replacement" : "initial",
      slotEverUsed,
      status: transferMarketOpen ? "processing" : "pending_window",
      date: todayDateKey,
      marketWasOpenAtRequest: transferMarketOpen,
      createdBy: authUser.uid,
      username: authProfile?.username || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!transferMarketOpen) {
      await addDoc(collection(db, "freeAgentQueue"), basePayload);
      await addDoc(collection(db, "notifications"), {
        type: isReplacement ? "free_agent_replacement_queued" : "free_agent_registration_queued",
        status: "unread",
        toMemberId: ownerId,
        fromMemberId: ownerId,
        targetPlayerId: playerId,
        targetStatus: "pending_window",
        navigationDisabled: true,
        title: isReplacement ? "طلب تبديل لاعب حر" : "طلب تسجيل لاعب حر",
        body: isReplacement
          ? "تم حفظ طلب تبديل اللاعب الحر إلى " + (player.name || "") + "، وسيتم تنفيذه عند فتح سوق الانتقالات إذا توفر الرصيد."
          : "تم حفظ طلب تسجيل اللاعب الحر " + (player.name || "") + "، وسيتم تنفيذه عند فتح سوق الانتقالات.",
        createdAt: serverTimestamp(),
      });
      return;
    }

    const queueRef = await addDoc(collection(db, "freeAgentQueue"), basePayload);
    await executeFreeAgentQueueItem({ id: queueRef.id, ...basePayload }, { allowProcessingStatus: true });
  }

  async function executeFreeAgentQueueItem(queueItem, options = {}) {
    const status = clean(queueItem?.status || "pending_window");
    if (!queueItem?.id) return;
    if (!["pending_window", "processing"].includes(status)) return;
    if (status === "processing" && !options.allowProcessingStatus) return;

    const ownerId = cleanId(queueItem.memberId);
    const newPlayerId = cleanId(queueItem.newPlayerId);
    const oldPlayerId = cleanId(queueItem.oldPlayerId);
    if (!ownerId || !newPlayerId) return;

    const member = members.find((item) => same(item.id, ownerId));
    const memberName = queueItem.memberName || member?.name || "";
    const memberStatus = firebaseFreePlayerStatus.find((item) => same(item.memberId || item.id, ownerId));
    const currentFreeContract = getActiveFreeAgentContractForMember(ownerId);
    const queuedReplacement = clean(queueItem.registrationType) === "replacement" || Boolean(oldPlayerId);
    const slotEverUsed = hasEverUsedFreeAgentSlot(firebaseFreeAgentRegistrations, memberStatus, currentFreeContract, ownerId);
    const isReplacement = Boolean(queuedReplacement && currentFreeContract);
    const feeAmount = isReplacement ? FREE_AGENT_REPLACEMENT_FEE : 0;
    const newPlayer = players.find((item) => same(getPlayerStableId(item), newPlayerId)) || {};
    const rosterCount = getVisiblePlayersForMember(ownerId).length;
    if (!isReplacement && rosterCount + 1 > MAX_SQUAD_PLAYERS) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "قائمة العضو ستتجاوز الحد الأقصى 32 لاعبًا.",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (queuedReplacement && (!currentFreeContract || (oldPlayerId && !same(currentFreeContract.playerId, oldPlayerId)))) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "تعذر تنفيذ تبديل اللاعب الحر لأن اللاعب الحر القديم لم يعد نشطًا في القائمة.",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (!queuedReplacement && currentFreeContract) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "لدى العضو لاعب حر نشط بالفعل.",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (slotEverUsed && !currentFreeContract && !queuedReplacement) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "لا يمكن تسجيل لاعب حر جديد بعد بيع أو إعارة اللاعب الحر السابق إلا إذا عاد نفس اللاعب.",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    if (isFreeAgentUnavailable(newPlayerId, queueItem.id)) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "اللاعب الحر لم يعد متاحًا.",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    const memberFinanceRows = getMemberFinanceRows(combinedFinance, ownerId);
    const memberBalance = computeMemberBalance(memberFinanceRows, member?.balance, ownerId);
    if (feeAmount > memberBalance) {
      await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
        status: "failed",
        failureReason: "الرصيد غير كافٍ عند فتح سوق الانتقالات.",
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        type: "free_agent_queue_failed",
        status: "unread",
        toMemberId: ownerId,
        fromMemberId: "system",
        targetPlayerId: newPlayerId,
        targetStatus: "failed",
        navigationDisabled: true,
        title: "فشل طلب اللاعب الحر",
        body: "تعذر تنفيذ طلب اللاعب الحر " + (queueItem.newPlayerName || newPlayer.name || "") + " لأن الرصيد غير كافٍ.",
        createdAt: serverTimestamp(),
      });
      return;
    }

    await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
      status: "processing",
      processingAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (currentFreeContract?.id) {
      await updateDoc(doc(db, "playerContracts", currentFreeContract.id), {
        status: "replaced_free_agent",
        replacedByPlayerId: newPlayerId,
        replacedByQueueId: queueItem.id,
        replacedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const todayDateKey = new Date().toISOString().slice(0, 10);

    if (feeAmount > 0) {
      await addDoc(collection(db, "moneyTransfers"), {
        fromMemberId: ownerId,
        fromMemberName: memberName,
        toMemberId: "system",
        toMemberName: "النظام",
        amount: feeAmount,
        type: "free_agent_replacement_fee",
        direction: "expense",
        status: "approved",
        approvedBy: "system",
        playerId: newPlayerId,
        playerName: queueItem.newPlayerName || newPlayer.name || "",
        relatedQueueId: queueItem.id,
        createdBy: queueItem.createdBy || authUser?.uid || "system",
        username: queueItem.username || "",
        note: "رسوم تبديل اللاعب الحر إلى " + (queueItem.newPlayerName || newPlayer.name || ""),
        date: todayDateKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const availableFreeAgentPoolContract = activePlayerContracts.find((contract) =>
      same(contract.playerId, newPlayerId) && isFreeAgentPoolContract(contract)
    );

    if (availableFreeAgentPoolContract?.id) {
      await updateDoc(doc(db, "playerContracts", availableFreeAgentPoolContract.id), {
        status: "registered_from_free_agents",
        registeredByMemberId: ownerId,
        registeredByQueueId: queueItem.id,
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await addDoc(collection(db, "playerContracts"), {
      status: "active",
      contractType: "owned",
      rosterType: "free",
      isFreeOrigin: true,
      freeAgentOrigin: true,
      freeAgentSlotOwnerMemberId: ownerId,
      playerId: newPlayerId,
      playerName: queueItem.newPlayerName || newPlayer.name || "",
      playerImage: queueItem.newPlayerImage || newPlayer.image || "",
      playerPosition: queueItem.newPlayerPosition || newPlayer.position || "",
      playerRating: queueItem.newPlayerRating || newPlayer.rating || "",
      ownerMemberId: ownerId,
      ownerMemberName: memberName,
      originalOwnerMemberId: ownerId,
      originalOwnerMemberName: memberName,
      currentMemberId: ownerId,
      currentMemberName: memberName,
      previousMemberId: oldPlayerId ? ownerId : "free_agents",
      previousMemberName: oldPlayerId ? memberName : "لاعب حر",
      source: "free_agent_queue",
      sourceQueueId: queueItem.id,
      amount: feeAmount,
      createdBy: queueItem.createdBy || authUser?.uid || "system",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "freeAgentRegistrations"), {
      status: "completed",
      registrationType: isReplacement ? "replacement" : "initial",
      slotEverUsed,
      playerId: newPlayerId,
      playerName: queueItem.newPlayerName || newPlayer.name || "",
      playerImage: queueItem.newPlayerImage || newPlayer.image || "",
      playerPosition: queueItem.newPlayerPosition || newPlayer.position || "",
      playerRating: queueItem.newPlayerRating || newPlayer.rating || "",
      oldPlayerId: oldPlayerId || currentFreeContract?.playerId || "",
      oldPlayerName: queueItem.oldPlayerName || currentFreeContract?.playerName || "",
      memberId: ownerId,
      memberName,
      amount: feeAmount,
      feeAmount,
      relatedQueueId: queueItem.id,
      date: todayDateKey,
      createdBy: queueItem.createdBy || authUser?.uid || "system",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "transferHistory"), {
      status: "completed",
      type: isReplacement ? "free_agent_replacement" : "free_agent",
      typeLabel: isReplacement ? "تبديل لاعب حر" : "تسجيل لاعب حر",
      playerId: newPlayerId,
      playerName: queueItem.newPlayerName || newPlayer.name || "",
      playerImage: queueItem.newPlayerImage || newPlayer.image || "",
      playerPosition: queueItem.newPlayerPosition || newPlayer.position || "",
      playerRating: queueItem.newPlayerRating || newPlayer.rating || "",
      fromMemberId: isReplacement ? ownerId : "free_agents",
      fromMemberName: isReplacement ? (queueItem.oldPlayerName || currentFreeContract?.playerName || "لاعب حر سابق") : "لاعب حر",
      toMemberId: ownerId,
      toMemberName: memberName,
      amount: feeAmount,
      date: todayDateKey,
      periodId: options.marketOpenWindowInfo?.windowId || getTransferWindowIdForDate(firebaseTransferWindows, todayDateKey),
      periodName: options.marketOpenWindowInfo?.windowTitle || getTransferWindowNameForDate(firebaseTransferWindows, todayDateKey),
      seasonId: activeSeasonId,
      relatedQueueId: queueItem.id,
      note: isReplacement
        ? "تبديل لاعب حر برسوم إلزامية 5,000,000"
        : "تسجيل اللاعب الحر الأول بدون رسوم",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "freePlayerStatus", ownerId), {
      memberId: toNumber(ownerId),
      hasUsedFreeSlot: false,
      currentFreePlayerId: newPlayerId,
      currentFreePlayerName: queueItem.newPlayerName || newPlayer.name || "",
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await updateDoc(doc(db, "freeAgentQueue", queueItem.id), {
      status: "completed",
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const rosterNotifications = [
      sendRosterUpdateNotification({
        toMemberId: ownerId,
        fromMemberId: "FIFA",
        playerId: newPlayerId,
        relatedQueueId: queueItem.id,
        targetStatus: isReplacement ? "free_agent_replaced" : "free_agent_registered",
        body: "تحديث على قائمة فريقك: تم تسجيل اللاعب " + (queueItem.newPlayerName || newPlayer.name || "") + " كلاعب حر",
      }),
    ];

    if (isReplacement && (queueItem.oldPlayerName || currentFreeContract?.playerName)) {
      rosterNotifications.unshift(sendRosterUpdateNotification({
        toMemberId: ownerId,
        fromMemberId: "FIFA",
        playerId: oldPlayerId || currentFreeContract?.playerId || "",
        relatedQueueId: queueItem.id,
        targetStatus: "free_agent_removed_after_replacement",
        body: "تحديث على قائمة فريقك: تم إزالة اللاعب " + (queueItem.oldPlayerName || currentFreeContract?.playerName || "") + " من القائمة بعد تبديل اللاعب الحر",
      }));
    }

    await Promise.allSettled(rosterNotifications);
  }

  async function markNotificationRead(notificationId) {
    if (!notificationId) return;
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        status: "read",
        readAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Mark notification read failed:", err);
    }
  }

  async function clearCurrentMemberNotifications() {
    const id = cleanId(currentMemberId);
    if (!id || !currentMemberNotifications.length) return;
    try {
      await Promise.allSettled(
        currentMemberNotifications.map((item) => updateDoc(doc(db, "notifications", item.id), {
          hiddenForMemberIds: arrayUnion(id),
          status: "read",
          readAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }))
      );
    } catch (err) {
      console.error("Clear notifications failed:", err);
      alert("تعذر تنظيف الإشعارات حالياً.");
    }
  }

  function openNotificationTarget(notification) {
    if (!notification) return;
    markNotificationRead(notification.id);
    setNotificationsOpen(false);

    const competitionId = cleanId(
      notification.relatedCompetitionId ||
        notification.competitionId ||
        notification.targetCompetitionId
    );
    if (competitionId) {
      setFocusedCompetitionId(competitionId);
      setPage("season");
      setSelectedId("");
      setMemberTab("players");
      setDetailView(null);
      setDetailStack([]);
      requestAnimationFrame(() => scrollAppToTop("auto"));
      return;
    }

  }

  function handleTopBack() {
    if (detailView) {
      closeView();
      return;
    }
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (infoModal) {
      setInfoModal(null);
      return;
    }
    if (selectedId) {
      closePublicMemberProfile();
      return;
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setAuthUser(null);
    setAuthProfile(null);
    setPage("home");
    setSelectedId("");
    setDetailView(null);
    setMenuOpen(false);
    setInfoModal(null);
  }

  function getTopBarTitle({ page, config, selectedMember, detailView, infoModal, menuOpen }) {
    if (infoModal) return infoModal.title || "معلومات";
    if (detailView) return detailView.title || "تفاصيل";
    if (selectedMember) return selectedMember.name || "عضو";
    const titles = {
      home: config?.mainTitle || "FIFA GROUP",
      members: config?.membersTitle || "الأعضاء",
      season: config?.seasonTitle || "الموسم",
      league: "تفاصيل البطولة",
      archive: config?.archiveTitle || "الأرشيف",
      ranking: config?.rankingTitle || "التصنيف",
      stats: config?.statsTitle || "الإحصائيات",
      transfers: config?.transfersTitle || "الانتقالات",
      links: config?.linksTitle || "روابط هامة",
      myProfile: "ملفي",
      seasonCenter: "مركز الموسم",
      studio: "FIFA STUDIO",
      fifaAdmin: "FIFA ADMIN",
      leagueAdmin: "إدارة البطولة",
    };
    return titles[page] || config?.mainTitle || "FIFA GROUP";
  }

  if (loading || authLoading) return null;
  if (error || !members.length) return <SystemScreen title={config.errorTitle} subtitle={error || "تعذر تحميل البيانات"} />;
  if (config.appStatus !== "active") return <SystemScreen title="الصيانة" subtitle={config.maintenanceMessage} />;
  if (!authUser) return <Suspense fallback={<SystemScreen title="" subtitle="" loading />}><LoginPageLazy members={members} appTitle={config.mainTitle} seasonTitle={config.seasonTitle} logoUrl={config.appIcon} authCss={authCss} /></Suspense>;

  return (
    <div className="app iosSafeApp" dir="rtl">
      <style>{css}</style>
      <style>{moneyCss}</style>
      <style>{dealCss}</style>
      <style>{leagueAdminCss}</style>
      <style>{finalMinorSafeCss}</style>
      <style>{v3OverrideCss}</style>
      <div className="bgOrb bgOrbOne" />
      <div className="bgOrb bgOrbTwo" />
      {config.announcement ? <div className="announcementBar glassSoft">{config.announcement}</div> : null}
      <Suspense fallback={<SystemScreen title="" subtitle="" loading />}>
        <ErrorBoundary onRetry={() => setPage("home")}>
        {detailView ? (
          <DetailPageLazy config={config} view={detailView} members={members} players={players} finance={finance} trophyMap={trophyMap} playerContracts={firebasePlayerContracts} freeAgentRegistrations={firebaseFreeAgentRegistrations} freePlayerStatus={firebaseFreePlayerStatus} freeAgentQueue={firebaseFreeAgentQueue} currentMemberId={currentMemberId} currentMember={currentMember} currentAvailableBalance={currentMemberAvailableBalance} currentMemberPlayers={currentMemberPlayers} playerOffers={firebasePlayerOffers} isMarketOpen={transferMarketOpen} onBack={closeView} onOpenView={openView} onInfo={(data) => setInfoModal(data)} onCreatePlayerOffer={createPlayerOffer} onUpdatePlayerOffer={updatePlayerOffer} onCancelPlayerOffer={cancelPlayerOffer} onAcceptOffer={acceptPlayerOffer} onRejectOffer={rejectPlayerOffer} onReleasePlayer={releasePlayerFromSquad} onTerminateLoan={terminateLoanContract} onRegisterFreeAgentFee={registerFreeAgentFee} />
        ) : (
          <>
            {page === "home" ? <HomePageLazy config={config} rankedMembers={rankedMembers} members={members} currentMemberId={currentMemberId} seasons={seasons} competitions={firebaseCompetitions} allTournaments={allTournaments} trophyMap={trophyMap} statsMap={finalStatsByMember} financeRows={finance} transferHistory={firebaseTransferHistory} goPage={goPage} setFocusedCompetitionId={setFocusedCompetitionId} openPublicMemberProfile={openPublicMemberProfile} openView={openView} totalForMember={totalForMember} /> : null}
            {page === "members" ? <MembersPageLazy config={config} rankedMembers={rankedMembers} members={members} selectedMember={members.find(m => same(m.id, selectedId))} selectedMemberId={selectedId} totalForMember={totalForMember} setSelectedId={setSelectedId} memberTab={memberTab} setMemberTab={setMemberTab} players={players} trophies={trophiesMaster} finance={finance} financeBalance={selectedMemberBalance} currentMemberId={currentMemberId} isFifaAdmin={isFifaAdmin} currentMemberBalance={currentMemberBalance} currentMemberAvailableBalance={currentMemberAvailableBalance} currentMemberPlayers={currentMemberPlayers} playerContracts={firebasePlayerContracts} playerOffers={firebasePlayerOffers} freeAgentRegistrations={firebaseFreeAgentRegistrations} freePlayerStatus={firebaseFreePlayerStatus} freeAgentQueue={firebaseFreeAgentQueue} memberRestrictions={firebaseMemberRestrictions} currentMemberRestrictions={activeCurrentMemberRestrictions} transferHistory={firebaseTransferHistory} allPlayerOffers={firebasePlayerOffers} notifications={firebaseNotifications} pushStatus={pushStatus} pushBusy={pushBusy} onEnablePushNotifications={handleEnablePushNotifications} onDisablePushNotifications={handleDisablePushNotifications} onOpenNotification={openNotificationTarget} onClearNotifications={clearCurrentMemberNotifications} onCreateMoneyTransfer={createMoneyTransfer} onCreatePlayerOffer={createPlayerOffer} onUpdatePlayerOffer={updatePlayerOffer} onCancelPlayerOffer={cancelPlayerOffer} onAcceptOffer={acceptPlayerOffer} onRejectOffer={rejectPlayerOffer} onReleasePlayer={releasePlayerFromSquad} onTerminateLoan={terminateLoanContract} onRegisterFreeAgentFee={registerFreeAgentFee} isMarketOpen={transferMarketOpen} onOpenView={openView} onInfo={(data) => setInfoModal(data)} transferPeriods={transferPeriods} activePeriodId={transferPeriod} setTransferPeriod={setTransferPeriod} openPublicMemberProfile={openPublicMemberProfile} goPage={goPage} /> : null}
            {page === "myProfile" ? <MyProfilePageLazy config={config} members={members} players={players} finance={finance} trophyMap={trophyMap} playerContracts={firebasePlayerContracts} playerOffers={firebasePlayerOffers} freeAgentRegistrations={firebaseFreeAgentRegistrations} freePlayerStatus={firebaseFreePlayerStatus} freeAgentQueue={firebaseFreeAgentQueue} memberRestrictions={firebaseMemberRestrictions} currentMemberRestrictions={activeCurrentMemberRestrictions} transferHistory={firebaseTransferHistory} competitions={firebaseCompetitions} allTournaments={allTournaments} statsMap={finalStatsByMember} currentMemberId={currentMemberId} currentMember={currentMember} currentMemberBalance={currentMemberBalance} currentMemberAvailableBalance={currentMemberAvailableBalance} currentMemberPlayers={currentMemberPlayers} isFifaAdmin={isFifaAdmin} isMarketOpen={transferMarketOpen} onOpenView={openView} onInfo={(data) => setInfoModal(data)} onCreatePlayerOffer={createPlayerOffer} onUpdatePlayerOffer={updatePlayerOffer} onCancelPlayerOffer={cancelPlayerOffer} onAcceptOffer={acceptPlayerOffer} onRejectOffer={rejectPlayerOffer} onReleasePlayer={releasePlayerFromSquad} onTerminateLoan={terminateLoanContract} onRegisterFreeAgentFee={registerFreeAgentFee} goPage={goPage} pushStatus={pushStatus} pushBusy={pushBusy} onEnablePushNotifications={handleEnablePushNotifications} onDisablePushNotifications={handleDisablePushNotifications} onOpenNotification={openNotificationTarget} onClearNotifications={clearCurrentMemberNotifications} notifications={firebaseNotifications} /> : null}
            {page === "seasonCenter" ? <SeasonCenterPageLazy config={config} members={members} players={players} finance={finance} trophyMap={trophyMap} competitions={firebaseCompetitions} allTournaments={allTournaments} statsMap={finalStatsByMember} playerContracts={firebasePlayerContracts} transferHistory={firebaseTransferHistory} currentMemberId={currentMemberId} currentMember={currentMember} goPage={goPage} openView={openView} /> : null}
            {page === "studio" ? <FifaStudioPageLazy config={config} members={members} competitions={firebaseCompetitions} allTournaments={allTournaments} transferHistory={firebaseTransferHistory} trophyMap={trophyMap} currentMember={currentMember} currentMemberId={currentMemberId} players={players} financeRows={finance} playerContracts={firebasePlayerContracts} statsMap={finalStatsByMember} rankedMembers={rankedMembers} /> : null}
            {page === "season" ? <SeasonHubPageLazy config={config} activeSeason={activeSeasonRows} groups={seasonGroups} total={allTournaments.length} members={members} competitions={firebaseCompetitions} financeRows={finance} trophyMap={trophyMap} currentMemberId={currentMemberId} focusedCompetitionId={focusedCompetitionId} rankingRows={seasonRanking} activeTab={seasonHubTab} onTabChange={setSeasonHubTab} onOpenView={openView} onOpenMember={openPublicMemberProfile} /> : null}
            {page === "league" ? <LeagueViewerPageLazy competitions={firebaseCompetitions} currentMemberId={currentMemberId} focusedCompetitionId={focusedCompetitionId} config={config} trophyMap={trophyMap} /> : null}
            {page === "archive" ? <ArchivePageLazy config={config} allTournaments={allTournaments} trophyMap={trophyMap} seasons={seasons} members={members} statsMap={finalStatsByMember} defaultMode={archiveDefaultMode} setDefaultMode={setArchiveDefaultMode} onOpenView={openView} /> : null}
            {page === "ranking" ? <RankingPageLazy config={config} rows={seasonRanking} onOpenView={openView} /> : null}
            {page === "stats" ? <GeneralStatsPageLazy config={config} statsMap={finalStatsByMember} members={members} allTournaments={allTournaments} trophyMap={trophyMap} seasons={seasons} onOpenView={openView} /> : null}
            {page === "transfers" ? <TransfersPageLazy config={config} periods={transferPeriods} activePeriodId={transferPeriod} setTransferPeriod={setTransferPeriod} rows={currentTransfers} players={players} members={members} currentMember={currentMember} currentMemberId={currentMemberId} playerContracts={firebasePlayerContracts} freeAgentQueue={firebaseFreeAgentQueue} onOpenView={openView} /> : null}
            {page === "links" ? <LinksPageLazy config={config} links={importantLinks} /> : null}
            {page === "fifaAdmin" ? <FifaAdminPageLazy members={members} notifications={firebaseNotifications} moneyTransfers={firebaseMoneyTransfers} financeRows={finance} memberRestrictions={firebaseMemberRestrictions} adminDecisions={firebaseAdminDecisions} adminNotes={firebaseAdminNotes} pushTokens={firebasePushTokens} transferWindows={firebaseTransferWindows} playerOffers={firebasePlayerOffers} playerContracts={firebasePlayerContracts} transferHistory={firebaseTransferHistory} playerReleases={firebasePlayerReleases} isMarketOpen={transferMarketOpen} onSendNotification={createFifaAdminNotification} onCreateReward={createFifaAdminReward} onCreateDiscipline={createFifaAdminDiscipline} onCorrectMoneyTransfer={createFifaAdminMoneyCorrection} onCancelRestriction={cancelFifaAdminRestriction} onCreateAdminNote={createFifaAdminNote} onMarketControl={createFifaAdminMarketControl} /> : null}
            {page === "leagueAdmin" ? <FifaLeagueAdminPageLazy members={members} seasons={seasons} activeSeasonId={config.activeSeasonId} competitions={firebaseCompetitions} trophyMap={trophyMap} config={config} onCreateLeague={createFifaLeagueCompetition} onUpdateMatchResult={updateFifaLeagueMatchResult} onClearMatchResult={clearFifaLeagueMatchResult} onFinalizeLeague={finalizeFifaLeagueCompetition} onCancelCompetition={cancelFifaCompetition} onApplyAbsenceAction={applyFifaCompetitionAbsenceAction} onUpdateCompetitionNote={updateFifaCompetitionAdminNote} /> : null}
          </>
        )}
        </ErrorBoundary>
      </Suspense>
      <TopSystemBar title={getTopBarTitle({ page, config, selectedMember: members.find(m => same(m.id, selectedId)), detailView, infoModal, menuOpen })} scrolled={topBarScrolled} unreadCount={unreadNotificationsCount} onNotificationsClick={() => setNotificationsOpen(true)} authProfile={authProfile} canGoBack={!!(detailView || menuOpen || infoModal || selectedId)} onBack={handleTopBack} />
      <BottomNav page={page} goPage={goPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} config={config} />
      <SideMenu open={menuOpen} setOpen={setMenuOpen} goPage={goPage} config={config} isFifaAdmin={isFifaAdmin} onLogout={handleLogout} />
      {infoModal ? <InfoModal data={infoModal} onClose={() => setInfoModal(null)} /> : null}
      {notificationsOpen ? <NotificationsModal rows={firebaseNotifications} members={members} currentMemberId={currentMemberId} pushStatus={pushStatus} pushBusy={pushBusy} onEnablePushNotifications={handleEnablePushNotifications} onDisablePushNotifications={handleDisablePushNotifications} onClose={() => setNotificationsOpen(false)} onOpenNotification={openNotificationTarget} onClearNotifications={clearCurrentMemberNotifications} /> : null}
      {authProfile ? <AuthMiniBadge profile={authProfile} onLogout={handleLogout} /> : null}
    </div>
  );

}
// authCss imported from ./styles/auth.css

