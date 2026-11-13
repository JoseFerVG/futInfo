/**
 * Configuración de Firebase para el Torneo del Rector
 * Proyecto: futinfo-382e8
 */

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyAmwSQoxzUakuFfxUAVLYsomRZY5t35PRI",
  authDomain: "futinfo-382e8.firebaseapp.com",
  projectId: "futinfo-382e8",
  storageBucket: "futinfo-382e8.firebasestorage.app",
  messagingSenderId: "1044543246445",
  appId: "1:1044543246445:web:37036721fe72faeb032f64",
  measurementId: "G-STQRZNJ0C0"
};

export function getActiveConfig() {
  const saved = localStorage.getItem('futinfo_firebase_config_v3');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Error leyendo config de Firebase de LocalStorage", e);
    }
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(newConfig) {
  localStorage.setItem('futinfo_firebase_config_v3', JSON.stringify(newConfig));
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem('futinfo_firebase_config_v3');
  window.location.reload();
}

export function isFirebaseConfigured(config = getActiveConfig()) {
  return config && 
         config.apiKey && 
         config.apiKey.startsWith("AIzaSy") && 
         config.projectId === "futinfo-382e8";
}

// Variables globales para Firebase SDK
export let app = null;
export let auth = null;
export let db = null;
export let isInitialized = false;

/**
 * Elimina recursivamente campos `undefined`, `NaN`, funciones o símbolos antes de enviar a Firestore.
 */
export function sanitizeForFirestore(value) {
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== undefined);
  }
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    const clean = sanitizeForFirestore(val);
    if (clean !== undefined) {
      out[key] = clean;
    }
  }
  return out;
}

/**
 * Sondea el estado real de Cloud Firestore `(default)` vía REST para detectar al instante
 * si falta crear la base de datos, si hay bloqueo de reglas o si el dispositivo está offline.
 */
export async function probeFirestoreHealth(config = getActiveConfig()) {
  if (!isFirebaseConfigured(config)) {
    return {
      state: 'unconfigured',
      code: 'unconfigured',
      message: 'Configuración de Firebase incompleta.'
    };
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 4500) : null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/teams/furia_rector_live_v2`;
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller?.signal
    });

    if (res.ok) {
      return { state: 'connected', code: 'ok', message: 'Base de datos Cloud Firestore activa.' };
    }

    let detail = '';
    try {
      const payload = await res.json();
      detail = payload?.error?.message || '';
    } catch {}

    const lower = detail.toLowerCase();
    if (res.status === 404) {
      if (lower.includes('database (default) does not exist') || lower.includes('does not exist for project')) {
        return {
          state: 'missing_db',
          code: 'not-found',
          message: `La base de datos Firestore (default) aún no existe en el proyecto ${config.projectId}.`
        };
      }
      // La base de datos existe pero este documento concreto todavía no se ha creado
      return { state: 'connected', code: 'doc-not-created', message: 'Base de datos Cloud Firestore operativa.' };
    }

    if (res.status === 403) {
      return {
        state: 'permission_denied',
        code: 'permission-denied',
        message: 'Cloud Firestore existe pero las reglas bloquean la lectura pública o falta publicar firestore.rules.'
      };
    }

    return {
      state: 'error',
      code: `http-${res.status}`,
      message: detail || `Error HTTP ${res.status} conectando con Cloud Firestore.`
    };
  } catch (err) {
    return {
      state: 'offline',
      code: err?.name === 'AbortError' ? 'timeout' : 'offline',
      message: 'Sin respuesta de Cloud Firestore (revisa tu conexión a internet).'
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function initFirebaseServices() {
  const config = getActiveConfig();

  if (!isFirebaseConfigured(config)) {
    console.info("[futInfo] Firebase no configurado.");
    return {
      isConnected: false,
      app: null,
      auth: null,
      db: null,
      health: { state: 'unconfigured', code: 'unconfigured', message: 'Firebase no configurado.' }
    };
  }

  try {
    const [{ initializeApp }, { getAuth }, { getFirestore }, health] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
      probeFirestoreHealth(config)
    ]);

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;

    if (health.state === 'connected') {
      console.info(`[Firebase] Conectado a Cloud Firestore en ${config.projectId}.`);
    } else {
      console.warn(`[Firebase] Diagnóstico Firestore (${health.state}): ${health.message}`);
    }
    return { isConnected: true, app, auth, db, health };
  } catch (error) {
    console.warn("Aviso al inicializar Firebase SDK:", error);
    return {
      isConnected: false,
      error,
      app: null,
      auth: null,
      db: null,
      health: { state: 'offline', code: error?.code || 'init-error', message: error?.message || 'Error iniciando Firebase SDK.' }
    };
  }
}
