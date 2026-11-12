/**
 * Controlador Principal - FIFA Ultimate Team (FUT) Torneo del Rector
 * Con Google Sign-In, Gestión de Partidos y Suite del Entrenador 100% Usable
 */
import { store, FACULTIES } from './store.js';
import { authService } from './auth.js';
import { futAudio } from './audio.js';
import { 
  initFirebaseServices, 
  saveFirebaseConfig, 
  getActiveConfig 
} from './firebase-config.js';

export const STATS_TEST_CONFIG = [
  {
    key: 'pac',
    name: 'Ritmo (PAC)',
    short: 'PAC',
    icon: 'zap',
    tagClass: 'bg-sky-100 text-sky-800 border-sky-300',
    title: 'Ritmo y Aceleración',
    question: '¿Cómo calificarías tu velocidad punta y aceleración al sprint?',
    defaultValue: 82,
    tiers: [
      { min: 90, label: 'Élite Mundial (90+)', emoji: '⚡', desc: 'Velocidad sobrehumana. Superas a cualquier rival en carrera larga al contraataque.' },
      { min: 80, label: 'Muy Rápido (80-89)', emoji: '🚀', desc: 'Gran zancada. Ganas la mayoría de balones divididos y repliegas al instante.' },
      { min: 70, label: 'Competitivo (70-79)', emoji: '🏃', desc: 'Buen ritmo de carrera. Repliegas a tiempo y aguantas transiciones rápidas.' },
      { min: 55, label: 'Nivel Medio (55-69)', emoji: '👟', desc: 'Ritmo estándar de pachanga. Cumples en carreras cortas, pero te cuesta en sprints largos.' },
      { min: 40, label: 'Básico / Lento (~50)', emoji: '🐢', desc: 'Carrera pausada. Prefieres recibir al pie antes que desgastarte corriendo al hueco.' }
    ]
  },
  {
    key: 'sho',
    name: 'Tiro (SHO)',
    short: 'SHO',
    icon: 'crosshair',
    tagClass: 'bg-rose-100 text-rose-800 border-rose-300',
    title: 'Tiro y Definición',
    question: '¿Cómo es tu puntería, potencia y efectividad de cara a puerta?',
    defaultValue: 80,
    tiers: [
      { min: 90, label: 'Goleador Letal (90+)', emoji: '🎯', desc: 'Francotirador clínico. Ocasión que tienes, balón que enchufas a la escuadra.' },
      { min: 80, label: 'Gran Definidor (80-89)', emoji: '💥', desc: 'Gran pegada. Disparo potente y colocado; alto porcentaje de gol ante el portero.' },
      { min: 70, label: 'Buen Disparo (70-79)', emoji: '⚽', desc: 'Buen golpeo a puerta. Sabes colocarla si te dejan espacio para armar la pierna.' },
      { min: 55, label: 'Disparo Ocasional (55-69)', emoji: '🥅', desc: 'Puntería media. Intentas asegurar a puerta vacía; desde lejos suele irse desviada.' },
      { min: 40, label: 'Básico / Sin Gol (~50)', emoji: '🛡️', desc: 'Poco disparo. Prefieres buscar el pase o asistir antes que rematar a portería.' }
    ]
  },
  {
    key: 'pas',
    name: 'Pase (PAS)',
    short: 'PAS',
    icon: 'compass',
    tagClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    title: 'Pase y Visión de Juego',
    question: '¿Qué tal distribuyes el balón y conectas pases con tus compañeros?',
    defaultValue: 80,
    tiers: [
      { min: 90, label: 'Visión Total (90+)', emoji: '🧠', desc: 'Director de orquesta. Pases quirúrgicos al hueco y cambios de juego teledirigidos.' },
      { min: 80, label: 'Gran Organizador (80-89)', emoji: '📐', desc: 'Gran visión. Metes balones con peligro, marcas el ritmo y casi no fallas en corto.' },
      { min: 70, label: 'Pase Seguro (70-79)', emoji: '👟', desc: 'Pase limpio y seguro. Buen criterio asociativo en corto y apoyos continuos.' },
      { min: 55, label: 'Pase Elemental (55-69)', emoji: '🔄', desc: 'Aseguras en corto; pases largos o con oposición conllevan alto riesgo de pérdida.' },
      { min: 40, label: 'Básico (~50)', emoji: '⚠️', desc: 'Dificultad distributiva. Cuesta conectar bajo presión rival o filtrar al espacio.' }
    ]
  },
  {
    key: 'dri',
    name: 'Regate (DRI)',
    short: 'DRI',
    icon: 'sparkles',
    tagClass: 'bg-purple-100 text-purple-800 border-purple-300',
    title: 'Regate y Habilidad Técnica',
    question: '¿Cómo manejas el balón en espacios reducidos y el uno contra uno?',
    defaultValue: 82,
    tiers: [
      { min: 90, label: 'Mago del Balón (90+)', emoji: '🪄', desc: 'Balón pegado a la bota. Cambios de ritmo letales, agilidad pura y regates de fantasía.' },
      { min: 80, label: 'Muy Técnico (80-89)', emoji: '💫', desc: 'Muy desequilibrante. Te vas con facilidad en el uno contra uno y sales de la presión.' },
      { min: 70, label: 'Buen Control (70-79)', emoji: '✨', desc: 'Buen control orientado. Conduces cómodo con ambos pies y proteges bien la pelota.' },
      { min: 55, label: 'Regate Justo (55-69)', emoji: '👌', desc: 'Conducción funcional. Regates básicos en línea recta sin complicarte la vida.' },
      { min: 40, label: 'Básico (~50)', emoji: '🧱', desc: 'El balón se te escapa si intentas quiebros; prefieres soltarla rápido al primer toque.' }
    ]
  },
  {
    key: 'def',
    name: 'Defensa (DEF)',
    short: 'DEF',
    icon: 'shield',
    tagClass: 'bg-amber-100 text-amber-800 border-amber-300',
    title: 'Defensa e Intercepción',
    question: '¿Cómo defiendes en el 1 vs 1, cortes de balón y posicionamiento táctico?',
    defaultValue: 60,
    tiers: [
      { min: 90, label: 'Muralla Infranqueable (90+)', emoji: '🛡️', desc: 'Lectura defensiva perfecta. Robas limpio sin hacer falta y ganas cualquier duelo.' },
      { min: 80, label: 'Gran Defensor (80-89)', emoji: '🧱', desc: 'Cierre de garantías. Muy difícil de superar, anticipas cortes y despejas el peligro.' },
      { min: 70, label: 'Defensa Sólida (70-79)', emoji: '🔒', desc: 'Posicionamiento correcto. Metes pierna con criterio y ayudas al repliegue del equipo.' },
      { min: 55, label: 'Defensa de Empuje (55-69)', emoji: '⚔️', desc: 'Presionas por insistencia y ayudas, aunque a veces muerdes a destiempo en falso.' },
      { min: 40, label: 'Básico (~50)', emoji: '⚠️', desc: 'Poca vocación defensiva. Cuesta temporizar o meter el cuerpo en divididos.' }
    ]
  },
  {
    key: 'phy',
    name: 'Físico (PHY)',
    short: 'PHY',
    icon: 'activity',
    tagClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    title: 'Físico y Resistencia',
    question: '¿Cómo vas de fondo físico para aguantar minutos y choque cuerpo a cuerpo?',
    defaultValue: 78,
    tiers: [
      { min: 90, label: 'Portento Inagotable (90+)', emoji: '🦾', desc: 'Pulmones de acero. Presión continua sin cansancio y ganador de todo choque físico.' },
      { min: 80, label: 'Gran Fondo Físico (80-89)', emoji: '💪', desc: 'Gran aguante físico a ritmo alto todo el partido y firmeza corporal en disputas.' },
      { min: 70, label: 'Buena Capacidad (70-79)', emoji: '🏃‍♂️', desc: 'Aguantas el partido con soltura física y sabes regular tus esfuerzos en carrera.' },
      { min: 55, label: 'Físico Estándar (55-69)', emoji: '⏱️', desc: 'Cumples bien el primer tiempo, pero en los minutos finales notas el bajón.' },
      { min: 40, label: 'Fondo Justo (~50)', emoji: '🪫', desc: 'Tras varios piques necesitas aire urgentemente y pedir la rotación al banquillo.' }
    ]
  }
];

export const TACTICAL_FORMATIONS = {
  f7: {
    '1-3-2-1': {
      id: '1-3-2-1',
      name: '1-3-2-1 (Árbol de Navidad)',
      short: '1-3-2-1',
      styleTag: 'Equilibrado / Control Central',
      desc: 'Línea de 3 atrás muy sólida con 2 mediocentros de apoyo y un ariete en punta.',
      advice: 'Ideal si tienes dos mediocentros de calidad que sepan combinar y distribuir rápido. Protege los costados con laterales de largo recorrido.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'LI', top: 64, left: 22 },
        { role: 'DFC', top: 68, left: 50 },
        { role: 'LD', top: 64, left: 78 },
        { role: 'MC', top: 43, left: 36 },
        { role: 'MC', top: 43, left: 64 },
        { role: 'DC', top: 20, left: 50 }
      ]
    },
    '1-2-3-1': {
      id: '1-2-3-1',
      name: '1-2-3-1 (Amplitud y Extremos)',
      short: '1-2-3-1',
      styleTag: 'Ofensivo / Desborde por Bandas',
      desc: '2 centrales puros, 3 centrocampistas abiertos (extremos) y 1 punta de referencia.',
      advice: 'Desborda por las bandas con extremos rápidos (EI/ED). Los dos centrales deben ser veloces en el 1 vs 1 ante contras rivales.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'DFC', top: 68, left: 33 },
        { role: 'DFC', top: 68, left: 67 },
        { role: 'EI', top: 45, left: 18 },
        { role: 'MC', top: 43, left: 50 },
        { role: 'ED', top: 45, left: 82 },
        { role: 'DC', top: 20, left: 50 }
      ]
    },
    '1-3-1-2': {
      id: '1-3-1-2',
      name: '1-3-1-2 (Doble Punta Letal)',
      short: '1-3-1-2',
      styleTag: 'Ataque Directo / Presión Alta',
      desc: '3 defensas, 1 mediapunta organizador y 2 delanteros centro sincronizados.',
      advice: 'Perfecta si tienes dos delanteros definidores (DC). El MCO debe tener gran visión para filtrar balones entre centrales rivales.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'LI', top: 66, left: 22 },
        { role: 'DFC', top: 70, left: 50 },
        { role: 'LD', top: 66, left: 78 },
        { role: 'MCO', top: 45, left: 50 },
        { role: 'DC', top: 20, left: 35 },
        { role: 'DC', top: 20, left: 65 }
      ]
    },
    '1-2-2-2': {
      id: '1-2-2-2',
      name: '1-2-2-2 (Cuadrado Mágico / Box)',
      short: '1-2-2-2',
      styleTag: 'Transición Rápida y Presión',
      desc: '2 defensas de cierre, 2 mediocentros dinámicos y 2 puntas en constante presión.',
      advice: 'Favorece el juego vertical e intercepciones en mitad de campo. Requiere mucha intensidad de los 2 MC para bascular y no partirse.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'DFC', top: 70, left: 35 },
        { role: 'DFC', top: 70, left: 65 },
        { role: 'MC', top: 46, left: 33 },
        { role: 'MC', top: 46, left: 67 },
        { role: 'DC', top: 21, left: 35 },
        { role: 'DC', top: 21, left: 65 }
      ]
    },
    '1-3-3-0': {
      id: '1-3-3-0',
      name: '1-3-3-0 (Falso 9 / Tiqui-Taca)',
      short: '1-3-3-0',
      styleTag: 'Posesión y Sobrecarga Central',
      desc: '3 defensores con 3 mediocentros combinativos que llegan desde segunda línea sin ariete estático.',
      advice: 'Desespera al rival con posesión continua. Los mediocentros deben incorporarse por sorpresa para rematar desde la frontal.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'LI', top: 66, left: 22 },
        { role: 'DFC', top: 70, left: 50 },
        { role: 'LD', top: 66, left: 78 },
        { role: 'MC', top: 40, left: 24 },
        { role: 'MCO', top: 32, left: 50 },
        { role: 'MC', top: 40, left: 76 }
      ]
    },
    '1-4-1-1': {
      id: '1-4-1-1',
      name: '1-4-1-1 (Cerrojo Defensivo / Contra)',
      short: '1-4-1-1',
      styleTag: 'Bloque Bajo y Contragolpe',
      desc: 'Línea de 4 defensores para asegurar el resultado, 1 pivote defensivo y 1 delantero rápido.',
      advice: 'Ideal ante rivales con delantera temible o para aguantar marcadores. Mantén el bloque bajo y busca el balón largo a la contra.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'LI', top: 68, left: 16 },
        { role: 'DFC', top: 72, left: 38 },
        { role: 'DFC', top: 72, left: 62 },
        { role: 'LD', top: 68, left: 84 },
        { role: 'MC', top: 45, left: 50 },
        { role: 'DC', top: 20, left: 50 }
      ]
    },
    '1-1-4-1': {
      id: '1-1-4-1',
      name: '1-1-4-1 (Ultra Ofensiva / Asedio)',
      short: '1-1-4-1',
      styleTag: 'Presión Total / Remontada',
      desc: '1 solo defensa central, 4 centrocampistas volcados en ataque y 1 delantero centro.',
      advice: 'Úsala para remontar en los minutos finales. Asedio constante en campo rival, pero ten cuidado con las pérdidas a la contra.',
      slots: [
        { role: 'POR', top: 85, left: 50 },
        { role: 'DFC', top: 72, left: 50 },
        { role: 'LI', top: 44, left: 18 },
        { role: 'MC', top: 42, left: 39 },
        { role: 'MC', top: 42, left: 61 },
        { role: 'LD', top: 44, left: 82 },
        { role: 'DC', top: 20, left: 50 }
      ]
    }
  },
  futsal: {
    '1-1-2-1': {
      id: '1-1-2-1',
      name: '1-1-2-1 (Rombo Clásico Futsal)',
      short: '1-1-2-1',
      styleTag: 'Equilibrado / Geometría Pura',
      desc: '1 Cierre atrás, 2 Alas en las bandas y 1 Pívot de espaldas al marco contrario.',
      advice: 'La formación por excelencia del fútbol sala. El pívot aguanta la posesión de espaldas y descarga hacia las incorporaciones de las alas.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'CIE', top: 66, left: 50 },
        { role: 'ALI', top: 44, left: 24 },
        { role: 'ALD', top: 44, left: 76 },
        { role: 'PIV', top: 20, left: 50 }
      ]
    },
    '1-2-2': {
      id: '1-2-2',
      name: '1-2-2 (Cuadrado / Doble Pareja)',
      short: '1-2-2',
      styleTag: 'Defensivo / Espacios Reducidos',
      desc: '2 cierres/defensas y 2 delanteros/pívots formando dos líneas paralelas.',
      advice: 'Gran solidez en defensa zonal 2x2. En ataque busca paredes rápidas entre parejas o paralelas buscando la espalda del cierre.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'CIE', top: 66, left: 32 },
        { role: 'CIE', top: 66, left: 68 },
        { role: 'PIV', top: 26, left: 32 },
        { role: 'PIV', top: 26, left: 68 }
      ]
    },
    '1-3-0': {
      id: '1-3-0',
      name: '1-3-0 (Línea de Tres / Posesión)',
      short: '1-3-0',
      styleTag: 'Control y Rotaciones',
      desc: '3 jugadores por detrás de la línea de pase creando superioridad y 1 mediapunta flotante.',
      advice: 'Arrastra a los defensores rivales fuera de su zona mediante rotaciones continuas de pase y corte al espacio generado.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'ALI', top: 56, left: 22 },
        { role: 'CIE', top: 64, left: 50 },
        { role: 'ALD', top: 56, left: 78 },
        { role: 'MC', top: 28, left: 50 }
      ]
    },
    '1-4-0': {
      id: '1-4-0',
      name: '1-4-0 (Cuatro en Línea / Rotación Total)',
      short: '1-4-0',
      styleTag: 'Técnico y Dinámico',
      desc: '4 jugadores de campo en línea media para atraer la presión rival y romper al hueco.',
      advice: 'Exige máxima movilidad y desmarques de ruptura. Atrae al rival arriba para generar un pasillo directo en mano a mano.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'CIE', top: 52, left: 16 },
        { role: 'MC', top: 48, left: 38 },
        { role: 'MC', top: 48, left: 62 },
        { role: 'CIE', top: 52, left: 84 }
      ]
    },
    '1-2-1-1': {
      id: '1-2-1-1',
      name: '1-2-1-1 (Y Invertida / Presión)',
      short: '1-2-1-1',
      styleTag: 'Presión Alta / Balón Robado',
      desc: '2 cierres, 1 mediocentro conector y 1 pívot en constante presión.',
      advice: 'Ahoga la salida de balón rival orientando hacia su pierna débil. Roba en tres cuartos de campo para definir en 1 o 2 toques.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'CIE', top: 68, left: 30 },
        { role: 'CIE', top: 68, left: 70 },
        { role: 'MC', top: 42, left: 50 },
        { role: 'PIV', top: 18, left: 50 }
      ]
    },
    '1-1-1-2': {
      id: '1-1-1-2',
      name: '1-1-1-2 (Embudo Ofensivo / Doble Pívot)',
      short: '1-1-1-2',
      styleTag: 'Ataque Directo / Remate Inmediato',
      desc: '1 Cierre atrás, 1 distribuidor y 2 pívots fijando a la defensa contraria en su propia área.',
      advice: 'Ideal si el rival se encierra en su área. Los dos pívots generan bloqueos continuos y segundas jugadas de rebote.',
      slots: [
        { role: 'POR', top: 86, left: 50 },
        { role: 'CIE', top: 68, left: 50 },
        { role: 'MC', top: 45, left: 50 },
        { role: 'PIV', top: 22, left: 32 },
        { role: 'PIV', top: 22, left: 68 }
      ]
    }
  }
};

export function getFormationConfig(modality = 'f7', formationId) {
  const modCatalog = TACTICAL_FORMATIONS[modality] || TACTICAL_FORMATIONS.f7;
  if (formationId && modCatalog[formationId]) {
    return modCatalog[formationId];
  }
  const defaultId = modality === 'f7' ? '1-3-2-1' : '1-1-2-1';
  return modCatalog[defaultId] || Object.values(modCatalog)[0];
}

class FutApp {
  constructor() {
    this.currentTab = 'pitch';
    this.selectedStarterIndex = null;
    this.activeRadialIndex = null;
    this.store = store;
    this.authService = authService;
    this.init();
  }

  async init() {
    // 0. Tema Claro / Oscuro
    this.initTheme();

    // 1. Inicializar Firebase
    const fb = await initFirebaseServices();
    this.updateFirebaseBadge(fb.isConnected);

    // 2. Auth listener
    authService.onAuthStateChanged((user) => {
      this.renderAuthBar(user);
      this.updateAdminVisibility();
      this.renderAll();
    });

    // 3. Store listener
    store.subscribe(() => {
      this.renderAll();
    });

    // 4. Configurar eventos
    this.bindEvents();
    this.initDragAndDrop();

    // Sprint 1: re-proyectar el césped 3D al cambiar entre móvil y escritorio
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.renderPitch(), 150);
    });

    // 5. Render inicial
    this.renderAll();
    this.refreshIcons();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('fut_theme') || 'dark';
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('btn-toggle-theme');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  toggleTheme() {
    const currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    futAudio.playSelect();
    this.showToast(`Modo ${newTheme === 'light' ? 'Claro' : 'Oscuro'} activado`, newTheme === 'light' ? 'sun' : 'moon');
  }

  setTheme(theme) {
    const isLight = theme === 'light';
    if (isLight) {
      document.body.classList.add('theme-light');
      document.documentElement.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.documentElement.classList.remove('theme-light');
    }
    localStorage.setItem('fut_theme', theme);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  showToast(message, icon = 'shield') {
    const container = document.getElementById('fut-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'fut-toast';
    const iconHtml = (typeof icon === 'string' && icon.startsWith('<'))
      ? icon
      : `<i data-lucide="${icon}" class="w-4 h-4 text-amber-400"></i>`;
    toast.innerHTML = `<span class="flex items-center justify-center">${iconHtml}</span><span>${message}</span>`;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px) scale(0.95)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  getCardClass(cardType) {
    switch (cardType) {
      case 'totw': return 'fut-card-totw';
      case 'toty':
      case 'special': return 'fut-card-toty';
      case 'tots': return 'fut-card-tots';
      case 'icon': return 'fut-card-icon';
      case 'gold':
      default: return 'fut-card-gold';
    }
  }

  getPlayStyleIcon(ps) {
    const map = {
      finesse: '🎯',
      power_shot: '💥',
      rapid: '⚡',
      incisive: '🪄',
      anticipate: '🛡️',
      acrobatic: '🧤',
      leader: '👑',
      trivela: '🌀'
    };
    return map[ps] || '⭐';
  }

  getPlayStyleLabel(ps) {
    const map = {
      finesse: 'Tiro Calidad',
      power_shot: 'Power Shot',
      rapid: 'Paso Rápido',
      incisive: 'Pase Incisivo',
      anticipate: 'Muralla DEF',
      acrobatic: 'Acrobático GK',
      leader: 'Capitán / Líder',
      trivela: 'Trivela'
    };
    return map[ps] || 'Estándar';
  }

  renderFutCard(player, options = {}) {
    if (!player) return '';
    const {
      size = 'pitch', // 'pitch', 'bench', 'album', 'walkout', 'inspect'
      role = null,
      extraClass = '',
      customStyle = ''
    } = options;

    const fac = FACULTIES.find(f => f.id === player.faculty) || FACULTIES[0];
    const cardClass = this.getCardClass(player.cardType);
    const displayRole = role || (player.rolesHierarchy ? player.rolesHierarchy.best : (player.roleBest || 'DC'));
    const displayName = (player.nickname || player.name.split(' ')[0] || 'CRACK').toUpperCase();
    const stats = player.stats || { pac: 80, sho: 80, pas: 80, dri: 80, def: 65, phy: 75 };
    const chemStyle = player.chemStyle || 'HUN';
    const playStyle = player.playStyle || 'finesse';
    const kitColor = player.kitColor || '#1d1810';
    const kitSecondary = player.kitSecondary || '#f0be2a';

    let sizeClass = 'fut-card-size-pitch';
    if (size === 'album') sizeClass = 'fut-card-size-album';
    else if (size === 'walkout') sizeClass = 'fut-card-size-walkout';
    else if (size === 'bench') sizeClass = 'fut-card-size-bench';
    else if (size === 'inspect') sizeClass = 'fut-card-size-inspect';

    return `
      <div class="fut-card ${cardClass} ${sizeClass} ${extraClass}" style="${customStyle}">
        <div class="fut-card-holo-layer"></div>

        <div class="fut-card-top">
          <div class="fut-card-badge-col">
            <span class="fut-card-rating font-fifa">${player.rating}</span>
            <span class="fut-card-pos">${displayRole}</span>
            <div class="fut-card-col-divider"></div>
            <span class="fut-card-flag" title="${fac.name}">${fac.icon}</span>
            <span class="fut-card-club" title="Universidad">🛡️</span>
          </div>
          <div class="fut-card-kit-wrap">
            <div class="fut-card-kit-silhouette">
              <svg viewBox="0 0 80 95" fill="none" xmlns="http://www.w3.org/2000/svg" class="fut-card-kit-svg">
                <path d="M40 7 C33 7 28 12.5 28 19.5 C28 25.5 33 30.5 40 30.5 C47 30.5 52 25.5 52 19.5 C52 12.5 47 7 40 7 Z" fill="${kitSecondary}" opacity="0.88"/>
                <path d="M36 29 L44 29 L45 35 L35 35 Z" fill="${kitSecondary}" opacity="0.85"/>
                <path d="M14 42 L25 35 C29 38 34 39.5 40 39.5 C46 39.5 51 38 55 35 L66 42 L74 61 L62 65 L60 95 L20 95 L18 65 L6 61 Z" fill="${kitColor}" opacity="0.96"/>
                <path d="M33 36 L40 44 L47 36" stroke="${kitSecondary}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
              </svg>
              <span class="fut-card-dorsal font-fifa" style="color: ${kitColor === '#f8fafc' || kitColor === '#ffffff' ? '#111827' : '#ffffff'};">#${player.number || 10}</span>
            </div>
          </div>
        </div>

        <div class="fut-card-name-plate">
          <span>${displayName}</span>
        </div>

        <div class="fut-card-stats-grid">
          <div class="fut-card-stats-col">
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.pac}</span>
              <span class="stat-lbl">PAC</span>
            </div>
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.sho}</span>
              <span class="stat-lbl">SHO</span>
            </div>
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.pas}</span>
              <span class="stat-lbl">PAS</span>
            </div>
          </div>
          <div class="fut-card-stats-divider"></div>
          <div class="fut-card-stats-col">
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.dri}</span>
              <span class="stat-lbl">DRI</span>
            </div>
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.def}</span>
              <span class="stat-lbl">DEF</span>
            </div>
            <div class="fut-card-stat-row">
              <span class="stat-num font-fifa">${stats.phy}</span>
              <span class="stat-lbl">PHY</span>
            </div>
          </div>
        </div>

        <div class="fut-card-bottom-badge flex items-center gap-1">
          <span class="fut-chem-pill">${chemStyle}</span>
          <span class="text-[0.62em]" title="${this.getPlayStyleLabel(playStyle)}">${this.getPlayStyleIcon(playStyle)}</span>
        </div>
      </div>
    `;
  }

  updateFirebaseBadge(isConnected) {
    // Top-left header mantiene exclusivamente el nombre oficial del club FURIA RECTOR FC
  }

  // ==================== INSPECTOR DE JUGADOR ACTIVO (CAPTURA 1 COURTOIS & CAPTURA 5 ROBBEN) ====================
  updatePlayerInspector(player) {
    if (!player) {
      const starting = store.getStartingLineup();
      player = starting[0] || store.getPlayers()[0];
    }
    if (!player) return;

    const imgEl = document.getElementById('inspector-player-avatar');
    const dorsalEl = document.getElementById('inspector-player-dorsal');
    const posEl = document.getElementById('inspector-player-pos');
    const nameEl = document.getElementById('inspector-player-name');
    const ratingEl = document.getElementById('inspector-player-rating');
    const psEl = document.getElementById('inspector-player-playstyle');
    const chemEl = document.getElementById('inspector-player-chem');
    const starsEl = document.getElementById('inspector-player-stars');
    
    if (imgEl) imgEl.src = player.avatar;
    if (dorsalEl) dorsalEl.textContent = `#${player.number || 10}`;
    if (posEl) posEl.textContent = player.rolesHierarchy?.best || player.roleBest || 'DC';
    if (nameEl) nameEl.textContent = player.nickname || player.name;
    if (ratingEl) ratingEl.textContent = player.rating;

    const ps = player.playStyle || 'finesse';
    const chem = player.chemStyle || 'HUN';
    const sm = player.skillMoves || 4;
    const wf = player.weakFoot || 4;

    if (psEl) psEl.textContent = `${this.getPlayStyleIcon(ps)} ${this.getPlayStyleLabel(ps).toUpperCase()}`;
    if (chemEl) chemEl.textContent = `QUÍMICA: ${chem}`;
    if (starsEl) starsEl.textContent = `FIL: ${sm}★ | PIE: ${wf}★`;

    const stats = player.stats || { pac: 80, sho: 80, pas: 80, dri: 80, def: 65, phy: 75 };
    const pacEl = document.getElementById('stat-pac');
    const shoEl = document.getElementById('stat-sho');
    const pasEl = document.getElementById('stat-pas');
    const driEl = document.getElementById('stat-dri');
    const defEl = document.getElementById('stat-def');
    const phyEl = document.getElementById('stat-phy');

    if (pacEl) pacEl.textContent = stats.pac;
    if (shoEl) shoEl.textContent = stats.sho;
    if (pasEl) pasEl.textContent = stats.pas;
    if (driEl) driEl.textContent = stats.dri;
    if (defEl) defEl.textContent = stats.def;
    if (phyEl) phyEl.textContent = stats.phy;
  }

  toggleSquadActions() {
    this.openSquadActionsModal('tab-formations');
  }

  openSquadActionsModal(tab = 'tab-formations') {
    const dialog = document.getElementById('squad-actions-dialog');
    if (!dialog) return;

    const modBadge = document.getElementById('modal-active-modality-badge');
    const settings = store.getSettings();
    if (modBadge) {
      modBadge.textContent = settings.modality === 'f7' ? 'FUT 7 DRAFT' : 'FUTSAL 5v5';
    }

    this.renderFormationsVisualGrid();
    this.renderSquadsVisualGrid();
    this.populateFormationsSelect();

    if (tab) {
      const tabBtn = dialog.querySelector(`.fifa-modal-tab[data-tab="${tab}"]`);
      if (tabBtn) tabBtn.click();
    }

    if (!dialog.open) {
      dialog.showModal();
      futAudio.playFocus();
    }
  }

  initModalTabs() {
    const tabs = document.querySelectorAll('#squad-actions-dialog .fifa-modal-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetViewId = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('#squad-actions-dialog .fifa-modal-view').forEach(view => {
          if (view.id === targetViewId) {
            view.classList.remove('hidden');
          } else {
            view.classList.add('hidden');
          }
        });
        futAudio.playFocus();
      });
    });
  }

  renderFormationsVisualGrid() {
    const grid = document.getElementById('fifa-formations-grid');
    if (!grid) return;

    const settings = store.getSettings();
    const isF7 = settings.modality === 'f7';
    const list = Object.values(isF7 ? TACTICAL_FORMATIONS.f7 : TACTICAL_FORMATIONS.futsal);
    const current = store.getActiveFormation();

    grid.innerHTML = list.map(f => {
      const isActive = f.id === current;
      const dots = f.slots.map(s => `
        <span class="mini-pitch-dot" style="top: ${s.top}%; left: ${s.left}%;"></span>
      `).join('');

      const cleanName = f.name.includes('(') ? f.name.split('(')[1].replace(')', '') : f.name;

      return `
        <div class="fifa-formation-card ${isActive ? 'is-active' : ''}" data-formation-id="${f.id}">
          <div class="fifa-form-card-header">
            <span class="fifa-form-code font-fifa">${f.short}</span>
            <span class="fifa-form-badge">${f.styleTag.split('/')[0].trim()}</span>
          </div>
          <div class="fifa-form-name font-fifa">${cleanName}</div>
          <div class="fifa-form-mini-pitch">
            <div class="mini-pitch-box">
              <div class="mini-pitch-line"></div>
              <div class="mini-pitch-circle"></div>
              ${dots}
            </div>
          </div>
          <button type="button" class="fifa-form-btn ${isActive ? 'is-active-btn' : ''}">
            ${isActive ? '★ ESQUEMA ACTIVO' : '<span class="inline-flex items-center justify-center gap-1"><em class="ps-btn ps-x">✕</em> APLICAR</span>'}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.fifa-formation-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const formId = card.dataset.formationId;
        this.selectFormation(formId);
      });
    });
  }

  selectFormation(formId) {
    store.setFormation(formId);
    const sel = document.getElementById('select-active-formation');
    if (sel) sel.value = formId;

    this.renderPitch();
    this.updateTacticsAdviceCard(formId);
    this.renderFormationsVisualGrid();
    futAudio.playSuccess();
    this.showToast(`Formación cambiada a ${formId}`, 'shield');
  }

  renderSquadsVisualGrid() {
    const grid = document.getElementById('fifa-squads-grid');
    if (!grid) return;

    const squads = store.getSquads();
    const activeId = store.getActiveSquadId();

    grid.innerHTML = squads.map(s => {
      const isActive = s.id === activeId;
      const modLabel = s.modality === 'f7' ? 'FÚTBOL 7' : 'FÚTBOL SALA';
      const startersCount = s.startingLineup?.length || (s.modality === 'f7' ? 7 : 5);
      const benchCount = s.benchPlayers?.length || 0;

      return `
        <div class="fifa-squad-card ${isActive ? 'is-active' : ''}" data-squad-id="${s.id}">
          <div class="flex items-start justify-between">
            <div>
              <span class="fifa-squad-modality font-fifa">${modLabel}</span>
              <h3 class="fifa-squad-name font-fifa">${s.name}</h3>
            </div>
            <div class="fifa-squad-ovr font-fifa">${s.rating || 84} <small>OVR</small></div>
          </div>
          <div class="fifa-squad-meta-row">
            <span><i data-lucide="shield" class="w-3 h-3 inline text-amber-400"></i> Esquema: <b>${s.formation}</b></span>
            <span><i data-lucide="users" class="w-3 h-3 inline text-cyan-400"></i> ${startersCount} Titulares · ${benchCount} Suplentes</span>
          </div>
          <button type="button" class="fifa-squad-btn ${isActive ? 'is-active-btn' : ''}">
            ${isActive ? '★ PLANTILLA ACTIVA' : 'ACTIVAR PLANTILLA'}
          </button>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.fifa-squad-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const squadId = card.dataset.squadId;
        this.selectSquad(squadId);
      });
    });

    this.refreshIcons();
  }

  selectSquad(squadId) {
    const success = store.loadSquadPreset(squadId);
    if (!success) return;

    const currentSquad = store.getActiveSquad();
    this.updateModalityButtons(currentSquad.modality);
    this.populateFormationsSelect();
    this.renderPitch();
    this.renderSquadsVisualGrid();
    this.renderFormationsVisualGrid();
    futAudio.playSuccess();
    this.showToast(`¡Plantilla activa: ${currentSquad.name}!`, 'sparkles');
  }

  saveCurrentSquadPrompt() {
    const name = prompt('Nombre para la nueva plantilla guardada:', `Plantilla Furia ${Date.now().toString().slice(-4)}`);
    if (!name || !name.trim()) return;

    const squad = store.saveCurrentAsSquad(name.trim());
    this.renderSquadsVisualGrid();
    futAudio.playSuccess();
    this.showToast(`¡Nueva plantilla "${squad.name}" guardada y activada!`, 'sparkles');
  }

  cancelSelection() {
    this.selectedStarterIndex = null;
    this.closeRadialMenu(true);
    this.renderPitch();
    this.showToast('Selección cancelada', 'x');
  }

  triggerSwapActive() {
    if (this.selectedStarterIndex !== null) {
      this.openSubDrawer(this.selectedStarterIndex);
    } else {
      this.selectStarter(0);
    }
  }

  inspectSelectedOrCaptain() {
    const starting = store.getStartingLineup();
    const target = this.selectedStarterIndex !== null ? starting[this.selectedStarterIndex] : starting[0];
    if (target) {
      this.inspectPlayer(target.id);
    }
  }

  autoOptimizeSquad() {
    const settings = store.getSettings();
    const activeFormation = store.getActiveFormation();
    const formationConfig = getFormationConfig(settings.modality, activeFormation);
    const targetRoles = formationConfig.slots.map(s => s.role);
    const all = store.getPlayers();
    const pool = [...all];
    const newStarting = [];

    targetRoles.forEach(role => {
      // 1. Exact best match
      let idx = pool.findIndex(p => p.rolesHierarchy?.best === role || p.roleBest === role);
      // 2. Second best match
      if (idx === -1) {
        idx = pool.findIndex(p => p.rolesHierarchy?.second === role || p.roleSecond === role);
      }
      // 3. Fallback to highest rated available
      if (idx === -1) {
        idx = 0;
      }
      if (idx !== -1 && pool.length > 0) {
        newStarting.push(pool.splice(idx, 1)[0]);
      }
    });

    store.setStartingLineup(newStarting);
    document.getElementById('squad-actions-dialog')?.close();
    this.renderPitch();
    futAudio.playSuccess();
    this.showToast('¡Plantilla auto-alineada por posiciones oficiales!', 'sparkles');
  }

  resetSquadPositions() {
    store.resetStartingLineup();
    document.getElementById('squad-actions-dialog')?.close();
    this.renderPitch();
    this.showToast('Posiciones de plantilla restablecidas', 'rotate-ccw');
  }

  bindEvents() {
    this.initModalTabs();

    document.getElementById('hud-active-squad-head')?.addEventListener('click', () => {
      this.openSquadActionsModal('tab-formations');
    });

    document.getElementById('btn-open-squad-modal')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openSquadActionsModal('tab-formations');
    });

    document.getElementById('btn-squad-actions')?.addEventListener('click', () => {
      this.openSquadActionsModal('tab-formations');
    });

    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Selector de Modalidad Único (Fútbol 7 vs Fútbol Sala)
    const setModality = (mod) => {
      store.setModality(mod);
      this.updateModalityButtons(mod);
      this.populateFormationsSelect();
      this.renderPitch();
      this.showToast(`Cambiado a ${mod === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'}`, 'shield');
    };

    document.getElementById('btn-mode-f7')?.addEventListener('click', () => setModality('f7'));
    document.getElementById('btn-mode-futsal')?.addEventListener('click', () => setModality('futsal'));

    // Centro Táctico: Selector de Formación activa y Consejo dinámico
    const selectFormation = document.getElementById('select-active-formation');
    if (selectFormation) {
      selectFormation.addEventListener('change', (e) => {
        this.selectFormation(e.target.value);
      });
    }

    // Centro Táctico: Botones de Estilo Defensivo
    document.querySelectorAll('#tactics-defensive-styles .tactics-style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const style = btn.dataset.style;
        store.updateTactics({ defensiveStyle: style });
        this.updateTacticsControls();
        futAudio.playSelect();
        this.showToast(`Estilo defensivo: ${btn.querySelector('span')?.textContent || style}`, 'shield');
      });
    });

    // Centro Táctico: Profundidad Defensiva Slider
    const depthSlider = document.getElementById('tactics-depth-slider');
    if (depthSlider) {
      depthSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        store.updateTactics({ defensiveDepth: val });
        const depthVal = document.getElementById('tactics-depth-val');
        const depthLabel = document.getElementById('tactics-depth-label');
        if (depthVal) depthVal.textContent = val;
        if (depthLabel) {
          depthLabel.textContent = val <= 3 ? 'Bloque Bajo' : (val >= 8 ? 'Línea Muy Alta' : 'Bloque Medio');
        }
      });
    }

    // Centro Táctico: Anchura Defensiva Slider
    const widthSlider = document.getElementById('tactics-width-slider');
    if (widthSlider) {
      widthSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        store.updateTactics({ defensiveWidth: val });
        const widthVal = document.getElementById('tactics-width-val');
        const widthLabel = document.getElementById('tactics-width-label');
        if (widthVal) widthVal.textContent = val;
        if (widthLabel) {
          widthLabel.textContent = val <= 3 ? 'Estrecho' : (val >= 8 ? 'Muy Abierto' : 'Equilibrado');
        }
      });
    }

    // Centro Táctico: Salida de Balón
    const buildupSel = document.getElementById('tactics-buildup-select');
    if (buildupSel) {
      buildupSel.addEventListener('change', (e) => {
        store.updateTactics({ buildUpPlay: e.target.value });
        futAudio.playSelect();
        this.showToast('Construcción ofensiva actualizada', 'zap');
      });
    }

    // Centro Táctico: Creación de Oportunidades
    const chanceSel = document.getElementById('tactics-chance-select');
    if (chanceSel) {
      chanceSel.addEventListener('change', (e) => {
        store.updateTactics({ chanceCreation: e.target.value });
        futAudio.playSelect();
        this.showToast('Creación de oportunidades actualizada', 'zap');
      });
    }

    // Especialistas a balón parado
    ['captain', 'penalties', 'freekicks', 'corners'].forEach(role => {
      document.getElementById(`spec-${role}`)?.addEventListener('change', (e) => {
        store.setSpecialist(role, e.target.value);
        futAudio.playSuccess();
        this.showToast('Especialista actualizado', 'crown');
      });
    });

    // Control de Efectos de Sonido FUT
    const btnAudio = document.getElementById('btn-toggle-audio');
    if (btnAudio) {
      const updateAudioIcon = () => {
        const isMuted = futAudio.isMuted();
        btnAudio.innerHTML = isMuted 
          ? '<i data-lucide="volume-x" class="w-4 h-4 text-rose-400"></i>' 
          : '<i data-lucide="volume-2" class="w-4 h-4 text-amber-400"></i>';
        this.refreshIcons();
      };
      updateAudioIcon();

      btnAudio.addEventListener('click', () => {
        const muted = futAudio.toggleMute();
        updateAudioIcon();
        if (!muted) futAudio.playSuccess();
        this.showToast(muted ? 'Efectos de audio desactivados' : 'Efectos de audio FUT activados', muted ? 'volume-x' : 'volume-2');
      });
    }

    // Botón cerrar cajón de sustitución
    document.getElementById('btn-close-sub-drawer')?.addEventListener('click', () => {
      this.closeSubDrawer();
    });

    // Control de Teclado Consola / Keyboard-First (Patrón Linear & EA Sports FC)
    window.addEventListener('keydown', (e) => {
      const targetEl = e.target instanceof Element ? e.target : document.activeElement;
      const isInput = targetEl && typeof targetEl.matches === 'function' && targetEl.matches('input, textarea, select, [contenteditable="true"]');
      if (isInput) {
        if (e.key === 'Escape') {
          targetEl.blur();
        }
        return;
      }

      // 1. Tecla '/' para búsqueda rápida en el Álbum (Atajo Linear)
      if (e.key === '/') {
        e.preventDefault();
        this.switchTab('album');
        setTimeout(() => {
          document.getElementById('album-search-input')?.focus();
        }, 50);
        return;
      }

      // 2. Control L1 / R1 de pestañas de consola (Teclas Q y E)
      const tabs = ['pitch', 'album', 'partidos', 'ajustes'];
      const currentIdx = tabs.indexOf(this.currentTab || 'pitch');

      if (e.key === 'q' || e.key === 'Q' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + tabs.length) % tabs.length;
        this.switchTab(tabs[prevIdx]);
        return;
      }
      if (e.key === 'e' || e.key === 'E' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % tabs.length;
        this.switchTab(tabs[nextIdx]);
        return;
      }

      // 3. Menú Radial activo
      if (this.activeRadialIndex !== null) {
        const key = e.key.toLowerCase();
        if (key === 'x') {
          e.preventDefault();
          document.getElementById('btn-radial-sub')?.click();
          return;
        } else if (key === 'y') {
          e.preventDefault();
          document.getElementById('btn-radial-inspect')?.click();
          return;
        } else if (key === 'a') {
          e.preventDefault();
          document.getElementById('btn-radial-captain')?.click();
          return;
        } else if (key === 'b' || key === 'escape') {
          e.preventDefault();
          this.closeRadialMenu(true);
          return;
        }
      }

      // 4. Tecla Escape: Cerrar modales, radiales y cajones
      if (e.key === 'Escape') {
        this.closeSubDrawer();
        this.closeRadialMenu(true);
        document.querySelectorAll('dialog[open]').forEach(d => d.close());
        return;
      }

      // 5. Navegación Espacial en el Césped (Flechas de dirección estilo Joystick)
      if (!this.currentTab || this.currentTab === 'pitch') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigatePitchDirection('up');
          return;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigatePitchDirection('down');
          return;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigatePitchDirection('left');
          return;
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigatePitchDirection('right');
          return;
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const targetIndex = this.selectedStarterIndex !== null ? this.selectedStarterIndex : 0;
          this.selectStarter(targetIndex);
          return;
        }
      }

      // 6. Atajos Rápidos de Sistema
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.openSquadActionsModal('tab-formations');
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggleTheme();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        (document.getElementById('btn-toggle-audio') || document.getElementById('hud-btn-audio'))?.click();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const settings = store.getSettings();
        const nextMod = settings.modality === 'f7' ? 'futsal' : 'f7';
        setModality(nextMod);
      }
    });

    // Filtros del Álbum (Patrón Linear)
    const searchInput = document.getElementById('album-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.albumSearchQuery = e.target.value;
        this.renderAlbumCards();
      });
    }

    document.querySelectorAll('#album-role-filters .hud-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#album-role-filters .hud-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.albumRoleFilter = btn.dataset.role;
        futAudio.playNav();
        this.renderAlbumCards();
      });
    });

    const sortSelect = document.getElementById('album-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.albumSortBy = e.target.value;
        futAudio.playNav();
        this.renderAlbumCards();
      });
    }

    document.getElementById('btn-reset-album-filters')?.addEventListener('click', () => {
      this.albumSearchQuery = '';
      this.albumRoleFilter = 'all';
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('#album-role-filters .hud-filter-pill').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
      });
      futAudio.playNav();
      this.renderAlbumCards();
    });

    // Shader Holográfico & Tilt 3D Apple/Linear dinámico reactivo al cursor
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.fut-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty('--glare-x', `${x.toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${y.toFixed(1)}%`);
      card.style.setProperty('--tilt-x', `${(-dy * 10).toFixed(1)}deg`);
      card.style.setProperty('--tilt-y', `${(dx * 10).toFixed(1)}deg`);
    });

    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.fut-card');
      if (card && !card.contains(e.relatedTarget)) {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      }
    });

    // Modales setup
    this.setupModals();
    this.setupForms();
  }

  updateModalityButtons(mod) {
    const isF7 = mod === 'f7';
    const bF7 = document.getElementById('btn-mode-f7');
    const bFutsal = document.getElementById('btn-mode-futsal');
    const label = document.getElementById('current-modality-label');

    if (bF7 && bFutsal) {
      bF7.classList.toggle('active', isF7);
      bFutsal.classList.toggle('active', !isF7);
    }

    if (label) {
      label.textContent = isF7 ? 'Fútbol 7' : 'Fútbol Sala';
    }
  }

  populateFormationsSelect() {
    const sel = document.getElementById('select-active-formation');
    if (!sel) return;

    const settings = store.getSettings();
    const isF7 = settings.modality === 'f7';
    const list = Object.values(isF7 ? TACTICAL_FORMATIONS.f7 : TACTICAL_FORMATIONS.futsal);
    const current = store.getActiveFormation();

    sel.innerHTML = list.map(f => `
      <option value="${f.id}" ${f.id === current ? 'selected' : ''}>${f.name}</option>
    `).join('');

    this.updateTacticsAdviceCard(current);
    this.updateTacticsControls();
  }

  updateTacticsAdviceCard(formationId) {
    const settings = store.getSettings();
    const conf = getFormationConfig(settings.modality, formationId);
    if (!conf) return;

    const titleEl = document.getElementById('tactics-formation-name');
    const styleEl = document.getElementById('tactics-style-tag');
    const descEl = document.getElementById('tactics-formation-desc');
    const adviceEl = document.getElementById('tactics-advice-text');

    if (titleEl) titleEl.textContent = conf.name;
    if (styleEl) styleEl.textContent = conf.styleTag;
    if (descEl) descEl.textContent = conf.desc;
    if (adviceEl) adviceEl.textContent = conf.advice;
  }

  updateTacticsControls() {
    const tactics = store.getTactics();

    // 1. Estilo defensivo botones
    document.querySelectorAll('#tactics-defensive-styles .tactics-style-btn').forEach(btn => {
      const s = btn.dataset.style;
      if (s === tactics.defensiveStyle) {
        btn.classList.add('active');
        btn.classList.remove('border-slate-700', 'bg-slate-950', 'text-slate-300');
        btn.classList.add('border-amber-500', 'bg-amber-500/18', 'text-white');
      } else {
        btn.classList.remove('active', 'border-amber-500', 'bg-amber-500/18', 'text-white');
        btn.classList.add('border-slate-700', 'bg-slate-950', 'text-slate-300');
      }
    });

    // 2. Profundidad defensiva slider
    const depthSlider = document.getElementById('tactics-depth-slider');
    const depthVal = document.getElementById('tactics-depth-val');
    const depthLabel = document.getElementById('tactics-depth-label');
    if (depthSlider) {
      depthSlider.value = tactics.defensiveDepth || 6;
      if (depthVal) depthVal.textContent = tactics.defensiveDepth || 6;
      if (depthLabel) {
        const d = tactics.defensiveDepth || 6;
        depthLabel.textContent = d <= 3 ? 'Bloque Bajo' : (d >= 8 ? 'Línea Muy Alta' : 'Bloque Medio');
      }
    }

    // 3. Anchura defensiva slider
    const widthSlider = document.getElementById('tactics-width-slider');
    const widthVal = document.getElementById('tactics-width-val');
    const widthLabel = document.getElementById('tactics-width-label');
    if (widthSlider) {
      widthSlider.value = tactics.defensiveWidth || 5;
      if (widthVal) widthVal.textContent = tactics.defensiveWidth || 5;
      if (widthLabel) {
        const w = tactics.defensiveWidth || 5;
        widthLabel.textContent = w <= 3 ? 'Estrecho' : (w >= 8 ? 'Muy Abierto' : 'Equilibrado');
      }
    }

    // 4. Salida de balón
    const buildupSel = document.getElementById('tactics-buildup-select');
    if (buildupSel) buildupSel.value = tactics.buildUpPlay || 'balanced';

    // 5. Creación de oportunidades
    const chanceSel = document.getElementById('tactics-chance-select');
    if (chanceSel) chanceSel.value = tactics.chanceCreation || 'forward_runs';
  }

  setupModals() {
    const setupBackdropDismiss = (dialog) => {
      if (!dialog) return;
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
    };

    // Modal Login
    const loginDialog = document.getElementById('login-dialog');
    document.getElementById('btn-close-login')?.addEventListener('click', () => loginDialog.close());
    setupBackdropDismiss(loginDialog);

    // Modal Setup Carta
    const setupDialog = document.getElementById('player-card-setup-dialog');
    document.getElementById('btn-close-setup')?.addEventListener('click', () => setupDialog.close());
    setupBackdropDismiss(setupDialog);

    // Modal Inspección
    const inspectDialog = document.getElementById('player-inspect-dialog');
    document.getElementById('btn-close-inspect')?.addEventListener('click', () => inspectDialog.close());
    setupBackdropDismiss(inspectDialog);

    // Modal Partido
    const matchDialog = document.getElementById('match-dialog');
    document.getElementById('btn-create-match')?.addEventListener('click', () => this.openMatchModal());
    document.getElementById('btn-close-match')?.addEventListener('click', () => matchDialog.close());
    document.getElementById('btn-cancel-match')?.addEventListener('click', () => matchDialog.close());
    setupBackdropDismiss(matchDialog);

    // Modal Resultado Partido
    const resultDialog = document.getElementById('match-result-dialog');
    document.getElementById('btn-close-result')?.addEventListener('click', () => resultDialog.close());
    document.getElementById('btn-cancel-result')?.addEventListener('click', () => resultDialog.close());
    setupBackdropDismiss(resultDialog);

    // Modal Centro Táctico
    const squadDialog = document.getElementById('squad-actions-dialog');
    setupBackdropDismiss(squadDialog);

    document.getElementById('btn-open-create-card')?.addEventListener('click', () => {
      const user = authService.getCurrentUser() || {
        name: 'Nuevo Jugador',
        email: `fichaje_${Date.now()}@rector.es`,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      this.openPlayerSetupModal(user);
    });
  }

  initDragAndDrop() {
    let draggedData = null;
    let touchDragClone = null;
    let touchOriginEl = null;

    // --- HTML5 Desktop Drag & Drop ---
    document.addEventListener('dragstart', (e) => {
      const starterSlot = e.target.closest('.fut-card-slot');
      const benchItem = e.target.closest('[data-bench-id]');
      const subDrawerItem = e.target.closest('#sub-drawer-bench-list [data-player-id]');

      if (starterSlot) {
        const slotIdx = parseInt(starterSlot.dataset.slotIndex, 10);
        draggedData = { type: 'starter', slotIndex: slotIdx };
        starterSlot.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
        }
      } else if (benchItem) {
        const playerId = benchItem.dataset.benchId;
        draggedData = { type: 'bench', playerId };
        benchItem.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'copyMove';
          e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
        }
      } else if (subDrawerItem) {
        const playerId = subDrawerItem.dataset.playerId;
        draggedData = { type: 'bench', playerId };
        subDrawerItem.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'copyMove';
          e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
        }
      }
    });

    document.addEventListener('dragend', () => {
      document.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'));
      document.querySelectorAll('.slot-drop-active').forEach(el => el.classList.remove('slot-drop-active'));
      document.querySelectorAll('.dock-drop-active').forEach(el => el.classList.remove('dock-drop-active'));
      draggedData = null;
    });

    document.addEventListener('dragover', (e) => {
      const slot = e.target.closest('.fut-card-slot');
      const benchDock = e.target.closest('#pitch-bench-container');

      if (slot || benchDock) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        if (slot) {
          document.querySelectorAll('.slot-drop-active').forEach(el => {
            if (el !== slot) el.classList.remove('slot-drop-active');
          });
          slot.classList.add('slot-drop-active');
        } else if (benchDock && draggedData?.type === 'starter') {
          benchDock.classList.add('dock-drop-active');
        }
      }
    });

    document.addEventListener('dragleave', (e) => {
      const slot = e.target.closest('.fut-card-slot');
      if (slot && !slot.contains(e.relatedTarget)) {
        slot.classList.remove('slot-drop-active');
      }
      const benchDock = e.target.closest('#pitch-bench-container');
      if (benchDock && !benchDock.contains(e.relatedTarget)) {
        benchDock.classList.remove('dock-drop-active');
      }
    });

    document.addEventListener('drop', (e) => {
      const slot = e.target.closest('.fut-card-slot');
      const benchDock = e.target.closest('#pitch-bench-container');
      
      document.querySelectorAll('.slot-drop-active').forEach(el => el.classList.remove('slot-drop-active'));
      document.querySelectorAll('.dock-drop-active').forEach(el => el.classList.remove('dock-drop-active'));

      let data = draggedData;
      if (!data && e.dataTransfer) {
        try {
          const raw = e.dataTransfer.getData('text/plain');
          if (raw) data = JSON.parse(raw);
        } catch (_) {}
      }
      if (!data) return;

      if (slot) {
        e.preventDefault();
        const targetSlotIdx = parseInt(slot.dataset.slotIndex, 10);
        if (data.type === 'starter') {
          const fromSlotIdx = data.slotIndex;
          if (fromSlotIdx !== targetSlotIdx) {
            store.swapTwoStarters(fromSlotIdx, targetSlotIdx);
            this.renderPitch();
            futAudio.playSuccess();
            this.showToast('¡Posición intercambiada con éxito!', 'repeat');
          }
        } else if (data.type === 'bench') {
          store.swapStartingPlayer(targetSlotIdx, data.playerId);
          this.closeSubDrawer();
          this.renderPitch();
          futAudio.playSuccess();
          this.showToast('¡Sustitución realizada con éxito!', 'user-check');
        }
      } else if (benchDock && data.type === 'starter') {
        e.preventDefault();
        this.openSubDrawer(data.slotIndex);
      }
      draggedData = null;
    });

    // --- Touch Drag & Drop (Móvil & Tablet) ---
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const starterSlot = e.target.closest('.fut-card-slot');
      const benchItem = e.target.closest('[data-bench-id]');

      if (starterSlot) {
        touchOriginEl = starterSlot;
        const slotIdx = parseInt(starterSlot.dataset.slotIndex, 10);
        draggedData = { type: 'starter', slotIndex: slotIdx, startX: touch.clientX, startY: touch.clientY };
      } else if (benchItem) {
        touchOriginEl = benchItem;
        draggedData = { type: 'bench', playerId: benchItem.dataset.benchId, startX: touch.clientX, startY: touch.clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (!draggedData) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - draggedData.startX);
      const dy = Math.abs(touch.clientY - draggedData.startY);

      if (dx > 12 || dy > 12) {
        if (!touchDragClone && touchOriginEl) {
          touchDragClone = touchOriginEl.cloneNode(true);
          touchDragClone.style.position = 'fixed';
          touchDragClone.style.pointerEvents = 'none';
          touchDragClone.style.zIndex = '9999';
          touchDragClone.style.opacity = '0.85';
          touchDragClone.style.transform = 'scale(0.85)';
          touchDragClone.style.width = '100px';
          document.body.appendChild(touchDragClone);
          touchOriginEl.classList.add('is-dragging');
        }

        if (touchDragClone) {
          touchDragClone.style.left = `${touch.clientX - 50}px`;
          touchDragClone.style.top = `${touch.clientY - 60}px`;
        }

        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const slot = elemBelow?.closest('.fut-card-slot');
        document.querySelectorAll('.slot-drop-active').forEach(el => {
          if (el !== slot) el.classList.remove('slot-drop-active');
        });
        if (slot) slot.classList.add('slot-drop-active');
      }
    };

    const handleTouchEnd = () => {
      if (touchDragClone) {
        touchDragClone.remove();
        touchDragClone = null;
      }
      if (touchOriginEl) {
        touchOriginEl.classList.remove('is-dragging');
      }

      const activeSlot = document.querySelector('.slot-drop-active');
      if (activeSlot && draggedData) {
        const targetSlotIdx = parseInt(activeSlot.dataset.slotIndex, 10);
        if (draggedData.type === 'starter' && draggedData.slotIndex !== targetSlotIdx) {
          store.swapTwoStarters(draggedData.slotIndex, targetSlotIdx);
          this.renderPitch();
          futAudio.playSuccess();
          this.showToast('¡Posición intercambiada!', 'repeat');
        } else if (draggedData.type === 'bench') {
          store.swapStartingPlayer(targetSlotIdx, draggedData.playerId);
          this.renderPitch();
          futAudio.playSuccess();
          this.showToast('¡Sustitución realizada!', 'user-check');
        }
      }

      document.querySelectorAll('.slot-drop-active').forEach(el => el.classList.remove('slot-drop-active'));
      draggedData = null;
      touchOriginEl = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  }

  setupForms() {
    // 0. Test Interactivo de Atributos FIFA Paso a Paso
    this.initStatsTestEvents();

    // 1. Google Sign-In
    document.getElementById('btn-google-signin')?.addEventListener('click', async () => {
      const errBox = document.getElementById('google-auth-error');
      errBox.classList.add('hidden');

      try {
        const res = await authService.signInWithGoogle();
        document.getElementById('login-dialog').close();
        this.showToast(`¡Bienvenido, ${res.user.name}!`, 'user-check');

        if (res.isNew || !res.user.playerId) {
          this.openPlayerSetupModal(res.user);
        }
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      }
    });

    // Subir foto desde el PC / Móvil
    const fileInput = document.getElementById('setup-avatar-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            const dataUrl = loadEvt.target.result;
            const imgEl = document.getElementById('setup-user-avatar');
            const urlInput = document.getElementById('setup-avatar-url');
            if (imgEl) imgEl.src = dataUrl;
            if (urlInput) urlInput.value = dataUrl;
            this.showToast('Foto de perfil cargada con éxito', 'camera');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Presets rápidos de fotos de futbolistas
    document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const av = btn.dataset.avatar;
        if (av) {
          const imgEl = document.getElementById('setup-user-avatar');
          const urlInput = document.getElementById('setup-avatar-url');
          if (imgEl) imgEl.src = av;
          if (urlInput) urlInput.value = av;
          document.querySelectorAll('.avatar-preset-btn').forEach(b => b.classList.remove('border-amber-400'));
          btn.classList.add('border-amber-400');
        }
      });
    });

    // 2. Ficha de Jugador FIFA (Personalización completa: kit, playstyles, filigranas, roles, atributos)
    document.getElementById('form-setup-card')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cardData = {
        avatar: document.getElementById('setup-avatar-url')?.value || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        nickname: document.getElementById('setup-nickname').value,
        number: parseInt(document.getElementById('setup-number').value, 10) || 10,
        faculty: document.getElementById('setup-faculty').value,
        preferredFoot: document.getElementById('setup-foot').value,
        cardType: document.getElementById('setup-card-type')?.value || 'gold',
        kitColor: document.getElementById('setup-kit-primary')?.value || '#f0be2a',
        kitSecondary: document.getElementById('setup-kit-secondary')?.value || '#111827',
        kitCollar: document.getElementById('setup-kit-collar')?.value || 'round',
        kitSleeves: document.getElementById('setup-kit-sleeves')?.value || 'short',
        playStyle: document.getElementById('setup-playstyle')?.value || 'finesse',
        celebration: document.getElementById('setup-celebration')?.value || 'siuuu',
        skillMoves: parseInt(document.getElementById('setup-skill-moves')?.value, 10) || 4,
        weakFoot: parseInt(document.getElementById('setup-weak-foot')?.value, 10) || 4,
        chemStyle: document.getElementById('setup-chem-style')?.value || 'HUN',
        roleBest: document.getElementById('setup-role-best').value,
        roleSecond: document.getElementById('setup-role-second').value,
        roleThird: document.getElementById('setup-role-third').value,
        roleWorst: document.getElementById('setup-role-worst').value,
        pac: document.getElementById('setup-pac').value,
        sho: document.getElementById('setup-sho').value,
        pas: document.getElementById('setup-pas').value,
        dri: document.getElementById('setup-dri').value,
        def: document.getElementById('setup-def').value,
        phy: document.getElementById('setup-phy').value
      };

      try {
        const wasNew = !authService.getCurrentUser()?.playerId;
        const newPlayer = await authService.completePlayerCard(cardData);
        document.getElementById('player-card-setup-dialog').close();
        this.showToast(wasNew ? '¡Tu Carta FIFA FUT ha sido generada con éxito!' : '¡Carta actualizada correctamente!', 'sparkles');
        if (wasNew && newPlayer) {
          this.triggerWalkout(newPlayer);
        }
      } catch (err) {
        alert(err.message);
      }
    });

    // 3. Formulario Partido
    document.getElementById('form-match')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('match-id').value;
      const data = {
        rival: document.getElementById('match-rival').value,
        modality: document.getElementById('match-modality').value,
        tournament: document.getElementById('match-tournament').value || 'Torneo del Rector',
        date: document.getElementById('match-date').value,
        time: document.getElementById('match-time').value,
        field: document.getElementById('match-field').value,
        notes: document.getElementById('match-notes').value,
        status: 'proximo'
      };

      if (id) {
        store.updateMatch(id, data);
        this.showToast('Partido actualizado', 'calendar');
      } else {
        store.addMatch(data);
        this.showToast('Nuevo partido programado en el calendario', 'check-circle-2');
      }

      document.getElementById('match-dialog').close();
    });

    // 4. Formulario Resultado de Partido (Acta)
    document.getElementById('form-match-result')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('result-match-id').value;
      const goalsFor = parseInt(document.getElementById('result-goals-for').value, 10) || 0;
      const goalsAgainst = parseInt(document.getElementById('result-goals-against').value, 10) || 0;
      const scorers = document.getElementById('result-scorers').value;
      const mvp = document.getElementById('result-mvp').value;

      store.updateMatch(id, {
        goalsFor,
        goalsAgainst,
        scorers,
        mvp,
        status: 'finalizado'
      });

      document.getElementById('match-result-dialog').close();
      this.showToast('Acta finalizada y estadísticas actualizadas', 'trophy');
    });

    // 5. Configuración y Personalización Integral del Club
    document.getElementById('form-team-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const teamName = document.getElementById('set-team-name')?.value || 'Furia Rector FC';
      const shortName = (document.getElementById('set-short-name')?.value || 'FUR').toUpperCase();
      const tournament = document.getElementById('set-tournament-name')?.value || 'Torneo del Rector 2026';
      const slogan = document.getElementById('set-club-slogan')?.value || '¡Hasta el último minuto!';
      const crest = document.getElementById('set-club-crest')?.value || 'shield_gold';
      const kitColor = document.getElementById('set-kit-primary')?.value || '#f8fafc';
      const kitSecondary = document.getElementById('set-kit-secondary')?.value || '#f0be2a';
      const stadium = document.getElementById('set-club-stadium')?.value || 'campus_sur';
      const ball = document.getElementById('set-club-ball')?.value || 'nike_flight';

      const specialists = {
        captain: document.getElementById('spec-captain')?.value || 'p4',
        penalties: document.getElementById('spec-penalties')?.value || 'p6',
        freeKicks: document.getElementById('spec-freekicks')?.value || 'p5',
        corners: document.getElementById('spec-corners')?.value || 'p4'
      };

      store.updateSettings({
        teamName,
        shortName,
        tournament,
        slogan,
        crest,
        kitColor,
        kitSecondary,
        stadium,
        ball,
        specialists
      });

      futAudio.playSuccess();
      this.renderHeaderAndSettings();
      this.renderPitch();
      this.renderAlbumCards();
      this.renderMatches();
      this.renderClubHub();
      this.showToast('Personalización del Club guardada con éxito', 'award');
    });

    // Escuchadores en tiempo real para la paleta de colores de la equipación
    document.getElementById('set-kit-primary')?.addEventListener('input', (e) => {
      const hex = document.getElementById('kit-primary-hex');
      if (hex) hex.textContent = e.target.value;
      const sec = document.getElementById('set-kit-secondary')?.value || '#f0be2a';
      this.updateKitPreview(e.target.value, sec);
    });

    document.getElementById('set-kit-secondary')?.addEventListener('input', (e) => {
      const hex = document.getElementById('kit-secondary-hex');
      if (hex) hex.textContent = e.target.value;
      const prim = document.getElementById('set-kit-primary')?.value || '#f8fafc';
      this.updateKitPreview(prim, e.target.value);
    });

    // 6. Formulario Firebase
    document.getElementById('form-firebase')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const config = {
        apiKey: document.getElementById('fb-key').value.trim(),
        projectId: document.getElementById('fb-proj').value.trim(),
        authDomain: document.getElementById('fb-dom').value.trim(),
        appId: document.getElementById('fb-app').value.trim()
      };
      saveFirebaseConfig(config);
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm('¿Restablecer datos de prueba?')) {
        store.resetToDefault();
        this.showToast('Datos de prueba restablecidos', 'repeat');
      }
    });
  }

  openPlayerSetupModal(user) {
    const dialog = document.getElementById('player-card-setup-dialog');
    if (!dialog) return;

    user = user || authService.currentUser || {
      uid: 'guest-' + Date.now(),
      name: 'Nuevo Fichaje',
      email: 'fichaje@rector.es'
    };

    const existing = store.getPlayers().find(p => 
      (user?.playerId && p.id === user.playerId) || 
      (p.email && p.email.toLowerCase() === (user?.email || '').toLowerCase())
    );

    const titleEl = document.getElementById('setup-title');
    const submitBtn = document.querySelector('#form-setup-card button[type="submit"]');

    if (existing) {
      if (titleEl) titleEl.textContent = 'Editar mi Carta FUT Oficial';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios de mi Carta';
      document.getElementById('setup-nickname').value = existing.nickname || (user.name ? user.name.split(' ')[0] : 'Crack');
      document.getElementById('setup-number').value = existing.number || 10;
      document.getElementById('setup-faculty').value = existing.faculty || 'inf';
      document.getElementById('setup-foot').value = existing.preferredFoot || 'Diestro';
      if (document.getElementById('setup-card-type')) {
        document.getElementById('setup-card-type').value = existing.cardType || 'gold';
      }
      if (document.getElementById('setup-kit-primary')) {
        document.getElementById('setup-kit-primary').value = existing.kitColor || '#f0be2a';
      }
      if (document.getElementById('setup-kit-secondary')) {
        document.getElementById('setup-kit-secondary').value = existing.kitSecondary || '#111827';
      }
      if (document.getElementById('setup-kit-collar')) {
        document.getElementById('setup-kit-collar').value = existing.kitCollar || 'round';
      }
      if (document.getElementById('setup-kit-sleeves')) {
        document.getElementById('setup-kit-sleeves').value = existing.kitSleeves || 'short';
      }
      if (document.getElementById('setup-playstyle')) {
        document.getElementById('setup-playstyle').value = existing.playStyle || 'finesse';
      }
      if (document.getElementById('setup-celebration')) {
        document.getElementById('setup-celebration').value = existing.celebration || 'siuuu';
      }
      if (document.getElementById('setup-skill-moves')) {
        document.getElementById('setup-skill-moves').value = existing.skillMoves || 4;
      }
      if (document.getElementById('setup-weak-foot')) {
        document.getElementById('setup-weak-foot').value = existing.weakFoot || 4;
      }
      if (document.getElementById('setup-chem-style')) {
        document.getElementById('setup-chem-style').value = existing.chemStyle || 'HUN';
      }
      if (existing.rolesHierarchy) {
        document.getElementById('setup-role-best').value = existing.rolesHierarchy.best || 'DC';
        document.getElementById('setup-role-second').value = existing.rolesHierarchy.second || 'MC';
        document.getElementById('setup-role-third').value = existing.rolesHierarchy.third || 'DFC';
        document.getElementById('setup-role-worst').value = existing.rolesHierarchy.worst || 'POR';
      }
      this.setupStatsTestForUser(existing);
      const avatarUrl = existing.avatar || user.photoURL;
      const imgEl = document.getElementById('setup-user-avatar');
      const urlInput = document.getElementById('setup-avatar-url');
      if (imgEl) imgEl.src = avatarUrl;
      if (urlInput) urlInput.value = avatarUrl;
    } else {
      if (titleEl) titleEl.textContent = 'Crea tu Carta FIFA Ultimate Team';
      if (submitBtn) submitBtn.textContent = 'Guardar y Generar mi Carta FUT';
      document.getElementById('setup-nickname').value = user.name ? user.name.split(' ')[0] : 'Crack';
      if (document.getElementById('setup-card-type')) {
        document.getElementById('setup-card-type').value = 'gold';
      }
      this.setupStatsTestForUser(null);
      const avatarUrl = user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      const imgEl = document.getElementById('setup-user-avatar');
      const urlInput = document.getElementById('setup-avatar-url');
      if (imgEl) imgEl.src = avatarUrl;
      if (urlInput) urlInput.value = avatarUrl;
    }

    const userNameEl = document.getElementById('setup-user-name');
    if (userNameEl) userNameEl.textContent = user.name || 'Jugador FUT';
    const userEmailEl = document.getElementById('setup-user-email');
    if (userEmailEl) userEmailEl.textContent = user.email || '';
    dialog.showModal();
    this.refreshIcons();
  }

  // ==================== TEST DE ATRIBUTOS FIFA PASO A PASO ====================
  initStatsTestEvents() {
    this.statsTestState = {
      currentStep: 0,
      stats: { pac: 82, sho: 80, pas: 80, dri: 82, def: 60, phy: 78 },
      isCompleted: false
    };

    const slider = document.getElementById('wizard-range-slider');
    const btnMinus = document.getElementById('wizard-btn-minus');
    const btnPlus = document.getElementById('wizard-btn-plus');
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnNext = document.getElementById('wizard-btn-next');
    const btnRestart = document.getElementById('btn-restart-stats-test');

    slider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.updateCurrentStatValue(val, false);
      if (typeof futAudio !== 'undefined') futAudio.playRatingTick();
    });

    btnMinus?.addEventListener('click', () => {
      const currentConfig = STATS_TEST_CONFIG[this.statsTestState.currentStep];
      const currentVal = this.statsTestState.stats[currentConfig.key] || currentConfig.defaultValue;
      if (currentVal > 40) {
        this.updateCurrentStatValue(currentVal - 1, true);
        if (typeof futAudio !== 'undefined') futAudio.playRatingTick();
      }
    });

    btnPlus?.addEventListener('click', () => {
      const currentConfig = STATS_TEST_CONFIG[this.statsTestState.currentStep];
      const currentVal = this.statsTestState.stats[currentConfig.key] || currentConfig.defaultValue;
      if (currentVal < 99) {
        this.updateCurrentStatValue(currentVal + 1, true);
        if (typeof futAudio !== 'undefined') futAudio.playRatingTick();
      }
    });

    // Botones de presets rápidos
    document.querySelectorAll('.wizard-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        if (!isNaN(val)) {
          this.updateCurrentStatValue(val, true);
          if (typeof futAudio !== 'undefined') futAudio.playCardSelect();
        }
      });
    });

    // Navegación anterior / siguiente
    btnPrev?.addEventListener('click', () => {
      if (this.statsTestState.currentStep > 0) {
        this.statsTestState.currentStep--;
        this.renderCurrentTestStep();
        if (typeof futAudio !== 'undefined') futAudio.playCardSelect();
      }
    });

    btnNext?.addEventListener('click', () => {
      if (this.statsTestState.currentStep < 5) {
        this.statsTestState.currentStep++;
        this.renderCurrentTestStep();
        if (typeof futAudio !== 'undefined') futAudio.playCardSelect();
      } else {
        // Finalizar evaluación
        this.statsTestState.isCompleted = true;
        this.showStatsTestSummary();
        if (typeof futAudio !== 'undefined') futAudio.playSuccess();
        this.showToast('¡Test de atributos completado con éxito!', 'award');
      }
    });

    // Requisito expreso del usuario: hacer de nuevo el test y te sale lo mismo
    btnRestart?.addEventListener('click', () => {
      this.statsTestState.isCompleted = false;
      this.statsTestState.currentStep = 0;
      this.showStatsTestWizard();
      if (typeof futAudio !== 'undefined') futAudio.playCardSelect();
      this.showToast('Reiniciando test de atributos paso a paso...', 'rotate-ccw');
    });
  }

  setupStatsTestForUser(existing) {
    if (!this.statsTestState) {
      this.statsTestState = {
        currentStep: 0,
        stats: { pac: 82, sho: 80, pas: 80, dri: 82, def: 60, phy: 78 },
        isCompleted: false
      };
    }

    if (existing && existing.stats) {
      this.statsTestState.stats = {
        pac: existing.stats.pac || 82,
        sho: existing.stats.sho || 80,
        pas: existing.stats.pas || 80,
        dri: existing.stats.dri || 82,
        def: existing.stats.def || 60,
        phy: existing.stats.phy || 78
      };
      this.statsTestState.isCompleted = true;
      this.statsTestState.currentStep = 0;
      this.showStatsTestSummary();
    } else {
      this.statsTestState.stats = {
        pac: 82,
        sho: 80,
        pas: 80,
        dri: 82,
        def: 60,
        phy: 78
      };
      this.statsTestState.isCompleted = false;
      this.statsTestState.currentStep = 0;
      this.showStatsTestWizard();
    }
  }

  getStatTierInfo(val) {
    if (val >= 90) {
      return {
        badgeClass: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
        textClass: 'text-amber-400',
        label: 'Élite Mundial (90+)'
      };
    }
    if (val >= 80) {
      return {
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        textClass: 'text-emerald-400',
        label: 'Destacado (80-89)'
      };
    }
    if (val >= 70) {
      return {
        badgeClass: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
        textClass: 'text-sky-400',
        label: 'Competitivo (70-79)'
      };
    }
    if (val >= 55) {
      return {
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
        textClass: 'text-slate-300',
        label: 'Nivel Medio (55-69)'
      };
    }
    return {
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      textClass: 'text-rose-400',
      label: 'Básico / Principiante (~50)'
    };
  }

  updateCurrentStatValue(val, updateSlider = true) {
    val = Math.max(40, Math.min(99, val));
    const currentConfig = STATS_TEST_CONFIG[this.statsTestState.currentStep];
    this.statsTestState.stats[currentConfig.key] = val;

    // Sincronizar input oculto para persistencia con Auth y Store
    const hiddenInput = document.getElementById('setup-' + currentConfig.key);
    if (hiddenInput) hiddenInput.value = val;

    // Actualizar slider visual
    const slider = document.getElementById('wizard-range-slider');
    if (slider && updateSlider) slider.value = val;

    // Actualizar display gigante
    const valDisplay = document.getElementById('wizard-stat-value');
    if (valDisplay) valDisplay.textContent = val;

    // Actualizar badge de tier
    const tier = this.getStatTierInfo(val);
    const badgeEl = document.getElementById('wizard-tier-badge');
    if (badgeEl) {
      badgeEl.className = `mt-1 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5  ${tier.badgeClass}`;
      badgeEl.textContent = tier.label;
    }

    // Actualizar caja de descripción dinámica contextual
    const descBox = document.getElementById('wizard-stat-desc-box');
    if (descBox) {
      const activeTierObj = currentConfig.tiers.find(t => val >= t.min) || currentConfig.tiers[currentConfig.tiers.length - 1];
      descBox.innerHTML = `
        <div class="flex items-start gap-2.5">
          <span class="text-xl flex-shrink-0">${activeTierObj.emoji}</span>
          <div class="space-y-0.5">
            <span class="text-[11px] font-black ${tier.textClass} uppercase tracking-wide block">
              ${activeTierObj.label} · ${val} Puntos
            </span>
            <p class="text-xs text-slate-700 font-medium leading-relaxed">
              ${activeTierObj.desc}
            </p>
          </div>
        </div>
      `;
    }

    // Actualizar highlight de botones preset
    document.querySelectorAll('.wizard-preset-btn').forEach(btn => {
      const pVal = parseInt(btn.dataset.val, 10);
      if (pVal === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Actualizar número en el stepper pill
    const pillVal = document.getElementById(`pill-val-${currentConfig.key}`);
    if (pillVal) pillVal.textContent = val;
  }

  renderCurrentTestStep() {
    const step = this.statsTestState.currentStep;
    const config = STATS_TEST_CONFIG[step];
    const val = this.statsTestState.stats[config.key] || config.defaultValue;

    // Badge de paso actual
    const stepBadge = document.getElementById('wizard-step-badge');
    if (stepBadge) stepBadge.textContent = `Paso ${step + 1} de 6`;

    // Barra de progreso
    const progressBar = document.getElementById('wizard-progress-bar');
    if (progressBar) progressBar.style.width = `${((step + 1) / 6) * 100}%`;

    // Stepper pills interactivos
    const pillsContainer = document.getElementById('wizard-stepper-pills');
    if (pillsContainer) {
      pillsContainer.innerHTML = STATS_TEST_CONFIG.map((c, idx) => {
        const cVal = this.statsTestState.stats[c.key] || c.defaultValue;
        const isActive = idx === step;
        return `
          <button type="button" class="wizard-step-pill p-1  border text-center transition cursor-pointer ${
            isActive 
              ? 'active border-amber-400 bg-amber-400 text-slate-950 font-black shadow-sm' 
              : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold'
          }" data-step="${idx}">
            <span class="text-[9px] block uppercase font-fifa leading-tight">${c.short}</span>
            <span id="pill-val-${c.key}" class="text-[11px] block font-black leading-tight font-fifa">${cVal}</span>
          </button>
        `;
      }).join('');

      pillsContainer.querySelectorAll('.wizard-step-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetStep = parseInt(btn.dataset.step, 10);
          if (!isNaN(targetStep)) {
            this.statsTestState.currentStep = targetStep;
            this.renderCurrentTestStep();
            if (typeof futAudio !== 'undefined') futAudio.playCardSelect();
          }
        });
      });
    }

    // Cabecera del atributo
    const tagEl = document.getElementById('wizard-stat-tag');
    if (tagEl) {
      tagEl.textContent = config.short;
      tagEl.className = `text-xs font-black px-2 py-0.5  font-fifa tracking-wider border ${config.tagClass}`;
    }

    const titleEl = document.getElementById('wizard-stat-title');
    if (titleEl) titleEl.textContent = config.title;

    const questEl = document.getElementById('wizard-stat-question');
    if (questEl) questEl.textContent = config.question;

    // Actualizar valor, descripción y presets
    this.updateCurrentStatValue(val, true);

    // Botones de navegación
    const btnPrev = document.getElementById('wizard-btn-prev');
    if (btnPrev) {
      btnPrev.disabled = (step === 0);
    }

    const nextText = document.getElementById('wizard-btn-next-text');
    const nextBtn = document.getElementById('wizard-btn-next');
    if (nextText && nextBtn) {
      if (step < 5) {
        const nextCfg = STATS_TEST_CONFIG[step + 1];
        nextText.textContent = `Siguiente: ${nextCfg.short}`;
        nextBtn.className = 'px-5 py-2.5  bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 cursor-pointer';
        const icon = document.getElementById('wizard-btn-next-icon');
        if (icon) icon.setAttribute('data-lucide', 'chevron-right');
      } else {
        nextText.textContent = 'Finalizar Test y Ver Resultado ✓';
        nextBtn.className = 'px-5 py-2.5  bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer';
        const icon = document.getElementById('wizard-btn-next-icon');
        if (icon) icon.setAttribute('data-lucide', 'check-check');
      }
    }

    this.refreshIcons();
  }

  showStatsTestSummary() {
    const wizardView = document.getElementById('stats-wizard-view');
    const summaryView = document.getElementById('stats-summary-view');
    if (wizardView) wizardView.classList.add('hidden');
    if (summaryView) summaryView.classList.remove('hidden');

    const s = this.statsTestState?.stats || { pac: 82, sho: 80, pas: 80, dri: 82, def: 60, phy: 78 };
    const ovr = Math.round(
      (s.pac * 0.15) +
      (s.sho * 0.20) +
      (s.pas * 0.20) +
      (s.dri * 0.20) +
      (s.def * 0.15) +
      (s.phy * 0.10)
    );

    const ovrBadge = document.getElementById('summary-ovr-badge');
    if (ovrBadge) ovrBadge.textContent = `${ovr} OVR`;

    const grid = document.getElementById('summary-stats-grid');
    if (grid) {
      grid.innerHTML = STATS_TEST_CONFIG.map(c => {
        const val = s[c.key] || c.defaultValue;
        const tier = this.getStatTierInfo(val);
        return `
          <div class="bg-slate-950 p-2  border border-slate-800 shadow-sm text-center">
            <span class="text-[9px] font-black text-slate-400 block font-sans">${c.short}</span>
            <span class="text-xl sm:text-2xl font-black font-fifa ${tier.textClass} block leading-tight">${val}</span>
            <span class="text-[8px] font-bold text-slate-400 block truncate">${c.short}</span>
          </div>
        `;
      }).join('');
    }

    // Sincronizar campos ocultos del formulario
    STATS_TEST_CONFIG.forEach(c => {
      const input = document.getElementById('setup-' + c.key);
      if (input) input.value = s[c.key] || c.defaultValue;
    });

    this.refreshIcons();
  }

  showStatsTestWizard() {
    const wizardView = document.getElementById('stats-wizard-view');
    const summaryView = document.getElementById('stats-summary-view');
    if (summaryView) summaryView.classList.add('hidden');
    if (wizardView) wizardView.classList.remove('hidden');

    this.renderCurrentTestStep();
    this.refreshIcons();
  }

  openMatchModal(id = null) {
    const dialog = document.getElementById('match-dialog');
    const form = document.getElementById('form-match');
    form.reset();

    const settings = store.getSettings();

    if (id) {
      const m = store.getMatchById(id);
      if (m) {
        document.getElementById('match-id').value = m.id;
        document.getElementById('match-rival').value = m.rival;
        document.getElementById('match-modality').value = m.modality || settings.modality;
        document.getElementById('match-tournament').value = m.tournament || settings.tournament;
        document.getElementById('match-date').value = m.date;
        document.getElementById('match-time').value = m.time;
        document.getElementById('match-field').value = m.field;
        document.getElementById('match-notes').value = m.notes || '';
      }
    } else {
      document.getElementById('match-id').value = '';
      document.getElementById('match-modality').value = settings.modality;
      document.getElementById('match-tournament').value = settings.tournament;
      document.getElementById('match-date').value = new Date().toISOString().split('T')[0];
    }

    dialog.showModal();
  }

  openResultModal(matchId) {
    const m = store.getMatchById(matchId);
    if (!m) return;

    const settings = store.getSettings();
    document.getElementById('result-match-id').value = m.id;
    document.getElementById('result-team-name').textContent = settings.teamName;
    document.getElementById('result-rival-name').textContent = m.rival;
    document.getElementById('result-goals-for').value = m.goalsFor !== null ? m.goalsFor : 0;
    document.getElementById('result-goals-against').value = m.goalsAgainst !== null ? m.goalsAgainst : 0;
    document.getElementById('result-scorers').value = m.scorers || '';
    document.getElementById('result-mvp').value = m.mvp || '';

    document.getElementById('match-result-dialog').showModal();
  }

  deleteMatch(id) {
    if (confirm('¿Eliminar este partido del calendario?')) {
      store.deleteMatch(id);
      this.showToast('Partido eliminado', 'trash-2');
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('.fifa-tab-btn, .tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${tabId}`)?.classList.remove('hidden');

    this.renderAll();
    this.refreshIcons();
  }

  renderAuthBar(user) {
    const container = document.getElementById('auth-container');
    if (!container) return;

    if (user) {
      const isMister = user.role === 'admin';
      const userPhoto = user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      container.innerHTML = `
        <div class="flex items-center gap-2 bg-[#0B0D10] border border-[#F0BE2A]/40 px-2.5 py-1">
          <div class="flex items-center gap-2 cursor-pointer group" id="btn-open-my-profile" title="Ver / Editar mi Carta y Foto de Perfil">
            <img src="${userPhoto}" alt="${user.name}" class="w-6 h-6 object-cover border ${isMister ? 'border-[#F0BE2A]' : 'border-[#38F89C]'}">
            <div class="hidden sm:block text-left">
              <div class="text-xs font-black text-[#E9E9E9] uppercase tracking-wider leading-none truncate max-w-[110px] group-hover:text-[#F0BE2A]">${user.name}</div>
              <div class="text-[9px] ${isMister ? 'text-[#F0BE2A]' : 'text-[#38F89C]'} font-bold uppercase tracking-widest leading-none mt-0.5">
                ${isMister ? 'ADMIN' : 'JUGADOR'}
              </div>
            </div>
          </div>
          <button id="btn-logout" class="ml-1 p-1 text-[#8B8F98] hover:text-[#F43F5E] transition cursor-pointer" title="Cerrar Sesión" aria-label="Cerrar Sesión">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;

      document.getElementById('btn-open-my-profile')?.addEventListener('click', () => {
        this.openPlayerSetupModal(user);
      });

      document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.stopPropagation();
        authService.signOut();
        this.showToast('Sesión cerrada correctamente', 'user-check');
      });
    } else {
      container.innerHTML = `
        <button id="btn-open-login" class="px-3 py-1 bg-[#F0BE2A] hover:bg-white text-[#111111] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>CONECTAR CUENTA</span>
        </button>
      `;

      document.getElementById('btn-open-login')?.addEventListener('click', () => {
        document.getElementById('login-dialog').showModal();
      });
    }

    this.refreshIcons();
  }

  updateAdminVisibility() {
    const isAdmin = authService.isAdmin();
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = isAdmin ? '' : 'none';
    });
  }

  renderAll() {
    this.populateFormationsSelect();
    this.renderHeaderAndSettings();
    this.renderPitch();
    this.renderAlbumCards();
    this.renderMatches();
    this.renderClubHub();
    this.updateAdminVisibility();

    const count = document.getElementById('tab-player-count');
    if (count) count.textContent = store.getPlayers().length;
  }

  renderHeaderAndSettings() {
    const settings = store.getSettings();
    const navName = document.getElementById('nav-team-name');
    if (navName) navName.textContent = settings.teamName;

    const hudTop = document.getElementById('hud-team-name-top');
    if (hudTop) hudTop.textContent = settings.teamName;

    const navBadge = document.getElementById('nav-tournament-badge');
    if (navBadge) navBadge.textContent = settings.tournament;

    const setTeam = document.getElementById('set-team-name');
    if (setTeam && !setTeam.value) setTeam.value = settings.teamName;

    const setTour = document.getElementById('set-tournament-name');
    if (setTour && !setTour.value) setTour.value = settings.tournament;
  }

  // ==================== RENDER PIZARRA FIFA FUT ====================
  renderPitch() {
    const slotsContainer = document.getElementById('pitch-slots-container');
    const benchContainer = document.getElementById('pitch-bench-container');
    const swapBanner = document.getElementById('swap-banner');
    if (!slotsContainer || !benchContainer) return;

    if (swapBanner) {
      if (this.selectedStarterIndex !== null) {
        swapBanner.classList.remove('hidden');
      } else {
        swapBanner.classList.add('hidden');
      }
    }

    const settings = store.getSettings();
    const isF7 = settings.modality === 'f7';
    const activeFormation = store.getActiveFormation();
    const formationConfig = getFormationConfig(settings.modality, activeFormation);
    const startingPlayers = store.getStartingLineup();
    const slotRoles = formationConfig.slots.map(s => s.role);

    // Rating general del equipo (Química removida)
    const chemRatingData = store.calculateTeamChemistryAndRating(slotRoles);
    const rEl = document.getElementById('hud-team-rating');
    if (rEl) rEl.textContent = chemRatingData.rating;

    const headerRating = document.getElementById('header-team-rating');
    if (headerRating) headerRating.textContent = chemRatingData.rating;
    const ratingFill = document.querySelector('.hud-rating-fill');
    if (ratingFill) ratingFill.style.width = `${Math.min(100, chemRatingData.rating)}%`;

    const sideFormation = document.getElementById('side-formation-tag');
    if (sideFormation) sideFormation.textContent = formationConfig.short || activeFormation;

    const tileFormation = document.getElementById('tile-formation-badge');
    if (tileFormation) tileFormation.textContent = formationConfig.short || activeFormation;

    const startersEl = document.getElementById('hud-team-starters');
    if (startersEl) startersEl.textContent = startingPlayers.length;
    
    const starsEl = document.querySelector('.fut-stars');
    if (starsEl) {
      const r = chemRatingData.rating;
      starsEl.textContent = r >= 85 ? '★★★★★' : (r >= 80 ? '★★★★½' : '★★★★☆');
    }

    const modBadge = document.getElementById('current-modality-badge');
    if (modBadge) {
      modBadge.textContent = isF7 ? 'FUT 7 DRAFT' : 'FUTSAL DRAFT';
    }

    const projected = formationConfig.slots.map(s => this.projectSlot(s));

    // Renderizar Enlaces de Química FIFA FUT en SVG (Líneas entre jugadores)
    const chemSvg = document.getElementById('pitch-chemistry-svg');
    if (chemSvg) {
      const links = this.getFormationChemistryLinks(settings.modality, activeFormation, formationConfig.slots.length);
      chemSvg.innerHTML = links.map(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        if (!p1 || !p2) return '';

        const pl1 = startingPlayers[i];
        const pl2 = startingPlayers[j];

        let strokeColor = '#22c55e';
        let strokeFilter = 'drop-shadow(0 0 5px rgba(34, 197, 94, 0.85))';
        let strokeWidth = '3';
        let strokeDash = '';

        if (!pl1 || !pl2) {
          strokeColor = 'rgba(255, 255, 255, 0.2)';
          strokeFilter = 'none';
          strokeDash = 'stroke-dasharray="2,2"';
          strokeWidth = '1.5';
        } else if (pl1.faculty && pl2.faculty && pl1.faculty === pl2.faculty) {
          strokeColor = '#38f89c'; // Química Perfecta (Misma facultad)
          strokeFilter = 'drop-shadow(0 0 7px rgba(56, 248, 156, 0.95))';
          strokeWidth = '3.5';
        } else {
          strokeColor = '#facc15'; // Química Media / Alta FIFA Gold
          strokeFilter = 'drop-shadow(0 0 5px rgba(250, 204, 21, 0.85))';
          strokeWidth = '2.8';
        }

        return `
          <line x1="${p1.left}" y1="${p1.top}" x2="${p2.left}" y2="${p2.top}"
                stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"
                ${strokeDash} style="filter: ${strokeFilter}; vector-effect: non-scaling-stroke;" />
        `;
      }).join('');
    }

    // Renderizar Mini Pizarra Táctica en Panel C
    const tacticsDots = document.getElementById('hud-tactics-dots-container');
    if (tacticsDots) {
      tacticsDots.innerHTML = formationConfig.slots.map(s => {
        return `<span class="tactics-dot" style="top: ${s.top}%; left: ${s.left}%;"></span>`;
      }).join('');
    }

    // Marca de agua táctica de formación sobre el césped
    const fWatermark = document.getElementById('pitch-formation-watermark');
    if (fWatermark) {
      fWatermark.textContent = formationConfig.short || activeFormation;
    }

    const allPlayers = store.getPlayers();
    const activePlayer = this.selectedStarterIndex !== null ? startingPlayers[this.selectedStarterIndex] : (startingPlayers[0] || allPlayers[0]);
    this.updatePlayerInspector(activePlayer);

    // Renderizar Cartas sobre el Césped con Drag & Drop
    slotsContainer.innerHTML = formationConfig.slots.map((slot, index) => {
      const player = startingPlayers[index];
      const isSelected = this.selectedStarterIndex === index;
      const pr = projected[index];
      const slotStyle = `top: ${pr.top}%; left: ${pr.left}%; --depth-scale: ${pr.scale}; z-index: ${pr.z};`;

      if (!player) {
        return `
          <div class="fut-card-slot" style="${slotStyle}" data-slot-index="${index}">
            <div class="fut-card fut-card-size-pitch bg-slate-900/60 border border-dashed border-slate-700/80  flex flex-col items-center justify-center text-slate-500 font-bold text-xs gap-1 shadow-inner">
              <i data-lucide="plus" class="w-5 h-5 text-slate-500"></i>
              <span class="text-[10px] uppercase font-fifa tracking-wider">Vacío</span>
            </div>
            <div class="fut-pos-pedestal"><span>${slot.role}</span></div>
          </div>
        `;
      }

      return `
        <div class="fut-card-slot ${isSelected ? 'swap-active is-selected-cursor' : ''}" 
             style="${slotStyle}"
             data-slot-index="${index}"
             draggable="true"
             onclick="window.futApp.selectStarter(${index})"
             onmouseenter="window.futApp.updatePlayerInspector(window.futApp.store.getStartingLineup()[${index}])">
          
          ${isSelected ? `<div class="fifa-player-cursor font-fifa" title="Jugador Activo">▼</div>` : ''}
          ${this.renderFutCard(player, { size: 'pitch', role: slot.role })}

          <div class="fut-pos-pedestal">
            <span>${slot.role}</span>
          </div>

        </div>
      `;
    }).join('');

    // Banquillo (Deduplicación estricta para garantizar 0 duplicados)
    const startingIds = new Set(startingPlayers.map(p => p.id));
    const seenBenchNames = new Set(startingPlayers.map(p => (p.nickname || p.name || '').toLowerCase().trim()));
    const seenBenchEmails = new Set(startingPlayers.map(p => (p.email || '').toLowerCase().trim()).filter(Boolean));
    const bench = [];

    for (const p of allPlayers) {
      if (startingIds.has(p.id)) continue;
      const email = (p.email || '').toLowerCase().trim();
      const name = (p.nickname || p.name || '').toLowerCase().trim();
      if (email && seenBenchEmails.has(email)) continue;
      if (name && seenBenchNames.has(name)) continue;
      if (email) seenBenchEmails.add(email);
      if (name) seenBenchNames.add(name);
      bench.push(p);
    }

    const sideBenchCount = document.getElementById('side-bench-count');
    if (sideBenchCount) sideBenchCount.textContent = bench.length;

    if (bench.length === 0) {
      benchContainer.innerHTML = `
        <div class="text-xs text-slate-400 py-2 px-3 italic whitespace-nowrap">Banquillo libre. Añade fichajes desde el Álbum.</div>
      `;
    } else {
      benchContainer.innerHTML = bench.map(p => {
        return `
          <div class="cursor-pointer hover:scale-105 transition flex-shrink-0" 
               data-bench-id="${p.id}"
               draggable="true"
               onclick="window.futApp.selectBench('${p.id}')"
               onmouseenter="window.futApp.updatePlayerInspector(window.futApp.store.getPlayerById('${p.id}'))"
               title="${p.name} (${p.rolesHierarchy ? p.rolesHierarchy.best : p.roleBest || 'DC'})">
            ${this.renderFutCard(p, { size: 'bench' })}
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Sprint 1 — Proyección en perspectiva de un slot táctico.
   * Convierte coordenadas "planas" (top/left 0-100 de la pizarra) en coordenadas
   * de pantalla sobre el césped inclinado 24º: los jugadores del fondo se juntan
   * hacia el centro y se encogen; el portero queda grande y cerca de cámara.
   */
  projectSlot(slot) {
    // Escala en perspectiva sobre el trapecio 3D: delanteros al fondo (más pequeños), portero cerca
    const t = Math.min(1, Math.max(0, (slot.top - 15) / 72));
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const baseScale = isMobile ? 0.78 : 0.84;
    const scale = +(baseScale + 0.16 * t).toFixed(3);

    // Mapeo vertical calibrado con 4 franjas limpias para que NUNCA exista solapamiento
    let mappedTop = 13 + t * 70;
    if (slot.role === 'POR') mappedTop = 83.5;
    else if (slot.role === 'DC' || slot.role === 'PIV') mappedTop = 14.0;

    return {
      top: +mappedTop.toFixed(1),
      left: slot.left,
      scale,
      z: 12 + Math.round(t * 20)
    };
  }

  /**
   * Enlaces tácticos de química oficial FIFA FUT entre posiciones
   */
  getFormationChemistryLinks(modality, formationId, slotsCount) {
    const f7Links = {
      '1-3-2-1': [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3],
        [1, 4], [2, 4], [2, 5], [3, 5],
        [4, 5],
        [4, 6], [5, 6]
      ],
      '1-2-3-1': [
        [0, 1], [0, 2],
        [1, 2],
        [1, 3], [1, 4],
        [2, 4], [2, 5],
        [3, 4], [4, 5],
        [3, 6], [4, 6], [5, 6]
      ],
      '1-3-1-2': [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3],
        [1, 4], [2, 4], [3, 4],
        [4, 5], [4, 6],
        [5, 6]
      ],
      '1-2-2-2': [
        [0, 1], [0, 2],
        [1, 2],
        [1, 3], [2, 4],
        [3, 4],
        [3, 5], [4, 6],
        [5, 6]
      ],
      '1-3-3-0': [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3],
        [1, 4], [2, 5], [3, 6],
        [4, 5], [5, 6]
      ],
      '1-4-1-1': [
        [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 4],
        [2, 5], [3, 5],
        [5, 6]
      ],
      '1-1-4-1': [
        [0, 1],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 3], [3, 4], [4, 5],
        [3, 6], [4, 6]
      ]
    };

    const futsalLinks = {
      '1-1-2-1': [
        [0, 1],
        [1, 2], [1, 3],
        [2, 3],
        [2, 4], [3, 4]
      ],
      '1-2-2': [
        [0, 1], [0, 2],
        [1, 2],
        [1, 3], [2, 4],
        [3, 4]
      ],
      '1-3-0': [
        [0, 2],
        [1, 2], [2, 3],
        [1, 4], [2, 4], [3, 4]
      ]
    };

    const catalog = modality === 'f7' ? f7Links : futsalLinks;
    if (catalog[formationId]) return catalog[formationId];

    const fallback = [];
    for (let i = 0; i < slotsCount - 1; i++) {
      fallback.push([i, i + 1]);
    }
    return fallback;
  }

  getActiveSlotRole(index) {
    const settings = store.getSettings();
    const activeFormation = store.getActiveFormation();
    const conf = getFormationConfig(settings.modality, activeFormation);
    return conf?.slots[index]?.role || 'MC';
  }

  openRadialMenu(index, pr) {
    const radial = document.getElementById('fut-radial-menu');
    if (!radial) return;

    this.activeRadialIndex = index;
    radial.style.top = `${pr.top}%`;
    radial.style.left = `${pr.left}%`;
    radial.classList.remove('hidden');

    const starting = store.getStartingLineup();
    const starter = starting[index];
    if (!starter) return;

    // Configurar acciones del menú radial de consola
    const btnSub = document.getElementById('btn-radial-sub');
    const btnInspect = document.getElementById('btn-radial-inspect');
    const btnCaptain = document.getElementById('btn-radial-captain');
    const btnCancel = document.getElementById('btn-radial-cancel');

    if (btnSub) {
      btnSub.onclick = (e) => {
        e.stopPropagation();
        this.closeRadialMenu(false);
        this.openSubDrawer(index);
      };
    }

    if (btnInspect) {
      btnInspect.onclick = (e) => {
        e.stopPropagation();
        this.closeRadialMenu(true);
        this.inspectPlayer(starter.id);
      };
    }

    if (btnCaptain) {
      btnCaptain.onclick = (e) => {
        e.stopPropagation();
        store.setSpecialist('captain', starter.id);
        futAudio.playSuccess();
        this.showToast(`${starter.nickname} nombrado Capitán`, 'crown');
        this.closeRadialMenu(true);
      };
    }

    if (btnCancel) {
      btnCancel.onclick = (e) => {
        e.stopPropagation();
        this.closeRadialMenu(true);
      };
    }
  }

  closeRadialMenu(resetSelection = true) {
    const radial = document.getElementById('fut-radial-menu');
    if (radial) radial.classList.add('hidden');
    this.activeRadialIndex = null;
    if (resetSelection) {
      this.selectedStarterIndex = null;
      this.renderPitch();
    }
  }

  openSubDrawer(starterIndex = null) {
    const drawer = document.getElementById('fut-sub-drawer');
    const list = document.getElementById('sub-drawer-bench-list');
    const targetTag = document.getElementById('sub-drawer-target-player');
    if (!drawer || !list) return;

    const starting = store.getStartingLineup();
    const effectiveIndex = starterIndex !== null ? starterIndex : (this.selectedStarterIndex !== null ? this.selectedStarterIndex : 0);
    const starter = starting[effectiveIndex];
    const role = this.getActiveSlotRole(effectiveIndex);

    if (targetTag && starter) {
      targetTag.textContent = `Cambiar a ${starter.nickname || starter.name} (${role})`;
    } else if (targetTag) {
      targetTag.textContent = 'Banquillo de Suplentes';
    }

    const allPlayers = store.getPlayers();
    const startingIds = new Set(starting.map(p => p.id));
    const seenBenchNames = new Set(starting.map(p => (p.nickname || p.name || '').toLowerCase().trim()));
    const seenBenchEmails = new Set(starting.map(p => (p.email || '').toLowerCase().trim()).filter(Boolean));
    const bench = [];

    for (const p of allPlayers) {
      if (startingIds.has(p.id)) continue;
      const email = (p.email || '').toLowerCase().trim();
      const name = (p.nickname || p.name || '').toLowerCase().trim();
      if (email && seenBenchEmails.has(email)) continue;
      if (name && seenBenchNames.has(name)) continue;
      if (email) seenBenchEmails.add(email);
      if (name) seenBenchNames.add(name);
      bench.push(p);
    }

    const sideBenchCount = document.getElementById('side-bench-count');
    if (sideBenchCount) sideBenchCount.textContent = bench.length;

    if (bench.length === 0) {
      list.innerHTML = `<div class="text-xs text-slate-400 col-span-full py-4 text-center font-bold">No hay suplentes disponibles en el banquillo. ¡Añade más fichajes al club!</div>`;
    } else {
      list.innerHTML = bench.map(p => {
        let fitText = '<i data-lucide="x" class="w-3 h-3 inline"></i> Fuera de Puesto';
        let fitColor = 'text-rose-300 bg-rose-950/60 border border-rose-500/40';
        if (p.rolesHierarchy) {
          if (p.rolesHierarchy.best === role) {
            fitText = '<i data-lucide="check" class="w-3 h-3 inline"></i> Posición Principal';
            fitColor = 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/40';
          } else if (p.rolesHierarchy.second === role || p.rolesHierarchy.third === role) {
            fitText = '<i data-lucide="minus" class="w-3 h-3 inline"></i> Posición Secundaria';
            fitColor = 'text-amber-300 bg-amber-950/60 border border-amber-500/40';
          }
        }

        return `
          <div class="sub-bench-card" onclick="window.futApp.selectBench('${p.id}')">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 bg-slate-900 border-2 border-amber-400/80 flex flex-col items-center justify-center font-fifa text-amber-300 font-bold shadow-md flex-shrink-0" style="clip-path: polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%);">
                <span class="text-[8px] text-slate-400 leading-none">DOR</span>
                <span class="text-base leading-none text-white font-black">#${p.number || 10}</span>
              </div>
              <div>
                <div class="text-xs font-black text-white leading-tight font-fifa text-base tracking-wide">${p.name}</div>
                <div class="text-[10px] ${fitColor} px-1.5 py-0.5  font-bold inline-block mt-0.5">${fitText}</div>
                <div class="text-[9px] text-slate-400 font-semibold mt-0.5">Facultad: ${p.faculty.toUpperCase()} • ${p.preferredFoot}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-fifa text-2xl font-bold text-amber-400 leading-none">${p.rating}</div>
              <span class="inline-block mt-1 text-[9px] uppercase px-2 py-0.5  bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-sm">Dar Relevo</span>
            </div>
          </div>
        `;
      }).join('');
    }

    this.refreshIcons();
    drawer.classList.add('drawer-open');
  }

  closeSubDrawer() {
    const drawer = document.getElementById('fut-sub-drawer');
    if (drawer) drawer.classList.remove('drawer-open');
    this.closeRadialMenu(true);
  }

  // Navegación espacial con flechas de dirección (D-Pad / Joystick EA Sports)
  navigatePitchDirection(dir) {
    const settings = store.getSettings();
    const activeFormation = store.getActiveFormation();
    const conf = getFormationConfig(settings.modality, activeFormation);
    if (!conf || !conf.slots || conf.slots.length === 0) return;

    let currentIdx = this.selectedStarterIndex;
    if (currentIdx === null || currentIdx === undefined || currentIdx < 0 || currentIdx >= conf.slots.length) {
      currentIdx = 0;
    }

    const currentSlot = conf.slots[currentIdx];
    const currentTop = currentSlot.top;
    const currentLeft = currentSlot.left;

    let bestIdx = null;
    let bestScore = Infinity;

    conf.slots.forEach((slot, idx) => {
      if (idx === currentIdx) return;
      const dTop = slot.top - currentTop;
      const dLeft = slot.left - currentLeft;

      let inDirection = false;
      let primaryDist = 0;
      let perpDist = 0;

      if (dir === 'up') {
        inDirection = dTop < -3;
        primaryDist = -dTop;
        perpDist = Math.abs(dLeft);
      } else if (dir === 'down') {
        inDirection = dTop > 3;
        primaryDist = dTop;
        perpDist = Math.abs(dLeft);
      } else if (dir === 'left') {
        inDirection = dLeft < -3;
        primaryDist = -dLeft;
        perpDist = Math.abs(dTop);
      } else if (dir === 'right') {
        inDirection = dLeft > 3;
        primaryDist = dLeft;
        perpDist = Math.abs(dTop);
      }

      if (inDirection) {
        const score = primaryDist + 1.8 * perpDist;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = idx;
        }
      }
    });

    if (bestIdx !== null) {
      this.selectedStarterIndex = bestIdx;
      const starting = store.getStartingLineup();
      if (starting[bestIdx]) {
        this.updatePlayerInspector(starting[bestIdx]);
      }
      this.renderPitch();
      futAudio.playNav();
    }
  }

  selectStarter(index) {
    futAudio.playCardSelect();

    if (this.selectedStarterIndex === null || this.selectedStarterIndex === index) {
      this.selectedStarterIndex = index;
      const starting = store.getStartingLineup();
      if (starting[index]) {
        this.updatePlayerInspector(starting[index]);
      }
      this.renderPitch();
      const settings = store.getSettings();
      const activeFormation = store.getActiveFormation();
      const conf = getFormationConfig(settings.modality, activeFormation);
      const slot = conf?.slots[index] || { top: 50, left: 50 };
      const pr = this.projectSlot(slot);

      if (this.activeRadialIndex === index) {
        this.closeRadialMenu(true);
      } else {
        this.openRadialMenu(index, pr);
        this.showToast('Acciones tácticas de jugador activas', 'sliders-horizontal');
      }
    } else {
      const starting = store.getStartingLineup();
      const p1 = starting[this.selectedStarterIndex];
      const p2 = starting[index];
      if (p1 && p2) {
        store.swapTwoStarters(this.selectedStarterIndex, index);
        futAudio.playCardSwap();
        this.showToast(`Intercambiados ${p1.nickname || p1.name} y ${p2.nickname || p2.name}`, 'repeat');
      }
      this.closeSubDrawer();
    }
  }

  selectBench(benchPlayerId) {
    if (this.selectedStarterIndex !== null) {
      const starting = store.getStartingLineup();
      const replaced = starting[this.selectedStarterIndex];
      const incoming = store.getPlayerById(benchPlayerId);
      store.swapStartingPlayer(this.selectedStarterIndex, benchPlayerId);
      futAudio.playCardSwap();
      this.closeSubDrawer();
      this.showToast(`Entra ${incoming?.nickname || 'Jugador'} por ${replaced?.nickname || 'Jugador'}`, 'repeat');
    } else {
      futAudio.playCardSelect();
      this.inspectPlayer(benchPlayerId);
    }
  }

  // ==================== CINEMÁTICA WALKOUT FIFA FUT ====================
  triggerWalkout(player) {
    const overlay = document.getElementById('fut-walkout-overlay');
    if (!overlay) return;

    const fac = FACULTIES.find(f => f.id === player.faculty) || FACULTIES[0];
    const crestStep = document.getElementById('walkout-crest-step');
    const posStep = document.getElementById('walkout-pos-step');
    const cardStep = document.getElementById('walkout-card-step');
    const cardHost = document.getElementById('walkout-card-host');
    const ticker = document.getElementById('walkout-rating-ticker');
    const nameTag = document.getElementById('walkout-player-nickname');

    // Resetear visibilidad de pasos
    crestStep.classList.remove('hidden');
    posStep.classList.add('hidden');
    cardStep.classList.add('hidden');

    document.getElementById('walkout-crest-icon').textContent = fac.icon;
    document.getElementById('walkout-crest-name').textContent = fac.name.toUpperCase();
    document.getElementById('walkout-pos-pill').textContent = player.rolesHierarchy ? player.rolesHierarchy.best : 'DC';

    overlay.classList.remove('hidden');
    futAudio.playWalkoutExplosion();

    // Paso 2: Revelar Posición a los 750ms
    setTimeout(() => {
      crestStep.classList.add('hidden');
      posStep.classList.remove('hidden');
      futAudio.playCardSelect();
    }, 750);

    // Paso 3: Revelar Carta y Ticker a los 1500ms
    setTimeout(() => {
      posStep.classList.add('hidden');
      cardStep.classList.remove('hidden');

      cardHost.innerHTML = this.renderFutCard(player, { size: 'walkout' });

      nameTag.textContent = (player.nickname || player.name).toUpperCase();

      // Animación del Ticker de Media (Rating counter)
      let currentVal = Math.max(40, player.rating - 24);
      ticker.textContent = currentVal;
      const targetVal = player.rating;
      const interval = setInterval(() => {
        if (currentVal < targetVal) {
          currentVal++;
          ticker.textContent = currentVal;
          futAudio.playRatingTick();
        } else {
          clearInterval(interval);
          futAudio.playFanfare();
        }
      }, 35);
    }, 1500);

    // Cerrar Walkout
    document.getElementById('btn-close-walkout').onclick = () => {
      overlay.classList.add('hidden');
      futAudio.playSuccess();
      this.renderAll();
    };
  }

  // ==================== ÁLBUM DE CARTAS (PATRÓN LINEAR / EA SPORTS) ====================
  renderAlbumCards() {
    const grid = document.getElementById('album-cards-grid');
    const emptyState = document.getElementById('album-empty-state');
    const countBadge = document.getElementById('album-count-badge');
    if (!grid) return;

    let players = store.getPlayers();

    // 1. Filtrado por texto de búsqueda (Linear instant search)
    const query = (this.albumSearchQuery || '').toLowerCase().trim();
    if (query) {
      players = players.filter(p => {
        const name = (p.name || '').toLowerCase();
        const nick = (p.nickname || '').toLowerCase();
        const num = String(p.number || '');
        const role = (p.rolesHierarchy?.best || p.position || '').toLowerCase();
        return name.includes(query) || nick.includes(query) || num.includes(query) || role.includes(query);
      });
    }

    // 2. Filtrado por Línea / Posición
    const roleFilter = this.albumRoleFilter || 'all';
    if (roleFilter !== 'all') {
      players = players.filter(p => {
        const bestRole = p.rolesHierarchy?.best || p.position || '';
        if (roleFilter === 'DC') return ['DC', 'SD', 'EI', 'ED', 'PIV'].includes(bestRole);
        if (roleFilter === 'MC') return ['MC', 'MCO', 'MCD', 'MI', 'MD', 'ALA', 'ALI', 'ALD'].includes(bestRole);
        if (roleFilter === 'DFC') return ['DFC', 'LI', 'LD', 'CIE'].includes(bestRole);
        if (roleFilter === 'POR') return bestRole === 'POR';
        return true;
      });
    }

    // 3. Ordenación
    const sortBy = this.albumSortBy || 'ovr-desc';
    players.sort((a, b) => {
      if (sortBy === 'ovr-desc') return (b.rating || 75) - (a.rating || 75);
      if (sortBy === 'ovr-asc') return (a.rating || 75) - (b.rating || 75);
      if (sortBy === 'dorsal-asc') return (a.number || 99) - (b.number || 99);
      if (sortBy === 'name-asc') return (a.nickname || a.name || '').localeCompare(b.nickname || b.name || '');
      return 0;
    });

    if (countBadge) {
      countBadge.textContent = `${players.length} CROMO${players.length === 1 ? '' : 'S'}`;
    }

    if (players.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = players.map(p => {
      const fac = FACULTIES.find(f => f.id === p.faculty) || FACULTIES[0];

      return `
        <div class="fifa-tile p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-xl transition group relative overflow-hidden">
          <div class="fifa-tile-accent-bar mb-2"></div>
          <div class="flex items-center justify-center mb-4">
            ${this.renderFutCard(p, { size: 'album' })}
          </div>

          <div class="space-y-1.5 text-xs bg-slate-950/70 p-3  border border-white/10 mb-3">
            <div class="flex items-center justify-between text-emerald-400 font-bold">
              <span class="flex items-center gap-1.5 text-[11px]"><i data-lucide="award" class="w-3.5 h-3.5 text-emerald-400"></i> Principal:</span>
              <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.best}</span>
            </div>
            <div class="flex items-center justify-between text-sky-400 font-bold">
              <span class="flex items-center gap-1.5 text-[11px]"><i data-lucide="arrow-right-circle" class="w-3.5 h-3.5 text-sky-400"></i> Segunda:</span>
              <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.second}</span>
            </div>
            <div class="flex items-center justify-between text-amber-400 font-bold">
              <span class="flex items-center gap-1.5 text-[11px]"><i data-lucide="circle-dot" class="w-3.5 h-3.5 text-amber-400"></i> Alternativa:</span>
              <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.third}</span>
            </div>
            <div class="flex items-center justify-between text-rose-400 font-bold">
              <span class="flex items-center gap-1.5 text-[11px]"><i data-lucide="x-circle" class="w-3.5 h-3.5 text-rose-400"></i> Menos Favorable:</span>
              <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.worst}</span>
            </div>
          </div>

          <button onclick="window.futApp.inspectPlayer('${p.id}')" class="w-full py-2.5  bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Ver Ficha Técnica Completa</span>
          </button>
        </div>
      `;
    }).join('');

    this.refreshIcons();
  }

  // ==================== INSPECCIONAR JUGADOR ====================
  inspectPlayer(playerId) {
    const p = store.getPlayerById(playerId);
    if (!p) return;

    const fac = FACULTIES.find(f => f.id === p.faculty) || FACULTIES[0];
    const content = document.getElementById('inspect-card-content');
    if (!content) return;

    const ps = p.playStyle || 'finesse';
    const chem = p.chemStyle || 'HUN';
    const sm = p.skillMoves || 4;
    const wf = p.weakFoot || 4;
    const celeb = p.celebration || 'siuuu';
    const kitColor = p.kitColor || '#f0be2a';

    content.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/90 p-4 border border-slate-700/80">
        <div class="flex-shrink-0">
          ${this.renderFutCard(p, { size: 'inspect' })}
        </div>
        <div class="flex-1 space-y-2 text-center sm:text-left w-full">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h4 class="font-fifa text-3xl font-bold text-white uppercase tracking-wider">${p.name}</h4>
            <span class="text-xs px-2.5 py-0.5 bg-amber-400 text-slate-950 font-fifa text-base font-black shadow-sm">${p.rating} OVR</span>
          </div>
          <p class="text-xs text-slate-400 font-bold">"${p.nickname}" • Dorsal #${p.number} • ${p.preferredFoot}</p>
          <p class="text-xs text-cyan-400 font-bold">${fac.icon} ${fac.name}</p>
          
          <!-- Badges de Personalización FIFA FC 25 -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 font-fifa">
              ${this.getPlayStyleIcon(ps)} PLAYSTYLE: ${this.getPlayStyleLabel(ps)}
            </span>
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 font-fifa">
              QUÍMICA: ${chem}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-slate-300">
            <div class="bg-slate-950/80 p-1.5 border border-slate-800">
              <span class="text-[9px] uppercase text-slate-500 block">Filigranas / Regate:</span>
              <span class="font-fifa text-amber-400 text-sm">${sm} ★★★★★</span>
            </div>
            <div class="bg-slate-950/80 p-1.5 border border-slate-800">
              <span class="text-[9px] uppercase text-slate-500 block">Pierna Mala:</span>
              <span class="font-fifa text-amber-400 text-sm">${wf} ★★★★★</span>
            </div>
          </div>

          <div class="bg-slate-950/80 p-2 border border-slate-800 text-[10px] space-y-0.5">
            <div><span class="text-slate-500 uppercase font-fifa">Celebración:</span> <span class="text-white font-bold">${celeb.toUpperCase()}</span></div>
            <div><span class="text-slate-500 uppercase font-fifa">Equipación Club:</span> <span class="inline-block w-3 h-3 align-middle border border-white" style="background-color: ${kitColor};"></span> <span class="text-white font-bold">${kitColor} (${p.kitCollar || 'Redondo'})</span></div>
          </div>
        </div>
      </div>

      <div class="bg-slate-900/90 p-4 border border-slate-700/80 space-y-2">
        <h5 class="text-[10px] font-black uppercase text-amber-400 font-fifa tracking-wider">AFINIDAD DE POSICIONES (ROLES TÁCTICOS)</h5>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-emerald-950/40 border border-emerald-500/50">
            <span class="block text-[10px] text-emerald-400 font-black uppercase">1º Principal</span>
            <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.best}</span>
          </div>
          <div class="p-2.5 bg-sky-950/40 border border-sky-500/50">
            <span class="block text-[10px] text-sky-400 font-black uppercase">2º Secundaria</span>
            <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.second}</span>
          </div>
          <div class="p-2.5 bg-amber-950/40 border border-amber-500/50">
            <span class="block text-[10px] text-amber-400 font-black uppercase">3º Alternativa</span>
            <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.third}</span>
          </div>
          <div class="p-2.5 bg-rose-950/40 border border-rose-500/50">
            <span class="block text-[10px] text-rose-400 font-black uppercase">4º Menos Favorable</span>
            <span class="font-black text-white font-fifa text-base">${p.rolesHierarchy.worst}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2 bg-slate-900/90 p-4 border border-slate-700/80">
        <h5 class="text-[10px] font-black uppercase text-amber-400 font-fifa tracking-wider">ATRIBUTOS OFICIALES FIFA</h5>
        ${this.renderStatBar('Ritmo (PAC)', p.stats.pac)}
        ${this.renderStatBar('Tiro (SHO)', p.stats.sho)}
        ${this.renderStatBar('Pase (PAS)', p.stats.pas)}
        ${this.renderStatBar('Regate (DRI)', p.stats.dri)}
        ${this.renderStatBar('Defensa (DEF)', p.stats.def)}
        ${this.renderStatBar('Físico (PHY)', p.stats.phy)}
      </div>

      <div class="text-xs text-slate-400 flex items-center justify-between px-1 font-medium">
        <span>Matrícula: <strong class="text-white">${p.studentId || 'UNI-Pendiente'}</strong></span>
        <span>Teléfono: <strong class="text-white">${p.phone || 'Privado'}</strong></span>
      </div>

      <div class="admin-only pt-3 border-t border-white/10 flex justify-end gap-2">
        <button onclick="window.futApp.deletePlayer('${p.id}')" class="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-black border border-rose-500/40 transition cursor-pointer">
          Eliminar de Plantilla
        </button>
      </div>
    `;

    document.getElementById('player-inspect-dialog').showModal();
    this.refreshIcons();
  }

  deletePlayer(playerId) {
    const p = store.getPlayerById(playerId);
    if (confirm(`¿Eliminar al jugador ${p?.name || ''} de la plantilla?`)) {
      store.deletePlayer(playerId);
      document.getElementById('player-inspect-dialog')?.close();
      this.showToast('Jugador eliminado', 'trash-2');
    }
  }

  renderStatBar(label, value) {
    const color = value >= 80 ? 'bg-emerald-400' : (value >= 70 ? 'bg-amber-400' : 'bg-rose-400');
    return `
      <div>
        <div class="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
          <span>${label}</span>
          <span class="font-black tabular-nums text-white font-fifa text-sm">${value}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-800  overflow-hidden">
          <div class="h-full ${color}  shadow-sm" style="width: ${value}%;"></div>
        </div>
      </div>
    `;
  }

  // ==================== PARTIDOS & ASISTENCIA BROADCAST EA SPORTS ====================
  renderMatches() {
    const container = document.getElementById('matches-container');
    const details = document.getElementById('next-match-details');
    const breakdown = document.getElementById('attendance-breakdown');
    if (!container) return;

    const nextMatch = store.getNextMatch();
    const settings = store.getSettings();
    const players = store.getPlayers();

    const crestMap = {
      shield_gold: '🛡️',
      crest_leones: '🦁',
      crest_rayo: '⚡',
      crest_lobos: '🐺',
      crest_dragones: '🐉',
      crest_aguilas: '🦅'
    };

    const homeCrest = crestMap[settings.crest] || '🛡️';
    const homeCrestEl = document.getElementById('featured-home-crest');
    if (homeCrestEl) homeCrestEl.textContent = homeCrest;

    const homeNameEl = document.getElementById('featured-home-name');
    if (homeNameEl) homeNameEl.textContent = settings.teamName || 'FURIA RECTOR FC';

    const awayNameEl = document.getElementById('featured-away-name');
    const awayCrestEl = document.getElementById('featured-away-crest');
    const timeChipEl = document.getElementById('next-match-time-chip');
    const statusBadgeEl = document.getElementById('featured-match-status-badge');

    if (nextMatch) {
      if (awayNameEl) awayNameEl.textContent = nextMatch.rival;
      if (awayCrestEl) awayCrestEl.textContent = nextMatch.rival?.includes('Ingenier') ? '🦁' : (nextMatch.rival?.includes('Medicin') ? '⚡' : '🐺');
      if (timeChipEl) timeChipEl.textContent = `${nextMatch.time} H`;
      if (details) {
        details.innerHTML = `
          <span>📅 ${nextMatch.date} a las ${nextMatch.time}h</span>
          <span class="mx-1.5 opacity-60">•</span>
          <span>📍 ${nextMatch.field}</span>
          <span class="mx-1.5 opacity-60">•</span>
          <span class="text-amber-400 font-bold">${nextMatch.modality === 'f7' ? 'FÚTBOL 7' : 'FÚTBOL SALA'}</span>
        `;
      }
      if (statusBadgeEl) {
        statusBadgeEl.textContent = nextMatch.status === 'finalizado' ? 'PARTIDO FINALIZADO' : 'CONVOCATORIA OFICIAL ABIERTA';
      }

      // Comprobar voto de asistencia del usuario
      const user = authService.getCurrentUser();
      const userId = user ? (user.playerId || user.uid) : 'p4';
      const userVote = nextMatch.lineup?.convocatoria ? nextMatch.lineup.convocatoria[userId] : null;

      document.querySelectorAll('.fifa-console-vote-btn').forEach(btn => btn.classList.remove('is-voted'));
      if (userVote === 'asistira') document.querySelector('.fifa-vote-yes')?.classList.add('is-voted');
      else if (userVote === 'duda') document.querySelector('.fifa-vote-maybe')?.classList.add('is-voted');
      else if (userVote === 'no_puede') document.querySelector('.fifa-vote-no')?.classList.add('is-voted');

      // Desglose de Convocatoria en 3 Columnas Broadcast
      if (breakdown) {
        const convocatoria = (nextMatch.lineup && nextMatch.lineup.convocatoria) ? nextMatch.lineup.convocatoria : {};
        const confirmed = [];
        const doubts = [];
        const absent = [];

        players.forEach(p => {
          const vote = convocatoria[p.id];
          if (vote === 'asistira') confirmed.push(p);
          else if (vote === 'duda') doubts.push(p);
          else if (vote === 'no_puede') absent.push(p);
        });

        const renderChips = (list) => {
          if (list.length === 0) return '<span class="text-xs text-slate-500 font-normal italic">Sin jugadores registrados</span>';
          return list.map(p => `
            <div class="fifa-player-chip" title="${p.name} (${p.faculty})">
              <span class="fifa-chip-dorsal font-fifa">#${p.number}</span>
              <span class="font-fifa">${p.nickname || p.name}</span>
              <span class="fifa-chip-role font-fifa">${p.rolesHierarchy?.best || 'MC'}</span>
            </div>
          `).join('');
        };

        breakdown.innerHTML = `
          <div class="fifa-roster-column fifa-roster-col--confirmed">
            <div class="fifa-roster-col-head">
              <span class="fifa-roster-col-title font-fifa text-emerald-400">
                <i data-lucide="check-circle" class="w-4 h-4"></i> CONFIRMADOS
              </span>
              <span class="fifa-roster-count bg-emerald-500 text-slate-950 font-fifa">${confirmed.length}</span>
            </div>
            <div class="fifa-player-chip-list">
              ${renderChips(confirmed)}
            </div>
          </div>

          <div class="fifa-roster-column fifa-roster-col--doubts">
            <div class="fifa-roster-col-head">
              <span class="fifa-roster-col-title font-fifa text-amber-400">
                <i data-lucide="help-circle" class="w-4 h-4"></i> EN DUDA
              </span>
              <span class="fifa-roster-count bg-amber-500 text-slate-950 font-fifa">${doubts.length}</span>
            </div>
            <div class="fifa-player-chip-list">
              ${renderChips(doubts)}
            </div>
          </div>

          <div class="fifa-roster-column fifa-roster-col--absent">
            <div class="fifa-roster-col-head">
              <span class="fifa-roster-col-title font-fifa text-rose-400">
                <i data-lucide="x-circle" class="w-4 h-4"></i> BAJAS
              </span>
              <span class="fifa-roster-count bg-rose-500 text-white font-fifa">${absent.length}</span>
            </div>
            <div class="fifa-player-chip-list">
              ${renderChips(absent)}
            </div>
          </div>
        `;
      }
    } else {
      if (details) details.textContent = 'No hay partidos programados en el calendario';
    }

    // Render Calendario de Jornadas
    const matches = store.getMatches();
    container.innerHTML = matches.map((m, idx) => {
      const isFinished = m.status === 'finalizado';
      return `
        <div class="fifa-fixture-tile">
          <div class="fifa-fixture-left">
            <span class="fifa-fixture-jornada-pill font-fifa">JORNADA ${idx + 1}</span>
            <div>
              <div class="fifa-fixture-teams-row">
                <span class="fifa-fixture-team-name font-fifa">${settings.teamName}</span>
                ${isFinished 
                  ? `<span class="fifa-fixture-score-box font-fifa">${m.goalsFor} - ${m.goalsAgainst}</span>` 
                  : `<span class="fifa-fixture-vs-text font-fifa">VS</span>`
                }
                <span class="fifa-fixture-team-name font-fifa">${m.rival}</span>
              </div>
              <div class="fifa-fixture-meta font-fifa">
                <span>📅 ${m.date} - ${m.time}h</span>
                <span>📍 ${m.field}</span>
                <span class="text-amber-400">${m.modality === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'}</span>
                ${m.scorers ? `<span class="text-emerald-400">⚽ ${m.scorers}</span>` : ''}
                ${isFinished && m.mvp ? `<span class="text-amber-300">★ MVP: ${m.mvp}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="fifa-fixture-right">
            <span class="fifa-fixture-status ${isFinished ? 'fifa-fixture-status--final' : 'fifa-fixture-status--upcoming'} font-fifa">
              ${isFinished ? 'FINALIZADO' : 'PROGRAMADO'}
            </span>

            <button onclick="window.futApp.openResultModal('${m.id}')" class="admin-only fifa-broadcast-action-btn font-fifa !py-1 !px-2.5 !text-xs" title="${isFinished ? 'Editar Acta' : 'Registrar Resultado'}">
              <span>${isFinished ? 'EDITAR ACTA' : 'REGISTRAR'}</span>
            </button>
            <button onclick="window.futApp.openMatchModal('${m.id}')" class="admin-only p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer" title="Editar Partido">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.futApp.deleteMatch('${m.id}')" class="admin-only p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer" title="Eliminar Partido">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  voteAttendance(status) {
    const user = authService.getCurrentUser();
    if (!user) {
      document.getElementById('login-dialog').showModal();
      return;
    }

    const nextMatch = store.getNextMatch();
    if (!nextMatch) {
      this.showToast('No hay partido próximo programado.', 'alert-triangle');
      return;
    }

    const playerId = user.playerId || (store.getPlayers()[0]?.id);
    store.setAttendance(nextMatch.id, playerId, status);
    futAudio.playSelect();
    const text = status === 'asistira' ? 'Asistencia confirmada ✓' : (status === 'duda' ? 'Marcado como duda ?' : 'Baja confirmada ✕');
    this.showToast(text, status === 'asistira' ? 'check-circle-2' : (status === 'duda' ? 'help-circle' : 'x-circle'));
    this.renderMatches();
  }

  // ==================== MI CLUB: CENTRO DE GESTIÓN Y PERSONALIZACIÓN ====================
  renderClubHub() {
    const settings = store.getSettings();

    // 1. Inputs de Identidad
    const setTeam = document.getElementById('set-team-name');
    if (setTeam && document.activeElement !== setTeam) setTeam.value = settings.teamName || 'Furia Rector FC';

    const setShort = document.getElementById('set-short-name');
    if (setShort && document.activeElement !== setShort) setShort.value = settings.shortName || 'FUR';

    const setTour = document.getElementById('set-tournament-name');
    if (setTour && document.activeElement !== setTour) setTour.value = settings.tournament || 'Torneo del Rector 2026';

    const setSlogan = document.getElementById('set-club-slogan');
    if (setSlogan && document.activeElement !== setSlogan) setSlogan.value = settings.slogan || '¡Hasta el último minuto!';

    // 2. Escudos Oficiales
    const crestsGrid = document.getElementById('club-crests-grid');
    const setCrest = document.getElementById('set-club-crest');
    if (crestsGrid) {
      const crests = [
        { id: 'shield_gold', icon: '🛡️', name: 'Furia Rector', subtitle: 'Imperial' },
        { id: 'crest_leones', icon: '🦁', name: 'Leones UCM', subtitle: 'Politécnica' },
        { id: 'crest_rayo', icon: '⚡', name: 'Rayo FC', subtitle: 'Medicina' },
        { id: 'crest_lobos', icon: '🐺', name: 'Lobos Campus', subtitle: 'Ciencias' },
        { id: 'crest_dragones', icon: '🐉', name: 'Dragones Tech', subtitle: 'Informática' },
        { id: 'crest_aguilas', icon: '🦅', name: 'Águilas Ley', subtitle: 'Derecho' }
      ];

      const activeCrest = settings.crest || 'shield_gold';
      if (setCrest) setCrest.value = activeCrest;

      crestsGrid.innerHTML = crests.map(c => {
        const isActive = c.id === activeCrest;
        return `
          <div class="fifa-crest-card ${isActive ? 'is-active-crest' : ''}" onclick="window.futApp.selectClubCrest('${c.id}')">
            <span class="fifa-crest-icon">${c.icon}</span>
            <span class="fifa-crest-name font-fifa">${c.name}</span>
            <span class="fifa-crest-pill font-fifa">${isActive ? '★ ACTIVO' : c.subtitle}</span>
          </div>
        `;
      }).join('');
    }

    // 3. Equipación Oficial
    const kitPrimary = document.getElementById('set-kit-primary');
    const kitSecondary = document.getElementById('set-kit-secondary');
    const hexPrimary = document.getElementById('kit-primary-hex');
    const hexSecondary = document.getElementById('kit-secondary-hex');

    const primaryColor = settings.kitColor || '#f8fafc';
    const secondaryColor = settings.kitSecondary || '#f0be2a';

    if (kitPrimary && document.activeElement !== kitPrimary) kitPrimary.value = primaryColor;
    if (hexPrimary) hexPrimary.textContent = primaryColor;
    if (kitSecondary && document.activeElement !== kitSecondary) kitSecondary.value = secondaryColor;
    if (hexSecondary) hexSecondary.textContent = secondaryColor;

    this.updateKitPreview(primaryColor, secondaryColor);

    // 4. Estadios Oficiales
    const stadiumsList = document.getElementById('club-stadiums-list');
    const setStadium = document.getElementById('set-club-stadium');
    if (stadiumsList) {
      const stadiums = [
        { id: 'campus_sur', icon: '🏟️', name: 'Estadio Campus Sur', desc: 'Césped Natural Híbrido • Capacidad: 3.500 • Focos LED TV', tag: 'SEDE PRINCIPAL' },
        { id: 'pabellon_rector', icon: '🏟️', name: 'Pabellón Rector Central', desc: 'Parquet Técnico Pro • Capacidad: 1.800 • Climatizado', tag: 'FUTSAL PRO' },
        { id: 'arena_poli', icon: '🏟️', name: 'Arena Polideportiva Universitaria', desc: 'Grada Completa 360° • Capacidad: 5.000 • Tifos Ultras', tag: 'ALTO IMPACTO' },
        { id: 'sintetico_4g', icon: '🏟️', name: 'Campo Césped Sintético 4G', desc: 'Superficie Rápida • Capacidad: 1.200 • Velocidad', tag: 'ALTA VELOCIDAD' }
      ];

      const activeStadium = settings.stadium || 'campus_sur';
      if (setStadium) setStadium.value = activeStadium;

      stadiumsList.innerHTML = stadiums.map(s => {
        const isActive = s.id === activeStadium;
        return `
          <div class="fifa-option-item ${isActive ? 'is-active-option' : ''}" onclick="window.futApp.selectClubStadium('${s.id}')">
            <div class="fifa-option-left">
              <span class="fifa-option-icon">${s.icon}</span>
              <div>
                <span class="fifa-option-name font-fifa">${s.name}</span>
                <p class="fifa-option-desc font-fifa">${s.desc}</p>
              </div>
            </div>
            <span class="fifa-option-tag font-fifa">${isActive ? '★ LOCAL' : s.tag}</span>
          </div>
        `;
      }).join('');
    }

    // 5. Balones Oficiales
    const ballsList = document.getElementById('club-balls-list');
    const setBall = document.getElementById('set-club-ball');
    if (ballsList) {
      const balls = [
        { id: 'nike_flight', icon: '⚽', name: 'Nike Flight Elite Pro', desc: 'Ranuras moldeadas Aerowsculpt para trayectoria precisa', tag: 'OFICIAL MATCH' },
        { id: 'adidas_oceaunz', icon: '⚽', name: 'Adidas Oceaunz Pro Competición', desc: 'Superficie termosellada sin costuras con textura Speedshell', tag: 'FIFA QUALITY PRO' },
        { id: 'puma_orbita', icon: '⚽', name: 'Puma Orbita Serie A FIFA', desc: 'Configuración única de 12 paneles para aerodinámica pura', tag: 'PROFESIONAL' }
      ];

      const activeBall = settings.ball || 'nike_flight';
      if (setBall) setBall.value = activeBall;

      ballsList.innerHTML = balls.map(b => {
        const isActive = b.id === activeBall;
        return `
          <div class="fifa-option-item ${isActive ? 'is-active-option' : ''}" onclick="window.futApp.selectClubBall('${b.id}')">
            <div class="fifa-option-left">
              <span class="fifa-option-icon">${b.icon}</span>
              <div>
                <span class="fifa-option-name font-fifa">${b.name}</span>
                <p class="fifa-option-desc font-fifa">${b.desc}</p>
              </div>
            </div>
            <span class="fifa-option-tag font-fifa">${isActive ? '★ OFICIAL' : b.tag}</span>
          </div>
        `;
      }).join('');
    }

    // 6. Especialistas a Balón Parado
    this.renderSpecialists();
  }

  updateKitPreview(primary, secondary) {
    const previewContainer = document.getElementById('club-kit-preview-silhouette');
    if (!previewContainer) return;

    previewContainer.innerHTML = `
      <svg viewBox="0 0 80 95" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full filter drop-shadow(0 4px 8px rgba(0,0,0,0.6))">
        <path d="M40 7 C33 7 28 12.5 28 19.5 C28 25.5 33 30.5 40 30.5 C47 30.5 52 25.5 52 19.5 C52 12.5 47 7 40 7 Z" fill="${secondary}" opacity="0.9"/>
        <path d="M36 29 L44 29 L45 35 L35 35 Z" fill="${secondary}" opacity="0.85"/>
        <path d="M14 42 L25 35 C29 38 34 39.5 40 39.5 C46 39.5 51 38 55 35 L66 42 L74 61 L62 65 L60 95 L20 95 L18 65 L6 61 Z" fill="${primary}" opacity="0.98"/>
        <path d="M33 36 L40 44 L47 36" stroke="${secondary}" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
      </svg>
    `;
  }

  selectClubCrest(crestId) {
    const setCrest = document.getElementById('set-club-crest');
    if (setCrest) setCrest.value = crestId;
    store.updateSettings({ crest: crestId });
    futAudio.playSelect();
    this.renderClubHub();
    this.renderMatches();
    this.showToast('Escudo oficial actualizado', 'award');
  }

  selectClubStadium(stadiumId) {
    const setStadium = document.getElementById('set-club-stadium');
    if (setStadium) setStadium.value = stadiumId;
    store.updateSettings({ stadium: stadiumId });
    futAudio.playSelect();
    this.renderClubHub();
    this.showToast('Estadio local asignado', 'map-pin');
  }

  selectClubBall(ballId) {
    const setBall = document.getElementById('set-club-ball');
    if (setBall) setBall.value = ballId;
    store.updateSettings({ ball: ballId });
    futAudio.playSelect();
    this.renderClubHub();
    this.showToast('Balón oficial seleccionado', 'circle-dot');
  }

  renderSpecialists() {
    const settings = store.getSettings();
    const players = store.getPlayers();
    const specs = [
      { id: 'captain', key: 'captain' },
      { id: 'penalties', key: 'penalties' },
      { id: 'freekicks', key: 'freeKicks' },
      { id: 'corners', key: 'corners' }
    ];

    specs.forEach(spec => {
      const el = document.getElementById(`spec-${spec.id}`);
      if (el) {
        const current = settings.specialists ? settings.specialists[spec.key] : null;
        el.innerHTML = players.map(p => `
          <option value="${p.id}" ${p.id === current ? 'selected' : ''}>#${p.number || 10} ${p.nickname || p.name} (${p.rolesHierarchy?.best || 'MC'})</option>
        `).join('');
      }
    });
  }

  quickLogin(email, pass) {
    authService.signIn(email, pass).then((res) => {
      document.getElementById('login-dialog').close();
      this.showToast(`Conectado como ${res.user.name}`, 'user-check');
    }).catch(err => alert(err.message));
  }
}

window.futApp = new FutApp();
