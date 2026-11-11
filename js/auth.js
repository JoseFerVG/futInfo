/**
 * Módulo de Autenticación con Firebase y Registro de Ficha FIFA
 */
import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { store } from './store.js';

const AUTH_USER_KEY = 'futinfo_fifa_auth_user_v2';
const AUTH_ACCOUNTS_KEY = 'futinfo_fifa_accounts_v2';

const DEFAULT_ACCOUNTS = [
  {
    id: 'usr_admin',
    name: 'Míster José Fer',
    email: 'mister@rector.es',
    password: 'rector2026',
    role: 'admin',
    playerId: null
  },
  {
    id: 'usr_player_1',
    name: 'Carlos Ruiz',
    email: 'charly@rector.es',
    password: 'rector2026',
    role: 'player',
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

  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    // Si Firebase está configurado, usar Firebase Authentication
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
          role: isMister ? 'admin' : 'player',
          playerId: existingPlayer ? existingPlayer.id : null,
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

    // Modo LocalStorage / Offline
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.password === password);

    if (found) {
      const existingPlayer = store.getPlayers().find(p => p.id === found.playerId || p.email.toLowerCase() === cleanEmail);
      const userObj = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role || 'player',
        playerId: existingPlayer ? existingPlayer.id : found.playerId,
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

  async signUpWithPlayerCard(formData) {
    const cleanEmail = formData.email.trim().toLowerCase();
    const isMister = formData.role === 'admin';

    // 1. Si es jugador, creamos su Ficha FIFA en el store
    let createdPlayer = null;
    if (!isMister) {
      createdPlayer = store.addPlayer({
        name: formData.name,
        nickname: formData.nickname || formData.name.split(' ')[0],
        number: parseInt(formData.number, 10) || 7,
        rating: parseInt(formData.rating, 10) || 80,
        faculty: formData.faculty || 'inf',
        preferredFoot: formData.preferredFoot || 'Diestro',
        studentId: formData.studentId || '',
        phone: formData.phone || '',
        email: cleanEmail,
        roleBest: formData.roleBest,
        roleSecond: formData.roleSecond,
        roleThird: formData.roleThird,
        roleWorst: formData.roleWorst,
        pac: formData.pac || 80,
        sho: formData.sho || 75,
        pas: formData.pas || 78,
        dri: formData.dri || 80,
        def: formData.def || 65,
        phy: formData.phy || 75,
        chemStyle: formData.chemStyle || 'BAS'
      });
    }

    // 2. Si Firebase está activo, crear en Firebase Authentication
    if (isFirebaseConfigured() && auth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });

        const userObj = {
          id: userCredential.user.uid,
          name: formData.name,
          email: cleanEmail,
          role: formData.role || 'player',
          playerId: createdPlayer ? createdPlayer.id : null,
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

    // 3. Registro Local
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      throw new Error('Ya existe una cuenta con este correo.');
    }

    const newAccount = {
      id: 'usr_' + Date.now(),
      name: formData.name,
      email: cleanEmail,
      password: formData.password,
      role: formData.role || 'player',
      playerId: createdPlayer ? createdPlayer.id : null
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
