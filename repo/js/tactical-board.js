/**
 * Pizarra Táctica Interactiva y Plan de Partido (Fútbol Sala · 40x20m)
 * Permite mover jugadores/rivales/balón, dibujar pases rectos y curvos, desmarques,
 * zonas, trazo libre, simular la jugada animada y organizar la estrategia del partido.
 */
import { store } from './store.js';

const BOARD_STORAGE_KEY = 'futinfo_tactical_board_futsal_v1';

const DEFAULT_FUTSAL_SLOTS = [
  { role: 'POR', top: 85, left: 50 },
  { role: 'CIE', top: 67, left: 50 },
  { role: 'ALI', top: 44, left: 22 },
  { role: 'ALD', top: 44, left: 78 },
  { role: 'PIV', top: 20, left: 50 }
];

const RIVAL_FORMATIONS = {
  '1-1-2-1': [
    { role: 'POR', top: 85, left: 50 },
    { role: 'CIE', top: 67, left: 50 },
    { role: 'ALI', top: 44, left: 22 },
    { role: 'ALD', top: 44, left: 78 },
    { role: 'PIV', top: 20, left: 50 }
  ],
  '1-3-1': [
    { role: 'POR', top: 85, left: 50 },
    { role: 'ALI', top: 56, left: 21 },
    { role: 'CIE', top: 64, left: 50 },
    { role: 'ALD', top: 56, left: 79 },
    { role: 'PIV', top: 20, left: 50 }
  ],
  '1-2-2': [
    { role: 'POR', top: 85, left: 50 },
    { role: 'CIE', top: 66, left: 32 },
    { role: 'ALA', top: 66, left: 68 },
    { role: 'ALI', top: 24, left: 28 },
    { role: 'PIV', top: 24, left: 72 }
  ],
  '1-4-0': [
    { role: 'POR', top: 85, left: 50 },
    { role: 'ALI', top: 48, left: 19 },
    { role: 'CIE', top: 58, left: 39 },
    { role: 'ALA', top: 58, left: 61 },
    { role: 'ALD', top: 48, left: 81 }
  ]
};

export const TACTICAL_PRESETS = {
  salida: {
    id: 'salida',
    label: 'Salida 4-0 / Triángulo',
    shortDesc: 'Cierre y ala abiertos en paralelo con desmarque de ruptura o pared interior en 40x20m.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Portero saca rápido sobre cierre (CIE) o primer ala (ALI/ALD) creando línea de pase limpia y evitando perder en eje central.',
      attack: 'Tras primer pase en banda, el pasador corta hacia dentro (puerta atrás) para arrastrar marca y abrir la paralela larga al otro ala o pívot.',
      defense: 'En Fútbol Sala toda pérdida cuesta una ocasión: repliegue al máximo sprint cerrando primero el pasillo interior hacia nuestra portería.',
      setPieces: 'En saque de portería desde dentro del área, ofrecer doble apoyo lateral y descarga rápida si el rival salta a presión alta.',
      rotations: 'Rotar cuarteto cada 4-5 minutos a máxima intensidad sin perder nunca un cierre equilibrado atrás.'
    },
    shapes: [
      { type: 'pass', x1: 11, y1: 50, x2: 24, y2: 27 },
      { type: 'pass', x1: 26, y1: 27, x2: 47, y2: 36 },
      { type: 'run', x1: 26, y1: 30, x2: 56, y2: 52 },
      { type: 'curve', x1: 48, y1: 36, x2: 67, y2: 75 },
      { type: 'zone', x1: 44, y1: 60, x2: 70, y2: 86 }
    ]
  },
  ataque: {
    id: 'ataque',
    label: 'Ataque con Pívot (3-1)',
    shortDesc: 'Circulación rápida exterior hasta filtrar balón tenso al pívot y llegada al segundo palo.',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Mover al rival con máximo 2 toques entre cierre y alas hasta que quede libre la línea de pase diagonal u horizontal al pívot.',
      attack: 'Cuando recibe el PIV de espaldas, las alas acompañan en banda y zona de finalización para disparo de cara o cierre directo al 2º palo.',
      defense: 'Cierre siempre en vigilancia a la espalda del pívot y atento a cortar la contra si bloquean nuestro tiro.',
      setPieces: 'Si fuerzan saque de banda alto o córner, activar rápidamente las jugadas de bloqueo antes de que ajusten marcas.',
      rotations: 'Dar frescura a las alas de ida y vuelta para sostener desborde constante en el 1 vs 1.'
    },
    shapes: [
      { type: 'pass', x1: 36, y1: 36, x2: 62, y2: 20 },
      { type: 'pass', x1: 64, y1: 22, x2: 79, y2: 45 },
      { type: 'curve', x1: 80, y1: 46, x2: 86, y2: 68 },
      { type: 'run', x1: 66, y1: 76, x2: 86, y2: 68 },
      { type: 'zone', x1: 75, y1: 36, x2: 91, y2: 74 }
    ]
  },
  presion: {
    id: 'presion',
    label: 'Presión Alta y Robo',
    shortDesc: 'Orientar salida rival hacia banda en su área de 6m y morder el pase dividido.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Al recuperar alto en pista rival, definir rápido al palo corto o cruzar raso al segundo palo en menos de 4 segundos.',
      attack: 'Pívot y ala más próximo niegan el giro interior obligando al rival a jugar contra la línea de banda.',
      defense: 'El cierre salta solo cuando hay pase aéreo o mal control; si superan primera línea, replegar en cuadrado hacia nuestra área de 6m.',
      setPieces: 'En saque de banda rival en campo propio, emparejar fuerte al hombre más cercano sin descuidar la paralela.',
      rotations: 'Cambios rápidos cada 3-4 minutos si mantenemos presión alta en toda la pista.'
    },
    shapes: [
      { type: 'shot', x1: 72, y1: 48, x2: 86, y2: 26 },
      { type: 'shot', x1: 58, y1: 32, x2: 74, y2: 39 },
      { type: 'run', x1: 54, y1: 68, x2: 69, y2: 52 },
      { type: 'zone', x1: 72, y1: 10, x2: 95, y2: 46 }
    ]
  },
  contra: {
    id: 'contra',
    label: 'Bloque 2-2 y Contra',
    shortDesc: 'Defensa compacta en media pista (15m) + robo interior + transición al segundo palo.',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Esperar ordenados en media pista cerrando pasillo interior; prohibido saltar de uno en uno dejando huecos a la espalda.',
      attack: 'En cuanto robamos, conducción vertical al espacio o pared rápida buscando superioridad 2 vs 1 sobre su portero.',
      defense: 'Distancia corta entre primera y segunda línea defensiva basculando en bloque con el balón.',
      setPieces: 'En defensa de córner, el jugador en frontal lanza la transición apenas atrapa o despeja nuestro portero.',
      rotations: 'Mantener al menos un cierre rápido y un ala explosivo en pista para castigar cada pérdida rival.'
    },
    shapes: [
      { type: 'zone', x1: 24, y1: 22, x2: 46, y2: 78 },
      { type: 'pass', x1: 38, y1: 50, x2: 56, y2: 30 },
      { type: 'pass', x1: 58, y1: 30, x2: 84, y2: 24 },
      { type: 'run', x1: 64, y1: 48, x2: 85, y2: 64 }
    ]
  },
  corner_fav: {
    id: 'corner_fav',
    label: 'Córner Pista (2º Palo)',
    shortDesc: 'Pase atrás a la corona del área (10m) o envío raso al bloqueo y 2º palo (4 segundos).',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: '¡Cuenta de 4 segundos en Fútbol Sala! Colocar rápido balón en esquina y ejecutar en bloque.',
      attack: 'Opción 1: bloqueo del pívot y disparo de primeras del ala en la frontal. Opción 2: balón tenso raso para empujar al 2º palo.',
      defense: 'Cierre siempre vigilando el rechace cerca de medio campo para evitar puerta vacía o contra rápida.',
      setPieces: 'Si cubren frontal, finta y toque corto raso al pívot que sale a esquina corta del área de 6m.',
      rotations: 'Contar siempre con nuestro mejor golpeador exterior en pista en los córners ofensivos.'
    },
    shapes: [
      { type: 'pass', x1: 95, y1: 92, x2: 66, y2: 44 },
      { type: 'shot', x1: 66, y1: 44, x2: 95, y2: 49 },
      { type: 'run', x1: 72, y1: 34, x2: 85, y2: 38 },
      { type: 'zone', x1: 78, y1: 34, x2: 91, y2: 66 }
    ]
  },
  falta_abp: {
    id: 'falta_abp',
    label: 'Falta / Doble Penalti',
    shortDesc: 'Barrera a 5 metros: pisa-balón de dos perfiles para disparo o pase lateral al 2º palo.',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Pedir distancia oficial de 5 metros y colocar zurdo + diestro para amenazar ambos palos.',
      attack: 'Pisa-balón suave para romper ángulo de barrera y golpeo potente a media altura, o pase filtrado al ala libre.',
      defense: 'El cierre queda por detrás de la línea de balón cubriendo el posible despeje rápido rival.',
      setPieces: 'Si es falta acumulada de 10m (doble penalti), golpeo seco arriba sin dudar.',
      rotations: 'Designar en pista al especialista de faltas configurado en Especialistas del Club.'
    },
    shapes: [
      { type: 'pass', x1: 60, y1: 34, x2: 63, y2: 40 },
      { type: 'shot', x1: 63, y1: 40, x2: 95, y2: 47 },
      { type: 'run', x1: 71, y1: 70, x2: 86, y2: 65 },
      { type: 'zone', x1: 74, y1: 22, x2: 89, y2: 39 }
    ]
  },
  defensa_abp: {
    id: 'defensa_abp',
    label: 'Portero-Jugador / ABP',
    shortDesc: 'Rombo o cuadrado compacto delante de 6 metros basculando al lado de balón (5v4 / córner).',
    zoneView: 'buildup',
    showRivals: true,
    notes: {
      buildUp: 'Si robamos ante Portero-Jugador (5v4), disparo inmediato alto hacia la portería rival vacía o pase seguro al ala adelantada.',
      attack: 'En transición tras robo, asegurar primero la posesión si no hay ángulo limpio hacia portería rival.',
      defense: 'Defender en rombo/cuadrado justo fuera del área de 6m: negar siempre el pase al centro y al segundo palo.',
      setPieces: 'En córner en contra, 1 jugador en vértice del área de 6m y otros 3 fijando marcas sin perder visión del balón.',
      rotations: 'En tramos finales defendiendo 5v4, priorizar jugadores comunicativos y con máxima lectura táctica.'
    },
    shapes: [
      { type: 'zone', x1: 12, y1: 28, x2: 29, y2: 72 },
      { type: 'pass', x1: 16, y1: 50, x2: 52, y2: 28 },
      { type: 'run', x1: 48, y1: 28, x2: 78, y2: 44 }
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

function defaultHorizontalFormation(zoneView = 'full', team = 'home', getFormationFn = null, awayFormation = '1-1-2-1') {
  if (team === 'away') {
    const rivalSlots = RIVAL_FORMATIONS[awayFormation] || RIVAL_FORMATIONS['1-1-2-1'];
    return projectToHorizontalPitch(rivalSlots, zoneView, 'away', getFormationFn);
  }
  const conf = typeof getFormationFn === 'function' ? getFormationFn('futsal', store.getActiveFormation()) : null;
  const baseSlots = (conf?.slots?.length ? conf.slots : DEFAULT_FUTSAL_SLOTS).slice(0, 5);
  return projectToHorizontalPitch(baseSlots, zoneView, 'home', getFormationFn);
}

function applyPresetCoordinates(presetId, home, away) {
  if (presetId === 'salida') {
    if (home[0]) { home[0].x = 10; home[0].y = 50; }
    if (home[1]) { home[1].x = 24; home[1].y = 26; }
    if (home[2]) { home[2].x = 46; home[2].y = 36; }
    if (home[3]) { home[3].x = 30; home[3].y = 75; }
    if (home[4]) { home[4].x = 67; home[4].y = 75; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 12.5, y: 50 };
  }
  if (presetId === 'ataque') {
    if (home[0]) { home[0].x = 14; home[0].y = 50; }
    if (home[1]) { home[1].x = 36; home[1].y = 36; }
    if (home[2]) { home[2].x = 62; home[2].y = 20; }
    if (home[3]) { home[3].x = 66; home[3].y = 76; }
    if (home[4]) { home[4].x = 79; home[4].y = 45; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 37.5, y: 36 };
  }
  if (presetId === 'presion') {
    const spots = [
      { x: 14, y: 50 }, { x: 46, y: 48 }, { x: 70, y: 31 }, { x: 54, y: 69 }, { x: 84, y: 24 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 86, y: 26 };
  }
  if (presetId === 'contra') {
    const spots = [
      { x: 10, y: 50 }, { x: 34, y: 36 }, { x: 34, y: 64 }, { x: 56, y: 30 }, { x: 64, y: 48 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 38, y: 50 };
  }
  if (presetId === 'corner_fav') {
    const spots = [
      { x: 15, y: 50 }, { x: 48, y: 46 }, { x: 65, y: 44 }, { x: 72, y: 34 }, { x: 95, y: 92 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 95, y: 92 };
  }
  if (presetId === 'falta_abp') {
    const spots = [
      { x: 14, y: 50 }, { x: 44, y: 46 }, { x: 60, y: 34 }, { x: 63, y: 41 }, { x: 71, y: 70 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    if (away[2]) { away[2].x = 76; away[2].y = 40; }
    if (away[3]) { away[3].x = 76; away[3].y = 45; }
    if (away[4]) { away[4].x = 76; away[4].y = 50; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 60, y: 34 };
  }
  if (presetId === 'defensa_abp') {
    const spots = [
      { x: 10, y: 50 }, { x: 16, y: 37 }, { x: 16, y: 63 }, { x: 25, y: 48 }, { x: 48, y: 28 }
    ];
    home.forEach((t, i) => { const s = spots[i]; if (s) { t.x = s.x; t.y = s.y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 80, y: 80 };
  }
  return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
}

function buildPresetTokens(presetId, getFormationFn = null, awayFormation = '1-1-2-1') {
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
        const homeCount = Array.isArray(parsed?.tokens) ? parsed.tokens.filter(t => t.team === 'home').length : 0;
        const awayCount = Array.isArray(parsed?.tokens) ? parsed.tokens.filter(t => t.team === 'away').length : 0;
        if (parsed && homeCount === 5 && awayCount === 5) {
          return {
            zoneView: parsed.zoneView || 'full',
            activePresetId: TACTICAL_PRESETS[parsed.activePresetId] ? parsed.activePresetId : 'salida',
            activeTool: parsed.activeTool || 'move',
            awayFormation: RIVAL_FORMATIONS[parsed.awayFormation] ? parsed.awayFormation : '1-1-2-1',
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
    const awayFormation = this.state?.awayFormation && RIVAL_FORMATIONS[this.state.awayFormation]
      ? this.state.awayFormation
      : '1-1-2-1';
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
    const homeCount = remote.tokens.filter(t => t.team === 'home').length;
    const awayCount = remote.tokens.filter(t => t.team === 'away').length;
    if (homeCount !== 5 || awayCount !== 5) return;
    const remoteTs = remote.updatedAt || 0;
    if (remoteTs && remoteTs <= (this._lastRemoteBoardTs || 0)) return;
    this._lastRemoteBoardTs = remoteTs;
    this._isApplyingRemoteBoard = true;
    try {
      this.state = {
        zoneView: remote.zoneView || 'full',
        activePresetId: TACTICAL_PRESETS[remote.activePresetId] ? remote.activePresetId : 'salida',
        activeTool: this.state?.activeTool || remote.activeTool || 'move',
        awayFormation: RIVAL_FORMATIONS[remote.awayFormation] ? remote.awayFormation : '1-1-2-1',
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
      this.app.showToast('Quinteto titular de Fútbol Sala actualizado en la pizarra', 'users');
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
        <button type="button" class="pizarra-roster-chip ${isStarter ? 'is-starter' : 'is-sub'} ${selected ? 'is-selected' : ''}" data-roster-player="${p.id}" title="${p.name} (${p.rolesHierarchy?.best || 'PIV'})">
          <span class="pizarra-roster-num">#${p.number || 10}</span>
          <span class="pizarra-roster-name">${(p.nickname || p.name?.split(' ')[0] || 'JUG').toUpperCase().slice(0, 10)}</span>
          <span class="pizarra-roster-role">${isStarter ? (tok?.role || p.rolesHierarchy?.best || 'FS') : 'SUP'}</span>
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

    // Pista azul oficial de Fútbol Sala (pabellón 40x20m, viewBox 1000x620)
    const courtSurround = `<rect x="0" y="0" width="1000" height="620" fill="#0d294a" />`;
    const courtFloor = `<rect x="40" y="32" width="920" height="556" rx="4" fill="#15477f" />`;
    const courtBands = Array.from({ length: 8 }, (_, i) => {
      const bandW = 920 / 8;
      const fill = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.035)';
      return `<rect x="${40 + i * bandW}" y="32" width="${bandW}" height="556" fill="${fill}" />`;
    }).join('');
    const stripes = `${courtSurround}${courtFloor}${courtBands}`;

    // 5 Carriles Tácticos (Banda Sup, Pasillo Int Sup, Carril Central, Pasillo Int Inf, Banda Inf)
    let lanesSvg = '';
    if (this.state.showLanes) {
      const laneYs = [132, 232, 388, 488];
      lanesSvg = laneYs.map(y =>
        `<line x1="42" y1="${y}" x2="958" y2="${y}" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" stroke-dasharray="9,9" />`
      ).join('') + `
        <text x="500" y="82" text-anchor="middle" fill="rgba(255,255,255,0.24)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">ALA / BANDA IZQUIERDA</text>
        <text x="500" y="314" text-anchor="middle" fill="rgba(255,255,255,0.22)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">PASILLO CENTRAL (CIERRE / PÍVOT)</text>
        <text x="500" y="548" text-anchor="middle" fill="rgba(255,255,255,0.24)" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">ALA / BANDA DERECHA · ZONA CAMBIOS 5M</text>
      `;
    }

    let lines = '';
    if (zone === 'attack') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="3" />
        <path d="M 40,210 A 100,100 0 0,1 40,410" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <!-- Área semicircular de 6m reglamentaria Fútbol Sala -->
        <path d="M 960,126 L 910,126 A 126,126 0 0,0 784,252 L 784,368 A 126,126 0 0,0 910,494 L 960,494" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <!-- Punto de Penalti 6m + Doble Penalti 10m -->
        <circle cx="838" cy="310" r="5" fill="#ffffff" />
        <circle cx="690" cy="310" r="5" fill="#facc15" />
        <text x="690" y="332" text-anchor="middle" fill="rgba(250,204,21,0.85)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="12">10M</text>
        <path d="M 960,54 A 22,22 0 0,0 938,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <path d="M 938,588 A 22,22 0 0,0 960,566" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <rect x="960" y="254" width="18" height="112" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="64" y="64" fill="rgba(255,255,255,0.72)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="21" letter-spacing="2">ZONA DE FINALIZACIÓN RIVAL (FÚTBOL SALA · 6M)</text>
      `;
    } else if (zone === 'buildup') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="3" />
        <path d="M 960,210 A 100,100 0 0,0 960,410" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="3" />
        <!-- Área semicircular de 6m propia -->
        <path d="M 40,126 L 90,126 A 126,126 0 0,1 216,252 L 216,368 A 126,126 0 0,1 90,494 L 40,494" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <circle cx="162" cy="310" r="5" fill="#ffffff" />
        <circle cx="310" cy="310" r="5" fill="#facc15" />
        <text x="310" y="332" text-anchor="middle" fill="rgba(250,204,21,0.85)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="12">10M</text>
        <path d="M 40,54 A 22,22 0 0,0 62,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <path d="M 62,588 A 22,22 0 0,0 40,566" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <rect x="22" y="254" width="18" height="112" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="640" y="64" fill="rgba(255,255,255,0.72)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="21" letter-spacing="2">SALIDA DE PISTA PROPIA (FÚTBOL SALA)</text>
      `;
    } else {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <line x1="500" y1="32" x2="500" y2="588" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <circle cx="500" cy="310" r="76" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <circle cx="500" cy="310" r="5" fill="#ffffff" />
        <!-- Semicírculos de 6m Fútbol Sala (izquierda y derecha) -->
        <path d="M 40,148 L 62,148 A 104,104 0 0,1 166,252 L 166,368 A 104,104 0 0,1 62,472 L 40,472" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <circle cx="132" cy="310" r="4.5" fill="#ffffff" />
        <circle cx="222" cy="310" r="4" fill="#facc15" />
        <path d="M 960,148 L 938,148 A 104,104 0 0,0 834,252 L 834,368 A 104,104 0 0,0 938,472 L 960,472" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.92)" stroke-width="3" />
        <circle cx="868" cy="310" r="4.5" fill="#ffffff" />
        <circle cx="778" cy="310" r="4" fill="#facc15" />
        <!-- Marcas zona de sustituciones 5m en banda inferior -->
        <line x1="385" y1="578" x2="385" y2="598" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <line x1="472" y1="578" x2="472" y2="598" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <line x1="528" y1="578" x2="528" y2="598" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <line x1="615" y1="578" x2="615" y2="598" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" />
        <!-- Porterías Futsal 3x2m -->
        <rect x="22" y="262" width="18" height="96" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <rect x="960" y="262" width="18" height="96" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <path d="M 40,50 A 18,18 0 0,0 58,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 58,588 A 18,18 0 0,0 40,570" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 960,50 A 18,18 0 0,1 942,32" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <path d="M 942,588 A 18,18 0 0,1 960,570" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="2" />
        <text x="58" y="60" fill="rgba(255,255,255,0.68)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">NUESTRA PORTERÍA · 6M</text>
        <text x="745" y="60" fill="rgba(255,255,255,0.68)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">ATAQUE HACIA RIVAL · 40×20M</text>
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
      a.download = `Pizarra_Futsal_${this.state.activePresetId || 'tactica'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      this.app?.showToast('Imagen PNG de la pizarra descargada', 'download');
    };
    img.src = url;
  }
}

export const tacticalBoard = new TacticalBoardController();
