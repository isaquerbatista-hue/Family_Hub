<?php
/**
 * GET  /api/membros/index.php   → lista membros da família
 * POST /api/membros/index.php   → adiciona membro
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('GET','POST');
$sess = requireAuth();
$db   = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare(
        'SELECT m.id, m.nome, m.email, m.iniciais, m.cor_avatar, m.papel, m.pontos,
                (SELECT COUNT(*) FROM tarefa_membros tm WHERE tm.membro_id = m.id) AS total_tarefas
         FROM membros m WHERE m.familia_id = ? ORDER BY m.nome'
    );
    $stmt->execute([$sess['familia_id']]);
    ok($stmt->fetchAll());
}

/* POST — adicionar membro */
requireAdmin(); // apenas admin pode adicionar
$b       = body();
$nome    = trim($b['nome']  ?? '');
$email   = trim($b['email'] ?? '');
$senha   = $b['senha']   ?? 'Trocar@123';  // senha temporária
$papel   = in_array($b['papel'] ?? '', ['admin','membro']) ? $b['papel'] : 'membro';
$cor     = $b['cor_avatar'] ?? '#888888';

if (!$nome || !$email) err('Nome e e-mail são obrigatórios.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('E-mail inválido.');

$dup = $db->prepare('SELECT id FROM membros WHERE email = ?');
$dup->execute([$email]);
if ($dup->fetch()) err('E-mail já cadastrado.', 409);

$partes   = explode(' ', $nome);
$iniciais = strtoupper(substr($partes[0],0,1).(isset($partes[1])?substr($partes[1],0,1):''));
$hash     = password_hash($senha, PASSWORD_BCRYPT);

$db->prepare(
    'INSERT INTO membros (id,familia_id,email,senha_hash,nome,iniciais,cor_avatar,papel)
     VALUES (UUID(),?,?,?,?,?,?,?)'
)->execute([$sess['familia_id'],$email,$hash,$nome,$iniciais,$cor,$papel]);

$stmt = $db->prepare('SELECT id,nome,email,iniciais,cor_avatar,papel,pontos FROM membros WHERE email=?');
$stmt->execute([$email]);
ok($stmt->fetch(), 201);
