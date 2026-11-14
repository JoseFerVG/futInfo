/**
 * Motor táctico de alineaciones (Fútbol Sala), jerarquía de posiciones y reparto equitativo de minutos
 * Calcula el quinteto titular óptimo mediante asignación bipartita exacta (algoritmo húngaro)
 * y genera ventanas de cambios minuto a minuto compensando el historial previo de partidos.
 */

export const ALL_TACTICAL_ROLES = [
  { code: 'POR', name: 'Portero (GK)', short: 'POR', modality: 'FUTSAL', category: 'GK' },
  { code: 'CIE', name: 'Cierre (Líbero)', short: 'CIE', modality: 'FUTSAL', category: 'DEF' },
  { code: 'ALI', name: 'Ala Izquierdo', short: 'ALI', modality: 'FUTSAL', category: 'WING' },
  { code: 'ALD', name: 'Ala Derecho', short: 'ALD', modality: 'FUTSAL', category: 'WING' },
  { code: 'ALA', name: 'Ala Polivalente (Universal)', short: 'ALA', modality: 'FUTSAL', category: 'WING' },
  { code: 'PIV', name: 'Pívot (Ataque)', short: 'PIV', modality: 'FUTSAL', category: 'FWD' }
];

export const ROLE_META_MAP = ALL_TACTICAL_ROLES.reduce((acc, role) => {
  acc[role.code] = role;
  return acc;
}, {});

const LEGACY_TO_FUTSAL_ROLE = {
  POR: 'POR',
  CIE: 'CIE',
  DFC: 'CIE',
  MCD: 'CIE',
  ALI: 'ALI',
  LI: 'ALI',
  EI: 'ALI',
  ALD: 'ALD',
  LD: 'ALD',
  ED: 'ALD',
  ALA: 'ALA',
  MC: 'ALA',
  MCO: 'ALA',
  UNI: 'ALA',
  MI: 'ALA',
  MD: 'ALA',
  PIV: 'PIV',
  DC: 'PIV',
  SD: 'PIV'
};

export function normalizeFutsalRole(code, fallback = 'ALA') {
  const upper = String(code || '').trim().toUpperCase();
  const mapped = LEGACY_TO_FUTSAL_ROLE[upper];
  if (mapped && ROLE_META_MAP[mapped]) return mapped;
  return ROLE_META_MAP[fallback] ? fallback : 'ALA';
}

export function normalizeFutsalHierarchy(rh = {}, legacyFields = {}) {
  const rawOrder = Array.isArray(rh?.priorityOrder) && rh.priorityOrder.length > 0
    ? rh.priorityOrder
    : [rh?.best || legacyFields.roleBest || 'PIV', rh?.second || legacyFields.roleSecond, rh?.third || legacyFields.roleThird, rh?.fourth || legacyFields.roleFourth];

  const deduped = [];
  for (const code of rawOrder) {
    const norm = code ? normalizeFutsalRole(code, '') : '';
    if (norm && ROLE_META_MAP[norm] && !deduped.includes(norm)) {
      deduped.push(norm);
    }
  }

  let worst = normalizeFutsalRole(rh?.worst || legacyFields.roleWorst || 'POR', 'POR');
  const fallbackPool = ['PIV', 'ALI', 'ALD', 'CIE', 'ALA', 'POR'];
  for (const fb of fallbackPool) {
    if (deduped.length >= 4) break;
    if (!deduped.includes(fb) && fb !== worst) {
      deduped.push(fb);
    }
  }

  if (!ROLE_META_MAP[worst] || deduped.includes(worst)) {
    worst = ALL_TACTICAL_ROLES.find(r => !deduped.includes(r.code))?.code || 'POR';
  }

  return {
    priorityOrder: deduped.slice(0, 4),
    best: deduped[0] || 'PIV',
    second: deduped[1] || 'ALI',
    third: deduped[2] || 'ALD',
    fourth: deduped[3] || 'CIE',
    worst
  };
}

export const ROLE_EQUIVALENTS = {
  POR: [],
  CIE: ['ALA', 'ALI', 'ALD'],
  ALI: ['ALA', 'ALD', 'CIE', 'PIV'],
  ALD: ['ALA', 'ALI', 'CIE', 'PIV'],
  ALA: ['ALI', 'ALD', 'CIE', 'PIV'],
  PIV: ['ALA', 'ALI', 'ALD']
};

export function getRoleLabel(code) {
  const norm = normalizeFutsalRole(code, code);
  return ROLE_META_MAP[norm]?.name || code || 'Sin asignar';
}

export function getPlayerPriorityChain(player) {
  if (!player) {
    return { priorityOrder: ['PIV', 'ALI', 'ALD', 'CIE'], best: 'PIV', second: 'ALI', third: 'ALD', fourth: 'CIE', worst: 'POR' };
  }
  return normalizeFutsalHierarchy(player.rolesHierarchy || {}, player);
}

export function getPositionPriorityRank(player, targetRole) {
  const normTarget = normalizeFutsalRole(targetRole, 'ALA');
  const chain = getPlayerPriorityChain(player);
  const rankBonuses = [28, 18, 10, 5];

  const exactIdx = chain.priorityOrder.indexOf(normTarget);
  if (exactIdx !== -1) {
    return {
      rank: exactIdx + 1,
      matchType: 'exact',
      bonus: rankBonuses[exactIdx],
      label: `${exactIdx + 1}ª Opción`
    };
  }

  if (chain.worst === normTarget) {
    const gkExtraPenalty = normTarget === 'POR' ? -24 : 0;
    return {
      rank: -1,
      matchType: 'avoid',
      bonus: -34 + gkExtraPenalty,
      label: 'A evitar'
    };
  }

  const equivs = ROLE_EQUIVALENTS[normTarget] || [];
  for (let i = 0; i < chain.priorityOrder.length; i++) {
    if (equivs.includes(chain.priorityOrder[i])) {
      return {
        rank: i + 1,
        matchType: 'equivalent',
        bonus: Math.round(rankBonuses[i] * 0.62),
        label: `Afín (${i + 1}ª: ${chain.priorityOrder[i]})`
      };
    }
  }

  if (normTarget === 'POR') {
    return {
      rank: 99,
      matchType: 'out_of_gk',
      bonus: -12,
      label: 'No portero'
    };
  }

  return {
    rank: 99,
    matchType: 'neutral',
    bonus: 0,
    label: 'Polivalente'
  };
}

export function computeStatRoleFit(player, targetRole) {
  const normTarget = normalizeFutsalRole(targetRole, 'ALA');
  const s = player?.stats || {};
  const pac = Number(s.pac) || 70;
  const sho = Number(s.sho) || 70;
  const pas = Number(s.pas) || 70;
  const dri = Number(s.dri) || 70;
  const def = Number(s.def) || 65;
  const phy = Number(s.phy) || 72;

  let weighted = (pac + sho + pas + dri + def + phy) / 6;
  switch (normTarget) {
    case 'POR':
      weighted = def * 0.44 + phy * 0.28 + pas * 0.16 + pac * 0.12;
      break;
    case 'CIE':
      weighted = def * 0.40 + pas * 0.24 + phy * 0.22 + pac * 0.14;
      break;
    case 'ALA':
      weighted = pas * 0.30 + dri * 0.28 + pac * 0.22 + def * 0.12 + sho * 0.08;
      break;
    case 'ALI':
    case 'ALD':
      weighted = pac * 0.28 + dri * 0.30 + pas * 0.22 + sho * 0.20;
      break;
    case 'PIV':
      weighted = sho * 0.36 + phy * 0.26 + dri * 0.22 + pas * 0.16;
      break;
    default:
      break;
  }

  let footBonus = 0;
  const foot = (player?.preferredFoot || '').toLowerCase();
  const isLeftSlot = normTarget === 'ALI';
  const isRightSlot = normTarget === 'ALD';
  if (foot.includes('ambidiestro')) {
    footBonus = (isLeftSlot || isRightSlot) ? 2.5 : 1;
  } else if (isLeftSlot && foot.includes('zurdo')) {
    footBonus = 2.5;
  } else if (isRightSlot && foot.includes('diestro')) {
    footBonus = 2.5;
  }

  return ((weighted - 72) * 0.25) + footBonus;
}

/**
 * Resuelve el problema de asignación máxima bipartita (algoritmo húngaro O(N^3))
 * para maximizar la suma total de puntuaciones jugador <-> puesto sin repetidos.
 */
export function solveOptimalAssignment(scoreMatrix) {
  const nRows = scoreMatrix.length;
  if (nRows === 0) return [];
  const nCols = scoreMatrix[0]?.length || 0;
  if (nCols === 0) return [];

  const dim = Math.max(nRows, nCols);
  let maxVal = -Infinity;
  for (let i = 0; i < nRows; i++) {
    for (let j = 0; j < nCols; j++) {
      if (scoreMatrix[i][j] > maxVal) maxVal = scoreMatrix[i][j];
    }
  }
  const padCost = maxVal + 10000;

  // Matriz cuadrada (1-indexada para el algoritmo estándar de Jonker-Volgenant / Munkres)
  const cost = Array.from({ length: dim + 1 }, () => new Float64Array(dim + 1));
  for (let i = 1; i <= dim; i++) {
    for (let j = 1; j <= dim; j++) {
      if (i <= nRows && j <= nCols) {
        cost[i][j] = maxVal - scoreMatrix[i - 1][j - 1];
      } else {
        cost[i][j] = padCost;
      }
    }
  }

  const u = new Float64Array(dim + 1);
  const v = new Float64Array(dim + 1);
  const p = new Int32Array(dim + 1);
  const way = new Int32Array(dim + 1);

  for (let i = 1; i <= dim; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Float64Array(dim + 1).fill(Infinity);
    const used = new Uint8Array(dim + 1);

    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= dim; j++) {
        if (!used[j]) {
          const cur = cost[i0][j] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= dim; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const colToRow = new Array(nCols).fill(-1);
  for (let j = 1; j <= dim; j++) {
    if (j <= nCols && p[j] >= 1 && p[j] <= nRows) {
      colToRow[j - 1] = p[j] - 1;
    }
  }
  return colToRow;
}

export function buildHistorySummaryMap(matchLogs = [], players = []) {
  const map = {};
  for (const p of players) {
    if (!p?.id) continue;
    map[p.id] = {
      totalMinutes: 0,
      matchesPlayed: 0,
      starterCount: 0,
      benchCount: 0,
      lastMatchMinutes: null
    };
  }

  const sortedLogs = [...(Array.isArray(matchLogs) ? matchLogs : [])]
    .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));

  for (const log of sortedLogs) {
    const entries = Array.isArray(log?.entries) ? log.entries : [];
    for (const entry of entries) {
      if (!entry?.playerId) continue;
      if (!map[entry.playerId]) {
        map[entry.playerId] = {
          totalMinutes: 0,
          matchesPlayed: 0,
          starterCount: 0,
          benchCount: 0,
          lastMatchMinutes: null
        };
      }
      const mins = Math.max(0, Number(entry.minutes) || 0);
      const bucket = map[entry.playerId];
      bucket.totalMinutes += mins;
      if (mins > 0 || entry.convoked) {
        bucket.matchesPlayed += 1;
      }
      if (entry.started) bucket.starterCount += 1;
      else if (entry.convoked) bucket.benchCount += 1;
      bucket.lastMatchMinutes = mins;
    }
  }

  return map;
}

function getStrategyWeights(strategy) {
  switch (strategy) {
    case 'competitive':
      return { ovr: 1.35, role: 1.25, fairness: 0.2, minSubShare: 0.28 };
    case 'rotation':
      return { ovr: 0.72, role: 0.9, fairness: 1.75, minSubShare: 0.95 };
    case 'balanced':
    default:
      return { ovr: 1.0, role: 1.05, fairness: 0.95, minSubShare: 0.8 };
  }
}

function scoreCandidateForSlot(player, slotRole, historyMap, avgPriorMinutes, weights) {
  const ovr = Number(player?.rating) || 75;
  const rankInfo = getPositionPriorityRank(player, slotRole);
  const statFit = computeStatRoleFit(player, slotRole);
  const hist = historyMap[player.id] || { totalMinutes: 0, matchesPlayed: 0, benchCount: 0 };
  const deficitMinutes = avgPriorMinutes - hist.totalMinutes;
  const fairnessBoost = (deficitMinutes * 0.45) + (hist.benchCount > hist.starterCount ? 4 : 0);

  const totalScore =
    ((ovr - 70) * 1.15 * weights.ovr) +
    ((rankInfo.bonus + statFit) * weights.role) +
    (fairnessBoost * weights.fairness);

  return {
    totalScore,
    rankInfo,
    statFit,
    fairnessBoost,
    priorMinutes: hist.totalMinutes
  };
}

function chooseSubstitutionWindows(duration, benchCount, strategy) {
  if (benchCount <= 0) return [];
  const half = Math.round(duration / 2);

  if (strategy === 'competitive') {
    const lateWin = Math.min(duration - 5, Math.max(half + 6, Math.round(duration * 0.72)));
    return benchCount <= 2 ? [half, lateWin] : [Math.max(12, Math.round(duration * 0.34)), half, lateWin];
  }

  // Balanced / Rotation: dividir en tramos limpios incluyendo descanso para que los cambios sean fluidos
  if (benchCount === 1) {
    return [Math.max(8, Math.round(duration * 0.34)), Math.min(duration - 6, Math.round(duration * 0.68))];
  }

  const numWaves = benchCount >= 5 ? 4 : 3;
  if (numWaves === 3) {
    const w1 = Math.max(8, Math.round(duration * 0.28));
    const w2 = half;
    const w3 = Math.min(duration - 6, Math.round(duration * 0.74));
    return Array.from(new Set([w1, w2, w3])).sort((a, b) => a - b);
  }

  const w1 = Math.max(7, Math.round(duration * 0.22));
  const w2 = Math.max(w1 + 5, half - 3);
  const w3 = Math.min(duration - 10, half + 6);
  const w4 = Math.min(duration - 5, Math.round(duration * 0.80));
  return Array.from(new Set([w1, w2, w3, w4])).sort((a, b) => a - b);
}

/**
 * Calcula la mejor alineación titular, suplentes y calendario de cambios por minuto
 * teniendo en cuenta media OVR, orden de prioridad de posiciones, stats y compensación de minutos.
 */
export function computeMatchPlan({
  players = [],
  selectedIds = [],
  formationSlots = [],
  matchLogs = [],
  modality = 'futsal',
  matchDuration = 40,
  strategy = 'balanced'
}) {
  const duration = Math.max(10, Math.min(120, Number(matchDuration) || 40));
  const slotRoles = formationSlots.map(s => normalizeFutsalRole(typeof s === 'string' ? s : s?.role, 'ALA'));
  const slotCount = slotRoles.length;

  const selectedSet = new Set(selectedIds);
  const convoked = players.filter(p => p && selectedSet.has(p.id));
  const historyMap = buildHistorySummaryMap(matchLogs, players);

  const avgPriorMinutes = convoked.length > 0
    ? convoked.reduce((acc, p) => acc + (historyMap[p.id]?.totalMinutes || 0), 0) / convoked.length
    : 0;

  const weights = getStrategyWeights(strategy);

  // Construir matriz de idoneidad [convoked x slots]
  const scoreMatrix = convoked.map(player =>
    slotRoles.map(role => scoreCandidateForSlot(player, role, historyMap, avgPriorMinutes, weights).totalScore)
  );

  const assignment = solveOptimalAssignment(scoreMatrix);
  const starterSlots = [];
  const usedStarterIds = new Set();

  for (let slotIdx = 0; slotIdx < slotCount; slotIdx++) {
    const pIdx = assignment[slotIdx] ?? -1;
    const player = pIdx >= 0 ? convoked[pIdx] : null;
    const role = slotRoles[slotIdx];
    if (player) {
      usedStarterIds.add(player.id);
      const evalInfo = scoreCandidateForSlot(player, role, historyMap, avgPriorMinutes, weights);
      starterSlots.push({
        slotIndex: slotIdx,
        role,
        player,
        score: Math.round(evalInfo.totalScore * 10) / 10,
        rankInfo: evalInfo.rankInfo
      });
    } else {
      starterSlots.push({
        slotIndex: slotIdx,
        role,
        player: null,
        score: 0,
        rankInfo: null
      });
    }
  }

  const bench = convoked
    .filter(p => !usedStarterIds.has(p.id))
    .sort((a, b) => {
      const diffA = (historyMap[a.id]?.totalMinutes || 0);
      const diffB = (historyMap[b.id]?.totalMinutes || 0);
      if (diffA !== diffB) return diffA - diffB;
      return (b.rating || 75) - (a.rating || 75);
    });

  // Simular tramos de partido y cambios minuto a minuto
  const pitchState = starterSlots.map(s => (s.player ? { slotIndex: s.slotIndex, role: s.role, player: s.player } : null));
  const matchMinutesMap = {};
  for (const p of convoked) matchMinutesMap[p.id] = 0;

  // Determinar si la portería (slot 0) es rotatoria o protegida
  const gkCandidates = convoked.filter(p => {
    const chain = getPlayerPriorityChain(p);
    return chain.best === 'POR' || chain.second === 'POR';
  });
  const protectGk = slotRoles[0] === 'POR' && (gkCandidates.length <= 1 || strategy === 'competitive');

  const rawWindows = chooseSubstitutionWindows(duration, bench.length, strategy);
  const boundaries = [0, ...rawWindows, duration];
  const subWindows = [];

  // Copia mutable del campo y banquillo durante la simulación
  const currentOnPitch = pitchState.map(s => (s ? { ...s } : null));
  const currentBench = [...bench];
  const halftime = Math.round(duration / 2);

  for (let seg = 0; seg < boundaries.length - 1; seg++) {
    const tStart = boundaries[seg];
    const tEnd = boundaries[seg + 1];
    const segLen = Math.max(0, tEnd - tStart);

    for (const slot of currentOnPitch) {
      if (slot?.player?.id) {
        matchMinutesMap[slot.player.id] += segLen;
      }
    }

    // Al llegar al final del partido, no hay cambio después
    if (seg >= boundaries.length - 2 || currentBench.length === 0) continue;

    const nextSegIdx = seg + 1;
    const remainingDuration = duration - tEnd;
    if (remainingDuration <= 0) continue;

    // Decidir cuántos cambios ejecutar en esta ventana
    const swappableSlotsCount = currentOnPitch.filter(s => s && s.player && (!protectGk || s.role !== 'POR')).length;
    const targetSwaps = Math.min(
      currentBench.length,
      swappableSlotsCount,
      strategy === 'competitive'
        ? Math.max(1, Math.ceil(currentBench.length * 0.65))
        : Math.max(1, Math.min(swappableSlotsCount, Math.ceil(currentBench.length / Math.max(1, rawWindows.length - seg)) + (nextSegIdx === 1 ? 1 : 0)))
    );

    // Ordenar banquillo priorizando menor tiempo acumulado en partido + historial previo
    const benchCandidates = [...currentBench].sort((a, b) => {
      const mA = matchMinutesMap[a.id] + ((historyMap[a.id]?.totalMinutes || 0) * weights.fairness * 0.65);
      const mB = matchMinutesMap[b.id] + ((historyMap[b.id]?.totalMinutes || 0) * weights.fairness * 0.65);
      if (Math.abs(mA - mB) > 0.5) return mA - mB;
      return (b.rating || 75) - (a.rating || 75);
    });

    const swapsThisWindow = [];
    const usedBenchIds = new Set();
    const usedSlotIndices = new Set();

    for (const inPlayer of benchCandidates) {
      if (swapsThisWindow.length >= targetSwaps) break;
      if (usedBenchIds.has(inPlayer.id)) continue;

      let bestOutSlot = null;
      let bestPairScore = -Infinity;

      for (const slot of currentOnPitch) {
        if (!slot || !slot.player || usedSlotIndices.has(slot.slotIndex)) continue;
        if (protectGk && slot.role === 'POR') continue;

        const outPlayer = slot.player;
        const outProjected = matchMinutesMap[outPlayer.id] + ((historyMap[outPlayer.id]?.totalMinutes || 0) * weights.fairness * 0.65);
        const inProjected = matchMinutesMap[inPlayer.id] + ((historyMap[inPlayer.id]?.totalMinutes || 0) * weights.fairness * 0.65);

        // En rotación/equilibrado evitamos sacar a alguien que jugó muchísimo menos salvo necesidad táctica
        const fairnessGain = (outProjected - inProjected) * (strategy === 'competitive' ? 0.5 : 1.45);
        const rankInfo = getPositionPriorityRank(inPlayer, slot.role);
        const statFit = computeStatRoleFit(inPlayer, slot.role);
        const pairScore = fairnessGain + (rankInfo.bonus * 0.8) + (statFit * 0.7);

        if (pairScore > bestPairScore) {
          bestPairScore = pairScore;
          bestOutSlot = slot;
        }
      }

      if (!bestOutSlot) continue;

      const outPlayer = bestOutSlot.player;
      const inPrior = historyMap[inPlayer.id]?.totalMinutes || 0;
      const outPrior = historyMap[outPlayer.id]?.totalMinutes || 0;
      const rankInfo = getPositionPriorityRank(inPlayer, bestOutSlot.role);

      let reason = `Rotación fresca (${rankInfo.label})`;
      if (inPrior + 8 < outPrior) {
        reason = `Compensa carga previa (${inPrior}' vs ${outPrior}' acum.) · ${rankInfo.label}`;
      } else if (matchMinutesMap[inPlayer.id] === 0 && matchMinutesMap[outPlayer.id] > 0) {
        reason = `Equilibra minutos del partido · ${rankInfo.label}`;
      }

      swapsThisWindow.push({
        slotIndex: bestOutSlot.slotIndex,
        role: bestOutSlot.role,
        inPlayer,
        outPlayer,
        rankInfo,
        reason
      });

      usedBenchIds.add(inPlayer.id);
      usedSlotIndices.add(bestOutSlot.slotIndex);
    }

    if (swapsThisWindow.length > 0) {
      // Aplicar swaps al estado simulado
      for (const sw of swapsThisWindow) {
        const slotRef = currentOnPitch.find(s => s && s.slotIndex === sw.slotIndex);
        if (slotRef) slotRef.player = sw.inPlayer;
        const bIdx = currentBench.findIndex(p => p.id === sw.inPlayer.id);
        if (bIdx !== -1) currentBench.splice(bIdx, 1, sw.outPlayer);
      }

      const periodLabel = Math.abs(tEnd - halftime) <= 1
        ? `Min ${tEnd}' (Descanso)`
        : (tEnd < halftime ? `Min ${tEnd}' (1ª Parte)` : `Min ${tEnd}' (2ª Parte)`);

      subWindows.push({
        minute: tEnd,
        periodLabel,
        swaps: swapsThisWindow
      });
    }
  }

  // Informe por jugador (antes vs partido vs total compensado)
  const minutesReport = convoked.map(player => {
    const prior = historyMap[player.id] || { totalMinutes: 0, matchesPlayed: 0, starterCount: 0, benchCount: 0 };
    const matchMins = matchMinutesMap[player.id] || 0;
    const started = usedStarterIds.has(player.id);
    const assignedSlot = starterSlots.find(s => s.player?.id === player.id);

    return {
      player,
      started,
      assignedRole: assignedSlot?.role || null,
      beforeMinutes: prior.totalMinutes,
      matchesPlayedBefore: prior.matchesPlayed,
      matchMinutes: matchMins,
      afterMinutes: prior.totalMinutes + matchMins
    };
  }).sort((a, b) => {
    if (a.started !== b.started) return a.started ? -1 : 1;
    return b.afterMinutes - a.afterMinutes;
  });

  const outfieldTotals = minutesReport
    .filter(r => !(protectGk && r.assignedRole === 'POR'))
    .map(r => r.afterMinutes);
  const maxOut = outfieldTotals.length > 0 ? Math.max(...outfieldTotals) : 0;
  const minOut = outfieldTotals.length > 0 ? Math.min(...outfieldTotals) : 0;
  const matchOnlyTotals = minutesReport.map(r => r.matchMinutes);
  const avgMatchMinutes = matchOnlyTotals.length > 0
    ? Math.round(matchOnlyTotals.reduce((a, b) => a + b, 0) / matchOnlyTotals.length)
    : 0;
  const startersAvgOvr = starterSlots.filter(s => s.player).length > 0
    ? Math.round(starterSlots.reduce((acc, s) => acc + (s.player?.rating || 0), 0) / starterSlots.filter(s => s.player).length)
    : 0;

  return {
    modality,
    matchDuration: duration,
    strategy,
    convokedCount: convoked.length,
    slotCount,
    startersAvgOvr,
    avgMatchMinutes,
    cumulativeSpread: Math.max(0, maxOut - minOut),
    protectGk,
    starterSlots,
    bench,
    subWindows,
    minutesReport
  };
}
