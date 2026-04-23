/**
 * Family Hub — Login / Cadastro / Recuperação de Senha
 * Conecta-se ao backend PHP via API.js.
 */

import { API } from './api.js';

/* ----------------------------------------------------------------
   Navegação entre telas
---------------------------------------------------------------- */
function showScreen(id) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id + '-screen');
  if (target) target.classList.add('active');
}

document.querySelectorAll('[data-screen]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showScreen(el.dataset.screen);
  });
});

/* ----------------------------------------------------------------
   Helpers de UI
---------------------------------------------------------------- */
function setError(fieldId, msg) {
  const err = document.getElementById(fieldId + '-error');
  if (err) { err.textContent = msg; err.classList.add('show'); }
  const wrap = document.querySelector(`#${fieldId}`)?.closest('.input-wrapper') ||
               document.querySelector(`[name="${fieldId}"]`)?.closest('.input-wrapper');
  if (wrap) wrap.classList.add('error');
}

function clearError(fieldId) {
  const err = document.getElementById(fieldId + '-error');
  if (err) { err.textContent = ''; err.classList.remove('show'); }
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.querySelector('.btn-text').style.display  = loading ? 'none' : '';
  btn.querySelector('.btn-loader').style.display = loading ? 'flex' : 'none';
  btn.disabled = loading;
}

function showBanner(msg, type = 'error') {
  let banner = document.getElementById('fh-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'fh-banner';
    banner.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);' +
      'padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;' +
      'z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);';
    document.body.appendChild(banner);
  }
  banner.textContent = msg;
  banner.style.background = type === 'success' ? '#10b981' : '#ef4444';
  banner.style.color = '#fff';
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 4000);
}

/* ----------------------------------------------------------------
   Toggle mostrar/ocultar senha
---------------------------------------------------------------- */
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-wrapper').querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

/* ----------------------------------------------------------------
   Validação de senha em tempo real
---------------------------------------------------------------- */
const regPwd = document.getElementById('register-password');
if (regPwd) {
  regPwd.addEventListener('input', () => {
    const v = regPwd.value;
    const set = (id, ok) => document.getElementById(id)?.classList.toggle('met', ok);
    set('req-length',    v.length >= 6);
    set('req-uppercase', /[A-Z]/.test(v));
    set('req-lowercase', /[a-z]/.test(v));
    set('req-number',    /\d/.test(v));
  });
}

/* ================================================================
   LOGIN
================================================================ */
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    let valid = true;

    if (!email)    { setError('login-email',    'Informe seu e-mail'); valid = false; }
    if (!password) { setError('login-password', 'Informe sua senha');  valid = false; }
    if (!valid) return;

    setLoading('login-btn', true);

    try {
      await API.post('auth/login.php', { email, senha: password });
      showBanner('Login realizado com sucesso!', 'success');
      setTimeout(() => { window.location.href = '../index.html'; }, 800);
    } catch (error) {
      setError('login-password', error.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading('login-btn', false);
    }
  });
}

/* ================================================================
   CADASTRO — cria família + membro admin
================================================================ */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name       = document.getElementById('register-name').value.trim();
    const email      = document.getElementById('register-email').value.trim();
    const password   = document.getElementById('register-password').value;
    const confirm    = document.getElementById('register-confirm-password').value;
    const familyName = document.getElementById('register-family-name')?.value.trim() || name + ' Family';
    const terms      = document.getElementById('register-terms').checked;
    let valid = true;

    if (!name)    { setError('register-name',  'Informe seu nome');    valid = false; }
    if (!email)   { setError('register-email', 'Informe seu e-mail');  valid = false; }
    if (password.length < 6) { setError('register-password', 'Senha muito curta'); valid = false; }
    if (password !== confirm) { setError('register-confirm-password', 'Senhas não coincidem'); valid = false; }
    if (!terms)   { setError('register-terms', 'Aceite os termos para continuar'); valid = false; }
    if (!valid) return;

    setLoading('register-btn', true);

    try {
      await API.post('auth/register.php', {
        nome: name,
        email,
        senha: password,
        familia_nome: familyName
      });
      document.getElementById('register-success').style.display = 'block';
      registerForm.style.display = 'none';
    } catch (error) {
      showBanner(error.message || 'Erro ao criar conta.');
    } finally {
      setLoading('register-btn', false);
    }
  });
}

/* ================================================================
   RECUPERAÇÃO DE SENHA (Simulação até termos backend de e-mail)
================================================================ */
const recoveryForm = document.getElementById('recovery-form');
if (recoveryForm) {
  recoveryForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('recovery-email').value.trim();
    if (!email) { setError('recovery-email', 'Informe seu e-mail'); return; }

    setLoading('recovery-btn', true);

    // Simula tempo de rede
    await new Promise(r => setTimeout(r, 1000));
    setLoading('recovery-btn', false);

    document.getElementById('recovery-success').style.display = 'block';
    document.getElementById('recovery-form').style.display = 'none';
  });
}

/* ================================================================
   LOGOUT links nas páginas internas
================================================================ */
import { logout } from './api.js';
document.querySelectorAll('[data-fh-logout], a[href*="login"]').forEach(el => {
  if (el.tagName === 'A' && el.href.includes('login')) {
    el.addEventListener('click', async ev => {
      ev.preventDefault();
      await logout();
    });
  }
});
