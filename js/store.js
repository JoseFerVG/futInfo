/**
 * Capa de Datos (Store) - Estilo FIFA Ultimate Team (FUT)
 * Torneo del Rector: Fútbol 7 y Fútbol Sala
 */

const STORAGE_KEYS = {
  PLAYERS: 'futinfo_fifa_players_v3',
  MATCHES: 'futinfo_fifa_matches_v3',
  SETTINGS: 'futinfo_fifa_settings_v3'
};

// Facultades disponibles para afinidad de Química FUT
export const FACULTIES = [
  { id: 'inf', name: 'Ingeniería Informática', short: 'INF', color: '#0ea5e9', icon: '💻' },
  { id: 'med', name: 'Medicina y Salud', short: 'MED', color: '#10b981', icon: '🩺' },
  { id: 'der', name: 'Derecho y ADE', short: 'DER', color: '#f59e0b', icon: '⚖️' },
  { id: 'cafd', name: 'Ciencias del Deporte', short: 'CAFD', color: '#ef4444', icon: '⚡' },
  { id: 'eco', name: 'Economía y Empresa', short: 'ECO', color: '#8b5cf6', icon: '📈' },
  { id: 'psi', name: 'Psicología y Educación', short: 'PSI', color: '#ec4899', icon: '🧠' }
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

// Jugadores iniciales FIFA FUT
const DEFAULT_PLAYERS = [
  {
    id: 'p1',
    name: 'Carlos Ruiz',
    nickname: 'Charly',
    number: 1,
    rating: 83,
    cardType: 'gold',
    faculty: 'inf',
    chemStyle: 'CAT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-847291',
    phone: '612 345 678',
    email: 'carlos.gk@alumnos.edu',
    rolesHierarchy: {
      best: 'POR',
      second: 'CIE',
      third: 'DFC',
      worst: 'DC'
    },
    stats: { pac: 78, sho: 65, pas: 75, dri: 72, def: 84, phy: 85 },
    goals: 0,
    assists: 1,
    yellowCards: 0,
    redCards: 0
  },
  {
    id: 'p2',
    name: 'Alejandro Morales',
    nickname: 'Alex',
    number: 4,
    rating: 82,
    cardType: 'gold',
    faculty: 'inf',
    chemStyle: 'SHA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-918234',
    phone: '622 987 654',
    email: 'alex.def@alumnos.edu',
    rolesHierarchy: {
      best: 'DFC',
      second: 'CIE',
      third: 'MCD',
      worst: 'EI'
    },
    stats: { pac: 80, sho: 60, pas: 74, dri: 70, def: 86, phy: 88 },
    goals: 1,
    assists: 0,
    yellowCards: 2,
    redCards: 0
  },
  {
    id: 'p3',
    name: 'David Navarro',
    nickname: 'Kaiser',
    number: 5,
    rating: 80,
    cardType: 'gold',
    faculty: 'der',
    chemStyle: 'GLA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Zurdo',
    studentId: 'UNI-554412',
    phone: '633 445 566',
    email: 'david.n@alumnos.edu',
    rolesHierarchy: {
      best: 'LI',
      second: 'ALI',
      third: 'DFC',
      worst: 'POR'
    },
    stats: { pac: 84, sho: 68, pas: 76, dri: 78, def: 81, phy: 80 },
    goals: 2,
    assists: 1,
    yellowCards: 1,
    redCards: 0
  },
  {
    id: 'p4',
    name: 'Marcos Soto',
    nickname: 'Mago',
    number: 8,
    rating: 85,
    cardType: 'special',
    faculty: 'cafd',
    chemStyle: 'PWR',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-778899',
    phone: '644 112 233',
    email: 'marcos.s@alumnos.edu',
    rolesHierarchy: {
      best: 'MC',
      second: 'UNI',
      third: 'MCO',
      worst: 'POR'
    },
    stats: { pac: 81, sho: 80, pas: 89, dri: 88, def: 74, phy: 78 },
    goals: 4,
    assists: 6,
    yellowCards: 0,
    redCards: 0
  },
  {
    id: 'p5',
    name: 'Hugo Fernández',
    nickname: 'Pitu',
    number: 10,
    rating: 86,
    cardType: 'totw',
    faculty: 'inf',
    chemStyle: 'MRK',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Zurdo',
    studentId: 'UNI-665544',
    phone: '655 778 899',
    email: 'hugo.f@alumnos.edu',
    rolesHierarchy: {
      best: 'MCO',
      second: 'ALD',
      third: 'EI',
      worst: 'POR'
    },
    stats: { pac: 87, sho: 85, pas: 87, dri: 90, def: 58, phy: 72 },
    goals: 7,
    assists: 5,
    yellowCards: 1,
    redCards: 0
  },
  {
    id: 'p6',
    name: 'Pablo García',
    nickname: 'Tanque',
    number: 9,
    rating: 84,
    cardType: 'gold',
    faculty: 'cafd',
    chemStyle: 'MRK',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-112233',
    phone: '666 332 211',
    email: 'pablo.g@alumnos.edu',
    rolesHierarchy: {
      best: 'DC',
      second: 'PIV',
      third: 'ED',
      worst: 'POR'
    },
    stats: { pac: 85, sho: 88, pas: 73, dri: 81, def: 45, phy: 89 },
    goals: 9,
    assists: 2,
    yellowCards: 0,
    redCards: 0
  },
  {
    id: 'p7',
    name: 'Lucas Gil',
    nickname: 'Rayo',
    number: 11,
    rating: 81,
    cardType: 'gold',
    faculty: 'med',
    chemStyle: 'MRK',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-443322',
    phone: '677 889 900',
    email: 'lucas.gil@alumnos.edu',
    rolesHierarchy: {
      best: 'ED',
      second: 'ALD',
      third: 'DC',
      worst: 'DFC'
    },
    stats: { pac: 92, sho: 79, pas: 77, dri: 84, def: 42, phy: 70 },
    goals: 5,
    assists: 4,
    yellowCards: 1,
    redCards: 0
  },
  {
    id: 'p8',
    name: 'Sergio Ramos',
    nickname: 'Chechu',
    number: 3,
    rating: 79,
    cardType: 'gold',
    faculty: 'der',
    chemStyle: 'SHA',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    preferredFoot: 'Diestro',
    studentId: 'UNI-998877',
    phone: '688 221 144',
    email: 'sergio.r@alumnos.edu',
    rolesHierarchy: {
      best: 'LD',
      second: 'CIE',
      third: 'DFC',
      worst: 'POR'
    },
    stats: { pac: 81, sho: 62, pas: 75, dri: 76, def: 80, phy: 81 },
    goals: 1,
    assists: 2,
    yellowCards: 2,
    redCards: 0
  }
];

const DEFAULT_SETTINGS = {
  teamName: 'Furia Rector FC',
  shortName: 'FRF',
  tournament: 'Torneo del Rector 2026',
  modality: 'f7', // 'f7' o 'futsal'
  manager: {
    name: 'Míster José Fer',
    nationality: 'España',
    faculty: 'inf',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  specialists: {
    captain: 'p4',
    penalties: 'p6',
    freeKicks: 'p5',
    corners: 'p4'
  },
  activeFormationF7: '1-3-2-1',
  activeFormationFutsal: '1-1-2-1',
  startingLineupF7: ['p1', 'p3', 'p2', 'p8', 'p4', 'p5', 'p6'],
  startingLineupFutsal: ['p1', 'p2', 'p4', 'p5', 'p6'],
  benchPlayers: ['p7']
};

const DEFAULT_MATCHES = [
  {
    id: 'm1',
    rival: 'Medicina FC',
    tournament: 'Torneo del Rector - Jornada 3',
    modality: 'f7',
    date: '2026-11-18',
    time: '19:30',
    field: 'Campo Universitario 2 (Césped)',
    status: 'proximo',
    goalsFor: null,
    goalsAgainst: null,
    scorers: '',
    mvp: '',
    notes: 'Llevar camiseta principal. Puntualidad 30 min antes.',
    lineup: {
      titulares: ['p1', 'p3', 'p2', 'p8', 'p4', 'p5', 'p6'],
      suplentes: ['p7'],
      convocatoria: {
        'p1': 'asistira',
        'p2': 'asistira',
        'p3': 'duda',
        'p4': 'asistira',
        'p5': 'asistira',
        'p6': 'asistira',
        'p7': 'asistira',
        'p8': 'no_puede'
      }
    }
  },
  {
    id: 'm2',
    rival: 'Derecho & ADE Futsal',
    tournament: 'Torneo del Rector - Futsal J2',
    modality: 'futsal',
    date: '2026-11-12',
    time: '20:15',
    field: 'Pabellón Polideportivo Pista Azul',
    status: 'finalizado',
    goalsFor: 5,
    goalsAgainst: 2,
    scorers: 'Hugo Fernández (2), Pablo García (2), Marcos Soto (1)',
    mvp: 'Hugo Fernández',
    notes: 'Gran presión alta en rombo durante todo el partido.',
    lineup: {
      titulares: ['p1', 'p2', 'p4', 'p5', 'p6'],
      suplentes: ['p3', 'p7', 'p8'],
      convocatoria: {}
    }
  }
];

export class TeamStore {
  constructor() {
    this.players = [];
    this.matches = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = new Set();
    this.init();
  }

  init() {
    const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    this.players = savedPlayers ? JSON.parse(savedPlayers) : DEFAULT_PLAYERS;

    const savedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
    this.matches = savedMatches ? JSON.parse(savedMatches) : DEFAULT_MATCHES;

    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    this.settings = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;

    this.saveLocal();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveLocal();
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error("Error en suscriptor store:", err);
      }
    }
  }

  saveLocal() {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(this.players));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(this.matches));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  getPlayers() {
    return [...this.players].sort((a, b) => b.rating - a.rating);
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  addPlayer(data) {
    const defaultStats = {
      pac: parseInt(data.pac, 10) || 80,
      sho: parseInt(data.sho, 10) || 75,
      pas: parseInt(data.pas, 10) || 78,
      dri: parseInt(data.dri, 10) || 80,
      def: parseInt(data.def, 10) || 70,
      phy: parseInt(data.phy, 10) || 76
    };

    const calculatedRating = Math.round(
      (defaultStats.pac * 0.15) +
      (defaultStats.sho * 0.2) +
      (defaultStats.pas * 0.2) +
      (defaultStats.dri * 0.2) +
      (defaultStats.def * 0.15) +
      (defaultStats.phy * 0.1)
    );

    const newPlayer = {
      id: 'p_' + Date.now(),
      name: data.name || 'Nuevo Jugador',
      nickname: data.nickname || (data.name ? data.name.split(' ')[0] : 'Crack'),
      number: parseInt(data.number, 10) || (this.players.length + 1),
      rating: parseInt(data.rating, 10) || calculatedRating,
      cardType: data.cardType || 'gold',
      faculty: data.faculty || 'inf',
      chemStyle: data.chemStyle || 'BAS',
      avatar: data.avatar || `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 50000)}?w=150&auto=format&fit=crop&q=80`,
      preferredFoot: data.preferredFoot || 'Diestro',
      studentId: data.studentId || '',
      phone: data.phone || '',
      email: data.email || '',
      rolesHierarchy: {
        best: data.roleBest || 'DC',
        second: data.roleSecond || 'MC',
        third: data.roleThird || 'DFC',
        worst: data.roleWorst || 'POR'
      },
      stats: defaultStats,
      goals: parseInt(data.goals, 10) || 0,
      assists: parseInt(data.assists, 10) || 0,
      yellowCards: 0,
      redCards: 0
    };

    this.players.push(newPlayer);
    this.notify();
    return newPlayer;
  }

  updatePlayer(id, updates) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.players[idx] = { ...this.players[idx], ...updates };
      this.notify();
      return this.players[idx];
    }
    return null;
  }

  deletePlayer(id) {
    this.players = this.players.filter(p => p.id !== id);
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
    this.notify();
  }

  getActiveFormation() {
    return this.settings.modality === 'f7' 
      ? this.settings.activeFormationF7 
      : this.settings.activeFormationFutsal;
  }

  getStartingLineup() {
    const list = this.settings.modality === 'f7' 
      ? this.settings.startingLineupF7 
      : this.settings.startingLineupFutsal;
    return list.map(id => this.getPlayerById(id)).filter(Boolean);
  }

  swapStartingPlayer(slotIndex, newPlayerId) {
    const isF7 = this.settings.modality === 'f7';
    const lineup = isF7 ? [...this.settings.startingLineupF7] : [...this.settings.startingLineupFutsal];

    if (slotIndex >= 0 && slotIndex < lineup.length) {
      const oldPlayerId = lineup[slotIndex];
      lineup[slotIndex] = newPlayerId;

      if (isF7) this.settings.startingLineupF7 = lineup;
      else this.settings.startingLineupFutsal = lineup;

      this.notify();
      return { oldPlayerId, newPlayerId };
    }
    return null;
  }

  setSpecialist(role, playerId) {
    if (this.settings.specialists[role] !== undefined) {
      this.settings.specialists[role] = playerId;
      this.notify();
    }
  }

  calculateTeamChemistryAndRating(slotRoles) {
    const startingPlayers = this.getStartingLineup();
    if (startingPlayers.length === 0) return { rating: 0, chemistry: 0, playerChems: [] };

    const sumRating = startingPlayers.reduce((acc, p) => acc + (p.rating || 75), 0);
    const avgRating = Math.round(sumRating / startingPlayers.length);

    let totalChem = 0;
    const playerChems = [];

    startingPlayers.forEach((p, idx) => {
      const assignedRole = slotRoles[idx] || 'MC';
      let chem = 3;

      if (p.rolesHierarchy) {
        if (p.rolesHierarchy.best === assignedRole) chem += 4;
        else if (p.rolesHierarchy.second === assignedRole) chem += 2;
        else if (p.rolesHierarchy.third === assignedRole) chem += 1;
        else if (p.rolesHierarchy.worst === assignedRole) chem -= 2;
      }

      if (this.settings.manager && this.settings.manager.faculty === p.faculty) {
        chem += 1;
      }

      startingPlayers.forEach((other, oIdx) => {
        if (idx !== oIdx && other.faculty === p.faculty) {
          chem += 1;
        }
      });

      chem = Math.max(1, Math.min(10, chem));
      playerChems.push({ playerId: p.id, chem, assignedRole });
      totalChem += chem;
    });

    const maxPossible = startingPlayers.length * 10;
    const normalizedChem = Math.min(100, Math.round((totalChem / maxPossible) * 100));

    return {
      rating: avgRating,
      chemistry: normalizedChem,
      playerChems
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
      tournament: matchData.tournament || this.settings.tournament,
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
        titulares: this.getStartingLineup().map(p => p.id),
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

  resetToDefault() {
    this.players = [...DEFAULT_PLAYERS];
    this.matches = [...DEFAULT_MATCHES];
    this.settings = { ...DEFAULT_SETTINGS };
    this.notify();
  }
}

export const store = new TeamStore();
