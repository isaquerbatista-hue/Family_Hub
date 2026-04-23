<?php
/**
 * GET  /api/recompensas/index.php  → lista recompensas da família
 * POST /api/recompensas/index.php  → cria recompensa (admin)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('GET','POST');
$sess = requireAuth();
$db   = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare('SELECT * FROM recompensas WHERE familia_id = ? ORDER BY categoria, pontos ASC');
    $stmt->execute([$sess['familia_id']]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['pontos'] = (int)$r['pontos'];
        $r['limite'] = $r['limite'] !== null ? (int)$r['limite'] : null;
        $r['ativo']  = (bool)$r['ativo'];
    }
    ok($rows);
}

/* POST */
requireAdmin();
$b         = body();
$nome      = trim($b['nome']      ?? '');
$descricao = trim($b['descricao'] ?? '');
$pontos    = (int)($b['pontos']   ?? 0);
$categoria = $b['categoria']      ?? 'entretenimento';
$limite    = isset($b['limite']) && $b['limite'] !== '' && $b['limite'] !== null ? (int)$b['limite'] : null;
$ativo     = isset($b['ativo']) ? (int)(bool)$b['ativo'] : 1;

if (!$nome || $pontos <= 0) err('Nome e pontos são obrigatórios.');

$db->prepare(
    'INSERT INTO recompensas (id,familia_id,nome,descricao,pontos,categoria,limite,ativo,criado_por)
     VALUES (UUID(),?,?,?,?,?,?,?,?)'
)->execute([$sess['familia_id'],$nome,$descricao ?: null,$pontos,$categoria,$limite,$ativo,$sess['membro_id']]);

$stmt = $db->prepare('SELECT * FROM recompensas WHERE criado_por=? ORDER BY criado_em DESC LIMIT 1');
$stmt->execute([$sess['membro_id']]);
ok($stmt->fetch(), 201);
