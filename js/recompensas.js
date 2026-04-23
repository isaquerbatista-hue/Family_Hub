/**
 * Family Hub — Recompensas
 * Usa a API PHP para gerenciar e resgatar recompensas.
 */

import { API } from './api.js';

let recompensas  = [];
let membroAtual  = null;
let viewMode     = 'grid';
let resgateTarget = null;

const CATEGORY_LABELS = {
  viagem:         '✈️ Viagens',
  entretenimento: '🎮 Entretenimento',
  descanso:       '😴 Descanso',
  compras:        '🛍️ Compras',
  comida:         '🍔 Comida',
  esportes:       '⚽ Esportes',
};

/* ----------------------------------------------------------------
   Init
---------------------------------------------------------------- */
async function init() {
  await waitForFH();
  membroAtual = window.FH.membro;

  updatePontosUI();
  await loadRecompensas();
  renderAll();
  setupUI();
}

function waitForFH(t = 5000) {
  return new Promise((res, rej) => {
    if (window.FH) { res(); return; }
    const iv = setInterval(() => { if (window.FH) { clearInterval(iv); res(); } }, 50);
    setTimeout(() => { clearInterval(iv); rej(); }, t);
  });
}

function updatePontosUI() {
  const el = document.getElementById('pontos-atuais');
  if (el) el.textContent = membroAtual.pontos;
}

/* ----------------------------------------------------------------
   Dados
---------------------------------------------------------------- */
async function loadRecompensas() {
  try {
    recompensas = await API.get('recompensas/index.php');
  } catch (error) {
    console.error('loadRecompensas:', error);
  }
}

async function saveRecompensa(payload, editId = null) {
  try {
    if (editId) {
      payload.id = editId;
      await API.put('recompensas/update.php', payload);
    } else {
      await API.post('recompensas/index.php', payload);
    }
    await loadRecompensas();
    renderAll();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}

async function deleteRecompensa(id) {
  try {
    await API.delete('recompensas/delete.php', { id });
    recompensas = recompensas.filter(r => r.id !== id);
    renderAll();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}

async function confirmarResgate(recompensa) {
  if (membroAtual.pontos < recompensa.pontos) {
    alert('Pontos insuficientes.');
    return;
  }

  try {
    const result = await API.post('recompensas/resgatar.php', { recompensa_id: recompensa.id });
    
    // Atualiza saldo na UI
    membroAtual.pontos = result.novo_saldo;
    updatePontosUI();
    
    fecharModalResgate();
    await loadRecompensas();
    renderAll();
    alert(`✅ "${result.recompensa}" resgatada com sucesso!`);
  } catch (error) {
    alert('Erro ao resgatar: ' + error.message);
  }
}

/* ----------------------------------------------------------------
   Renderização
---------------------------------------------------------------- */
function getFiltered() {
  const busca  = (document.getElementById('busca-recompensa')?.value || '').toLowerCase();
  const pontos = document.getElementById('filtro-pontos')?.value || '';

  return recompensas.filter(r => {
    if (!r.ativo) return false;
    if (busca && !r.nome.toLowerCase().includes(busca) && !r.descricao?.toLowerCase().includes(busca)) return false;
    if (pontos === 'baixo'  && r.pontos > 500)   return false;
    if (pontos === 'medio'  && (r.pontos <= 500 || r.pontos > 1500)) return false;
    if (pontos === 'alto'   && r.pontos <= 1500) return false;
    return true;
  });
}

function renderAll() {
  const filtered = getFiltered();
  const container = document.getElementById('recompensas-container');
  if (!container) return;

  const byCategory = {};
  filtered.forEach(r => {
    if (!byCategory[r.categoria]) byCategory[r.categoria] = [];
    byCategory[r.categoria].push(r);
  });

  if (Object.keys(byCategory).length === 0) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:40px">Nenhuma recompensa encontrada.</p>`;
    return;
  }

  container.innerHTML = Object.entries(byCategory).map(([cat, items]) => `
    <section class="categoria-section card">
      <h3 class="categoria-titulo">${CATEGORY_LABELS[cat] || cat}</h3>
      <div class="recompensas-grid ${viewMode === 'lista' ? 'lista-view' : ''}">
        ${items.map(r => renderCard(r)).join('')}
      </div>
    </section>
  `).join('');
}

function renderCard(r) {
  const podeResgatar = membroAtual.pontos >= r.pontos;
  const esgotado     = r.limite !== null && r.limite <= 0;
  return `
  <div class="recompensa-card ${esgotado ? 'esgotado' : ''}">
    <div class="recompensa-nome">${r.nome}</div>
    ${r.descricao ? `<div class="recompensa-desc">${r.descricao}</div>` : ''}
    <div class="recompensa-footer">
      <span class="recompensa-pontos">🏆 ${r.pontos} pts</span>
      ${r.limite !== null ? `<span class="recompensa-limite">${r.limite} restante${r.limite !== 1 ? 's' : ''}</span>` : ''}
    </div>
    <div class="recompensa-actions">
      <button class="btn-resgatar ${podeResgatar && !esgotado ? '' : 'disabled'}"
        ${esgotado ? 'disabled title="Esgotado"' : ''}
        ${!podeResgatar ? 'disabled title="Pontos insuficientes"' : ''}
        onclick="abrirResgate('${r.id}')">
        ${esgotado ? 'Esgotado' : 'Resgatar'}
      </button>
      ${membroAtual.papel === 'admin'
        ? `<button class="btn-editar-r" onclick="editRecompensa('${r.id}')">✏️</button>
           <button class="btn-del-r"   onclick="removerRecompensa('${r.id}')">🗑</button>`
        : ''}
    </div>
  </div>`;
}

/* ----------------------------------------------------------------
   UI / Modal
---------------------------------------------------------------- */
function setupUI() {
  document.getElementById('btn-nova-recompensa')?.addEventListener('click', () => abrirModalRecompensa());
  document.getElementById('btn-toggle-view')?.addEventListener('click', () => {
    viewMode = viewMode === 'grid' ? 'lista' : 'grid';
    renderAll();
  });
  document.getElementById('busca-recompensa')?.addEventListener('input', renderAll);
  document.getElementById('filtro-pontos')?.addEventListener('change', renderAll);
  document.getElementById('fechar-modal')?.addEventListener('click', fecharModalRecompensa);
  document.getElementById('cancelar-recompensa')?.addEventListener('click', fecharModalRecompensa);
  document.getElementById('fechar-modal-resgate')?.addEventListener('click', fecharModalResgate);
  document.getElementById('cancelar-resgate')?.addEventListener('click', fecharModalResgate);
  document.getElementById('confirmar-resgate')?.addEventListener('click', () => {
    if (resgateTarget) confirmarResgate(resgateTarget);
  });
  document.getElementById('form-recompensa')?.addEventListener('submit', handleSalvar);

  document.getElementById('modal-recompensa')?.addEventListener('click', e => {
    if (e.target.id === 'modal-recompensa') fecharModalRecompensa();
  });
  document.getElementById('modal-resgate')?.addEventListener('click', e => {
    if (e.target.id === 'modal-resgate') fecharModalResgate();
  });
}

let editandoId = null;

window.abrirResgate = function(id) {
  const r = recompensas.find(x => x.id === id);
  if (!r) return;
  resgateTarget = r;
  document.getElementById('resgate-nome').textContent   = r.nome;
  document.getElementById('resgate-pontos').textContent = r.pontos + ' pontos';
  document.getElementById('pontos-usuario').textContent = membroAtual.pontos;
  document.getElementById('modal-resgate').style.display = 'flex';
};

function fecharModalResgate() {
  document.getElementById('modal-resgate').style.display = 'none';
  resgateTarget = null;
}

function abrirModalRecompensa(r = null) {
  editandoId = r?.id ?? null;
  document.getElementById('modal-titulo').textContent = r ? 'Editar Recompensa' : 'Nova Recompensa';
  document.getElementById('nome-recompensa').value       = r?.nome       ?? '';
  document.getElementById('descricao-recompensa').value  = r?.descricao  ?? '';
  document.getElementById('pontos-recompensa').value     = r?.pontos     ?? '';
  document.getElementById('categoria-recompensa').value  = r?.categoria  ?? 'entretenimento';
  document.getElementById('limite-recompensa').value     = r?.limite     ?? '';
  document.getElementById('ativo-recompensa').checked    = r?.ativo      ?? true;
  document.getElementById('modal-recompensa').style.display = 'flex';
}

function fecharModalRecompensa() {
  document.getElementById('modal-recompensa').style.display = 'none';
}

async function handleSalvar(e) {
  e.preventDefault();
  const payload = {
    nome:      document.getElementById('nome-recompensa').value.trim(),
    descricao: document.getElementById('descricao-recompensa').value.trim(),
    pontos:    parseInt(document.getElementById('pontos-recompensa').value),
    categoria: document.getElementById('categoria-recompensa').value,
    limite:    document.getElementById('limite-recompensa').value
               ? parseInt(document.getElementById('limite-recompensa').value) : null,
    ativo:     document.getElementById('ativo-recompensa').checked,
  };
  await saveRecompensa(payload, editandoId);
  fecharModalRecompensa();
}

window.editRecompensa = function(id) {
  abrirModalRecompensa(recompensas.find(r => r.id === id));
};

window.removerRecompensa = async function(id) {
  if (!confirm('Excluir esta recompensa?')) return;
  await deleteRecompensa(id);
};

document.addEventListener('DOMContentLoaded', () => init().catch(console.error));
