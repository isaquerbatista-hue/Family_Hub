/**
 * Family Hub — Auth Guard
 * Inclua este script em TODAS as páginas internas (exceto login.html).
 * Redireciona automaticamente para login se não houver sessão ativa.
 */

import { getSession, logout } from './api.js';

const LOGIN_URL = (() => {
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  return depth > 1 ? '../login.html' : 'login.html';
})();

(async function guard() {
  const session = await getSession();

  if (!session || !session.membro) {
    window.location.replace(LOGIN_URL);
    return;
  }

  // Expõe dados globalmente
  window.FH = {
    membro: session.membro,
    familia: session.familia,
    logout,
  };

  // Atualiza elementos de UI
  document.querySelectorAll('[data-fh-user-name]').forEach(el => {
    el.textContent = session.membro.nome;
  });
  document.querySelectorAll('[data-fh-user-pontos]').forEach(el => {
    el.textContent = session.membro.pontos;
  });

  // Conecta botões de logout
  document.querySelectorAll('[data-fh-logout]').forEach(btn => {
    btn.addEventListener('click', logout);
  });
})();
