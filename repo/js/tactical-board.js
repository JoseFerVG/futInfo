/**
 * Pizarra Táctica Interactiva y Plan de Partido (Fútbol 7)
 * Permite mover jugadores/rivales/balón, dibujar pases rectos y curvos, desmarques,
 * zonas, trazo libre, simular la jugada animada y organizar la estrategia del partido.
 */
import { store } from './store.js';

const BOARD_STORAGE_KEY = 'futinfo_tactical_board_v2';

const DEFAULT_F7_SLOTS = [
  { role: 'POR', top: 86, left: 50 },
  { role: 'DFC', top: 66, left: 28 },
  { role: 'DFC', top: 66, left: 72 },
  { role: 'MC', top: 46, left: 50 },
  { role: 'EI', top: 32, left: 18 },
  { role: 'ED', top: 32, left: 82 },
  { role: 'DC', top: 18, left: 50 }
];

const RIVAL_FORMATIONS = {
  '1-3-2-1': [
    { role: 'POR', top: 86, left: 50 },
    { role: 'LI', top: 67, left: 22 },
    { role: 'DFC', top: 70, left: 50 },
    { role: 'LD', top: 67, left: 78 },
    { role: 'MC', top: 45, left: 34 },
    { role: 'MC', top: 45, left: 66 },
    { role: 'DC', top: 21, left: 50 }
  ],
  '1-2-3-1': [
    { role: 'POR', top: 86, left: 50 },
    { role: 'DFC', top: 68, left: 32 },
    { role: 'DFC', top: 68, left: 68 },
    { role: 'EI', top: 43, left: 18 },
    { role: 'MC', top: 46, left: 50 },
    { role: 'ED', top: 43, left: 82 },
    { role: 'DC', top: 20, left: 50 }
  ],
  '1-3-1-2': [
    { role: 'POR', top: 86, left: 50 },
    { role: 'LI', top: 67, left: 22 },
    { role: 'DFC', top: 70, left: 50 },
    { role: 'LD', top: 67, left: 78 },
    { role: 'MC', top: 46, left: 50 },
    { role: 'DC', top: 22, left: 35 },
    { role: 'DC', top: 22, left: 65 }
  ]
};

export const TACTICAL_PRESETS = {
  salida: {
    id: 'salida',
    label: 'Salida de Puerta',
    shortDesc: 'Centrales abiertos al vértice, laterales altos y apoyo interior del mediocentro.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Portero con balón esperando al primer saltador rival. Centrales abren a las esquinas del área; laterales ganan altura para fijar a los extremos contrarios.',
      attack: 'Si tapan al mediocentro, balón al costado libre y apoyo de cara al interior. Buscar el 2 vs 1 por banda antes de girar al lado opuesto.',
      defense: 'Si perdemos en salida, el más cercano acosa 3 segundos mientras el cierre restante protege el pasillo central hacia portería.',
      setPieces: 'En saque de puerta: opción A corta al central libre; opción B envío tenso al pecho del delantero con caída del MCO a segunda jugada.',
      rotations: 'Bloques de cambio cada 8-10 minutos manteniendo siempre un central/pivote fresco atrás para sostener la salida.'
    },
    shapes: [
      { type: 'pass', x1: 11, y1: 50, x2: 24, y2: 23 },
      { type: 'pass', x1: 25, y1: 24, x2: 47, y2: 35 },
      { type: 'curve', x1: 48, y1: 36, x2: 63, y2: 79 },
      { type: 'run', x1: 31, y1: 81, x2: 58, y2: 83 },
      { type: 'run', x1: 71, y1: 50, x2: 85, y2: 38 },
      { type: 'zone', x1: 41, y1: 14, x2: 64, y2: 42 }
    ]
  },
  ataque: {
    id: 'ataque',
    label: 'Ataque Posicional',
    shortDesc: 'Triángulos por banda, mediapunta entre líneas y llegada al segundo palo.',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Circular rápido de lado a lado con máximo 2-3 toques hasta encontrar pasillo interior abierto o banda libre.',
      attack: 'Cuando el extremo gana línea de fondo o esquina del área, el DC arrastra al primer palo y el extremo opuesto cierra al segundo palo.',
      defense: 'Mientras atacamos en 3/4, los 2 defensores quedan vigilando por dentro (vigilancia 2 vs 1) preparados para cortar rechaces.',
      setPieces: 'Si provocamos córner o falta lateral, acelerar si están desordenados o pausar para colocar la jugada ensayada.',
      rotations: 'Oxigenar extremos y media punta con más recorrido para mantener desequilibrio en 1 vs 1 todo el partido.'
    },
    shapes: [
      { type: 'pass', x1: 38, y1: 38, x2: 58, y2: 20 },
      { type: 'pass', x1: 60, y1: 21, x2: 74, y2: 36 },
      { type: 'curve', x1: 76, y1: 36, x2: 89, y2: 64 },
      { type: 'run', x1: 69, y1: 68, x2: 88, y2: 65 },
      { type: 'run', x1: 75, y1: 48, x2: 86, y2: 43 },
      { type: 'zone', x1: 74, y1: 32, x2: 92, y2: 70 }
    ]
  },
  presion: {
    id: 'presion',
    label: 'Presión 3s',
    shortDesc: 'Acoso inmediato tras pérdida durante 3 segundos cerrando pases interiores.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Tras robo en campo rival, primer pase vertical al desmarque o cambio de orientación antes de que replieguen.',
      attack: 'Finalizar jugada rápido en 3-4 pases: evitar pérdidas tontas en la frontal que nos pillen abiertos atrás.',
      defense: 'Al perderla, los 2 más cercanos saltan al poseedor orientando su salida hacia la línea de banda; el resto cierra líneas interiores.',
      setPieces: 'En saques de banda rivales en nuestro campo, emparejar fuerte al receptor cercano sin descuidar el giro.',
      rotations: 'Avisar al banquillo cuando baje la chispa en presión tras pérdida para rotar delanteros y medios frescos.'
    },
    shapes: [
      { type: 'shot', x1: 70, y1: 48, x2: 84, y2: 26 },
      { type: 'shot', x1: 60, y1: 34, x2: 73, y2: 40 },
      { type: 'run', x1: 58, y1: 68, x2: 70, y2: 52 },
      { type: 'zone', x1: 72, y1: 10, x2: 96, y2: 46 }
    ]
  },
  contra: {
    id: 'contra',
    label: 'Bloque y Contra',
    shortDesc: 'Dos líneas compactas en medio campo + robo + salida vertical al espacio.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Bloque ordenado sin saltar de uno en uno: obligarles a jugar por fuera y robar en nuestro carril medio.',
      attack: 'En cuanto recuperamos, mirada arriba en 1 segundo: balón al apoyo del mediocentro o ruptura profunda a espalda de su lateral.',
      defense: 'Distancia de 10-12 metros entre defensa y centro del campo. Prohibido partir el equipo.',
      setPieces: 'Dejar siempre 1 jugador rápido descolgado arriba en saques de esquina defensivos para lanzar la transición.',
      rotations: 'Reservar gente veloz en bandas para castigar los espacios finales cuando el rival arriesgue.'
    },
    shapes: [
      { type: 'zone', x1: 22, y1: 20, x2: 45, y2: 80 },
      { type: 'pass', x1: 36, y1: 48, x2: 54, y2: 31 },
      { type: 'pass', x1: 56, y1: 31, x2: 83, y2: 25 },
      { type: 'run', x1: 66, y1: 46, x2: 86, y2: 28 },
      { type: 'run', x1: 58, y1: 68, x2: 80, y2: 63 }
    ]
  },
  corner_fav: {
    id: 'corner_fav',
    label: 'Córner a Favor',
    shortDesc: 'Señal del lanzador: arrastre al 1er palo, remate punto penalti / 2º palo y frontal.',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Brazo arriba del lanzador = envío tenso al 1er palo; dos brazos = abierta al 2º palo o frontal del área.',
      attack: 'Un atacante arrastra al 1er palo, dos atacan punto penalti / 2º palo con carrera desde fuera y uno espera el rechace limpio.',
      defense: 'Siempre 2 cierres atrás en vigilancia 2 vs 1 cerca del círculo central para cortar cualquier contra rival.',
      setPieces: 'Si tapan la zona central, opción rápida en corto al compañero que ofrece línea lateral para centro con mejor ángulo.',
      rotations: 'Asegurar que nuestro especialista designado en Córners esté en el césped en tramos clave.'
    },
    shapes: [
      { type: 'curve', x1: 95, y1: 93, x2: 82, y2: 44 },
      { type: 'run', x1: 68, y1: 36, x2: 83, y2: 42 },
      { type: 'run', x1: 66, y1: 56, x2: 83, y2: 60 },
      { type: 'run', x1: 52, y1: 50, x2: 66, y2: 50 },
      { type: 'zone', x1: 77, y1: 36, x2: 91, y2: 64 }
    ]
  },
  falta_abp: {
    id: 'falta_abp',
    label: 'Falta Frontal ABP',
    shortDesc: 'Disparo directo o amago + pase filtrado al desmarque por detrás de la barrera.',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Dos perfiles junto al balón (zurdo y diestro) para sembrar duda sobre tiro directo o pase interior.',
      attack: 'Opción 1: golpeo colocado por encima o palo del portero. Opción 2: amago por encima y toque al desmarque por fuera de barrera.',
      defense: 'Mínimo 2 jugadores cubriendo espalda por si la barrera despeja largo y sale contra rival.',
      setPieces: 'Un jugador atento al rechace del portero para empujar en segunda acción sin caer en precipitación.',
      rotations: 'Dar galones al especialista en faltas configurado en Especialistas del Club.'
    },
    shapes: [
      { type: 'shot', x1: 58, y1: 34, x2: 93, y2: 46 },
      { type: 'pass', x1: 58, y1: 34, x2: 75, y2: 20 },
      { type: 'run', x1: 65, y1: 20, x2: 84, y2: 25 },
      { type: 'zone', x1: 78, y1: 18, x2: 91, y2: 36 }
    ]
  },
  defensa_abp: {
    id: 'defensa_abp',
    label: 'Defensa Balón Parado',
    shortDesc: 'Marcaje mixto: 1 en primer palo + 3 en zona de área +frontal + punta descolgado.',
    zoneView: 'buildup',
    showRivals: true,
    notes: {
      buildUp: 'Al recuperar portero o despejar limpio, abrir rápido hacia nuestras bandas para lanzar salida limpia.',
      attack: 'Dejar siempre 1 delantero adelantado cerca del centro del campo para fijar dos rivales atrás.',
      defense: '1 jugador pegado al 1er palo, 3 defendiendo zona de área pequeña/penalti sin perder de vista balón ni marca, y 1 en la frontal.',
      setPieces: 'Concentración hasta el segundo despeje; todo el equipo sale en bloque tras alejar el peligro.',
      rotations: 'Evitar sustituciones justo en el instante previo a defender un córner o falta lateral rival.'
    },
    shapes: [
      { type: 'zone', x1: 10, y1: 34, x2: 24, y2: 66 },
      { type: 'shot', x1: 28, y1: 50, x2: 36, y2: 48 },
      { type: 'pass', x1: 12, y1: 50, x2: 46, y2: 24 },
      { type: 'run', x1: 42, y1: 26, x2: 68, y2: 22 }
    ]
  }
};

function projectToHorizontalPitch(slots, zoneView = 'full', team = 'home', getFormationFn = null) {
  const players = store.getStartingLineup();
  return slots.map((slot, idx) => {
    const p = team === 'home' ? players[idx] : null;
    const depth = (100 - slot.top) / 100;
    let x;
    let y = slot.left;

    if (team === 'home') {
      if (zoneView === 'attack') {
        x = slot.role === 'POR' ? 12 : Math.min(91, 24 + depth * 68);
      } else if (zoneView === 'buildup') {
        x = slot.role === 'POR' ? 8 : Math.min(82, 14 + depth * 58);
      } else {
        x = slot.role === 'POR' ? 9 : 14 + depth * 56;
      }
      return {
        id: `home_${idx}`,
        team: 'home',
        playerId: p?.id || null,
        label: p ? String(p.number ?? idx + 1) : String(idx + 1),
        subLabel: p ? (p.nickname || p.name?.split(' ')[0] || slot.role).toUpperCase().slice(0, 9) : slot.role,
        role: slot.role,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      };
    }

    x = zoneView === 'attack'
      ? (slot.role === 'POR' ? 94 : Math.max(54, 93 - depth * 38))
      : (zoneView === 'buildup'
        ? (slot.role === 'POR' ? 88 : Math.max(28, 72 - depth * 52))
        : (slot.role === 'POR' ? 91 : 86 - depth * 44));
    y = 100 - slot.left;
    return {
      id: `away_${idx}`,
      team: 'away',
      label: `R${idx + 1}`,
      subLabel: slot.role,
      role: slot.role,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10
    };
  });
}

function defaultHorizontalFormation(zoneView = 'full', team = 'home', getFormationFn = null, awayFormation = '1-3-2-1') {
  if (team === 'away') {
    const rivalSlots = RIVAL_FORMATIONS[awayFormation] || RIVAL_FORMATIONS['1-3-2-1'];
    return projectToHorizontalPitch(rivalSlots, zoneView, 'away', getFormationFn);
  }
  const conf = typeof getFormationFn === 'function' ? getFormationFn('f7', store.getActiveFormation()) : null;
  const baseSlots = (conf?.slots?.length ? conf.slots : DEFAULT_F7_SLOTS).slice(0, 7);
  return projectToHorizontalPitch(baseSlots, zoneView, 'home', getFormationFn);
}

function applyPresetCoordinates(presetId, home, away) {
  if (presetId === 'salida') {
    if (home[0]) { home[0].x = 10; home[0].y = 50; }
    if (home[1]) { home[1].x = 24; home[1].y = 22; }
    if (home[2]) { home[2].x = 22; home[2].y = 74; }
    if (home[3]) { home[3].x = 34; home[3].y = 84; }
    if (home[4]) { home[4].x = 46; home[4].y = 35; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 12.5, y: 50 };
  }
  if (presetId === 'ataque') {
    if (home[0]) { home[0].x = 16; home[0].y = 50; }
    if (home[1]) { home[1].x = 38; home[1].y = 38; }
    if (home[2]) { home[2].x = 40; home[2].y = 64; }
    if (home[3]) { home[3].x = 58; home[3].y = 20; }
    if (home[4]) { home[4].x = 72; home[4].y = 36; }
    if (home[5]) { home[5].x = 75; home[5].y = 49; }
    if (home[6]) { home[6].x = 69; home[6].y = 68; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 59, y: 21 };
  }
  if (presetId === 'presion') {
    home.forEach((t, i) => { if (i > 0) t.x = Math.min(84, t.x + 18); });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 84, y: 24 };
  }
  if (presetId === 'contra') {
    home.forEach((t, i) => { if (i > 0) t.x = Math.max(20, Math.min(52, t.x - 10)); });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 36, y: 48 };
  }
  if (presetId === 'corner_fav') {
    const spots = [
      { x: 16, y: 50 }, { x: 48, y: 38 }, { x: 48, y: 62 },
      { x: 66, y: 35 }, { x: 66, y: 58 }, { x: 54, y: 50 }, { x: 95, y: 94 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 95, y: 93 };
  }
  if (presetId === 'falta_abp') {
    const spots = [
      { x: 15, y: 50 }, { x: 42, y: 36 }, { x: 42, y: 64 },
      { x: 58, y: 34 }, { x: 65, y: 20 }, { x: 75, y: 55 }, { x: 72, y: 42 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    if (away[2]) { away[2].x = 76; away[2].y = 39; }
    if (away[3]) { away[3].x = 76; away[3].y = 43; }
    if (away[4]) { away[4].x = 76; away[4].y = 47; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 59, y: 34 };
  }
  if (presetId === 'defensa_abp') {
    const spots = [
      { x: 8, y: 50 }, { x: 13, y: 39 }, { x: 18, y: 47 },
      { x: 18, y: 58 }, { x: 26, y: 50 }, { x: 42, y: 26 }, { x: 20, y: 69 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 12, y: 92 };
  }
  return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
}

function buildPresetTokens(presetId, getFormationFn = null, awayFormation = '1-3-2-1') {
  const preset = TACTICAL_PRESETS[presetId] || TACTICAL_PRESETS.salida;
  const zoneView = preset.zoneView || 'full';
  const home = defaultHorizontalFormation(zoneView, 'home', getFormationFn, awayFormation);
  const away = defaultHorizontalFormation(zoneView, 'away', getFormationFn, awayFormation);
  const ball = applyPresetCoordinates(presetId, home, away);
  return { tokens: [...home, ...away, ball], zoneView };
}

function quadBezierPoint(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export class TacticalBoardController {
  constructor() {
    this.state = null;
    this.getFormationFn = null;
    this._drag = null;
    this._draftShape = null;
    this._initialized = false;
    this._selectedTokenId = null;
    this._animFrame = null;
    this._animPreview = null;
    this._activeStepIdx = -1;
  }

  ensureState() {
    if (!this.state) {
      this.state = this.loadState();
    }
    return this.state;
  }

  loadState() {
    try {
      const raw = localStorage.getItem(BOARD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tokens) && parsed.tokens.length > 0) {
          return {
            zoneView: parsed.zoneView || 'full',
            activePresetId: TACTICAL_PRESETS[parsed.activePresetId] ? parsed.activePresetId : 'salida',
            activeTool: parsed.activeTool || 'move',
            awayFormation: RIVAL_FORMATIONS[parsed.awayFormation] ? parsed.awayFormation : '1-3-2-1',
            showRivals: parsed.showRivals !== false,
            showLanes: !!parsed.showLanes,
            showStepNumbers: parsed.showStepNumbers !== false,
            tokens: parsed.tokens,
            shapes: Array.isArray(parsed.shapes) ? parsed.shapes : [],
            notes: { ...TACTICAL_PRESETS.salida.notes, ...(parsed.notes || {}) },
            checklist: {
              warmup: !!parsed.checklist?.warmup,
              abpMarks: !!parsed.checklist?.abpMarks,
              rotationsPlan: !!parsed.checklist?.rotationsPlan,
              hydration: !!parsed.checklist?.hydration
            }
          };
        }
      }
    } catch {}
    return this.createFreshState('salida');
  }

  createFreshState(presetId = 'salida') {
    const preset = TACTICAL_PRESETS[presetId] || TACTICAL_PRESETS.salida;
    const awayFormation = this.state?.awayFormation || '1-3-2-1';
    const { tokens, zoneView } = buildPresetTokens(presetId, this.getFormationFn, awayFormation);
    return {
      zoneView,
      activePresetId: presetId,
      activeTool: 'move',
      awayFormation,
      showRivals: preset.showRivals !== false,
      showLanes: this.state?.showLanes ?? true,
      showStepNumbers: this.state?.showStepNumbers ?? true,
      tokens,
      shapes: preset.shapes.map(s => ({ ...s })),
      notes: { ...preset.notes },
      checklist: {
        warmup: false,
        abpMarks: false,
        rotationsPlan: false,
        hydration: false
      }
    };
  }

  saveState() {
    const st = this.ensureState();
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(st));
    } catch {}
    if (!this._isApplyingRemoteBoard && store.cloudStatus?.state === 'connected') {
      clearTimeout(this._boardCloudTimer);
      this._boardCloudTimer = setTimeout(() => {
        store.saveTacticalBoardCloud(this.ensureState());
      }, 450);
    }
  }

  applyRemoteBoardState(remote) {
    if (!remote || !Array.isArray(remote.tokens) || remote.tokens.length === 0) return;
    if (this._drag || this._draftShape) return;
    const remoteTs = remote.updatedAt || 0;
    if (remoteTs && remoteTs <= (this._lastRemoteBoardTs || 0)) return;
    this._lastRemoteBoardTs = remoteTs;
    this._isApplyingRemoteBoard = true;
    try {
      this.state = {
        zoneView: remote.zoneView || 'full',
        activePresetId: TACTICAL_PRESETS[remote.activePresetId] ? remote.activePresetId : 'salida',
        activeTool: this.state?.activeTool || remote.activeTool || 'move',
        awayFormation: RIVAL_FORMATIONS[remote.awayFormation] ? remote.awayFormation : '1-3-2-1',
        showRivals: remote.showRivals !== false,
        showLanes: !!remote.showLanes,
        showStepNumbers: remote.showStepNumbers !== false,
        tokens: remote.tokens,
        shapes: Array.isArray(remote.shapes) ? remote.shapes : [],
        notes: { ...TACTICAL_PRESETS.salida.notes, ...(remote.notes || {}) },
        checklist: {
          warmup: !!remote.checklist?.warmup,
          abpMarks: !!remote.checklist?.abpMarks,
          rotationsPlan: !!remote.checklist?.rotationsPlan,
          hydration: !!remote.checklist?.hydration
        }
      };
      try {
        localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(this.state));
      } catch {}
      this.render();
    } finally {
      this._isApplyingRemoteBoard = false;
    }
  }

  mount(app, getFormationFn = null) {
    this.app = app;
    if (typeof getFormationFn === 'function') {
      this.getFormationFn = getFormationFn;
    }
    this.ensureState();
    if (!this._initialized) {
      this._initialized = true;
      this.bindEvents();
      store.registerTacticalBoardListener((remoteBoard) => {
        this.applyRemoteBoardState(remoteBoard);
      });
    }
    this.render();
  }

  syncPlayersWithLineup(announce = false) {
    this.ensureState();
    const freshHome = defaultHorizontalFormation(this.state.zoneView, 'home', this.getFormationFn, this.state.awayFormation);
    const existingHome = this.state.tokens.filter(t => t.team === 'home');
    const mergedHome = freshHome.map((h, i) => ({
      ...h,
      x: existingHome[i]?.x ?? h.x,
      y: existingHome[i]?.y ?? h.y
    }));
    const others = this.state.tokens.filter(t => t.team !== 'home');
    this.state.tokens = [...mergedHome, ...others];
    this.saveState();
    this.renderBoardSvg();
    this.renderSpecialistsBanner();
    this.renderRosterStrip();
    if (announce && this.app) {
      this.app.showToast('Siete titular de Fútbol 7 actualizado en la pizarra', 'users');
    }
  }

  applyPreset(presetId) {
    this.stopPlayback();
    this.ensureState();
    const preset = TACTICAL_PRESETS[presetId];
    if (!preset) return;
    const { tokens, zoneView } = buildPresetTokens(presetId, this.getFormationFn, this.state.awayFormation);
    this.state.activePresetId = presetId;
    this.state.zoneView = zoneView;
    this.state.showRivals = preset.showRivals !== false;
    this.state.tokens = tokens;
    this.state.shapes = preset.shapes.map(s => ({ ...s }));
    this.state.notes = { ...preset.notes };
    this.state.activeTool = 'move';
    this._selectedTokenId = null;
    this.saveState();
    this.render();
    if (this.app) this.app.showToast(`Pizarra cargada: ${preset.label}`, 'clipboard-list');
  }

  setZoneView(zoneView) {
    this.stopPlayback();
    this.ensureState();
    this.state.zoneView = zoneView;
    const home = defaultHorizontalFormation(zoneView, 'home', this.getFormationFn, this.state.awayFormation);
    const away = defaultHorizontalFormation(zoneView, 'away', this.getFormationFn, this.state.awayFormation);
    const ball = this.state.tokens.find(t => t.team === 'ball') || { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
    this.state.tokens = [...home, ...away, ball];
    this.saveState();
    this.render();
  }

  setAwayFormation(formId) {
    if (!RIVAL_FORMATIONS[formId]) return;
    this.stopPlayback();
    this.ensureState();
    this.state.awayFormation = formId;
    const away = defaultHorizontalFormation(this.state.zoneView, 'away', this.getFormationFn, formId);
    const nonAway = this.state.tokens.filter(t => t.team !== 'away');
    this.state.tokens = [...nonAway, ...away];
    this.saveState();
    this.renderBoardSvg();
    this.renderToolbarState();
    this.app?.showToast(`Esquema rival en pizarra: ${formId}`, 'shield-alert');
  }

  stopPlayback() {
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
    this._animPreview = null;
    this._activeStepIdx = -1;
    const btn = document.getElementById('btn-pizarra-play');
    if (btn) {
      btn.classList.remove('active');
      const sp = btn.querySelector('span');
      if (sp) sp.textContent = 'SIMULAR JUGADA';
    }
    this.renderBoardSvg();
  }

  togglePlayback() {
    this.ensureState();
    if (this._animFrame) {
      this.stopPlayback();
      return;
    }

    const ballMoveShapes = this.state.shapes
      .map((s, idx) => ({ shape: s, idx }))
      .filter(({ shape }) => ['pass', 'curve', 'shot'].includes(shape.type));

    const runShapes = this.state.shapes.filter(s => s.type === 'run');
    if (ballMoveShapes.length === 0 && runShapes.length === 0) {
      this.app?.showToast('Dibuja primero flechas de pase o desmarque para simular', 'play');
      return;
    }

    const runners = runShapes.map(r => {
      let bestTok = null;
      let bestDist = 18;
      this.state.tokens.filter(t => t.team === 'home').forEach(t => {
        const d = Math.hypot(t.x - r.x1, t.y - r.y1);
        if (d < bestDist) {
          bestDist = d;
          bestTok = t;
        }
      });
      return bestTok ? { id: bestTok.id, x1: bestTok.x, y1: bestTok.y, x2: r.x2, y2: r.y2 } : null;
    }).filter(Boolean);

    const btn = document.getElementById('btn-pizarra-play');
    if (btn) {
      btn.classList.add('active');
      const sp = btn.querySelector('span');
      if (sp) sp.textContent = 'DETENER';
    }

    const stepCount = Math.max(1, ballMoveShapes.length);
    const stepMs = 950;
    const totalMs = stepCount * stepMs + 650;
    const startTs = performance.now();

    const tick = (now) => {
      const elapsed = now - startTs;
      if (elapsed >= totalMs) {
        this.stopPlayback();
        return;
      }

      const playMs = stepCount * stepMs;
      const clamped = Math.min(elapsed, playMs);
      const stepFloat = (clamped / stepMs);
      const segIdx = Math.min(stepCount - 1, Math.floor(stepFloat));
      const segT = Math.min(1, stepFloat - segIdx);

      const previewTokens = {};
      if (ballMoveShapes[segIdx]) {
        const { shape, idx } = ballMoveShapes[segIdx];
        this._activeStepIdx = idx;
        if (shape.type === 'curve') {
          const ctrl = this.getCurveControl(shape);
          previewTokens.ball = quadBezierPoint({ x: shape.x1, y: shape.y1 }, ctrl, { x: shape.x2, y: shape.y2 }, segT);
        } else {
          previewTokens.ball = {
            x: shape.x1 + (shape.x2 - shape.x1) * segT,
            y: shape.y1 + (shape.y2 - shape.y1) * segT
          };
        }
      }

      const globalT = Math.min(1, elapsed / playMs);
      runners.forEach(r => {
        previewTokens[r.id] = {
          x: r.x1 + (r.x2 - r.x1) * globalT,
          y: r.y1 + (r.y2 - r.y1) * globalT
        };
      });

      this._animPreview = previewTokens;
      this.renderBoardSvg();
      this._animFrame = requestAnimationFrame(tick);
    };

    this._animFrame = requestAnimationFrame(tick);
  }

  toggleFullscreen(force = null) {
    const stage = document.getElementById('pizarra-board-column');
    if (!stage) return;
    const isExpanded = force === null
      ? stage.classList.toggle('is-pizarra-fullscreen')
      : (stage.classList.toggle('is-pizarra-fullscreen', Boolean(force)), Boolean(force));
    const btn = document.getElementById('btn-pizarra-fullscreen');
    const lbl = btn?.querySelector('span');
    if (lbl) lbl.textContent = isExpanded ? 'SALIR AMPLIADA' : 'PANTALLA GRANDE';
    if (btn) btn.setAttribute('aria-pressed', isExpanded ? 'true' : 'false');
    document.body.classList.toggle('pizarra-fs-open', isExpanded);
    this.app?.refreshIcons();
  }

  getCurveControl(shape) {
    const mx = (shape.x1 + shape.x2) / 2;
    const my = (shape.y1 + shape.y2) / 2;
    const dx = shape.x2 - shape.x1;
    const dy = shape.y2 - shape.y1;
    const len = Math.hypot(dx, dy) || 1;
    const curveSign = my > 50 ? 1 : -1;
    const offset = Math.min(20, Math.max(8, len * 0.28)) * curveSign;
    return {
      x: mx - (dy / len) * offset,
      y: my + (dx / len) * offset
    };
  }

  bindEvents() {
    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ensureState();
        this.state.activeTool = btn.dataset.tool || 'move';
        this.saveState();
        this.renderToolbarState();
      });
    });

    document.querySelectorAll('.pizarra-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyPreset(btn.dataset.preset);
      });
    });

    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setZoneView(btn.dataset.zone);
      });
    });

    document.getElementById('pizarra-rival-formation')?.addEventListener('change', (e) => {
      this.setAwayFormation(e.target.value);
    });

    document.getElementById('btn-pizarra-play')?.addEventListener('click', () => {
      this.togglePlayback();
    });

    document.getElementById('btn-pizarra-toggle-rivals')?.addEventListener('click', () => {
      this.ensureState();
      this.state.showRivals = !this.state.showRivals;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('btn-pizarra-toggle-lanes')?.addEventListener('click', () => {
      this.ensureState();
      this.state.showLanes = !this.state.showLanes;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('btn-pizarra-toggle-steps')?.addEventListener('click', () => {
      this.ensureState();
      this.state.showStepNumbers = !this.state.showStepNumbers;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('btn-pizarra-undo')?.addEventListener('click', () => {
      this.stopPlayback();
      this.ensureState();
      if (this.state.shapes.length > 0) {
        this.state.shapes.pop();
        this.saveState();
        this.renderBoardSvg();
      }
    });

    document.getElementById('btn-pizarra-clear-draw')?.addEventListener('click', () => {
      this.stopPlayback();
      this.ensureState();
      this.state.shapes = [];
      this.saveState();
      this.renderBoardSvg();
      this.app?.showToast('Trazos de la pizarra borrados', 'eraser');
    });

    document.getElementById('btn-pizarra-sync-lineup')?.addEventListener('click', () => {
      this.stopPlayback();
      this.syncPlayersWithLineup(true);
    });

    document.getElementById('btn-pizarra-ball-to-selected')?.addEventListener('click', () => {
      this.ensureState();
      const target = this.state.tokens.find(t => t.id === this._selectedTokenId && t.team !== 'ball')
        || this.state.tokens.find(t => t.team === 'home');
      const ball = this.state.tokens.find(t => t.team === 'ball');
      if (target && ball) {
        ball.x = Math.min(96, target.x + 2.8);
        ball.y = target.y;
        this.saveState();
        this.renderBoardSvg();
        this.app?.showToast(`Balón colocado con ${target.subLabel}`, 'circle-dot');
      }
    });

    document.getElementById('btn-pizarra-reset')?.addEventListener('click', () => {
      this.applyPreset(this.ensureState().activePresetId || 'salida');
    });

    document.getElementById('btn-pizarra-export-png')?.addEventListener('click', () => {
      this.exportBoardAsPng();
    });

    document.getElementById('btn-pizarra-fullscreen')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    document.getElementById('btn-pizarra-open-matchplan')?.addEventListener('click', () => {
      this.app?.openSquadActionsModal('tab-matchplan');
    });

    const noteMap = {
      'pizarra-note-buildup': 'buildUp',
      'pizarra-note-attack': 'attack',
      'pizarra-note-defense': 'defense',
      'pizarra-note-abp': 'setPieces',
      'pizarra-note-rotations': 'rotations'
    };
    Object.entries(noteMap).forEach(([id, key]) => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        this.ensureState();
        this.state.notes[key] = e.target.value;
        this.saveState();
      });
    });

    document.querySelectorAll('.pizarra-check-input').forEach(chk => {
      chk.addEventListener('change', (e) => {
        this.ensureState();
        if (!this.state.checklist) this.state.checklist = {};
        this.state.checklist[chk.dataset.check] = !!e.target.checked;
        this.saveState();
      });
    });

    this.bindSvgPointerEvents();
  }

  getSvgPercentPoint(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(3, Math.min(97, ((clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  eraseShapeNear(pt) {
    const shapes = this.state.shapes || [];
    let bestIdx = -1;
    let bestDist = 4.2;
    shapes.forEach((s, i) => {
      let d = Infinity;
      if (s.type === 'zone') {
        const minX = Math.min(s.x1, s.x2);
        const maxX = Math.max(s.x1, s.x2);
        const minY = Math.min(s.y1, s.y2);
        const maxY = Math.max(s.y1, s.y2);
        if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) d = 0.5;
      } else if (s.type === 'free' && Array.isArray(s.points)) {
        for (let k = 1; k < s.points.length; k++) {
          d = Math.min(d, distToSegment(pt.x, pt.y, s.points[k - 1].x, s.points[k - 1].y, s.points[k].x, s.points[k].y));
        }
      } else {
        d = distToSegment(pt.x, pt.y, s.x1, s.y1, s.x2, s.y2);
      }
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    if (bestIdx !== -1) {
      this.state.shapes.splice(bestIdx, 1);
      this.saveState();
      this.renderBoardSvg();
      return true;
    }
    return false;
  }

  bindSvgPointerEvents() {
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;

    svg.addEventListener('pointerdown', (e) => {
      this.stopPlayback();
      this.ensureState();
      const tokenGroup = e.target.closest('[data-token-id]');
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);
      const tool = this.state.activeTool || 'move';

      if (tool === 'erase_one') {
        e.preventDefault();
        this.eraseShapeNear(pt);
        return;
      }

      if (tokenGroup && tool === 'move') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._selectedTokenId = tokenGroup.dataset.tokenId;
        this._drag = { tokenId: tokenGroup.dataset.tokenId };
        this.renderBoardSvg();
        return;
      }

      if (tool === 'free') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._draftShape = { type: 'free', points: [pt] };
        this.renderBoardSvg();
        return;
      }

      if (tool !== 'move') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._draftShape = { type: tool, x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
        this.renderBoardSvg();
      } else if (tokenGroup) {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._selectedTokenId = tokenGroup.dataset.tokenId;
        this._drag = { tokenId: tokenGroup.dataset.tokenId };
        this.renderBoardSvg();
      }
    });

    svg.addEventListener('pointermove', (e) => {
      if (!this._drag && !this._draftShape) return;
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);

      if (this._drag) {
        const tok = this.state.tokens.find(t => t.id === this._drag.tokenId);
        if (tok) {
          tok.x = pt.x;
          tok.y = pt.y;
          this.renderBoardSvg();
        }
      } else if (this._draftShape) {
        if (this._draftShape.type === 'free') {
          const pts = this._draftShape.points;
          const prev = pts[pts.length - 1];
          if (!prev || Math.hypot(pt.x - prev.x, pt.y - prev.y) >= 1.2) {
            pts.push(pt);
            this.renderBoardSvg();
          }
        } else {
          this._draftShape.x2 = pt.x;
          this._draftShape.y2 = pt.y;
          this.renderBoardSvg();
        }
      }
    });

    const finishPointer = (e) => {
      if (this._drag) {
        this._drag = null;
        this.saveState();
      }
      if (this._draftShape) {
        const d = this._draftShape;
        this._draftShape = null;
        if (d.type === 'free') {
          if (d.points.length >= 3) {
            this.state.shapes.push(d);
            this.saveState();
          }
        } else {
          const dist = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
          if (dist >= 2.2) {
            this.state.shapes.push(d);
            this.saveState();
          }
        }
        this.renderBoardSvg();
      }
      try { svg.releasePointerCapture(e.pointerId); } catch {}
    };

    svg.addEventListener('pointerup', finishPointer);
    svg.addEventListener('pointercancel', finishPointer);
  }

  render() {
    this.ensureState();
    this.renderToolbarState();
    this.renderNotesInputs();
    this.renderSpecialistsBanner();
    this.renderRosterStrip();
    this.renderBoardSvg();
    this.app?.refreshIcons();
  }

  renderToolbarState() {
    const preset = TACTICAL_PRESETS[this.state.activePresetId] || TACTICAL_PRESETS.salida;
    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      const on = btn.dataset.tool === this.state.activeTool;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.pizarra-preset-btn').forEach(btn => {
      const on = btn.dataset.preset === this.state.activePresetId;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      const on = btn.dataset.zone === this.state.zoneView;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    const rivalBtn = document.getElementById('btn-pizarra-toggle-rivals');
    if (rivalBtn) {
      rivalBtn.classList.toggle('active', !!this.state.showRivals);
      rivalBtn.setAttribute('aria-pressed', String(!!this.state.showRivals));
      const lbl = rivalBtn.querySelector('span');
      if (lbl) lbl.textContent = this.state.showRivals ? 'RIVALES: ON' : 'RIVALES: OFF';
    }
    const lanesBtn = document.getElementById('btn-pizarra-toggle-lanes');
    if (lanesBtn) {
      lanesBtn.classList.toggle('active', !!this.state.showLanes);
      lanesBtn.setAttribute('aria-pressed', String(!!this.state.showLanes));
    }
    const stepsBtn = document.getElementById('btn-pizarra-toggle-steps');
    if (stepsBtn) {
      stepsBtn.classList.toggle('active', this.state.showStepNumbers !== false);
      stepsBtn.setAttribute('aria-pressed', String(this.state.showStepNumbers !== false));
    }

    const rivalSel = document.getElementById('pizarra-rival-formation');
    if (rivalSel && this.state.awayFormation) {
      rivalSel.value = this.state.awayFormation;
    }

    const summaryEl = document.getElementById('pizarra-phase-summary');
    if (summaryEl) {
      summaryEl.textContent = preset.shortDesc;
    }

    const svg = document.getElementById('pizarra-board-svg');
    if (svg) {
      const tool = this.state.activeTool;
      svg.style.cursor = tool === 'move' ? 'grab' : (tool === 'erase_one' ? 'pointer' : 'crosshair');
    }
  }

  renderNotesInputs() {
    const map = {
      'pizarra-note-buildup': this.state.notes.buildUp || '',
      'pizarra-note-attack': this.state.notes.attack || '',
      'pizarra-note-defense': this.state.notes.defense || '',
      'pizarra-note-abp': this.state.notes.setPieces || '',
      'pizarra-note-rotations': this.state.notes.rotations || ''
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && el.value !== val) el.value = val;
    });
    document.querySelectorAll('.pizarra-check-input').forEach(chk => {
      chk.checked = !!this.state.checklist?.[chk.dataset.check];
    });
  }

  renderSpecialistsBanner() {
    const host = document.getElementById('pizarra-specialists-summary');
    if (!host) return;
    const specs = store.getSettings()?.specialists || {};
    const nameOf = (id) => {
      const p = store.getPlayerById(id);
      return p ? `#${p.number} ${p.nickname || p.name?.split(' ')[0]}` : 'Sin asignar';
    };
    const rows = [
      { role: 'CAPITÁN', val: nameOf(specs.captain) },
      { role: 'PENALTIS', val: nameOf(specs.penalties) },
      { role: 'FALTAS', val: nameOf(specs.freeKicks) },
      { role: 'CÓRNERS', val: nameOf(specs.corners) }
    ];
    host.innerHTML = rows.map(r => `
      <div class="pizarra-spec-chip">
        <span class="pizarra-spec-role font-fifa">${r.role}</span>
        <strong class="pizarra-spec-val font-fifa">${r.val}</strong>
      </div>
    `).join('');
  }

  renderRosterStrip() {
    const host = document.getElementById('pizarra-roster-strip');
    if (!host) return;
    const starting = store.getStartingLineup().filter(Boolean);
    const all = store.getPlayers();
    const startIds = new Set(starting.map(p => p.id));
    const subs = all.filter(p => !startIds.has(p.id));

    if (all.length === 0) {
      host.innerHTML = '<span class="text-xs text-slate-400 italic">Aún no hay cartas registradas en el club. Al crear tu carta aparecerás aquí automáticamente.</span>';
      return;
    }

    const chipFor = (p, isStarter) => {
      const tok = this.state.tokens.find(t => t.playerId === p.id);
      const selected = tok && tok.id === this._selectedTokenId;
      return `
        <button type="button" class="pizarra-roster-chip ${isStarter ? 'is-starter' : 'is-sub'} ${selected ? 'is-selected' : ''}" data-roster-player="${p.id}" title="${p.name} (${p.rolesHierarchy?.best || 'DC'})">
          <span class="pizarra-roster-num">#${p.number || 10}</span>
          <span class="pizarra-roster-name">${(p.nickname || p.name?.split(' ')[0] || 'JUG').toUpperCase().slice(0, 10)}</span>
          <span class="pizarra-roster-role">${isStarter ? (tok?.role || p.rolesHierarchy?.best || 'F7') : 'SUP'}</span>
        </button>
      `;
    };

    host.innerHTML = [
      ...starting.map(p => chipFor(p, true)),
      ...subs.map(p => chipFor(p, false))
    ].join('');

    host.querySelectorAll('.pizarra-roster-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.dataset.rosterPlayer;
        const matchTok = this.state.tokens.find(t => t.playerId === pid);
        if (matchTok) {
          this._selectedTokenId = matchTok.id;
          this.renderRosterStrip();
          this.renderBoardSvg();
        } else {
          this.app?.inspectPlayer(pid);
        }
      });
    });
  }

  renderFieldMarkingsSvg() {
    const zone = this.state.zoneView || 'full';

    // Franjas de césped Fútbol 7 (viewBox 1000x620)
    const stripeCount = 12;
    const stripeW = 1000 / stripeCount;
    const stripes = Array.from({ length: stripeCount }, (_, i) => {
      const fill = i % 2 === 0 ? '#234a13' : '#2c5a18';
      return `<rect x="${i * stripeW}" y="0" width="${stripeW + 0.5}" height="620" fill="${fill}" />`;
    }).join('');

    // 5 Carriles Tácticos (Banda Sup, Pasillo Int Sup, Carril Central, Pasillo Int Inf, Banda Inf)
    let lanesSvg = '';
    if (this.state.showLanes) {
      const laneYs = [132, 232, 388, 488];
      lanesSvg = laneYs.map(y =>
        `<line x1="42" y1="${y}" x2="958" y2="${y}" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" stroke-dasharray="9,9" />`
      ).join('') + `
        <text x="500" y="82" text-anchor="middle" fill="rgba(255,255,255,0.22)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">BANDA IZQUIERDA</text>
        <text x="500" y="314" text-anchor="middle" fill="rgba(255,255,255,0.20)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">CARRIL CENTRAL</text>
        <text x="500" y="548" text-anchor="middle" fill="rgba(255,255,255,0.22)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">BANDA DERECHA / ZONA BANQUILLO</text>
      `;
    }

    let lines = '';
    if (zone === 'attack') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <line x1="40" y1="32" x2="40" y2="588" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <path d="M 40,210 A 100,100 0 0,1 40,410" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <rect x="740" y="130" width="220" height="360" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <rect x="880" y="218" width="80" height="184" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <circle cx="825" cy="310" r="4.5" fill="#ffffff" />
        <path d="M 740,235 A 95,95 0 0,0 740,385" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <path d="M 960,54 A 22,22 0 0,0 938,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <path d="M 938,588 A 22,22 0 0,0 960,566" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <rect x="960" y="252" width="18" height="116" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="64" y="64" fill="rgba(255,255,255,0.6)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="22" letter-spacing="2">ZONA DE FINALIZACIÓN RIVAL (FÚTBOL 7)</text>
      `;
    } else if (zone === 'buildup') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <path d="M 960,210 A 100,100 0 0,0 960,410" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <rect x="40" y="130" width="220" height="360" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <rect x="40" y="218" width="80" height="184" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <circle cx="175" cy="310" r="4.5" fill="#ffffff" />
        <path d="M 260,235 A 95,95 0 0,1 260,385" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <path d="M 40,54 A 22,22 0 0,0 62,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <path d="M 62,588 A 22,22 0 0,0 40,566" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <rect x="22" y="252" width="18" height="116" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="688" y="64" fill="rgba(255,255,255,0.6)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="22" letter-spacing="2">SALIDA DE BALÓN PROPIA (FÚTBOL 7)</text>
      `;
    } else {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <line x1="500" y1="32" x2="500" y2="588" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <circle cx="500" cy="310" r="76" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <circle cx="500" cy="310" r="5" fill="#ffffff" />
        <rect x="40" y="155" width="150" height="310" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <rect x="40" y="230" width="58" height="160" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <path d="M 190,248 A 72,72 0 0,1 190,372" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <circle cx="145" cy="310" r="4" fill="#ffffff" />
        <rect x="810" y="155" width="150" height="310" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <rect x="902" y="230" width="58" height="160" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <path d="M 810,248 A 72,72 0 0,0 810,372" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <circle cx="855" cy="310" r="4" fill="#ffffff" />
        <rect x="22" y="260" width="18" height="100" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="3" />
        <rect x="960" y="260" width="18" height="100" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="3" />
        <path d="M 40,50 A 18,18 0 0,0 58,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 58,588 A 18,18 0 0,0 40,570" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 960,50 A 18,18 0 0,1 942,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 942,588 A 18,18 0 0,1 960,570" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <text x="58" y="60" fill="rgba(255,255,255,0.58)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">NUESTRA PORTERÍA</text>
        <text x="765" y="60" fill="rgba(255,255,255,0.58)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">ATAQUE HACIA RIVAL</text>
      `;
    }

    return `${stripes}${lanesSvg}${lines}`;
  }

  renderShapeSvg(shape, seqNum = null, isPlayingActive = false) {
    if (shape.type === 'free' && Array.isArray(shape.points)) {
      const pts = shape.points.map(p => `${p.x * 10},${p.y * 6.2}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="#fde047" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />`;
    }

    const x1 = shape.x1 * 10;
    const y1 = shape.y1 * 6.2;
    const x2 = shape.x2 * 10;
    const y2 = shape.y2 * 6.2;

    if (shape.type === 'zone') {
      const rx = Math.min(x1, x2);
      const ry = Math.min(y1, y2);
      const rw = Math.max(24, Math.abs(x2 - x1));
      const rh = Math.max(24, Math.abs(y2 - y1));
      return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="12" fill="rgba(56, 189, 248, 0.20)" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10,6" />`;
    }

    const styles = {
      pass: { color: '#facc15', dash: '', marker: 'url(#pz-arrow-gold)' },
      curve: { color: '#fbbf24', dash: 'stroke-dasharray="4,5"', marker: 'url(#pz-arrow-gold)' },
      run: { color: '#34d399', dash: 'stroke-dasharray="11,8"', marker: 'url(#pz-arrow-green)' },
      shot: { color: '#fb7185', dash: '', marker: 'url(#pz-arrow-red)' }
    };
    const st = styles[shape.type] || styles.pass;
    const glow = isPlayingActive ? `stroke="#ffffff" stroke-width="8" opacity="0.55"` : '';
    let pathEl;
    let badgePt = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

    if (shape.type === 'curve') {
      const cPct = this.getCurveControl(shape);
      const cx = cPct.x * 10;
      const cy = cPct.y * 6.2;
      pathEl = `
        ${glow ? `<path d="M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}" fill="none" ${glow} stroke-linecap="round" />` : ''}
        <path d="M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}" fill="none" stroke="${st.color}" stroke-width="4.5" stroke-linecap="round" ${st.dash} marker-end="${st.marker}" />
      `;
      const mid = quadBezierPoint({ x: x1, y: y1 }, { x: cx, y: cy }, { x: x2, y: y2 }, 0.5);
      badgePt = mid;
    } else {
      pathEl = `
        ${glow ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${glow} stroke-linecap="round" />` : ''}
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${st.color}" stroke-width="4.5" stroke-linecap="round" ${st.dash} marker-end="${st.marker}" />
      `;
    }

    const badgeSvg = seqNum && this.state.showStepNumbers !== false
      ? `<g class="pizarra-seq-badge">
           <circle cx="${badgePt.x}" cy="${badgePt.y}" r="11" fill="#0f172a" stroke="${st.color}" stroke-width="2" />
           <text x="${badgePt.x}" y="${badgePt.y + 4}" text-anchor="middle" fill="#ffffff" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="13">${seqNum}</text>
         </g>`
      : '';

    return `${pathEl}${badgeSvg}`;
  }

  renderBoardSvg() {
    this.ensureState();
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;

    const defs = `
      <defs>
        <marker id="pz-arrow-gold" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#facc15" />
        </marker>
        <marker id="pz-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#34d399" />
        </marker>
        <marker id="pz-arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#fb7185" />
        </marker>
      </defs>
    `;

    const allShapes = this._draftShape
      ? [...this.state.shapes, this._draftShape]
      : this.state.shapes;
    let stepCounter = 0;
    const shapesSvg = allShapes.map((s, idx) => {
      const isArrow = ['pass', 'curve', 'run', 'shot'].includes(s.type);
      const seq = isArrow ? ++stepCounter : null;
      return this.renderShapeSvg(s, seq, idx === this._activeStepIdx);
    }).join('');

    const visibleTokens = this.state.tokens.filter(t => this.state.showRivals || t.team !== 'away');
    const tokensSvg = visibleTokens.map(t => {
      const livePos = this._animPreview?.[t.id];
      const cx = (livePos ? livePos.x : t.x) * 10;
      const cy = (livePos ? livePos.y : t.y) * 6.2;

      if (t.team === 'ball') {
        return `
          <g data-token-id="${t.id}" class="pizarra-token" style="cursor: grab;">
            <circle cx="${cx}" cy="${cy}" r="28" fill="transparent" />
            <circle cx="${cx}" cy="${cy}" r="16" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
            <polygon points="${cx},${cy - 8} ${cx + 7},${cy - 2} ${cx + 4},${cy + 7} ${cx - 4},${cy + 7} ${cx - 7},${cy - 2}" fill="#0f172a" />
          </g>
        `;
      }

      const isHome = t.team === 'home';
      const isSel = t.id === this._selectedTokenId;
      const fill = isHome ? (t.role === 'POR' ? '#38bdf8' : '#f0be2a') : '#e11d48';
      const stroke = isSel ? '#ffffff' : (isHome ? '#0f172a' : '#ffffff');
      const textFill = '#0f172a';
      return `
        <g data-token-id="${t.id}" class="pizarra-token ${isSel ? 'is-selected' : ''}" style="cursor: grab;">
          <circle cx="${cx}" cy="${cy}" r="34" fill="transparent" />
          ${isSel ? `<circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="5,4" />` : ''}
          <circle cx="${cx}" cy="${cy + 3}" r="22" fill="rgba(0,0,0,0.42)" />
          <circle cx="${cx}" cy="${cy}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isSel ? 3.5 : 2.8}" />
          <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${isHome ? textFill : '#ffffff'}" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="19">${t.label}</text>
          <rect x="${cx - 34}" y="${cy + 24}" width="68" height="17" rx="3" fill="rgba(7,9,14,0.9)" />
          <text x="${cx}" y="${cy + 36}" text-anchor="middle" fill="#ffffff" font-family="Outfit, sans-serif" font-weight="800" font-size="11">${t.subLabel}</text>
        </g>
      `;
    }).join('');

    svg.innerHTML = `${defs}${this.renderFieldMarkingsSvg()}${shapesSvg}${tokensSvg}`;
  }

  exportBoardAsPng() {
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 992;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `Pizarra_F7_${this.state.activePresetId || 'tactica'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      this.app?.showToast('Imagen PNG de la pizarra descargada', 'download');
    };
    img.src = url;
  }
}

export const tacticalBoard = new TacticalBoardController();
