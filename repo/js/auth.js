/**
 * Módulo de Autenticación con Google (Firebase Auth) y Perfil de Ficha FIFA
 */
import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { store } from './store.js';
import { normalizeFutsalHierarchy } from './lineup-planner.js';

const AUTH_USER_KEY = 'futinfo_fifa_auth_user_v3';
const LEGACY_ACCOUNTS_KEY = 'futinfo_fifa_accounts_v3';
const ADMIN_EMAILS = ['josef.caniles.murcia@gmail.com'];

/**
 * Detecta navegadores integrados (WhatsApp, Instagram, Facebook, TikTok, etc.)
 * donde Google bloquea OAuth (`disallowed_useragent`).
 */
export function isEmbeddedWebView() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|BytedanceWebview|Musical_ly|TikTok|Line\/|MicroMessenger|\bwv\b/i.test(ua);
}

class AuthService {
  constructor() {
    this.currentUser = null;
    this.subscribers = new Set();
    this._fbUnsub = null;
    this._pendingRedirectOnboarding = false;
    this.init();
  }

  init() {
    localStorage.removeItem(LEGACY_ACCOUNTS_KEY);

    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isFirebase) {
          this.currentUser = parsed;
        } else {
          localStorage.removeItem(AUTH_USER_KEY);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }

  buildUserFromFirebase(fbUser) {
    const cleanEmail = (fbUser.email || '').toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const existingPlayer = store.getPlayers().find(
      p => (p.uid && p.uid === fbUser.uid) ||
           p.id === `u_${fbUser.uid}` ||
           (cleanEmail && p.email && p.email.toLowerCase().trim() === cleanEmail)
    );

    return {
      id: fbUser.uid,
      name: fbUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Jugador FUT'),
      email: cleanEmail,
      photoURL: fbUser.photoURL || existingPlayer?.avatar || 'assets/club_logo.png',
      role: isAdmin ? 'admin' : 'player',
      playerId: existingPlayer ? existingPlayer.id : null,
      isFirebase: true,
      isNew: !existingPlayer
    };
  }

  async bindFirebaseAuthListener() {
    if (!isFirebaseConfigured() || !auth || this._fbUnsub) return null;
    try {
      const { onAuthStateChanged, getRedirectResult } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

      try {
        const redir = await getRedirectResult(auth);
        if (redir?.user) {
          const userObj = this.buildUserFromFirebase(redir.user);
          this.currentUser = userObj;
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
          store.syncPrivatePlayerData(redir.user, userObj.role === 'admin');
          if (userObj.isNew || !userObj.playerId) {
            this._pendingRedirectOnboarding = true;
          }
          this.notify();
        }
      } catch (redirErr) {
        console.warn("Aviso en retorno de redirección Google:", redirErr?.code || redirErr?.message);
      }

      this._fbUnsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userObj = this.buildUserFromFirebase(fbUser);
          this.currentUser = userObj;
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
          store.syncPrivatePlayerData(fbUser, userObj.role === 'admin');
        } else {
          this.currentUser = null;
          localStorage.removeItem(AUTH_USER_KEY);
          store.syncPrivatePlayerData(null, false);
        }
        this.notify();
      });
      return this._pendingRedirectOnboarding;
    } catch (err) {
      console.warn("No se pudo conectar el observador de sesión Firebase:", err);
      return false;
    }
  }

  consumeRedirectOnboardingFlag() {
    const val = this._pendingRedirectOnboarding;
    this._pendingRedirectOnboarding = false;
    return val;
  }

  refreshLinkedPlayer() {
    if (!this.currentUser) return;
    const cleanEmail = (this.currentUser.email || '').toLowerCase().trim();
    const uid = this.currentUser.id || '';
    const existingPlayer = store.getPlayers().find(
      p => (this.currentUser.playerId && p.id === this.currentUser.playerId) ||
           (uid && (p.uid === uid || p.id === `u_${uid}`)) ||
           (cleanEmail && p.email && p.email.toLowerCase().trim() === cleanEmail)
    );
    const nextPlayerId = existingPlayer ? existingPlayer.id : null;
    if (nextPlayerId !== this.currentUser.playerId) {
      this.currentUser.playerId = nextPlayerId;
      this.currentUser.isNew = !existingPlayer;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
      this.notify();
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
   * Inicio de Sesión y Registro con Google (Popup en escritorio + Redirect fallback automático en móvil)
   */
  async signInWithGoogle() {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error('Firebase Auth no está inicializado en este entorno.');
    }
    if (isEmbeddedWebView()) {
      throw new Error('Google bloquea el inicio de sesión dentro de WhatsApp, Instagram o TikTok. Copia el enlace y ábrelo en Chrome o Safari.');
    }

    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const userObj = this.buildUserFromFirebase(userCredential.user);

      this.currentUser = userObj;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      store.syncPrivatePlayerData(userCredential.user, userObj.role === 'admin');
      this.notify();
      return { success: true, user: userObj, isNew: userObj.isNew, redirected: false };
    } catch (error) {
      const code = error?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, provider);
        return { success: true, redirected: true };
      }
      console.warn("Error en Google Sign-In con Firebase:", error);
      throw new Error(this.translateFirebaseError(code));
    }
  }

  /**
   * Guardar o Actualizar la Carta FUT del usuario en Cloud Firestore (1 carta por usuario)
   */
  async completePlayerCard(cardData) {
    if (!this.currentUser) throw new Error('Debes iniciar sesión con Google primero.');

    const cleanEmail = (this.currentUser.email || '').toLowerCase();
    const uid = this.currentUser.id || '';
    const existingPlayer = store.getPlayers().find(p =>
      (this.currentUser.playerId && p.id === this.currentUser.playerId) ||
      (uid && (p.uid === uid || p.id === `u_${uid}`)) ||
      (p.email && cleanEmail && p.email.toLowerCase() === cleanEmail)
    );

    const avatarUrl = cardData.avatar || this.currentUser.photoURL || existingPlayer?.avatar || 'assets/club_logo.png';
    const isBrandNew = !existingPlayer;

    let targetPlayer;
    if (existingPlayer) {
      const nextStats = {
        pac: parseInt(cardData.pac, 10) || existingPlayer.stats?.pac || 80,
        sho: parseInt(cardData.sho, 10) || existingPlayer.stats?.sho || 80,
        pas: parseInt(cardData.pas, 10) || existingPlayer.stats?.pas || 80,
        dri: parseInt(cardData.dri, 10) || existingPlayer.stats?.dri || 80,
        def: parseInt(cardData.def, 10) || existingPlayer.stats?.def || 65,
        phy: parseInt(cardData.phy, 10) || existingPlayer.stats?.phy || 75
      };
      // ACTUALIZAR CARTA EXISTENTE (conservar todos los campos de personalización y recalcular media)
      targetPlayer = store.updatePlayer(existingPlayer.id, {
        uid: uid || existingPlayer.uid || '',
        name: this.currentUser.name || existingPlayer.name,
        nickname: cardData.nickname || existingPlayer.nickname,
        avatar: avatarUrl,
        number: parseInt(cardData.number, 10) || existingPlayer.number,
        rating: parseInt(cardData.rating, 10) || store.computePlayerRating(nextStats),
        cardType: cardData.cardType || existingPlayer.cardType || 'gold',
        faculty: cardData.faculty || existingPlayer.faculty,
        preferredFoot: cardData.preferredFoot || existingPlayer.preferredFoot,
        kitColor: cardData.kitColor || existingPlayer.kitColor || '#f0be2a',
        kitSecondary: cardData.kitSecondary || existingPlayer.kitSecondary || '#111827',
        kitCollar: cardData.kitCollar || existingPlayer.kitCollar || 'round',
        kitSleeves: cardData.kitSleeves || existingPlayer.kitSleeves || 'short',
        playStyle: cardData.playStyle || existingPlayer.playStyle || 'finesse',
        celebration: cardData.celebration || existingPlayer.celebration || 'siuuu',
        skillMoves: parseInt(cardData.skillMoves, 10) || existingPlayer.skillMoves || 4,
        weakFoot: parseInt(cardData.weakFoot, 10) || existingPlayer.weakFoot || 4,
        chemStyle: cardData.chemStyle || existingPlayer.chemStyle || 'HUN',
        rolesHierarchy: normalizeFutsalHierarchy({
          best: cardData.roleBest || existingPlayer.rolesHierarchy?.best || 'PIV',
          second: cardData.roleSecond || existingPlayer.rolesHierarchy?.second || 'ALI',
          third: cardData.roleThird || existingPlayer.rolesHierarchy?.third || 'ALD',
          fourth: cardData.roleFourth || existingPlayer.rolesHierarchy?.fourth || 'CIE',
          worst: cardData.roleWorst || existingPlayer.rolesHierarchy?.worst || 'POR',
          priorityOrder: Array.isArray(cardData.priorityOrder) && cardData.priorityOrder.length > 0
            ? cardData.priorityOrder
            : [
              cardData.roleBest || existingPlayer.rolesHierarchy?.best || 'PIV',
              cardData.roleSecond || existingPlayer.rolesHierarchy?.second || 'ALI',
              cardData.roleThird || existingPlayer.rolesHierarchy?.third || 'ALD',
              cardData.roleFourth || existingPlayer.rolesHierarchy?.fourth || 'CIE'
            ]
        }),
        stats: nextStats
      });
    } else {
      // CREAR PRIMERA Y ÚNICA CARTA (ID determinista u_<uid> para sincronizar sin conflictos)
      targetPlayer = store.addPlayer({
        id: uid ? `u_${uid}` : undefined,
        uid,
        name: this.currentUser.name,
        nickname: cardData.nickname || this.currentUser.name.split(' ')[0],
        email: this.currentUser.email,
        avatar: avatarUrl,
        number: parseInt(cardData.number, 10) || 7,
        rating: parseInt(cardData.rating, 10) || undefined,
        cardType: cardData.cardType || 'gold',
        faculty: cardData.faculty || 'inf',
        preferredFoot: cardData.preferredFoot || 'Diestro',
        kitColor: cardData.kitColor || '#f0be2a',
        kitSecondary: cardData.kitSecondary || '#111827',
        kitCollar: cardData.kitCollar || 'round',
        kitSleeves: cardData.kitSleeves || 'short',
        playStyle: cardData.playStyle || 'finesse',
        celebration: cardData.celebration || 'siuuu',
        skillMoves: parseInt(cardData.skillMoves, 10) || 4,
        weakFoot: parseInt(cardData.weakFoot, 10) || 4,
        chemStyle: cardData.chemStyle || 'HUN',
        studentId: cardData.studentId || '',
        phone: cardData.phone || '',
        roleBest: cardData.roleBest || 'PIV',
        roleSecond: cardData.roleSecond || 'ALI',
        roleThird: cardData.roleThird || 'ALD',
        roleFourth: cardData.roleFourth || 'CIE',
        roleWorst: cardData.roleWorst || 'POR',
        priorityOrder: cardData.priorityOrder || undefined,
        pac: parseInt(cardData.pac, 10) || 82,
        sho: parseInt(cardData.sho, 10) || 80,
        pas: parseInt(cardData.pas, 10) || 80,
        dri: parseInt(cardData.dri, 10) || 82,
        def: parseInt(cardData.def, 10) || 65,
        phy: parseInt(cardData.phy, 10) || 78
      });
    }

    // Si es una sesión real de Firebase, EXIGIR guardado confirmado en Cloud Firestore (no mentir con guardado solo local)
    if (this.currentUser.isFirebase && isFirebaseConfigured() && targetPlayer) {
      try {
        await store.upsertPlayerCloud(targetPlayer, uid);
      } catch (cloudErr) {
        if (isBrandNew) {
          store.deletePlayer(targetPlayer.id);
        }
        throw new Error(`NO se guardó en la base de datos compartida del club: ${cloudErr.message}`);
      }
    }

    // Actualizar usuario solo cuando el guardado quedó confirmado
    this.currentUser.playerId = targetPlayer.id;
    this.currentUser.photoURL = avatarUrl;
    this.currentUser.isNew = false;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
    this.notify();

    return targetPlayer;
  }

  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured() && auth) {
      try {
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const userObj = this.buildUserFromFirebase(userCredential.user);

        this.currentUser = userObj;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        this.notify();
        return { success: true, user: userObj };
      } catch (error) {
        throw new Error(this.translateFirebaseError(error.code));
      }
    }

    throw new Error('Servicio de autenticación no disponible. Usa el acceso con Google.');
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
        return 'El navegador bloqueó la ventana emergente de Google. Prueba de nuevo o permite ventanas emergentes.';
      case 'auth/unauthorized-domain':
        return 'Dominio web no autorizado en Firebase Console (Authentication > Configuración > Dominios autorizados).';
      case 'auth/web-storage-unsupported':
        return 'Tu navegador tiene las cookies/almacenamiento bloqueados (modo incógnito estricto). Actívalas para entrar con Google.';
      case 'auth/network-request-failed':
        return 'Error de red conectando con Google. Comprueba tu conexión e inténtalo de nuevo.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos seguidos. Espera unos segundos antes de volver a intentarlo.';
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado.';
      default:
        return 'Error de autenticación: ' + (code || 'Inténtalo de nuevo.');
    }
  }
}

export const authService = new AuthService();
