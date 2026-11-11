/**
 * Controlador Principal - FIFA Ultimate Team (FUT) Torneo del Rector
 * Con Google Sign-In y Fichas de Jugador
 */
import { store, FACULTIES } from './store.js';
import { authService } from './auth.js';
import { 
  initFirebaseServices, 
  saveFirebaseConfig, 
  getActiveConfig 
} from './firebase-config.js';

class FutApp {
  constructor() {
    this.currentTab = 'pitch';
    this.selectedStarterIndex = null;
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
        <span>🔥 Firebase & Google Auth (Nube)</span>
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
      });
    }

    // Especialistas a balón parado
    ['captain', 'penalties', 'freekicks', 'corners'].forEach(role => {
      document.getElementById(`spec-${role}`)?.addEventListener('change', (e) => {
        store.setSpecialist(role, e.target.value);
      });
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
        bF7.className = 'px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-md transition flex items-center gap-1.5';
        bFutsal.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5';
      } else {
        bFutsal.className = 'px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold shadow-md transition flex items-center gap-1.5';
        bF7.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5';
      }
    }

    if (bF7m && bFutsalm) {
      bF7m.className = isF7 ? 'flex-1 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold' : 'flex-1 py-1 rounded-lg text-slate-400 font-bold';
      bFutsalm.className = !isF7 ? 'flex-1 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold' : 'flex-1 py-1 rounded-lg text-slate-400 font-bold';
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

    const loginDialog = document.getElementById('login-dialog');
    document.getElementById('btn-close-login')?.addEventListener('click', () => loginDialog.close());
    setupBackdropDismiss(loginDialog);

    const setupDialog = document.getElementById('player-card-setup-dialog');
    document.getElementById('btn-close-setup')?.addEventListener('click', () => setupDialog.close());
    setupBackdropDismiss(setupDialog);

    const inspectDialog = document.getElementById('player-inspect-dialog');
    document.getElementById('btn-close-inspect')?.addEventListener('click', () => inspectDialog.close());
    setupBackdropDismiss(inspectDialog);

    document.getElementById('btn-open-create-card')?.addEventListener('click', () => {
      const user = authService.getCurrentUser();
      if (!user) {
        loginDialog.showModal();
      } else {
        this.openPlayerSetupModal(user);
      }
    });
  }

  setupForms() {
    // 1. Botón Oficial de Google Sign-In
    document.getElementById('btn-google-signin')?.addEventListener('click', async () => {
      const errBox = document.getElementById('google-auth-error');
      errBox.classList.add('hidden');

      try {
        const res = await authService.signInWithGoogle();
        document.getElementById('login-dialog').close();

        // Si es un jugador nuevo o no tiene carta todavía, abrimos el configurador de Ficha FIFA
        if (res.isNew || !res.user.playerId) {
          this.openPlayerSetupModal(res.user);
        }
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      }
    });

    // 2. Formulario para Completar Ficha de Jugador FIFA (Roles de mejor a peor)
    document.getElementById('form-setup-card')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cardData = {
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
        await authService.completePlayerCard(cardData);
        document.getElementById('player-card-setup-dialog').close();
        alert('¡Tu Carta FIFA FUT ha sido creada con éxito y añadida al equipo!');
      } catch (err) {
        alert(err.message);
      }
    });

    // 3. Formulario Firebase
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
      }
    });
  }

  openPlayerSetupModal(user) {
    const dialog = document.getElementById('player-card-setup-dialog');
    document.getElementById('setup-user-name').textContent = user.name;
    document.getElementById('setup-user-email').textContent = user.email;
    if (user.photoURL) {
      document.getElementById('setup-user-avatar').src = user.photoURL;
    }
    document.getElementById('setup-nickname').value = user.name.split(' ')[0];
    dialog.showModal();
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'tab-btn active px-4 py-2 rounded-xl flex items-center gap-2 transition text-amber-400 bg-amber-500/10 border border-amber-500/30';
      } else {
        btn.className = 'tab-btn px-4 py-2 rounded-xl flex items-center gap-2 transition text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent';
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
      const userPhoto = user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

      container.innerHTML = `
        <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <img src="${userPhoto}" alt="${user.name}" class="w-7 h-7 rounded-lg object-cover border ${isMister ? 'border-amber-400' : 'border-emerald-400'}">
          <div class="hidden sm:block text-left">
            <div class="text-xs font-bold text-white leading-tight truncate max-w-[120px]">${user.name}</div>
            <div class="text-[10px] ${isMister ? 'text-amber-400' : 'text-emerald-400'} font-semibold">
              ${isMister ? 'Míster (Admin)' : 'Jugador'}
            </div>
          </div>
          <button id="btn-logout" class="ml-1 p-1 text-slate-400 hover:text-rose-400 rounded transition" title="Cerrar Sesión">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;

      document.getElementById('btn-logout')?.addEventListener('click', () => authService.signOut());
    } else {
      container.innerHTML = `
        <button id="btn-open-login" class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition">
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
    this.renderPitch();
    this.renderAlbumCards();
    this.renderMatches();
    this.renderSpecialists();
    this.updateAdminVisibility();

    const count = document.getElementById('tab-player-count');
    if (count) count.textContent = store.getPlayers().length;
  }

  // ==================== RENDER PIZARRA FIFA FUT ====================
  renderPitch() {
    const slotsContainer = document.getElementById('pitch-slots-container');
    const benchContainer = document.getElementById('pitch-bench-container');
    const svgLines = document.getElementById('chem-lines-svg');
    if (!slotsContainer || !benchContainer) return;

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

    // Calcular Química y Rating
    const chemRatingData = store.calculateTeamChemistryAndRating(slotRoles);
    document.getElementById('hud-team-rating').textContent = chemRatingData.rating;
    document.getElementById('hud-team-chemistry').textContent = chemRatingData.chemistry;
    const bar = document.getElementById('hud-chem-bar');
    if (bar) bar.style.width = `${chemRatingData.chemistry}%`;

    // Dibujar Líneas de Química
    let svgHtml = '';
    formationConfig.links.forEach(([fromIdx, toIdx]) => {
      const fromSlot = formationConfig.slots[fromIdx];
      const toSlot = formationConfig.slots[toIdx];
      const p1 = startingPlayers[fromIdx];
      const p2 = startingPlayers[toIdx];

      let chemClass = 'orange';
      if (p1 && p2) {
        if (p1.faculty === p2.faculty) chemClass = 'green';
        else if (p1.rolesHierarchy && p1.rolesHierarchy.worst === fromSlot.role) chemClass = 'red';
      }

      svgHtml += `
        <line x1="${fromSlot.left}%" y1="${fromSlot.top}%" x2="${toSlot.left}%" y2="${toSlot.top}%" class="chem-link ${chemClass}" />
      `;
    });
    svgLines.innerHTML = svgHtml;

    // Renderizar Cartas sobre el Césped
    slotsContainer.innerHTML = formationConfig.slots.map((slot, index) => {
      const player = startingPlayers[index];
      const isSelected = this.selectedStarterIndex === index;

      if (!player) {
        return `
          <div class="fut-card-slot" style="top: ${slot.top}%; left: ${slot.left}%;">
            <div class="fut-card bg-slate-900/60 border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
              + Vacío
            </div>
            <div class="fut-pos-pedestal">${slot.role}</div>
          </div>
        `;
      }

      let statusClass = 'wrong';
      if (player.rolesHierarchy) {
        if (player.rolesHierarchy.best === slot.role) statusClass = 'exact';
        else if (player.rolesHierarchy.second === slot.role || player.rolesHierarchy.third === slot.role) statusClass = 'secondary';
      }

      const facultyObj = FACULTIES.find(f => f.id === player.faculty) || FACULTIES[0];
      const cardTypeClass = player.cardType === 'totw' ? 'fut-card-totw' : (player.cardType === 'special' ? 'fut-card-special' : 'fut-card-gold');

      return `
        <div class="fut-card-slot ${isSelected ? 'ring-4 ring-amber-400 rounded-xl' : ''}" 
             style="top: ${slot.top}%; left: ${slot.left}%;"
             onclick="window.futApp.selectStarter(${index})">
          
          <div class="fut-card ${cardTypeClass}">
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

            <div class="fut-card-footer">
              <span class="fut-chem-style-badge">${player.chemStyle || 'BAS'}</span>
              <span>PAC ${player.stats.pac}</span>
              <span>SHO ${player.stats.sho}</span>
            </div>
          </div>

          <div class="fut-pos-pedestal ${statusClass}">
            <span class="fut-pos-dot"></span>
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
              <div class="fut-card-footer" style="font-size: 0.65rem;">
                <span>${p.preferredFoot}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  selectStarter(index) {
    if (this.selectedStarterIndex === null) {
      this.selectedStarterIndex = index;
      this.renderPitch();
    } else if (this.selectedStarterIndex === index) {
      this.selectedStarterIndex = null;
      this.renderPitch();
    } else {
      const starting = store.getStartingLineup();
      const p1 = starting[this.selectedStarterIndex];
      const p2 = starting[index];
      if (p1 && p2) {
        store.swapStartingPlayer(this.selectedStarterIndex, p2.id);
        store.swapStartingPlayer(index, p1.id);
      }
      this.selectedStarterIndex = null;
      this.renderPitch();
    }
  }

  selectBench(benchPlayerId) {
    if (this.selectedStarterIndex !== null) {
      store.swapStartingPlayer(this.selectedStarterIndex, benchPlayerId);
      this.selectedStarterIndex = null;
      this.renderPitch();
    } else {
      this.inspectPlayer(benchPlayerId);
    }
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
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/50 transition">
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

          <div class="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3">
            <div class="flex items-center justify-between text-emerald-400 font-bold">
              <span>🥇 Mejor Posición:</span>
              <span>${p.rolesHierarchy.best}</span>
            </div>
            <div class="flex items-center justify-between text-sky-400">
              <span>🥈 Segunda:</span>
              <span>${p.rolesHierarchy.second}</span>
            </div>
            <div class="flex items-center justify-between text-amber-400">
              <span>🥉 Tercera:</span>
              <span>${p.rolesHierarchy.third}</span>
            </div>
            <div class="flex items-center justify-between text-rose-400 font-semibold">
              <span>❌ Peor Rol:</span>
              <span>${p.rolesHierarchy.worst}</span>
            </div>
          </div>

          <button onclick="window.futApp.inspectPlayer('${p.id}')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5">
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
      <div class="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div class="w-16 h-16 rounded-xl overflow-hidden border border-amber-400/40">
          <img src="${p.avatar}" alt="${p.name}" class="w-full h-full object-cover">
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-lg text-white">${p.name}</h4>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">${p.rating} OVR</span>
          </div>
          <p class="text-xs text-slate-400 font-medium">"${p.nickname}" | Dorsal #${p.number} | ${p.preferredFoot}</p>
          <p class="text-xs text-sky-400 mt-1">${fac.icon} ${fac.name}</p>
        </div>
      </div>

      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <h5 class="text-xs font-bold uppercase text-amber-400 tracking-wider">Afinidad de Posiciones (Roles)</h5>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 rounded bg-emerald-950/40 border border-emerald-500/30">
            <span class="block text-[10px] text-emerald-400 font-bold">1º MEJOR ROL (100% QUÍMICA)</span>
            <span class="font-black text-white text-sm">${p.rolesHierarchy.best}</span>
          </div>
          <div class="p-2 rounded bg-sky-950/40 border border-sky-500/30">
            <span class="block text-[10px] text-sky-400 font-bold">2º SEGUNDO ROL (75%)</span>
            <span class="font-black text-white text-sm">${p.rolesHierarchy.second}</span>
          </div>
          <div class="p-2 rounded bg-amber-950/40 border border-amber-500/30">
            <span class="block text-[10px] text-amber-400 font-bold">3º TERCER ROL (50%)</span>
            <span class="font-black text-white text-sm">${p.rolesHierarchy.third}</span>
          </div>
          <div class="p-2 rounded bg-rose-950/40 border border-rose-500/30">
            <span class="block text-[10px] text-rose-400 font-bold">4º PEOR ROL (RIESGO 20%)</span>
            <span class="font-black text-white text-sm">${p.rolesHierarchy.worst}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h5 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Atributos FIFA</h5>
        ${this.renderStatBar('Ritmo (PAC)', p.stats.pac)}
        ${this.renderStatBar('Tiro (SHO)', p.stats.sho)}
        ${this.renderStatBar('Pase (PAS)', p.stats.pas)}
        ${this.renderStatBar('Regate (DRI)', p.stats.dri)}
        ${this.renderStatBar('Defensa (DEF)', p.stats.def)}
        ${this.renderStatBar('Físico (PHY)', p.stats.phy)}
      </div>

      <div class="text-xs text-slate-400 flex items-center justify-between px-1">
        <span>Matrícula: <strong class="text-white">${p.studentId || 'UNI-Pendiente'}</strong></span>
        <span>Teléfono: <strong class="text-white">${p.phone || 'Privado'}</strong></span>
      </div>
    `;

    document.getElementById('player-inspect-dialog').showModal();
    this.refreshIcons();
  }

  renderStatBar(label, value) {
    const color = value >= 80 ? 'bg-emerald-500' : (value >= 70 ? 'bg-amber-500' : 'bg-rose-500');
    return `
      <div>
        <div class="flex justify-between text-[11px] font-bold text-slate-300 mb-0.5">
          <span>${label}</span>
          <span>${value}</span>
        </div>
        <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
    if (!container) return;

    const nextMatch = store.getNextMatch();
    const settings = store.getSettings();

    if (nextMatch && headline) {
      headline.textContent = `${settings.teamName} vs ${nextMatch.rival}`;
      details.innerHTML = `📅 <strong>${nextMatch.date}</strong> a las <strong>${nextMatch.time} h</strong> | 📍 ${nextMatch.field} (${nextMatch.modality === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'})`;
    }

    const matches = store.getMatches();
    container.innerHTML = matches.map(m => {
      const isFinished = m.status === 'finalizado';
      return `
        <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${m.modality === 'f7' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}">
                ${m.modality === 'f7' ? 'Fútbol 7' : 'Fútbol Sala'}
              </span>
              <span class="text-xs text-slate-400">${m.tournament}</span>
            </div>
            <h4 class="font-bold text-base text-white mt-1">
              ${settings.teamName} ${isFinished ? `<span class="text-amber-400 font-mono">${m.goalsFor} - ${m.goalsAgainst}</span>` : 'vs'} ${m.rival}
            </h4>
            <div class="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span>📅 ${m.date} - ${m.time}h</span>
              <span>📍 ${m.field}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            ${isFinished && m.mvp ? `<span class="text-xs text-amber-400 font-bold">⭐ MVP: ${m.mvp}</span>` : ''}
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
      alert('No hay partido próximo programado.');
      return;
    }

    const playerId = user.playerId || (store.getPlayers()[0]?.id);
    store.setAttendance(nextMatch.id, playerId, status);
    alert('¡Tu disponibilidad para el próximo partido ha quedado registrada!');
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
    authService.signIn(email, pass).then(() => {
      document.getElementById('login-dialog').close();
    }).catch(err => alert(err.message));
  }
}

window.futApp = new FutApp();
