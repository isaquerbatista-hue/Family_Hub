<?php
/**
 * POST /api/auth/login.php
 * Body: { email, senha }
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

requireMethod('POST');

$b     = body();
$email = trim($b['email'] ?? '');
$senha = $b['senha'] ?? '';

if (!$email || !$senha) {
    err('E-mail e senha são obrigatórios.');
}

$db = getDB();

$stmt = $db->prepare('SELECT m.*, f.nome AS familia_nome FROM membros m JOIN familias f ON f.id = m.familia_id WHERE m.email = ?');
$stmt->execute([$email]);
$membro = $stmt->fetch();

if (!$membro || !password_verify($senha, $membro['senha_hash'])) {
    err('E-mail ou senha incorretos.', 401);
}

// Regenera ID de sessão por segurança
session_regenerate_id(true);

$_SESSION['membro_id']  = $membro['id'];
$_SESSION['familia_id'] = $membro['familia_id'];
$_SESSION['nome']       = $membro['nome'];
$_SESSION['papel']      = $membro['papel'];

ok([
    'membro' => [
        'id'         => $membro['id'],
        'nome'       => $membro['nome'],
        'email'      => $membro['email'],
        'papel'      => $membro['papel'],
        'pontos'     => (int)$membro['pontos'],
        'iniciais'   => $membro['iniciais'],
        'cor_avatar' => $membro['cor_avatar'],
        'notif_email_diario'   => (bool)$membro['notif_email_diario'],
        'notif_tarefas_atraso' => (bool)$membro['notif_tarefas_atraso'],
        'notif_atribuicao'     => (bool)$membro['notif_atribuicao'],
    ],
    'familia' => [
        'id'   => $membro['familia_id'],
        'nome' => $membro['familia_nome'],
    ],
]);
