/**
 * Family Hub — API Client (PHP backend)
 * Todas as chamadas HTTP passam por aqui via fetch() com credenciais (cookies de sessão).
 */

import { getMockResponse } from './mock-backend.js';

export const API = (() => {
  // Detecta o caminho base relativo à profundidade da página atual
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const base  = depth > 1 ? '../api' : 'api';

  async function req(method, path, data = null) {
    try {
      // Se não há um servidor rodando (aberto localmente), usa o Mock direto
      if (window.location.protocol === 'file:') {
        return await getMockResponse(method, path, data);
      }
      
      const opts = {
        method,
        credentials: 'include',  // envia cookie PHPSESSID
        headers: { 'Content-Type': 'application/json' },
      };
      if (data && method !== 'GET') opts.body = JSON.stringify(data);
      
      const res = await fetch(`${base}/${path}`, opts);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Erro desconhecido');
      return json.data;
    } catch (e) {
      console.warn(`[API Fallback] Falha na rede ao tentar acessar o PHP (${path}). Ativando modo MOCK simulado.`);
      return await getMockResponse(method, path, data);
    }
  }

  return {
    get:    (path)       => req('GET',    path),
    post:   (path, data) => req('POST',   path, data),
    put:    (path, data) => req('PUT',    path, data),
    delete: (path, data) => req('DELETE', path, data),
  };
})();

/**
 * Retorna os dados do usuário logado.
 * Retorna null se não autenticado.
 */
export async function getSession() {
  try {
    return await API.get('auth/me.php');
  } catch {
    return null;
  }
}

/**
 * Faz logout e redireciona.
 */
export async function logout() {
  try { await API.post('auth/logout.php'); } catch {}
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  window.location.href = depth > 1 ? '../login.html' : 'login.html';
}
