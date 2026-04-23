/**
 * Family Hub — Relatórios
 * Carrega dados analíticos da API PHP e renderiza os gráficos.
 */

import { API } from './api.js';

async function init() {
  try {
    const data = await API.get('relatorios/index.php');
    renderStatusChart(data.por_status);
    renderCategoriasChart(data.por_tag);
    renderMembrosList(data.por_membro);
  } catch (error) {
    console.error('Erro ao carregar relatórios:', error);
    document.getElementById('lista-membros-relatorio').innerHTML = 
        `<p style="color:var(--text-secondary);">Erro ao carregar dados.</p>`;
  }
}

function renderStatusChart(statusObj) {
  const ctx = document.getElementById('chartStatus').getContext('2d');
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['A Fazer', 'Em Progresso', 'Concluídas'],
      datasets: [{
        data: [statusObj.todo || 0, statusObj.progress || 0, statusObj.done || 0],
        backgroundColor: ['#6b7280', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#888' } }
      }
    }
  });
}

function renderCategoriasChart(tagsArr) {
  const ctx = document.getElementById('chartCategorias').getContext('2d');
  
  if (!tagsArr || tagsArr.length === 0) {
    // Sem dados
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sem tarefas'],
        datasets: [{ data: [1], backgroundColor: ['#374151'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    return;
  }

  const labels = tagsArr.map(t => t.tag);
  const data   = tagsArr.map(t => t.total);
  
  // Cores dinâmicas para categorias
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1'];

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#888' } }
      }
    }
  });
}

function renderMembrosList(membrosArr) {
  const container = document.getElementById('lista-membros-relatorio');
  
  if (!membrosArr || membrosArr.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);">Nenhum membro ou tarefa concluída.</p>`;
    return;
  }

  // Ordenados do maior pro menor, vamos fazer barrinhas simples com HTML
  const max = Math.max(...membrosArr.map(m => m.concluidas), 1);

  container.innerHTML = `<ul style="list-style:none; padding:0; margin:0;">` + 
    membrosArr.map(m => {
      const pct = Math.round((m.concluidas / max) * 100);
      return `
      <li style="margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:14px;">
          <strong>${m.nome}</strong>
          <span>${m.concluidas} concluídas</span>
        </div>
        <div style="width:100%; height:8px; background:var(--bg-hover); border-radius:4px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:#10b981; border-radius:4px;"></div>
        </div>
      </li>
      `;
    }).join('') + `</ul>`;
}

document.addEventListener('DOMContentLoaded', init);
