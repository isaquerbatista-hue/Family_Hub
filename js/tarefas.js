/**
 * Family Hub — Tarefas
 * Conecta com o backend PHP.
 * Mantém toda a UI/UX existente intacta.
 */

import { API } from './api.js';

/* ----------------------------------------------------------------
   Estado global
---------------------------------------------------------------- */
let tasks    = [];
let membros  = [];
let membroAtual = null;

const MEMBER_COLORS   = {};
const MEMBER_INITIALS = {};

let nextTempId = -1;          // IDs temporários negativos (antes do save)
let editingId  = null;
let selectedPriority = 'baixa';
let selectedMembers  = [];
let calView   = 'month';
let calDate   = new Date();
let currentView = 'kanban';
let draggedId   = null;
let detailId    = null;

const STATUS_LABELS = { todo: 'A Fazer', progress: 'Em Progresso', done: 'Concluída' };
const STATUS_COLORS = { todo: '#6b7280', progress: '#f59e0b', done: '#10b981' };
const COLS = [
  { id: 'todo',     label: 'A Fazer',      color: '#6b7280' },
  { id: 'progress', label: 'Em Progresso', color: '#f59e0b' },
  { id: 'done',     label: 'Concluída',    color: '#10b981' },
];

/* ================================================================
   INICIALIZAÇÃO
================================================================ */
async function init() {
  await waitForFH();
  membroAtual = window.FH.membro;

  // Carrega membros para preencher pickers e filtros
  membros = await API.get('membros/index.php');
  membros.forEach(m => {
    MEMBER_COLORS[m.nome]   = m.cor_avatar || '#888';
    MEMBER_INITIALS[m.nome] = m.iniciais   || m.nome[0];
  });
  populateMemberPickers();
  populateMemberFilters();

  // Carrega tarefas
  await loadTasks();
  renderAll();
}

function waitForFH(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.FH) { resolve(); return; }
    const interval = setInterval(() => {
      if (window.FH) { clearInterval(interval); resolve(); }
    }, 50);
    setTimeout(() => { clearInterval(interval); reject(new Error('FH timeout')); }, timeout);
  });
}

/* ================================================================
   PERSISTÊNCIA — PHP API
================================================================ */
async function loadTasks() {
  try {
    const data = await API.get('tarefas/index.php');
    tasks = data.map(t => ({
      id:       t.id,
      title:    t.titulo,
      desc:     t.descricao || '',
      tag:      t.tag       || '',
      priority: t.prioridade,
      status:   t.status,
      due:      t.prazo     || '',
      ordem:    t.ordem,
      members:  t.membros   || [],
      created:  new Date(t.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' }),
    }));
  } catch (error) {
    console.error('loadTasks:', error);
  }
}

async function saveTask(task) {
  // Pega IDs dos membros selecionados
  const membroIds = membros
    .filter(m => task.members.includes(m.nome))
    .map(m => m.id);

  const payload = {
    titulo:      task.title,
    descricao:   task.desc,
    tag:         task.tag,
    prioridade:  task.priority,
    status:      task.status,
    prazo:       task.due || null,
    ordem:       task.ordem || 0,
    membros:     membroIds,
  };

  try {
    if (typeof task.id === 'string' && !task.id.startsWith('temp_')) {
      // Editar
      payload.id = task.id;
      await API.put('tarefas/update.php', payload);
    } else {
      // Criar
      const data = await API.post('tarefas/index.php', payload);
      task.id = data.id;
    }
  } catch (error) {
    console.error('saveTask:', error);
  }
}

async function deleteTaskDB(id) {
  if (typeof id !== 'string' || id.startsWith('temp_')) return;
  try {
    await API.delete('tarefas/delete.php', { id });
  } catch (error) {
    console.error('deleteTaskDB:', error);
  }
}

async function updateTaskOrder() {
  const updates = tasks.map((t, i) =>
    (typeof t.id === 'string' && !t.id.startsWith('temp_'))
      ? API.put('tarefas/update.php', { id: t.id, ordem: i })
      : Promise.resolve()
  );
  await Promise.all(updates);
}

async function markDone(task) {
  if (task.status !== 'done') return;
  // A atualização que marca status=done já é tratada pelo saveTask/update.php,
  // que por sua vez credita os pontos aos membros responsáveis no backend.
}

/* ================================================================
   PICKERS DE MEMBROS DINÂMICOS
================================================================ */
function populateMemberPickers() {
  const picker = document.getElementById('member-picker');
  if (!picker) return;
  picker.innerHTML = membros.map(m =>
    `<button type="button" class="member-pill" data-member="${m.nome}">
       <div class="pill-dot" style="background:${m.cor_avatar}"></div>
       ${m.nome}
     </button>`
  ).join('');

  picker.querySelectorAll('.member-pill').forEach(p => {
    p.addEventListener('click', () => {
      const name = p.dataset.member;
      if (selectedMembers.includes(name)) selectedMembers = selectedMembers.filter(x => x !== name);
      else selectedMembers.push(name);
      p.classList.toggle('selected', selectedMembers.includes(name));
    });
  });
}

function populateMemberFilters() {
  ['kanban-filter-member', 'list-filter-member', 'calendar-filter-member'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const opts = membros.map(m => `<option value="${m.nome}">${m.nome}</option>`).join('');
    sel.innerHTML = `<option value="">Membro: Todos</option>` + opts;
  });
}

/* ================================================================
   Exporta funções que o HTML inline usa via window
================================================================ */
window.tarefasApp = {
  openDetail: (id) => openDetail(id),
  openModal:  (id, status, date) => openModal(id, status, date),
  deleteTask: async (id) => {
    tasks = tasks.filter(t => t.id !== id);
    await deleteTaskDB(id);
    renderAll();
  },
};
window.openDetail  = (id) => openDetail(id);
window.openModal   = (id, s, d) => openModal(id, s, d);
window.deleteTask  = window.tarefasApp.deleteTask;

/* ================================================================
   Aqui continuam as funções de renderização (renderKanban, etc).
   Pode ser mesclado com o código anterior ou mantido assim se as
   funções de renderização estiverem no HTML.
================================================================ */
document.addEventListener('DOMContentLoaded', () => init().catch(console.error));
