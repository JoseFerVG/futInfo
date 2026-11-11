/**
 * Capa de Datos (Store) - Soporta Firestore en la nube o LocalStorage automático
 */
import { db, isFirebaseConfigured } from './firebase-config.js';

const STORAGE_KEYS = {
  PLAYERS: 'futinfo_players_v1',
  MATCHES: 'futinfo_matches_v1',
  SETTINGS: 'futinfo_settings_v1'
};

// Datos iniciales de demostración para el Torneo del Rector
const DEFAULT_PLAYERS = [
  {
    id: 'p1',
    name: 'Carlos Ruiz',
    nickname: 'Charly',
    number: 1,
    position: 'Portero',
    category: 'GK',
    studentId: 'UNI-847291',
    phone: '612 345 678',
    email: 'carlos.gk@alumnos.edu',
    goals: 0,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    feeStatus: 'pagado'
  },
  {
    id: 'p2',
    name: 'Alejandro Morales',
    nickname: 'Alex',
    number: 4,
    position: 'Defensa Central',
    category: 'DEF',
    studentId: 'UNI-918234',
    phone: '622 987 654',
    email: 'alex.def@alumnos.edu',
    goals: 1,
    assists: 0,
    yellowCards: 2,
    redCards: 0,
    feeStatus: 'pagado'
  },
  {
    id: 'p3',
    name: 'David Navarro',
    nickname: 'Kaiser',
    number: 5,
    position: 'Defensa / Lateral',
    category: 'DEF',
    studentId: 'UNI-554412',
    phone: '633 445 566',
    email: 'david.n@alumnos.edu',
    goals: 2,
    assists: 1,
    yellowCards: 1,
    redCards: 0,
    feeStatus: 'pendiente'
  },
  {
    id: 'p4',
    name: 'Marcos Soto',
    nickname: 'Mago',
    number: 8,
    position: 'Centrocampista Organizado',
    category: 'MID',
    studentId: 'UNI-778899',
    phone: '644 112 233',
    email: 'marcos.s@alumnos.edu',
    goals: 4,
    assists: 5,
    yellowCards: 0,
    redCards: 0,
    feeStatus: 'pagado'
  },
  {
    id: 'p5',
    name: 'Hugo Fernández',
    nickname: 'Pitu',
    number: 10,
    position: 'Mediapunta',
    category: 'MID',
    studentId: 'UNI-665544',
    phone: '655 778 899',
    email: 'hugo.f@alumnos.edu',
    goals: 6,
    assists: 3,
    yellowCards: 1,
    redCards: 0,
    feeStatus: 'pagado'
  },
  {
    id: 'p6',
    name: 'Pablo García',
    nickname: 'Tanque',
    number: 9,
    position: 'Delantero Centro',
    category: 'FWD',
    studentId: 'UNI-112233',
    phone: '666 332 211',
    email: 'pablo.g@alumnos.edu',
    goals: 8,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    feeStatus: 'pagado'
  },
  {
    id: 'p7',
    name: 'Lucas Gil',
    nickname: 'Rayo',
    number: 11,
    position: 'Extremo / Delantero',
    category: 'FWD',
    studentId: 'UNI-443322',
    phone: '677 889 900',
    email: 'lucas.gil@alumnos.edu',
    goals: 5,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    feeStatus: 'pendiente'
  },
  {
    id: 'p8',
    name: 'Sergio Ramos',
    nickname: 'Chechu',
    number: 3,
    position: 'Lateral Izquierdo',
    category: 'DEF',
    studentId: 'UNI-998877',
    phone: '688 221 144',
    email: 'sergio.r@alumnos.edu',
    goals: 0,
    assists: 2,
    yellowCards: 2,
    redCards: 0,
    feeStatus: 'parcial'
  }
];

const DEFAULT_MATCHES = [
  {
    id: 'm1',
    rival: 'Medicina FC',
    tournament: 'Torneo del Rector - Jornada 3',
    date: '2026-11-18',
    time: '19:30',
    field: 'Campo Universitario 2 (Césped)',
    status: 'proximo', // 'proximo' | 'finalizado'
    formation: '3-2-1', // Fútbol 7: 1 GK, 3 DEF, 2 MID, 1 FWD
    formationType: 'f7',
    goalsFor: null,
    goalsAgainst: null,
    scorers: '',
    mvp: '',
    notes: 'Llevar camiseta azul principal. Puntualidad 30 min antes.',
    lineup: {
      titulares: ['p1', 'p2', 'p3', 'p8', 'p4', 'p5', 'p6'],
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
    rival: 'Derecho & Empresa United',
    tournament: 'Torneo del Rector - Jornada 2',
    date: '2026-11-11',
    time: '20:00',
    field: 'Campo Universitario 1',
    status: 'finalizado',
    formation: '3-2-1',
    formationType: 'f7',
    goalsFor: 4,
    goalsAgainst: 2,
    scorers: 'Hugo Fernández (2), Pablo García (1), Marcos Soto (1)',
    mvp: 'Hugo Fernández',
    notes: 'Gran victoria remontando en la segunda parte.',
    lineup: {
      titulares: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
      suplentes: ['p8'],
      convocatoria: {}
    }
  },
  {
    id: 'm3',
    rival: 'Informática Athletic',
    tournament: 'Torneo del Rector - Jornada 1',
    date: '2026-11-04',
    time: '18:00',
    field: 'Pabellón Polideportivo Central',
    status: 'finalizado',
    formation: '3-2-1',
    formationType: 'f7',
    goalsFor: 3,
    goalsAgainst: 3,
    scorers: 'Pablo García (2), David Navarro (1)',
    mvp: 'Pablo García',
    notes: 'Empate disputado hasta el último minuto.',
    lineup: {
      titulares: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p8'],
      suplentes: ['p7'],
      convocatoria: {}
    }
  }
];

const DEFAULT_SETTINGS = {
  teamName: 'Furia Rector FC',
  shortName: 'FRF',
  tournament: 'Torneo del Rector 2026',
  colorPrimary: '#0284c7', // Sky 600
  colorSecondary: '#0f172a',
  coachName: 'Míster José Fernando',
  defaultModality: 'f7', // f7 o f11
  feeAmount: 35 // Cuota en euros por jugador
};

export class TeamStore {
  constructor() {
    this.players = [];
    this.matches = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Cargar desde LocalStorage
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

  // --- JUGADORES ---
  getPlayers() {
    return [...this.players].sort((a, b) => a.number - b.number);
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  addPlayer(playerData) {
    const newPlayer = {
      id: 'p_' + Date.now(),
      name: playerData.name || 'Nuevo Jugador',
      nickname: playerData.nickname || '',
      number: parseInt(playerData.number, 10) || 0,
      position: playerData.position || 'Medio',
      category: playerData.category || 'MID',
      studentId: playerData.studentId || '',
      phone: playerData.phone || '',
      email: playerData.email || '',
      goals: parseInt(playerData.goals, 10) || 0,
      assists: parseInt(playerData.assists, 10) || 0,
      yellowCards: parseInt(playerData.yellowCards, 10) || 0,
      redCards: parseInt(playerData.redCards, 10) || 0,
      feeStatus: playerData.feeStatus || 'pendiente'
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

  // --- PARTIDOS ---
  getMatches() {
    return [...this.matches].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getNextMatch() {
    const upcoming = this.matches
      .filter(m => m.status === 'proximo')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  getMatchById(id) {
    return this.matches.find(m => m.id === id);
  }

  addMatch(matchData) {
    const newMatch = {
      id: 'm_' + Date.now(),
      rival: matchData.rival || 'Rival por definir',
      tournament: matchData.tournament || this.settings.tournament,
      date: matchData.date || new Date().toISOString().split('T')[0],
      time: matchData.time || '20:00',
      field: matchData.field || 'Campo Deportivo Universidad',
      status: matchData.status || 'proximo',
      formation: matchData.formation || (this.settings.defaultModality === 'f7' ? '3-2-1' : '4-3-3'),
      formationType: matchData.formationType || this.settings.defaultModality,
      goalsFor: matchData.goalsFor !== undefined ? matchData.goalsFor : null,
      goalsAgainst: matchData.goalsAgainst !== undefined ? matchData.goalsAgainst : null,
      scorers: matchData.scorers || '',
      mvp: matchData.mvp || '',
      notes: matchData.notes || '',
      lineup: {
        titulares: matchData.titulares || [],
        suplentes: matchData.suplentes || [],
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
      match.lineup.convocatoria[playerId] = status; // 'asistira' | 'duda' | 'no_puede'
      this.notify();
      return true;
    }
    return false;
  }

  // --- CONFIGURACIÓN EQUIPO ---
  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
  }

  // Estadísticas globales del equipo
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

    const totalCollected = this.players.filter(p => p.feeStatus === 'pagado').length * this.settings.feeAmount;
    const totalExpected = this.players.length * this.settings.feeAmount;

    return {
      played: finishedMatches.length,
      won,
      drawn,
      lost,
      totalGF,
      totalGA,
      diff: totalGF - totalGA,
      topScorers,
      topAssists,
      totalCollected,
      totalExpected
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
