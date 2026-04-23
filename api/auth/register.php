<?php
/**
 * POST /api/auth/register.php
 * Body: { nome, email, senha, familia_nome }
 * Cria a família e o primeiro membro (admin).
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

requireMethod('POST');

$b = body();
$nome        = trim($b['nome']        ?? '');
$email       = trim($b['email']       ?? '');
$senha       = $b['senha']            ?? '';
$familiaNome = trim($b['familia_nome'] ?? $nome . ' Family');

if (!$nome || !$email || !$senha) {
    err('Nome, e-mail e senha são obrigatórios.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    err('E-mail inválido.');
}
if (strlen($senha) < 6) {
    err('Senha deve ter ao menos 6 caracteres.');
}

$db = getDB();

// Verifica e-mail duplicado
$stmt = $db->prepare('SELECT id FROM membros WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    err('Este e-mail já está cadastrado.', 409);
}

// Gera iniciais
$partes   = explode(' ', $nome);
$iniciais = strtoupper(substr($partes[0], 0, 1) . (isset($partes[1]) ? substr($partes[1], 0, 1) : ''));

// Paleta de cores padrão para o primeiro membro
$coresDefault = ['#3b82f6','#ec4899','#f59e0b','#10b981','#8b5cf6','#ef4444'];
$cor = $coresDefault[0];

try {
    $db->beginTransaction();

    // 1. Criar família
    $familiaId = bin2hex(random_bytes(9)); // UUID simplificado
    $db->prepare('INSERT INTO familias (id, nome) VALUES (UUID(), ?)')->execute([$familiaNome]);
    $familiaId = $db->lastInsertId(); // MySQL não retorna UUID direto; usamos sub-select
    // Recarrega o UUID real
    $stmt = $db->prepare('SELECT id FROM familias ORDER BY criado_em DESC LIMIT 1');
    $stmt->execute();
    $familia = $stmt->fetch();
    $familiaId = $familia['id'];

    // 2. Criar membro admin
    $senhaHash = password_hash($senha, PASSWORD_BCRYPT);
    $db->prepare(
        'INSERT INTO membros (id, familia_id, email, senha_hash, nome, iniciais, cor_avatar, papel)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, "admin")'
    )->execute([$familiaId, $email, $senhaHash, $nome, $iniciais, $cor]);

    // Recarrega membro
    $stmt = $db->prepare('SELECT * FROM membros WHERE email = ?');
    $stmt->execute([$email]);
    $membro = $stmt->fetch();

    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    err('Erro interno ao criar conta: ' . $e->getMessage(), 500);
}

// Inicia sessão
$_SESSION['membro_id']  = $membro['id'];
$_SESSION['familia_id'] = $membro['familia_id'];
$_SESSION['nome']       = $membro['nome'];
$_SESSION['papel']      = $membro['papel'];

ok([
    'membro' => [
        'id'        => $membro['id'],
        'nome'      => $membro['nome'],
        'email'     => $membro['email'],
        'papel'     => $membro['papel'],
        'pontos'    => $membro['pontos'],
        'iniciais'  => $membro['iniciais'],
        'cor_avatar'=> $membro['cor_avatar'],
    ],
    'familia' => ['id' => $familiaId, 'nome' => $familiaNome],
], 201);
