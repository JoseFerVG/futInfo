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

  updateFirebaseBadge(isConnected) {
    const badge = document.getElementById('firebase-status-badge');
    if (!badge) return;

    if (isConnected) {
      badge.className = 'flex items-center gap-1.5 text-emerald-400 font-semibold';
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Firebase & Google Auth (Nube)</span>
      `;
    } else {
      badge.className = 'flex items-center gap-1.5 text-amber-400 font-medium';
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>Modo Local / Demo</span>
      `;
    }
  }

  bindEvents() {
    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Selector de Modalidad (Fútbol 7 vs Fútbol Sala)
    const setModality = (mod) => {
      store.setModality(mod);
      this.updateModalityButtons(mod);
      this.populateFormationsSelect();
      this.renderPitch();
      this.showToast(`Cambiado a ${mod === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'}`, 'shield');
    };

    document.getElementById('btn-mode-f7')?.addEventListener('click', () => setModality('f7'));
    document.getElementById('btn-mode-futsal')?.addEventListener('click', () => setModality('futsal'));
    document.getElementById('btn-mode-f7-mobile')?.addEventListener('click', () => setModality('f7'));
    document.getElementById('btn-mode-futsal-mobile')?.addEventListener('click', () => setModality('futsal'));

    // Selector de Formación activa
    const selectFormation = document.getElementById('select-active-formation');
    if (selectFormation) {
      selectFormation.addEventListener('change', (e) => {
        store.setFormation(e.target.value);
        this.renderPitch();
        this.showToast(`Formación cambiada a ${e.target.value}`, 'clipboard');
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

    // Control de Teclado estilo consola para el Menú Radial
    window.addEventListener('keydown', (e) => {
      if (this.activeRadialIndex !== null) {
        const key = e.key.toLowerCase();
        if (key === 'x') {
          e.preventDefault();
          document.getElementById('btn-radial-sub')?.click();
        } else if (key === 'y') {
          e.preventDefault();
          document.getElementById('btn-radial-inspect')?.click();
        } else if (key === 'a') {
          e.preventDefault();
          document.getElementById('btn-radial-captain')?.click();
        } else if (key === 'b' || key === 'escape') {
          e.preventDefault();
          this.closeRadialMenu(true);
        }
      } else if (e.key === 'Escape') {
        this.closeSubDrawer();
      }
    });

    // Shader Holográfico Dinámico reactivo al cursor / puntero
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.fut-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glare-x', `${x.toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${y.toFixed(1)}%`);
    });

    // Modales setup
    this.setupModals();
    this.setupForms();
  }

  updateModalityButtons(mod) {
    const isF7 = mod === 'f7';
    const bF7 = document.getElementById('btn-mode-f7');
    const bFutsal = document.getElementById('btn-mode-futsal');
    const bF7m = document.getElementById('btn-mode-f7-mobile');
    const bFutsalm = document.getElementById('btn-mode-futsal-mobile');
    const label = document.getElementById('current-modality-label');

    if (bF7 && bFutsal) {
      if (isF7) {
        bF7.className = 'px-3.5 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-black shadow-sm transition flex items-center gap-1.5';
        bFutsal.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5';
      } else {
        bFutsal.className = 'px-3.5 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-black shadow-sm transition flex items-center gap-1.5';
        bF7.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5';
      }
    }

    if (bF7m && bFutsalm) {
      bF7m.className = isF7 ? 'flex-1 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-black' : 'flex-1 py-1.5 rounded-lg text-slate-600 font-bold';
      bFutsalm.className = !isF7 ? 'flex-1 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-black' : 'flex-1 py-1.5 rounded-lg text-slate-600 font-bold';
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

    const formationsF7 = [
      { id: '1-3-2-1', name: '1-3-2-1 (Árbol de Navidad)' },
      { id: '1-2-3-1', name: '1-2-3-1 (Bandas y Control)' },
      { id: '1-3-1-2', name: '1-3-1-2 (Doble Punta Ofensiva)' }
    ];

    const formationsFutsal = [
      { id: '1-1-2-1', name: '1-1-2-1 (Rombo Clásico Futsal)' },
      { id: '1-2-2', name: '1-2-2 (Cuadrado Equilibrado)' },
      { id: '1-3-0', name: '1-3-0 (Juego de Tres / Falso 9)' }
    ];

    const list = isF7 ? formationsF7 : formationsFutsal;
    const current = store.getActiveFormation();

    sel.innerHTML = list.map(f => `
      <option value="${f.id}" ${f.id === current ? 'selected' : ''}>${f.name}</option>
    `).join('');
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

    document.getElementById('btn-open-create-card')?.addEventListener('click', () => {
      const user = authService.getCurrentUser() || {
        name: 'Nuevo Jugador',
        email: `fichaje_${Date.now()}@rector.es`,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      this.openPlayerSetupModal(user);
    });
  }

  setupForms() {
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

    // 2. Ficha de Jugador FIFA (Estricto: 1 carta por usuario con edición y foto)
    document.getElementById('form-setup-card')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cardData = {
        avatar: document.getElementById('setup-avatar-url')?.value || document.getElementById('setup-user-avatar')?.src,
        nickname: document.getElementById('setup-nickname').value,
        number: document.getElementById('setup-number').value,
        faculty: document.getElementById('setup-faculty').value,
        preferredFoot: document.getElementById('setup-foot').value,
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

    // 5. Configuración del Equipo
    document.getElementById('form-team-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings({
        teamName: document.getElementById('set-team-name').value,
        tournament: document.getElementById('set-tournament-name').value,
        coachName: document.getElementById('set-coach-name').value
      });
      this.showToast('Datos del equipo guardados', 'user-check');
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

    const existing = store.getPlayers().find(p => 
      (user.playerId && p.id === user.playerId) || 
      (p.email && p.email.toLowerCase() === (user.email || '').toLowerCase())
    );

    const titleEl = document.getElementById('setup-title');
    const submitBtn = document.querySelector('#form-setup-card button[type="submit"]');

    if (existing) {
      if (titleEl) titleEl.textContent = 'Editar mi Carta FUT Oficial';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios de mi Carta';
      document.getElementById('setup-nickname').value = existing.nickname || user.name.split(' ')[0];
      document.getElementById('setup-number').value = existing.number || 10;
      document.getElementById('setup-faculty').value = existing.faculty || 'inf';
      document.getElementById('setup-foot').value = existing.preferredFoot || 'Diestro';
      if (existing.rolesHierarchy) {
        document.getElementById('setup-role-best').value = existing.rolesHierarchy.best || 'DC';
        document.getElementById('setup-role-second').value = existing.rolesHierarchy.second || 'MC';
        document.getElementById('setup-role-third').value = existing.rolesHierarchy.third || 'DFC';
        document.getElementById('setup-role-worst').value = existing.rolesHierarchy.worst || 'POR';
      }
      if (existing.stats) {
        document.getElementById('setup-pac').value = existing.stats.pac || 82;
        document.getElementById('setup-sho').value = existing.stats.sho || 80;
        document.getElementById('setup-pas').value = existing.stats.pas || 80;
        document.getElementById('setup-dri').value = existing.stats.dri || 82;
        document.getElementById('setup-def').value = existing.stats.def || 60;
        document.getElementById('setup-phy').value = existing.stats.phy || 78;
      }
      const avatarUrl = existing.avatar || user.photoURL;
      const imgEl = document.getElementById('setup-user-avatar');
      const urlInput = document.getElementById('setup-avatar-url');
      if (imgEl) imgEl.src = avatarUrl;
      if (urlInput) urlInput.value = avatarUrl;
    } else {
      if (titleEl) titleEl.textContent = 'Crea tu Carta FIFA Ultimate Team';
      if (submitBtn) submitBtn.textContent = 'Guardar y Generar mi Carta FUT';
      document.getElementById('setup-nickname').value = user.name ? user.name.split(' ')[0] : 'Crack';
      const avatarUrl = user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      const imgEl = document.getElementById('setup-user-avatar');
      const urlInput = document.getElementById('setup-avatar-url');
      if (imgEl) imgEl.src = avatarUrl;
      if (urlInput) urlInput.value = avatarUrl;
    }

    document.getElementById('setup-user-name').textContent = user.name || 'Jugador FUT';
    document.getElementById('setup-user-email').textContent = user.email || '';
    dialog.showModal();
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

    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'tab-btn active px-4 py-2 rounded-xl flex items-center gap-2 transition text-white bg-slate-900 border border-slate-800 shadow-sm';
      } else {
        btn.className = 'tab-btn px-4 py-2 rounded-xl flex items-center gap-2 transition text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent';
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
        <div class="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-sm">
          <div class="flex items-center gap-2 cursor-pointer group" id="btn-open-my-profile" title="Ver / Editar mi Carta y Foto de Perfil">
            <img src="${userPhoto}" alt="${user.name}" class="w-7 h-7 rounded-lg object-cover border-2 ${isMister ? 'border-amber-500' : 'border-emerald-500'} group-hover:scale-105 transition">
            <div class="hidden sm:block text-left">
              <div class="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px] group-hover:text-amber-600 transition">${user.name}</div>
              <div class="text-[10px] ${isMister ? 'text-amber-600' : 'text-emerald-600'} font-bold">
                ${isMister ? 'Míster (Admin)' : 'Jugador'}
              </div>
            </div>
          </div>
          <button id="btn-logout" class="ml-1.5 p-1 text-slate-400 hover:text-rose-600 rounded transition" title="Cerrar Sesión" aria-label="Cerrar Sesión">
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
        <button id="btn-open-login" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Acceder con Google</span>
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
    this.renderSpecialists();
    this.updateAdminVisibility();

    const count = document.getElementById('tab-player-count');
    if (count) count.textContent = store.getPlayers().length;
  }

  renderHeaderAndSettings() {
    const settings = store.getSettings();
    const navName = document.getElementById('nav-team-name');
    if (navName) navName.textContent = settings.teamName;

    const navBadge = document.getElementById('nav-tournament-badge');
    if (navBadge) navBadge.textContent = settings.tournament;

    const mgrName = document.getElementById('manager-name-tag');
    if (mgrName) mgrName.textContent = settings.coachName || settings.manager.name;

    const setTeam = document.getElementById('set-team-name');
    if (setTeam && !setTeam.value) setTeam.value = settings.teamName;

    const setTour = document.getElementById('set-tournament-name');
    if (setTour && !setTour.value) setTour.value = settings.tournament;

    const setCoach = document.getElementById('set-coach-name');
    if (setCoach && !setCoach.value) setCoach.value = settings.coachName || settings.manager.name;
  }

  // ==================== RENDER PIZARRA FIFA FUT ====================
  renderPitch() {
    const slotsContainer = document.getElementById('pitch-slots-container');
    const benchContainer = document.getElementById('pitch-bench-container');
    const svgLines = document.getElementById('chem-lines-svg');
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

    const tacticalFormations = {
      '1-3-2-1': {
        slots: [
          { role: 'POR', top: 85, left: 50 },
          { role: 'LI', top: 64, left: 22 },
          { role: 'DFC', top: 68, left: 50 },
          { role: 'LD', top: 64, left: 78 },
          { role: 'MC', top: 43, left: 36 },
          { role: 'MC', top: 43, left: 64 },
          { role: 'DC', top: 20, left: 50 }
        ],
        links: [
          [0, 1], [0, 2], [0, 3],
          [1, 2], [2, 3], [1, 4], [3, 5],
          [2, 4], [2, 5],
          [4, 5], [4, 6], [5, 6]
        ]
      },
      '1-2-3-1': {
        slots: [
          { role: 'POR', top: 85, left: 50 },
          { role: 'DFC', top: 68, left: 33 },
          { role: 'DFC', top: 68, left: 67 },
          { role: 'EI', top: 45, left: 20 },
          { role: 'MC', top: 43, left: 50 },
          { role: 'ED', top: 45, left: 80 },
          { role: 'DC', top: 20, left: 50 }
        ],
        links: [
          [0, 1], [0, 2],
          [1, 2], [1, 3], [1, 4], [2, 4], [2, 5],
          [3, 4], [4, 5], [3, 6], [4, 6], [5, 6]
        ]
      },
      '1-3-1-2': {
        slots: [
          { role: 'POR', top: 85, left: 50 },
          { role: 'LI', top: 66, left: 22 },
          { role: 'DFC', top: 70, left: 50 },
          { role: 'LD', top: 66, left: 78 },
          { role: 'MCO', top: 45, left: 50 },
          { role: 'DC', top: 20, left: 35 },
          { role: 'DC', top: 20, left: 65 }
        ],
        links: [
          [0, 1], [0, 2], [0, 3],
          [1, 2], [2, 3], [1, 4], [2, 4], [3, 4],
          [4, 5], [4, 6], [5, 6]
        ]
      },
      '1-1-2-1': {
        slots: [
          { role: 'POR', top: 86, left: 50 },
          { role: 'CIE', top: 66, left: 50 },
          { role: 'ALI', top: 44, left: 25 },
          { role: 'ALD', top: 44, left: 75 },
          { role: 'PIV', top: 20, left: 50 }
        ],
        links: [
          [0, 1],
          [1, 2], [1, 3],
          [2, 3], [2, 4], [3, 4]
        ]
      },
      '1-2-2': {
        slots: [
          { role: 'POR', top: 86, left: 50 },
          { role: 'CIE', top: 66, left: 33 },
          { role: 'CIE', top: 66, left: 67 },
          { role: 'PIV', top: 26, left: 33 },
          { role: 'PIV', top: 26, left: 67 }
        ],
        links: [
          [0, 1], [0, 2],
          [1, 2], [1, 3], [2, 4], [3, 4]
        ]
      },
      '1-3-0': {
        slots: [
          { role: 'POR', top: 86, left: 50 },
          { role: 'ALI', top: 52, left: 22 },
          { role: 'CIE', top: 62, left: 50 },
          { role: 'ALD', top: 52, left: 78 },
          { role: 'MC', top: 30, left: 50 }
        ],
        links: [
          [0, 2],
          [1, 2], [2, 3],
          [1, 4], [2, 4], [3, 4]
        ]
      }
    };

    const formationConfig = tacticalFormations[activeFormation] || tacticalFormations[isF7 ? '1-3-2-1' : '1-1-2-1'];
    const startingPlayers = store.getStartingLineup();
    const slotRoles = formationConfig.slots.map(s => s.role);

    // Rating general y jugadores activos
    const chemRatingData = store.calculateTeamChemistryAndRating(slotRoles);
    const rEl = document.getElementById('hud-team-rating');
    if (rEl) rEl.textContent = chemRatingData.rating;

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

    // Sin líneas de química
    if (svgLines) svgLines.innerHTML = '';
    const projected = formationConfig.slots.map(s => this.projectSlot(s));

    // Renderizar Cartas sobre el Césped
    slotsContainer.innerHTML = formationConfig.slots.map((slot, index) => {
      const player = startingPlayers[index];
      const isSelected = this.selectedStarterIndex === index;
      const pr = projected[index];
      const slotStyle = `top: ${pr.top}%; left: ${pr.left}%; --depth-scale: ${pr.scale}; z-index: ${pr.z};`;

      if (!player) {
        return `
          <div class="fut-card-slot" style="${slotStyle}">
            <div class="fut-card bg-slate-900/60 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
              + Vacío
            </div>
            <div class="fut-pos-pedestal">${slot.role}</div>
          </div>
        `;
      }

      const facultyObj = FACULTIES.find(f => f.id === player.faculty) || FACULTIES[0];
      const cardTypeClass = player.cardType === 'totw' ? 'fut-card-totw' : (player.cardType === 'special' ? 'fut-card-special' : 'fut-card-gold');

      return `
        <div class="fut-card-slot ${isSelected ? 'swap-active' : ''}" 
             style="${slotStyle}"
             data-slot-index="${index}"
             onclick="window.futApp.selectStarter(${index})">
          
          <div class="fut-card ${cardTypeClass}">
            <!-- Capa Holográfica Reactiva -->
            <div class="fut-card-holo-layer"></div>

            <div class="fut-card-header">
              <div class="fut-card-badge-col">
                <span class="fut-card-rating">${player.rating}</span>
                <span class="fut-card-pos">${slot.role}</span>
                <span class="fut-card-emblem" title="${facultyObj.name}">${facultyObj.icon}</span>
              </div>
              <div class="fut-card-avatar-wrap">
                <img src="${player.avatar}" alt="${player.name}" class="fut-card-avatar">
              </div>
            </div>

            <div class="fut-card-name-plate">
              ${player.nickname || player.name.split(' ')[0]}
            </div>

            <div class="fut-card-footer"></div>
          </div>

          <div class="fut-pos-pedestal">
            <span>${slot.role}</span>
          </div>

        </div>
      `;
    }).join('');

    // Banquillo
    const allPlayers = store.getPlayers();
    const startingIds = new Set(startingPlayers.map(p => p.id));
    const bench = allPlayers.filter(p => !startingIds.has(p.id));

    if (bench.length === 0) {
      benchContainer.innerHTML = `
        <div class="text-xs text-slate-500 py-2">No hay suplentes en la recámara. ¡Crea más cartas con Google para el banquillo!</div>
      `;
    } else {
      benchContainer.innerHTML = bench.map(p => {
        const fac = FACULTIES.find(f => f.id === p.faculty) || FACULTIES[0];
        const cardClass = p.cardType === 'totw' ? 'fut-card-totw' : (p.cardType === 'special' ? 'fut-card-special' : 'fut-card-gold');

        return `
          <div class="cursor-pointer hover:scale-105 transition flex-shrink-0" onclick="window.futApp.selectBench('${p.id}')">
            <div class="fut-card ${cardClass}" style="width: 76px; height: 105px;">
              <div class="fut-card-header" style="height: 56px;">
                <div class="fut-card-badge-col">
                  <span class="fut-card-rating" style="font-size: 1.3rem;">${p.rating}</span>
                  <span class="fut-card-pos" style="font-size: 0.58rem;">${p.rolesHierarchy.best}</span>
                  <span class="fut-card-emblem">${fac.icon}</span>
                </div>
                <div class="fut-card-avatar-wrap" style="width: 48px; height: 55px;">
                  <img src="${p.avatar}" alt="${p.name}" class="fut-card-avatar">
                </div>
              </div>
              <div class="fut-card-name-plate" style="font-size: 0.6rem; padding: 1px 2px;">
                ${p.nickname}
              </div>
              <div class="fut-card-footer"></div>
            </div>
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
    // Escala sutil en perspectiva sobre el estadio FIFA de fondo
    const t = Math.min(1, Math.max(0, (slot.top - 18) / 68));
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const baseScale = isMobile ? 0.82 : 0.88;
    const scale = +(baseScale + 0.16 * t).toFixed(3);
    return {
      top: slot.top,
      left: slot.left,
      scale,
      z: 12 + Math.round(t * 20)
    };
  }

  getActiveSlotRole(index) {
    const settings = store.getSettings();
    const isF7 = settings.modality === 'f7';
    const activeFormation = store.getActiveFormation();
    const tacticalFormations = {
      '1-3-2-1': ['POR', 'LI', 'DFC', 'LD', 'MC', 'MC', 'DC'],
      '1-2-3-1': ['POR', 'DFC', 'DFC', 'EI', 'MC', 'ED', 'DC'],
      '1-3-1-2': ['POR', 'LI', 'DFC', 'LD', 'MCO', 'DC', 'DC'],
      '1-1-2-1': ['POR', 'CIE', 'ALI', 'ALD', 'PIV'],
      '1-2-2': ['POR', 'CIE', 'CIE', 'PIV', 'PIV'],
      '1-3-0': ['POR', 'ALI', 'CIE', 'ALD', 'MC']
    };
    const list = tacticalFormations[activeFormation] || tacticalFormations[isF7 ? '1-3-2-1' : '1-1-2-1'];
    return list[index] || 'MC';
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

  openSubDrawer(starterIndex) {
    const drawer = document.getElementById('fut-sub-drawer');
    const list = document.getElementById('sub-drawer-bench-list');
    const targetTag = document.getElementById('sub-drawer-target-player');
    if (!drawer || !list) return;

    const starting = store.getStartingLineup();
    const starter = starting[starterIndex];
    const role = this.getActiveSlotRole(starterIndex);

    if (targetTag && starter) {
      targetTag.textContent = `Cambiar a ${starter.nickname} (${role})`;
    }

    const allPlayers = store.getPlayers();
    const startingIds = new Set(starting.map(p => p.id));
    const bench = allPlayers.filter(p => !startingIds.has(p.id));

    if (bench.length === 0) {
      list.innerHTML = `<div class="text-xs text-slate-500 col-span-full py-4 text-center font-bold">No hay suplentes disponibles en el banquillo. ¡Crea más cartas con Google!</div>`;
    } else {
      list.innerHTML = bench.map(p => {
        let fitText = '<i data-lucide="x" class="w-3 h-3 inline"></i> Fuera de Puesto';
        let fitColor = 'text-rose-700 bg-rose-50 border border-rose-200';
        if (p.rolesHierarchy) {
          if (p.rolesHierarchy.best === role) {
            fitText = '<i data-lucide="check" class="w-3 h-3 inline"></i> Posición Principal';
            fitColor = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
          } else if (p.rolesHierarchy.second === role || p.rolesHierarchy.third === role) {
            fitText = '<i data-lucide="minus" class="w-3 h-3 inline"></i> Posición Secundaria';
            fitColor = 'text-amber-700 bg-amber-50 border border-amber-200';
          }
        }

        return `
          <div class="sub-bench-card" onclick="window.futApp.selectBench('${p.id}')">
            <div class="flex items-center gap-2.5">
              <img src="${p.avatar}" alt="${p.name}" class="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow">
              <div>
                <div class="text-xs font-black text-slate-900 leading-tight">${p.name}</div>
                <div class="text-[10px] ${fitColor} px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">${fitText}</div>
                <div class="text-[9px] text-slate-500 font-semibold mt-0.5">Facultad: ${p.faculty.toUpperCase()} • ${p.preferredFoot}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-fifa text-2xl font-bold text-slate-900 leading-none">${p.rating}</div>
              <span class="inline-block mt-1 text-[9px] uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black shadow-sm">Dar Relevo</span>
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

  selectStarter(index) {
    futAudio.playCardSelect();

    if (this.selectedStarterIndex === null) {
      this.selectedStarterIndex = index;
      this.renderPitch();
      const settings = store.getSettings();
      const isF7 = settings.modality === 'f7';
      const activeFormation = store.getActiveFormation();
      const tacticalFormations = {
        '1-3-2-1': [{ top: 85, left: 50 }, { top: 64, left: 22 }, { top: 68, left: 50 }, { top: 64, left: 78 }, { top: 43, left: 36 }, { top: 43, left: 64 }, { top: 20, left: 50 }],
        '1-2-3-1': [{ top: 85, left: 50 }, { top: 68, left: 33 }, { top: 68, left: 67 }, { top: 45, left: 20 }, { top: 43, left: 50 }, { top: 45, left: 80 }, { top: 20, left: 50 }],
        '1-3-1-2': [{ top: 85, left: 50 }, { top: 66, left: 22 }, { top: 70, left: 50 }, { top: 66, left: 78 }, { top: 45, left: 50 }, { top: 20, left: 35 }, { top: 20, left: 65 }],
        '1-1-2-1': [{ top: 86, left: 50 }, { top: 66, left: 50 }, { top: 44, left: 25 }, { top: 44, left: 75 }, { top: 20, left: 50 }],
        '1-2-2': [{ top: 86, left: 50 }, { top: 66, left: 33 }, { top: 66, left: 67 }, { top: 26, left: 33 }, { top: 26, left: 67 }],
        '1-3-0': [{ top: 86, left: 50 }, { top: 52, left: 22 }, { top: 62, left: 50 }, { top: 52, left: 78 }, { top: 30, left: 50 }]
      };
      const conf = tacticalFormations[activeFormation] || tacticalFormations[isF7 ? '1-3-2-1' : '1-1-2-1'];
      const slot = conf[index] || { top: 50, left: 50 };
      const pr = this.projectSlot(slot);

      this.openRadialMenu(index, pr);
      this.showToast('Usa el menú o toca otro titular para intercambiar', 'gamepad-2');
    } else if (this.selectedStarterIndex === index) {
      this.closeSubDrawer();
    } else {
      const starting = store.getStartingLineup();
      const p1 = starting[this.selectedStarterIndex];
      const p2 = starting[index];
      if (p1 && p2) {
        store.swapStartingPlayer(this.selectedStarterIndex, p2.id);
        store.swapStartingPlayer(index, p1.id);
        futAudio.playCardSwap();
        this.showToast(`Intercambiados ${p1.nickname} y ${p2.nickname}`, 'repeat');
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

      const cardClass = player.cardType === 'totw' ? 'fut-card-totw' : (player.cardType === 'special' ? 'fut-card-special' : 'fut-card-gold');
      const bestRole = player.rolesHierarchy ? player.rolesHierarchy.best : 'DC';

      cardHost.innerHTML = `
        <div class="fut-card ${cardClass}">
          <div class="fut-card-holo-layer"></div>
          <div class="fut-card-header">
            <div class="fut-card-badge-col">
              <span class="fut-card-rating">${player.rating}</span>
              <span class="fut-card-pos">${bestRole}</span>
              <span class="fut-card-emblem">${fac.icon}</span>
            </div>
            <div class="fut-card-avatar-wrap">
              <img src="${player.avatar}" alt="${player.name}" class="fut-card-avatar">
            </div>
          </div>
          <div class="fut-card-name-plate">
            ${player.nickname || player.name}
          </div>
          <div class="fut-card-footer"></div>
        </div>
      `;

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

  // ==================== ÁLBUM DE CARTAS ====================
  renderAlbumCards() {
    const grid = document.getElementById('album-cards-grid');
    if (!grid) return;

    const players = store.getPlayers();
    grid.innerHTML = players.map(p => {
      const fac = FACULTIES.find(f => f.id === p.faculty) || FACULTIES[0];
      const cardClass = p.cardType === 'totw' ? 'fut-card-totw' : (p.cardType === 'special' ? 'fut-card-special' : 'fut-card-gold');

      return `
        <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition">
          <div class="flex items-center justify-center mb-4">
            <div class="fut-card ${cardClass}" style="width: 140px; height: 195px; border-radius: 10px 10px 18px 18px;">
              <div class="fut-card-header" style="height: 105px; padding: 6px 8px 0 8px;">
                <div class="fut-card-badge-col">
                  <span class="fut-card-rating" style="font-size: 2.3rem;">${p.rating}</span>
                  <span class="fut-card-pos" style="font-size: 0.9rem;">${p.rolesHierarchy.best}</span>
                  <span class="fut-card-emblem" style="font-size: 1.1rem;">${fac.icon}</span>
                </div>
                <div class="fut-card-avatar-wrap" style="width: 90px; height: 100px;">
                  <img src="${p.avatar}" alt="${p.name}" class="fut-card-avatar">
                </div>
              </div>

              <div class="fut-card-name-plate" style="font-size: 0.85rem; padding: 3px 6px;">
                ${p.name.toUpperCase()}
              </div>

              <div class="fut-card-footer" style="font-size: 0.85rem; padding: 4px 8px;">
                <div class="grid grid-cols-3 gap-x-2 text-center w-full font-fifa">
                  <span>${p.stats.pac} PAC</span>
                  <span>${p.stats.dri} DRI</span>
                  <span>${p.stats.sho} SHO</span>
                  <span>${p.stats.def} DEF</span>
                  <span>${p.stats.pas} PAS</span>
                  <span>${p.stats.phy} PHY</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
            <div class="flex items-center justify-between text-emerald-700 font-bold">
              <span class="flex items-center gap-1.5"><i data-lucide="award" class="w-3.5 h-3.5 text-emerald-600"></i> Principal:</span>
              <span class="font-black text-slate-900">${p.rolesHierarchy.best}</span>
            </div>
            <div class="flex items-center justify-between text-sky-700 font-bold">
              <span class="flex items-center gap-1.5"><i data-lucide="arrow-right-circle" class="w-3.5 h-3.5 text-sky-600"></i> Segunda:</span>
              <span class="font-black text-slate-900">${p.rolesHierarchy.second}</span>
            </div>
            <div class="flex items-center justify-between text-amber-700 font-bold">
              <span class="flex items-center gap-1.5"><i data-lucide="circle-dot" class="w-3.5 h-3.5 text-amber-600"></i> Alternativa:</span>
              <span class="font-black text-slate-900">${p.rolesHierarchy.third}</span>
            </div>
            <div class="flex items-center justify-between text-rose-700 font-bold">
              <span class="flex items-center gap-1.5"><i data-lucide="x-circle" class="w-3.5 h-3.5 text-rose-600"></i> Menos Favorable:</span>
              <span class="font-black text-slate-900">${p.rolesHierarchy.worst}</span>
            </div>
          </div>

          <button onclick="window.futApp.inspectPlayer('${p.id}')" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95">
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

    content.innerHTML = `
      <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-sm">
          <img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-black text-lg text-slate-900">${p.name}</h4>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-black">${p.rating} OVR</span>
          </div>
          <p class="text-xs text-slate-500 font-bold">"${p.nickname}" | Dorsal #${p.number} | ${p.preferredFoot}</p>
          <p class="text-xs text-sky-700 font-bold mt-0.5">${fac.icon} ${fac.name}</p>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <h5 class="text-xs font-black uppercase text-slate-700 tracking-wider">Afinidad de Posiciones (Roles)</h5>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
            <span class="block text-[10px] text-emerald-700 font-black uppercase">1º Posición Principal</span>
            <span class="font-black text-emerald-950 text-sm">${p.rolesHierarchy.best}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-300">
            <span class="block text-[10px] text-sky-700 font-black uppercase">2º Posición Secundaria</span>
            <span class="font-black text-sky-950 text-sm">${p.rolesHierarchy.second}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-300">
            <span class="block text-[10px] text-amber-700 font-black uppercase">3º Posición Alternativa</span>
            <span class="font-black text-amber-950 text-sm">${p.rolesHierarchy.third}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-300">
            <span class="block text-[10px] text-rose-700 font-black uppercase">4º Menos Favorable</span>
            <span class="font-black text-rose-950 text-sm">${p.rolesHierarchy.worst}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <h5 class="text-xs font-black uppercase text-slate-700 tracking-wider">Atributos FIFA 18</h5>
        ${this.renderStatBar('Ritmo (PAC)', p.stats.pac)}
        ${this.renderStatBar('Tiro (SHO)', p.stats.sho)}
        ${this.renderStatBar('Pase (PAS)', p.stats.pas)}
        ${this.renderStatBar('Regate (DRI)', p.stats.dri)}
        ${this.renderStatBar('Defensa (DEF)', p.stats.def)}
        ${this.renderStatBar('Físico (PHY)', p.stats.phy)}
      </div>

      <div class="text-xs text-slate-500 flex items-center justify-between px-1 font-medium">
        <span>Matrícula: <strong class="text-slate-900">${p.studentId || 'UNI-Pendiente'}</strong></span>
        <span>Teléfono: <strong class="text-slate-900">${p.phone || 'Privado'}</strong></span>
      </div>

      <div class="admin-only pt-3 border-t border-slate-200 flex justify-end gap-2">
        <button onclick="window.futApp.deletePlayer('${p.id}')" class="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black border border-rose-300 transition">
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
    const color = value >= 80 ? 'bg-emerald-500' : (value >= 70 ? 'bg-amber-500' : 'bg-rose-500');
    return `
      <div>
        <div class="flex justify-between text-[11px] font-bold text-slate-700 mb-0.5">
          <span>${label}</span>
          <span class="font-black tabular-nums">${value}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full ${color} rounded-full" style="width: ${value}%;"></div>
        </div>
      </div>
    `;
  }

  // ==================== PARTIDOS & ASISTENCIA ====================
  renderMatches() {
    const container = document.getElementById('matches-container');
    const headline = document.getElementById('next-match-headline');
    const details = document.getElementById('next-match-details');
    const breakdown = document.getElementById('attendance-breakdown');
    if (!container) return;

    const nextMatch = store.getNextMatch();
    const settings = store.getSettings();
    const players = store.getPlayers();

    if (nextMatch && headline) {
      headline.textContent = `${settings.teamName} vs ${nextMatch.rival}`;
      details.innerHTML = `<span class="inline-flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-amber-400"></i> <strong>${nextMatch.date}</strong> a las <strong>${nextMatch.time} h</strong></span> | <span class="inline-flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-400"></i> ${nextMatch.field} (${nextMatch.modality === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'})</span>`;

      // Desglose de Asistencia
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

        breakdown.innerHTML = `
          <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs">
            <div class="font-black text-emerald-800 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="check" class="w-4 h-4 text-emerald-600"></i> Confirmados</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">${confirmed.length}</span>
            </div>
            <div class="text-[11px] text-emerald-950 font-bold">
              ${confirmed.length > 0 ? confirmed.map(p => p.nickname).join(', ') : '<span class="text-slate-400 font-normal">Nadie aún</span>'}
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs">
            <div class="font-black text-amber-800 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="help-circle" class="w-4 h-4 text-amber-600"></i> Dudas</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black">${doubts.length}</span>
            </div>
            <div class="text-[11px] text-amber-950 font-bold">
              ${doubts.length > 0 ? doubts.map(p => p.nickname).join(', ') : '<span class="text-slate-400 font-normal">Ninguna</span>'}
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs">
            <div class="font-black text-rose-800 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="x" class="w-4 h-4 text-rose-600"></i> Bajas</span>
              <span class="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black">${absent.length}</span>
            </div>
            <div class="text-[11px] text-rose-950 font-bold">
              ${absent.length > 0 ? absent.map(p => p.nickname).join(', ') : '<span class="text-slate-400 font-normal">Ninguna</span>'}
            </div>
          </div>
        `;
      }
    }

    const matches = store.getMatches();
    container.innerHTML = matches.map(m => {
      const isFinished = m.status === 'finalizado';
      return `
        <div class="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black px-2.5 py-0.5 rounded-md ${m.modality === 'f7' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-sky-100 text-sky-800 border border-sky-300'}">
                ${m.modality === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'}
              </span>
              <span class="text-xs text-slate-500 font-bold">${m.tournament}</span>
              ${isFinished ? '<span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white shadow-sm">FINALIZADO</span>' : ''}
            </div>
            <h4 class="font-black text-lg text-slate-900 mt-1.5 flex items-center gap-2">
              <span>${settings.teamName}</span>
              ${isFinished ? `<span class="bg-slate-900 text-amber-400 px-3 py-0.5 rounded-lg font-fifa text-xl tracking-wider">${m.goalsFor} - ${m.goalsAgainst}</span>` : '<span class="text-xs font-bold text-slate-400 uppercase">vs</span>'}
              <span>${m.rival}</span>
            </h4>
            <div class="text-xs text-slate-500 flex items-center gap-3 mt-1 font-medium">
              <span class="inline-flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i> ${m.date} - ${m.time}h</span>
              <span class="inline-flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${m.field}</span>
            </div>
            ${m.scorers ? `<div class="text-xs text-slate-700 mt-1.5 flex items-center gap-1.5 font-bold"><i data-lucide="activity" class="w-3.5 h-3.5 text-amber-500"></i> <strong>Goles:</strong> <span class="font-medium">${m.scorers}</span></div>` : ''}
          </div>

          <div class="flex items-center gap-2">
            ${isFinished && m.mvp ? `<span class="text-xs text-amber-700 font-bold mr-2 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"><i data-lucide="star" class="w-3.5 h-3.5 text-amber-500"></i> MVP: ${m.mvp}</span>` : ''}

            ${!isFinished ? `
              <button onclick="window.futApp.openResultModal('${m.id}')" class="admin-only px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition active:scale-95">
                <span>Registrar Acta</span>
              </button>
            ` : `
              <button onclick="window.futApp.openResultModal('${m.id}')" class="admin-only px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition">
                Editar Acta
              </button>
            `}

            <button onclick="window.futApp.openMatchModal('${m.id}')" class="admin-only p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition" title="Editar" aria-label="Editar partido">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.futApp.deleteMatch('${m.id}')" class="admin-only p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300 transition" title="Eliminar" aria-label="Eliminar partido">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
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
    const text = status === 'asistira' ? 'Asistencia confirmada' : (status === 'duda' ? 'Marcado como duda' : 'Baja confirmada');
    this.showToast(text, status === 'asistira' ? 'check-circle-2' : (status === 'duda' ? 'help-circle' : 'x-circle'));
  }

  renderSpecialists() {
    const settings = store.getSettings();
    const players = store.getPlayers();
    const specs = ['captain', 'penalties', 'freekicks', 'corners'];

    specs.forEach(role => {
      const el = document.getElementById(`spec-${role}`);
      if (el) {
        const current = settings.specialists[role];
        el.innerHTML = players.map(p => `
          <option value="${p.id}" ${p.id === current ? 'selected' : ''}>#${p.number} ${p.name} (${p.rolesHierarchy.best})</option>
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
