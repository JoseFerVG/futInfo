/**
 * Estudio de Pizarra Táctica Libre (Fútbol Sala · 40x20m)
 * Permite crear jugadas desde cero o partir de sistemas base, editar pasos animados,
 * ajustar curvas manualmente, añadir textos, conos, fichas extra, Portero-Jugador (PJ),
 * invertir lado, cambiar colores/superficie y guardar un libreto propio en local y nube.
 */
import { store } from './store.js';

const BOARD_STORAGE_KEY = 'futinfo_tactical_board_futsal_v2';
const LEGACY_STORAGE_KEY = 'futinfo_tactical_board_futsal_v1';

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

const DEFAULT_COLOR_MAP = {
  pass: '#facc15',
  curve: '#fbbf24',
  dribble: '#38bdf8',
  run: '#34d399',
  screen: '#fb923c',
  shot: '#fb7185',
  zone: '#38bdf8',
  free: '#fde047',
  text: '#facc15',
  cone: '#f97316'
};

const COLOR_SWATCHES = ['#facc15', '#ffffff', '#34d399', '#fb7185', '#38bdf8', '#fb923c', '#fde047'];
const LINEAR_TOOL_TYPES = new Set(['pass', 'curve', 'dribble', 'run', 'screen', 'shot']);
const PLAYBACK_ARROW_TYPES = new Set(['pass', 'curve', 'dribble', 'shot']);

const BLANK_NOTES = {
  buildUp: '',
  attack: '',
  defense: '',
  setPieces: '',
  rotations: ''
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

function clampCoord(val, min, max) {
  return Math.round(Math.max(min, Math.min(max, val)) * 10) / 10;
}

function escapeXml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function cloneItem(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function quadBezierPoint(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  };
}

function defaultCurveControl(shape) {
  if (typeof shape.cx === 'number' && typeof shape.cy === 'number') {
    return { x: shape.cx, y: shape.cy };
  }
  const mx = (shape.x1 + shape.x2) / 2;
  const my = (shape.y1 + shape.y2) / 2;
  const dx = shape.x2 - shape.x1;
  const dy = shape.y2 - shape.y1;
  const len = Math.hypot(dx, dy) || 1;
  const curveSign = my > 50 ? 1 : -1;
  const offset = Math.min(20, Math.max(8, len * 0.28)) * curveSign;
  return {
    x: clampCoord(mx - (dy / len) * offset, 2, 98),
    y: clampCoord(my + (dx / len) * offset, 3, 97)
  };
}

function hasCustomCurve(shape) {
  return shape.type === 'curve' || (typeof shape.cx === 'number' && typeof shape.cy === 'number');
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distToCurve(px, py, p0, p1, p2) {
  let best = Infinity;
  let prev = p0;
  for (let i = 1; i <= 16; i++) {
    const curr = quadBezierPoint(p0, p1, p2, i / 16);
    best = Math.min(best, distToSegment(px, py, prev.x, prev.y, curr.x, curr.y));
    prev = curr;
  }
  return best;
}

function distToShape(pt, s) {
  if (!s) return Infinity;
  if (s.type === 'zone') {
    const minX = Math.min(s.x1, s.x2);
    const maxX = Math.max(s.x1, s.x2);
    const minY = Math.min(s.y1, s.y2);
    const maxY = Math.max(s.y1, s.y2);
    if (pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY) return 0.6;
    return Math.min(
      distToSegment(pt.x, pt.y, minX, minY, maxX, minY),
      distToSegment(pt.x, pt.y, maxX, minY, maxX, maxY),
      distToSegment(pt.x, pt.y, maxX, maxY, minX, maxY),
      distToSegment(pt.x, pt.y, minX, maxY, minX, minY)
    );
  }
  if (s.type === 'free' && Array.isArray(s.points)) {
    let best = Infinity;
    for (let k = 1; k < s.points.length; k++) {
      best = Math.min(best, distToSegment(pt.x, pt.y, s.points[k - 1].x, s.points[k - 1].y, s.points[k].x, s.points[k].y));
    }
    return best;
  }
  if (s.type === 'text') {
    const halfW = Math.max(4.5, ((s.text || 'NOTA').length * 0.68) + 1.8);
    if (Math.abs(pt.x - s.x1) <= halfW && Math.abs(pt.y - s.y1) <= 3.2) return 0.4;
    return Math.hypot(pt.x - s.x1, pt.y - s.y1);
  }
  if (s.type === 'cone') {
    return Math.hypot(pt.x - s.x1, pt.y - s.y1);
  }
  if (hasCustomCurve(s)) {
    const ctrl = defaultCurveControl(s);
    return distToCurve(pt.x, pt.y, { x: s.x1, y: s.y1 }, ctrl, { x: s.x2, y: s.y2 });
  }
  return distToSegment(pt.x, pt.y, s.x1, s.y1, s.x2, s.y2);
}

function getShapeColor(shape) {
  return shape?.color || DEFAULT_COLOR_MAP[shape?.type] || '#facc15';
}

function markerIdForColor(hex) {
  return `pz-arr-${String(hex || '#facc15').replace('#', '').toLowerCase()}`;
}

function computeWavePath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 16) return `M ${x1},${y1} L ${x2},${y2}`;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const waveLen = Math.max(12, len - 18);
  const steps = Math.max(4, Math.floor(waveLen / 18));
  let d = `M ${x1},${y1}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const midT = (i - 0.5) / steps;
    const amp = (i % 2 === 0 ? -1 : 1) * 7.5;
    const cx = x1 + ux * (waveLen * midT) + nx * amp;
    const cy = y1 + uy * (waveLen * midT) + ny * amp;
    const px = x1 + ux * (waveLen * t);
    const py = y1 + uy * (waveLen * t);
    d += ` Q ${cx.toFixed(1)},${cy.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)}`;
  }
  d += ` L ${x2.toFixed(1)},${y2.toFixed(1)}`;
  return d;
}

function projectToHorizontalPitch(slots, zoneView = 'full', team = 'home') {
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
        flyGK: false,
        x: clampCoord(x, 2, 98),
        y: clampCoord(y, 3, 97)
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
      flyGK: false,
      x: clampCoord(x, 2, 98),
      y: clampCoord(y, 3, 97)
    };
  });
}

function defaultHorizontalFormation(zoneView = 'full', team = 'home', getFormationFn = null, awayFormation = '1-1-2-1') {
  if (team === 'away') {
    const rivalSlots = RIVAL_FORMATIONS[awayFormation] || RIVAL_FORMATIONS['1-1-2-1'];
    return projectToHorizontalPitch(rivalSlots, zoneView, 'away');
  }
  const conf = typeof getFormationFn === 'function' ? getFormationFn('futsal', store.getActiveFormation()) : null;
  const baseSlots = (conf?.slots?.length ? conf.slots : DEFAULT_FUTSAL_SLOTS).slice(0, 5);
  return projectToHorizontalPitch(baseSlots, zoneView, 'home');
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
    const spots = [{ x: 14, y: 50 }, { x: 46, y: 48 }, { x: 70, y: 31 }, { x: 54, y: 69 }, { x: 84, y: 24 }];
    home.forEach((t, i) => { if (spots[i]) { t.x = spots[i].x; t.y = spots[i].y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 86, y: 26 };
  }
  if (presetId === 'contra') {
    const spots = [{ x: 10, y: 50 }, { x: 34, y: 36 }, { x: 34, y: 64 }, { x: 56, y: 30 }, { x: 64, y: 48 }];
    home.forEach((t, i) => { if (spots[i]) { t.x = spots[i].x; t.y = spots[i].y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 38, y: 50 };
  }
  if (presetId === 'corner_fav') {
    const spots = [{ x: 15, y: 50 }, { x: 48, y: 46 }, { x: 65, y: 44 }, { x: 72, y: 34 }, { x: 95, y: 92 }];
    home.forEach((t, i) => { if (spots[i]) { t.x = spots[i].x; t.y = spots[i].y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 95, y: 92 };
  }
  if (presetId === 'falta_abp') {
    const spots = [{ x: 14, y: 50 }, { x: 44, y: 46 }, { x: 60, y: 34 }, { x: 63, y: 41 }, { x: 71, y: 70 }];
    home.forEach((t, i) => { if (spots[i]) { t.x = spots[i].x; t.y = spots[i].y; } });
    if (away[2]) { away[2].x = 76; away[2].y = 40; }
    if (away[3]) { away[3].x = 76; away[3].y = 45; }
    if (away[4]) { away[4].x = 76; away[4].y = 50; }
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 60, y: 34 };
  }
  if (presetId === 'defensa_abp') {
    const spots = [{ x: 10, y: 50 }, { x: 16, y: 37 }, { x: 16, y: 63 }, { x: 25, y: 48 }, { x: 48, y: 28 }];
    home.forEach((t, i) => { if (spots[i]) { t.x = spots[i].x; t.y = spots[i].y; } });
    return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 80, y: 80 };
  }
  return { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
}

function buildPresetTokens(presetId, getFormationFn = null, awayFormation = '1-1-2-1') {
  const preset = TACTICAL_PRESETS[presetId];
  const zoneView = preset?.zoneView || 'full';
  const home = defaultHorizontalFormation(zoneView, 'home', getFormationFn, awayFormation);
  const away = defaultHorizontalFormation(zoneView, 'away', getFormationFn, awayFormation);
  const ball = preset
    ? applyPresetCoordinates(presetId, home, away)
    : { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 28, y: 50 };
  return { tokens: [...home, ...away, ball], zoneView };
}

export class TacticalBoardController {
  constructor() {
    this.state = null;
    this.getFormationFn = null;
    this._drag = null;
    this._draftShape = null;
    this._initialized = false;
    this._selectedTokenId = null;
    this._selectedShapeIdx = -1;
    this._pendingTextPoint = null;
    this._editingTextIdx = -1;
    this._saveFormOpen = false;
    this._animFrame = null;
    this._animPreview = null;
    this._animFrameIdx = null;
    this._activeStepIdx = -1;
    this._undoStack = [];
    this._redoStack = [];
  }

  ensureState() {
    if (!this.state) {
      this.state = this.loadState();
    }
    this.syncFramePointers();
    return this.state;
  }

  syncFramePointers() {
    if (!this.state) return;
    if (!Array.isArray(this.state.frames) || this.state.frames.length === 0) {
      this.state.frames = [{
        id: 'f1',
        label: 'Paso 1',
        tokens: Array.isArray(this.state.tokens) ? this.state.tokens : [],
        shapes: Array.isArray(this.state.shapes) ? this.state.shapes : []
      }];
    }
    const maxIdx = this.state.frames.length - 1;
    this.state.activeFrameIdx = Math.max(0, Math.min(maxIdx, this.state.activeFrameIdx || 0));
    const active = this.state.frames[this.state.activeFrameIdx];
    this.state.tokens = active.tokens;
    this.state.shapes = active.shapes;
  }

  normalizeLoadedState(parsed) {
    const validFrames = Array.isArray(parsed.frames) && parsed.frames.length > 0
      ? parsed.frames.filter(f => f && Array.isArray(f.tokens))
      : null;
    const rawTokens = validFrames?.[0]?.tokens || parsed.tokens || [];
    const hasHome = rawTokens.some(t => t.team === 'home');
    const hasBall = rawTokens.some(t => t.team === 'ball');
    if (!hasHome || !hasBall) return null;

    const frames = validFrames || [{
      id: 'f1',
      label: 'Paso 1',
      tokens: rawTokens,
      shapes: Array.isArray(parsed.shapes) ? parsed.shapes : []
    }];

    const idx = Math.max(0, Math.min(frames.length - 1, parsed.activeFrameIdx || 0));
    return {
      version: 2,
      zoneView: parsed.zoneView || 'full',
      courtTheme: ['blue', 'wood', 'dark'].includes(parsed.courtTheme) ? parsed.courtTheme : 'blue',
      activePresetId: parsed.activePresetId === null || TACTICAL_PRESETS[parsed.activePresetId] ? parsed.activePresetId : 'salida',
      activePlayId: parsed.activePlayId || null,
      activeTool: parsed.activeTool || 'move',
      drawColor: parsed.drawColor || null,
      drawWidth: parsed.drawWidth === 'bold' ? 'bold' : 'normal',
      awayFormation: RIVAL_FORMATIONS[parsed.awayFormation] ? parsed.awayFormation : '1-1-2-1',
      showRivals: parsed.showRivals !== false,
      showLanes: parsed.showLanes !== false,
      showStepNumbers: parsed.showStepNumbers !== false,
      showGhostTrails: parsed.showGhostTrails !== false,
      playbackSpeed: [0.6, 1, 1.5].includes(Number(parsed.playbackSpeed)) ? Number(parsed.playbackSpeed) : 1,
      loopPlayback: !!parsed.loopPlayback,
      frames,
      activeFrameIdx: idx,
      tokens: frames[idx].tokens,
      shapes: Array.isArray(frames[idx].shapes) ? frames[idx].shapes : [],
      customPlays: Array.isArray(parsed.customPlays) ? parsed.customPlays.slice(0, 20) : [],
      notes: { ...BLANK_NOTES, ...(parsed.notes || {}) },
      checklist: {
        warmup: !!parsed.checklist?.warmup,
        abpMarks: !!parsed.checklist?.abpMarks,
        rotationsPlan: !!parsed.checklist?.rotationsPlan,
        hydration: !!parsed.checklist?.hydration
      }
    };
  }

  loadState() {
    for (const key of [BOARD_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const norm = this.normalizeLoadedState(JSON.parse(raw));
          if (norm) return norm;
        }
      } catch {}
    }
    return this.createFreshState('salida');
  }

  createFreshState(presetId = 'salida', customPlaysPreserve = null) {
    const isBlank = presetId === 'blank' || !TACTICAL_PRESETS[presetId];
    const preset = TACTICAL_PRESETS[presetId];
    const awayFormation = this.state?.awayFormation && RIVAL_FORMATIONS[this.state.awayFormation]
      ? this.state.awayFormation
      : '1-1-2-1';
    const { tokens, zoneView } = buildPresetTokens(isBlank ? null : presetId, this.getFormationFn, awayFormation);
    const shapes = isBlank ? [] : preset.shapes.map(s => ({ ...s }));
    const frames = [{ id: 'f1', label: 'Paso 1', tokens, shapes }];
    return {
      version: 2,
      zoneView,
      courtTheme: this.state?.courtTheme || 'blue',
      activePresetId: isBlank ? null : presetId,
      activePlayId: null,
      activeTool: 'move',
      drawColor: this.state?.drawColor || null,
      drawWidth: this.state?.drawWidth || 'normal',
      awayFormation,
      showRivals: isBlank ? true : preset.showRivals !== false,
      showLanes: this.state?.showLanes ?? true,
      showStepNumbers: this.state?.showStepNumbers ?? true,
      showGhostTrails: this.state?.showGhostTrails ?? true,
      playbackSpeed: this.state?.playbackSpeed || 1,
      loopPlayback: !!this.state?.loopPlayback,
      frames,
      activeFrameIdx: 0,
      tokens,
      shapes,
      customPlays: customPlaysPreserve ?? (this.state?.customPlays || []),
      notes: isBlank ? { ...BLANK_NOTES } : { ...preset.notes },
      checklist: this.state?.checklist ? { ...this.state.checklist } : {
        warmup: false,
        abpMarks: false,
        rotationsPlan: false,
        hydration: false
      }
    };
  }

  snapshotUndoState() {
    this.ensureState();
    return JSON.stringify({
      frames: this.state.frames,
      activeFrameIdx: this.state.activeFrameIdx,
      zoneView: this.state.zoneView
    });
  }

  pushUndo(snapshot = null) {
    const snap = snapshot || this.snapshotUndoState();
    if (this._undoStack[this._undoStack.length - 1] === snap) return;
    this._undoStack.push(snap);
    if (this._undoStack.length > 40) this._undoStack.shift();
    this._redoStack = [];
  }

  undo() {
    if (this._undoStack.length === 0) return false;
    this.stopPlayback();
    this.ensureState();
    this._redoStack.push(this.snapshotUndoState());
    const prev = JSON.parse(this._undoStack.pop());
    this.state.frames = prev.frames;
    this.state.activeFrameIdx = prev.activeFrameIdx || 0;
    if (prev.zoneView) this.state.zoneView = prev.zoneView;
    this.syncFramePointers();
    this._selectedShapeIdx = -1;
    this.saveState();
    this.render();
    return true;
  }

  redo() {
    if (this._redoStack.length === 0) return false;
    this.stopPlayback();
    this.ensureState();
    this._undoStack.push(this.snapshotUndoState());
    const next = JSON.parse(this._redoStack.pop());
    this.state.frames = next.frames;
    this.state.activeFrameIdx = next.activeFrameIdx || 0;
    if (next.zoneView) this.state.zoneView = next.zoneView;
    this.syncFramePointers();
    this._selectedShapeIdx = -1;
    this.saveState();
    this.render();
    return true;
  }

  saveState() {
    const st = this.ensureState();
    this.syncFramePointers();
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
    const norm = this.normalizeLoadedState(remote);
    if (!norm) return;
    const remoteTs = remote.updatedAt || 0;
    if (remoteTs && remoteTs <= (this._lastRemoteBoardTs || 0)) return;
    this._lastRemoteBoardTs = remoteTs;
    this._isApplyingRemoteBoard = true;
    try {
      this.state = {
        ...norm,
        activeTool: this.state?.activeTool || norm.activeTool
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
    this.state.frames.forEach(frame => {
      const existingHome = frame.tokens.filter(t => t.team === 'home');
      const extraHome = existingHome.slice(freshHome.length);
      const mergedHome = freshHome.map((h, i) => ({
        ...h,
        flyGK: existingHome[i]?.flyGK || false,
        x: existingHome[i]?.x ?? h.x,
        y: existingHome[i]?.y ?? h.y
      }));
      const others = frame.tokens.filter(t => t.team !== 'home');
      frame.tokens = [...mergedHome, ...extraHome, ...others];
    });
    this.syncFramePointers();
    this.saveState();
    this.renderBoardSvg();
    this.renderSpecialistsBanner();
    this.renderRosterStrip();
    this.renderSelectionBar();
    if (announce && this.app) {
      this.app.showToast('Quinteto titular de Fútbol Sala actualizado en la pizarra', 'users');
    }
  }

  applyPreset(presetId) {
    this.stopPlayback();
    this.ensureState();
    const preset = TACTICAL_PRESETS[presetId];
    if (!preset) return;
    this.pushUndo();
    const next = this.createFreshState(presetId, this.state.customPlays);
    this.state = next;
    this._selectedTokenId = null;
    this._selectedShapeIdx = -1;
    this.saveState();
    this.render();
    this.app?.showToast(`Pizarra cargada: ${preset.label}`, 'clipboard-list');
  }

  resetBlankBoard() {
    this.stopPlayback();
    this.ensureState();
    this.pushUndo();
    this.state = this.createFreshState('blank', this.state.customPlays);
    this.state.notes = {
      buildUp: 'Diseña tu propia salida libre en pista vacía...',
      attack: '',
      defense: '',
      setPieces: '',
      rotations: ''
    };
    this._selectedTokenId = null;
    this._selectedShapeIdx = -1;
    this.saveState();
    this.render();
    this.app?.showToast('Pizarra en blanco lista para tu jugada', 'file-plus-2');
  }

  setZoneView(zoneView) {
    this.stopPlayback();
    this.ensureState();
    this.pushUndo();
    this.state.zoneView = zoneView;
    const home = defaultHorizontalFormation(zoneView, 'home', this.getFormationFn, this.state.awayFormation);
    const away = defaultHorizontalFormation(zoneView, 'away', this.getFormationFn, this.state.awayFormation);
    const ball = this.state.tokens.find(t => t.team === 'ball') || { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
    const extraHome = this.state.tokens.filter(t => t.team === 'home').slice(home.length);
    this.state.frames[this.state.activeFrameIdx].tokens = [...home, ...extraHome, ...away, ball];
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  setAwayFormation(formId) {
    if (!RIVAL_FORMATIONS[formId]) return;
    this.stopPlayback();
    this.ensureState();
    this.pushUndo();
    this.state.awayFormation = formId;
    const away = defaultHorizontalFormation(this.state.zoneView, 'away', this.getFormationFn, formId);
    const frame = this.state.frames[this.state.activeFrameIdx];
    frame.tokens = [...frame.tokens.filter(t => t.team !== 'away'), ...away];
    this.syncFramePointers();
    this.saveState();
    this.renderBoardSvg();
    this.renderToolbarState();
    this.app?.showToast(`Esquema rival en pizarra: ${formId}`, 'shield-alert');
  }

  flipCourtHorizontal() {
    this.stopPlayback();
    this.ensureState();
    this.pushUndo();
    this.state.frames.forEach(frame => {
      frame.tokens.forEach(t => {
        t.x = clampCoord(100 - t.x, 2, 98);
      });
      frame.shapes.forEach(s => {
        if (s.type === 'free' && Array.isArray(s.points)) {
          s.points = s.points.map(p => ({ x: clampCoord(100 - p.x, 2, 98), y: p.y }));
          return;
        }
        if (typeof s.x1 === 'number') s.x1 = clampCoord(100 - s.x1, 2, 98);
        if (typeof s.x2 === 'number') s.x2 = clampCoord(100 - s.x2, 2, 98);
        if (typeof s.cx === 'number') s.cx = clampCoord(100 - s.cx, 2, 98);
      });
    });
    this.syncFramePointers();
    this.saveState();
    this.render();
    this.app?.showToast('Jugada invertida horizontalmente', 'flip-horizontal-2');
  }

  addExtraToken(team) {
    this.stopPlayback();
    this.ensureState();
    const frame = this.state.frames[this.state.activeFrameIdx];
    const teamList = frame.tokens.filter(t => t.team === team);
    if (teamList.length >= 8) {
      this.app?.showToast('Máximo 8 fichas por equipo en pista', 'users');
      return;
    }
    this.pushUndo();
    const num = teamList.length + 1;
    const tok = team === 'home'
      ? { id: `home_ext_${Date.now().toString(36)}`, team: 'home', playerId: null, label: String(num), subLabel: 'ALA', role: 'ALA', flyGK: false, x: 35 + num * 2, y: 50 }
      : { id: `away_ext_${Date.now().toString(36)}`, team: 'away', label: `R${num}`, subLabel: 'RIV', role: 'ALA', flyGK: false, x: 65 - num * 2, y: 50 };
    frame.tokens.push(tok);
    if (team === 'away') this.state.showRivals = true;
    this._selectedTokenId = tok.id;
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
    this.app?.showToast(team === 'home' ? 'Ficha propia añadida a la pista' : 'Ficha rival añadida', 'user-plus');
  }

  removeSelectedToken() {
    if (!this._selectedTokenId) return;
    this.ensureState();
    const frame = this.state.frames[this.state.activeFrameIdx];
    const tok = frame.tokens.find(t => t.id === this._selectedTokenId);
    if (!tok || tok.team === 'ball') return;
    if (tok.team === 'home' && frame.tokens.filter(t => t.team === 'home').length <= 1) {
      this.app?.showToast('Debe quedar al menos un jugador en pista', 'alert-triangle');
      return;
    }
    this.pushUndo();
    frame.tokens = frame.tokens.filter(t => t.id !== tok.id);
    this._selectedTokenId = null;
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  addFrame() {
    this.stopPlayback();
    this.ensureState();
    if (this.state.frames.length >= 8) {
      this.app?.showToast('Máximo 8 pasos animados por jugada', 'film');
      return;
    }
    this.pushUndo();
    const curr = this.state.frames[this.state.activeFrameIdx];
    const nextIdx = this.state.activeFrameIdx + 1;
    // Keep cones across steps; arrows start fresh so next phase is crisp
    const persistentShapes = (curr.shapes || []).filter(s => s.type === 'cone' || s.type === 'zone').map(cloneItem);
    const nextFrame = {
      id: `f_${Date.now().toString(36)}`,
      label: `Paso ${this.state.frames.length + 1}`,
      tokens: curr.tokens.map(cloneItem),
      shapes: persistentShapes
    };
    this.state.frames.splice(nextIdx, 0, nextFrame);
    this.state.frames.forEach((f, i) => { f.label = `Paso ${i + 1}`; });
    this.state.activeFrameIdx = nextIdx;
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
    this.app?.showToast(`Paso ${nextIdx + 1} creado: mueve las fichas a su nueva posición`, 'film');
  }

  selectFrame(idx) {
    this.stopPlayback();
    this.ensureState();
    if (idx < 0 || idx >= this.state.frames.length) return;
    this.state.activeFrameIdx = idx;
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  deleteCurrentFrame() {
    this.stopPlayback();
    this.ensureState();
    if (this.state.frames.length <= 1) {
      this.app?.showToast('La jugada necesita al menos 1 paso', 'film');
      return;
    }
    this.pushUndo();
    this.state.frames.splice(this.state.activeFrameIdx, 1);
    this.state.frames.forEach((f, i) => { f.label = `Paso ${i + 1}`; });
    this.state.activeFrameIdx = Math.max(0, Math.min(this.state.frames.length - 1, this.state.activeFrameIdx));
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  saveCustomPlay(nameRaw) {
    this.ensureState();
    const name = String(nameRaw || '').trim().slice(0, 42);
    if (!name) {
      this.app?.showToast('Escribe un nombre para guardar la jugada', 'bookmark-plus');
      return;
    }
    const id = `play_${Date.now().toString(36)}`;
    const playObj = {
      id,
      name,
      zoneView: this.state.zoneView,
      courtTheme: this.state.courtTheme,
      showRivals: this.state.showRivals,
      awayFormation: this.state.awayFormation,
      frames: cloneItem(this.state.frames),
      notes: cloneItem(this.state.notes),
      checklist: cloneItem(this.state.checklist),
      updatedAt: Date.now()
    };
    this.state.customPlays = [playObj, ...(this.state.customPlays || []).filter(p => p.id !== id)].slice(0, 20);
    this.state.activePlayId = id;
    this.state.activePresetId = null;
    this._saveFormOpen = false;
    this.saveState();
    this.render();
    this.app?.showToast(`Jugada "${name}" guardada en tu libreto`, 'bookmark-check');
  }

  updateActiveCustomPlay() {
    this.ensureState();
    if (!this.state.activePlayId) return;
    const play = (this.state.customPlays || []).find(p => p.id === this.state.activePlayId);
    if (!play) return;
    play.zoneView = this.state.zoneView;
    play.courtTheme = this.state.courtTheme;
    play.showRivals = this.state.showRivals;
    play.awayFormation = this.state.awayFormation;
    play.frames = cloneItem(this.state.frames);
    play.notes = cloneItem(this.state.notes);
    play.checklist = cloneItem(this.state.checklist);
    play.updatedAt = Date.now();
    this.saveState();
    this.renderCustomPlaysBar();
    this.app?.showToast(`Jugada "${play.name}" actualizada`, 'bookmark-check');
  }

  loadCustomPlay(id) {
    this.stopPlayback();
    this.ensureState();
    const play = (this.state.customPlays || []).find(p => p.id === id);
    if (!play) return;
    this.pushUndo();
    this.state.zoneView = play.zoneView || 'full';
    this.state.courtTheme = play.courtTheme || this.state.courtTheme || 'blue';
    this.state.showRivals = play.showRivals !== false;
    this.state.awayFormation = play.awayFormation || '1-1-2-1';
    this.state.frames = cloneItem(play.frames || []);
    this.state.activeFrameIdx = 0;
    this.state.notes = { ...BLANK_NOTES, ...(play.notes || {}) };
    if (play.checklist) this.state.checklist = cloneItem(play.checklist);
    this.state.activePlayId = play.id;
    this.state.activePresetId = null;
    this._selectedTokenId = null;
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
    this.app?.showToast(`Cargada jugada: ${play.name}`, 'folder-open');
  }

  deleteCustomPlay(id) {
    this.ensureState();
    this.state.customPlays = (this.state.customPlays || []).filter(p => p.id !== id);
    if (this.state.activePlayId === id) {
      this.state.activePlayId = null;
    }
    this.saveState();
    this.renderCustomPlaysBar();
    this.renderToolbarState();
    this.app?.showToast('Jugada eliminada del libreto', 'trash-2');
  }

  stopPlayback() {
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
    this._animPreview = null;
    this._animFrameIdx = null;
    this._activeStepIdx = -1;
    const btn = document.getElementById('btn-pizarra-play');
    if (btn) {
      btn.classList.remove('active');
      const sp = btn.querySelector('span');
      if (sp) sp.textContent = 'SIMULAR';
    }
    this.renderBoardSvg();
    this.renderFramesBar();
  }

  togglePlayback() {
    this.ensureState();
    if (this._animFrame) {
      this.stopPlayback();
      return;
    }

    if (this.state.frames.length > 1) {
      this.playMultiFrameSequence();
      return;
    }

    const ballMoveShapes = this.state.shapes
      .map((s, idx) => ({ shape: s, idx }))
      .filter(({ shape }) => PLAYBACK_ARROW_TYPES.has(shape.type));

    const runShapes = this.state.shapes.filter(s => s.type === 'run');
    if (ballMoveShapes.length === 0 && runShapes.length === 0) {
      this.app?.showToast('Añade un Paso 2 o dibuja flechas para simular la jugada', 'play');
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
      return bestTok ? { id: bestTok.id, x1: bestTok.x, y1: bestTok.y, x2: r.x2, y2: r.y2, cx: r.cx, cy: r.cy, type: r.type } : null;
    }).filter(Boolean);

    this.setPlayButtonActive(true);
    const speed = this.state.playbackSpeed || 1;
    const stepCount = Math.max(1, ballMoveShapes.length);
    const stepMs = 950 / speed;
    const playMs = stepCount * stepMs;
    const totalMs = playMs + 600 / speed;
    let startTs = performance.now();

    const tick = (now) => {
      const elapsed = now - startTs;
      if (elapsed >= totalMs) {
        if (this.state.loopPlayback) {
          startTs = performance.now();
          this._animFrame = requestAnimationFrame(tick);
          return;
        }
        this.stopPlayback();
        return;
      }

      const clamped = Math.min(elapsed, playMs);
      const stepFloat = clamped / stepMs;
      const segIdx = Math.min(stepCount - 1, Math.floor(stepFloat));
      const segT = Math.min(1, stepFloat - segIdx);
      const previewTokens = {};

      if (ballMoveShapes[segIdx]) {
        const { shape, idx } = ballMoveShapes[segIdx];
        this._activeStepIdx = idx;
        if (hasCustomCurve(shape)) {
          const ctrl = defaultCurveControl(shape);
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
        if (hasCustomCurve(r)) {
          const ctrl = defaultCurveControl(r);
          previewTokens[r.id] = quadBezierPoint({ x: r.x1, y: r.y1 }, ctrl, { x: r.x2, y: r.y2 }, globalT);
        } else {
          previewTokens[r.id] = {
            x: r.x1 + (r.x2 - r.x1) * globalT,
            y: r.y1 + (r.y2 - r.y1) * globalT
          };
        }
      });

      this._animPreview = previewTokens;
      this.renderBoardSvg();
      this._animFrame = requestAnimationFrame(tick);
    };

    this._animFrame = requestAnimationFrame(tick);
  }

  playMultiFrameSequence() {
    this.setPlayButtonActive(true);
    const speed = this.state.playbackSpeed || 1;
    const frames = this.state.frames;
    const segMs = 1350 / speed;
    const segCount = frames.length - 1;
    const playMs = segCount * segMs;
    const totalMs = playMs + 650 / speed;
    let startTs = performance.now();

    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const tick = (now) => {
      const elapsed = now - startTs;
      if (elapsed >= totalMs) {
        if (this.state.loopPlayback) {
          startTs = performance.now();
          this._animFrame = requestAnimationFrame(tick);
          return;
        }
        this.stopPlayback();
        return;
      }

      const clamped = Math.min(elapsed, playMs);
      const rawSeg = clamped / segMs;
      const segIdx = Math.min(segCount - 1, Math.floor(rawSeg));
      const t = ease(Math.min(1, rawSeg - segIdx));
      const fA = frames[segIdx];
      const fB = frames[segIdx + 1];
      const bMap = new Map(fB.tokens.map(tok => [tok.id, tok]));
      const preview = {};

      fA.tokens.forEach(tokA => {
        const tokB = bMap.get(tokA.id);
        if (tokB) {
          preview[tokA.id] = {
            x: tokA.x + (tokB.x - tokA.x) * t,
            y: tokA.y + (tokB.y - tokA.y) * t
          };
        } else {
          preview[tokA.id] = { x: tokA.x, y: tokA.y };
        }
      });

      this._animPreview = preview;
      if (this._animFrameIdx !== segIdx) {
        this._animFrameIdx = segIdx;
        this.renderFramesBar();
      }
      this.renderBoardSvg();
      this._animFrame = requestAnimationFrame(tick);
    };

    this._animFrame = requestAnimationFrame(tick);
  }

  setPlayButtonActive(isActive) {
    const btn = document.getElementById('btn-pizarra-play');
    if (btn) {
      btn.classList.toggle('active', isActive);
      const sp = btn.querySelector('span');
      if (sp) sp.textContent = isActive ? 'DETENER' : 'SIMULAR';
    }
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

  openTextPrompt(point, shapeIdx = -1) {
    this._pendingTextPoint = point;
    this._editingTextIdx = shapeIdx;
    const box = document.getElementById('pizarra-text-prompt');
    const input = document.getElementById('pizarra-text-prompt-input');
    if (!box || !input) return;
    const existing = shapeIdx >= 0 ? this.state.shapes[shapeIdx]?.text : '';
    input.value = existing || '';
    box.classList.remove('hidden');
    setTimeout(() => input.focus(), 20);
  }

  closeTextPrompt() {
    this._pendingTextPoint = null;
    this._editingTextIdx = -1;
    document.getElementById('pizarra-text-prompt')?.classList.add('hidden');
  }

  commitTextPrompt() {
    const input = document.getElementById('pizarra-text-prompt-input');
    const txt = String(input?.value || '').trim().toUpperCase().slice(0, 26);
    if (!txt) {
      this.closeTextPrompt();
      return;
    }
    this.ensureState();
    this.pushUndo();
    const frame = this.state.frames[this.state.activeFrameIdx];
    if (this._editingTextIdx >= 0 && frame.shapes[this._editingTextIdx]) {
      frame.shapes[this._editingTextIdx].text = txt;
      this._selectedShapeIdx = this._editingTextIdx;
    } else if (this._pendingTextPoint) {
      frame.shapes.push({
        type: 'text',
        x1: this._pendingTextPoint.x,
        y1: this._pendingTextPoint.y,
        x2: this._pendingTextPoint.x,
        y2: this._pendingTextPoint.y,
        text: txt,
        color: this.state.drawColor || DEFAULT_COLOR_MAP.text
      });
      this._selectedShapeIdx = frame.shapes.length - 1;
      this._selectedTokenId = null;
    }
    this.closeTextPrompt();
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  bindEvents() {
    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ensureState();
        this.state.activeTool = btn.dataset.tool || 'move';
        this.closeTextPrompt();
        this.saveState();
        this.renderToolbarState();
      });
    });

    document.querySelectorAll('.pizarra-color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        this.ensureState();
        this.state.drawColor = sw.dataset.color === 'auto' ? null : sw.dataset.color;
        if (this._selectedShapeIdx >= 0 && this.state.shapes[this._selectedShapeIdx] && this.state.drawColor) {
          this.pushUndo();
          this.state.shapes[this._selectedShapeIdx].color = this.state.drawColor;
        }
        this.saveState();
        this.renderToolbarState();
        this.renderBoardSvg();
        this.renderSelectionBar();
      });
    });

    document.getElementById('btn-pizarra-dash-toggle')?.addEventListener('click', () => {
      this.ensureState();
      this.state.drawWidth = this.state.drawWidth === 'bold' ? 'normal' : 'bold';
      if (this._selectedShapeIdx >= 0 && this.state.shapes[this._selectedShapeIdx]) {
        this.pushUndo();
        this.state.shapes[this._selectedShapeIdx].bold = this.state.drawWidth === 'bold';
      }
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
      this.renderSelectionBar();
    });

    document.querySelectorAll('.pizarra-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
    });

    document.getElementById('btn-pizarra-blank')?.addEventListener('click', () => this.resetBlankBoard());

    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setZoneView(btn.dataset.zone));
    });

    document.getElementById('pizarra-court-theme')?.addEventListener('change', (e) => {
      this.ensureState();
      this.state.courtTheme = e.target.value;
      this.saveState();
      this.renderBoardSvg();
    });

    document.getElementById('pizarra-rival-formation')?.addEventListener('change', (e) => {
      this.setAwayFormation(e.target.value);
    });

    document.getElementById('btn-pizarra-play')?.addEventListener('click', () => this.togglePlayback());

    document.getElementById('btn-pizarra-toggle-rivals')?.addEventListener('click', () => {
      this.ensureState();
      this.state.showRivals = !this.state.showRivals;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('btn-pizarra-add-home')?.addEventListener('click', () => this.addExtraToken('home'));
    document.getElementById('btn-pizarra-add-away')?.addEventListener('click', () => this.addExtraToken('away'));
    document.getElementById('btn-pizarra-flip')?.addEventListener('click', () => this.flipCourtHorizontal());

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

    document.getElementById('btn-pizarra-toggle-ghost')?.addEventListener('click', () => {
      this.ensureState();
      this.state.showGhostTrails = !this.state.showGhostTrails;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('pizarra-playback-speed')?.addEventListener('change', (e) => {
      this.ensureState();
      this.state.playbackSpeed = Number(e.target.value) || 1;
      this.saveState();
    });

    document.getElementById('btn-pizarra-loop')?.addEventListener('click', () => {
      this.ensureState();
      this.state.loopPlayback = !this.state.loopPlayback;
      this.saveState();
      this.renderToolbarState();
    });

    document.getElementById('btn-pizarra-frame-add')?.addEventListener('click', () => this.addFrame());
    document.getElementById('btn-pizarra-frame-del')?.addEventListener('click', () => this.deleteCurrentFrame());

    document.getElementById('btn-pizarra-toggle-save-box')?.addEventListener('click', () => {
      this._saveFormOpen = !this._saveFormOpen;
      this.renderCustomPlaysBar();
      if (this._saveFormOpen) {
        const inp = document.getElementById('pizarra-play-name-input');
        setTimeout(() => inp?.focus(), 20);
      }
    });

    document.getElementById('btn-pizarra-confirm-save-play')?.addEventListener('click', () => {
      const inp = document.getElementById('pizarra-play-name-input');
      this.saveCustomPlay(inp?.value);
      if (inp) inp.value = '';
    });

    document.getElementById('btn-pizarra-cancel-save-play')?.addEventListener('click', () => {
      this._saveFormOpen = false;
      this.renderCustomPlaysBar();
    });

    document.getElementById('pizarra-play-name-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-pizarra-confirm-save-play')?.click();
      } else if (e.key === 'Escape') {
        this._saveFormOpen = false;
        this.renderCustomPlaysBar();
      }
    });

    document.getElementById('btn-pizarra-text-apply')?.addEventListener('click', () => this.commitTextPrompt());
    document.getElementById('btn-pizarra-text-cancel')?.addEventListener('click', () => this.closeTextPrompt());
    document.getElementById('pizarra-text-prompt-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.commitTextPrompt();
      } else if (e.key === 'Escape') {
        this.closeTextPrompt();
      }
    });

    document.getElementById('btn-pizarra-undo')?.addEventListener('click', () => {
      if (!this.undo()) {
        this.ensureState();
        if (this.state.shapes.length > 0) {
          this.state.shapes.pop();
          this.saveState();
          this.renderBoardSvg();
        }
      }
    });

    document.getElementById('btn-pizarra-redo')?.addEventListener('click', () => this.redo());

    document.getElementById('btn-pizarra-clear-draw')?.addEventListener('click', () => {
      this.stopPlayback();
      this.ensureState();
      this.pushUndo();
      this.state.frames[this.state.activeFrameIdx].shapes = [];
      this._selectedShapeIdx = -1;
      this.syncFramePointers();
      this.saveState();
      this.render();
      this.app?.showToast('Trazos, textos y conos de este paso borrados', 'eraser');
    });

    document.getElementById('btn-pizarra-sync-lineup')?.addEventListener('click', () => {
      this.stopPlayback();
      this.pushUndo();
      this.syncPlayersWithLineup(true);
    });

    document.getElementById('btn-pizarra-ball-to-selected')?.addEventListener('click', () => {
      this.ensureState();
      this.pushUndo();
      const target = this.state.tokens.find(t => t.id === this._selectedTokenId && t.team !== 'ball')
        || this.state.tokens.find(t => t.team === 'home');
      const ball = this.state.tokens.find(t => t.team === 'ball');
      if (target && ball) {
        ball.x = clampCoord(target.x + 2.8, 2, 98);
        ball.y = target.y;
        this.saveState();
        this.renderBoardSvg();
        this.app?.showToast(`Balón colocado con ${target.subLabel}`, 'circle-dot');
      }
    });

    document.getElementById('btn-pizarra-reset')?.addEventListener('click', () => {
      const id = this.ensureState().activePresetId;
      if (id) this.applyPreset(id);
      else this.resetBlankBoard();
    });

    document.getElementById('btn-pizarra-export-png')?.addEventListener('click', () => this.exportBoardAsPng());
    document.getElementById('btn-pizarra-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-pizarra-open-matchplan')?.addEventListener('click', () => this.app?.openSquadActionsModal('tab-matchplan'));

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

    document.addEventListener('keydown', (e) => {
      const pizarra = document.getElementById('view-pizarra');
      if (!pizarra || pizarra.classList.contains('hidden')) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && this._selectedShapeIdx >= 0) {
        e.preventDefault();
        this.deleteSelectedShape();
      }
    });

    this.bindSvgPointerEvents();
  }

  deleteSelectedShape() {
    this.ensureState();
    const frame = this.state.frames[this.state.activeFrameIdx];
    if (this._selectedShapeIdx < 0 || this._selectedShapeIdx >= frame.shapes.length) return;
    this.pushUndo();
    frame.shapes.splice(this._selectedShapeIdx, 1);
    this._selectedShapeIdx = -1;
    this.syncFramePointers();
    this.saveState();
    this.render();
  }

  getSvgPercentPoint(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: clampCoord(x, 2, 98), y: clampCoord(y, 3, 97) };
  }

  findShapeNear(pt) {
    const shapes = this.state.shapes || [];
    let bestIdx = -1;
    let bestDist = 4.2;
    shapes.forEach((s, i) => {
      const d = distToShape(pt, s);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    return bestIdx;
  }

  eraseShapeNear(pt) {
    const bestIdx = this.findShapeNear(pt);
    if (bestIdx !== -1) {
      this.pushUndo();
      this.state.shapes.splice(bestIdx, 1);
      if (this._selectedShapeIdx === bestIdx) this._selectedShapeIdx = -1;
      this.saveState();
      this.render();
      return true;
    }
    return false;
  }

  bindSvgPointerEvents() {
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;

    svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      this.stopPlayback();
      this.ensureState();
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);
      const tool = this.state.activeTool || 'move';

      if (tool === 'erase_one') {
        e.preventDefault();
        this.eraseShapeNear(pt);
        return;
      }

      if (tool === 'text') {
        e.preventDefault();
        this.openTextPrompt(pt, -1);
        return;
      }

      if (tool === 'cone') {
        e.preventDefault();
        this.pushUndo();
        this.state.shapes.push({
          type: 'cone',
          x1: pt.x,
          y1: pt.y,
          x2: pt.x,
          y2: pt.y,
          color: this.state.drawColor || DEFAULT_COLOR_MAP.cone
        });
        this._selectedShapeIdx = this.state.shapes.length - 1;
        this._selectedTokenId = null;
        this.saveState();
        this.render();
        return;
      }

      // 1. Active shape control handle in Move/Edit mode
      const handleEl = e.target.closest('[data-handle-type]');
      if (handleEl && tool === 'move' && this._selectedShapeIdx >= 0) {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._drag = {
          kind: 'handle',
          shapeIdx: this._selectedShapeIdx,
          handle: handleEl.dataset.handleType,
          undoSnap: this.snapshotUndoState(),
          moved: false
        };
        return;
      }

      // 2. Drag player / rival / ball token
      const tokenGroup = e.target.closest('[data-token-id]');
      if (tokenGroup && tool === 'move') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._selectedTokenId = tokenGroup.dataset.tokenId;
        this._selectedShapeIdx = -1;
        this._drag = {
          kind: 'token',
          tokenId: tokenGroup.dataset.tokenId,
          undoSnap: this.snapshotUndoState(),
          moved: false
        };
        this.renderBoardSvg();
        this.renderSelectionBar();
        this.renderRosterStrip();
        return;
      }

      // 3. Select / drag an existing shape or text or cone in Move/Edit mode
      if (tool === 'move') {
        const hitIdx = this.findShapeNear(pt);
        if (hitIdx !== -1) {
          e.preventDefault();
          svg.setPointerCapture(e.pointerId);
          this._selectedShapeIdx = hitIdx;
          this._selectedTokenId = null;
          this._drag = {
            kind: 'shape',
            shapeIdx: hitIdx,
            lastPt: pt,
            undoSnap: this.snapshotUndoState(),
            moved: false
          };
          this.renderBoardSvg();
          this.renderSelectionBar();
          this.renderRosterStrip();
        } else if (this._selectedTokenId || this._selectedShapeIdx >= 0) {
          this._selectedTokenId = null;
          this._selectedShapeIdx = -1;
          this.renderBoardSvg();
          this.renderSelectionBar();
          this.renderRosterStrip();
        }
        return;
      }

      // 4. Drawing a new stroke or geometric tactical shape
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      const customColor = this.state.drawColor || DEFAULT_COLOR_MAP[tool] || '#facc15';
      const bold = this.state.drawWidth === 'bold';
      if (tool === 'free') {
        this._draftShape = { type: 'free', points: [pt], color: customColor, bold };
      } else {
        this._draftShape = { type: tool, x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y, color: customColor, bold };
      }
      this.renderBoardSvg();
    });

    svg.addEventListener('pointermove', (e) => {
      if (!this._drag && !this._draftShape) return;
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);

      if (this._drag) {
        this._drag.moved = true;
        if (this._drag.kind === 'token') {
          const tok = this.state.tokens.find(t => t.id === this._drag.tokenId);
          if (tok) {
            tok.x = pt.x;
            tok.y = pt.y;
            this.renderBoardSvg();
          }
        } else if (this._drag.kind === 'handle') {
          const s = this.state.shapes[this._drag.shapeIdx];
          if (s) {
            if (this._drag.handle === 'p1') { s.x1 = pt.x; s.y1 = pt.y; }
            else if (this._drag.handle === 'p2') { s.x2 = pt.x; s.y2 = pt.y; }
            else if (this._drag.handle === 'cp') { s.cx = pt.x; s.cy = pt.y; }
            this.renderBoardSvg();
          }
        } else if (this._drag.kind === 'shape') {
          const s = this.state.shapes[this._drag.shapeIdx];
          const dx = pt.x - this._drag.lastPt.x;
          const dy = pt.y - this._drag.lastPt.y;
          this._drag.lastPt = pt;
          if (s && (dx !== 0 || dy !== 0)) {
            if (s.type === 'free' && Array.isArray(s.points)) {
              s.points = s.points.map(p => ({ x: clampCoord(p.x + dx, 2, 98), y: clampCoord(p.y + dy, 3, 97) }));
            } else {
              s.x1 = clampCoord((s.x1 || 0) + dx, 2, 98);
              s.y1 = clampCoord((s.y1 || 0) + dy, 3, 97);
              s.x2 = clampCoord((s.x2 || 0) + dx, 2, 98);
              s.y2 = clampCoord((s.y2 || 0) + dy, 3, 97);
              if (typeof s.cx === 'number') s.cx = clampCoord(s.cx + dx, 2, 98);
              if (typeof s.cy === 'number') s.cy = clampCoord(s.cy + dy, 3, 97);
            }
            this.renderBoardSvg();
          }
        }
        return;
      }

      if (this._draftShape) {
        if (this._draftShape.type === 'free') {
          const pts = this._draftShape.points;
          const prev = pts[pts.length - 1];
          if (!prev || Math.hypot(pt.x - prev.x, pt.y - prev.y) >= 1.1) {
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
        const dragInfo = this._drag;
        this._drag = null;
        if (dragInfo.moved) {
          this.pushUndo(dragInfo.undoSnap);
          this.saveState();
          this.renderSelectionBar();
        }
      }
      if (this._draftShape) {
        const d = this._draftShape;
        this._draftShape = null;
        const valid = d.type === 'free' ? d.points.length >= 3 : Math.hypot(d.x2 - d.x1, d.y2 - d.y1) >= 2.2;
        if (valid) {
          this.pushUndo();
          if (d.type === 'curve') {
            const c = defaultCurveControl(d);
            d.cx = c.x;
            d.cy = c.y;
          }
          this.state.shapes.push(d);
          this._selectedShapeIdx = this.state.shapes.length - 1;
          this._selectedTokenId = null;
          this.saveState();
        }
        this.renderBoardSvg();
        this.renderSelectionBar();
      }
      try { svg.releasePointerCapture(e.pointerId); } catch {}
    };

    svg.addEventListener('pointerup', finishPointer);
    svg.addEventListener('pointercancel', finishPointer);

    svg.addEventListener('dblclick', (e) => {
      const handleEl = e.target.closest('[data-handle-type="cp"]');
      if (handleEl && this._selectedShapeIdx >= 0) {
        const s = this.state.shapes[this._selectedShapeIdx];
        if (s) {
          this.pushUndo();
          delete s.cx;
          delete s.cy;
          if (s.type === 'curve') s.type = 'pass';
          this.saveState();
          this.renderBoardSvg();
          this.renderSelectionBar();
        }
        return;
      }
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);
      const hitIdx = this.findShapeNear(pt);
      if (hitIdx >= 0 && this.state.shapes[hitIdx]?.type === 'text') {
        this.openTextPrompt(pt, hitIdx);
      } else if (e.target.closest('[data-token-id]')) {
        const inp = document.getElementById('pz-sel-tok-sub');
        inp?.focus();
        inp?.select();
      }
    });
  }

  render() {
    this.ensureState();
    this.renderToolbarState();
    this.renderCustomPlaysBar();
    this.renderFramesBar();
    this.renderSelectionBar();
    this.renderNotesInputs();
    this.renderSpecialistsBanner();
    this.renderRosterStrip();
    this.renderBoardSvg();
    this.app?.refreshIcons();
  }

  renderToolbarState() {
    const preset = TACTICAL_PRESETS[this.state.activePresetId];
    const activePlay = (this.state.customPlays || []).find(p => p.id === this.state.activePlayId);

    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      const on = btn.dataset.tool === this.state.activeTool;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.pizarra-preset-btn').forEach(btn => {
      const on = btn.dataset.preset === this.state.activePresetId && !activePlay;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    const blankBtn = document.getElementById('btn-pizarra-blank');
    if (blankBtn) {
      const onBlank = !this.state.activePresetId && !activePlay;
      blankBtn.classList.toggle('active', onBlank);
      blankBtn.setAttribute('aria-pressed', String(onBlank));
    }
    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      const on = btn.dataset.zone === this.state.zoneView;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.pizarra-color-swatch').forEach(sw => {
      const want = this.state.drawColor || 'auto';
      const on = sw.dataset.color === want;
      sw.classList.toggle('active', on);
      sw.setAttribute('aria-pressed', String(on));
    });

    const widthBtn = document.getElementById('btn-pizarra-dash-toggle');
    if (widthBtn) {
      const isBold = this.state.drawWidth === 'bold';
      widthBtn.classList.toggle('active', isBold);
      const sp = widthBtn.querySelector('span');
      if (sp) sp.textContent = isBold ? 'GRUESO' : 'TRAZO';
    }

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
    const ghostBtn = document.getElementById('btn-pizarra-toggle-ghost');
    if (ghostBtn) {
      ghostBtn.classList.toggle('active', this.state.showGhostTrails !== false);
      ghostBtn.setAttribute('aria-pressed', String(this.state.showGhostTrails !== false));
    }
    const loopBtn = document.getElementById('btn-pizarra-loop');
    if (loopBtn) {
      loopBtn.classList.toggle('active', !!this.state.loopPlayback);
      loopBtn.setAttribute('aria-pressed', String(!!this.state.loopPlayback));
    }

    const rivalSel = document.getElementById('pizarra-rival-formation');
    if (rivalSel && this.state.awayFormation) rivalSel.value = this.state.awayFormation;

    const themeSel = document.getElementById('pizarra-court-theme');
    if (themeSel && this.state.courtTheme) themeSel.value = this.state.courtTheme;

    const speedSel = document.getElementById('pizarra-playback-speed');
    if (speedSel && this.state.playbackSpeed) speedSel.value = String(this.state.playbackSpeed);

    const summaryEl = document.getElementById('pizarra-phase-summary');
    if (summaryEl) {
      summaryEl.textContent = activePlay
        ? `Jugada propia activa: "${activePlay.name}" (${this.state.frames.length} ${this.state.frames.length === 1 ? 'paso' : 'pasos'}).`
        : (preset ? preset.shortDesc : 'Pizarra en blanco: arrastra fichas, curva cualquier flecha con su punto central y añade pasos animados.');
    }

    const svg = document.getElementById('pizarra-board-svg');
    if (svg) {
      const tool = this.state.activeTool;
      svg.style.cursor = tool === 'move' ? 'grab' : (tool === 'erase_one' ? 'pointer' : (tool === 'text' ? 'text' : 'crosshair'));
    }
  }

  renderCustomPlaysBar() {
    const bar = document.getElementById('pizarra-custom-plays-bar');
    const formRow = document.getElementById('pizarra-save-form-row');
    const listWrap = document.getElementById('pizarra-custom-plays-list-wrap');
    const listEl = document.getElementById('pizarra-custom-plays-list');
    if (!bar || !formRow || !listWrap || !listEl) return;

    const plays = this.state.customPlays || [];
    const showBar = this._saveFormOpen || plays.length > 0;
    bar.classList.toggle('hidden', !showBar);
    formRow.classList.toggle('hidden', !this._saveFormOpen);
    listWrap.classList.toggle('hidden', plays.length === 0);

    listEl.innerHTML = plays.map(p => {
      const on = p.id === this.state.activePlayId;
      return `
        <div class="pizarra-play-pill ${on ? 'is-active' : ''}">
          <button type="button" class="pizarra-play-load" data-play-id="${p.id}" title="Cargar ${escapeXml(p.name)} (${p.frames?.length || 1} pasos)">
            <span>${escapeXml(p.name)}</span>
            <small>${p.frames?.length || 1}P</small>
          </button>
          ${on ? `<button type="button" class="pizarra-play-act" data-play-save="${p.id}" title="Guardar cambios en esta jugada"><i data-lucide="save" class="w-3 h-3"></i></button>` : ''}
          <button type="button" class="pizarra-play-act pizarra-play-act--del" data-play-del="${p.id}" title="Eliminar jugada" aria-label="Eliminar ${escapeXml(p.name)}"><i data-lucide="x" class="w-3 h-3"></i></button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-play-id]').forEach(btn => {
      btn.addEventListener('click', () => this.loadCustomPlay(btn.dataset.playId));
    });
    listEl.querySelectorAll('[data-play-save]').forEach(btn => {
      btn.addEventListener('click', () => this.updateActiveCustomPlay());
    });
    listEl.querySelectorAll('[data-play-del]').forEach(btn => {
      btn.addEventListener('click', () => this.deleteCustomPlay(btn.dataset.playDel));
    });
    this.app?.refreshIcons();
  }

  renderFramesBar() {
    const listEl = document.getElementById('pizarra-frames-list');
    if (!listEl) return;
    const frames = this.state.frames || [];
    const activeIdx = this._animFrameIdx !== null ? this._animFrameIdx : (this.state.activeFrameIdx || 0);

    listEl.innerHTML = frames.map((f, i) => `
      <button type="button" class="pizarra-frame-pill ${i === activeIdx ? 'active' : ''}" data-frame-idx="${i}" aria-pressed="${i === activeIdx}">
        ${f.label || `Paso ${i + 1}`}
      </button>
    `).join('');

    listEl.querySelectorAll('[data-frame-idx]').forEach(btn => {
      btn.addEventListener('click', () => this.selectFrame(Number(btn.dataset.frameIdx)));
    });
  }

  renderSelectionBar() {
    const bar = document.getElementById('pizarra-selection-bar');
    if (!bar) return;
    this.ensureState();
    const tok = this._selectedTokenId ? this.state.tokens.find(t => t.id === this._selectedTokenId) : null;
    const shape = this._selectedShapeIdx >= 0 ? this.state.shapes[this._selectedShapeIdx] : null;

    if (!tok && !shape) {
      bar.classList.add('hidden');
      bar.innerHTML = '';
      return;
    }

    bar.classList.remove('hidden');

    if (tok) {
      if (tok.team === 'ball') {
        bar.innerHTML = `
          <span class="pizarra-bar-label font-fifa flex items-center gap-1"><i data-lucide="circle-dot" class="w-3.5 h-3.5 text-amber-400"></i> BALÓN SELECCIONADO</span>
          <span class="pizarra-sel-hint">Arrástralo libremente por toda la pista.</span>
        `;
        this.app?.refreshIcons();
        return;
      }
      bar.innerHTML = `
        <span class="pizarra-bar-label font-fifa flex items-center gap-1"><i data-lucide="user-cog" class="w-3.5 h-3.5 text-amber-400"></i> FICHA:</span>
        <label class="pizarra-sel-field"><span>Dorsal</span><input id="pz-sel-tok-num" type="text" maxlength="4" value="${escapeXml(tok.label)}" class="pizarra-inline-input w-14 text-center"></label>
        <label class="pizarra-sel-field"><span>Nombre</span><input id="pz-sel-tok-sub" type="text" maxlength="10" value="${escapeXml(tok.subLabel)}" class="pizarra-inline-input w-24"></label>
        ${tok.team === 'home' ? `
          <button type="button" id="btn-pz-toggle-flygk" class="pizarra-ctrl-btn ${tok.flyGK ? 'active' : ''}" title="Activar camiseta/peto de Portero-Jugador (5v4)">
            <i data-lucide="shield-plus" class="w-3.5 h-3.5"></i>
            <span>PORTERO-JUG (PJ)</span>
          </button>
        ` : ''}
        <button type="button" id="btn-pz-del-tok" class="pizarra-ctrl-btn" title="Quitar ficha de la pista">
          <i data-lucide="user-minus" class="w-3.5 h-3.5"></i>
          <span>QUITAR</span>
        </button>
      `;

      document.getElementById('pz-sel-tok-num')?.addEventListener('input', (e) => {
        tok.label = String(e.target.value || '').toUpperCase().slice(0, 4);
        this.saveState();
        this.renderBoardSvg();
      });
      document.getElementById('pz-sel-tok-sub')?.addEventListener('input', (e) => {
        tok.subLabel = String(e.target.value || '').toUpperCase().slice(0, 10);
        this.saveState();
        this.renderBoardSvg();
      });
      document.getElementById('btn-pz-toggle-flygk')?.addEventListener('click', () => {
        this.pushUndo();
        tok.flyGK = !tok.flyGK;
        this.saveState();
        this.renderBoardSvg();
        this.renderSelectionBar();
      });
      document.getElementById('btn-pz-del-tok')?.addEventListener('click', () => this.removeSelectedToken());
      this.app?.refreshIcons();
      return;
    }

    const typeLabels = {
      pass: 'PASE', curve: 'CURVA', dribble: 'CONDUCCIÓN', run: 'DESMARQUE',
      screen: 'BLOQUEO', shot: 'TIRO', zone: 'ZONA', free: 'TRAZO', text: 'TEXTO', cone: 'CONO'
    };
    const isLinear = LINEAR_TOOL_TYPES.has(shape.type);
    bar.innerHTML = `
      <span class="pizarra-bar-label font-fifa flex items-center gap-1"><i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-amber-400"></i> ${typeLabels[shape.type] || 'TRAZO'}:</span>
      ${shape.type === 'text' ? `<input id="pz-sel-shape-text" type="text" maxlength="26" value="${escapeXml(shape.text || '')}" class="pizarra-inline-input w-40">` : ''}
      <div class="pizarra-palette">
        ${COLOR_SWATCHES.slice(0, 6).map(hex => `<button type="button" class="pizarra-color-swatch ${getShapeColor(shape) === hex ? 'active' : ''}" data-sel-color="${hex}" style="--sw:${hex}" aria-label="Cambiar color"></button>`).join('')}
      </div>
      ${isLinear ? `
        <button type="button" id="btn-pz-shape-dash" class="pizarra-ctrl-btn ${shape.dashed ? 'active' : ''}">DISCONTINUO</button>
        ${hasCustomCurve(shape) ? `<button type="button" id="btn-pz-shape-straight" class="pizarra-ctrl-btn">ENDEREZAR</button>` : ''}
      ` : ''}
      <button type="button" id="btn-pz-del-shape" class="pizarra-ctrl-btn" title="Eliminar elemento seleccionado">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        <span>ELIMINAR</span>
      </button>
    `;

    document.getElementById('pz-sel-shape-text')?.addEventListener('input', (e) => {
      shape.text = String(e.target.value || '').toUpperCase().slice(0, 26);
      this.saveState();
      this.renderBoardSvg();
    });
    bar.querySelectorAll('[data-sel-color]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.pushUndo();
        shape.color = btn.dataset.selColor;
        this.saveState();
        this.renderBoardSvg();
        this.renderSelectionBar();
      });
    });
    document.getElementById('btn-pz-shape-dash')?.addEventListener('click', () => {
      this.pushUndo();
      shape.dashed = !shape.dashed;
      this.saveState();
      this.renderBoardSvg();
      this.renderSelectionBar();
    });
    document.getElementById('btn-pz-shape-straight')?.addEventListener('click', () => {
      this.pushUndo();
      delete shape.cx;
      delete shape.cy;
      if (shape.type === 'curve') shape.type = 'pass';
      this.saveState();
      this.renderBoardSvg();
      this.renderSelectionBar();
    });
    document.getElementById('btn-pz-del-shape')?.addEventListener('click', () => this.deleteSelectedShape());
    this.app?.refreshIcons();
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
        <strong class="pizarra-spec-val font-fifa">${escapeXml(r.val)}</strong>
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
        <button type="button" class="pizarra-roster-chip ${isStarter ? 'is-starter' : 'is-sub'} ${selected ? 'is-selected' : ''}" data-roster-player="${p.id}" title="${escapeXml(p.name)} (${p.rolesHierarchy?.best || 'PIV'})">
          <span class="pizarra-roster-num">#${p.number || 10}</span>
          <span class="pizarra-roster-name">${escapeXml((p.nickname || p.name?.split(' ')[0] || 'JUG').toUpperCase().slice(0, 10))}</span>
          <span class="pizarra-roster-role">${isStarter ? (tok?.role || p.rolesHierarchy?.best || 'FS') : 'SUP'}</span>
        </button>
      `;
    };

    host.innerHTML = [...starting.map(p => chipFor(p, true)), ...subs.map(p => chipFor(p, false))].join('');

    host.querySelectorAll('.pizarra-roster-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.dataset.rosterPlayer;
        const matchTok = this.state.tokens.find(t => t.playerId === pid);
        if (matchTok) {
          this._selectedTokenId = matchTok.id;
          this._selectedShapeIdx = -1;
          this.renderRosterStrip();
          this.renderBoardSvg();
          this.renderSelectionBar();
          return;
        }
        // Bench player clicked while a home token is selected -> assign straight into that board token!
        const selectedTok = this.state.tokens.find(t => t.id === this._selectedTokenId && t.team === 'home');
        const player = store.getPlayerById(pid);
        if (selectedTok && player) {
          this.pushUndo();
          selectedTok.playerId = player.id;
          selectedTok.label = String(player.number ?? selectedTok.label);
          selectedTok.subLabel = (player.nickname || player.name?.split(' ')[0] || selectedTok.role).toUpperCase().slice(0, 9);
          this.saveState();
          this.render();
          this.app?.showToast(`${selectedTok.subLabel} colocado en pista`, 'shirt');
        } else {
          this.app?.inspectPlayer(pid);
        }
      });
    });
  }

  renderFieldMarkingsSvg() {
    const zone = this.state.zoneView || 'full';
    const theme = this.state.courtTheme || 'blue';
    const palette = theme === 'wood'
      ? { outer: '#3b2313', floor: '#c98b4b', bandA: 'rgba(255,244,225,0.06)', bandB: 'rgba(105,54,15,0.07)', line: 'rgba(255,255,255,0.92)', areaFill: 'rgba(255,255,255,0.08)', label: 'rgba(255,255,255,0.82)', lane: 'rgba(59,35,19,0.28)' }
      : (theme === 'dark'
        ? { outer: '#070a10', floor: '#111827', bandA: 'rgba(255,255,255,0.015)', bandB: 'rgba(0,0,0,0.16)', line: 'rgba(226,232,240,0.78)', areaFill: 'rgba(56,189,248,0.05)', label: 'rgba(148,163,184,0.8)', lane: 'rgba(148,163,184,0.18)' }
        : { outer: '#0d294a', floor: '#15477f', bandA: 'rgba(255,255,255,0.025)', bandB: 'rgba(0,0,0,0.035)', line: 'rgba(255,255,255,0.92)', areaFill: 'rgba(255,255,255,0.06)', label: 'rgba(255,255,255,0.68)', lane: 'rgba(255,255,255,0.16)' });

    const courtSurround = `<rect x="0" y="0" width="1000" height="620" fill="${palette.outer}" />`;
    const courtFloor = `<rect x="40" y="32" width="920" height="556" rx="4" fill="${palette.floor}" />`;
    const courtBands = Array.from({ length: 8 }, (_, i) => {
      const bandW = 920 / 8;
      return `<rect x="${40 + i * bandW}" y="32" width="${bandW}" height="556" fill="${i % 2 === 0 ? palette.bandA : palette.bandB}" />`;
    }).join('');
    const stripes = `${courtSurround}${courtFloor}${courtBands}`;

    let lanesSvg = '';
    if (this.state.showLanes) {
      const laneYs = [132, 232, 388, 488];
      lanesSvg = laneYs.map(y =>
        `<line x1="42" y1="${y}" x2="958" y2="${y}" stroke="${palette.lane}" stroke-width="1.5" stroke-dasharray="9,9" />`
      ).join('') + `
        <text x="500" y="82" text-anchor="middle" fill="${palette.label}" opacity="0.34" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">ALA / BANDA IZQUIERDA</text>
        <text x="500" y="314" text-anchor="middle" fill="${palette.label}" opacity="0.32" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">PASILLO CENTRAL (CIERRE / PÍVOT)</text>
        <text x="500" y="548" text-anchor="middle" fill="${palette.label}" opacity="0.34" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="13" letter-spacing="2">ALA / BANDA DERECHA · ZONA CAMBIOS 5M</text>
      `;
    }

    let lines = '';
    if (zone === 'attack') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="${palette.line}" stroke-width="3" />
        <path d="M 40,210 A 100,100 0 0,1 40,410" fill="none" stroke="${palette.line}" stroke-width="3" />
        <path d="M 960,126 L 910,126 A 126,126 0 0,0 784,252 L 784,368 A 126,126 0 0,0 910,494 L 960,494" fill="${palette.areaFill}" stroke="${palette.line}" stroke-width="3" />
        <circle cx="838" cy="310" r="5" fill="#ffffff" />
        <circle cx="690" cy="310" r="5" fill="#facc15" />
        <text x="690" y="332" text-anchor="middle" fill="rgba(250,204,21,0.9)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="12">10M</text>
        <path d="M 960,54 A 22,22 0 0,0 938,32" fill="none" stroke="${palette.line}" stroke-width="2.5" />
        <path d="M 938,588 A 22,22 0 0,0 960,566" fill="none" stroke="${palette.line}" stroke-width="2.5" />
        <rect x="960" y="254" width="18" height="112" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="64" y="64" fill="${palette.label}" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="21" letter-spacing="2">ZONA DE FINALIZACIÓN RIVAL (FÚTBOL SALA · 6M)</text>
      `;
    } else if (zone === 'buildup') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="${palette.line}" stroke-width="3" />
        <path d="M 960,210 A 100,100 0 0,0 960,410" fill="none" stroke="${palette.line}" stroke-width="3" />
        <path d="M 40,126 L 90,126 A 126,126 0 0,1 216,252 L 216,368 A 126,126 0 0,1 90,494 L 40,494" fill="${palette.areaFill}" stroke="${palette.line}" stroke-width="3" />
        <circle cx="162" cy="310" r="5" fill="#ffffff" />
        <circle cx="310" cy="310" r="5" fill="#facc15" />
        <text x="310" y="332" text-anchor="middle" fill="rgba(250,204,21,0.9)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="12">10M</text>
        <path d="M 40,54 A 22,22 0 0,0 62,32" fill="none" stroke="${palette.line}" stroke-width="2.5" />
        <path d="M 62,588 A 22,22 0 0,0 40,566" fill="none" stroke="${palette.line}" stroke-width="2.5" />
        <rect x="22" y="254" width="18" height="112" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="640" y="64" fill="${palette.label}" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="21" letter-spacing="2">SALIDA DE PISTA PROPIA (FÚTBOL SALA)</text>
      `;
    } else {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="${palette.line}" stroke-width="3" />
        <line x1="500" y1="32" x2="500" y2="588" stroke="${palette.line}" stroke-width="3" />
        <circle cx="500" cy="310" r="76" fill="none" stroke="${palette.line}" stroke-width="3" />
        <circle cx="500" cy="310" r="5" fill="#ffffff" />
        <path d="M 40,148 L 62,148 A 104,104 0 0,1 166,252 L 166,368 A 104,104 0 0,1 62,472 L 40,472" fill="${palette.areaFill}" stroke="${palette.line}" stroke-width="3" />
        <circle cx="132" cy="310" r="4.5" fill="#ffffff" />
        <circle cx="222" cy="310" r="4" fill="#facc15" />
        <path d="M 960,148 L 938,148 A 104,104 0 0,0 834,252 L 834,368 A 104,104 0 0,0 938,472 L 960,472" fill="${palette.areaFill}" stroke="${palette.line}" stroke-width="3" />
        <circle cx="868" cy="310" r="4.5" fill="#ffffff" />
        <circle cx="778" cy="310" r="4" fill="#facc15" />
        <line x1="385" y1="578" x2="385" y2="598" stroke="${palette.line}" stroke-width="2.5" />
        <line x1="472" y1="578" x2="472" y2="598" stroke="${palette.line}" stroke-width="2.5" />
        <line x1="528" y1="578" x2="528" y2="598" stroke="${palette.line}" stroke-width="2.5" />
        <line x1="615" y1="578" x2="615" y2="598" stroke="${palette.line}" stroke-width="2.5" />
        <rect x="22" y="262" width="18" height="96" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <rect x="960" y="262" width="18" height="96" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <path d="M 40,50 A 18,18 0 0,0 58,32" fill="none" stroke="${palette.line}" stroke-width="2" />
        <path d="M 58,588 A 18,18 0 0,0 40,570" fill="none" stroke="${palette.line}" stroke-width="2" />
        <path d="M 960,50 A 18,18 0 0,1 942,32" fill="none" stroke="${palette.line}" stroke-width="2" />
        <path d="M 942,588 A 18,18 0 0,1 960,570" fill="none" stroke="${palette.line}" stroke-width="2" />
        <text x="58" y="60" fill="${palette.label}" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">NUESTRA PORTERÍA · 6M</text>
        <text x="745" y="60" fill="${palette.label}" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">ATAQUE HACIA RIVAL · 40×20M</text>
      `;
    }

    return `${stripes}${lanesSvg}${lines}`;
  }

  renderGhostTrailsSvg() {
    if (this._animPreview || this.state.showGhostTrails === false || this.state.activeFrameIdx <= 0) return '';
    const prevFrame = this.state.frames[this.state.activeFrameIdx - 1];
    const currFrame = this.state.frames[this.state.activeFrameIdx];
    if (!prevFrame || !currFrame) return '';
    const prevMap = new Map(prevFrame.tokens.map(t => [t.id, t]));
    return currFrame.tokens.map(tok => {
      if (!this.state.showRivals && tok.team === 'away') return '';
      const p = prevMap.get(tok.id);
      if (!p || Math.hypot(tok.x - p.x, tok.y - p.y) < 1.5) return '';
      const x1 = p.x * 10;
      const y1 = p.y * 6.2;
      const x2 = tok.x * 10;
      const y2 = tok.y * 6.2;
      const col = tok.team === 'away' ? 'rgba(251,113,133,0.45)' : (tok.team === 'ball' ? 'rgba(255,255,255,0.6)' : 'rgba(250,204,21,0.52)');
      return `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2.5" stroke-dasharray="5,5" />
        <circle cx="${x1}" cy="${y1}" r="7" fill="none" stroke="${col}" stroke-width="2" />
      `;
    }).join('');
  }

  renderShapeSvg(shape, seqNum = null, isPlayingActive = false, isSelected = false, shapeIdx = -1) {
    const color = getShapeColor(shape);
    const sw = shape.bold ? 6.5 : 4.5;
    const wrap = (inner) => `<g class="pizarra-shape" data-shape-type="${escapeXml(shape.type || 'shape')}" data-shape-index="${shapeIdx}">${inner}</g>`;

    if (shape.type === 'free' && Array.isArray(shape.points)) {
      const pts = shape.points.map(p => `${p.x * 10},${p.y * 6.2}`).join(' ');
      return wrap(`<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${isSelected ? 1 : 0.92}" />`);
    }

    const x1 = shape.x1 * 10;
    const y1 = shape.y1 * 6.2;
    const x2 = shape.x2 * 10;
    const y2 = shape.y2 * 6.2;

    if (shape.type === 'text') {
      const txt = escapeXml(shape.text || 'NOTA');
      const w = Math.max(70, (shape.text || 'NOTA').length * 11 + 22);
      return wrap(`
        <g style="cursor: move;">
          <rect x="${x1 - w / 2}" y="${y1 - 16}" width="${w}" height="32" rx="6" fill="rgba(9, 13, 22, 0.9)" stroke="${isSelected ? '#ffffff' : color}" stroke-width="${isSelected ? 3 : 2}" />
          <text x="${x1}" y="${y1 + 5}" text-anchor="middle" fill="${color}" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="16" letter-spacing="0.8">${txt}</text>
        </g>
      `);
    }

    if (shape.type === 'cone') {
      return wrap(`
        <g style="cursor: move;">
          <circle cx="${x1}" cy="${y1}" r="22" fill="transparent" />
          <ellipse cx="${x1}" cy="${y1 + 9}" rx="14" ry="5" fill="rgba(0,0,0,0.42)" />
          <polygon points="${x1},${y1 - 14} ${x1 + 11},${y1 + 9} ${x1 - 11},${y1 + 9}" fill="${color}" stroke="${isSelected ? '#ffffff' : '#0f172a'}" stroke-width="${isSelected ? 2.8 : 2}" />
          <line x1="${x1 - 5}" y1="${y1}" x2="${x1 + 5}" y2="${y1}" stroke="#ffffff" stroke-width="2.5" />
        </g>
      `);
    }

    if (shape.type === 'zone') {
      const rx = Math.min(x1, x2);
      const ry = Math.min(y1, y2);
      const rw = Math.max(24, Math.abs(x2 - x1));
      const rh = Math.max(24, Math.abs(y2 - y1));
      const handles = isSelected ? `
        <circle data-handle-type="p1" cx="${x1}" cy="${y1}" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" style="cursor: nwse-resize;" />
        <circle data-handle-type="p2" cx="${x2}" cy="${y2}" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" style="cursor: nwse-resize;" />
      ` : '';
      return wrap(`<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="12" fill="${color}33" stroke="${isSelected ? '#ffffff' : color}" stroke-width="${isSelected ? 3.5 : 3}" stroke-dasharray="10,6" />${handles}`);
    }

    const markerUrl = `url(#${markerIdForColor(color)})`;
    const isDashed = shape.dashed ?? (shape.type === 'run' || shape.type === 'curve');
    const dashAttr = isDashed ? (shape.type === 'curve' ? 'stroke-dasharray="5,5"' : 'stroke-dasharray="11,8"') : '';
    const glow = (isPlayingActive || isSelected) ? `stroke="#ffffff" stroke-width="${sw + 4}" opacity="0.48"` : '';

    let pathEl = '';
    let badgePt = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
    const ctrlPct = defaultCurveControl(shape);
    const cx = ctrlPct.x * 10;
    const cy = ctrlPct.y * 6.2;

    if (shape.type === 'screen') {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const px = (-dy / len) * 14;
      const py = (dx / len) * 14;
      pathEl = `
        ${glow ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${glow} stroke-linecap="round" />` : ''}
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${dashAttr} />
        <line x1="${x2 - px}" y1="${y2 - py}" x2="${x2 + px}" y2="${y2 + py}" stroke="${color}" stroke-width="${sw + 1.5}" stroke-linecap="round" />
      `;
    } else if (shape.type === 'dribble') {
      const waveD = computeWavePath(x1, y1, x2, y2);
      pathEl = `
        ${glow ? `<path d="${waveD}" fill="none" ${glow} stroke-linecap="round" />` : ''}
        <path d="${waveD}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" marker-end="${markerUrl}" />
      `;
    } else if (hasCustomCurve(shape)) {
      pathEl = `
        ${glow ? `<path d="M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}" fill="none" ${glow} stroke-linecap="round" />` : ''}
        <path d="M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${dashAttr} marker-end="${markerUrl}" />
      `;
      badgePt = quadBezierPoint({ x: x1, y: y1 }, { x: cx, y: cy }, { x: x2, y: y2 }, 0.5);
    } else {
      pathEl = `
        ${glow ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${glow} stroke-linecap="round" />` : ''}
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${dashAttr} marker-end="${markerUrl}" />
      `;
    }

    const badgeSvg = seqNum && this.state.showStepNumbers !== false
      ? `<g class="pizarra-seq-badge">
           <circle cx="${badgePt.x}" cy="${badgePt.y}" r="11" fill="#0f172a" stroke="${color}" stroke-width="2" />
           <text x="${badgePt.x}" y="${badgePt.y + 4}" text-anchor="middle" fill="#ffffff" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="13">${seqNum}</text>
         </g>`
      : '';

    const handles = isSelected ? `
      <circle data-handle-type="p1" cx="${x1}" cy="${y1}" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" style="cursor: move;" />
      <circle data-handle-type="p2" cx="${x2}" cy="${y2}" r="8" fill="#ffffff" stroke="#0f172a" stroke-width="2.5" style="cursor: move;" />
      ${shape.type !== 'dribble' && shape.type !== 'screen' ? `<circle data-handle-type="cp" cx="${hasCustomCurve(shape) ? cx : (x1 + x2) / 2}" cy="${hasCustomCurve(shape) ? cy : (y1 + y2) / 2}" r="7.5" fill="#facc15" stroke="#0f172a" stroke-width="2" style="cursor: grab;" />` : ''}
    ` : '';

    return wrap(`${pathEl}${badgeSvg}${handles}`);
  }

  renderBoardSvg() {
    this.ensureState();
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;
    svg.dataset.courtTheme = this.state.courtTheme || 'blue';

    const defs = `
      <defs>
        ${COLOR_SWATCHES.map(hex => `
          <marker id="${markerIdForColor(hex)}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="${hex}" />
          </marker>
        `).join('')}
      </defs>
    `;

    const allShapes = this._draftShape
      ? [...this.state.shapes, this._draftShape]
      : this.state.shapes;
    let stepCounter = 0;
    const shapesSvg = allShapes.map((s, idx) => {
      const isArrow = LINEAR_TOOL_TYPES.has(s.type);
      const seq = isArrow ? ++stepCounter : null;
      return this.renderShapeSvg(s, seq, idx === this._activeStepIdx, idx === this._selectedShapeIdx && this.state.activeTool === 'move', idx);
    }).join('');

    const displayFrame = this._animFrameIdx !== null && this.state.frames[this._animFrameIdx]
      ? this.state.frames[this._animFrameIdx]
      : this.state.frames[this.state.activeFrameIdx];
    const visibleTokens = (displayFrame?.tokens || this.state.tokens).filter(t => this.state.showRivals || t.team !== 'away');

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
      const fill = isHome ? (t.flyGK ? '#f97316' : (t.role === 'POR' ? '#38bdf8' : '#f0be2a')) : '#e11d48';
      const stroke = isSel ? '#ffffff' : (isHome ? '#0f172a' : '#ffffff');
      const textFill = '#0f172a';
      return `
        <g data-token-id="${t.id}" class="pizarra-token ${isSel ? 'is-selected' : ''}" style="cursor: grab;">
          <circle cx="${cx}" cy="${cy}" r="34" fill="transparent" />
          ${isSel ? `<circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="5,4" />` : ''}
          <circle cx="${cx}" cy="${cy + 3}" r="22" fill="rgba(0,0,0,0.42)" />
          <circle cx="${cx}" cy="${cy}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isSel ? 3.5 : 2.8}" />
          <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${isHome ? textFill : '#ffffff'}" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="19">${escapeXml(t.label)}</text>
          <rect x="${cx - 34}" y="${cy + 24}" width="68" height="17" rx="3" fill="rgba(7,9,14,0.9)" />
          <text x="${cx}" y="${cy + 36}" text-anchor="middle" fill="${t.flyGK ? '#fdba74' : '#ffffff'}" font-family="Outfit, sans-serif" font-weight="800" font-size="11">${escapeXml(t.flyGK ? `PJ · ${t.subLabel}` : t.subLabel)}</text>
        </g>
      `;
    }).join('');

    svg.innerHTML = `${defs}${this.renderFieldMarkingsSvg()}${this.renderGhostTrailsSvg()}${shapesSvg}${tokensSvg}`;
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
      const activePlay = (this.state.customPlays || []).find(p => p.id === this.state.activePlayId);
      const slug = activePlay ? activePlay.name.replace(/[^a-z0-9]+/gi, '_') : (this.state.activePresetId || 'libre');
      a.download = `Pizarra_Futsal_${slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      this.app?.showToast('Imagen PNG de la pizarra descargada', 'download');
    };
    img.src = url;
  }
}

export const tacticalBoard = new TacticalBoardController();
