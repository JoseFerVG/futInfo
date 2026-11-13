/**
 * Capa de Datos (Store) - Estilo FIFA Ultimate Team (FUT)
 * Torneo del Rector: Fútbol 7 y Fútbol Sala
 */

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

export const ROLES_FUTSAL = [
  { code: 'POR', name: 'Portero de Sala (GK)', category: 'GK' },
  { code: 'CIE', name: 'Cierre (Último hombre)', category: 'DEF' },
  { code: 'ALD', name: 'Ala Derecho', category: 'MID' },
  { code: 'ALI', name: 'Ala Izquierdo', category: 'MID' },
  { code: 'PIV', name: 'Pívot (Delantero boya)', category: 'FWD' },
  { code: 'UNI', name: 'Universal (Polivalente)', category: 'MID' }
];

// Jugadores iniciales vacíos — se completa exclusivamente con usuarios reales autenticados con Google
const DEFAULT_PLAYERS = [];

const DEFAULT_SETTINGS = {
  teamName: 'Furia Rector FC',
  shortName: 'FUR',
  tournament: '',
  modality: 'f7', // 'f7' o 'futsal'
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
  activeFormationFutsal: '1-1-2-1',
  startingLineupF7: [],
  startingLineupFutsal: [],
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
    },
    {
      id: 'sq_sala_elite',
      name: 'Furia Futsal Sala',
      modality: 'futsal',
      formation: '1-1-2-1',
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
    this.listeners = new Set();
    this._db = null;
    this._cloudUnsub = null;
    this._cloudSaveTimer = null;
    this._isApplyingRemote = false;
    this._lastCloudTs = 0;
    this._pendingAddIds = new Set();
    this._deletedPlayerIds = new Set();
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

    if (!this.settings.squads || !Array.isArray(this.settings.squads) || this.settings.squads.length === 0) {
      this.settings.squads = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.squads));
      this.settings.activeSquadId = DEFAULT_SETTINGS.activeSquadId;
    }
    if (!this.settings.activeSquadId) {
      this.settings.activeSquadId = this.settings.squads[0]?.id || 'sq_furia_f7';
    }

    this.saveLocal();
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
    if (!this._isApplyingRemote) {
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

  async initCloudSync(db) {
    if (!db || this._cloudUnsub) return;
    this._db = db;
    try {
      const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const teamRef = doc(db, 'teams', FIRESTORE_TEAM_DOC);

      this._cloudUnsub = onSnapshot(teamRef, (snap) => {
        if (!snap.exists()) return;
        const remote = snap.data();
        const remoteTs = remote?.updatedAt || 0;
        if (remoteTs && remoteTs <= this._lastCloudTs) return;

        this._lastCloudTs = remoteTs;
        this._isApplyingRemote = true;
        try {
          if (Array.isArray(remote.players)) {
            const remoteFiltered = remote.players.filter(p => p && !this._deletedPlayerIds.has(p.id));
            const remoteIds = new Set(remoteFiltered.map(p => p.id));
            const pendingLocals = this.players.filter(p => p && this._pendingAddIds.has(p.id) && !remoteIds.has(p.id));
            this.players = this.deduplicatePlayers([...remoteFiltered, ...pendingLocals]);
          }
          if (Array.isArray(remote.matches)) {
            this.matches = remote.matches;
          }
          if (Array.isArray(remote.matchLogs)) {
            const remoteLogIds = new Set(remote.matchLogs.map(l => l.id));
            const unsyncedLogs = (this.matchLogs || []).filter(l => l && !remoteLogIds.has(l.id));
            this.matchLogs = [...remote.matchLogs, ...unsyncedLogs];
          }
          if (remote.settings && typeof remote.settings === 'object') {
            this.settings = { ...this.settings, ...remote.settings };
          }
          this.saveLocal();
          for (const listener of this.listeners) {
            try {
              listener(this);
            } catch (err) {
              console.error("Error en suscriptor store tras sync:", err);
            }
          }
        } finally {
          this._isApplyingRemote = false;
        }
      }, (err) => {
        console.warn("[Firestore] Canal tiempo real en modo lectura local:", err.code || err.message);
      });
    } catch (err) {
      console.warn("[Firestore] No se pudo activar sync:", err);
    }
  }

  scheduleCloudSave() {
    if (!this._db) return;
    clearTimeout(this._cloudSaveTimer);
    this._cloudSaveTimer = setTimeout(() => {
      this.pushCloudState();
    }, 350);
  }

  async pushCloudState() {
    if (!this._db) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const ts = Date.now();
      this._lastCloudTs = ts;
      await setDoc(doc(this._db, 'teams', FIRESTORE_TEAM_DOC), {
        players: this.players,
        matches: this.matches,
        matchLogs: this.matchLogs,
        settings: this.settings,
        updatedAt: ts
      }, { merge: true });
      this._pendingAddIds.clear();
    } catch (err) {
      console.warn("[Firestore] Guardado local activo (nube no escribió):", err.code || err.message);
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
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanName = (data.name || '').toLowerCase().trim();

    // Comprobar si ya existe un jugador con este email o nombre exacto
    const existing = this.players.find(p => 
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
      id: 'p_' + Date.now(),
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
    if (!Array.isArray(this.settings.startingLineupFutsal)) this.settings.startingLineupFutsal = [];

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
    placeInto(this.settings.startingLineupFutsal, 5);

    if (Array.isArray(this.settings.squads)) {
      this.settings.squads.forEach(sq => {
        if (!Array.isArray(sq.startingLineup)) sq.startingLineup = [];
        const cap = sq.modality === 'futsal' ? 5 : 7;
        placeInto(sq.startingLineup, cap);
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

  setModality(modality) {
    if (modality === 'f7' || modality === 'futsal') {
      this.settings.modality = modality;
      this.notify();
    }
  }

  setFormation(formation) {
    if (this.settings.modality === 'f7') {
      this.settings.activeFormationF7 = formation;
    } else {
      this.settings.activeFormationFutsal = formation;
    }
    this._syncActiveSquadLineup();
    this.notify();
  }

  getActiveFormation() {
    return this.settings.modality === 'f7' 
      ? this.settings.activeFormationF7 
      : this.settings.activeFormationFutsal;
  }

  getModalityCapacity() {
    return this.settings.modality === 'f7' ? 7 : 5;
  }

  getStartingLineup() {
    const isF7 = this.settings.modality === 'f7';
    const cap = isF7 ? 7 : 5;
    const raw = isF7 ? (this.settings.startingLineupF7 || []) : (this.settings.startingLineupFutsal || []);
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
    const isF7 = this.settings.modality === 'f7';
    sq.modality = this.settings.modality;
    sq.formation = isF7 ? this.settings.activeFormationF7 : this.settings.activeFormationFutsal;
    const rawLineup = isF7 ? (this.settings.startingLineupF7 || []) : (this.settings.startingLineupFutsal || []);
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
    const isF7 = this.settings.modality === 'f7';
    const ids = players.map(p => (p ? (typeof p === 'string' ? p : p.id) : null));
    if (isF7) this.settings.startingLineupF7 = ids;
    else this.settings.startingLineupFutsal = ids;
    this._syncActiveSquadLineup();
    this.notify();
  }

  resetStartingLineup() {
    const sorted = this.getPlayers().map(p => p.id);
    this.settings.startingLineupF7 = sorted.slice(0, 7);
    this.settings.startingLineupFutsal = sorted.slice(0, 5);
    this._syncActiveSquadLineup();
    this.notify();
  }

  swapStartingPlayer(slotIndex, newPlayerId) {
    const isF7 = this.settings.modality === 'f7';
    const cap = isF7 ? 7 : 5;
    if (slotIndex < 0 || slotIndex >= cap) return null;

    const src = isF7 ? (this.settings.startingLineupF7 || []) : (this.settings.startingLineupFutsal || []);
    const lineup = Array.from({ length: cap }, (_, i) => src[i] || null);
    const oldPlayerId = lineup[slotIndex];

    // Evitar duplicados si newPlayerId ya estaba en otro slot titular
    const existingOtherIdx = lineup.findIndex((id, i) => i !== slotIndex && id === newPlayerId);
    if (existingOtherIdx !== -1) {
      lineup[existingOtherIdx] = oldPlayerId;
    }
    lineup[slotIndex] = newPlayerId || null;

    if (isF7) this.settings.startingLineupF7 = lineup;
    else this.settings.startingLineupFutsal = lineup;

    this._syncActiveSquadLineup();
    this.notify();
    return { oldPlayerId, newPlayerId };
  }

  swapTwoStarters(idx1, idx2) {
    const isF7 = this.settings.modality === 'f7';
    const cap = isF7 ? 7 : 5;
    if (idx1 < 0 || idx1 >= cap || idx2 < 0 || idx2 >= cap) return false;

    const src = isF7 ? (this.settings.startingLineupF7 || []) : (this.settings.startingLineupFutsal || []);
    const lineup = Array.from({ length: cap }, (_, i) => src[i] || null);

    const temp = lineup[idx1];
    lineup[idx1] = lineup[idx2];
    lineup[idx2] = temp;

    if (isF7) this.settings.startingLineupF7 = lineup;
    else this.settings.startingLineupFutsal = lineup;

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
    this.settings.modality = target.modality;
    if (target.modality === 'f7') {
      this.settings.activeFormationF7 = target.formation;
      this.settings.startingLineupF7 = [...target.startingLineup];
    } else {
      this.settings.activeFormationFutsal = target.formation;
      this.settings.startingLineupFutsal = [...target.startingLineup];
    }
    if (Array.isArray(target.benchPlayers)) {
      this.settings.benchPlayers = [...target.benchPlayers];
    }
    this.saveLocal();
    this.notify();
    return true;
  }

  saveCurrentAsSquad(name) {
    const isF7 = this.settings.modality === 'f7';
    const squads = this.getSquads();
    const newId = 'sq_' + Date.now();
    const lineup = isF7 ? [...this.settings.startingLineupF7] : [...this.settings.startingLineupFutsal];
    const starterSet = new Set(lineup);
    const activeBench = this.players.filter(p => !starterSet.has(p.id)).map(p => p.id);
    const liveRating = this.calculateTeamChemistryAndRating().rating || 82;
    const newSquad = {
      id: newId,
      name: name || `Plantilla ${squads.length + 1}`,
      modality: this.settings.modality,
      formation: isF7 ? this.settings.activeFormationF7 : this.settings.activeFormationFutsal,
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
    this.notify();
    return newMatch;
  }

  updateMatch(id, updates) {
    const idx = this.matches.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.matches[idx] = { ...this.matches[idx], ...updates };
      this.notify();
      return this.matches[idx];
    }
    return null;
  }

  deleteMatch(id) {
    this.matches = this.matches.filter(m => m.id !== id);
    this.notify();
  }

  setAttendance(matchId, playerId, status) {
    const match = this.getMatchById(matchId);
    if (match) {
      if (!match.lineup) match.lineup = { titulares: [], suplentes: [], convocatoria: {} };
      if (!match.lineup.convocatoria) match.lineup.convocatoria = {};
      match.lineup.convocatoria[playerId] = status;
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
    this.notify();
    return newLog;
  }

  deleteMatchLog(logId) {
    this.matchLogs = (this.matchLogs || []).filter(l => l.id !== logId);
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
