/**
 * Configuración de Firebase para el Gestor del Torneo del Rector
 * 
 * ¿Cómo conseguir tus credenciales gratis?
 * 1. Entra en https://console.firebase.google.com/
 * 2. Crea un proyecto gratuito (Plan Spark)
 * 3. Añade una aplicación Web (ícono </>)
 * 4. Copia el objeto firebaseConfig y pégalo abajo, o guárdalo desde la app en Ajustes.
 */

// Credenciales por defecto (puedes reemplazarlas aquí o desde la pantalla de Ajustes)
export const defaultFirebaseConfig = {
  apiKey: "TU_API_KEY_DE_FIREBASE",
  authDomain: "tu-proyecto-rector.firebaseapp.com",
  projectId: "tu-proyecto-rector",
  storageBucket: "tu-proyecto-rector.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

// Cargar configuración guardada si existe
export function getActiveConfig() {
  const saved = localStorage.getItem('futinfo_firebase_config');
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
  localStorage.setItem('futinfo_firebase_config', JSON.stringify(newConfig));
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem('futinfo_firebase_config');
  window.location.reload();
}

export function isFirebaseConfigured(config = getActiveConfig()) {
  return config && 
         config.apiKey && 
         config.apiKey !== "TU_API_KEY_DE_FIREBASE" && 
         config.projectId && 
         config.projectId !== "tu-proyecto-rector";
}

// Variables globales para Firebase SDK
let app = null;
let auth = null;
let db = null;
let isInitialized = false;

export async function initFirebaseServices() {
  const config = getActiveConfig();
  
  if (!isFirebaseConfigured(config)) {
    console.info("⚡ futInfo en modo Local / Demo (Configura Firebase para sincronización en la nube)");
    return { isConnected: false, app: null, auth: null, db: null };
  }

  try {
    // Importamos dinámicamente desde el CDN oficial de Firebase v10
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;

    console.log("🔥 Firebase inicializado con éxito para el Torneo del Rector!");
    return { isConnected: true, app, auth, db };
  } catch (error) {
    console.error("Error al inicializar Firebase, usando modo Local:", error);
    return { isConnected: false, error, app: null, auth: null, db: null };
  }
}

export { app, auth, db, isInitialized };
