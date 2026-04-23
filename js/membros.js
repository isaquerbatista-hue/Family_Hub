/**
 * Family Hub — Membros
 * CRUD completo de membros via API PHP.
 */

import { API } from './api.js';

let membroLogado = null;
let membros      = [];

/* ----------------------------------------------------------------
   Inicialização
---------------------------------------------------------------- */
async function init() {
  await waitForFH();
  membroLogado = window.FH.membro;

  await loadMembros();
  renderMembros();
  setupModal();
}

function waitForFH(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.FH) { resolve(); return; }
    const interval = setInterval(() => {
      if (window.FH) { clearInterval(interval); resolve(); }
    }, 50);
    setTimeout(() => { clearInterval(interval); reject(); }, timeout);
  });
}

/* ----------------------------------------------------------------
   Carregar membros via API
---------------------------------------------------------------- */
async function loadMembros() {
  try {
    membros = await API.get('membros/index.php');
  } catch (error) {
    console.error('loadMembros:', error);
  }
}

/* ----------------------------------------------------------------
   Renderização
---------------------------------------------------------------- */
function renderMembros() {
  const grid = document.getElementById('members-grid');
  if (!grid) return;

  grid.innerHTML = membros.map(m => {
    const isYou = m.id === membroLogado.id;
    const isAdmin = membroLogado.papel === 'admin';

    return `
    <div class="member-card" data-id="${m.id}">
      <span class="role-badge ${m.papel === 'admin' ? 'admin' : 'member'}">
        ${m.papel === 'admin' ? 'Administrador' : 'Membro'}
      </span>
      <div class="member-avatar-wrap">
        <div class="member-avatar-initials" style="background:${m.cor_avatar || '#888'}">${m.iniciais || m.nome[0]}</div>
        ${isYou ? '<span class="online-dot"></span>' : ''}
      </div>
      <div class="member-info">
        <div class="member-name">
          ${m.nome}
          ${isYou ? '<span class="you-tag">Você</span>' : ''}
        </div>
        <div class="member-role-title">${m.email}</div>
      </div>
      <div class="member-stats">
        <div class="stat-item">
          <span class="stat-value" id="stat-tasks-${m.id}">${m.total_tarefas || 0}</span>
          <span class="stat-label">Tarefas</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${m.pontos}</span>
          <span class="stat-label">Pontos</span>
        </div>
      </div>
      <div class="card-actions">
        ${isAdmin || isYou
          ? `<button class="card-action-btn" onclick="editMembro('${m.id}')">Editar</button>`
          : ''}
        ${isAdmin && !isYou
          ? `<button class="card-action-btn danger" onclick="removeMembro('${m.id}')">Remover</button>`
          : ''}
      </div>
    </div>`;
  }).join('') + `
  <div class="member-card add-card" id="add-member-card" onclick="openAddModal()">
    <div class="add-card-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    </div>
    <span class="add-card-label">Adicionar Membro</span>
  </div>`;
}

/* ----------------------------------------------------------------
   Modal adicionar / editar membro
---------------------------------------------------------------- */
let editingMembroId = null;

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const form    = document.getElementById('form-membro');
  const cancel  = document.getElementById('cancelar-membro');
  const close   = document.getElementById('fechar-modal-membro');

  [overlay, cancel, close].forEach(el => {
    el?.addEventListener('click', (e) => {
      if (e.target === overlay || e.target !== overlay) closeModal();
    });
  });
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  form?.addEventListener('submit', handleSaveMembro);
}

window.openAddModal = function() {
  editingMembroId = null;
  document.getElementById('modal-membro-titulo').textContent = 'Adicionar Membro';
  document.getElementById('f-membro-nome').value   = '';
  document.getElementById('f-membro-email').value  = '';
  document.getElementById('f-membro-papel').value  = 'membro';
  document.getElementById('modal-overlay').style.display = 'flex';
};

window.editMembro = function(id) {
  const m = membros.find(x => x.id === id);
  if (!m) return;
  editingMembroId = id;
  document.getElementById('modal-membro-titulo').textContent = 'Editar Membro';
  document.getElementById('f-membro-nome').value   = m.nome;
  document.getElementById('f-membro-email').value  = m.email;
  document.getElementById('f-membro-papel').value  = m.papel;
  document.getElementById('modal-overlay').style.display = 'flex';
};

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

async function handleSaveMembro(e) {
  e.preventDefault();
  const nome  = document.getElementById('f-membro-nome').value.trim();
  const email = document.getElementById('f-membro-email').value.trim();
  const papel = document.getElementById('f-membro-papel').value;

  try {
    if (editingMembroId) {
      // Editar
      await API.put('membros/update.php', { id: editingMembroId, nome, email, papel });
    } else {
      // Adicionar
      await API.post('membros/index.php', { nome, email, papel });
    }
  } catch (error) {
    alert('Erro: ' + error.message);
    return;
  }

  closeModal();
  await loadMembros();
  renderMembros();
}

window.removeMembro = async function(id) {
  if (!confirm('Remover este membro da família?')) return;
  try {
    await API.delete('membros/delete.php', { id });
  } catch (error) {
    alert('Erro: ' + error.message);
    return;
  }
  await loadMembros();
  renderMembros();
};

/* ----------------------------------------------------------------
   Boot
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => init().catch(console.error));
