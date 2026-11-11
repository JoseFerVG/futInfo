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

export async function initFirebaseServices() {
  const config = getActiveConfig();
  
  if (!isFirebaseConfigured(config)) {
    console.info("⚡ futInfo en modo Local / Demo");
    return { isConnected: false, app: null, auth: null, db: null };
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;

    console.log("🔥 Firebase inicializado con éxito para el proyecto futinfo-382e8!");
    return { isConnected: true, app, auth, db };
  } catch (error) {
    console.warn("Aviso al inicializar Firebase SDK:", error);
    return { isConnected: false, error, app: null, auth: null, db: null };
  }
}
