/**
 * Family Hub — Dashboard dinâmico (UX Refatorado)
 * Carrega métricas, agenda, atividades e notificações da API PHP/Mock.
 */

import { API } from './api.js';

async function init() {
  await waitForFH();

  // O botão de nova tarefa redimensiona ou abre modal
  document.getElementById('btn-nova-tarefa')?.addEventListener('click', () => {
    window.location.href = 'pages/tarefas.html';
  });

  // Filtros de data
  const dateBtns = document.querySelectorAll('.date-filters button');
  dateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      dateBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      // Recarregaria com filtro (mock não muda muito, mas anima)
      loadDashboardData(); 
    });
  });

  await loadDashboardData();
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

async function loadDashboardData() {
  try {
    const data = await API.get('dashboard/index.php');

    renderMetricas(data.metricas);
    renderTarefasImediatas(data.urgentes);
    renderAgenda(data.agenda);
    renderNotificacoes(data.notificacoes);

    // Tabela: vamos pegar as próprias urgentes + concluídas e agrupar
    // O backend de dashboard traz tarefas, vamos mockar a tabela baseada em 'urgentes'
    renderTabelaAtividades(data.urgentes);
    
    // Atualiza Pontos Totais (soma do ranking)
    const totalPts = data.ranking ? data.ranking.reduce((acc, curr) => acc + curr.pontos, 0) : 0;
    setQuery('#kpi-pontos', totalPts);

  } catch (error) {
    console.error('loadDashboardData:', error);
  }
}

/* ----------------------------------------------------------------
   KPIs
---------------------------------------------------------------- */
function renderMetricas(metricas) {
  if (!metricas) return;
  setQuery('#kpi-atrasadas', metricas.atrasadas);
  setQuery('#kpi-pendentes', metricas.pendentes);
  setQuery('#kpi-concluidas', metricas.concluidas);

  const progLabel = document.getElementById('prog_lbl');
  const progFill  = document.getElementById('prog_fill');
  if (progLabel) progLabel.textContent = `${metricas.pct_semana}% Concluído`;
  if (progFill)  progFill.style.width  = `${metricas.pct_semana}%`;
}

function setQuery(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = val;
}

/* ----------------------------------------------------------------
   Ação Imediata (tarefas urgentes) - Top Left Priority
---------------------------------------------------------------- */
function renderTarefasImediatas(urgentes) {
  const list = document.getElementById('lista-urgentes-nova');
  if (!list || !urgentes) return;

  const priClass = { alta: 'prio-alta', media: 'prio-media', baixa: 'prio-baixa' };

  list.innerHTML = urgentes.map(t => {
    const resp = t.responsaveis || t.membros?.join(', ') || 'Sem atribuição';
    return `
    <li>
      <div style="display: flex; align-items: center; gap: 12px;">
        <input type="checkbox" onchange="toggleDone('${t.id}', this)" style="width:18px;height:18px;cursor:pointer;">
        <div>
          <div style="font-weight: 500; color: var(--text-primary);">${t.titulo}</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
            Responsável: ${resp}
          </div>
        </div>
      </div>
      <div>
        <span class="tag-prioridade ${priClass[t.prioridade] || 'prio-media'}">${t.prioridade.toUpperCase()}</span>
      </div>
    </li>`;
  }).join('') || '<li style="text-align:center; padding: 24px; color: var(--text-secondary);">Nenhuma tarefa urgente pendente 🎉</li>';
}

window.toggleDone = async function(id, checkbox) {
  try {
    await API.put('tarefas/update.php', { id, status: 'done' });
    checkbox.closest('li').style.opacity = '0.5';
    setTimeout(() => loadDashboardData(), 1000); // recarrega após 1s
  } catch (error) {
    console.error(error);
    checkbox.checked = false;
  }
};

/* ----------------------------------------------------------------
   Agenda
---------------------------------------------------------------- */
function renderAgenda(agenda) {
  const list = document.getElementById('lista-agenda-nova');
  if (!list || !agenda) return;

  const catClass = {
    escolar: 'cat-escolar', esportes: 'cat-esportes',
    sociais: 'cat-sociais', saude: 'cat-saude',
    trabalho: 'cat-trabalho', outros: 'cat-outros',
  };

  list.innerHTML = agenda.map(ev => {
    const dt   = new Date(ev.inicio);
    const when = dt.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    return `
    <li style="display:flex; align-items:center; gap: 12px; margin-bottom: 12px;">
      <span class="cat-dot ${catClass[ev.categoria] || 'cat-outros'}" style="width:12px;height:12px;border-radius:50%;display:inline-block;"></span>
      <div class="age-detalhe">
        <strong style="display:block; font-size: 14px;">${ev.titulo}</strong>
        <span style="font-size: 12px; color: var(--text-secondary);">${when}</span>
      </div>
    </li>`;
  }).join('') || '<li style="font-size:13px; color:var(--text-secondary);">Sem eventos próximos</li>';
}

/* ----------------------------------------------------------------
   Tabela de Histórico Recente
---------------------------------------------------------------- */
function renderTabelaAtividades(tarefas) {
  const tbody = document.getElementById('table-activities');
  if (!tbody || !tarefas) return;

  const priClass = { alta: 'color:#ef4444', media: 'color:#f59e0b', baixa: 'color:#10b981' };
  
  tbody.innerHTML = tarefas.map(t => {
    const resp = t.responsaveis || t.membros?.join(', ') || '—';
    const prazo = t.prazo ? new Date(t.prazo).toLocaleDateString('pt-BR') : 'Sem prazo';
    return `
      <tr>
        <td style="font-weight: 500;">${t.titulo}</td>
        <td><span style="font-weight:600; font-size:12px; text-transform:uppercase; ${priClass[t.prioridade] || ''}">${t.prioridade}</span></td>
        <td>${resp}</td>
        <td style="color:var(--text-secondary);">${prazo}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhuma atividade recente.</td></tr>';
}

/* ----------------------------------------------------------------
   Notificações
---------------------------------------------------------------- */
function renderNotificacoes(notifs) {
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.textContent = notifs ? notifs.length : 0;
    badge.style.display = (notifs && notifs.length > 0) ? 'flex' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => init().catch(console.error));
