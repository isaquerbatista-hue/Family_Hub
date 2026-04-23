<?php
/**
 * Family Hub — Guard de Autenticação
 * Inclua em todo endpoint que exige sessão.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Exige sessão ativa. Retorna 401 se não autenticado.
 * Retorna o array com os dados da sessão se autenticado.
 */
function requireAuth(): array {
    if (empty($_SESSION['membro_id'])) {
        err('Não autenticado.', 401);
    }
    return [
        'membro_id'  => $_SESSION['membro_id'],
        'familia_id' => $_SESSION['familia_id'],
        'nome'       => $_SESSION['nome'],
        'papel'      => $_SESSION['papel'],
    ];
}

/**
 * Exige papel 'admin'. Retorna 403 se não for admin.
 */
function requireAdmin(): array {
    $sess = requireAuth();
    if ($sess['papel'] !== 'admin') {
        err('Acesso negado. Somente administradores.', 403);
    }
    return $sess;
}
