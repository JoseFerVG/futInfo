/**
 * Capa de Datos (Store) - Estilo FIFA Ultimate Team (FUT)
 * Torneo del Rector: Fútbol 7 (Sincronización real multi-dispositivo en Cloud Firestore)
 */
import {
  sanitizeForFirestore,
  probeFirestoreHealth,
  auth as fbAuth
} from './firebase-config.js';

const ADMIN_EMAIL = 'josef.caniles.murcia@gmail.com';

const STORAGE_KEYS = {
  PLAYERS: 'futinfo_fifa_players_v4',
  MATCHES: 'futinfo_fifa_matches_v4',
  MATCH_LOGS: 'futinfo_fifa_matchlogs_v1',
  SETTINGS: 'futinfo_fifa_settings_v4'
};

const LEGACY_KEYS = [
  'futinfo_fifa_players_v3',
  'futinfo_fifa_matches_v3',
  'futinfo_fifa_settings_v3'
];

const FIRESTORE_TEAM_DOC = 'furia_rector_live_v2';

/**
 * Genera un blasón heráldico SVG de alta definición para cada facultad/centro de la UMU
 */
function buildFacultyEmblem(bg, accent, symbolSvg) {
  return `<svg class="umu-faculty-crest" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 3 H26 V16.5 C26 23.2 19.8 28.4 14 30.8 C8.2 28.4 2 23.2 2 16.5 Z" fill="${bg}" stroke="${accent}" stroke-width="2"/>
    <path d="M5 6 H23 V16.2 C23 21.4 18.2 25.4 14 27.4 C9.8 25.4 5 21.4 5 16.2 Z" fill="rgba(0,0,0,0.22)"/>
    ${symbolSvg}
  </svg>`;
}

// Todas las Facultades y Centros Oficiales de la Universidad de Murcia (UMU)
export const FACULTIES = [
  {
    id: 'inf',
    name: 'Facultad de Informática',
    short: 'INFO',
    color: '#0284c7',
    icon: buildFacultyEmblem('#082f49', '#38bdf8', '<rect x="8.5" y="9" width="11" height="8" rx="1.2" stroke="#38bdf8" stroke-width="1.6"/><path d="M11.5 11.5 L9.8 13 L11.5 14.5 M16.5 11.5 L18.2 13 L16.5 14.5 M14.8 10.8 L13.2 15.2" stroke="#e0f2fe" stroke-width="1.4" stroke-linecap="round"/><path d="M10.5 20 H17.5" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>')
  },
  {
    id: 'med',
    name: 'Facultad de Medicina',
    short: 'MED',
    color: '#e11d48',
    icon: buildFacultyEmblem('#4c0519', '#fb7185', '<path d="M14 7.5 V23.5" stroke="#fde047" stroke-width="1.8" stroke-linecap="round"/><path d="M10 10.5 C12.5 9.5 15.5 9.5 18 10.5 M9 13.5 C11.5 11.5 16.5 15.5 11.5 17.5 C14.5 18.5 16.5 20.5 13 22" stroke="#fff1f2" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="14" cy="8.2" r="1.6" fill="#fde047"/>')
  },
  {
    id: 'der',
    name: 'Facultad de Derecho',
    short: 'DER',
    color: '#9333ea',
    icon: buildFacultyEmblem('#3b0764', '#c084fc', '<path d="M14 7.5 V22 M9.5 22 H18.5 M7.5 10.5 H20.5" stroke="#f3e8ff" stroke-width="1.7" stroke-linecap="round"/><path d="M7.5 10.5 L5.8 15.5 H9.2 Z M20.5 10.5 L18.8 15.5 H22.2 Z" fill="#c084fc" stroke="#f3e8ff" stroke-width="1"/>')
  },
  {
    id: 'cafd',
    name: 'Facultad de Ciencias del Deporte',
    short: 'CAFD',
    color: '#0d9488',
    icon: buildFacultyEmblem('#042f2e', '#2dd4bf', '<path d="M9.5 8.5 H18.5 V13 C18.5 15.8 16.5 18 14 18 C11.5 18 9.5 15.8 9.5 13 Z" stroke="#fde047" stroke-width="1.6" fill="rgba(45,212,191,0.22)"/><path d="M9.5 10 H7.2 C7.2 12.8 8.3 14 9.5 14 M18.5 10 H20.8 C20.8 12.8 19.7 14 18.5 14" stroke="#2dd4bf" stroke-width="1.4" stroke-linecap="round"/><path d="M14 18 V22 M10.8 22 H17.2" stroke="#fde047" stroke-width="1.8" stroke-linecap="round"/>')
  },
  {
    id: 'eco',
    name: 'Facultad de Economía y Empresa',
    short: 'ECON',
    color: '#d97706',
    icon: buildFacultyEmblem('#451a03', '#fbbf24', '<path d="M7.5 20.5 H20.5" stroke="#fde68a" stroke-width="1.6" stroke-linecap="round"/><rect x="8.5" y="15" width="2.6" height="5.5" fill="#fbbf24"/><rect x="12.7" y="12" width="2.6" height="8.5" fill="#f59e0b"/><rect x="16.9" y="8.5" width="2.6" height="12" fill="#fde047"/><path d="M8.5 13 L13 9.8 L16 11 L19.8 7.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>')
  },
  {
    id: 'edu',
    name: 'Facultad de Educación',
    short: 'EDUC',
    color: '#65a30d',
    icon: buildFacultyEmblem('#1a2e05', '#a3e635', '<polygon points="14,7.5 22,11.5 14,15.5 6,11.5" fill="#a3e635" stroke="#ecfccb" stroke-width="1.2"/><path d="M9 13.5 V18 C9 19.6 11.2 21 14 21 C16.8 21 19 19.6 19 18 V13.5" stroke="#ecfccb" stroke-width="1.6" fill="none"/><path d="M21 12 V17.5" stroke="#fde047" stroke-width="1.6" stroke-linecap="round"/>')
  },
  {
    id: 'psi',
    name: 'Facultad de Psicología y Logopedia',
    short: 'PSIC',
    color: '#a855f7',
    icon: buildFacultyEmblem('#2e1065', '#e879f9', '<path d="M14 8 V22.5 M10.5 22.5 H17.5 M8.5 10 C8.5 14.5 11 16.5 14 16.5 C17 16.5 19.5 14.5 19.5 10" stroke="#fae8ff" stroke-width="2" stroke-linecap="round" fill="none"/>')
  },
  {
    id: 'bio',
    name: 'Facultad de Biología',
    short: 'BIO',
    color: '#16a34a',
    icon: buildFacultyEmblem('#052e16', '#4ade80', '<path d="M10 8 C10 12 18 13 18 17 C18 20 14 22 10 23 M18 8 C18 12 10 13 10 17 C10 20 14 22 18 23" stroke="#bbf7d0" stroke-width="1.7" stroke-linecap="round" fill="none"/><path d="M10.5 10.5 H17.5 M10.8 15.2 H17.2 M11 19.8 H17" stroke="#4ade80" stroke-width="1.4"/>')
  },
  {
    id: 'qui',
    name: 'Facultad de Química',
    short: 'QUÍM',
    color: '#7c3aed',
    icon: buildFacultyEmblem('#1e1b4b', '#818cf8', '<path d="M12 8 H16 M12.5 8 V12.5 L8.2 20.2 C7.8 21 8.3 22 9.2 22 H18.8 C19.7 22 20.2 21 19.8 20.2 L15.5 12.5 V8" stroke="#e0e7ff" stroke-width="1.6" stroke-linejoin="round" fill="rgba(129,140,248,0.2)"/><path d="M9.6 18 H18.4" stroke="#38bdf8" stroke-width="2"/>')
  },
  {
    id: 'mat',
    name: 'Facultad de Matemáticas',
    short: 'MATES',
    color: '#0369a1',
    icon: buildFacultyEmblem('#0c4a6e', '#7dd3fc', '<path d="M18.5 9.5 H9.5 L14.8 15 L9.5 21 H18.5" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
  },
  {
    id: 'let',
    name: 'Facultad de Letras',
    short: 'LETRAS',
    color: '#db2777',
    icon: buildFacultyEmblem('#500724', '#f472b6', '<path d="M18.5 8 C14 8.5 10.5 12.5 9.5 19.5 L8 22 L10.5 20.8 C15 19 18 14.5 18.5 8 Z" fill="rgba(244,114,182,0.3)" stroke="#fdf2f8" stroke-width="1.6"/><path d="M8 22 L15.5 13" stroke="#fde047" stroke-width="1.4" stroke-linecap="round"/>')
  },
  {
    id: 'fil',
    name: 'Facultad de Filosofía',
    short: 'FILOS',
    color: '#4f46e5',
    icon: buildFacultyEmblem('#1e1b4b', '#a5b4fc', '<path d="M7.5 11.5 L14 8 L20.5 11.5 Z M9 12.5 V20 M14 12.5 V20 M19 12.5 V20 M7.5 21.5 H20.5" stroke="#e0e7ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>')
  },
  {
    id: 'bell',
    name: 'Facultad de Bellas Artes',
    short: 'ARTES',
    color: '#f43f5e',
    icon: buildFacultyEmblem('#4c0519', '#fda4af', '<path d="M14 8 C9.8 8 7.2 11.2 7.2 14.8 C7.2 18 9.8 20.5 13.2 20.5 C14.6 20.5 15.2 19.5 14.8 18.4 C14.5 17.5 15.2 16.5 16.4 16.5 H18.2 C19.8 16.5 21 15.2 21 13.6 C21 10.4 18 8 14 8 Z" fill="rgba(253,164,175,0.22)" stroke="#fff1f2" stroke-width="1.5"/><circle cx="10.8" cy="13.2" r="1.1" fill="#fde047"/><circle cx="13.5" cy="11.2" r="1.1" fill="#38bdf8"/><circle cx="16.8" cy="12.2" r="1.1" fill="#4ade80"/>')
  },
  {
    id: 'com',
    name: 'Facultad de Comunicación y Documentación',
    short: 'COMUN',
    color: '#ea580c',
    icon: buildFacultyEmblem('#431407', '#fb923c', '<circle cx="14" cy="17.5" r="2" fill="#fde047"/><path d="M10.2 14.2 A5.5 5.5 0 0 1 17.8 14.2 M7.6 11.4 A9.2 9.2 0 0 1 20.4 11.4" stroke="#ffedd5" stroke-width="1.7" stroke-linecap="round" fill="none"/><path d="M14 19.5 V22.5" stroke="#fb923c" stroke-width="1.8" stroke-linecap="round"/>')
  },
  {
    id: 'enf',
    name: 'Facultad de Enfermería',
    short: 'ENF',
    color: '#ef4444',
    icon: buildFacultyEmblem('#450a0a', '#fca5a5', '<path d="M12.2 8.5 H15.8 V12.5 H19.8 V16.1 H15.8 V20.1 H12.2 V16.1 H8.2 V12.5 H12.2 Z" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>')
  },
  {
    id: 'far',
    name: 'Facultad de Farmacia',
    short: 'FARM',
    color: '#10b981',
    icon: buildFacultyEmblem('#022c22', '#34d399', '<path d="M9.5 11.5 H18.5 C18.5 15.2 16.5 17.8 14 18.2 C11.5 17.8 9.5 15.2 9.5 11.5 Z" fill="rgba(52,211,153,0.28)" stroke="#d1fae5" stroke-width="1.5"/><path d="M14 18.2 V22 M10.5 22 H17.5 M14 7.8 C12.2 8.8 12.2 10.6 14 11.5 C15.8 12.4 15.8 13.8 14 15" stroke="#fde047" stroke-width="1.5" stroke-linecap="round" fill="none"/>')
  },
  {
    id: 'opt',
    name: 'Facultad de Óptica y Optometría',
    short: 'ÓPTICA',
    color: '#0891b2',
    icon: buildFacultyEmblem('#083344', '#22d3ee', '<path d="M6.5 15 C9 10.8 19 10.8 21.5 15 C19 19.2 9 19.2 6.5 15 Z" fill="rgba(34,211,238,0.2)" stroke="#ecfeff" stroke-width="1.6"/><circle cx="14" cy="15" r="2.6" fill="#22d3ee" stroke="#ffffff" stroke-width="1"/>')
  },
  {
    id: 'vet',
    name: 'Facultad de Veterinaria',
    short: 'VET',
    color: '#059669',
    icon: buildFacultyEmblem('#064e3b', '#6ee7b7', '<path d="M9.5 9.5 L14 20.5 L18.5 9.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="14" cy="12" r="1.4" fill="#fde047"/><path d="M11 22 H17" stroke="#6ee7b7" stroke-width="1.6" stroke-linecap="round"/>')
  },
  {
    id: 'rrll',
    name: 'Facultad de CC. del Trabajo / RRLL',
    short: 'RRLL',
    color: '#f59e0b',
    icon: buildFacultyEmblem('#451a03', '#fcd34d', '<circle cx="14" cy="14.5" r="4.5" stroke="#fef3c7" stroke-width="1.8" stroke-dasharray="3 2"/><circle cx="14" cy="14.5" r="1.8" fill="#fcd34d"/><path d="M9 21.5 C10.5 19.5 17.5 19.5 19 21.5" stroke="#fde047" stroke-width="1.6" stroke-linecap="round" fill="none"/>')
  },
  {
    id: 'tsoc',
    name: 'Facultad de Trabajo Social',
    short: 'T. SOC',
    color: '#fb923c',
    icon: buildFacultyEmblem('#431407', '#fdba74', '<circle cx="11" cy="11.5" r="2" fill="#fed7aa"/><circle cx="17" cy="11.5" r="2" fill="#fdba74"/><path d="M7.5 19 C8.2 15.5 12 15 14 16.8 C16 15 19.8 15.5 20.5 19" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" fill="none"/>')
  },
  {
    id: 'ccss',
    name: 'Facultad de Ciencias Sociosanitarias',
    short: 'SOCIO',
    color: '#ec4899',
    icon: buildFacultyEmblem('#500724', '#f9a8d4', '<path d="M7.5 15 H10.8 L12.5 10.5 L15 19 L17 13.5 L18.2 15 H20.8" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
  },
  {
    id: 'tur',
    name: 'Escuela Univ. de Turismo',
    short: 'TUR',
    color: '#0ea5e9',
    icon: buildFacultyEmblem('#0c4a6e', '#38bdf8', '<circle cx="14" cy="15" r="6" stroke="#bae6fd" stroke-width="1.5"/><polygon points="14,10 15.8,15 14,20 12.2,15" fill="#fde047"/><circle cx="14" cy="15" r="1.2" fill="#0c4a6e"/>')
  }
];

export const ROLES_F7 = [
  { code: 'POR', name: 'Portero (GK)', category: 'GK' },
  { code: 'DFC', name: 'Defensa Central (CB)', category: 'DEF' },
  { code: 'LI', name: 'Lateral Izquierdo (LB)', category: 'DEF' },
  { code: 'LD', name: 'Lateral Derecho (RB)', category: 'DEF' },
  { code: 'MC', name: 'Mediocentro (CM)', category: 'MID' },
  { code: 'MCD', name: 'Pivote Defensivo (CDM)', category: 'MID' },
  { code: 'MCO', name: 'Mediapunta (CAM)', category: 'MID' },
  { code: 'EI', name: 'Extremo Izquierdo (LW)', category: 'FWD' },
  { code: 'ED', name: 'Extremo Derecho (RW)', category: 'FWD' },
  { code: 'DC', name: 'Delantero Centro (ST)', category: 'FWD' }
];

// Jugadores iniciales vacíos — se completa exclusivamente con usuarios reales autenticados con Google
const DEFAULT_PLAYERS = [];

const DEFAULT_SETTINGS = {
  teamName: 'Furia Rector FC',
  shortName: 'FUR',
  tournament: '',
  modality: 'f7',
  crest: 'shield_gold',
  kitColor: '#f8fafc',
  kitSecondary: '#f0be2a',
  stadium: 'campus_sur',
  ball: 'nike_flight',
  slogan: '',
  foundedYear: '2026',
  specialists: {
    captain: '',
    penalties: '',
    freeKicks: '',
    corners: ''
  },
  tactics: {
    defensiveStyle: 'balanced',
    defensiveWidth: 5,
    defensiveDepth: 6,
    buildUpPlay: 'balanced',
    chanceCreation: 'forward_runs',
    playersInBox: 5
  },
  activeFormationF7: '1-3-2-1',
  startingLineupF7: [],
  benchPlayers: [],
  activeSquadId: 'sq_furia_f7',
  squads: [
    {
      id: 'sq_furia_f7',
      name: 'Furia Rector Titular',
      modality: 'f7',
      formation: '1-3-2-1',
      startingLineup: [],
      benchPlayers: [],
      rating: 0
    },
    {
      id: 'sq_rotaciones_f7',
      name: 'Furia Rotaciones B',
      modality: 'f7',
      formation: '1-2-3-1',
      startingLineup: [],
      benchPlayers: [],
      rating: 0
    }
  ]
};

const DEFAULT_MATCHES = [];

export class TeamStore {
  constructor() {
    this.players = [];
    this.matches = [];
    this.matchLogs = [];
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.tacticalBoard = null;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this._tacticalBoardListener = null;
    this._db = null;
    this._cloudUnsubs = [];
    this._privateUnsub = null;
    this._cloudSaveTimer = null;
    this._isApplyingRemote = false;
    this._lastCloudTs = 0;
    this._isAdminSession = false;
    this._currentUid = '';
    this._publicPlayersMap = new Map();
    this._privatePlayersMap = new Map();
    this._pendingAddIds = new Set();
    this._deletedPlayerIds = new Set();
    this.cloudStatus = {
      state: 'initializing',
      code: '',
      message: 'Comprobando conexión con Cloud Firestore…',
      dbVerified: false,
      lastSyncAt: 0
    };
    this.init();
  }

  init() {
    // Limpiar datos demo heredados de versiones anteriores
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));

    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    const rawPlayers = savedPlayers ? JSON.parse(savedPlayers) : DEFAULT_PLAYERS;
    this.players = this.deduplicatePlayers(rawPlayers);

    const savedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
    this.matches = savedMatches ? JSON.parse(savedMatches) : [];

    const savedLogs = localStorage.getItem(STORAGE_KEYS.MATCH_LOGS);
    this.matchLogs = savedLogs ? JSON.parse(savedLogs) : [];

    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    this.settings = savedSettings
      ? { ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), ...JSON.parse(savedSettings) }
      : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

    this._enforceF7Settings();
    this.saveLocal();
  }

  _enforceF7Settings() {
    this.settings.modality = 'f7';
    if (!this.settings.activeFormationF7) {
      this.settings.activeFormationF7 = DEFAULT_SETTINGS.activeFormationF7;
    }
    if (!Array.isArray(this.settings.startingLineupF7)) {
      this.settings.startingLineupF7 = [];
    }
    const rawSquads = Array.isArray(this.settings.squads) ? this.settings.squads : [];
    const f7Squads = rawSquads.filter(sq => sq && sq.modality !== 'futsal').map(sq => ({
      ...sq,
      modality: 'f7',
      formation: sq.formation || '1-3-2-1'
    }));
    this.settings.squads = f7Squads.length > 0
      ? f7Squads
      : JSON.parse(JSON.stringify(DEFAULT_SETTINGS.squads));
    if (!this.settings.squads.some(sq => sq.id === this.settings.activeSquadId)) {
      this.settings.activeSquadId = this.settings.squads[0]?.id || 'sq_furia_f7';
    }
  }

  deduplicatePlayers(list) {
    if (!Array.isArray(list) || list.length === 0) return [];
    const seenEmails = new Set();
    const seenNames = new Set();
    const seenIds = new Set();
    const cleanList = [];

    for (const p of list) {
      if (!p) continue;
      if (p.id && seenIds.has(p.id)) continue;

      const email = (p.email || '').toLowerCase().trim();
      if (email && email.includes('@')) {
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);
      }

      const name = (p.name || '').toLowerCase().trim();
      const nickname = (p.nickname || '').toLowerCase().trim();
      const nameKey = `${name}_${nickname}`;
      if (name && seenNames.has(nameKey)) continue;

      if (!p.kitColor) p.kitColor = '#f8fafc';
      if (!p.kitSecondary) p.kitSecondary = '#f0be2a';
      if (!p.kitCollar) p.kitCollar = 'round';
      if (!p.kitSleeves) p.kitSleeves = 'short';
      if (!p.playStyle) {
        const best = p.rolesHierarchy?.best || p.roleBest || 'MC';
        p.playStyle = best === 'POR' ? 'acrobatic' : (['DFC', 'LI', 'LD', 'CIE'].includes(best) ? 'anticipate' : (['DC', 'PIV'].includes(best) ? 'finesse' : 'incisive'));
      }
      if (!p.skillMoves) p.skillMoves = 4;
      if (!p.weakFoot) p.weakFoot = 4;
      if (!p.celebration) p.celebration = 'siuuu';
      if (!p.chemStyle) p.chemStyle = 'HUN';

      if (p.id) seenIds.add(p.id);
      if (name) seenNames.add(nameKey);
      cleanList.push(p);
    }

    return cleanList;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveLocal();
    if (!this._isApplyingRemote && this._canWriteTeamSettings()) {
      this.scheduleCloudSave();
    }
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("Error en suscriptor store:", err);
      }
    }
  }

  onCloudStatusChange(cb) {
    this.statusListeners.add(cb);
    cb({ ...this.cloudStatus });
    return () => this.statusListeners.delete(cb);
  }

  getCloudStatus() {
    return { ...this.cloudStatus };
  }

  setCloudStatus(partial) {
    this.cloudStatus = { ...this.cloudStatus, ...partial };
    for (const cb of this.statusListeners) {
      try {
        cb({ ...this.cloudStatus });
      } catch (err) {
        console.error("Error en statusListener store:", err);
      }
    }
  }

  registerTacticalBoardListener(fn) {
    this._tacticalBoardListener = fn;
    if (this.tacticalBoard && typeof fn === 'function') {
      try { fn(this.tacticalBoard); } catch {}
    }
  }

  _canWriteTeamSettings() {
    if (this._isAdminSession) return true;
    const u = fbAuth?.currentUser;
    return Boolean(u && u.emailVerified && (u.email || '').toLowerCase().trim() === ADMIN_EMAIL);
  }

  _classifyFirestoreError(err) {
    const code = (err?.code || '').toLowerCase();
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('database (default) does not exist') || msg.includes('does not exist for project') || code === 'not-found') {
      return {
        state: 'missing_db',
        code: 'not-found',
        dbVerified: false,
        message: 'La base de datos Firestore (default) no está creada aún en futinfo-382e8. Los datos NO se guardan entre móviles.'
      };
    }
    if (code === 'permission-denied' || msg.includes('missing or insufficient permissions')) {
      return {
        state: 'permission_denied',
        code: 'permission-denied',
        dbVerified: true,
        message: 'Cloud Firestore rechazó la operación por reglas de seguridad o falta publicar firestore.rules.'
      };
    }
    if (code === 'unavailable' || msg.includes('offline') || msg.includes('failed to fetch') || msg.includes('network')) {
      return {
        state: 'offline',
        code: code || 'offline',
        dbVerified: false,
        message: 'Sin conexión estable con Cloud Firestore.'
      };
    }
    return {
      state: 'error',
      code: code || 'error',
      dbVerified: false,
      message: err?.message || 'Error conectando con Cloud Firestore.'
    };
  }

  _rebuildMergedPlayers() {
    const mergedRemote = [];
    for (const [pid, pubData] of this._publicPlayersMap.entries()) {
      if (!pid || this._deletedPlayerIds.has(pid)) continue;
      const priv = this._privatePlayersMap.get(pid) || {};
      mergedRemote.push({
        ...pubData,
        email: pubData.email || priv.email || '',
        phone: pubData.phone || priv.phone || '',
        studentId: pubData.studentId || priv.studentId || ''
      });
    }
    const remoteIds = new Set(mergedRemote.map(p => p.id));
    const pendingLocals = this.players.filter(
      p => p && !this._deletedPlayerIds.has(p.id) && this._pendingAddIds.has(p.id) && !remoteIds.has(p.id)
    );
    this.players = this.deduplicatePlayers([...mergedRemote, ...pendingLocals]);
  }

  _emitListenersOnly() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("Error en suscriptor store tras sync:", err);
      }
    }
  }

  async initCloudSync(db, initialHealth = null) {
    if (!db) {
      this.setCloudStatus({
        state: 'unconfigured',
        code: 'no-db',
        dbVerified: false,
        message: 'Firestore SDK no inicializado.'
      });
      return;
    }

    // Limpiar suscripciones anteriores si se reintenta la conexión
    this._cloudUnsubs.forEach(unsub => { try { unsub(); } catch {} });
    this._cloudUnsubs = [];
    this._db = db;

    const health = initialHealth || await probeFirestoreHealth();
    if (health.state === 'missing_db') {
      this.setCloudStatus({ ...health, dbVerified: false });
      console.error("[Firestore] BASE DE DATOS NO PROVISIONADA:", health.message);
      return;
    }

    this.setCloudStatus({
      ...health,
      dbVerified: health.state === 'connected'
    });

    try {
      const { doc, collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const handleSnapshotError = (channel) => (err) => {
        const info = this._classifyFirestoreError(err);
        this.setCloudStatus(info);
        console.warn(`[Firestore:${channel}] ${info.message}`);
      };

      // 1. Suscripción en tiempo real a TODOS los jugadores registrados (1 doc por jugador)
      const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
        this._isApplyingRemote = true;
        try {
          if (!snap.metadata.fromCache) {
            this.setCloudStatus({
              state: 'connected',
              code: 'ok',
              dbVerified: true,
              lastSyncAt: Date.now(),
              message: 'Base de datos compartida activa en tiempo real.'
            });
          }

          this._publicPlayersMap.clear();
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (!data) return;
            const pid = data.id || docSnap.id;
            this._publicPlayersMap.set(pid, { ...data, id: pid });
            if (!snap.metadata.fromCache) {
              this._pendingAddIds.delete(pid);
            }
          });

          if (snap.size > 0 || !snap.metadata.fromCache) {
            this._rebuildMergedPlayers();
            this.saveLocal();
            this._emitListenersOnly();
          }
        } finally {
          this._isApplyingRemote = false;
        }
      }, handleSnapshotError('players'));

      // 2. Suscripción al documento del Club (settings, alineaciones, especialistas, pizarra)
      const unsubTeam = onSnapshot(doc(db, 'teams', FIRESTORE_TEAM_DOC), (snap) => {
        if (!snap.metadata.fromCache) {
          this.setCloudStatus({
            state: 'connected',
            code: 'ok',
            dbVerified: true,
            lastSyncAt: Date.now(),
            message: 'Base de datos compartida activa en tiempo real.'
          });
        }
        if (!snap.exists()) return;
        const remote = snap.data();
        const remoteTs = remote?.updatedAt || 0;
        if (remoteTs && remoteTs < this._lastCloudTs) return;

        this._lastCloudTs = remoteTs;
        this._isApplyingRemote = true;
        try {
          // Compatibilidad con documentos antiguos si aún no hay docs individuales en `players`
          if (this._publicPlayersMap.size === 0 && Array.isArray(remote.players) && remote.players.length > 0) {
            remote.players.forEach(p => {
              if (p?.id && !this._deletedPlayerIds.has(p.id)) {
                this._publicPlayersMap.set(p.id, p);
              }
            });
            this._rebuildMergedPlayers();
          }
          if (remote.settings && typeof remote.settings === 'object') {
            this.settings = { ...this.settings, ...remote.settings };
            this._enforceF7Settings();
          }
          if (remote.tacticalBoard && typeof remote.tacticalBoard === 'object') {
            this.tacticalBoard = remote.tacticalBoard;
            if (typeof this._tacticalBoardListener === 'function') {
              this._tacticalBoardListener(remote.tacticalBoard);
            }
          }
          this.saveLocal();
          this._emitListenersOnly();
        } finally {
          this._isApplyingRemote = false;
        }
      }, handleSnapshotError('team'));

      // 3. Suscripción en tiempo real a Jornadas / Partidos (1 doc por partido)
      const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
        if (snap.metadata.fromCache && snap.empty) return;
        this._isApplyingRemote = true;
        try {
          const list = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d) list.push({ ...d, id: d.id || docSnap.id });
          });
          if (!snap.metadata.fromCache || list.length > 0) {
            this.matches = list;
            this.saveLocal();
            this._emitListenersOnly();
          }
        } finally {
          this._isApplyingRemote = false;
        }
      }, handleSnapshotError('matches'));

      // 4. Suscripción en tiempo real a Historial de Actas / Minutos
      const unsubLogs = onSnapshot(collection(db, 'matchLogs'), (snap) => {
        if (snap.metadata.fromCache && snap.empty) return;
        this._isApplyingRemote = true;
        try {
          const list = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d) list.push({ ...d, id: d.id || docSnap.id });
          });
          if (!snap.metadata.fromCache || list.length > 0) {
            this.matchLogs = list;
            this.saveLocal();
            this._emitListenersOnly();
          }
        } finally {
          this._isApplyingRemote = false;
        }
      }, handleSnapshotError('matchLogs'));

      this._cloudUnsubs.push(unsubPlayers, unsubTeam, unsubMatches, unsubLogs);
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      console.warn("[Firestore] Error iniciando canales en tiempo real:", info.message);
    }
  }

  async syncPrivatePlayerData(fbUser, isAdmin = false) {
    this._isAdminSession = Boolean(isAdmin);
    this._currentUid = fbUser?.uid || '';
    if (this._privateUnsub) {
      try { this._privateUnsub(); } catch {}
      this._privateUnsub = null;
    }

    if (!this._db || !fbUser || this.cloudStatus.state === 'missing_db') return;

    try {
      const { doc, collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      if (isAdmin) {
        this._privateUnsub = onSnapshot(collection(this._db, 'playerPrivate'), (snap) => {
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            if (d) this._privatePlayersMap.set(d.id || docSnap.id, d);
          });
          this._isApplyingRemote = true;
          try {
            this._rebuildMergedPlayers();
            this.saveLocal();
            this._emitListenersOnly();
          } finally {
            this._isApplyingRemote = false;
          }
        }, () => {});
      } else {
        const ownDocId = 'u_' + fbUser.uid;
        this._privateUnsub = onSnapshot(doc(this._db, 'playerPrivate', ownDocId), (snap) => {
          if (!snap.exists()) return;
          const d = snap.data();
          this._privatePlayersMap.set(d.id || ownDocId, d);
          this._isApplyingRemote = true;
          try {
            this._rebuildMergedPlayers();
            this.saveLocal();
            this._emitListenersOnly();
          } finally {
            this._isApplyingRemote = false;
          }
        }, () => {});
      }
    } catch (err) {
      console.warn("[Firestore] No se pudo suscribir a datos privados del jugador:", err?.message || err);
    }
  }

  _toPublicPlayerDoc(player) {
    const clean = {
      id: player.id,
      uid: player.uid || this._currentUid || '',
      name: String(player.name || 'Jugador FUT').slice(0, 80),
      nickname: String(player.nickname || 'Crack').slice(0, 40),
      number: Math.max(1, Math.min(99, parseInt(player.number, 10) || 10)),
      rating: Math.max(40, Math.min(99, parseInt(player.rating, 10) || 75)),
      cardType: String(player.cardType || 'gold').slice(0, 24),
      faculty: String(player.faculty || 'inf').slice(0, 24),
      chemStyle: String(player.chemStyle || 'HUN').slice(0, 12),
      kitColor: String(player.kitColor || '#f8fafc').slice(0, 20),
      kitSecondary: String(player.kitSecondary || '#f0be2a').slice(0, 20),
      kitCollar: String(player.kitCollar || 'round').slice(0, 16),
      kitSleeves: String(player.kitSleeves || 'short').slice(0, 16),
      playStyle: String(player.playStyle || 'finesse').slice(0, 24),
      skillMoves: Math.max(1, Math.min(5, parseInt(player.skillMoves, 10) || 4)),
      weakFoot: Math.max(1, Math.min(5, parseInt(player.weakFoot, 10) || 4)),
      celebration: String(player.celebration || 'siuuu').slice(0, 24),
      avatar: String(player.avatar || 'assets/club_logo.png').slice(0, 240000),
      preferredFoot: String(player.preferredFoot || 'Diestro').slice(0, 24),
      rolesHierarchy: {
        best: player.rolesHierarchy?.best || 'DC',
        second: player.rolesHierarchy?.second || 'MC',
        third: player.rolesHierarchy?.third || 'DFC',
        fourth: player.rolesHierarchy?.fourth || 'MCO',
        worst: player.rolesHierarchy?.worst || 'POR',
        priorityOrder: Array.isArray(player.rolesHierarchy?.priorityOrder)
          ? player.rolesHierarchy.priorityOrder.slice(0, 8)
          : ['DC', 'MC', 'DFC', 'MCO']
      },
      stats: {
        pac: Math.max(1, Math.min(99, parseInt(player.stats?.pac, 10) || 80)),
        sho: Math.max(1, Math.min(99, parseInt(player.stats?.sho, 10) || 75)),
        pas: Math.max(1, Math.min(99, parseInt(player.stats?.pas, 10) || 78)),
        dri: Math.max(1, Math.min(99, parseInt(player.stats?.dri, 10) || 80)),
        def: Math.max(1, Math.min(99, parseInt(player.stats?.def, 10) || 70)),
        phy: Math.max(1, Math.min(99, parseInt(player.stats?.phy, 10) || 76))
      },
      goals: Math.max(0, parseInt(player.goals, 10) || 0),
      assists: Math.max(0, parseInt(player.assists, 10) || 0),
      yellowCards: Math.max(0, parseInt(player.yellowCards, 10) || 0),
      redCards: Math.max(0, parseInt(player.redCards, 10) || 0),
      updatedAt: Date.now()
    };
    return sanitizeForFirestore(clean);
  }

  async upsertPlayerCloud(player, explicitUid = '') {
    if (!this._db) {
      throw new Error('Firebase Firestore no está inicializado en este dispositivo.');
    }
    if (this.cloudStatus.state === 'missing_db') {
      throw new Error('Falta crear la base de datos Cloud Firestore (default) en el proyecto futinfo-382e8. Sin ella no se puede guardar en la nube.');
    }

    const uid = explicitUid || player.uid || fbAuth?.currentUser?.uid || '';
    const pubDoc = this._toPublicPlayerDoc({ ...player, uid });
    const privDoc = sanitizeForFirestore({
      id: player.id,
      uid,
      email: String(player.email || fbAuth?.currentUser?.email || '').slice(0, 140),
      phone: String(player.phone || '').slice(0, 40),
      studentId: String(player.studentId || '').slice(0, 40),
      updatedAt: Date.now()
    });

    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(this._db, 'players', player.id), pubDoc, { merge: true });
      this._publicPlayersMap.set(player.id, pubDoc);

      if (uid) {
        await setDoc(doc(this._db, 'playerPrivate', player.id), privDoc, { merge: true });
        this._privatePlayersMap.set(player.id, privDoc);
      }

      this._pendingAddIds.delete(player.id);
      this.setCloudStatus({
        state: 'connected',
        code: 'ok',
        dbVerified: true,
        lastSyncAt: Date.now(),
        message: 'Base de datos compartida activa en tiempo real.'
      });

      if (this._canWriteTeamSettings()) {
        await this.pushCloudState();
      }
      return true;
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      throw new Error(info.message);
    }
  }

  async deletePlayerCloud(id) {
    if (!this._db || this.cloudStatus.state === 'missing_db') return false;
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await deleteDoc(doc(this._db, 'players', id));
      try { await deleteDoc(doc(this._db, 'playerPrivate', id)); } catch {}
      this._publicPlayersMap.delete(id);
      this._privatePlayersMap.delete(id);
      return true;
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      console.warn("[Firestore] Error borrando jugador:", info.message);
      return false;
    }
  }

  async saveMatchCloud(match) {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(this._db, 'matches', match.id), sanitizeForFirestore({ ...match, updatedAt: Date.now() }), { merge: true });
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
    }
  }

  async deleteMatchCloud(id) {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await deleteDoc(doc(this._db, 'matches', id));
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
    }
  }

  async setAttendanceCloud(matchId, playerId, status) {
    if (!this._db || this.cloudStatus.state === 'missing_db') return false;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await updateDoc(doc(this._db, 'matches', matchId), {
        [`lineup.convocatoria.${playerId}`]: status,
        updatedAt: Date.now()
      });
      return true;
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      return false;
    }
  }

  async saveMatchLogCloud(log) {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(this._db, 'matchLogs', log.id), sanitizeForFirestore({ ...log, updatedAt: Date.now() }), { merge: true });
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
    }
  }

  async deleteMatchLogCloud(logId) {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await deleteDoc(doc(this._db, 'matchLogs', logId));
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
    }
  }

  async saveTacticalBoardCloud(boardState) {
    this.tacticalBoard = sanitizeForFirestore({ ...boardState, updatedAt: Date.now() });
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return false;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const ts = Date.now();
      this._lastCloudTs = ts;
      await setDoc(doc(this._db, 'teams', FIRESTORE_TEAM_DOC), sanitizeForFirestore({
        settings: this.settings,
        tacticalBoard: this.tacticalBoard,
        updatedAt: ts
      }), { merge: true });
      return true;
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      return false;
    }
  }

  scheduleCloudSave() {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    clearTimeout(this._cloudSaveTimer);
    this._cloudSaveTimer = setTimeout(() => {
      this.pushCloudState();
    }, 350);
  }

  async pushCloudState() {
    if (!this._db || this.cloudStatus.state === 'missing_db' || !this._canWriteTeamSettings()) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const ts = Date.now();
      this._lastCloudTs = ts;
      const payload = sanitizeForFirestore({
        settings: this.settings,
        tacticalBoard: this.tacticalBoard || undefined,
        updatedAt: ts
      });
      await setDoc(doc(this._db, 'teams', FIRESTORE_TEAM_DOC), payload, { merge: true });
      this.setCloudStatus({
        state: 'connected',
        code: 'ok',
        dbVerified: true,
        lastSyncAt: ts,
        message: 'Base de datos compartida activa en tiempo real.'
      });
    } catch (err) {
      const info = this._classifyFirestoreError(err);
      this.setCloudStatus(info);
      console.warn("[Firestore] No se pudo guardar configuración del club:", info.message);
    }
  }

  saveLocal() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(this.players));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(this.matches));
    localStorage.setItem(STORAGE_KEYS.MATCH_LOGS, JSON.stringify(this.matchLogs));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  getPlayers() {
    return [...this.players].sort((a, b) => b.rating - a.rating);
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  addPlayer(data) {
    const cleanUid = (data.uid || '').trim();
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanName = (data.name || '').toLowerCase().trim();

    // Comprobar si ya existe un jugador con este UID, ID, email o nombre exacto
    const existing = this.players.find(p =>
      (data.id && p.id === data.id) ||
      (cleanUid && (p.uid === cleanUid || p.id === `u_${cleanUid}`)) ||
      (cleanEmail && p.email && p.email.toLowerCase().trim() === cleanEmail) ||
      (cleanName && p.name && p.name.toLowerCase().trim() === cleanName)
    );

    if (existing) {
      return this.updatePlayer(existing.id, data);
    }

    const defaultStats = {
      pac: parseInt(data.pac, 10) || 80,
      sho: parseInt(data.sho, 10) || 75,
      pas: parseInt(data.pas, 10) || 78,
      dri: parseInt(data.dri, 10) || 80,
      def: parseInt(data.def, 10) || 70,
      phy: parseInt(data.phy, 10) || 76
    };

    const calculatedRating = this.computePlayerRating(defaultStats);

    const newPlayer = {
      id: data.id || (cleanUid ? `u_${cleanUid}` : 'p_' + Date.now()),
      uid: cleanUid,
      name: data.name || 'Nuevo Jugador',
      nickname: data.nickname || (data.name ? data.name.split(' ')[0] : 'Crack'),
      number: parseInt(data.number, 10) || (this.players.length + 1),
      rating: parseInt(data.rating, 10) || calculatedRating,
      cardType: data.cardType || 'gold',
      faculty: data.faculty || 'inf',
      chemStyle: data.chemStyle || 'HUN',
      kitColor: data.kitColor || this.settings.kitColor || '#f8fafc',
      kitSecondary: data.kitSecondary || this.settings.kitSecondary || '#f0be2a',
      kitCollar: data.kitCollar || 'round',
      kitSleeves: data.kitSleeves || 'short',
      playStyle: data.playStyle || 'finesse',
      skillMoves: parseInt(data.skillMoves, 10) || 4,
      weakFoot: parseInt(data.weakFoot, 10) || 4,
      celebration: data.celebration || 'siuuu',
      avatar: data.avatar || 'assets/club_logo.png',
      preferredFoot: data.preferredFoot || 'Diestro',
      studentId: data.studentId || '',
      phone: data.phone || '',
      email: data.email || '',
      rolesHierarchy: (() => {
        const best = data.roleBest || 'DC';
        const second = data.roleSecond || 'MC';
        const third = data.roleThird || 'DFC';
        const fourth = data.roleFourth || 'MCO';
        const worst = data.roleWorst || 'POR';
        const rawOrder = Array.isArray(data.priorityOrder) && data.priorityOrder.length > 0
          ? data.priorityOrder
          : [best, second, third, fourth];
        const priorityOrder = rawOrder.filter((v, idx, arr) => v && arr.indexOf(v) === idx);
        return {
          best: priorityOrder[0] || best,
          second: priorityOrder[1] || second,
          third: priorityOrder[2] || third,
          fourth: priorityOrder[3] || fourth,
          worst,
          priorityOrder
        };
      })(),
      stats: defaultStats,
      goals: parseInt(data.goals, 10) || 0,
      assists: parseInt(data.assists, 10) || 0,
      yellowCards: 0,
      redCards: 0
    };

    this._pendingAddIds.add(newPlayer.id);
    this.players.push(newPlayer);
    this._placeNewPlayerInLineups(newPlayer.id);
    this.notify();
    return newPlayer;
  }

  _placeNewPlayerInLineups(playerId) {
    if (!Array.isArray(this.settings.startingLineupF7)) this.settings.startingLineupF7 = [];

    const placeInto = (arr, maxLen) => {
      if (arr.includes(playerId)) return;
      const nullIdx = arr.findIndex(id => !id);
      if (nullIdx !== -1 && nullIdx < maxLen) {
        arr[nullIdx] = playerId;
      } else if (arr.length < maxLen) {
        arr.push(playerId);
      }
    };

    placeInto(this.settings.startingLineupF7, 7);

    if (Array.isArray(this.settings.squads)) {
      this.settings.squads.forEach(sq => {
        if (!Array.isArray(sq.startingLineup)) sq.startingLineup = [];
        placeInto(sq.startingLineup, 7);
      });
    }

    if (this.settings.specialists) {
      ['captain', 'penalties', 'freeKicks', 'corners'].forEach(role => {
        if (!this.settings.specialists[role]) {
          this.settings.specialists[role] = playerId;
        }
      });
    }
  }

  computePlayerRating(stats = {}) {
    const pac = parseInt(stats.pac, 10) || 80;
    const sho = parseInt(stats.sho, 10) || 75;
    const pas = parseInt(stats.pas, 10) || 78;
    const dri = parseInt(stats.dri, 10) || 80;
    const def = parseInt(stats.def, 10) || 70;
    const phy = parseInt(stats.phy, 10) || 76;
    return Math.round((pac * 0.15) + (sho * 0.2) + (pas * 0.2) + (dri * 0.2) + (def * 0.15) + (phy * 0.1));
  }

  updatePlayer(id, updates) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      const next = { ...this.players[idx], ...updates };
      if (updates.stats && updates.rating === undefined) {
        next.rating = this.computePlayerRating(next.stats);
      }
      this.players[idx] = next;
      this.notify();
      return this.players[idx];
    }
    return null;
  }

  deletePlayer(id) {
    this._deletedPlayerIds.add(id);
    this._pendingAddIds.delete(id);
    this.players = this.players.filter(p => p.id !== id);
    if (Array.isArray(this.settings.startingLineupF7)) {
      this.settings.startingLineupF7 = this.settings.startingLineupF7.map(pid => (pid === id ? null : pid));
    }
    if (Array.isArray(this.settings.startingLineupFutsal)) {
      this.settings.startingLineupFutsal = this.settings.startingLineupFutsal.map(pid => (pid === id ? null : pid));
    }
    if (Array.isArray(this.settings.benchPlayers)) {
      this.settings.benchPlayers = this.settings.benchPlayers.filter(pid => pid !== id);
    }
    if (Array.isArray(this.settings.squads)) {
      this.settings.squads.forEach(sq => {
        if (Array.isArray(sq.startingLineup)) sq.startingLineup = sq.startingLineup.map(pid => (pid === id ? null : pid));
        if (Array.isArray(sq.benchPlayers)) sq.benchPlayers = sq.benchPlayers.filter(pid => pid !== id);
      });
    }
    const fallbackId = this.players[0]?.id || '';
    if (this.settings.specialists) {
      ['captain', 'penalties', 'freeKicks', 'corners'].forEach(role => {
        if (this.settings.specialists[role] === id) {
          this.settings.specialists[role] = fallbackId;
        }
      });
    }
    this.deletePlayerCloud(id);
    this.notify();
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
    return this.settings;
  }

  setModality() {
    this.settings.modality = 'f7';
    this.notify();
  }

  setFormation(formation) {
    this.settings.modality = 'f7';
    this.settings.activeFormationF7 = formation;
    this._syncActiveSquadLineup();
    this.notify();
  }

  getActiveFormation() {
    return this.settings.activeFormationF7 || '1-3-2-1';
  }

  getModalityCapacity() {
    return 7;
  }

  getStartingLineup() {
    const cap = 7;
    const raw = this.settings.startingLineupF7 || [];
    const slots = [];
    for (let i = 0; i < cap; i++) {
      const id = raw[i];
      slots.push(id ? (this.getPlayerById(id) || null) : null);
    }
    return slots;
  }

  getActiveStarters() {
    return this.getStartingLineup().filter(Boolean);
  }

  _syncActiveSquadLineup() {
    const sq = this.getActiveSquad();
    if (!sq) return;
    sq.modality = 'f7';
    sq.formation = this.settings.activeFormationF7 || '1-3-2-1';
    const rawLineup = this.settings.startingLineupF7 || [];
    sq.startingLineup = [...rawLineup];
    const starterSet = new Set(sq.startingLineup.filter(Boolean));
    sq.benchPlayers = this.players.filter(p => !starterSet.has(p.id)).map(p => p.id);
    const startingPlayers = sq.startingLineup.map(id => (id ? this.getPlayerById(id) : null)).filter(Boolean);
    if (startingPlayers.length > 0) {
      const sum = startingPlayers.reduce((acc, p) => acc + (p.rating || 75), 0);
      sq.rating = Math.round(sum / startingPlayers.length);
    }
  }

  setStartingLineup(players) {
    const ids = players.map(p => (p ? (typeof p === 'string' ? p : p.id) : null));
    this.settings.startingLineupF7 = ids;
    this._syncActiveSquadLineup();
    this.notify();
  }

  resetStartingLineup() {
    const sorted = this.getPlayers().map(p => p.id);
    this.settings.startingLineupF7 = sorted.slice(0, 7);
    this._syncActiveSquadLineup();
    this.notify();
  }

  swapStartingPlayer(slotIndex, newPlayerId) {
    const cap = 7;
    if (slotIndex < 0 || slotIndex >= cap) return null;

    const src = this.settings.startingLineupF7 || [];
    const lineup = Array.from({ length: cap }, (_, i) => src[i] || null);
    const oldPlayerId = lineup[slotIndex];

    // Evitar duplicados si newPlayerId ya estaba en otro slot titular
    const existingOtherIdx = lineup.findIndex((id, i) => i !== slotIndex && id === newPlayerId);
    if (existingOtherIdx !== -1) {
      lineup[existingOtherIdx] = oldPlayerId;
    }
    lineup[slotIndex] = newPlayerId || null;

    this.settings.startingLineupF7 = lineup;
    this._syncActiveSquadLineup();
    this.notify();
    return { oldPlayerId, newPlayerId };
  }

  swapTwoStarters(idx1, idx2) {
    const cap = 7;
    if (idx1 < 0 || idx1 >= cap || idx2 < 0 || idx2 >= cap) return false;

    const src = this.settings.startingLineupF7 || [];
    const lineup = Array.from({ length: cap }, (_, i) => src[i] || null);

    const temp = lineup[idx1];
    lineup[idx1] = lineup[idx2];
    lineup[idx2] = temp;

    this.settings.startingLineupF7 = lineup;
    this._syncActiveSquadLineup();
    this.notify();
    return true;
  }

  getTactics() {
    return { ...DEFAULT_SETTINGS.tactics, ...(this.settings.tactics || {}) };
  }

  updateTactics(newTactics) {
    this.settings.tactics = {
      ...DEFAULT_SETTINGS.tactics,
      ...(this.settings.tactics || {}),
      ...newTactics
    };
    this.notify();
    return this.settings.tactics;
  }

  setSpecialist(role, playerId) {
    if (this.settings.specialists[role] !== undefined) {
      this.settings.specialists[role] = playerId;
      this.notify();
    }
  }

  // ==================== GESTIÓN DE PLANTILLAS Y PRESETS FIFA ====================
  getSquads() {
    if (!this.settings.squads || !Array.isArray(this.settings.squads) || this.settings.squads.length === 0) {
      this.settings.squads = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.squads));
      this.settings.activeSquadId = DEFAULT_SETTINGS.activeSquadId;
      this.saveLocal();
    }
    return this.settings.squads;
  }

  getActiveSquadId() {
    return this.settings.activeSquadId || (this.settings.squads && this.settings.squads[0]?.id) || 'sq_furia_f7';
  }

  getActiveSquad() {
    const squads = this.getSquads();
    const currentId = this.getActiveSquadId();
    return squads.find(s => s.id === currentId) || squads[0];
  }

  loadSquadPreset(squadId) {
    const squads = this.getSquads();
    const target = squads.find(s => s.id === squadId);
    if (!target) return false;

    this.settings.activeSquadId = target.id;
    this.settings.modality = 'f7';
    this.settings.activeFormationF7 = target.formation || '1-3-2-1';
    this.settings.startingLineupF7 = [...(target.startingLineup || [])];
    if (Array.isArray(target.benchPlayers)) {
      this.settings.benchPlayers = [...target.benchPlayers];
    }
    this.saveLocal();
    this.notify();
    return true;
  }

  saveCurrentAsSquad(name) {
    const squads = this.getSquads();
    const newId = 'sq_' + Date.now();
    const lineup = [...(this.settings.startingLineupF7 || [])];
    const starterSet = new Set(lineup);
    const activeBench = this.players.filter(p => !starterSet.has(p.id)).map(p => p.id);
    const liveRating = this.calculateTeamChemistryAndRating().rating || 82;
    const newSquad = {
      id: newId,
      name: name || `Plantilla ${squads.length + 1}`,
      modality: 'f7',
      formation: this.settings.activeFormationF7 || '1-3-2-1',
      startingLineup: lineup,
      benchPlayers: activeBench,
      rating: liveRating
    };
    squads.push(newSquad);
    this.settings.activeSquadId = newId;
    this.saveLocal();
    this.notify();
    return newSquad;
  }

  deleteSquad(squadId) {
    const squads = this.getSquads();
    if (squads.length <= 1) return false;
    this.settings.squads = squads.filter(s => s.id !== squadId);
    if (this.settings.activeSquadId === squadId) {
      this.settings.activeSquadId = this.settings.squads[0]?.id || 'sq_furia_f7';
    }
    this.saveLocal();
    this.notify();
    return true;
  }

  calculateTeamChemistryAndRating(slotRoles) {
    const startingPlayers = this.getActiveStarters();
    if (startingPlayers.length === 0) return { rating: 0 };

    const sumRating = startingPlayers.reduce((acc, p) => acc + (p.rating || 75), 0);
    const avgRating = Math.round(sumRating / startingPlayers.length);

    return {
      rating: avgRating
    };
  }

  getMatches() {
    return [...this.matches].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getNextMatch() {
    const upcoming = this.matches
      .filter(m => m.status === 'proximo' && (!m.modality || m.modality === this.settings.modality))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming.length > 0 ? upcoming[0] : (this.matches.find(m => m.status === 'proximo') || null);
  }

  getMatchById(id) {
    return this.matches.find(m => m.id === id);
  }

  addMatch(matchData) {
    const newMatch = {
      id: 'm_' + Date.now(),
      rival: matchData.rival || 'Rival por definir',
      tournament: matchData.tournament || this.settings.tournament || '',
      modality: matchData.modality || this.settings.modality,
      date: matchData.date || new Date().toISOString().split('T')[0],
      time: matchData.time || '20:00',
      field: matchData.field || 'Campo Deportivo Universidad',
      status: 'proximo',
      goalsFor: null,
      goalsAgainst: null,
      scorers: '',
      mvp: '',
      notes: matchData.notes || '',
      lineup: {
        titulares: this.getActiveStarters().map(p => p.id),
        suplentes: [],
        convocatoria: {}
      }
    };
    this.matches.push(newMatch);
    this.saveMatchCloud(newMatch);
    this.notify();
    return newMatch;
  }

  updateMatch(id, updates) {
    const idx = this.matches.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.matches[idx] = { ...this.matches[idx], ...updates };
      this.saveMatchCloud(this.matches[idx]);
      this.notify();
      return this.matches[idx];
    }
    return null;
  }

  deleteMatch(id) {
    this.matches = this.matches.filter(m => m.id !== id);
    this.deleteMatchCloud(id);
    this.notify();
  }

  setAttendance(matchId, playerId, status) {
    const match = this.getMatchById(matchId);
    if (match) {
      if (!match.lineup) match.lineup = { titulares: [], suplentes: [], convocatoria: {} };
      if (!match.lineup.convocatoria) match.lineup.convocatoria = {};
      match.lineup.convocatoria[playerId] = status;
      this.setAttendanceCloud(matchId, playerId, status);
      this.notify();
      return true;
    }
    return false;
  }

  getStats() {
    const finishedMatches = this.matches.filter(m => m.status === 'finalizado');
    let won = 0, drawn = 0, lost = 0, totalGF = 0, totalGA = 0;

    finishedMatches.forEach(m => {
      totalGF += (m.goalsFor || 0);
      totalGA += (m.goalsAgainst || 0);
      if (m.goalsFor > m.goalsAgainst) won++;
      else if (m.goalsFor === m.goalsAgainst) drawn++;
      else lost++;
    });

    const topScorers = [...this.players].sort((a, b) => b.goals - a.goals);
    const topAssists = [...this.players].sort((a, b) => b.assists - a.assists);

    return {
      played: finishedMatches.length,
      won, drawn, lost,
      totalGF, totalGA,
      diff: totalGF - totalGA,
      topScorers,
      topAssists
    };
  }

  // ==================== HISTORIAL DE MINUTOS Y PARTIDOS JUGADOS ====================
  getMatchLogs() {
    if (!Array.isArray(this.matchLogs)) this.matchLogs = [];
    return [...this.matchLogs].sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
  }

  recordPlayedMatch({ date, opponent, modality, duration, entries }) {
    if (!Array.isArray(this.matchLogs)) this.matchLogs = [];
    const newLog = {
      id: 'ml_' + Date.now(),
      date: date || new Date().toISOString().slice(0, 10),
      opponent: (opponent || 'Partido Oficial').trim(),
      modality: modality || this.settings.modality || 'f7',
      duration: Math.max(10, parseInt(duration, 10) || 50),
      entries: Array.isArray(entries) ? entries : [],
      createdAt: Date.now()
    };
    this.matchLogs.push(newLog);
    this.saveMatchLogCloud(newLog);
    this.notify();
    return newLog;
  }

  deleteMatchLog(logId) {
    this.matchLogs = (this.matchLogs || []).filter(l => l.id !== logId);
    this.deleteMatchLogCloud(logId);
    this.notify();
  }

  getPlayerMinutesSummary() {
    const summary = {};
    for (const p of this.players) {
      summary[p.id] = { totalMinutes: 0, matchesPlayed: 0, starterCount: 0, benchCount: 0 };
    }
    for (const log of this.getMatchLogs()) {
      for (const entry of (log.entries || [])) {
        if (!entry?.playerId) continue;
        if (!summary[entry.playerId]) {
          summary[entry.playerId] = { totalMinutes: 0, matchesPlayed: 0, starterCount: 0, benchCount: 0 };
        }
        const mins = Math.max(0, Number(entry.minutes) || 0);
        summary[entry.playerId].totalMinutes += mins;
        if (mins > 0 || entry.convoked) summary[entry.playerId].matchesPlayed += 1;
        if (entry.started) summary[entry.playerId].starterCount += 1;
        else if (entry.convoked) summary[entry.playerId].benchCount += 1;
      }
    }
    return summary;
  }

  resetToDefault() {
    this.players = [...DEFAULT_PLAYERS];
    this.matches = [...DEFAULT_MATCHES];
    this.matchLogs = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.notify();
  }
}

export const store = new TeamStore();
