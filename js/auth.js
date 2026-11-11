/**
 * Módulo de Autenticación
 * Integra Firebase Authentication con fallback automático a LocalStorage
 */
import { auth, isFirebaseConfigured } from './firebase-config.js';

const AUTH_USER_KEY = 'futinfo_auth_user_v1';
const AUTH_ACCOUNTS_KEY = 'futinfo_auth_accounts_v1';

// Cuentas demo predeterminadas para acceso rápido
const DEFAULT_ACCOUNTS = [
  {
    id: 'usr_admin',
    name: 'Míster José Fernando',
    email: 'mister@rector.es',
    password: 'rector2026',
    role: 'admin', // Míster / Capitán
    playerId: null
  },
  {
    id: 'usr_player_1',
    name: 'Carlos Ruiz',
    email: 'charly@rector.es',
    password: 'rector2026',
    role: 'player', // Jugador
    playerId: 'p1'
  }
];

class AuthService {
  constructor() {
    this.currentUser = null;
    this.subscribers = new Set();
    this.init();
  }

  init() {
    // Inicializar cuentas locales si no existen
    if (!localStorage.getItem(AUTH_ACCOUNTS_KEY)) {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    }

    // Restaurar sesión activa
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }

  onAuthStateChanged(callback) {
    this.subscribers.add(callback);
    callback(this.currentUser);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const cb of this.subscribers) {
      try {
        cb(this.currentUser);
      } catch (err) {
        console.error("Error en subscriber de auth:", err);
      }
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // Si Firebase está conectado, usar Firebase Auth
    if (isFirebaseConfigured() && auth) {
      try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;

        // Determinar rol (admin por defecto si coincide con mister o se guarda en perfil)
        const userObj = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          role: cleanEmail.includes('mister') || cleanEmail.includes('admin') ? 'admin' : 'player',
          isFirebase: true
        };

        this.currentUser = userObj;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        this.notify();
        return { success: true, user: userObj };
      } catch (error) {
        console.warn("Fallo login en Firebase:", error.message);
        throw new Error(this.translateFirebaseError(error.code));
      }
    }

    // Modo LocalStorage / Demo
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);

    if (found) {
      const userObj = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role || 'player',
        playerId: found.playerId || null,
        isFirebase: false
      };
      this.currentUser = userObj;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      this.notify();
      return { success: true, user: userObj };
    } else {
      throw new Error('Credenciales incorrectas. (Prueba con mister@rector.es / rector2026)');
    }
  }

  async signUp(name, email, password, role = 'player', playerId = null) {
    const cleanEmail = email.trim().toLowerCase();

    // Si Firebase está configurado
    if (isFirebaseConfigured() && auth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(userCredential.user, { displayName: name });

        const userObj = {
          id: userCredential.user.uid,
          name: name,
          email: cleanEmail,
          role: role,
          playerId: playerId,
          isFirebase: true
        };

        this.currentUser = userObj;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        this.notify();
        return { success: true, user: userObj };
      } catch (error) {
        console.warn("Fallo registro en Firebase:", error.message);
        throw new Error(this.translateFirebaseError(error.code));
      }
    }

    // Registro Local
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const newAccount = {
      id: 'usr_' + Date.now(),
      name,
      email: cleanEmail,
      password,
      role,
      playerId
    };

    accounts.push(newAccount);
    localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));

    const userObj = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      playerId: newAccount.playerId,
      isFirebase: false
    };

    this.currentUser = userObj;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
    this.notify();
    return { success: true, user: userObj };
  }

  async signOut() {
    if (isFirebaseConfigured() && auth) {
      try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        await signOut(auth);
      } catch (e) {
        console.warn("Error en signOut de Firebase:", e);
      }
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
    this.notify();
  }

  translateFirebaseError(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Usuario o contraseña no válidos.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Error de autenticación: ' + (code || 'Inténtalo de nuevo.');
    }
  }
}

export const authService = new AuthService();
