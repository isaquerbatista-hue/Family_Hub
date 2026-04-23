/**
 * Family Hub — Mock Backend
 * Simula as respostas da API PHP para permitir uso sem o servidor rodando.
 */

const DB = {
  membro: {
    id: 'mock-user-1',
    nome: 'Bruno (Mock)',
    email: 'bruno@mock.com',
    papel: 'admin',
    pontos: 350,
    iniciais: 'BR',
    cor_avatar: '#3b82f6'
  },
  familia: {
    id: 'mock-fam-1',
    nome: 'Família Silva'
  },
  membros: [
    { id: 'mock-user-1', nome: 'Bruno (Mock)', email: 'bruno@mock.com', papel: 'admin', pontos: 350, iniciais: 'BR', cor_avatar: '#3b82f6', total_tarefas: 12 },
    { id: 'mock-user-2', nome: 'Alice', email: 'alice@mock.com', papel: 'membro', pontos: 120, iniciais: 'AL', cor_avatar: '#ec4899', total_tarefas: 8 },
    { id: 'mock-user-3', nome: 'Carlos', email: 'carlos@mock.com', papel: 'membro', pontos: 95, iniciais: 'CA', cor_avatar: '#10b981', total_tarefas: 5 }
  ],
  tarefas: [
    { id: 't1', titulo: 'Comprar mantimentos', tag: 'Compras', prioridade: 'alta', status: 'todo', membros: ['Bruno (Mock)'], prazo: '2026-12-01' },
    { id: 't2', titulo: 'Lavar o carro', tag: 'Limpeza', prioridade: 'media', status: 'progress', membros: ['Carlos'], prazo: '2026-12-05' },
    { id: 't3', titulo: 'Pagar contas', tag: 'Finanças', prioridade: 'alta', status: 'done', membros: ['Bruno (Mock)', 'Alice'], prazo: '2026-11-20' }
  ],
  recompensas: [
    { id: 'r1', nome: 'Noite de Pizza', descricao: 'Direito a escolher o sabor da pizza', pontos: 100, categoria: 'comida', limite: null, ativo: true },
    { id: 'r2', nome: 'Cinema no Fim de Semana', descricao: 'Ingressos e pipoca', pontos: 300, categoria: 'entretenimento', limite: 2, ativo: true }
  ]
};

export async function getMockResponse(method, path, data) {
  // Simula latência de rede
  await new Promise(r => setTimeout(r, 200));

  console.log(`[MOCK] ${method} ${path}`, data || '');

  // Auth
  if (path.includes('auth/me.php') || path.includes('auth/login.php') || path.includes('auth/register.php')) {
    return { membro: DB.membro, familia: DB.familia };
  }
  if (path.includes('auth/logout.php')) {
    return true;
  }

  // Dashboard
  if (path.includes('dashboard/index.php')) {
    return {
      metricas: { pendentes: 2, concluidas: 1, atrasadas: 0, pct_semana: 33 },
      urgentes: DB.tarefas.filter(t => t.status !== 'done'),
      agenda: [
        { titulo: 'Reunião de Pais', inicio: new Date().toISOString(), categoria: 'escolar' },
        { titulo: 'Futebol', inicio: new Date(Date.now() + 86400000).toISOString(), categoria: 'esportes' }
      ],
      ranking: DB.membros.map(m => ({ nome: m.nome, pontos: m.pontos })).sort((a,b)=>b.pontos - a.pontos),
      notificacoes: [
        { mensagem: 'Alice concluiu uma tarefa!', criado_em: new Date().toISOString() }
      ]
    };
  }

  // Relatórios
  if (path.includes('relatorios/index.php')) {
    return {
      por_membro: [
        { nome: 'Bruno (Mock)', concluidas: 15 },
        { nome: 'Alice', concluidas: 10 },
        { nome: 'Carlos', concluidas: 5 }
      ],
      por_tag: [
        { tag: 'Compras', total: 8 },
        { tag: 'Limpeza', total: 6 },
        { tag: 'Finanças', total: 3 }
      ],
      por_status: { todo: 5, progress: 2, done: 12 }
    };
  }

  // Tarefas
  if (path.includes('tarefas/index.php')) {
    if (method === 'GET') return DB.tarefas;
    if (method === 'POST') {
      const newTask = { id: 't_' + Date.now(), ...data };
      DB.tarefas.push(newTask);
      return newTask;
    }
  }
  if (path.includes('tarefas/update.php')) return true;
  if (path.includes('tarefas/delete.php')) return true;

  // Membros
  if (path.includes('membros/index.php')) {
    if (method === 'GET') return DB.membros;
    if (method === 'POST') return true;
  }
  if (path.includes('membros/update.php') || path.includes('membros/delete.php')) return true;

  // Recompensas
  if (path.includes('recompensas/index.php')) {
    if (method === 'GET') return DB.recompensas;
    if (method === 'POST') return true;
  }
  if (path.includes('recompensas/update.php') || path.includes('recompensas/delete.php')) return true;
  if (path.includes('recompensas/resgatar.php')) {
    DB.membro.pontos -= 100; // simulação estática
    return { novo_saldo: DB.membro.pontos, recompensa: 'Prêmio Resgatado (Mock)' };
  }

  return [];
}
