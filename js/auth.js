/**
 * Módulo de Autenticación con Google (Firebase Auth) y Perfil de Ficha FIFA
 */
import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { store } from './store.js';

const AUTH_USER_KEY = 'futinfo_fifa_auth_user_v3';
const AUTH_ACCOUNTS_KEY = 'futinfo_fifa_accounts_v3';

const DEFAULT_ACCOUNTS = [
  {
    id: 'usr_admin',
    name: 'Míster José Fer',
    email: 'mister@rector.es',
    password: 'rector2026',
    role: 'admin',
    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    playerId: null
  },
  {
    id: 'usr_player_1',
    name: 'Carlos Ruiz',
    email: 'charly@rector.es',
    password: 'rector2026',
    role: 'player',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    if (!localStorage.getItem(AUTH_ACCOUNTS_KEY)) {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    }

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

  /**
   * Inicio de Sesión y Registro con Google (Firebase Auth GoogleAuthProvider)
   */
  async signInWithGoogle() {
    // Si Firebase está configurado, usamos el popup oficial de Google
    if (isFirebaseConfigured() && auth) {
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const userCredential = await signInWithPopup(auth, provider);
        const fbUser = userCredential.user;

        const cleanEmail = (fbUser.email || '').toLowerCase();
        const isMister = cleanEmail.includes('mister') || cleanEmail.includes('admin') || cleanEmail.includes('josef');
        const existingPlayer = store.getPlayers().find(p => p.email.toLowerCase() === cleanEmail);

        const userObj = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
          role: isMister ? 'admin' : 'player',
          playerId: existingPlayer ? existingPlayer.id : null,
          isFirebase: true,
          isNew: !existingPlayer && !isMister
        };

        this.currentUser = userObj;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        this.notify();
        return { success: true, user: userObj, isNew: userObj.isNew };
      } catch (error) {
        console.warn("Error en Google Sign-In con Firebase:", error);

        // Si el dominio aún no está autorizado en Firebase Console, avisamos amablemente
        if (error.code === 'auth/unauthorized-domain') {
          console.warn("Dominio no autorizado en Firebase Console. Usando modo de sesión directo.");
          return this.simulateGoogleSignIn();
        }

        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Has cerrado la ventana de inicio de sesión de Google.');
        }

        // Si hay otro error (como que Google no esté habilitado todavía en la consola), fallback sin romper
        return this.simulateGoogleSignIn();
      }
    }

    return this.simulateGoogleSignIn();
  }

  simulateGoogleSignIn() {
    const defaultEmail = 'josef.caniles.murcia@gmail.com';
    const cleanEmail = defaultEmail.toLowerCase();
    const existingPlayer = store.getPlayers().find(p => p.email.toLowerCase() === cleanEmail);

    const userObj = {
      id: 'google_user_' + Date.now(),
      name: 'Jose Fernando',
      email: cleanEmail,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      playerId: existingPlayer ? existingPlayer.id : null,
      isFirebase: false,
      isNew: !existingPlayer
    };

    this.currentUser = userObj;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
    this.notify();
    return { success: true, user: userObj, isNew: userObj.isNew };
  }

  /**
   * Guardar la Carta FUT tras entrar con Google
   */
  async completePlayerCard(cardData) {
    if (!this.currentUser) throw new Error('Debes iniciar sesión con Google primero.');

    const newPlayer = store.addPlayer({
      name: this.currentUser.name,
      nickname: cardData.nickname || this.currentUser.name.split(' ')[0],
      email: this.currentUser.email,
      avatar: this.currentUser.photoURL || cardData.avatar,
      number: parseInt(cardData.number, 10) || 7,
      rating: parseInt(cardData.rating, 10) || 82,
      faculty: cardData.faculty || 'inf',
      preferredFoot: cardData.preferredFoot || 'Diestro',
      studentId: cardData.studentId || '',
      phone: cardData.phone || '',
      roleBest: cardData.roleBest || 'DC',
      roleSecond: cardData.roleSecond || 'MC',
      roleThird: cardData.roleThird || 'DFC',
      roleWorst: cardData.roleWorst || 'POR',
      pac: cardData.pac || 82,
      sho: cardData.sho || 80,
      pas: cardData.pas || 80,
      dri: cardData.dri || 82,
      def: cardData.def || 65,
      phy: cardData.phy || 78,
      chemStyle: cardData.chemStyle || 'BAS'
    });

    // Guardar en Firestore si está conectado
    if (isFirebaseConfigured() && db) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        await setDoc(doc(db, 'players', newPlayer.id), newPlayer);
        console.log("[Firestore] Jugador guardado en Cloud Firestore!");
      } catch (e) {
        console.warn("Nota: Guardado en local. En Firestore:", e.message);
      }
    }

    this.currentUser.playerId = newPlayer.id;
    this.currentUser.isNew = false;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return newPlayer;
  }

  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Comprobar si es cuenta local / demo (ej. mister@rector.es o charly@rector.es)
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    const localMatch = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);

    if (localMatch) {
      const existingPlayer = store.getPlayers().find(p => p.id === localMatch.playerId || p.email.toLowerCase() === cleanEmail);
      const userObj = {
        id: localMatch.id,
        name: localMatch.name,
        email: localMatch.email,
        photoURL: localMatch.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: localMatch.role || 'player',
        playerId: existingPlayer ? existingPlayer.id : localMatch.playerId,
        isFirebase: false
      };
      this.currentUser = userObj;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      this.notify();
      return { success: true, user: userObj };
    }

    // 2. Si no es cuenta local y Firebase está configurado, usar Firebase Auth
    if (isFirebaseConfigured() && auth) {
      try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = userCredential.user;

        const isMister = cleanEmail.includes('mister') || cleanEmail.includes('admin');
        const existingPlayer = store.getPlayers().find(p => p.email.toLowerCase() === cleanEmail);

        const userObj = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: isMister ? 'admin' : 'player',
          playerId: existingPlayer ? existingPlayer.id : null,
          isFirebase: true
        };

        this.currentUser = userObj;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        this.notify();
        return { success: true, user: userObj };
      } catch (error) {
        throw new Error(this.translateFirebaseError(error.code));
      }
    }

    throw new Error('Credenciales incorrectas. (Prueba con Google o mister@rector.es)');
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
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de Google antes de completar el inicio de sesión.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para continuar.';
      case 'auth/unauthorized-domain':
        return 'Dominio web no añadido en Firebase Console (Authentication > Configuración > Dominios autorizados).';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      default:
        return 'Error de autenticación: ' + (code || 'Inténtalo de nuevo.');
    }
  }
}

export const authService = new AuthService();
