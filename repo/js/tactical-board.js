/**
 * Pizarra Táctica Interactiva y Plan de Partido
 * Permite mover jugadores/rivales/balón, dibujar pases/desmarques/zonas y redactar
 * las instrucciones clave de cómo funciona el partido (Fútbol 7 y Fútbol Sala).
 */
import { store } from './store.js';

const BOARD_STORAGE_KEY = 'futinfo_tactical_board_v1';

const DEFAULT_FORMATION_SLOTS = {
  f7: [
    { role: 'POR', top: 86, left: 50 },
    { role: 'DFC', top: 66, left: 28 },
    { role: 'DFC', top: 66, left: 72 },
    { role: 'MC', top: 46, left: 50 },
    { role: 'EI', top: 32, left: 18 },
    { role: 'ED', top: 32, left: 82 },
    { role: 'DC', top: 18, left: 50 }
  ],
  futsal: [
    { role: 'POR', top: 86, left: 50 },
    { role: 'CIE', top: 64, left: 50 },
    { role: 'AI', top: 44, left: 20 },
    { role: 'AD', top: 44, left: 80 },
    { role: 'PIV', top: 22, left: 50 }
  ]
};

export const TACTICAL_PRESETS = {
  salida: {
    id: 'salida',
    label: 'Salida Limpia',
    shortDesc: 'Centrales abiertos + apoyo interior + amplitud en bandas',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Portero con balón en los pies esperando salto del punta rival. Centrales abren a las esquinas del área; laterales ganan altura para fijar a los extremos contrarios.',
      attack: 'Si tapan al mediocentro, balón al costado para lateral libre y apoyo de cara al interior. Buscar el 2 contra 1 por banda antes de centrar atrás.',
      defense: 'Si se pierde el balón en salida, el jugador más cercano acosa 3 segundos mientras el resto cierra el carril central hacia nuestra portería.',
      setPieces: 'En saque de puerta, dos opciones claras: corta al central libre o envío tenso al pecho del delantero con caída del MCO a segunda jugada.',
      rotations: 'Bloques de rotación cada 8-10 minutos manteniendo siempre un cierre/central fresco atrás para sostener la salida de balón.'
    },
    shapes: [
      { type: 'pass', x1: 11, y1: 50, x2: 24, y2: 22 },
      { type: 'pass', x1: 26, y1: 22, x2: 49, y2: 33 },
      { type: 'run', x1: 31, y1: 82, x2: 56, y2: 84 },
      { type: 'pass', x1: 50, y1: 34, x2: 60, y2: 80 },
      { type: 'run', x1: 72, y1: 50, x2: 84, y2: 36 },
      { type: 'zone', x1: 42, y1: 14, x2: 64, y2: 38 }
    ]
  },
  presion: {
    id: 'presion',
    label: 'Presión Tras Pérdida',
    shortDesc: 'Acoso inmediato 3s tras perder el balón y cierre interior',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Tras robo arriba, primer pase siempre hacia delante o a la banda contraria para aprovechar la descolocación rival.',
      attack: 'Atacar el área rápido en 3-4 pases máximo: el punta fija a los centrales y los mediocentros llegan al punto de penalti.',
      defense: 'Nada más perderla: los 2 jugadores más cercanos cierran líneas de pase interior en 3 segundos. Obligar al rival a jugar hacia la banda y saltar con el lateral.',
      setPieces: 'En faltas laterales en campo rival, dejar dos vigilancias atentas al jugador más rápido contrario.',
      rotations: 'La presión alta desgasta rápido: avisar al banquillo al minuto 7 de tramo si baja la intensidad para meter piernas frescas arriba.'
    },
    shapes: [
      { type: 'shot', x1: 72, y1: 48, x2: 85, y2: 24 },
      { type: 'shot', x1: 62, y1: 34, x2: 75, y2: 38 },
      { type: 'run', x1: 60, y1: 68, x2: 72, y2: 52 },
      { type: 'zone', x1: 74, y1: 10, x2: 96, y2: 45 }
    ]
  },
  contra: {
    id: 'contra',
    label: 'Bloque y Contra',
    shortDesc: 'Dos líneas juntas en campo propio y transición vertical al espacio',
    zoneView: 'full',
    showRivals: true,
    notes: {
      buildUp: 'Paciencia en bloque medio-bajo dejando que el rival mueva horizontalmente; prohibido saltar solo y romper la línea.',
      attack: 'En cuanto robamos: primer pase al apoyo del mediocentro o directo al espacio de banda aprovechando la velocidad del punta.',
      defense: 'Distancia máxima de 10-12 metros entre defensa y mediocentros. Tapar siempre el pasillo central entre centrales.',
      setPieces: 'Dejar siempre 1 jugador rápido descolgado cerca de medio campo cuando defendemos córner para amenazar la transición.',
      rotations: 'Priorizar extremos frescos en la segunda mitad para castigar los espacios a la espalda rival cuando suban a empatar.'
    },
    shapes: [
      { type: 'zone', x1: 22, y1: 20, x2: 46, y2: 80 },
      { type: 'pass', x1: 36, y1: 48, x2: 54, y2: 30 },
      { type: 'pass', x1: 55, y1: 30, x2: 82, y2: 26 },
      { type: 'run', x1: 66, y1: 46, x2: 86, y2: 30 },
      { type: 'run', x1: 58, y1: 68, x2: 80, y2: 64 }
    ]
  },
  corner_fav: {
    id: 'corner_fav',
    label: 'Córner / ABP',
    shortDesc: 'Arrastre primer palo, remate al segundo y vigilancia en la frontal',
    zoneView: 'attack',
    showRivals: true,
    notes: {
      buildUp: 'Preparar jugada señalada por el lanzador antes de moverse: brazo arriba = al primer palo; dos brazos = abierta al segundo palo/frontal.',
      attack: 'Un jugador ataca el primer palo para arrastrar marcas; dos atacan punto penalti / segundo palo; uno espera en la frontal para el rechazo limpio.',
      defense: 'Dos cierres atrás en vigilancia 2 vs 1 en línea de medio campo. Si el córner va largo o es rechazado, el de la frontal corta cualquier contra.',
      setPieces: 'Bloqueos limpios sin falta para liberar al mejor cabeceador. Si rival cierra el centro, opción de córner en corto para buscar centro tenso.',
      rotations: 'Mantener siempre en el campo al especialista designado en Córners / Faltas en momentos decisivos.'
    },
    shapes: [
      { type: 'pass', x1: 95, y1: 93, x2: 82, y2: 44 },
      { type: 'run', x1: 68, y1: 36, x2: 83, y2: 42 },
      { type: 'run', x1: 66, y1: 56, x2: 83, y2: 60 },
      { type: 'run', x1: 52, y1: 50, x2: 66, y2: 50 },
      { type: 'zone', x1: 77, y1: 36, x2: 91, y2: 64 }
    ]
  },
  defensa_abp: {
    id: 'defensa_abp',
    label: 'Defensa ABP',
    shortDesc: 'Cobertura mixta: hombre en primer palo + marcas en zona + rechace',
    zoneView: 'buildup',
    showRivals: true,
    notes: {
      buildUp: 'Cuando el portero atrape el balón, abrir rápido a ambas bandas antes de que el rival repliegue.',
      attack: 'Un punta queda arriba en línea media fijando a sus cierres para obligarles a dejar dos atrás y ofrecer salida larga.',
      defense: 'Defensa mixta: 1 jugador protege el primer palo sin moverse hasta que salga el balón, 2-3 marcan en zona el área pequeña/penalti y 1 cubre la frontal para evitar voleas.',
      setPieces: 'Concentración total hasta el segundo despeje: prohibido desconectarse tras el primer rechace. Salir todos juntos en bloque tras despejar.',
      rotations: 'Evitar hacer rotaciones justo antes de defender un córner o falta peligrosa rival.'
    },
    shapes: [
      { type: 'zone', x1: 10, y1: 34, x2: 24, y2: 66 },
      { type: 'shot', x1: 28, y1: 50, x2: 36, y2: 48 },
      { type: 'pass', x1: 12, y1: 50, x2: 46, y2: 24 },
      { type: 'run', x1: 42, y1: 26, x2: 68, y2: 22 }
    ]
  }
};

function defaultHorizontalFormation(modality, zoneView = 'full', team = 'home', getFormationFn = null) {
  const conf = typeof getFormationFn === 'function' ? getFormationFn(modality) : null;
  const count = modality === 'futsal' ? 5 : 7;
  const players = store.getStartingLineup();
  const baseSlots = (conf?.slots?.length ? conf.slots : (DEFAULT_FORMATION_SLOTS[modality] || DEFAULT_FORMATION_SLOTS.f7)).slice(0, count);

  // Mapear vertical top/left de pizarra [top 15..88] a campo horizontal (nuestro campo a la izq x=8, ataque dcha x=92)
  return baseSlots.map((slot, idx) => {
    const p = team === 'home' ? players[idx] : null;
    // Vertical coordinate in formation (top 85 = POR -> near left goal in horizontal pitch)
    const depth = (100 - slot.top) / 100; // POR ~0.15, DC ~0.80
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
      const fallbackNick = slot.role;
      return {
        id: `home_${idx}`,
        team: 'home',
        label: p ? String(p.number ?? idx + 1) : String(idx + 1),
        subLabel: p ? (p.nickname || p.name?.split(' ')[0] || slot.role).toUpperCase().slice(0, 9) : fallbackNick,
        role: slot.role,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      };
    }

    // Rival espejo en campo derecho
    const rivalDepth = depth;
    x = zoneView === 'attack'
      ? (slot.role === 'POR' ? 94 : Math.max(54, 93 - rivalDepth * 38))
      : (zoneView === 'buildup'
        ? (slot.role === 'POR' ? 88 : Math.max(28, 72 - rivalDepth * 52))
        : (slot.role === 'POR' ? 91 : 86 - rivalDepth * 44));
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

function buildPresetTokens(presetId, modality, getFormationFn = null) {
  const preset = TACTICAL_PRESETS[presetId] || TACTICAL_PRESETS.salida;
  const zoneView = preset.zoneView || 'full';
  const home = defaultHorizontalFormation(modality, zoneView, 'home', getFormationFn);
  const away = defaultHorizontalFormation(modality, zoneView, 'away', getFormationFn);

  if (presetId === 'salida') {
    if (home[0]) { home[0].x = 10; home[0].y = 50; }
    if (home[1]) { home[1].x = 24; home[1].y = 22; }
    if (home[2]) { home[2].x = 22; home[2].y = 74; }
    if (home[3]) { home[3].x = 34; home[3].y = 84; }
    if (home[4]) { home[4].x = 46; home[4].y = 35; }
    const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 12.5, y: 50 };
    return { tokens: [...home, ...away, ball], zoneView };
  }

  if (presetId === 'presion') {
    home.forEach((t, i) => {
      if (i > 0) t.x = Math.min(84, t.x + 18);
    });
    const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 84, y: 24 };
    return { tokens: [...home, ...away, ball], zoneView };
  }

  if (presetId === 'contra') {
    home.forEach((t, i) => {
      if (i > 0) t.x = Math.max(20, Math.min(52, t.x - 10));
    });
    const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 36, y: 48 };
    return { tokens: [...home, ...away, ball], zoneView };
  }

  if (presetId === 'corner_fav') {
    // Atacamos portería derecha en vista ataque
    const cornerSpots = [
      { x: 16, y: 50 },
      { x: 48, y: 38 },
      { x: 48, y: 62 },
      { x: 66, y: 35 },
      { x: 66, y: 58 },
      { x: 54, y: 50 },
      { x: 95, y: 94 }
    ];
    home.forEach((t, i) => {
      const sp = cornerSpots[i] || { x: 68, y: 48 };
      t.x = sp.x;
      t.y = sp.y;
    });
    const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 95, y: 93 };
    return { tokens: [...home, ...away, ball], zoneView };
  }

  if (presetId === 'defensa_abp') {
    const defSpots = [
      { x: 8, y: 50 },
      { x: 13, y: 39 },
      { x: 18, y: 47 },
      { x: 18, y: 58 },
      { x: 26, y: 50 },
      { x: 42, y: 26 },
      { x: 20, y: 69 }
    ];
    home.forEach((t, i) => {
      const sp = defSpots[i] || { x: 22, y: 50 };
      t.x = sp.x;
      t.y = sp.y;
    });
    const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 12, y: 92 };
    return { tokens: [...home, ...away, ball], zoneView };
  }

  const ball = { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
  return { tokens: [...home, ...away, ball], zoneView };
}

export class TacticalBoardController {
  constructor() {
    this.state = null;
    this.getFormationFn = null;
    this._drag = null;
    this._draftShape = null;
    this._initialized = false;
  }

  ensureState() {
    if (!this.state) {
      this.state = this.loadState();
    }
    return this.state;
  }

  loadState() {
    const mod = store.getSettings()?.modality || 'f7';
    try {
      const raw = localStorage.getItem(BOARD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tokens) && parsed.tokens.length > 0) {
          return {
            pitchMode: parsed.pitchMode || mod,
            zoneView: parsed.zoneView || 'full',
            activePresetId: parsed.activePresetId || 'salida',
            activeTool: parsed.activeTool || 'move',
            showRivals: parsed.showRivals !== false,
            tokens: parsed.tokens,
            shapes: Array.isArray(parsed.shapes) ? parsed.shapes : [],
            notes: { ...TACTICAL_PRESETS.salida.notes, ...(parsed.notes || {}) }
          };
        }
      }
    } catch {}
    return this.createFreshState('salida', mod);
  }

  createFreshState(presetId = 'salida', pitchMode = 'f7') {
    const preset = TACTICAL_PRESETS[presetId] || TACTICAL_PRESETS.salida;
    const { tokens, zoneView } = buildPresetTokens(presetId, pitchMode, this.getFormationFn);
    return {
      pitchMode,
      zoneView,
      activePresetId: presetId,
      activeTool: 'move',
      showRivals: preset.showRivals !== false,
      tokens,
      shapes: preset.shapes.map(s => ({ ...s })),
      notes: { ...preset.notes }
    };
  }

  saveState() {
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(this.ensureState()));
    } catch {}
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
    }
    this.render();
  }

  syncPlayersWithLineup(announce = false) {
    this.ensureState();
    const freshHome = defaultHorizontalFormation(this.state.pitchMode, this.state.zoneView, 'home', this.getFormationFn);
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
    if (announce && this.app) {
      this.app.showToast('Titulares actuales sincronizados en la pizarra', 'users');
    }
  }

  applyPreset(presetId) {
    this.ensureState();
    const preset = TACTICAL_PRESETS[presetId];
    if (!preset) return;
    const { tokens, zoneView } = buildPresetTokens(presetId, this.state.pitchMode, this.getFormationFn);
    this.state.activePresetId = presetId;
    this.state.zoneView = zoneView;
    this.state.showRivals = preset.showRivals !== false;
    this.state.tokens = tokens;
    this.state.shapes = preset.shapes.map(s => ({ ...s }));
    this.state.notes = { ...preset.notes };
    this.state.activeTool = 'move';
    this.saveState();
    this.render();
    if (this.app) this.app.showToast(`Pizarra cargada: ${preset.label}`, 'clipboard-list');
  }

  setModality(mod) {
    this.ensureState();
    if (mod !== 'f7' && mod !== 'futsal') return;
    this.state.pitchMode = mod;
    const { tokens } = buildPresetTokens(this.state.activePresetId || 'salida', mod, this.getFormationFn);
    this.state.tokens = tokens;
    this.saveState();
    this.render();
  }

  setZoneView(zoneView) {
    this.ensureState();
    this.state.zoneView = zoneView;
    const home = defaultHorizontalFormation(this.state.pitchMode, zoneView, 'home', this.getFormationFn);
    const away = defaultHorizontalFormation(this.state.pitchMode, zoneView, 'away', this.getFormationFn);
    const ball = this.state.tokens.find(t => t.team === 'ball') || { id: 'ball', team: 'ball', label: '', subLabel: 'BALÓN', x: 50, y: 50 };
    this.state.tokens = [...home, ...away, ball];
    this.saveState();
    this.render();
  }

  bindEvents() {
    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
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

    document.querySelectorAll('.pizarra-mod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setModality(btn.dataset.mod);
      });
    });

    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setZoneView(btn.dataset.zone);
      });
    });

    document.getElementById('btn-pizarra-toggle-rivals')?.addEventListener('click', () => {
      this.state.showRivals = !this.state.showRivals;
      this.saveState();
      this.renderToolbarState();
      this.renderBoardSvg();
    });

    document.getElementById('btn-pizarra-undo')?.addEventListener('click', () => {
      if (this.state.shapes.length > 0) {
        this.state.shapes.pop();
        this.saveState();
        this.renderBoardSvg();
      }
    });

    document.getElementById('btn-pizarra-clear-draw')?.addEventListener('click', () => {
      this.state.shapes = [];
      this.saveState();
      this.renderBoardSvg();
      if (this.app) this.app.showToast('Trazos de la pizarra borrados', 'eraser');
    });

    document.getElementById('btn-pizarra-sync-lineup')?.addEventListener('click', () => {
      const home = defaultHorizontalFormation(this.state.pitchMode, this.state.zoneView, 'home');
      const others = this.state.tokens.filter(t => t.team !== 'home');
      this.state.tokens = [...home, ...others];
      this.saveState();
      this.renderBoardSvg();
      this.renderSpecialistsBanner();
      if (this.app) this.app.showToast('Once titular cargado sobre la pizarra', 'users');
    });

    document.getElementById('btn-pizarra-reset')?.addEventListener('click', () => {
      this.applyPreset(this.state.activePresetId || 'salida');
    });

    document.getElementById('btn-pizarra-export-png')?.addEventListener('click', () => {
      this.exportBoardAsPng();
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
        this.state.notes[key] = e.target.value;
        this.saveState();
      });
    });

    this.bindSvgPointerEvents();
  }

  getSvgPercentPoint(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / Math.max(1, rect.width)) * 100));
    const y = Math.max(3, Math.min(97, ((clientY - rect.top) / Math.max(1, rect.height)) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }

  bindSvgPointerEvents() {
    const svg = document.getElementById('pizarra-board-svg');
    if (!svg) return;

    svg.addEventListener('pointerdown', (e) => {
      const tokenGroup = e.target.closest('[data-token-id]');
      const pt = this.getSvgPercentPoint(svg, e.clientX, e.clientY);

      if (tokenGroup && this.state.activeTool === 'move') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._drag = { tokenId: tokenGroup.dataset.tokenId };
        return;
      }

      if (this.state.activeTool !== 'move') {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._draftShape = { type: this.state.activeTool, x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
        this.renderBoardSvg();
      } else if (tokenGroup) {
        e.preventDefault();
        svg.setPointerCapture(e.pointerId);
        this._drag = { tokenId: tokenGroup.dataset.tokenId };
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
        this._draftShape.x2 = pt.x;
        this._draftShape.y2 = pt.y;
        this.renderBoardSvg();
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
        const dist = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
        if (dist >= 2.2) {
          this.state.shapes.push(d);
          this.saveState();
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
    this.renderBoardSvg();
    this.app?.refreshIcons();
  }

  renderToolbarState() {
    document.querySelectorAll('.pizarra-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === this.state.activeTool);
    });
    document.querySelectorAll('.pizarra-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === this.state.activePresetId);
    });
    document.querySelectorAll('.pizarra-mod-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mod === this.state.pitchMode);
    });
    document.querySelectorAll('.pizarra-zone-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.zone === this.state.zoneView);
    });
    const rivalBtn = document.getElementById('btn-pizarra-toggle-rivals');
    if (rivalBtn) {
      rivalBtn.classList.toggle('active', !!this.state.showRivals);
      const lbl = rivalBtn.querySelector('span');
      if (lbl) lbl.textContent = this.state.showRivals ? 'RIVALES: ON' : 'RIVALES: OFF';
    }
    const svg = document.getElementById('pizarra-board-svg');
    if (svg) {
      svg.style.cursor = this.state.activeTool === 'move' ? 'grab' : 'crosshair';
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

  renderFieldMarkingsSvg() {
    const isFutsal = this.state.pitchMode === 'futsal';
    const zone = this.state.zoneView || 'full';

    // Franjas de césped/pista (en viewBox 1000x620)
    const stripeCount = 10;
    const stripeW = 1000 / stripeCount;
    const stripes = Array.from({ length: stripeCount }, (_, i) => {
      const fill = isFutsal
        ? (i % 2 === 0 ? '#184b6e' : '#1b557c')
        : (i % 2 === 0 ? '#244714' : '#2d5719');
      return `<rect x="${i * stripeW}" y="0" width="${stripeW}" height="620" fill="${fill}" />`;
    }).join('');

    let lines = '';
    if (zone === 'attack') {
      // Medio campo atacante (portería rival en derecha x=960)
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
        <line x1="40" y1="32" x2="40" y2="588" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <path d="M 40,210 A 100,100 0 0,1 40,410" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
        ${isFutsal
          ? `<path d="M 960,180 A 150,150 0 0,0 960,440" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <circle cx="805" cy="310" r="4" fill="#ffffff" />`
          : `<rect x="740" y="130" width="220" height="360" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
             <rect x="880" y="218" width="80" height="184" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
             <circle cx="825" cy="310" r="4" fill="#ffffff" />
             <path d="M 740,235 A 95,95 0 0,0 740,385" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />`
        }
        <rect x="960" y="255" width="16" height="110" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="64" y="64" fill="rgba(255,255,255,0.55)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="22" letter-spacing="2">ZONA DE FINALIZACIÓN RIVAL</text>
      `;
    } else if (zone === 'buildup') {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
        <path d="M 960,210 A 100,100 0 0,0 960,410" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
        ${isFutsal
          ? `<path d="M 40,180 A 150,150 0 0,1 40,440" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <circle cx="195" cy="310" r="4" fill="#ffffff" />`
          : `<rect x="40" y="130" width="220" height="360" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
             <rect x="40" y="218" width="80" height="184" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />
             <circle cx="175" cy="310" r="4" fill="#ffffff" />
             <path d="M 260,235 A 95,95 0 0,1 260,385" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="3" />`
        }
        <rect x="24" y="255" width="16" height="110" fill="rgba(255,255,255,0.22)" stroke="#ffffff" stroke-width="3" />
        <text x="720" y="64" fill="rgba(255,255,255,0.55)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="22" letter-spacing="2">SALIDA DE BALÓN PROPIA</text>
      `;
    } else {
      lines = `
        <rect x="40" y="32" width="920" height="556" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <line x1="500" y1="32" x2="500" y2="588" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <circle cx="500" cy="310" r="78" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <circle cx="500" cy="310" r="5" fill="#ffffff" />
        ${isFutsal
          ? `<path d="M 40,175 A 135,135 0 0,1 40,445" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <path d="M 960,175 A 135,135 0 0,0 960,445" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <circle cx="170" cy="310" r="4" fill="#ffffff" />
             <circle cx="245" cy="310" r="4" fill="#ffffff" />
             <circle cx="830" cy="310" r="4" fill="#ffffff" />
             <circle cx="755" cy="310" r="4" fill="#ffffff" />`
          : `<rect x="40" y="155" width="150" height="310" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <rect x="40" y="230" width="58" height="160" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <path d="M 190,248 A 72,72 0 0,1 190,372" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <circle cx="145" cy="310" r="4" fill="#ffffff" />
             <rect x="810" y="155" width="150" height="310" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <rect x="902" y="230" width="58" height="160" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <path d="M 810,248 A 72,72 0 0,0 810,372" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
             <circle cx="855" cy="310" r="4" fill="#ffffff" />`
        }
        <rect x="24" y="262" width="16" height="96" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="3" />
        <rect x="960" y="262" width="16" height="96" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="3" />
        <text x="58" y="60" fill="rgba(255,255,255,0.52)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">NUESTRA PORTERÍA</text>
        <text x="768" y="60" fill="rgba(255,255,255,0.52)" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="18" letter-spacing="2">ATAQUE HACIA RIVAL</text>
      `;
    }

    return `${stripes}${lines}`;
  }

  renderShapeSvg(shape) {
    const x1 = shape.x1 * 10;
    const y1 = shape.y1 * 6.2;
    const x2 = shape.x2 * 10;
    const y2 = shape.y2 * 6.2;

    if (shape.type === 'zone') {
      const rx = Math.min(x1, x2);
      const ry = Math.min(y1, y2);
      const rw = Math.max(24, Math.abs(x2 - x1));
      const rh = Math.max(24, Math.abs(y2 - y1));
      return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="12" fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" stroke-width="3" stroke-dasharray="10,6" />`;
    }

    const styles = {
      pass: { color: '#facc15', dash: '', marker: 'url(#pz-arrow-gold)' },
      run: { color: '#34d399', dash: 'stroke-dasharray="11,8"', marker: 'url(#pz-arrow-green)' },
      shot: { color: '#fb7185', dash: '', marker: 'url(#pz-arrow-red)' }
    };
    const st = styles[shape.type] || styles.pass;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${st.color}" stroke-width="4.5" stroke-linecap="round" ${st.dash} marker-end="${st.marker}" />`;
  }

  renderBoardSvg() {
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
    const shapesSvg = allShapes.map(s => this.renderShapeSvg(s)).join('');

    const visibleTokens = this.state.tokens.filter(t => this.state.showRivals || t.team !== 'away');
    const tokensSvg = visibleTokens.map(t => {
      const cx = t.x * 10;
      const cy = t.y * 6.2;
      if (t.team === 'ball') {
        return `
          <g data-token-id="${t.id}" class="pizarra-token" style="cursor: grab;">
            <circle cx="${cx}" cy="${cy}" r="16" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
            <polygon points="${cx},${cy - 8} ${cx + 7},${cy - 2} ${cx + 4},${cy + 7} ${cx - 4},${cy + 7} ${cx - 7},${cy - 2}" fill="#0f172a" />
          </g>
        `;
      }

      const isHome = t.team === 'home';
      const fill = isHome ? '#f0be2a' : '#e11d48';
      const stroke = isHome ? '#0f172a' : '#ffffff';
      const textFill = isHome ? '#0f172a' : '#ffffff';
      return `
        <g data-token-id="${t.id}" class="pizarra-token" style="cursor: grab;">
          <circle cx="${cx}" cy="${cy + 3}" r="22" fill="rgba(0,0,0,0.38)" />
          <circle cx="${cx}" cy="${cy}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="3" />
          <text x="${cx}" y="${cy + 6}" text-anchor="middle" fill="${textFill}" font-family="Barlow Condensed, sans-serif" font-weight="900" font-size="19">${t.label}</text>
          <rect x="${cx - 32}" y="${cy + 24}" width="64" height="17" rx="3" fill="rgba(7,9,14,0.88)" />
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
      a.download = `Pizarra_${this.state.activePresetId || 'tactica'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      if (this.app) this.app.showToast('Imagen de la pizarra descargada', 'download');
    };
    img.src = url;
  }
}

export const tacticalBoard = new TacticalBoardController();
