const OPS_DICT = [
  ["nav.home", "Accueil", "Home"],
  ["nav.health", "Sant\xE9", "Health"],
  ["nav.deploy", "D\xE9ploiements", "Deployments"],
  ["nav.users", "Utilisateurs", "Users"],
  ["hdr.updated", "Mis \xE0 jour il y a 2 min", "Updated 2 min ago"],
  ["hdr.refresh", "Actualiser", "Refresh"],
  ["hdr.prefs", "Pr\xE9f\xE9rences", "Preferences"],
  ["hdr.theme", "Changer de th\xE8me", "Switch theme"],
  ["st.ok", "Op\xE9rationnel", "Operational"],
  ["st.warn", "D\xE9grad\xE9", "Degraded"],
  ["st.bad", "En panne", "Down"],
  ["st.unk", "Inconnu", "Unknown"],
  ["ban.ok", "Tout fonctionne", "Everything works"],
  ["ban.warn", "D\xE9grad\xE9", "Degraded"],
  ["ban.bad", "Probl\xE8me d\xE9tect\xE9", "Problem detected"],
  ["ban.unk", "Statut inconnu", "Status unknown"],
  ["ban.load", "Chargement\u2026", "Loading\u2026"],
  ["ban.okSub", "Aucun point \xE0 surveiller.", "Nothing needs your attention."],
  ["ban.unkSub", "Une source est injoignable. Aucun probl\xE8me n\u2019est confirm\xE9.", "A source is unreachable. No problem is confirmed."],
  ["watch.title", "\xC0 surveiller", "Needs attention"],
  ["watch.see", "Voir le d\xE9tail", "See details"],
  ["tile.services", "Services", "Services"],
  ["tile.crons", "Crons et sauvegardes", "Crons and backups"],
  ["tile.server", "Serveur", "Server"],
  ["tile.versions", "Versions", "Versions"],
  ["tile.servicesOk", "2 sur 2 en ligne", "2 of 2 online"],
  ["tile.servicesBad", "API injoignable", "API unreachable"],
  ["tile.cronsOk", "3 sur 3 \xE0 l\u2019heure", "3 of 3 on time"],
  ["tile.cronsBad", "Sauvegarde en retard", "Backup is late"],
  ["tile.serverOk", "Disque 56 % \xB7 swap 48 %", "Disk 56% \xB7 swap 48%"],
  ["tile.serverWarn", "Disque 87 % (seuil 85 %)", "Disk 87% (limit 85%)"],
  ["tile.versionsOk", "Prod \xE0 jour", "Prod up to date"],
  ["tile.versionsWarn", "Backend en retard de 2 commits", "Backend 2 commits behind"],
  ["tile.unk", "Source indisponible", "Source unavailable"],
  ["users.title", "Utilisateurs", "Users"],
  ["users.total", "utilisateurs", "users"],
  ["users.week", "+23 sur 7 jours", "+23 over 7 days"],
  ["users.anon", "anonymes", "anonymous"],
  ["users.perm", "permanents", "permanent"],
  ["chart.users", "Utilisateurs", "Users"],
  ["chart.usage", "Usage (checks par jour)", "Usage (checks per day)"],
  ["chart.d30", "30 jours", "30 days"],
  ["chart.d90", "90 jours", "90 days"],
  ["chart.note", "Les comptes supprim\xE9s ou purg\xE9s disparaissent de l\u2019historique.", "Deleted or purged accounts disappear from the history."],
  ["chart.empty", "Pas encore assez de donn\xE9es pour tracer une courbe.", "Not enough data yet to draw a chart."],
  ["chart.sumUsers", "Courbe des utilisateurs : de {a} \xE0 {b} sur {n} jours.", "Users chart: from {a} to {b} over {n} days."],
  ["chart.sumUsage", "Courbe d\u2019usage : de {a} \xE0 {b} checks par jour sur {n} jours.", "Usage chart: from {a} to {b} checks per day over {n} days."],
  ["ver.title", "Versions en prod", "Production versions"],
  ["ver.backend", "Backend", "Backend"],
  ["ver.ops", "Ops (site)", "Ops (site)"],
  ["ver.mobile", "App mobile", "Mobile app"],
  ["ver.upToDate", "\xC0 jour", "Up to date"],
  ["ver.behind", "En retard de 2 commits", "2 commits behind"],
  ["ver.store", "App Store", "App Store"],
  ["ver.waitStore", "1.0.1 dans main, en attente de l\u2019App Store", "1.0.1 in main, waiting for the App Store"],
  ["ver.sha", "SHA", "SHA"],
  ["ver.tag", "Tag", "Tag"],
  ["ver.version", "Version", "Version"],
  ["ver.built", "Build", "Build"],
  ["ver.vs", "Compar\xE9 \xE0", "Compared with"],
  ["ver.releaseHint", "Une prod diff\xE9rente de main n\u2019est pas forc\xE9ment une erreur : une release peut \xEAtre en cours.", "A prod that differs from main is not necessarily an error: a release may be in progress."],
  ["ver.mobileHint", "L\u2019app mobile n\u2019a pas de serveur : seule la version publi\xE9e est lue (API publique de l\u2019App Store). Le num\xE9ro de build n\u2019est pas disponible.", "The mobile app has no server: only the published version is read (public App Store API). The build number is not available."],
  ["health.services", "Services", "Services"],
  ["health.crons", "Crons et sauvegardes", "Crons and backups"],
  ["health.server", "Serveur", "Server"],
  ["health.shared", "Serveur partag\xE9 avec d\u2019autres projets", "Server shared with other projects"],
  ["health.api", "API", "API"],
  ["health.site", "Site ops", "Ops site"],
  ["health.up24", "24 h", "24 h"],
  ["health.up30", "30 j", "30 d"],
  ["health.lastInc", "Dernier incident", "Last incident"],
  ["health.noInc", "Aucun incident sur 30 jours", "No incident in 30 days"],
  ["health.incOk", "12 nov., 4 min", "Nov 12, 4 min"],
  ["health.incBad", "En cours depuis 14:02", "Ongoing since 14:02"],
  ["health.last", "Dernier passage", "Last run"],
  ["health.next", "Prochain", "Next"],
  ["health.late", "En retard de 3 h 12", "3 h 12 late"],
  ["health.onTime", "\xC0 l\u2019heure", "On time"],
  ["job.purge", "Purge des comptes anonymes", "Anonymous accounts purge"],
  ["job.favs", "Alertes favoris", "Favorites alerts"],
  ["job.backup", "Sauvegarde des bases", "Database backup"],
  ["job.offsite", "Copie hors site (OVH, chiffr\xE9e)", "Off-site copy (OVH, encrypted)"],
  ["gauge.cpu", "Processeur", "CPU"],
  ["gauge.ram", "M\xE9moire disponible", "Available memory"],
  ["gauge.disk", "Disque", "Disk"],
  ["gauge.swap", "Swap", "Swap"],
  ["gauge.limit", "Seuil", "Limit"],
  ["gauge.limitRam", "Alerte sous 10 %", "Alert below 10%"],
  ["link.betterstack", "Ouvrir BetterStack", "Open BetterStack"],
  ["link.soon", "bient\xF4t", "soon"],
  ["kpi.active30", "Actifs sur 30 jours", "Active over 30 days"],
  ["kpi.anonPerm", "Anonymes \xB7 permanents", "Anonymous \xB7 permanent"],
  ["kpi.subs", "Abonnements actifs", "Active subscriptions"],
  ["kpi.trial", "Essais en cours", "Trials running"],
  ["kpi.checks", "Checks aujourd\u2019hui", "Checks today"],
  ["kpi.avg7", "Moyenne 7 jours", "7-day average"],
  ["kpi.vs7", "vs 7 j", "vs 7 d"],
  ["kpi.privacy", "Chiffres agr\xE9g\xE9s : aucun email ni identifiant n\u2019est affich\xE9.", "Aggregated figures: no email or identifier is shown."],
  ["err.source", "Source indisponible", "Source unavailable"],
  ["err.retry", "R\xE9essayer", "Retry"],
  ["err.last", "Derni\xE8re donn\xE9e connue il y a 18 min", "Last known data 18 min ago"],
  ["err.backend", "Impossible de joindre le backend", "Cannot reach the backend"],
  ["err.backendSub", "La page ne peut pas afficher l\u2019\xE9tat. V\xE9rifiez BetterStack, qui reste la source d\u2019alerte.", "The page cannot show the status. Check BetterStack, which remains the alerting source."],
  ["v1.badge", "v1 \xB7 aper\xE7u", "v1 \xB7 preview"],
  ["v1.title", "Offrir Premium", "Grant Premium"],
  ["v1.search", "Adresse email", "Email address"],
  ["v1.find", "Rechercher", "Search"],
  ["v1.result", "Compte trouv\xE9", "Account found"],
  ["v1.plan", "Abonnement actuel", "Current plan"],
  ["v1.free", "Gratuit", "Free"],
  ["v1.grant", "Offrir Premium", "Grant Premium"],
  ["v1.confirm", "Offrir Premium jusqu\u2019au 16 f\xE9vrier 2027 \xE0 ce compte ?", "Grant Premium until February 16, 2027 to this account?"],
  ["v1.confirmSub", "Cette action est enregistr\xE9e dans le journal d\u2019audit.", "This action is recorded in the audit log."],
  ["v1.cancel", "Annuler", "Cancel"],
  ["v1.searching", "Recherche\u2026", "Searching\u2026"],
  ["v1.audit", "Journal d\u2019audit", "Audit log"],
  ["v1.auditEmpty", "Aucune action pour le moment.", "No action yet."],
  ["v1.noList", "Aucune liste d\u2019utilisateurs : la recherche se fait par adresse exacte.", "No user list: search by exact address only."],
  ["login.title", "Connexion", "Sign in"],
  ["login.sub", "Console d\u2019administration Cloudbreak.", "Cloudbreak admin console."],
  ["login.email", "Email", "Email"],
  ["login.pwd", "Mot de passe", "Password"],
  ["login.cta", "Se connecter", "Sign in"],
  ["login.busy", "Connexion\u2026", "Signing in\u2026"],
  ["login.invalid", "Email ou mot de passe incorrect", "Incorrect email or password"],
  ["login.unreachable", "Connexion impossible pour le moment. R\xE9essayez dans un instant.", "Sign-in is unavailable right now. Try again in a moment."],
  ["login.expired", "Votre session a expir\xE9. Reconnectez-vous.", "Your session has expired. Sign in again."],
  ["denied.title", "Acc\xE8s refus\xE9", "Access denied"],
  ["denied.sub", "Ce compte n\u2019a pas acc\xE8s \xE0 cette page.", "This account cannot access this page."],
  ["denied.out", "Se d\xE9connecter", "Sign out"],
  ["empty.title", "Pas encore de donn\xE9es", "No data yet"],
  ["empty.sub", "Les chiffres appara\xEEtront apr\xE8s les premiers usages.", "Figures will appear after the first usage."]
];
const OPS_T = { fr: {}, en: {} };
OPS_DICT.forEach(([k, fr, en]) => {
  OPS_T.fr[k] = fr;
  OPS_T.en[k] = en;
});
function opsAdd(rows) {
  rows.forEach(([k, fr, en]) => {
    OPS_T.fr[k] = fr;
    OPS_T.en[k] = en;
    OPS_DICT.push([k, fr, en]);
  });
}
const OPS_MISS = /* @__PURE__ */ new Set();
function opsT(lang) {
  return (k) => {
    const v = (OPS_T[lang] || OPS_T.fr)[k];
    if (v == null) OPS_MISS.add(k);
    return v || k;
  };
}
opsAdd([
  ["hdr.signout", "Se d\xE9connecter", "Sign out"],
  ["prefs.theme", "Th\xE8me", "Theme"],
  ["prefs.light", "Clair", "Light"],
  ["prefs.dark", "Sombre", "Dark"],
  ["prefs.lang", "Langue", "Language"],
  ["stamp.ago", "il y a 2 min", "2 min ago"],
  ["ver.unkBackend", "Version inconnue : backend injoignable", "Version unknown: backend unreachable"],
  ["tile.versionsUnk", "Backend : version inconnue", "Backend: version unknown"],
  ["tile.cronsUnk", "Backend injoignable", "Backend unreachable"],
  ["ban.nSub", "points \xE0 surveiller.", "points need attention."],
  ["ban.oneSub", "1 point \xE0 surveiller.", "1 point needs attention."],
  ["trend.24h", "24 h", "24 h"],
  ["trend.14d", "14 jours", "14 days"],
  ["hdr.lang", "Changer de langue", "Switch language"],
  ["hdr.close", "Fermer", "Close"],
  ["hdr.nav", "Navigation", "Navigation"],
  ["legal.cgu", "CGU", "Terms"],
  ["legal.privacy", "Confidentialit\xE9", "Privacy"],
  ["legal.nav", "Pages l\xE9gales", "Legal pages"],
  ["toast.login", "Connexion r\xE9ussie", "Signed in"],
  ["toast.signout", "Vous \xEAtes d\xE9connect\xE9", "You are signed out"],
  ["toast.refreshed", "Donn\xE9es mises \xE0 jour", "Data updated"],
  ["toast.retryFail", "Source toujours injoignable", "Source still unreachable"],
  ["toast.external", "Ouvre {name} dans un nouvel onglet", "Opens {name} in a new tab"],
  ["toast.success", "Succ\xE8s", "Success"],
  ["toast.error", "Erreur", "Error"],
  ["toast.info", "Information", "Information"],
  ["state.errorTitle", "Ce bloc n\u2019a pas pu s\u2019afficher", "This block could not be displayed"],
  ["state.loading", "Chargement\u2026", "Loading\u2026"],
  ["err.crashTitle", "Une erreur est survenue", "Something went wrong"],
  ["err.crashSub", "La console n\u2019a pas pu afficher cette page.", "The console could not display this page."],
  ["err.nfTitle", "Page introuvable", "Page not found"],
  ["err.nfSub", "Cette page n\u2019existe pas ou a \xE9t\xE9 d\xE9plac\xE9e.", "This page does not exist or has been moved."],
  ["err.heading", "Erreur", "Error"],
  ["err.home", "Retour \xE0 l\u2019accueil", "Back to home"],
  ["off.banner", "Hors connexion. Les donn\xE9es affich\xE9es datent de il y a 18 min.", "Offline. The data shown is 18 min old."],
  ["tools.title", "Outils", "Tools"],
  ["chart.series", "S\xE9rie", "Series"],
  ["chart.period", "P\xE9riode", "Period"],
  ["tool.betterstack", "Disponibilit\xE9 et alertes", "Uptime and alerts"],
  ["tool.sentry", "Erreurs et crashs", "Errors and crashes"],
  ["tool.posthog", "Usage et parcours", "Usage and journeys"],
  ["tool.supabase", "Comptes et authentification", "Accounts and authentication"],
  ["tool.ovh", "Serveur, copie hors site et facturation", "Server, off-site copy and billing"],
  ["tool.brevo", "Emails d\u2019authentification", "Authentication emails"]
]);
const OPS_NOOP = () => {
};
const OPS_CTX_DEFAULT = {
  go: OPS_NOOP,
  toast: OPS_NOOP,
  openExternal: OPS_NOOP,
  refresh: OPS_NOOP,
  signOut: OPS_NOOP,
  signIn: OPS_NOOP,
  setLang: OPS_NOOP,
  setDark: OPS_NOOP,
  openPrefs: OPS_NOOP,
  closePrefs: OPS_NOOP,
  retry: OPS_NOOP,
  dismiss: OPS_NOOP,
  prefsOpen: false,
  toasts: [],
  busy: false,
  offline: false
};
const OpsCtx = React.createContext(OPS_CTX_DEFAULT);
function useOps() {
  return React.useContext(OpsCtx);
}
function opsVars(dark) {
  return dark ? { "--ops-ok": "#6FCF73", "--ops-warn": "#FFB74D", "--ops-bad": "#FF8A80", "--ops-unk": "#A0A0A0" } : { "--ops-ok": "#2A6F2E", "--ops-warn": "#9A5200", "--ops-bad": "#B03225", "--ops-unk": "#5E5E5E" };
}
function opsFmt(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] != null ? vars[k] : "");
}
const OPS_ST = {
  ok: { glyph: "check", fill: "var(--cb-high)", soft: "var(--cb-high-soft)", ink: "var(--ops-ok)" },
  warn: { glyph: "alert", fill: "var(--cb-medium)", soft: "var(--cb-medium-soft)", ink: "var(--ops-warn)" },
  bad: { glyph: "xcircle", fill: "var(--cb-low)", soft: "var(--cb-low-soft)", ink: "var(--ops-bad)" },
  unk: { glyph: "help", fill: "var(--cb-none)", soft: "var(--cb-none-soft)", ink: "var(--ops-unk)" }
};
function opsWorst(list) {
  if (list.includes("bad")) return "bad";
  if (list.includes("warn")) return "warn";
  if (list.includes("unk")) return "unk";
  return "ok";
}
function opsMock(scn) {
  const m = {
    services: "ok",
    crons: "ok",
    server: "ok",
    versions: "ok",
    disk: 56,
    ram: 46,
    swap: 48,
    cpu: 14,
    loading: false,
    empty: false,
    users: 184
  };
  if (scn === "warn") {
    m.server = "warn";
    m.versions = "warn";
    m.disk = 87;
    m.swap = 78;
  }
  if (scn === "bad") {
    m.services = "bad";
    m.crons = "unk";
    m.versions = "unk";
    m.server = "warn";
    m.disk = 87;
    m.apiDown = true;
  }
  if (scn === "cron") {
    m.crons = "bad";
  }
  if (scn === "unk") {
    m.services = "unk";
    m.server = "unk";
  }
  if (scn === "load") {
    m.loading = true;
  }
  if (scn === "partial") {
    m.partial = true;
  }
  if (scn === "store") {
    m.storeDown = true;
  }
  if (scn === "empty") {
    m.empty = true;
    m.users = 3;
  }
  m.pend = { services: m.loading, server: m.loading, crons: m.loading || !!m.partial, versions: m.loading || !!m.partial, users: m.loading || !!m.partial };
  m.global = m.loading || m.partial ? "load" : opsWorst([m.services, m.crons, m.server, m.versions]);
  return m;
}
function opsSeries(kind, days) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const p = i / (days - 1);
    if (kind === "users") out.push(Math.round(days === 30 ? 118 + 66 * p + 3 * Math.sin(i) : 24 + 160 * Math.pow(p, 1.7)));
    else out.push(Math.round(60 + 150 * p + 28 * Math.sin(i * 1.3) + (i % 7 === 5 ? 22 : 0)));
  }
  return out;
}
function opsTrend(base, n, amp) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(Math.max(0, base - amp + amp * (i / (n - 1)) + amp * 0.45 * Math.sin(i * 1.1)));
  return out;
}
function OpsGlyph({ name, size = 18, color = "currentColor", sw = 1.7 }) {
  const p = { fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" };
  const g = {
    check: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "m8 12.5 3 3 5-6" })),
    alert: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 4 3 20h18z" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 10v4M12 17.4v.1" })),
    xcircle: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "m9 9 6 6M15 9l-6 6" })),
    help: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1 1-1.1 1.7M12 17v.1" })),
    refresh: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M20 11a8 8 0 1 0-2.3 5.7" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M20 5v6h-6" })),
    external: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M14 4h6v6M20 4l-9 9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" })),
    deploy: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 20V8M7 12l5-5 5 5M5 4h14" })),
    clock: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 7v5l3 2" })),
    info: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 11v5M12 8v.1" })),
    pulse: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M3 12h4l2-6 4 12 2-6h6" })),
    server: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { ...p, x: "4", y: "4", width: "16", height: "6", rx: "2" }), /* @__PURE__ */ React.createElement("rect", { ...p, x: "4", y: "14", width: "16", height: "6", rx: "2" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M8 7v.1M8 17v.1" })),
    health: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M3 12h4l2-6 4 12 2-6h6" })),
    chevron: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "m9 6 6 6-6 6" })),
    gear: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" })),
    sun: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" })),
    moon: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" })),
    home: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" })),
    user: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "8", r: "4" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M4 20c0-4 4-6 8-6s8 2 8 6" })),
    lock: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { ...p, x: "5", y: "11", width: "14", height: "9", rx: "2" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M8 11V8a4 4 0 0 1 8 0v3" })),
    mountain: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M3 19 9.5 7l3.5 6 2-3 6 9z" })),
    logout: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "M15 8l4 4-4 4M19 12H9" })),
    offline: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "m5.6 5.6 12.8 12.8" })),
    close: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { ...p, d: "m6 6 12 12M18 6 6 18" })),
    search: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { ...p, cx: "11", cy: "11", r: "6" }), /* @__PURE__ */ React.createElement("path", { ...p, d: "m20 20-3.5-3.5" }))
  };
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", width: size, height: size, style: { display: "block", flexShrink: 0 }, "aria-hidden": "true" }, g[name]);
}
function OpsCard({ children, style, as, busy }) {
  const Tag = as || "section";
  return /* @__PURE__ */ React.createElement(Tag, { "aria-busy": busy ? "true" : void 0, style: { background: "var(--cb-surf)", border: "1px solid var(--cb-bord)", borderRadius: 18, padding: 18, boxSizing: "border-box", ...style } }, children, busy && /* @__PURE__ */ React.createElement("span", { className: "ops-sr" }, busy));
}
function OpsEyebrow({ children, style }) {
  return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: "uppercase", color: "var(--cb-txt2)", ...style } }, children);
}
function OpsPill({ s, label, size = 12 }) {
  const c = OPS_ST[s];
  return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px", borderRadius: 999, background: c.soft, color: c.ink, fontSize: size, fontWeight: 600, whiteSpace: "nowrap" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: c.glyph, size: size + 3, color: c.ink, sw: 2 }), label);
}
function OpsLink({ children, soon, style, ext, to }) {
  const o = useOps();
  const inner = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: soon ? "var(--cb-txt2)" : "var(--cb-txt1)", borderBottom: soon ? "1px dashed var(--cb-bord)" : "1px solid var(--cb-acc1)", paddingBottom: 1 };
  const hit = { display: "inline-flex", alignItems: "center", padding: "12px 0", margin: "-12px 0", textDecoration: "none", color: "inherit", ...style };
  const body = /* @__PURE__ */ React.createElement("span", { style: inner }, children, !soon && !to && /* @__PURE__ */ React.createElement(OpsGlyph, { name: "external", size: 13 }));
  if (soon) return /* @__PURE__ */ React.createElement("span", { role: "link", "aria-disabled": "true", style: hit }, body);
  const href = to ? "#/" + to : "#";
  return /* @__PURE__ */ React.createElement("a", { href, onClick: (e) => {
    e.preventDefault();
    if (to) o.go(to);
    else o.openExternal(ext);
  }, style: hit }, body);
}
function OpsRouteLink({ to, children, style, current }) {
  const o = useOps();
  return /* @__PURE__ */ React.createElement("a", { href: "#/" + to, "aria-current": current ? "page" : void 0, onClick: (e) => {
    e.preventDefault();
    o.go(to);
  }, style: { textDecoration: "none", color: "inherit", ...style } }, children);
}
function OpsStamp({ lang, src }) {
  const t = opsT(lang);
  return /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, fontWeight: 400, color: "var(--cb-txt2)", whiteSpace: "nowrap", letterSpacing: 0, textTransform: "none" } }, src, " \xB7 ", t("stamp.ago"));
}
function OpsSpark({ vals, w = 64, h = 20, color = "var(--cb-acc1)" }) {
  const max = Math.max(...vals), min = Math.min(...vals), r = Math.max(1, max - min);
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * (w - 2) + 1).toFixed(1)},${(h - 2 - (v - min) / r * (h - 4)).toFixed(1)}`).join(" ");
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h, "aria-hidden": "true", style: { display: "block", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("polyline", { points: pts, fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }));
}
function OpsSkel({ w = "100%", h = 14, r = 8, style }) {
  return /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "ops-skel", style: { width: w, height: h, borderRadius: r, background: "var(--cb-sk-base)", flexShrink: 0, ...style } });
}
function OpsSpinner({ size = 16 }) {
  return /* @__PURE__ */ React.createElement("svg", { className: "ops-spin", viewBox: "0 0 24 24", width: size, height: size, "aria-hidden": "true", style: { display: "block", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9", fill: "none", stroke: "currentColor", strokeWidth: "3", opacity: "0.25" }), /* @__PURE__ */ React.createElement("path", { d: "M21 12a9 9 0 0 0-9-9", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" }));
}
const OPS_STATE_KIND = { source: ["help", "var(--ops-unk)", "var(--cb-none-soft)"], error: ["alert", "var(--ops-warn)", "var(--cb-medium-soft)"], empty: ["info", "var(--cb-txt2)", null] };
function OpsState({ lang, kind = "source", title, sub, src, last, onRetry, compact, children, style }) {
  const t = opsT(lang);
  const o = useOps();
  const [glyph, ink, bg] = OPS_STATE_KIND[kind];
  const head = title || (kind === "source" ? t("err.source") + (src ? " \xB7 " + src : "") : kind === "error" ? t("state.errorTitle") : "");
  const showLast = kind === "source" && last !== false;
  const retry = kind !== "empty" && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onRetry || o.retry, style: { marginTop: 12, height: 40, padding: "0 16px", borderRadius: 10, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", fontSize: 13, fontWeight: 600, cursor: "pointer" } }, t("err.retry"));
  if (kind === "empty") {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: compact ? "20px 16px" : "34px 16px", borderRadius: 14, border: "1px dashed var(--cb-bord)", textAlign: "center", ...style } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: 8 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: glyph, size: 22, color: ink, sw: 1.8 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, head), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--cb-txt2)", marginTop: 6, lineHeight: 1.4 } }, sub), children);
  }
  return /* @__PURE__ */ React.createElement("div", { role: kind === "error" ? "alert" : "status", style: { padding: compact ? "12px 14px" : 16, borderRadius: 14, background: bg, display: "flex", gap: 12, alignItems: "flex-start", ...style } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: glyph, size: compact ? 20 : 22, color: ink, sw: 2 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: compact ? 14 : 15, fontWeight: 700, lineHeight: 1.3 } }, head), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--cb-txt2)", marginTop: 4, lineHeight: 1.4 } }, sub), showLast && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--cb-txt2)", marginTop: sub ? 8 : 4 } }, t("err.last")), retry, children));
}
function OpsSegmented({ options, value, label, small, mobile, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": label, style: { display: "inline-flex", padding: 3, borderRadius: 999, background: "var(--cb-bg)", border: "1px solid var(--cb-bord)" } }, options.map(([id, text]) => {
    const on = id === value;
    return /* @__PURE__ */ React.createElement("button", { key: id, type: "button", "aria-pressed": on, onClick: onChange ? () => onChange(id) : void 0, style: {
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--cb-font)",
      fontSize: small ? 12 : 13,
      fontWeight: 600,
      padding: small ? "5px 12px" : "6px 16px",
      borderRadius: 999,
      minHeight: mobile ? 40 : void 0,
      background: on ? "var(--cb-cta)" : "transparent",
      color: on ? "var(--cb-cta-ink)" : "var(--cb-txt2)"
    } }, text);
  }));
}
function OpsChart({ vals, h = 170, lang = "fr", summary }) {
  const w = 600, padL = 34, padB = 22, ih = h - padB - 8;
  const max = Math.max(...vals), min = Math.min(...vals);
  const lo = Math.floor(min / 10) * 10, hi = Math.ceil(max / 10) * 10, r = Math.max(1, hi - lo);
  const x = (i) => padL + i / (vals.length - 1) * (w - padL - 6);
  const y = (v) => 8 + (1 - (v - lo) / r) * ih;
  const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const end = new Date(2026, 10, 16);
  const lab = (back) => {
    const d = new Date(end);
    d.setDate(d.getDate() - back);
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
  };
  const n = vals.length - 1;
  const gid = "opsg" + vals.length + vals[0];
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": summary, style: { width: "100%", height: h, display: "block" }, preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "var(--cb-acc1)", stopOpacity: "0.35" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "var(--cb-acc1)", stopOpacity: "0" }))), [0, 0.5, 1].map((t, i) => {
    const gy = 8 + t * ih;
    const val = Math.round(hi - t * r);
    return /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("line", { x1: padL, x2: w - 6, y1: gy, y2: gy, stroke: "var(--cb-bord)", strokeWidth: "1" }), /* @__PURE__ */ React.createElement("text", { x: padL - 6, y: gy + 4, textAnchor: "end", fontSize: "11", fill: "var(--cb-txt2)", fontFamily: "var(--cb-font-mono)" }, val));
  }), /* @__PURE__ */ React.createElement("path", { d: `${line} L${x(n)} ${8 + ih} L${x(0)} ${8 + ih} Z`, fill: `url(#${gid})` }), /* @__PURE__ */ React.createElement("path", { d: line, fill: "none", stroke: "var(--cb-acc1)", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("circle", { cx: x(n), cy: y(vals[n]), r: "4.5", fill: "var(--cb-acc1)", stroke: "var(--cb-surf)", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("text", { x: padL, y: h - 4, fontSize: "11", fill: "var(--cb-txt2)", fontFamily: "var(--cb-font)" }, lab(n)), /* @__PURE__ */ React.createElement("text", { x: x(n / 2), y: h - 4, fontSize: "11", textAnchor: "middle", fill: "var(--cb-txt2)", fontFamily: "var(--cb-font)" }, lab(Math.round(n / 2))), /* @__PURE__ */ React.createElement("text", { x: w - 6, y: h - 4, fontSize: "11", textAnchor: "end", fill: "var(--cb-txt2)", fontFamily: "var(--cb-font)" }, lab(0)));
}
const OPS_TOAST_KIND = { success: ["check", "var(--ops-ok)"], error: ["xcircle", "var(--ops-bad)"], info: ["info", "var(--cb-txt2)"] };
function OpsToasts({ lang, mobile, top = 16, bottom = 16, extra }) {
  const o = useOps();
  const t = opsT(lang);
  const items = [...extra || [], ...o.toasts];
  if (!items.length) return null;
  const pos = mobile ? { left: 12, right: 12, bottom } : { top, right: 24, width: 360, maxWidth: "calc(100% - 48px)" };
  return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", zIndex: 8, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none", ...pos } }, items.map((it) => {
    const [glyph, ink] = OPS_TOAST_KIND[it.kind] || OPS_TOAST_KIND.info;
    const err = it.kind === "error";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: it.id,
        role: err ? "alert" : "status",
        "aria-live": err ? void 0 : "polite",
        style: { pointerEvents: "auto", display: "flex", alignItems: "center", gap: 10, padding: "4px 4px 4px 14px", minHeight: 48, borderRadius: 14, background: "var(--cb-surf)", border: "1px solid var(--cb-bord)", boxShadow: "0 14px 32px -14px rgba(0,0,0,0.45)", color: "var(--cb-txt1)", animation: "ops-toast-in .18s ease-out" }
      },
      /* @__PURE__ */ React.createElement(OpsGlyph, { name: glyph, size: 20, color: ink, sw: 2 }),
      /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.3 } }, opsFmt(t(it.key), it.vars)),
      /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": t("hdr.close"), onClick: () => o.dismiss(it.id), style: { width: 40, height: 40, flexShrink: 0, border: "none", background: "transparent", color: "var(--cb-txt2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "close", size: 16 }))
    );
  }));
}
function OpsLegalLinks({ lang, style, linkStyle, current }) {
  const t = opsT(lang);
  return /* @__PURE__ */ React.createElement("nav", { "aria-label": t("legal.nav"), style: { display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", ...style } }, [["cgu", "legal.cgu"], ["privacy", "legal.privacy"]].map(([id, key], i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: id }, i > 0 && /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, "\xB7"), /* @__PURE__ */ React.createElement(OpsRouteLink, { to: id, current: current === id, style: { textDecoration: current === id ? "none" : "underline", fontWeight: current === id ? 700 : void 0, textUnderlineOffset: 3, ...linkStyle } }, t(key)))));
}
const OPS_NAV = [
  { id: "home", glyph: "home", key: "nav.home" },
  { id: "health", glyph: "health", key: "nav.health" },
  { id: "deploy", glyph: "deploy", key: "nav.deploy" },
  { id: "users", glyph: "user", key: "nav.users" }
];
function OpsIconBtn({ name, label, onClick, size = 38, btnRef }) {
  return /* @__PURE__ */ React.createElement("button", { type: "button", ref: btnRef, "aria-label": label, onClick, style: { width: size, height: size, borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name, size: 18 }));
}
function OpsFrame({ lang = "fr", dark = false, mobile = false, active = "home", children, bare = false, prefs = false, toasts, title: titleProp, offline: offlineProp = false }) {
  const t = opsT(lang);
  const o = useOps();
  const vars = opsVars(dark);
  const title = titleProp || t("nav." + active);
  const offline = offlineProp || o.offline;
  const OfflineBar = offline && /* @__PURE__ */ React.createElement("div", { role: "status", style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: mobile ? "8px 16px" : "8px 32px", background: "var(--cb-none-soft)", color: "var(--cb-txt1)", fontSize: 13, fontWeight: 600, borderBottom: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "offline", size: 16, color: "var(--ops-unk)", sw: 2 }), t("off.banner"));
  const body = offline ? /* @__PURE__ */ React.createElement("div", { style: { opacity: 0.68, filter: "saturate(0.55)" } }, children) : children;
  const prefsOn = mobile && (prefs || o.prefsOpen);
  const closeRef = React.useRef(null);
  const gearRef = React.useRef(null);
  React.useEffect(() => {
    if (!prefsOn) return void 0;
    const live = o.prefsOpen;
    if (live && closeRef.current) closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") o.closePrefs();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (live && gearRef.current) gearRef.current.focus();
    };
  }, [prefsOn]);
  const root = { position: "relative", width: "100%", height: "100%", background: "var(--cb-bg)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", display: "flex", overflow: "hidden", boxSizing: "border-box", flexDirection: "column", ...vars };
  const plainBtn = { border: "none", background: "transparent", fontFamily: "var(--cb-font)", cursor: "pointer", color: "inherit", textAlign: "left" };
  if (mobile) {
    return /* @__PURE__ */ React.createElement("div", { "data-theme": dark ? "dark" : "light", style: root }, /* @__PURE__ */ React.createElement("header", { style: { flexShrink: 0, padding: "14px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.3 } }, title), !bare && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--cb-txt2)", marginTop: 2 } }, t("hdr.updated"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(OpsIconBtn, { name: "refresh", size: 44, label: t("hdr.refresh"), onClick: o.refresh }), /* @__PURE__ */ React.createElement(OpsIconBtn, { name: "gear", size: 44, label: t("hdr.prefs"), onClick: o.openPrefs, btnRef: gearRef }))), OfflineBar, /* @__PURE__ */ React.createElement("main", { style: { flex: 1, minHeight: 0, overflow: "auto", padding: "4px 16px 20px" } }, body), /* @__PURE__ */ React.createElement("nav", { "aria-label": t("hdr.nav"), style: { flexShrink: 0, height: 68, background: "var(--cb-surf)", borderTop: "1px solid var(--cb-bord)", display: "flex" } }, OPS_NAV.map((n) => {
      const on = n.id === active;
      return /* @__PURE__ */ React.createElement(OpsRouteLink, { key: n.id, to: n.id, current: on, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: on ? "var(--cb-txt1)" : "var(--cb-txt2)", fontSize: 11.5, fontWeight: on ? 700 : 500 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 52, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: on ? "var(--cb-acc-soft)" : "transparent" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: n.glyph, size: 20, color: on ? "var(--cb-acc1)" : "currentColor" })), t(n.key));
    })), prefsOn && /* @__PURE__ */ React.createElement("div", { onClick: o.closePrefs, style: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", zIndex: 5 } }, /* @__PURE__ */ React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": t("hdr.prefs"), onClick: (e) => e.stopPropagation(), style: { width: "100%", background: "var(--cb-surf)", borderRadius: "22px 22px 0 0", padding: "10px 18px 28px", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { width: 40, height: 4, borderRadius: 999, background: "var(--cb-bord)", margin: "0 auto 16px" } }), /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 20, fontWeight: 700 } }, t("hdr.prefs")), [
      [t("prefs.theme"), /* @__PURE__ */ React.createElement(OpsSegmented, { mobile: true, label: t("prefs.theme"), value: dark ? "dark" : "light", onChange: (id) => o.setDark(id === "dark"), options: [["light", t("prefs.light")], ["dark", t("prefs.dark")]] })],
      [t("prefs.lang"), /* @__PURE__ */ React.createElement(OpsSegmented, { mobile: true, label: t("prefs.lang"), value: lang, onChange: o.setLang, options: [["fr", "Fran\xE7ais"], ["en", "English"]] })]
    ].map(([l, ctl], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 600 } }, l), ctl)), /* @__PURE__ */ React.createElement(OpsLegalLinks, { lang, style: { padding: "6px 0", borderBottom: "1px solid var(--cb-bord)", gap: 14, fontSize: 14, color: "var(--cb-txt2)" }, linkStyle: { display: "inline-flex", alignItems: "center", minHeight: 44, color: "var(--cb-txt1)", fontWeight: 600 } }), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: o.signOut, style: { marginTop: 18, width: "100%", height: 48, borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "logout", size: 18 }), t("hdr.signout")), /* @__PURE__ */ React.createElement("button", { type: "button", ref: closeRef, onClick: o.closePrefs, style: { marginTop: 10, width: "100%", height: 48, borderRadius: 12, border: "none", background: "var(--cb-cta)", color: "var(--cb-cta-ink)", fontFamily: "var(--cb-font)", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, t("hdr.close")))), /* @__PURE__ */ React.createElement(OpsToasts, { lang, mobile: true, extra: toasts, bottom: 80 }));
  }
  return /* @__PURE__ */ React.createElement("div", { "data-theme": dark ? "dark" : "light", style: root }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex" } }, /* @__PURE__ */ React.createElement("nav", { "aria-label": t("hdr.nav"), style: { width: 236, flexShrink: 0, background: "var(--cb-surf)", borderRight: "1px solid var(--cb-bord)", padding: "22px 14px", display: "flex", flexDirection: "column", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "2px 10px 26px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 32, height: 32, borderRadius: 10, background: "var(--cb-acc-soft)", border: "1px solid var(--cb-acc-glow)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "mountain", size: 18, color: "var(--cb-acc1)" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 600 } }, "Cloudbreak ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--cb-txt2)", fontWeight: 400 } }, "Ops"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, OPS_NAV.map((n) => {
    const on = n.id === active;
    return /* @__PURE__ */ React.createElement(OpsRouteLink, { key: n.id, to: n.id, current: on, style: { display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, fontSize: 14.5, fontWeight: on ? 700 : 500, background: on ? "var(--cb-acc-soft)" : "transparent", color: on ? "var(--cb-txt1)" : "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: n.glyph, size: 19, color: on ? "var(--cb-acc1)" : "currentColor" }), t(n.key));
  })), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", padding: "14px 10px 0", borderTop: "1px solid var(--cb-bord)", fontSize: 12, color: "var(--cb-txt2)", lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: o.signOut, style: { ...plainBtn, display: "flex", alignItems: "center", gap: 8, marginTop: 0, padding: "9px 10px", marginLeft: -10, marginRight: -10, borderRadius: 10, color: "var(--cb-txt1)", fontSize: 13.5, fontWeight: 600 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "logout", size: 16 }), t("hdr.signout")), /* @__PURE__ */ React.createElement(OpsLegalLinks, { lang, style: { marginTop: 6, fontSize: 12 }, linkStyle: { display: "inline-block", padding: "6px 0" } }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("header", { style: { flexShrink: 0, height: 72, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: -0.3 } }, title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, !bare && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--cb-txt2)" } }, t("hdr.updated")), /* @__PURE__ */ React.createElement(OpsIconBtn, { name: "refresh", label: t("hdr.refresh"), onClick: o.refresh }), /* @__PURE__ */ React.createElement(OpsIconBtn, { name: dark ? "sun" : "moon", label: t("hdr.theme"), onClick: () => o.setDark(!dark) }), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": t("hdr.lang"), onClick: () => o.setLang(lang === "fr" ? "en" : "fr"), style: { height: 38, fontFamily: "var(--cb-font)", fontSize: 12.5, fontWeight: 700, padding: "0 12px", borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", cursor: "pointer" } }, lang === "fr" ? "FR" : "EN"))), OfflineBar, /* @__PURE__ */ React.createElement("main", { style: { flex: 1, minHeight: 0, overflow: "auto", padding: "26px 32px 34px" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 1120, margin: "0 auto" } }, body)))), /* @__PURE__ */ React.createElement(OpsToasts, { lang, extra: toasts, top: 84 }));
}
Object.assign(window, { opsAdd, OPS_DICT, OPS_T, opsT, opsFmt, opsVars, OPS_ST, opsWorst, opsMock, opsSeries, OpsGlyph, OpsCard, OpsEyebrow, OpsPill, OpsLink, OpsRouteLink, OpsLegalLinks, OpsSkel, OpsSpinner, OpsState, OpsStamp, OpsSpark, opsTrend, OPS_MISS, OpsSegmented, OpsChart, OpsToasts, OpsFrame, OPS_NAV, OpsCtx, OPS_CTX_DEFAULT, useOps });
opsAdd([
  ["why.disk", "Disque \xE0 87 % (seuil 85 %)", "Disk at 87% (limit 85%)"],
  ["why.behind", "Backend prod en retard de 2 commits sur main", "Prod backend 2 commits behind main"],
  ["why.apiDown", "API injoignable depuis 14:02", "API unreachable since 14:02"],
  ["why.backupLate", "Sauvegarde des bases en retard de 3 h 12", "Database backup 3 h 12 late"],
  ["why.bsDown", "BetterStack injoignable : services et serveur inconnus", "BetterStack unreachable: services and server unknown"],
  ["why.cronsUnk", "Crons et sauvegardes : \xE9tat inconnu (backend injoignable)", "Crons and backups: status unknown (backend unreachable)"],
  ["why.verUnk", "Version du backend inconnue", "Backend version unknown"],
  ["why.favsFail", "Alertes favoris : dernier passage en \xE9chec", "Favorites alerts: last run failed"],
  ["home.seeAll", "Voir toutes les versions", "See all versions"]
]);
function opsWhy(scn) {
  if (scn === "warn") return [["warn", "why.disk", "health"], ["warn", "why.behind", "deploy"]];
  if (scn === "bad") return [["bad", "why.apiDown", "health"], ["warn", "why.disk", "health"], ["unk", "why.cronsUnk", "health"]];
  if (scn === "cron") return [["bad", "why.backupLate", "health"], ["bad", "why.favsFail", "health"]];
  if (scn === "unk") return [["unk", "why.bsDown", "health"]];
  return [];
}
function OpsStatusBanner({ lang, scn, m }) {
  const t = opsT(lang);
  if (m.global === "load") {
    return /* @__PURE__ */ React.createElement("section", { "aria-busy": "true", "aria-label": t("ban.load"), style: { background: "var(--cb-surf)", border: "1px solid var(--cb-bord)", borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: 48, h: 48, r: 14 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "var(--cb-txt2)" } }, t("ban.load")), /* @__PURE__ */ React.createElement(OpsSkel, { w: "60%", h: 14, style: { marginTop: 6 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 150, h: 13, style: { marginTop: 10 } })));
  }
  const g = m.global, c = OPS_ST[g];
  const n = opsWhy(scn).length;
  const count = n === 1 ? t("ban.oneSub") : `${n} ${t("ban.nSub")}`;
  const sub = { ok: t("ban.okSub"), warn: count, bad: count, unk: t("ban.unkSub") }[g];
  return /* @__PURE__ */ React.createElement("section", { "aria-label": t("ban." + g), style: { background: c.soft, border: `1px solid ${c.fill}`, borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 48, height: 48, borderRadius: 14, background: c.fill, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: c.glyph, size: 28, color: "#1A1A1A", sw: 2.2 })), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "var(--cb-txt1)" } }, t("ban." + g)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--cb-txt2)", marginTop: 2 } }, sub, " ", /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap" } }, "\xB7 14:32")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10 } }, /* @__PURE__ */ React.createElement(OpsLink, { ext: "BetterStack" }, t("link.betterstack")))));
}
function OpsWatch({ lang, scn }) {
  const t = opsT(lang);
  const rows = opsWhy(scn);
  if (!rows.length) return null;
  return /* @__PURE__ */ React.createElement(OpsCard, { style: { padding: "6px 18px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, padding: "12px 0 4px" } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, t("watch.title"))), rows.map(([s, key, where], i) => /* @__PURE__ */ React.createElement(OpsRouteLink, { key: i, to: where, style: { display: "flex", alignItems: "center", gap: 12, padding: "13px 0", minHeight: 44, boxSizing: "border-box", color: "var(--cb-txt1)", borderTop: i ? "1px solid var(--cb-bord)" : "0" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: OPS_ST[s].glyph, size: 20, color: OPS_ST[s].ink, sw: 2 }), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14.5, fontWeight: 500 } }, t(key)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--cb-txt2)", display: "flex", alignItems: "center", gap: 4 } }, t("watch.see"), /* @__PURE__ */ React.createElement(OpsGlyph, { name: "chevron", size: 14 })))));
}
function OpsTile({ lang, glyph, label, s, metric, loading, to, mobile }) {
  const t = opsT(lang);
  if (loading) {
    return /* @__PURE__ */ React.createElement(OpsCard, { busy: t("state.loading"), style: { padding: 16 } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: 36, h: 36, r: 11 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "55%", h: 17, style: { marginTop: 14 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 112, h: 22, r: 999, style: { marginTop: 8 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "80%", h: mobile ? 35 : 17, style: { marginTop: 10 } }));
  }
  return /* @__PURE__ */ React.createElement(OpsRouteLink, { to, style: { display: "block" } }, /* @__PURE__ */ React.createElement(OpsCard, { as: "div", style: { padding: 16, height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 36, height: 36, borderRadius: 11, background: "var(--cb-acc-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cb-acc1)" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: glyph, size: 19 })), /* @__PURE__ */ React.createElement(OpsGlyph, { name: "chevron", size: 16, color: "var(--cb-txt2)" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, marginTop: 14 } }, label), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(OpsPill, { s, label: t("st." + s), size: 12 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--cb-txt2)", marginTop: 10, lineHeight: 1.35 } }, metric)));
}
function OpsTiles({ lang, m, mobile }) {
  const t = opsT(lang);
  const M2 = {
    services: { ok: t("tile.servicesOk"), bad: t("tile.servicesBad"), unk: t("tile.unk") },
    crons: { ok: t("tile.cronsOk"), bad: t("tile.cronsBad"), unk: t("tile.cronsUnk") },
    server: { ok: t("tile.serverOk"), warn: t("tile.serverWarn"), unk: t("tile.unk") },
    versions: { ok: t("tile.versionsOk"), warn: t("tile.versionsWarn"), unk: t("tile.versionsUnk") }
  };
  const items = [["pulse", "tile.services", "services", "health"], ["clock", "tile.crons", "crons", "health"], ["server", "tile.server", "server", "health"], ["deploy", "tile.versions", "versions", "deploy"]];
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 } }, items.map(([g, k, id, to]) => /* @__PURE__ */ React.createElement(OpsTile, { key: id, lang, glyph: g, label: t(k), s: m[id], metric: M2[id][m[id]], loading: m.pend[id], to, mobile })));
}
function opsChartSummary(t, tab, vals) {
  return opsFmt(t(tab === "users" ? "chart.sumUsers" : "chart.sumUsage"), { a: vals[0], b: vals[vals.length - 1], n: vals.length });
}
function OpsUsersCard({ lang, scn, m, mobile, tab: tab0 = "users", range: range0 = 30 }) {
  const t = opsT(lang);
  const [tab, setTab] = React.useState(tab0);
  const [range, setRange] = React.useState(String(range0));
  const fmt = (n) => n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
  const load = m.pend.users;
  const down = scn === "bad";
  const vals = opsSeries(tab, Number(range));
  const summary = opsChartSummary(t, tab, vals);
  const live = !m.empty && !down;
  return /* @__PURE__ */ React.createElement(OpsCard, { busy: load ? t("state.loading") : void 0 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, t("users.title")), !down && !load && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "Backend" })), load ? /* @__PURE__ */ React.createElement(OpsSkel, { w: mobile ? 120 : 140, h: mobile ? 48 : 56, r: 10, style: { marginTop: 6 } }) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, marginTop: 6, color: down ? "var(--cb-txt2)" : "var(--cb-txt1)" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: mobile ? 48 : 56, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 } }, fmt(m.users)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: "var(--cb-txt2)" } }, t("users.total"))), load ? /* @__PURE__ */ React.createElement(OpsSkel, { w: 220, h: 17, style: { marginTop: 10 } }) : live && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 13.5, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ops-ok)", fontWeight: 700 } }, "\u25B2 ", t("users.week")), /* @__PURE__ */ React.createElement("span", null, "121 ", t("users.anon"), " \xB7 63 ", t("users.perm")))), load ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: mobile ? "flex-start" : "flex-end" } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: mobile ? 220 : 200, h: mobile ? 47 : 34, r: 999 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: mobile ? 150 : 130, h: mobile ? 47 : 34, r: 999 })) : live && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: mobile ? "flex-start" : "flex-end" } }, /* @__PURE__ */ React.createElement(OpsSegmented, { label: t("chart.series"), small: true, mobile, value: tab, onChange: setTab, options: [["users", t("chart.users")], ["usage", t("chart.usage")]] }), /* @__PURE__ */ React.createElement(OpsSegmented, { label: t("chart.period"), small: true, mobile, value: range, onChange: setRange, options: [["30", t("chart.d30")], ["90", t("chart.d90")]] }))), load ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsSkel, { h: mobile ? 150 : 176, r: 12, style: { marginTop: 18 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "70%", h: mobile ? 24 : 14, style: { marginTop: 10 } })) : down ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "Backend", title: t("err.backend"), sub: t("err.backendSub"), style: { marginTop: 18 } }) : m.empty ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "empty", title: t("empty.title"), sub: t("chart.empty"), style: { marginTop: 18 } }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement(OpsChart, { vals, h: mobile ? 150 : 176, lang, summary })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10, fontSize: 12, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 14 }), t("chart.note"))));
}
function OpsVersionRows({ lang, m }) {
  const t = opsT(lang);
  const warn = m.versions === "warn";
  const rows = [
    m.apiDown ? { k: "ver.backend", v: "\u2014", tag: null, sha: null, s: "unk", txt: t("ver.unkBackend") } : { k: "ver.backend", v: "1.0.0", tag: "v1.0.0", sha: warn ? "a3c91e0" : "f9fd883", s: warn ? "warn" : "ok", txt: warn ? t("ver.behind") : t("ver.upToDate") },
    { k: "ver.ops", v: "1.0.0", tag: "v1.0.0", sha: "d5092e7", s: "ok", txt: t("ver.upToDate") },
    { k: "ver.mobile", v: "1.0.0", tag: t("ver.store"), sha: null, s: "ok", txt: t("ver.waitStore") }
  ];
  return /* @__PURE__ */ React.createElement("div", null, rows.map((r, i) => /* @__PURE__ */ React.createElement("div", { key: r.k, style: { padding: "13px 0", borderTop: i ? "1px solid var(--cb-bord)" : "0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } }, t(r.k)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)", fontSize: 15, fontWeight: 600 } }, r.v)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" } }, r.tag && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)", fontSize: 12, padding: "2px 8px", borderRadius: 6, border: "1px solid var(--cb-bord)", color: "var(--cb-txt2)" } }, r.tag), r.sha && /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)", fontSize: 12, color: "var(--cb-txt2)" } }, r.sha), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: r.s === "ok" ? "var(--cb-txt2)" : OPS_ST[r.s].ink, fontWeight: r.s === "ok" ? 400 : 700, display: "inline-flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: OPS_ST[r.s].glyph, size: 14, color: OPS_ST[r.s].ink, sw: 2 }), r.txt)))));
}
function OpsVersionsCard({ lang, m }) {
  const t = opsT(lang);
  const load = m.pend.versions;
  return /* @__PURE__ */ React.createElement(OpsCard, { busy: load ? t("state.loading") : void 0 }, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 4px", display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, t("ver.title")), !load && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "/version \xB7 GitHub" })), load ? [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { padding: "13px 0", borderTop: i ? "1px solid var(--cb-bord)" : "0" } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: "100%", h: 20 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "70%", h: i === 2 ? 44 : 22, style: { marginTop: 6 } }))) : /* @__PURE__ */ React.createElement(OpsVersionRows, { lang, m }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, borderTop: "1px solid var(--cb-bord)", paddingTop: 12 } }, /* @__PURE__ */ React.createElement(OpsLink, { to: "deploy" }, t("home.seeAll"))));
}
const OPS_TOOLS = [["BetterStack", "tool.betterstack"], ["Sentry", "tool.sentry"], ["PostHog", "tool.posthog", true], ["Supabase", "tool.supabase"], ["OVH", "tool.ovh"], ["Brevo", "tool.brevo"]];
function OpsToolsCard({ lang, mobile }) {
  const t = opsT(lang);
  const o = useOps();
  return /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 12px" } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, t("tools.title"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10 } }, OPS_TOOLS.map(([name, key, soon]) => {
    const box = { display: "flex", alignItems: "center", gap: 10, minHeight: 56, boxSizing: "border-box", padding: "10px 12px", borderRadius: 14, border: soon ? "1px dashed var(--cb-bord)" : "1px solid var(--cb-bord)", background: "var(--cb-bg)", color: "var(--cb-txt1)", textDecoration: "none", minWidth: 0 };
    const body = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700 } }, name, soon && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, border: "1px solid var(--cb-bord)", color: "var(--cb-txt2)" } }, t("link.soon"))), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 12, color: "var(--cb-txt2)", marginTop: 2, lineHeight: 1.3 } }, t(key))), !soon && /* @__PURE__ */ React.createElement(OpsGlyph, { name: "external", size: 15, color: "var(--cb-txt2)" }));
    return soon ? /* @__PURE__ */ React.createElement("span", { key: name, role: "link", "aria-disabled": "true", style: { ...box, color: "var(--cb-txt2)" } }, body) : /* @__PURE__ */ React.createElement("a", { key: name, href: "#", onClick: (e) => {
      e.preventDefault();
      o.openExternal(name);
    }, style: box }, body);
  })));
}
function CBOpsHome({ lang = "fr", dark = false, mobile = false, scn = "ok", tab = "users", range = 30, prefs = false, toasts, offline }) {
  const m = opsMock(scn);
  const gap = 14;
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "home", prefs, toasts, offline }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap } }, /* @__PURE__ */ React.createElement(OpsStatusBanner, { lang, scn, m }), m.global !== "load" && /* @__PURE__ */ React.createElement(OpsWatch, { lang, scn }), /* @__PURE__ */ React.createElement(OpsTiles, { lang, m, mobile }), mobile ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsUsersCard, { lang, scn, m, mobile: true, tab, range }), /* @__PURE__ */ React.createElement(OpsVersionsCard, { lang, m })) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.9fr 1fr", gap } }, /* @__PURE__ */ React.createElement(OpsUsersCard, { lang, scn, m, tab, range }), /* @__PURE__ */ React.createElement(OpsVersionsCard, { lang, m })), /* @__PURE__ */ React.createElement(OpsToolsCard, { lang, mobile })));
}
Object.assign(window, { CBOpsHome, OpsVersionRows, OpsUsersCard, OpsToolsCard, opsChartSummary });
opsAdd([
  ["health.checkHint", "V\xE9rifi\xE9 toutes les 3 minutes par BetterStack", "Checked every 3 minutes by BetterStack"],
  ["health.dbOk", "Postgres : OK", "Postgres: OK"],
  ["health.redisOk", "Redis : OK", "Redis: OK"],
  ["health.dbUnk", "Postgres : inconnu", "Postgres: unknown"],
  ["health.redisUnk", "Redis : inconnu", "Redis: unknown"],
  ["health.upLabel", "Disponibilit\xE9", "Uptime"],
  ["health.days30", "30 derniers jours", "Last 30 days"],
  ["health.sched.purge", "Tous les jours, 06:05 Paris", "Daily, 06:05 Paris"],
  ["health.sched.favs", "Tous les jours, 18:05 Paris", "Daily, 18:05 Paris"],
  ["health.sched.backup", "Tous les jours, 03:00 UTC", "Daily, 03:00 UTC"],
  ["health.sched.offsite", "Tous les jours, apr\xE8s la sauvegarde \xB7 d\xE9p\xF4t 31 Mo (plafond 2 Go)", "Daily, after the backup \xB7 repository 31 MB (cap 2 GB)"],
  ["health.lastOffsite", "Aujourd’hui, 03:00 UTC", "Today, 03:00 UTC"],
  ["health.lastOffsiteBad", "Hier, 03:00 UTC", "Yesterday, 03:00 UTC"],
  ["health.nextOffsite", "Demain, 03:00 UTC", "Tomorrow, 03:00 UTC"],
  ["health.costHint", "Le co\xFBt OVH n’est pas lu ici : une alerte de consommation OVH pr\xE9vient par e-mail au-del\xE0 du seuil mensuel.", "OVH cost is not read here: an OVH consumption alert emails you above the monthly threshold."],
  ["health.lastPurge", "Aujourd\u2019hui, 06:05", "Today, 06:05"],
  ["health.lastFavs", "Hier, 18:05", "Yesterday, 18:05"],
  ["health.lastBackup", "Aujourd\u2019hui, 03:00 UTC", "Today, 03:00 UTC"],
  ["health.lastBackupBad", "Hier, 03:00 UTC", "Yesterday, 03:00 UTC"],
  ["health.nextPurge", "Demain, 06:05", "Tomorrow, 06:05"],
  ["health.nextFavs", "Aujourd\u2019hui, 18:05", "Today, 18:05"],
  ["health.nextBackup", "Demain, 03:00 UTC", "Tomorrow, 03:00 UTC"],
  ["health.hbHint", "Un job est en retard s\u2019il n\u2019a pas signal\xE9 sa fin dans sa fen\xEAtre, plus 30 minutes de marge.", "A job is late if it has not reported completion within its window, plus a 30-minute margin."],
  ["health.sharedHint", "Ce VPS h\xE9berge aussi l\u2019environnement de dev et d\u2019autres projets : les jauges mesurent la machine enti\xE8re.", "This VPS also hosts the dev environment and other projects: the gauges measure the whole machine."],
  ["gauge.noLimit", "Pas d\u2019alerte configur\xE9e", "No alert configured"],
  ["gauge.avail", "disponible", "available"],
  ["gauge.used", "utilis\xE9", "used"],
  ["deploy.compare", "Comparaison \xE0 main", "Comparison with main"],
  ["deploy.published", "Version publi\xE9e", "Published version"],
  ["deploy.inMain", "Dans main", "In main"],
  ["deploy.builtOk", "13 nov. 2026, 18:42", "Nov 13, 2026, 6:42 PM"],
  ["deploy.builtWarn", "14 nov. 2026, 09:10", "Nov 14, 2026, 9:10 AM"],
  ["deploy.na", "Pas de serveur : pas de SHA", "No server: no SHA"],
  ["deploy.ghUnk", "GitHub injoignable : comparaison impossible", "GitHub unreachable: comparison unavailable"],
  ["deploy.ahead", "En avance de 1 commit", "1 commit ahead"],
  ["health.fail", "\xC9chec", "Failed"],
  ["health.never", "Jamais pass\xE9", "Never ran"],
  ["health.neverSub", "Pas encore de passage enregistr\xE9", "No run recorded yet"],
  ["health.lastFavsFail", "Hier, 18:05 \xB7 termin\xE9 en erreur", "Yesterday, 18:05 \xB7 ended with an error"],
  ["health.cronSrcHint", "L\u2019\xE9tat des crons est lu sur le backend. BetterStack continue d\u2019alerter par email.", "Cron status is read from the backend. BetterStack keeps alerting by email."]
]);
function OpsSectionTitle({ children, right, stamp }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" } }, children, stamp), right);
}
function OpsUptimeBars({ lang, pct, lastBad, clean }) {
  const t = opsT(lang);
  return /* @__PURE__ */ React.createElement("div", { role: "img", "aria-label": `${t("health.upLabel")} ${t("health.days30")} : ${pct} %`, style: { display: "flex", gap: 2, height: 24 } }, Array.from({ length: 30 }).map((_, i) => {
    const s = lastBad && i === 29 ? "bad" : i === 17 && !clean ? "warn" : "ok";
    return /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, borderRadius: 3, background: OPS_ST[s].fill, opacity: s === "ok" ? 0.85 : 1 } });
  }));
}
function OpsServiceRow({ lang, k, s, up24, up30, inc, chips, first, mobile, clean, loading }) {
  const t = opsT(lang);
  const unk = s === "unk";
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 0", borderTop: first ? "0" : "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700 } }, t(k)), loading ? /* @__PURE__ */ React.createElement(OpsSkel, { w: 120, h: 26, r: 999 }) : /* @__PURE__ */ React.createElement(OpsPill, { s, label: t("st." + s) })), loading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsSkel, { w: "80%", h: mobile ? 68 : 20, style: { marginTop: 12 } }), /* @__PURE__ */ React.createElement(OpsSkel, { h: 24, r: 4, style: { marginTop: 12 } }), chips && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: 96, h: 25, r: 999 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 96, h: 25, r: 999 }))) : !unk && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: mobile ? 14 : 28, marginTop: 12, flexWrap: "wrap", fontSize: 13.5, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement("span", null, t("health.upLabel"), " ", t("health.up24"), " ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--cb-txt1)", fontFamily: "var(--cb-font-mono)" } }, up24, " %")), /* @__PURE__ */ React.createElement("span", null, t("health.upLabel"), " ", t("health.up30"), " ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--cb-txt1)", fontFamily: "var(--cb-font-mono)" } }, up30, " %")), /* @__PURE__ */ React.createElement("span", null, t("health.lastInc"), " : ", /* @__PURE__ */ React.createElement("b", { style: { color: s === "bad" ? "var(--ops-bad)" : "var(--cb-txt1)" } }, inc))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement(OpsUptimeBars, { lang, pct: up30, lastBad: s === "bad", clean })), chips && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" } }, chips.map(([cs, key]) => /* @__PURE__ */ React.createElement(OpsPill, { key, s: cs, label: t(key), size: 11.5 })))));
}
function OpsGauge({ lang, k, pct, limit, mode, s, note, amp = 4, loading, mobile }) {
  const t = opsT(lang);
  const c = OPS_ST[s];
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 700 } }, t(k)), /* @__PURE__ */ React.createElement(OpsSkel, { w: 84, h: 20 })), /* @__PURE__ */ React.createElement(OpsSkel, { h: 10, r: 999, style: { marginTop: 8 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "55%", h: mobile ? 22 : 16, style: { marginTop: 6 } }));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 700 } }, t(k)), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)", fontSize: 15, fontWeight: 700, color: s === "ok" ? "var(--cb-txt1)" : c.ink } }, pct, " % ", /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, fontSize: 12, color: "var(--cb-txt2)" } }, mode === "avail" ? t("gauge.avail") : t("gauge.used")))), /* @__PURE__ */ React.createElement("div", { role: "img", "aria-label": `${t(k)} ${pct} %`, style: { position: "relative", height: 10, borderRadius: 999, background: "var(--cb-sk-base)", marginTop: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", borderRadius: 999, background: s === "ok" ? "var(--cb-acc1)" : c.fill } }), limit != null && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -4, bottom: -4, left: limit + "%", width: 2, background: "var(--cb-txt1)", borderRadius: 2 } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--cb-txt2)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 } }, s !== "ok" && /* @__PURE__ */ React.createElement(OpsGlyph, { name: c.glyph, size: 13, color: c.ink, sw: 2 }), note, /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" } }, t("trend.24h"), /* @__PURE__ */ React.createElement(OpsSpark, { vals: opsTrend(pct, 24, amp), color: s === "ok" ? "var(--cb-acc1)" : c.fill }))));
}
function CBOpsHealth({ lang = "fr", dark = false, mobile = false, scn = "ok", offline }) {
  const t = opsT(lang);
  const m = opsMock(scn);
  const apiS = m.services, siteS = scn === "bad" ? "ok" : m.services;
  const diskS = m.disk > 85 ? "warn" : "ok", swapS = m.swap > 75 ? "warn" : "ok";
  const srvUnk = m.server === "unk";
  const busy = t("state.loading");
  const empty = scn === "empty", cron = scn === "cron";
  const jobs = [
    ["job.purge", "health.sched.purge", "health.lastPurge", "health.nextPurge", empty ? "never" : "ok"],
    ["job.favs", "health.sched.favs", cron ? "health.lastFavsFail" : "health.lastFavs", "health.nextFavs", empty ? "never" : cron ? "fail" : "ok"],
    ["job.backup", "health.sched.backup", cron ? "health.lastBackupBad" : "health.lastBackup", "health.nextBackup", cron ? "late" : "ok"],
    ["job.offsite", "health.sched.offsite", cron ? "health.lastOffsiteBad" : "health.lastOffsite", "health.nextOffsite", cron ? "late" : "ok"]
  ];
  const JOB = { ok: ["ok", "health.onTime"], late: ["bad", "health.late"], fail: ["bad", "health.fail"], never: ["unk", "health.never"] };
  const cols = mobile ? "1fr" : "1.35fr 1fr";
  const Services = /* @__PURE__ */ React.createElement(OpsCard, { busy: m.pend.services ? busy : void 0 }, /* @__PURE__ */ React.createElement(OpsSectionTitle, { stamp: !srvUnk && !m.pend.services && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "BetterStack" }), right: /* @__PURE__ */ React.createElement(OpsLink, { ext: "BetterStack" }, t("link.betterstack")) }, t("health.services")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--cb-txt2)", marginTop: -6 } }, t("health.checkHint")), srvUnk ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "BetterStack", style: { marginTop: 14 } }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    OpsServiceRow,
    {
      lang,
      mobile,
      loading: m.pend.services,
      first: true,
      k: "health.api",
      s: apiS,
      up24: apiS === "bad" ? "92,4" : "100",
      up30: apiS === "bad" ? "99,1" : "99,97",
      inc: apiS === "bad" ? t("health.incBad") : t("health.incOk"),
      chips: apiS === "bad" ? [["unk", "health.dbUnk"], ["unk", "health.redisUnk"]] : [["ok", "health.dbOk"], ["ok", "health.redisOk"]]
    }
  ), /* @__PURE__ */ React.createElement(OpsServiceRow, { lang, mobile, loading: m.pend.services, clean: true, k: "health.site", s: siteS, up24: "100", up30: "100", inc: t("health.noInc") })));
  const Crons = /* @__PURE__ */ React.createElement(OpsCard, { busy: m.pend.crons ? busy : void 0 }, /* @__PURE__ */ React.createElement(OpsSectionTitle, { stamp: !m.apiDown && !m.pend.crons && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "Backend" }) }, t("health.crons")), m.apiDown ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "Backend" }) : jobs.map(([n, sch, last, next, st], i) => {
    const [s, lab] = JOB[st];
    const load = m.pend.crons;
    return /* @__PURE__ */ React.createElement("div", { key: n, style: { padding: "14px 0", borderTop: i ? "1px solid var(--cb-bord)" : "1px solid transparent" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } }, t(n)), load ? /* @__PURE__ */ React.createElement(OpsSkel, { w: 92, h: 26, r: 999 }) : /* @__PURE__ */ React.createElement(OpsPill, { s, label: t(lab), size: 11.5 })), load ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsSkel, { w: "45%", h: 16, style: { marginTop: 4 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "85%", h: mobile ? 42 : 17, style: { marginTop: 8 } })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--cb-txt2)", marginTop: 4 } }, t(sch)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 22, marginTop: 8, fontSize: 13, color: "var(--cb-txt2)", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", null, t("health.last"), " : ", /* @__PURE__ */ React.createElement("b", { style: { color: s === "bad" ? "var(--ops-bad)" : "var(--cb-txt1)" } }, st === "never" ? t("health.neverSub") : t(last))), /* @__PURE__ */ React.createElement("span", null, t("health.next"), " : ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--cb-txt1)" } }, t(next))))));
  }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, fontSize: 12, color: "var(--cb-txt2)", marginTop: m.apiDown ? 12 : 4, lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 14 }), m.apiDown ? t("health.cronSrcHint") : t("health.hbHint") + " " + t("health.costHint")));
  const Server = /* @__PURE__ */ React.createElement(OpsCard, { busy: m.pend.server ? busy : void 0 }, /* @__PURE__ */ React.createElement(OpsSectionTitle, { stamp: !srvUnk && !m.pend.server && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "BetterStack" }), right: /* @__PURE__ */ React.createElement(OpsLink, { ext: "BetterStack" }, t("link.betterstack")) }, t("health.server")), /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999, border: "1px solid var(--cb-bord)", color: "var(--cb-txt2)" } }, t("health.shared")), srvUnk ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "BetterStack", style: { marginTop: 14 } }) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(OpsGauge, { lang, mobile, loading: m.pend.server, k: "gauge.cpu", amp: 9, pct: m.cpu, mode: "used", s: "ok", note: t("gauge.noLimit") }), /* @__PURE__ */ React.createElement(OpsGauge, { lang, mobile, loading: m.pend.server, k: "gauge.ram", pct: m.ram, limit: 10, mode: "avail", s: "ok", note: `${t("gauge.limit")} : ${t("gauge.limitRam")}` }), /* @__PURE__ */ React.createElement(OpsGauge, { lang, mobile, loading: m.pend.server, k: "gauge.disk", pct: m.disk, limit: 85, mode: "used", s: diskS, note: `${t("gauge.limit")} : 85 %` }), /* @__PURE__ */ React.createElement(OpsGauge, { lang, mobile, loading: m.pend.server, k: "gauge.swap", pct: m.swap, limit: 75, mode: "used", s: swapS, note: `${t("gauge.limit")} : 75 %` })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, fontSize: 12, color: "var(--cb-txt2)", marginTop: 6 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 14 }), t("health.sharedHint")));
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "health", offline }, mobile ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, Services, Crons, Server) : /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: cols, gap: 14, alignItems: "start" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, Services, Crons), Server));
}
function OpsDeployCard({ lang, k, version, tag, sha, built, cmp, cmpS, extra, mobile, branch, refSha, loading }) {
  const t = opsT(lang);
  return /* @__PURE__ */ React.createElement(OpsCard, { busy: loading ? t("state.loading") : void 0 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700 } }, t(k)), loading ? /* @__PURE__ */ React.createElement(OpsSkel, { w: 110, h: 23, r: 999 }) : /* @__PURE__ */ React.createElement(OpsPill, { s: cmpS, label: cmp })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginTop: 16 } }, [[t("ver.version"), version], [t("ver.tag"), tag], [t("ver.sha"), sha || t("deploy.na")], [t("ver.built"), built || "\u2014"]].map(([l, v], i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, l), loading ? /* @__PURE__ */ React.createElement(OpsSkel, { w: "70%", h: i < 3 ? 22 : 18, style: { marginTop: 5 } }) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 5, fontSize: i < 3 && v !== t("deploy.na") ? 17 : 13.5, fontWeight: 600, fontFamily: i < 3 && v !== t("deploy.na") ? "var(--cb-font-mono)" : "var(--cb-font)", color: v === t("deploy.na") ? "var(--cb-txt2)" : "var(--cb-txt1)" } }, v)))), branch && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--cb-bord)", fontSize: 13, color: "var(--cb-txt2)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" } }, t("ver.vs"), " ", /* @__PURE__ */ React.createElement("b", { style: { fontFamily: "var(--cb-font-mono)", color: "var(--cb-txt1)" } }, branch), loading ? /* @__PURE__ */ React.createElement(OpsSkel, { w: 64, h: 14 }) : /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)" } }, refSha)), extra && (loading ? /* @__PURE__ */ React.createElement(OpsSkel, { w: "90%", h: mobile ? 119 : 46, style: { marginTop: 14 } }) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, fontSize: 13.5, color: "var(--cb-txt2)", lineHeight: 1.45 } }, extra)));
}
function CBOpsDeploy({ lang = "fr", dark = false, mobile = false, scn = "ok", offline }) {
  const t = opsT(lang);
  const m = opsMock(scn);
  const warn = scn === "warn", unk = scn === "unk";
  const down = scn === "bad";
  const load = m.pend.versions;
  const cmpOk = t("ver.upToDate");
  const backCmp = down ? t("st.unk") : unk ? t("err.source") : warn ? t("ver.behind") : cmpOk;
  const backS = unk || down ? "unk" : warn ? "warn" : "ok";
  const branch = "main";
  const backSha = warn ? "a3c91e0" : "f9fd883", opsSha = "d5092e7";
  const mono = { color: "var(--cb-txt1)", fontFamily: "var(--cb-font-mono)" };
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "deploy", offline }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--cb-txt2)" } }, t("deploy.compare"), " \xB7 GitHub"), unk && /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", compact: true, src: "GitHub", title: t("deploy.ghUnk") }), down ? /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 14px", fontSize: 18, fontWeight: 700 } }, t("ver.backend")), /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", compact: true, src: "Backend", title: t("ver.unkBackend") })) : /* @__PURE__ */ React.createElement(OpsDeployCard, { lang, mobile, loading: load, k: "ver.backend", version: "1.0.0", tag: "v1.0.0", sha: backSha, built: warn ? t("deploy.builtWarn") : t("deploy.builtOk"), cmp: backCmp, cmpS: backS, branch, refSha: unk ? "\u2014" : warn ? "c41d7aa" : backSha }), /* @__PURE__ */ React.createElement(OpsDeployCard, { lang, mobile, loading: load, k: "ver.ops", version: "1.0.0", tag: "v1.0.0", sha: opsSha, built: t("deploy.builtOk"), cmp: unk ? t("err.source") : cmpOk, cmpS: unk ? "unk" : "ok", branch, refSha: unk ? "\u2014" : opsSha }), m.storeDown ? /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 14px", fontSize: 18, fontWeight: 700 } }, t("ver.mobile")), /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "App Store" })) : /* @__PURE__ */ React.createElement(
    OpsDeployCard,
    {
      lang,
      mobile,
      loading: load,
      k: "ver.mobile",
      version: "1.0.0",
      tag: t("ver.store"),
      sha: null,
      built: null,
      cmp: t("ver.waitStore"),
      cmpS: "ok",
      extra: /* @__PURE__ */ React.createElement(React.Fragment, null, t("deploy.published"), " : ", /* @__PURE__ */ React.createElement("b", { style: mono }, "1.0.0"), " \xB7 ", t("deploy.inMain"), " : ", /* @__PURE__ */ React.createElement("b", { style: mono }, "1.0.1"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6 } }, t("ver.mobileHint")))
    }
  ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, fontSize: 12.5, color: "var(--cb-txt2)", lineHeight: 1.45 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 15 }), t("ver.releaseHint"))));
}
Object.assign(window, { CBOpsHealth, CBOpsDeploy });
opsAdd([
  ["v1.duration", "Dur\xE9e", "Duration"],
  ["v1.d1", "1 mois", "1 month"],
  ["v1.d3", "3 mois", "3 months"],
  ["v1.d12", "1 an", "1 year"],
  ["v1.until", "Acc\xE8s offert jusqu\u2019au 16 f\xE9vrier 2027", "Access granted until February 16, 2027"],
  ["v1.notFound", "Aucun compte avec cette adresse", "No account with this address"],
  ["v1.notFoundSub", "La recherche porte sur l\u2019adresse exacte. V\xE9rifiez l\u2019orthographe : aucune suggestion n\u2019est propos\xE9e.", "The search matches the exact address. Check the spelling: no suggestion is offered."],
  ["v1.premiumApple", "Premium (abonnement Apple, renouvellement le 2 d\xE9c. 2026)", "Premium (Apple subscription, renews Dec 2, 2026)"],
  ["v1.appleBlock", "Ce compte a d\xE9j\xE0 un abonnement Apple actif. Un acc\xE8s offert ne peut pas le remplacer.", "This account already has an active Apple subscription. A granted access cannot replace it."]
]);
function OpsKpi({ lang, label, value, sub, loading, delta, spark, tall, mobile }) {
  const t = opsT(lang);
  if (loading) return /* @__PURE__ */ React.createElement(OpsCard, { as: "div", busy: t("state.loading"), style: { padding: 16 } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: "55%", h: mobile ? 23 : 13 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "40%", h: 35, r: 8, style: { marginTop: 8 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "50%", h: 15, style: { marginTop: 8 } }), tall && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsSkel, { w: "60%", h: 14, style: { marginTop: 6 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 96, h: 24, style: { marginTop: 6 } })));
  return /* @__PURE__ */ React.createElement(OpsCard, { as: "div", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 34, fontWeight: 700, letterSpacing: -0.8, marginTop: 8, lineHeight: 1.05 } }, value), delta && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, marginTop: 8, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ops-ok)" } }, "\u25B2 ", delta), " ", t("kpi.vs7")), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "var(--cb-txt2)", marginTop: 6 } }, sub), spark && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement(OpsSpark, { vals: spark, w: 96, h: 24 }), t("trend.14d")));
}
function CBOpsUsers({ lang = "fr", dark = false, mobile = false, scn = "ok", tab: tab0 = "users", range: range0 = 30, offline }) {
  const t = opsT(lang);
  const [tab, setTab] = React.useState(tab0);
  const [range, setRange] = React.useState(String(range0));
  const m = opsMock(scn);
  const down = scn === "bad";
  const fmt = (n) => n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
  const vals = opsSeries(tab, Number(range));
  const k = [
    [t("users.title"), fmt(m.users), null, "+23"],
    [t("kpi.active30"), "97", null, "+11"],
    [t("kpi.anonPerm"), "121 \xB7 63", null, "+14 \xB7 +9"],
    [t("kpi.subs"), "9", null, "+2"],
    [t("kpi.trial"), "4", null, "+1"],
    [t("kpi.checks"), "212", `${t("kpi.avg7")} : 187`, "+25", opsSeries("usage", 14)]
  ];
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "users", offline }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, down ? /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "source", src: "Backend", title: t("err.backend"), sub: t("err.backendSub") })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12 } }, k.map(([l, v, s, d, sp], i) => /* @__PURE__ */ React.createElement(OpsKpi, { key: i, lang, label: l, value: m.empty ? "0" : v, sub: m.empty ? null : s, delta: m.empty ? null : d, spark: m.empty ? null : sp, tall: !!sp, mobile, loading: m.pend.users }))), /* @__PURE__ */ React.createElement(OpsCard, { busy: m.pend.users ? t("state.loading") : void 0 }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" } }, tab === "users" ? t("chart.users") : t("chart.usage"), !m.pend.users && /* @__PURE__ */ React.createElement(OpsStamp, { lang, src: "Backend" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OpsSegmented, { label: t("chart.series"), small: true, mobile, value: tab, onChange: setTab, options: [["users", t("chart.users")], ["usage", t("chart.usage")]] }), /* @__PURE__ */ React.createElement(OpsSegmented, { label: t("chart.period"), small: true, mobile, value: range, onChange: setRange, options: [["30", t("chart.d30")], ["90", t("chart.d90")]] }))), m.pend.users ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(OpsSkel, { h: mobile ? 160 : 210, r: 12, style: { marginTop: 16 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "70%", h: mobile ? 24 : 14, style: { marginTop: 10 } })) : m.empty ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "empty", title: t("empty.title"), sub: t("empty.sub"), style: { marginTop: 16 } }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement(OpsChart, { vals, h: mobile ? 160 : 210, lang, summary: opsChartSummary(t, tab, vals) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 10, fontSize: 12, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 14 }), t("chart.note"))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, fontSize: 12.5, color: "var(--cb-txt2)", alignItems: "center", padding: "0 4px" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "lock", size: 14 }), t("kpi.privacy"))));
}
function CBOpsGrantV1({ lang = "fr", dark = false, mobile = false, step = "result" }) {
  const t = opsT(lang);
  const Btn = ({ children, primary, full, loading }) => /* @__PURE__ */ React.createElement("button", { type: "button", disabled: loading, "aria-busy": loading ? "true" : void 0, style: { height: 44, padding: "0 20px", borderRadius: 12, border: primary ? "none" : "1px solid var(--cb-bord)", background: primary ? "var(--cb-cta)" : "var(--cb-surf)", color: primary ? "var(--cb-cta-ink)" : "var(--cb-txt1)", fontFamily: "var(--cb-font)", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.75 : 1, width: full ? "100%" : void 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 } }, loading && /* @__PURE__ */ React.createElement(OpsSpinner, null), children);
  const audit = [
    ["16 nov., 14:30", lang === "fr" ? "Recherche d\u2019un compte" : "Account lookup", "a1f3\u20269c2e"],
    ["16 nov., 14:31", lang === "fr" ? "Premium offert jusqu\u2019au 16 f\xE9vr. 2027" : "Premium granted until Feb 16, 2027", "a1f3\u20269c2e"]
  ];
  const nf = step === "notfound", apple = step === "apple", srch = step === "searching";
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "users", bare: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "var(--cb-acc-soft)", color: "var(--cb-txt1)", border: "1px solid var(--cb-acc-glow)" } }, t("v1.badge")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: "var(--cb-txt2)" } }, t("v1.noList"))), /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 14px", fontSize: 18, fontWeight: 700 } }, t("v1.title")), /* @__PURE__ */ React.createElement("label", { htmlFor: "v1-email", style: { display: "block", marginBottom: 6 } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, t("v1.search"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexDirection: mobile ? "column" : "row" } }, /* @__PURE__ */ React.createElement("input", { id: "v1-email", disabled: srch, defaultValue: nf ? "alex@exemple.co" : "alex@example.com", style: { flex: 1, height: 44, borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-bg)", color: "var(--cb-txt1)", padding: "0 14px", fontFamily: "var(--cb-font)", fontSize: 15, boxSizing: "border-box" } }), /* @__PURE__ */ React.createElement(Btn, { primary: true, loading: srch }, srch ? t("v1.searching") : t("v1.find"))), srch ? /* @__PURE__ */ React.createElement("div", { "aria-busy": "true", style: { marginTop: 16, padding: 16, borderRadius: 14, background: "var(--cb-bg)", border: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("span", { className: "ops-sr" }, t("state.loading")), /* @__PURE__ */ React.createElement(OpsSkel, { w: 150, h: 20 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "70%", h: 17, style: { marginTop: 12 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 220, h: 34, r: 999, style: { marginTop: 22 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "45%", h: 17, style: { marginTop: 8 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 160, h: 44, r: 12, style: { marginTop: 14 } })) : nf ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "empty", compact: true, title: t("v1.notFound"), sub: t("v1.notFoundSub"), style: { marginTop: 16 } }) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, padding: 16, borderRadius: 14, background: "var(--cb-bg)", border: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "check", size: 18, color: "var(--ops-ok)", sw: 2 }), t("v1.result")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "6px 28px", marginTop: 12, flexWrap: "wrap", fontSize: 13.5, color: "var(--cb-txt2)" } }, /* @__PURE__ */ React.createElement("span", null, t("v1.plan"), " : ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--cb-txt1)" } }, apple ? t("v1.premiumApple") : t("v1.free"))), /* @__PURE__ */ React.createElement("span", null, lang === "fr" ? "Compte permanent, cr\xE9\xE9 le 3 nov. 2026" : "Permanent account, created Nov 3, 2026")), apple ? /* @__PURE__ */ React.createElement("div", { role: "status", style: { marginTop: 14, padding: "11px 14px", borderRadius: 12, background: "var(--cb-medium-soft)", color: "var(--ops-warn)", fontSize: 13.5, fontWeight: 600, display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "alert", size: 18, color: "var(--ops-warn)", sw: 2 }), t("v1.appleBlock")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement(OpsEyebrow, { style: { marginBottom: 6 } }, t("v1.duration")), /* @__PURE__ */ React.createElement(OpsSegmented, { label: t("v1.duration"), small: mobile, value: "3", options: [["1", t("v1.d1")], ["3", t("v1.d3")], ["12", t("v1.d12")]] })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "var(--cb-txt2)", marginTop: 8 } }, t("v1.until")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement(Btn, { primary: true }, t("v1.grant")))))), /* @__PURE__ */ React.createElement(OpsCard, null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 8px", fontSize: 18, fontWeight: 700 } }, t("v1.audit")), audit.map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--cb-bord)" : "0", fontSize: 13.5, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--cb-txt2)", minWidth: 110 } }, a[0]), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, a[1]), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--cb-font-mono)", color: "var(--cb-txt2)" } }, a[2])))), step === "confirm" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: -4, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 } }, /* @__PURE__ */ React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": t("v1.title"), style: { width: mobile ? "92%" : 440, background: "var(--cb-surf)", border: "1px solid var(--cb-bord)", borderRadius: 18, padding: 22, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.5)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 700, lineHeight: 1.3 } }, t("v1.confirm")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: "var(--cb-txt2)", marginTop: 8 } }, t("v1.confirmSub")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement(Btn, null, t("v1.cancel")), /* @__PURE__ */ React.createElement(Btn, { primary: true }, t("v1.grant")))))));
}
Object.assign(window, { CBOpsUsers, CBOpsGrantV1 });
function OpsLoginField({ id, label, type, val = "", disabled, invalid, describedBy }) {
  const input = { width: "100%", height: 48, borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-bg)", color: "var(--cb-txt1)", padding: "0 14px", fontFamily: "var(--cb-font)", fontSize: 15, boxSizing: "border-box" };
  return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: id, style: { display: "block", marginBottom: 6 } }, /* @__PURE__ */ React.createElement(OpsEyebrow, null, label)), /* @__PURE__ */ React.createElement("input", { id, type, defaultValue: val, disabled, "aria-invalid": invalid ? "true" : void 0, "aria-describedby": describedBy, autoComplete: type === "password" ? "current-password" : "email", style: { ...input, opacity: disabled ? 0.7 : 1, borderColor: invalid ? "var(--ops-bad)" : "var(--cb-bord)" } }));
}
function CBOpsLogin({ lang = "fr", dark = false, mobile = false, mode = "login", busy: busyProp }) {
  const t = opsT(lang);
  const o = useOps();
  const denied = mode === "denied";
  const busy = busyProp != null ? busyProp : o.busy;
  const invalid = mode === "invalid";
  const keep = invalid || busyProp;
  return /* @__PURE__ */ React.createElement("div", { "data-theme": dark ? "dark" : "light", style: { position: "relative", width: "100%", height: "100%", background: "var(--cb-bg)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? 20 : 40, boxSizing: "border-box", overflow: "hidden", ...opsVars(dark) } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 420 } }, /* @__PURE__ */ React.createElement("main", { style: { width: "100%", background: "var(--cb-surf)", border: "1px solid var(--cb-bord)", borderRadius: 22, padding: mobile ? "30px 22px" : "40px 38px", boxSizing: "border-box", boxShadow: "var(--cb-card-shadow)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 26 } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { width: 40, height: 40, borderRadius: 12, background: "var(--cb-acc-soft)", border: "1px solid var(--cb-acc-glow)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "mountain", size: 22, color: "var(--cb-acc1)" })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 600 } }, "Cloudbreak")), denied ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "lock", size: 24, color: "var(--cb-txt2)", sw: 1.8 }), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: -0.3 } }, t("denied.title"))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, color: "var(--cb-txt2)", margin: "12px 0 26px", lineHeight: 1.45 } }, t("denied.sub")), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: o.signOut, style: { width: "100%", height: 48, borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, t("denied.out"))) : /* @__PURE__ */ React.createElement("form", { onSubmit: (e) => {
    e.preventDefault();
    o.signIn();
  } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: -0.4 } }, t("login.title")), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14.5, color: "var(--cb-txt2)", margin: "8px 0 22px" } }, t("login.sub")), mode === "expired" && /* @__PURE__ */ React.createElement("div", { role: "status", style: { display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: 12, background: "var(--cb-medium-soft)", color: "var(--ops-warn)", fontSize: 13.5, fontWeight: 600, marginBottom: 18 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "alert", size: 18, color: "var(--ops-warn)", sw: 2 }), t("login.expired")), mode === "unreachable" && /* @__PURE__ */ React.createElement("div", { role: "alert", style: { display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 14px", borderRadius: 12, background: "var(--cb-none-soft)", color: "var(--cb-txt1)", fontSize: 13.5, fontWeight: 600, marginBottom: 18, lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "help", size: 18, color: "var(--ops-unk)", sw: 2 }), t("login.unreachable")), /* @__PURE__ */ React.createElement(OpsLoginField, { id: "l-email", label: t("login.email"), type: "email", val: keep ? "alex@example.com" : "", disabled: busy, invalid, describedBy: invalid ? "l-err" : void 0 }), /* @__PURE__ */ React.createElement(OpsLoginField, { id: "l-pwd", label: t("login.pwd"), type: "password", val: keep ? "motdepasse" : "", disabled: busy, invalid, describedBy: invalid ? "l-err" : void 0 }), invalid && /* @__PURE__ */ React.createElement("div", { id: "l-err", role: "alert", style: { display: "flex", gap: 8, alignItems: "center", color: "var(--ops-bad)", fontSize: 13.5, fontWeight: 600, margin: "-4px 0 14px" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "xcircle", size: 16, color: "var(--ops-bad)", sw: 2 }), t("login.invalid")), /* @__PURE__ */ React.createElement("button", { type: "submit", disabled: busy, "aria-busy": busy ? "true" : void 0, style: { width: "100%", height: 48, borderRadius: 12, border: "none", background: "var(--cb-cta)", color: "var(--cb-cta-ink)", fontFamily: "var(--cb-font)", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.75 : 1, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 } }, busy && /* @__PURE__ */ React.createElement(OpsSpinner, { size: 18 }), busy ? t("login.busy") : t("login.cta")))), /* @__PURE__ */ React.createElement(OpsLegalLinks, { lang, style: { justifyContent: "center", marginTop: 14, fontSize: 12.5, color: "var(--cb-txt2)", gap: 8 }, linkStyle: { display: "inline-flex", alignItems: "center", minHeight: 40, padding: "0 6px", color: "var(--cb-txt2)" } })), /* @__PURE__ */ React.createElement(OpsToasts, { lang, mobile, top: 16, bottom: 16 }));
}
Object.assign(window, { CBOpsLogin });
opsAdd([
  ["legal.brand", "Cloudbreak", "Cloudbreak"],
  ["legal.back", "Retour \xE0 la console", "Back to the console"],
  ["legal.updated", "Derni\xE8re mise \xE0 jour : 16 novembre 2026", "Last updated: November 16, 2026"],
  ["legal.sample", "Contenu d\u2019exemple : ce texte n\u2019a aucune valeur juridique.", "Sample content: this text has no legal value."],
  ["lg.cgu.title", "Conditions g\xE9n\xE9rales d\u2019utilisation", "Terms of use"],
  ["lg.cgu.s1.h", "Objet", "Purpose"],
  ["lg.cgu.s1.p", "Ce paragraphe pr\xE9sente en quelques phrases l\u2019objet du service et \xE0 qui il s\u2019adresse. Il sera remplac\xE9 par le texte d\xE9finitif.", "This paragraph briefly describes the purpose of the service and who it is for. It will be replaced by the final text."],
  ["lg.cgu.s2.h", "Acc\xE8s au service", "Access to the service"],
  ["lg.cgu.s2.p", "Ce paragraphe explique comment on acc\xE8de au service, avec ou sans compte, et ce que cela change. Texte provisoire.", "This paragraph explains how the service is accessed, with or without an account, and what changes. Placeholder text."],
  ["lg.cgu.s3.h", "Abonnement et paiement", "Subscription and payment"],
  ["lg.cgu.s3.p", "Ce paragraphe d\xE9crit les formules propos\xE9es et la fa\xE7on de les g\xE9rer. Les montants et les conditions r\xE9els y figureront.", "This paragraph describes the plans offered and how to manage them. The actual amounts and conditions will appear here."],
  ["lg.cgu.s4.h", "Responsabilit\xE9", "Liability"],
  ["lg.cgu.s4.p", "Ce paragraphe rappelle les limites de l\u2019estimation fournie par l\u2019application. Texte provisoire, \xE0 remplacer.", "This paragraph recalls the limits of the estimate provided by the app. Placeholder text, to be replaced."],
  ["lg.privacy.title", "Politique de confidentialit\xE9", "Privacy policy"],
  ["lg.privacy.s1.h", "Donn\xE9es collect\xE9es", "Data collected"],
  ["lg.privacy.s1.p", "Ce paragraphe liste en quelques phrases les donn\xE9es utiles au fonctionnement du service. Il sera remplac\xE9 par le texte d\xE9finitif.", "This paragraph briefly lists the data needed to run the service. It will be replaced by the final text."],
  ["lg.privacy.s2.h", "Utilisation des donn\xE9es", "How data is used"],
  ["lg.privacy.s2.p", "Ce paragraphe explique \xE0 quoi servent ces donn\xE9es et ce qui n\u2019est jamais fait avec elles. Texte provisoire.", "This paragraph explains what the data is used for and what is never done with it. Placeholder text."],
  ["lg.privacy.s3.h", "Conservation et suppression", "Retention and deletion"],
  ["lg.privacy.s3.p", "Ce paragraphe indique combien de temps les donn\xE9es sont gard\xE9es et comment demander leur suppression.", "This paragraph states how long data is kept and how to request its deletion."],
  ["lg.privacy.s4.h", "Vos droits", "Your rights"],
  ["lg.privacy.s4.p", "Ce paragraphe d\xE9taille les droits des utilisateurs et la mani\xE8re de les exercer. Texte provisoire, \xE0 remplacer.", "This paragraph details users\u2019 rights and how to exercise them. Placeholder text, to be replaced."]
]);
function CBOpsLegal({ lang = "fr", dark = false, mobile = false, page = "cgu", signedIn = false }) {
  const t = opsT(lang);
  const o = useOps();
  const secs = [1, 2, 3, 4].map((n) => [`lg.${page}.s${n}.h`, `lg.${page}.s${n}.p`]);
  const px = mobile ? 16 : 40;
  const btn = { height: mobile ? 44 : 40, padding: "0 14px", borderRadius: 12, border: "1px solid var(--cb-bord)", background: "var(--cb-surf)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
  return /* @__PURE__ */ React.createElement("div", { "data-theme": dark ? "dark" : "light", style: { position: "relative", width: "100%", height: "100%", background: "var(--cb-bg)", color: "var(--cb-txt1)", fontFamily: "var(--cb-font)", overflow: "hidden", ...opsVars(dark) } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", overflow: "auto", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("header", { style: { flexShrink: 0, padding: `14px ${px}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: "1px solid var(--cb-bord)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { width: 36, height: 36, borderRadius: 11, background: "var(--cb-acc-soft)", border: "1px solid var(--cb-acc-glow)", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "mountain", size: 20, color: "var(--cb-acc1)" })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 600 } }, t("legal.brand"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, signedIn && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => o.go("home"), style: btn }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "home", size: 16 }), t("legal.back")), /* @__PURE__ */ React.createElement(OpsIconBtn, { name: dark ? "sun" : "moon", size: mobile ? 44 : 40, label: t("hdr.theme"), onClick: () => o.setDark(!dark) }))), /* @__PURE__ */ React.createElement("main", { style: { flex: 1, width: "100%", maxWidth: 760, margin: "0 auto", boxSizing: "border-box", padding: mobile ? "28px 16px 20px" : "48px 40px 32px" } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: mobile ? 28 : 36, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.15 } }, t(`lg.${page}.title`)), /* @__PURE__ */ React.createElement("p", { style: { margin: "10px 0 0", fontSize: 14, color: "var(--cb-txt2)" } }, t("legal.updated")), /* @__PURE__ */ React.createElement("div", { role: "note", style: { display: "inline-flex", alignItems: "center", gap: 8, margin: "16px 0 8px", padding: "8px 12px", borderRadius: 12, background: "var(--cb-acc-soft)", border: "1px solid var(--cb-acc-glow)", fontSize: 13, fontWeight: 600 } }, /* @__PURE__ */ React.createElement(OpsGlyph, { name: "info", size: 16, color: "var(--cb-acc1)", sw: 2 }), t("legal.sample")), secs.map(([h, p]) => /* @__PURE__ */ React.createElement("section", { key: h, style: { marginTop: 26 } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: 0, fontSize: 20, fontWeight: 700 } }, t(h)), /* @__PURE__ */ React.createElement("p", { style: { margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.6, color: "var(--cb-txt2)" } }, t(p))))), /* @__PURE__ */ React.createElement("footer", { style: { flexShrink: 0, padding: `10px ${px}px 18px`, borderTop: "1px solid var(--cb-bord)", marginTop: 24 } }, /* @__PURE__ */ React.createElement(OpsLegalLinks, { lang, current: page, style: { gap: 10, fontSize: 14, color: "var(--cb-txt2)" }, linkStyle: { display: "inline-flex", alignItems: "center", minHeight: 44, color: "var(--cb-txt1)" } }))), /* @__PURE__ */ React.createElement(OpsToasts, { lang, mobile, top: 72, bottom: 16 }));
}
Object.assign(window, { CBOpsLegal });
function CBOpsError({ lang = "fr", dark = false, mobile = false, kind = "crash" }) {
  const t = opsT(lang);
  const o = useOps();
  const crash = kind === "crash";
  const homeBtn = /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => o.go("home"), style: { marginTop: 10, marginLeft: crash ? 8 : 0, height: 40, padding: "0 16px", borderRadius: 10, border: crash ? "1px solid var(--cb-bord)" : "none", background: crash ? "var(--cb-surf)" : "var(--cb-cta)", color: crash ? "var(--cb-txt1)" : "var(--cb-cta-ink)", fontFamily: "var(--cb-font)", fontSize: 13, fontWeight: 600, cursor: "pointer" } }, t("err.home"));
  return /* @__PURE__ */ React.createElement(OpsFrame, { lang, dark, mobile, active: "home", bare: true, title: t("err.heading") }, o.errLoading ? /* @__PURE__ */ React.createElement(OpsCard, { busy: t("state.loading"), style: { maxWidth: 560, margin: mobile ? "12px 0" : "40px auto", padding: 16 } }, /* @__PURE__ */ React.createElement(OpsSkel, { w: "55%", h: 18 }), /* @__PURE__ */ React.createElement(OpsSkel, { w: "90%", h: 12, style: { marginTop: 12 } }), /* @__PURE__ */ React.createElement(OpsSkel, { w: 140, h: 40, r: 10, style: { marginTop: 16 } })) : /* @__PURE__ */ React.createElement(OpsCard, { style: { maxWidth: 560, margin: mobile ? "12px 0" : "40px auto" } }, crash ? /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "error", title: t("err.crashTitle"), sub: t("err.crashSub"), onRetry: o.retryErr || o.refresh, style: { padding: 0, background: "transparent" } }, homeBtn) : /* @__PURE__ */ React.createElement(OpsState, { lang, kind: "empty", title: t("err.nfTitle"), sub: t("err.nfSub"), style: { border: "none", padding: "8px 0" } }, homeBtn)));
}
Object.assign(window, { CBOpsError });
const OPS_CONSOLE_ROUTES = ["home", "health", "deploy", "users"];
const OPS_PROTO_SCN = [
  ["ok", "Tout va bien", "All good"],
  ["warn", "D\xE9grad\xE9", "Degraded"],
  ["bad", "Panne de l\u2019API", "API down"],
  ["unk", "BetterStack injoignable", "BetterStack unreachable"],
  ["cron", "Cron en \xE9chec", "Cron failing"],
  ["empty", "\xC9tat vide", "Empty state"],
  ["partial", "Chargement partiel", "Partial loading"],
  ["store", "App Store injoignable", "App Store unreachable"],
  ["offline", "Hors connexion", "Offline"],
  ["crash", "Erreur inattendue", "Unexpected error"],
  ["notfound", "Page introuvable", "Page not found"]
];
function ProtoSeg({ label, value, options, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": label, className: "seg" }, options.map(([id, text]) => /* @__PURE__ */ React.createElement("button", { key: id, type: "button", "aria-pressed": id === value, onClick: () => onChange(id) }, text)));
}
function CBOpsProto({ lang: lang0 = "fr" }) {
  const [route, setRoute] = React.useState("login");
  const [signedIn, setSignedIn] = React.useState(false);
  const [acct, setAcct] = React.useState("admin");
  const [loginErr, setLoginErr] = React.useState(null);
  const [firstLoad, setFirstLoad] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [lang, setLang] = React.useState(lang0);
  const [scn, setScn] = React.useState("ok");
  const [device, setDevice] = React.useState("desktop");
  const [toasts, setToasts] = React.useState([]);
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [signing, setSigning] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [avail, setAvail] = React.useState(0);
  const [errLoading, setErrLoading] = React.useState(false);
  const wrapRef = React.useRef(null);
  const live = React.useRef({});
  const admin = acct === "admin";
  live.current = { admin, acct, signedIn, loading, signing, scn };
  const seen = React.useRef({});
  const loadTok = React.useRef(0);
  const timers = React.useRef([]);
  const seq = React.useRef(0);
  const retrying = React.useRef(false);
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };
  React.useEffect(() => () => {
    timers.current.forEach(clearTimeout);
  }, []);
  React.useEffect(() => {
    setLang(lang0);
  }, [lang0]);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return void 0;
    setAvail(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return void 0;
    const ro = new ResizeObserver((entries) => {
      setAvail(Math.round(entries[0].contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const dismiss = (id) => setToasts((l) => l.filter((x) => x.id !== id));
  const toast = (kind, key, vars) => {
    const id = ++seq.current;
    setToasts((l) => [...l.slice(-3), { id, kind, key, vars }]);
    later(() => dismiss(id), 4e3);
  };
  const visit = (r) => {
    const tok = ++loadTok.current;
    if (seen.current[r]) {
      setFirstLoad(false);
      return;
    }
    seen.current[r] = true;
    setFirstLoad(true);
    later(() => {
      if (loadTok.current === tok) setFirstLoad(false);
    }, 500);
  };
  const go = (r) => {
    const L = live.current;
    setPrefsOpen(false);
    if (L.scn === "crash" || L.scn === "notfound") {
      setScn("ok");
      setErrLoading(false);
    }
    if (OPS_CONSOLE_ROUTES.includes(r)) r = !L.signedIn ? "login" : !L.admin ? "denied" : r;
    if (OPS_CONSOLE_ROUTES.includes(r)) visit(r);
    setRoute(r);
  };
  const signIn = () => {
    if (live.current.signing) return;
    setSigning(true);
    setLoginErr(null);
    later(() => {
      setSigning(false);
      const a = live.current.acct;
      if (a === "invalid" || a === "down") {
        setLoginErr(a === "invalid" ? "invalid" : "unreachable");
        return;
      }
      setSignedIn(true);
      setExpired(false);
      seen.current = {};
      if (a === "admin") {
        visit("home");
        setRoute("home");
        toast("success", "toast.login");
      } else setRoute("denied");
    }, 600);
  };
  const signOut = () => {
    setSignedIn(false);
    setExpired(false);
    setLoginErr(null);
    setPrefsOpen(false);
    setRoute("login");
    toast("info", "toast.signout");
  };
  const refresh = () => {
    if (live.current.scn === "crash" || live.current.scn === "notfound") return retryErr();
    if (live.current.loading) return;
    setLoading(true);
    later(() => {
      setLoading(false);
      toast("success", "toast.refreshed");
    }, 900);
  };
  const retry = () => {
    if (retrying.current) return;
    retrying.current = true;
    later(() => {
      retrying.current = false;
      toast("error", "toast.retryFail");
    }, 700);
  };
  const retryErr = () => {
    if (retrying.current) return;
    retrying.current = true;
    setErrLoading(true);
    later(() => {
      retrying.current = false;
      setErrLoading(false);
      toast("error", "toast.retryFail");
    }, 700);
  };
  const openExternal = (name) => toast("info", "toast.external", { name });
  const expire = () => {
    setSignedIn(false);
    setExpired(true);
    setLoginErr(null);
    setPrefsOpen(false);
    setRoute("login");
  };
  const backToLogin = () => {
    setSignedIn(false);
    setExpired(false);
    setLoginErr(null);
    setPrefsOpen(false);
    setRoute("login");
  };
  const pickDevice = (d) => {
    setPrefsOpen(false);
    setDevice(d);
  };
  const ctx = { go, toast, openExternal, refresh, signOut, signIn, retry, retryErr, errLoading, dismiss, setLang, setDark, openPrefs: () => setPrefsOpen(true), closePrefs: () => setPrefsOpen(false), prefsOpen, toasts, busy: signing, offline: scn === "offline" };
  const mobile = device === "mobile";
  const eff = loading || firstLoad ? "load" : scn === "offline" ? "ok" : scn;
  const c = { lang, dark, mobile };
  let page;
  const errScn = signedIn && admin && OPS_CONSOLE_ROUTES.includes(route) && (scn === "crash" || scn === "notfound");
  if (errScn) page = /* @__PURE__ */ React.createElement(CBOpsError, { key: "err-" + scn, ...c, kind: scn === "crash" ? "crash" : "notfound" });
  else if (route === "login") page = /* @__PURE__ */ React.createElement(CBOpsLogin, { key: "login", ...c, mode: expired ? "expired" : loginErr || "login" });
  else if (route === "denied") page = /* @__PURE__ */ React.createElement(CBOpsLogin, { key: "denied", ...c, mode: "denied" });
  else if (route === "home") page = /* @__PURE__ */ React.createElement(CBOpsHome, { key: "home", ...c, scn: eff });
  else if (route === "health") page = /* @__PURE__ */ React.createElement(CBOpsHealth, { key: "health", ...c, scn: eff });
  else if (route === "deploy") page = /* @__PURE__ */ React.createElement(CBOpsDeploy, { key: "deploy", ...c, scn: eff });
  else if (route === "users") page = /* @__PURE__ */ React.createElement(CBOpsUsers, { key: "users", ...c, scn: eff });
  else page = /* @__PURE__ */ React.createElement(CBOpsLegal, { key: route, ...c, page: route, signedIn: signedIn && admin });
  const fr = lang === "fr";
  const [W, H] = mobile ? [390, 844] : [1440, 900];
  const z = avail ? Math.min(1, avail / W) : 1;
  const group = { display: "flex", flexDirection: "column", gap: 6 };
  const lab = { fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: 0.3 };
  const btn = { height: 34, padding: "0 14px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--fg)", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" };
  return /* @__PURE__ */ React.createElement("div", { ref: wrapRef, style: { display: "flex", flexDirection: "column", gap: 16, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": fr ? "R\xE9glages de d\xE9mo" : "Demo settings", style: { border: "1px dashed var(--line)", borderRadius: 14, padding: "12px 16px", background: "var(--panel)", display: "flex", flexWrap: "wrap", gap: "12px 24px", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { flexBasis: "100%", fontSize: 13, fontWeight: 700 } }, fr ? "R\xE9glages de d\xE9mo (hors maquette)" : "Demo settings (not part of the mockup)"), /* @__PURE__ */ React.createElement("div", { style: group }, /* @__PURE__ */ React.createElement("span", { style: lab }, fr ? "Appareil" : "Device"), /* @__PURE__ */ React.createElement(ProtoSeg, { label: fr ? "Appareil" : "Device", value: device, onChange: pickDevice, options: [["desktop", "Desktop"], ["mobile", "Mobile"]] })), /* @__PURE__ */ React.createElement("div", { style: group }, /* @__PURE__ */ React.createElement("span", { style: lab }, /* @__PURE__ */ React.createElement("label", { htmlFor: "proto-scn" }, fr ? "Simuler" : "Simulate")), /* @__PURE__ */ React.createElement("select", { id: "proto-scn", value: scn, onChange: (e) => setScn(e.target.value), style: { ...btn, paddingRight: 8 } }, OPS_PROTO_SCN.map(([id, f, e]) => /* @__PURE__ */ React.createElement("option", { key: id, value: id }, fr ? f : e)))), /* @__PURE__ */ React.createElement("div", { style: group }, /* @__PURE__ */ React.createElement("span", { style: lab }, fr ? "Compte (\xE0 la prochaine connexion)" : "Account (at next sign-in)"), /* @__PURE__ */ React.createElement(ProtoSeg, { label: fr ? "Compte" : "Account", value: acct, onChange: setAcct, options: [["admin", "Admin"], ["none", fr ? "Sans droit admin" : "Not an admin"], ["invalid", fr ? "Identifiants incorrects" : "Wrong credentials"], ["down", fr ? "Service injoignable" : "Service unreachable"]] })), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: !signedIn, onClick: expire, style: { ...btn, opacity: signedIn ? 1 : 0.5 } }, fr ? "Expirer la session" : "Expire the session"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: backToLogin, style: btn }, fr ? "Revenir \xE0 la connexion" : "Back to sign-in")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: Math.round(W * z), height: Math.round(H * z), overflow: "hidden", borderRadius: mobile ? 28 : 14, border: "1px solid var(--line)", boxShadow: "0 10px 30px -20px rgba(0,0,0,0.4)", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: W, height: H, transform: `scale(${z})`, transformOrigin: "top left" } }, /* @__PURE__ */ React.createElement(OpsCtx.Provider, { value: ctx }, page)))));
}
Object.assign(window, { CBOpsProto });
const { useState, useEffect } = React;
const D = 1440, M = 390;
const TOASTS = [
  { id: 1, kind: "success", key: "toast.login" },
  { id: 2, kind: "error", key: "toast.retryFail" },
  { id: 3, kind: "info", key: "toast.external", vars: { name: "Sentry" } }
];
const SECTIONS = [
  {
    id: "proto",
    fr: "Prototype",
    en: "Prototype",
    subFr: "La console cliquable : connexion, navigation, actualisation (squelettes), toasts, pages l\xE9gales. Les r\xE9glages de d\xE9mo (hors maquette) simulent les pannes, le chargement partiel, le mode hors connexion, l\u2019acc\xE8s refus\xE9 et la session expir\xE9e.",
    subEn: "The clickable console: sign-in, navigation, refresh (skeletons), toasts, legal pages. The demo settings (not part of the mockup) simulate outages, partial loading, offline mode, denied access and an expired session.",
    render: (l) => /* @__PURE__ */ React.createElement(CBOpsProto, { lang: l })
  },
  {
    id: "home",
    fr: "Accueil",
    en: "Home",
    subFr: "Question pos\xE9e : \xAB tout va bien ? \xBB. Banni\xE8re de statut, \xE0 surveiller, 4 pastilles, utilisateurs et courbe, versions en prod, outils externes. Chaque bloc charge, \xE9choue et se vide ind\xE9pendamment.",
    subEn: "The question: \u201Cis everything fine?\u201D. Status banner, watch list, 4 tiles, users and chart, production versions, external tools. Each block loads, fails and empties independently.",
    arts: [
      ["HOME-01", "Desktop clair", "Desktop light", D, 1140, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l })],
      ["HOME-02", "Mobile clair", "Mobile light", M, 1860, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true })],
      ["HOME-03", "Desktop sombre (usage, 90 j)", "Desktop dark (usage, 90 d)", D, 1140, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, dark: true, tab: "usage", range: 90 })],
      ["HOME-04", "Mobile sombre", "Mobile dark", M, 1860, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, dark: true, mobile: true })],
      ["HOME-05", "D\xE9grad\xE9 \xB7 desktop", "Degraded \xB7 desktop", D, 1240, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, scn: "warn" })],
      ["HOME-06", "Panne de l\u2019API \xB7 mobile", "API down \xB7 mobile", M, 2e3, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true, scn: "bad" })],
      ["HOME-07", "BetterStack injoignable \xB7 desktop", "BetterStack unreachable \xB7 desktop", D, 1160, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, scn: "unk" })],
      ["HOME-08", "Chargement \xB7 mobile", "Loading \xB7 mobile", M, 1860, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true, scn: "load" })],
      ["HOME-09", "Chargement partiel \xB7 desktop", "Partial loading \xB7 desktop", D, 1140, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, scn: "partial" })],
      ["HOME-10", "\xC9tat vide \xB7 desktop", "Empty state \xB7 desktop", D, 1120, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, scn: "empty" })],
      ["HOME-11", "Hors connexion \xB7 mobile", "Offline \xB7 mobile", M, 1900, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true, offline: true })]
    ]
  },
  {
    id: "sante",
    fr: "Sant\xE9",
    en: "Health",
    subFr: "Services, crons et sauvegardes, serveur : chaque carte a son squelette et son \xE9tat d\u2019erreur propres.",
    subEn: "Services, crons and backups, server: each card has its own skeleton and error state.",
    arts: [
      ["SAN-01", "Desktop", "Desktop", D, 1060, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l })],
      ["SAN-02", "Mobile d\xE9grad\xE9", "Mobile degraded", M, 1850, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, mobile: true, scn: "warn" })],
      ["SAN-03", "Panne de l\u2019API \xB7 desktop", "API down \xB7 desktop", D, 920, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, scn: "bad" })],
      ["SAN-04", "Cron en retard et en \xE9chec \xB7 desktop", "Late and failed cron \xB7 desktop", D, 1060, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, scn: "cron" })],
      ["SAN-05", "BetterStack injoignable \xB7 desktop", "BetterStack unreachable \xB7 desktop", D, 820, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, scn: "unk" })],
      ["SAN-06", "\xC9tat vide (crons jamais pass\xE9s) \xB7 mobile", "Empty state (crons never ran) \xB7 mobile", M, 1870, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, mobile: true, scn: "empty" })],
      ["SAN-07", "Chargement \xB7 desktop", "Loading \xB7 desktop", D, 1060, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, scn: "load" })],
      ["SAN-08", "Chargement partiel \xB7 mobile", "Partial loading \xB7 mobile", M, 1860, (l) => /* @__PURE__ */ React.createElement(CBOpsHealth, { lang: l, mobile: true, scn: "partial" })]
    ]
  },
  {
    id: "deploy",
    fr: "D\xE9ploiements",
    en: "Deployments",
    subFr: "Versions compar\xE9es \xE0 main, une carte par composant (backend, ops, app mobile).",
    subEn: "Versions compared with main, one card per component (backend, ops, mobile app).",
    arts: [
      ["DEP-01", "Desktop", "Desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l })],
      ["DEP-02", "Mobile en retard", "Mobile behind", M, 1100, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l, mobile: true, scn: "warn" })],
      ["DEP-03", "GitHub injoignable \xB7 desktop", "GitHub unreachable \xB7 desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l, scn: "unk" })],
      ["DEP-04", "Panne de l\u2019API \xB7 mobile", "API down \xB7 mobile", M, 1080, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l, mobile: true, scn: "bad" })],
      ["DEP-05", "Chargement \xB7 desktop", "Loading \xB7 desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l, scn: "load" })],
      ["DEP-06", "App Store injoignable \xB7 mobile", "App Store unreachable \xB7 mobile", M, 1e3, (l) => /* @__PURE__ */ React.createElement(CBOpsDeploy, { lang: l, mobile: true, scn: "store" })]
    ]
  },
  {
    id: "users",
    fr: "Utilisateurs",
    en: "Users",
    subFr: "Chiffres agr\xE9g\xE9s, aucune donn\xE9e personnelle.",
    subEn: "Aggregated figures, no personal data.",
    arts: [
      ["USR-01", "Desktop", "Desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsUsers, { lang: l })],
      ["USR-02", "Mobile sombre", "Mobile dark", M, 1140, (l) => /* @__PURE__ */ React.createElement(CBOpsUsers, { lang: l, dark: true, mobile: true })],
      ["USR-03", "Backend injoignable \xB7 mobile", "Backend unreachable \xB7 mobile", M, 520, (l) => /* @__PURE__ */ React.createElement(CBOpsUsers, { lang: l, mobile: true, scn: "bad" })],
      ["USR-04", "Chargement \xB7 desktop", "Loading \xB7 desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsUsers, { lang: l, scn: "load" })],
      ["USR-05", "\xC9tat vide \xB7 desktop", "Empty state \xB7 desktop", D, 700, (l) => /* @__PURE__ */ React.createElement(CBOpsUsers, { lang: l, scn: "empty" })]
    ]
  },
  {
    id: "frame",
    fr: "Cadre et retours",
    en: "Frame and feedback",
    subFr: "Pr\xE9f\xE9rences mobile, toasts (succ\xE8s, erreur, information), erreur inattendue et page introuvable.",
    subEn: "Mobile preferences, toasts (success, error, information), unexpected error and page not found.",
    arts: [
      ["NAV-01", "Pr\xE9f\xE9rences et d\xE9connexion \xB7 mobile", "Preferences and sign out \xB7 mobile", M, 844, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true, prefs: true })],
      ["TST-01", "Toasts \xB7 desktop", "Toasts \xB7 desktop", D, 900, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, toasts: TOASTS })],
      ["TST-02", "Toasts \xB7 mobile", "Toasts \xB7 mobile", M, 844, (l) => /* @__PURE__ */ React.createElement(CBOpsHome, { lang: l, mobile: true, toasts: TOASTS })],
      ["ERR-01", "Erreur inattendue \xB7 desktop", "Unexpected error \xB7 desktop", D, 400, (l) => /* @__PURE__ */ React.createElement(CBOpsError, { lang: l, kind: "crash" })],
      ["ERR-02", "Page introuvable \xB7 mobile", "Page not found \xB7 mobile", M, 440, (l) => /* @__PURE__ */ React.createElement(CBOpsError, { lang: l, mobile: true, kind: "notfound" })]
    ]
  },
  {
    id: "acces",
    fr: "Acc\xE8s",
    en: "Access",
    subFr: "Connexion (avec les liens l\xE9gaux), session expir\xE9e, acc\xE8s refus\xE9 (neutre, sans nom de console), connexion en cours, identifiants incorrects, service injoignable.",
    subEn: "Sign in (with the legal links), expired session, access denied (neutral, no console name), signing in, wrong credentials, service unreachable.",
    arts: [
      ["ACC-01", "Connexion \xB7 desktop", "Sign in \xB7 desktop", 1280, 800, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l })],
      ["ACC-02", "Session expir\xE9e \xB7 mobile", "Expired session \xB7 mobile", M, 844, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l, mobile: true, mode: "expired" })],
      ["ACC-03", "Acc\xE8s refus\xE9 \xB7 desktop sombre", "Access denied \xB7 desktop dark", 1280, 800, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l, dark: true, mode: "denied" })],
      ["ACC-04", "Connexion en cours \xB7 mobile", "Signing in \xB7 mobile", M, 844, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l, mobile: true, busy: true })],
      ["ACC-05", "Identifiants incorrects \xB7 desktop", "Wrong credentials \xB7 desktop", 1280, 800, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l, mode: "invalid" })],
      ["ACC-06", "Service injoignable \xB7 mobile", "Service unreachable \xB7 mobile", M, 844, (l) => /* @__PURE__ */ React.createElement(CBOpsLogin, { lang: l, mobile: true, mode: "unreachable" })]
    ]
  },
  {
    id: "legal",
    fr: "Pages l\xE9gales",
    en: "Legal pages",
    subFr: "Maquette du site public : \xAB Retour \xE0 la console \xBB seulement si le jeton est valide, sinon aucun indice sur le back-office. Contenu d\u2019exemple.",
    subEn: "Public-site mockup: \u201CBack to the console\u201D only with a valid token, otherwise no hint of the back office. Sample content.",
    arts: [
      ["LEG-01", "CGU \xB7 connect\xE9 \xB7 desktop", "Terms \xB7 signed in \xB7 desktop", 1280, 940, (l) => /* @__PURE__ */ React.createElement(CBOpsLegal, { lang: l, page: "cgu", signedIn: true })],
      ["LEG-02", "Confidentialit\xE9 \xB7 non connect\xE9 \xB7 mobile", "Privacy \xB7 signed out \xB7 mobile", M, 1060, (l) => /* @__PURE__ */ React.createElement(CBOpsLegal, { lang: l, mobile: true, page: "privacy" })]
    ]
  },
  {
    id: "v1",
    fr: "Aper\xE7u v1",
    en: "v1 preview",
    subFr: "Offrir Premium (story 10.5) : hors v0, montr\xE9 pour r\xE9server sa place. Dur\xE9e au choix, recherche en cours, compte introuvable, refus si un abonnement Apple est actif.",
    subEn: "Grant Premium (story 10.5): out of v0, shown to reserve its place. Duration choice, search in progress, account not found, refusal when an Apple subscription is active.",
    arts: [
      ["V1-01", "Offrir Premium \xB7 desktop", "Grant Premium \xB7 desktop", D, 860, (l) => /* @__PURE__ */ React.createElement(CBOpsGrantV1, { lang: l })],
      ["V1-02", "Confirmation \xB7 mobile", "Confirmation \xB7 mobile", M, 930, (l) => /* @__PURE__ */ React.createElement(CBOpsGrantV1, { lang: l, mobile: true, step: "confirm" })],
      ["V1-03", "Compte introuvable \xB7 desktop", "Account not found \xB7 desktop", D, 700, (l) => /* @__PURE__ */ React.createElement(CBOpsGrantV1, { lang: l, step: "notfound" })],
      ["V1-04", "Abonnement Apple actif \xB7 mobile", "Active Apple subscription \xB7 mobile", M, 890, (l) => /* @__PURE__ */ React.createElement(CBOpsGrantV1, { lang: l, mobile: true, step: "apple" })],
      ["V1-05", "Recherche en cours \xB7 desktop", "Search in progress \xB7 desktop", D, 860, (l) => /* @__PURE__ */ React.createElement(CBOpsGrantV1, { lang: l, step: "searching" })]
    ]
  }
];
function readPref(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : v;
  } catch (e) {
    return d;
  }
}
function writePref(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {
  }
}
function Seg({ label, value, options, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": label, className: "seg" }, options.map(([id, text]) => /* @__PURE__ */ React.createElement("button", { key: id, type: "button", "aria-pressed": String(id) === String(value), onClick: () => onChange(id) }, text)));
}
function Frame({ id, w, h, z, label, children }) {
  return /* @__PURE__ */ React.createElement("figure", { className: "frame", id: "f-" + id }, /* @__PURE__ */ React.createElement("figcaption", null, /* @__PURE__ */ React.createElement("b", { className: "fid" }, id), label, " ", /* @__PURE__ */ React.createElement("span", null, w, "\xD7", h)), /* @__PURE__ */ React.createElement("div", { className: "frame-box", style: { width: Math.round(w * z), height: Math.round(h * z) } }, /* @__PURE__ */ React.createElement("div", { style: { width: w, height: h, transform: `scale(${z})`, transformOrigin: "top left" } }, children)));
}
function App() {
  const [lang, setLang] = useState(readPref("ops-lang", "fr"));
  const [zoom, setZoom] = useState(readPref("ops-zoom", "0.5"));
  useEffect(() => {
    writePref("ops-lang", lang);
  }, [lang]);
  useEffect(() => {
    writePref("ops-zoom", zoom);
  }, [zoom]);
  const fr = lang === "fr";
  const z = parseFloat(zoom);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("header", { className: "top" }, /* @__PURE__ */ React.createElement("div", { className: "top-in" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Cloudbreak Ops"), /* @__PURE__ */ React.createElement("p", null, fr ? "Maquettes de la console admin (v0, lecture seule). Donn\xE9es fictives." : "Admin console mockups (v0, read-only). Mock data.")), /* @__PURE__ */ React.createElement("div", { className: "ctrl" }, /* @__PURE__ */ React.createElement(Seg, { label: "Langue", value: lang, onChange: setLang, options: [["fr", "FR"], ["en", "EN"]] }), /* @__PURE__ */ React.createElement(Seg, { label: "Zoom", value: zoom, onChange: setZoom, options: [["0.4", "40 %"], ["0.5", "50 %"], ["0.75", "75 %"], ["1", "100 %"]] }))), /* @__PURE__ */ React.createElement("nav", { "aria-label": fr ? "Sections" : "Sections", className: "sections" }, SECTIONS.map((s) => /* @__PURE__ */ React.createElement("a", { key: s.id, href: "#" + s.id }, fr ? s.fr : s.en)))), /* @__PURE__ */ React.createElement("main", { className: "wrap" }, SECTIONS.map((s) => /* @__PURE__ */ React.createElement("section", { key: s.id, id: s.id }, /* @__PURE__ */ React.createElement("h2", null, fr ? s.fr : s.en), /* @__PURE__ */ React.createElement("p", { className: "sub" }, fr ? s.subFr : s.subEn), s.render ? s.render(lang) : /* @__PURE__ */ React.createElement("div", { className: "row" }, s.arts.map(([fid, lf, le, w, h, make]) => /* @__PURE__ */ React.createElement(Frame, { key: fid, id: fid, w, h, z, label: fr ? lf : le }, make(lang)))))), /* @__PURE__ */ React.createElement("footer", { className: "foot" }, fr ? "Choix de conception : docs/ops-dashboard-ux-decisions.md dans le d\xE9p\xF4t cloudbreak." : "Design decisions: docs/ops-dashboard-ux-decisions.md in the cloudbreak repository.")));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
