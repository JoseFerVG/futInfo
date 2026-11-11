/**
 * Controlador Principal de la Aplicación futInfo - Torneo del Rector
 */
import { store } from './store.js';
import { authService } from './auth.js';
import { 
  initFirebaseServices, 
  isFirebaseConfigured, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  getActiveConfig 
} from './firebase-config.js';

class FutApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.currentFilter = 'ALL';
    this.selectedFormation = '3-2-1';
    this.init();
  }

  async init() {
    // 1. Inicializar Firebase
    const fbStatus = await initFirebaseServices();
    this.updateFirebaseBadge(fbStatus.isConnected);

    // 2. Escuchar cambios de Auth
    authService.onAuthStateChanged((user) => {
      this.renderAuthBar(user);
      this.updateAdminVisibility();
      this.renderAll();
    });

    // 3. Escuchar cambios en el almacén de datos
    store.subscribe(() => {
      this.renderAll();
    });

    // 4. Inicializar eventos de navegación, modales y formularios
    this.bindEvents();

    // 5. Render inicial
    this.renderAll();
    this.refreshIcons();
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
        <span>🔥 Firebase Conectado (Nube)</span>
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
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Filtros de plantilla
    document.querySelectorAll('.player-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.player-filter-btn').forEach(b => {
          b.className = 'player-filter-btn px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium';
        });
        btn.className = 'player-filter-btn active px-3 py-1 text-xs rounded-lg bg-brand-600 text-white font-medium';
        this.currentFilter = btn.dataset.filter;
        this.renderPlayers();
      });
    });

    // Selector de formación táctica
    const formationSelector = document.getElementById('formation-selector');
    if (formationSelector) {
      formationSelector.addEventListener('change', (e) => {
        this.selectedFormation = e.target.value;
        this.renderTacticalPitch();
      });
    }

    // Modal de Firebase desde el botón de la cabecera
    const btnOpenFb = document.getElementById('btn-open-firebase-modal');
    if (btnOpenFb) {
      btnOpenFb.addEventListener('click', () => {
        this.switchTab('ajustes');
        document.getElementById('fb-api-key')?.focus();
      });
    }

    // Modales setup
    this.setupModals();
    this.setupForms();
  }

  setupModals() {
    const setupBackdropDismiss = (dialog) => {
      if (!dialog) return;
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          dialog.close();
        }
      });
    };

    // Modal Login
    const loginDialog = document.getElementById('login-dialog');
    document.getElementById('btn-close-login')?.addEventListener('click', () => loginDialog.close());
    setupBackdropDismiss(loginDialog);

    // Modal Jugador
    const playerDialog = document.getElementById('player-dialog');
    document.getElementById('btn-add-player')?.addEventListener('click', () => this.openPlayerModal());
    document.getElementById('btn-close-player')?.addEventListener('click', () => playerDialog.close());
    document.getElementById('btn-cancel-player')?.addEventListener('click', () => playerDialog.close());
    setupBackdropDismiss(playerDialog);

    // Modal Partido
    const matchDialog = document.getElementById('match-dialog');
    document.getElementById('btn-add-match')?.addEventListener('click', () => this.openMatchModal());
    document.getElementById('btn-close-match')?.addEventListener('click', () => matchDialog.close());
    document.getElementById('btn-cancel-match')?.addEventListener('click', () => matchDialog.close());
    setupBackdropDismiss(matchDialog);

    // Modal Resultado Partido
    const resultDialog = document.getElementById('match-result-dialog');
    document.getElementById('btn-close-result')?.addEventListener('click', () => resultDialog.close());
    document.getElementById('btn-cancel-result')?.addEventListener('click', () => resultDialog.close());
    setupBackdropDismiss(resultDialog);
  }

  setupForms() {
    // 1. Tabs de Login / Registro
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formReg = document.getElementById('form-register');

    tabLoginBtn?.addEventListener('click', () => {
      tabLoginBtn.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white transition';
      tabRegBtn.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition';
      formLogin.classList.remove('hidden');
      formReg.classList.add('hidden');
    });

    tabRegBtn?.addEventListener('click', () => {
      tabRegBtn.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white transition';
      tabLoginBtn.className = 'flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition';
      formReg.classList.remove('hidden');
      formLogin.classList.add('hidden');
    });

    // 2. Submit Login
    formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error-msg');
      errorDiv.classList.add('hidden');

      try {
        await authService.signIn(email, pass);
        document.getElementById('login-dialog').close();
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
      }
    });

    // 3. Submit Registro
    formReg?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      const role = document.getElementById('reg-role').value;
      const errorDiv = document.getElementById('register-error-msg');
      errorDiv.classList.add('hidden');

      try {
        await authService.signUp(name, email, pass, role);
        document.getElementById('login-dialog').close();
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
      }
    });

    // 4. Formulario Jugador
    document.getElementById('form-player')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('player-id').value;
      const data = {
        name: document.getElementById('player-name').value,
        nickname: document.getElementById('player-nickname').value,
        number: document.getElementById('player-number').value,
        category: document.getElementById('player-category').value,
        position: document.getElementById('player-position').value,
        studentId: document.getElementById('player-student-id').value,
        phone: document.getElementById('player-phone').value,
        goals: document.getElementById('player-goals').value,
        assists: document.getElementById('player-assists').value,
        feeStatus: document.getElementById('player-fee-status').value
      };

      if (id) {
        store.updatePlayer(id, data);
      } else {
        store.addPlayer(data);
      }

      document.getElementById('player-dialog').close();
    });

    // 5. Formulario Partido
    document.getElementById('form-match')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('match-id').value;
      const data = {
        rival: document.getElementById('match-rival').value,
        date: document.getElementById('match-date').value,
        time: document.getElementById('match-time').value,
        field: document.getElementById('match-field').value,
        notes: document.getElementById('match-notes').value,
        status: 'proximo'
      };

      if (id) {
        store.updateMatch(id, data);
      } else {
        store.addMatch(data);
      }

      document.getElementById('match-dialog').close();
    });

    // 6. Formulario Resultado de Partido
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
    });

    // 7. Configuración de Firebase
    document.getElementById('form-firebase-config')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newConfig = {
        apiKey: document.getElementById('fb-api-key').value.trim(),
        projectId: document.getElementById('fb-project-id').value.trim(),
        authDomain: document.getElementById('fb-auth-domain').value.trim(),
        appId: document.getElementById('fb-app-id').value.trim()
      };

      saveFirebaseConfig(newConfig);
    });

    document.getElementById('btn-clear-firebase')?.addEventListener('click', () => {
      if (confirm('¿Restablecer a modo local? Se borrarán las claves de Firebase configuradas.')) {
        clearFirebaseConfig();
      }
    });

    // 8. Ajustes del Equipo
    document.getElementById('form-team-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings({
        teamName: document.getElementById('set-team-name').value,
        tournament: document.getElementById('set-tournament-name').value,
        coachName: document.getElementById('set-coach-name').value,
        defaultModality: document.getElementById('set-modality').value
      });
      alert('¡Configuración del equipo guardada!');
    });

    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('¿Restablecer datos de prueba de jugadores y partidos?')) {
        store.resetToDefault();
      }
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Actualizar botones de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'tab-btn active px-3.5 py-2 rounded-lg flex items-center gap-2 transition text-brand-400 bg-brand-500/10';
      } else {
        btn.className = 'tab-btn px-3.5 py-2 rounded-lg flex items-center gap-2 transition text-slate-400 hover:text-slate-200 hover:bg-slate-800/60';
      }
    });

    // Mostrar sección correspondiente
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.add('hidden');
    });
    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) {
      activeView.classList.remove('hidden');
    }

    this.renderAll();
    this.refreshIcons();
  }

  renderAuthBar(user) {
    const container = document.getElementById('auth-container');
    if (!container) return;

    if (user) {
      const isMister = user.role === 'admin';
      container.innerHTML = `
        <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl">
          <div class="w-7 h-7 rounded-lg ${isMister ? 'bg-brand-600' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs">
            ${isMister ? '👔' : '🏃'}
          </div>
          <div class="hidden sm:block text-left">
            <div class="text-xs font-bold text-white leading-tight truncate max-w-[130px]">${user.name}</div>
            <div class="text-[10px] ${isMister ? 'text-brand-300' : 'text-emerald-300'} font-semibold">
              ${isMister ? 'Míster (Admin)' : 'Jugador'}
            </div>
          </div>
          <button id="btn-logout" class="ml-1 p-1 text-slate-400 hover:text-rose-400 rounded transition" title="Cerrar Sesión">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      `;

      document.getElementById('btn-logout')?.addEventListener('click', () => {
        authService.signOut();
      });
    } else {
      container.innerHTML = `
        <button id="btn-open-login" class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-600/30 transition">
          <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
          <span>Iniciar Sesión</span>
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
      if (isAdmin) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  }

  renderAll() {
    this.renderHeader();
    this.renderDashboard();
    this.renderPlayers();
    this.renderTacticalPitch();
    this.renderMatches();
    this.renderCuotas();
    this.renderSettings();
    this.updateAdminVisibility();
  }

  renderHeader() {
    const settings = store.getSettings();
    const navName = document.getElementById('nav-team-name');
    if (navName) navName.textContent = settings.teamName;

    const count = document.getElementById('tab-player-count');
    if (count) count.textContent = store.getPlayers().length;
  }

  // --- 1. RENDER DASHBOARD ---
  renderDashboard() {
    const stats = store.getStats();
    const nextMatch = store.getNextMatch();
    const settings = store.getSettings();

    // Estadísticas
    document.getElementById('stat-matches-played').textContent = stats.played;
    document.getElementById('stat-matches-w-d-l').textContent = `${stats.won}V - ${stats.drawn}E - ${stats.lost}D`;
    document.getElementById('stat-goals-for').textContent = stats.totalGF;
    document.getElementById('stat-goals-diff').textContent = `Dif: ${stats.diff >= 0 ? '+' : ''}${stats.diff} (${stats.totalGA} enc.)`;
    
    const topScorer = stats.topScorers[0];
    document.getElementById('stat-top-scorer-name').textContent = topScorer ? topScorer.name : 'Sin goles aún';
    document.getElementById('stat-top-scorer-goals').textContent = topScorer ? `${topScorer.goals} goles` : '0 goles';

    document.getElementById('stat-fees-collected').textContent = `${stats.totalCollected} €`;
    const paidPlayers = store.getPlayers().filter(p => p.feeStatus === 'pagado').length;
    document.getElementById('stat-fees-ratio').textContent = `${paidPlayers} de ${store.getPlayers().length} pagados`;

    // Banner Próximo Partido
    const banner = document.getElementById('dashboard-next-match-banner');
    if (banner) {
      if (nextMatch) {
        banner.innerHTML = `
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 mb-2">
                <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                <span>PRÓXIMO PARTIDO - ${nextMatch.tournament}</span>
              </div>
              <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                ${settings.teamName} <span class="text-brand-400 font-normal">vs</span> ${nextMatch.rival}
              </h2>
              <div class="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-300">
                <span class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4 text-brand-400"></i> ${this.formatDate(nextMatch.date)}</span>
                <span class="flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-brand-400"></i> ${nextMatch.time} h</span>
                <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-4 h-4 text-brand-400"></i> ${nextMatch.field}</span>
              </div>
              ${nextMatch.notes ? `<p class="mt-2 text-xs text-slate-400 italic font-mono">📢 ${nextMatch.notes}</p>` : ''}
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button onclick="window.futApp.switchTab('tactica')" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition">
                <i data-lucide="shield" class="w-4 h-4"></i>
                <span>Ver Convocatoria & Pizarra</span>
              </button>
            </div>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div class="text-center py-6">
            <h3 class="font-display font-bold text-xl text-white">No hay partidos próximos programados</h3>
            <p class="text-xs text-slate-400 mt-1 mb-4">El Torneo del Rector está en pausa o necesitas registrar la próxima jornada.</p>
            <button onclick="window.futApp.openMatchModal()" class="admin-only px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs inline-flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Programar Partido</span>
            </button>
          </div>
        `;
      }
    }

    // Estado del voto del usuario activo
    const user = authService.getCurrentUser();
    const myVoteText = document.getElementById('my-current-vote-text');
    if (nextMatch && user && user.playerId && nextMatch.lineup && nextMatch.lineup.convocatoria) {
      const vote = nextMatch.lineup.convocatoria[user.playerId];
      if (vote === 'asistira') myVoteText.innerHTML = '<span class="text-emerald-400">✅ Confirmado (Asistiré)</span>';
      else if (vote === 'duda') myVoteText.innerHTML = '<span class="text-amber-400">🤔 Duda</span>';
      else if (vote === 'no_puede') myVoteText.innerHTML = '<span class="text-rose-400">❌ Baja confirmada</span>';
      else myVoteText.textContent = 'Sin responder aún';
    } else {
      if (myVoteText) myVoteText.textContent = user ? 'Sin confirmar' : 'Inicia sesión para votar';
    }

    // Tabla de Goleadores (Dashboard)
    const tbody = document.getElementById('dashboard-leaderboard-body');
    if (tbody) {
      const sorted = [...store.getPlayers()].sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists)).slice(0, 5);
      tbody.innerHTML = sorted.map((p, idx) => `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-2.5 px-3 font-mono font-bold text-slate-500">${idx + 1}</td>
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-slate-800 text-brand-300 font-bold text-xs flex items-center justify-center border border-slate-700">${p.number}</span>
              <div>
                <span class="font-semibold text-white">${p.name}</span>
                <span class="text-xs text-slate-400 block sm:inline sm:ml-1">${p.nickname ? `(${p.nickname})` : ''}</span>
              </div>
            </div>
          </td>
          <td class="py-2.5 px-3 text-center font-bold text-emerald-400">${p.goals}</td>
          <td class="py-2.5 px-3 text-center text-sky-400">${p.assists}</td>
          <td class="py-2.5 px-3 text-center text-xs">
            <span class="text-amber-400 font-bold">${p.yellowCards}</span> / <span class="text-rose-400 font-bold">${p.redCards}</span>
          </td>
        </tr>
      `).join('');
    }

    this.refreshIcons();
  }

  // --- 2. RENDER PLANTILLA ---
  renderPlayers() {
    const grid = document.getElementById('players-grid');
    if (!grid) return;

    let players = store.getPlayers();
    if (this.currentFilter !== 'ALL') {
      players = players.filter(p => p.category === this.currentFilter);
    }

    if (players.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <p class="text-slate-400 text-sm">No hay jugadores registrados en esta posición.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = players.map(p => `
      <article class="player-card bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <!-- Cabecera de la ficha -->
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${p.category === 'GK' ? 'from-amber-600 to-amber-400' : 'from-brand-700 to-sky-400'} text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
              ${p.number}
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${this.getCategoryBadgeClass(p.category)}">
                ${p.position || p.category}
              </span>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${p.feeStatus === 'pagado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
                ${p.feeStatus === 'pagado' ? 'Ficha Pagada' : 'Pago Pendiente'}
              </span>
            </div>
          </div>

          <!-- Nombre y Apodo -->
          <h3 class="font-display font-bold text-lg text-white leading-snug">${p.name}</h3>
          <p class="text-xs text-brand-400 font-medium mb-3">${p.nickname ? `"${p.nickname}"` : 'Jugador universitario'}</p>

          <!-- Datos de contacto & matrícula -->
          <div class="space-y-1 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
            ${p.studentId ? `<div class="flex items-center justify-between"><span class="text-slate-500">Matrícula:</span> <span class="font-mono text-slate-300 font-medium">${p.studentId}</span></div>` : ''}
            ${p.phone ? `<div class="flex items-center justify-between"><span class="text-slate-500">Móvil:</span> <a href="tel:${p.phone}" class="text-sky-400 hover:underline font-mono">${p.phone}</a></div>` : ''}
          </div>
        </div>

        <!-- Estadísticas del Jugador -->
        <div>
          <div class="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs mb-3">
            <div>
              <span class="block text-slate-500 text-[10px] uppercase font-bold">Goles</span>
              <span class="font-extrabold text-emerald-400 text-base">${p.goals}</span>
            </div>
            <div>
              <span class="block text-slate-500 text-[10px] uppercase font-bold">Asist.</span>
              <span class="font-extrabold text-sky-400 text-base">${p.assists}</span>
            </div>
            <div>
              <span class="block text-slate-500 text-[10px] uppercase font-bold">Tarjetas</span>
              <span class="font-bold text-amber-400 text-xs">${p.yellowCards}🟨 / ${p.redCards}🟥</span>
            </div>
          </div>

          <!-- Acciones Míster -->
          <div class="admin-only flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
            <button onclick="window.futApp.openPlayerModal('${p.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Editar Jugador">
              <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="window.futApp.deletePlayer('${p.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition" title="Eliminar Jugador">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    this.refreshIcons();
  }

  getCategoryBadgeClass(category) {
    switch (category) {
      case 'GK': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DEF': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'MID': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'FWD': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-800 text-slate-300';
    }
  }

  // --- 3. RENDER PIZARRA TÁCTICA & CONVOCATORIA ---
  renderTacticalPitch() {
    const pitch = document.getElementById('pitch-players-container');
    if (!pitch) return;

    const nextMatch = store.getNextMatch();
    const players = store.getPlayers();

    // Coordenadas tácticas según formación
    const formations = {
      // Fútbol 7 (7 jugadores)
      '3-2-1': [
        { role: 'GK', top: 88, left: 50 },
        { role: 'LI', top: 66, left: 22 },
        { role: 'DFC', top: 70, left: 50 },
        { role: 'LD', top: 66, left: 78 },
        { role: 'MC1', top: 43, left: 35 },
        { role: 'MC2', top: 43, left: 65 },
        { role: 'DC', top: 20, left: 50 }
      ],
      '2-3-1': [
        { role: 'GK', top: 88, left: 50 },
        { role: 'DFC1', top: 68, left: 33 },
        { role: 'DFC2', top: 68, left: 67 },
        { role: 'MI', top: 45, left: 20 },
        { role: 'MC', top: 43, left: 50 },
        { role: 'MD', top: 45, left: 80 },
        { role: 'DC', top: 20, left: 50 }
      ],
      '3-1-2': [
        { role: 'GK', top: 88, left: 50 },
        { role: 'LI', top: 66, left: 22 },
        { role: 'DFC', top: 70, left: 50 },
        { role: 'LD', top: 66, left: 78 },
        { role: 'MCO', top: 44, left: 50 },
        { role: 'DC1', top: 20, left: 35 },
        { role: 'DC2', top: 20, left: 65 }
      ],
      // Fútbol 11 (11 jugadores)
      '4-3-3': [
        { role: 'GK', top: 89, left: 50 },
        { role: 'LI', top: 73, left: 16 },
        { role: 'DFC1', top: 75, left: 38 },
        { role: 'DFC2', top: 75, left: 62 },
        { role: 'LD', top: 73, left: 84 },
        { role: 'MCD', top: 57, left: 50 },
        { role: 'MC1', top: 43, left: 32 },
        { role: 'MC2', top: 43, left: 68 },
        { role: 'EI', top: 23, left: 20 },
        { role: 'DC', top: 18, left: 50 },
        { role: 'ED', top: 23, left: 80 }
      ],
      '4-4-2': [
        { role: 'GK', top: 89, left: 50 },
        { role: 'LI', top: 73, left: 16 },
        { role: 'DFC1', top: 75, left: 38 },
        { role: 'DFC2', top: 75, left: 62 },
        { role: 'LD', top: 73, left: 84 },
        { role: 'MI', top: 48, left: 18 },
        { role: 'MC1', top: 49, left: 38 },
        { role: 'MC2', top: 49, left: 62 },
        { role: 'MD', top: 48, left: 82 },
        { role: 'DC1', top: 20, left: 37 },
        { role: 'DC2', top: 20, left: 63 }
      ]
    };

    const slots = formations[this.selectedFormation] || formations['3-2-1'];

    // Mapear jugadores a los slots
    let html = '';
    slots.forEach((slot, index) => {
      const player = players[index] || {
        number: '?',
        nickname: slot.role,
        name: 'Libre'
      };

      const isGK = slot.role.includes('GK');

      html += `
        <div class="pitch-player-node" style="top: ${slot.top}%; left: ${slot.left}%;" title="${player.name} (${slot.role})">
          <div class="pitch-player-jersey ${isGK ? 'gk' : ''}">
            ${player.number}
          </div>
          <span class="pitch-player-name">${player.nickname || player.name.split(' ')[0]}</span>
        </div>
      `;
    });

    pitch.innerHTML = html;

    // Convocatoria
    this.renderCallupList(nextMatch);
  }

  renderCallupList(nextMatch) {
    const list = document.getElementById('callup-players-list');
    const badge = document.getElementById('callup-summary-badge');
    if (!list) return;

    const players = store.getPlayers();
    const convocatoria = (nextMatch && nextMatch.lineup && nextMatch.lineup.convocatoria) ? nextMatch.lineup.convocatoria : {};

    let confirmedCount = 0;
    players.forEach(p => {
      if (convocatoria[p.id] === 'asistira') confirmedCount++;
    });

    if (badge) {
      badge.textContent = `${confirmedCount} Confirmados`;
    }

    list.innerHTML = players.map(p => {
      const status = convocatoria[p.id] || 'pendiente';
      return `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-slate-800 text-brand-300 font-bold text-xs flex items-center justify-center border border-slate-700">${p.number}</span>
            <div>
              <div class="text-xs font-bold text-white leading-tight">${p.name}</div>
              <div class="text-[10px] text-slate-400">${p.position}</div>
            </div>
          </div>

          <!-- Selector de estado de asistencia -->
          <div class="flex items-center gap-1">
            <button onclick="window.futApp.setPlayerAttendance('${nextMatch ? nextMatch.id : ''}', '${p.id}', 'asistira')" 
              class="px-2 py-1 rounded text-[11px] font-semibold transition ${status === 'asistira' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-emerald-400'}" title="Asistirá">
              ✅
            </button>
            <button onclick="window.futApp.setPlayerAttendance('${nextMatch ? nextMatch.id : ''}', '${p.id}', 'duda')" 
              class="px-2 py-1 rounded text-[11px] font-semibold transition ${status === 'duda' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-amber-400'}" title="Duda">
              🤔
            </button>
            <button onclick="window.futApp.setPlayerAttendance('${nextMatch ? nextMatch.id : ''}', '${p.id}', 'no_puede')" 
              class="px-2 py-1 rounded text-[11px] font-semibold transition ${status === 'no_puede' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-rose-400'}" title="No puede">
              ❌
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 4. RENDER PARTIDOS ---
  renderMatches() {
    const list = document.getElementById('matches-list');
    if (!list) return;

    const matches = store.getMatches();
    const settings = store.getSettings();

    if (matches.length === 0) {
      list.innerHTML = `
        <div class="py-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <p class="text-slate-400 text-sm">No hay partidos en el calendario.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = matches.map(m => {
      const isFinished = m.status === 'finalizado';
      const isWin = isFinished && m.goalsFor > m.goalsAgainst;
      const isDraw = isFinished && m.goalsFor === m.goalsAgainst;
      const isLoss = isFinished && m.goalsFor < m.goalsAgainst;

      return `
        <article class="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs px-2.5 py-0.5 rounded-full ${isFinished ? (isWin ? 'bg-emerald-500/20 text-emerald-400' : isDraw ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400') : 'bg-brand-500/20 text-brand-400'} font-bold">
                  ${isFinished ? (isWin ? 'VICTORIA' : isDraw ? 'EMPATE' : 'DERROTA') : 'PRÓXIMO PARTIDO'}
                </span>
                <span class="text-xs text-slate-400">${m.tournament}</span>
              </div>

              <div class="flex items-center gap-3 pt-1">
                <h3 class="font-display font-extrabold text-xl text-white">
                  ${settings.teamName} 
                  ${isFinished ? `<span class="text-brand-400 px-2 font-mono">${m.goalsFor} - ${m.goalsAgainst}</span>` : '<span class="text-slate-500 font-normal px-2">vs</span>'} 
                  ${m.rival}
                </h3>
              </div>

              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span>📅 ${this.formatDate(m.date)}</span>
                <span>⏰ ${m.time} h</span>
                <span>📍 ${m.field}</span>
              </div>

              ${m.scorers ? `<div class="text-xs text-slate-300 pt-1">⚽ <strong>Goles:</strong> ${m.scorers}</div>` : ''}
              ${m.mvp ? `<div class="text-xs text-amber-400 pt-0.5">⭐ <strong>MVP:</strong> ${m.mvp}</div>` : ''}
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-2">
              ${!isFinished ? `
                <button onclick="window.futApp.openResultModal('${m.id}')" class="admin-only px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition">
                  <i data-lucide="check-square" class="w-4 h-4"></i>
                  <span>Registrar Resultado</span>
                </button>
              ` : `
                <button onclick="window.futApp.openResultModal('${m.id}')" class="admin-only px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs">
                  Editar Acta
                </button>
              `}

              <button onclick="window.futApp.openMatchModal('${m.id}')" class="admin-only p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="Editar Partido">
                <i data-lucide="pencil" class="w-4 h-4"></i>
              </button>
              <button onclick="window.futApp.deleteMatch('${m.id}')" class="admin-only p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400" title="Eliminar">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>

          </div>
        </article>
      `;
    }).join('');

    this.refreshIcons();
  }

  // --- 5. RENDER CUOTAS Y TESORERÍA ---
  renderCuotas() {
    const tbody = document.getElementById('cuotas-table-body');
    const display = document.getElementById('cuota-amount-display');
    if (!tbody) return;

    const settings = store.getSettings();
    const players = store.getPlayers();
    if (display) display.textContent = `${settings.feeAmount} €`;

    tbody.innerHTML = players.map(p => {
      const isPaid = p.feeStatus === 'pagado';
      const isPartial = p.feeStatus === 'parcial';

      return `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 font-mono font-bold text-slate-400">${p.number}</td>
          <td class="py-3 px-4 font-semibold text-white">${p.name} ${p.nickname ? `(${p.nickname})` : ''}</td>
          <td class="py-3 px-4 font-mono text-xs text-slate-400">${p.studentId || '-'}</td>
          <td class="py-3 px-4 font-mono text-xs text-sky-400">${p.phone || '-'}</td>
          <td class="py-3 px-4 text-center">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              isPartial ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }">
              ${isPaid ? '✅ Pagado' : isPartial ? '🟡 Parcial (15€)' : '❌ Pendiente'}
            </span>
          </td>
          <td class="py-3 px-4 text-center admin-only">
            <button onclick="window.futApp.toggleFeeStatus('${p.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300">
              Cambiar Estado
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 6. RENDER AJUSTES ---
  renderSettings() {
    const settings = store.getSettings();
    const config = getActiveConfig();

    const teamInput = document.getElementById('set-team-name');
    if (teamInput && !teamInput.value) teamInput.value = settings.teamName;

    const tourInput = document.getElementById('set-tournament-name');
    if (tourInput && !tourInput.value) tourInput.value = settings.tournament;

    const coachInput = document.getElementById('set-coach-name');
    if (coachInput && !coachInput.value) coachInput.value = settings.coachName;

    const modInput = document.getElementById('set-modality');
    if (modInput) modInput.value = settings.defaultModality;

    // Campos de Firebase
    if (config) {
      const k = document.getElementById('fb-api-key');
      if (k && !k.value && config.apiKey && config.apiKey !== 'TU_API_KEY_DE_FIREBASE') k.value = config.apiKey;

      const p = document.getElementById('fb-project-id');
      if (p && !p.value && config.projectId && config.projectId !== 'tu-proyecto-rector') p.value = config.projectId;

      const d = document.getElementById('fb-auth-domain');
      if (d && !d.value && config.authDomain) d.value = config.authDomain;

      const a = document.getElementById('fb-app-id');
      if (a && !a.value && config.appId) a.value = config.appId;
    }
  }

  // --- ACCIONES RÁPIDAS Y MODALES ---
  openPlayerModal(id = null) {
    const dialog = document.getElementById('player-dialog');
    const form = document.getElementById('form-player');
    form.reset();

    if (id) {
      const p = store.getPlayerById(id);
      if (p) {
        document.getElementById('player-id').value = p.id;
        document.getElementById('player-name').value = p.name;
        document.getElementById('player-nickname').value = p.nickname;
        document.getElementById('player-number').value = p.number;
        document.getElementById('player-category').value = p.category;
        document.getElementById('player-position').value = p.position;
        document.getElementById('player-student-id').value = p.studentId;
        document.getElementById('player-phone').value = p.phone;
        document.getElementById('player-goals').value = p.goals;
        document.getElementById('player-assists').value = p.assists;
        document.getElementById('player-fee-status').value = p.feeStatus;
        document.getElementById('player-dialog-title').textContent = 'Editar Jugador';
      }
    } else {
      document.getElementById('player-id').value = '';
      document.getElementById('player-dialog-title').textContent = 'Añadir Nuevo Jugador';
    }

    dialog.showModal();
  }

  deletePlayer(id) {
    const p = store.getPlayerById(id);
    if (confirm(`¿Eliminar al jugador ${p ? p.name : ''} de la plantilla?`)) {
      store.deletePlayer(id);
    }
  }

  openMatchModal(id = null) {
    const dialog = document.getElementById('match-dialog');
    const form = document.getElementById('form-match');
    form.reset();

    if (id) {
      const m = store.getMatchById(id);
      if (m) {
        document.getElementById('match-id').value = m.id;
        document.getElementById('match-rival').value = m.rival;
        document.getElementById('match-date').value = m.date;
        document.getElementById('match-time').value = m.time;
        document.getElementById('match-field').value = m.field;
        document.getElementById('match-notes').value = m.notes || '';
      }
    } else {
      document.getElementById('match-id').value = '';
      document.getElementById('match-date').value = new Date().toISOString().split('T')[0];
    }

    dialog.showModal();
  }

  deleteMatch(id) {
    if (confirm('¿Seguro que deseas eliminar este partido del calendario?')) {
      store.deleteMatch(id);
    }
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

  quickVote(status) {
    const user = authService.getCurrentUser();
    if (!user) {
      document.getElementById('login-dialog').showModal();
      return;
    }

    const nextMatch = store.getNextMatch();
    if (!nextMatch) {
      alert('No hay partido próximo para confirmar.');
      return;
    }

    const playerId = user.playerId || (store.getPlayers()[0]?.id);
    store.setAttendance(nextMatch.id, playerId, status);
  }

  setPlayerAttendance(matchId, playerId, status) {
    if (!matchId) {
      const nextMatch = store.getNextMatch();
      if (nextMatch) matchId = nextMatch.id;
      else return;
    }
    store.setAttendance(matchId, playerId, status);
  }

  toggleFeeStatus(playerId) {
    const p = store.getPlayerById(playerId);
    if (!p) return;

    const nextStatus = p.feeStatus === 'pagado' ? 'pendiente' : (p.feeStatus === 'pendiente' ? 'parcial' : 'pagado');
    store.updatePlayer(playerId, { feeStatus: nextStatus });
  }

  quickFillLogin(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}

// Inicializar la app globalmente
window.futApp = new FutApp();
