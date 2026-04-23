<?php
/**
 * POST /api/recompensas/resgatar.php
 * Body: { recompensa_id }
 * Debita pontos do membro logado e registra o resgate.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('POST');
$sess = requireAuth();
$db   = getDB();
$b    = body();
$rid  = $b['recompensa_id'] ?? '';
if (!$rid) err('ID da recompensa é obrigatório.');

$db->beginTransaction();
try {
    // Carrega recompensa com lock
    $stmt = $db->prepare('SELECT * FROM recompensas WHERE id=? AND familia_id=? FOR UPDATE');
    $stmt->execute([$rid, $sess['familia_id']]);
    $r = $stmt->fetch();
    if (!$r) err('Recompensa não encontrada.', 404);
    if (!$r['ativo']) err('Recompensa inativa.');
    if ($r['limite'] !== null && (int)$r['limite'] <= 0) err('Recompensa esgotada.');

    // Carrega membro com lock
    $stmt = $db->prepare('SELECT pontos FROM membros WHERE id=? FOR UPDATE');
    $stmt->execute([$sess['membro_id']]);
    $membro = $stmt->fetch();
    if ((int)$membro['pontos'] < (int)$r['pontos']) err('Pontos insuficientes.', 400);

    // Debita pontos
    $db->prepare('UPDATE membros SET pontos = pontos - ? WHERE id=?')->execute([(int)$r['pontos'], $sess['membro_id']]);

    // Decrementa limite se houver
    if ($r['limite'] !== null) {
        $db->prepare('UPDATE recompensas SET limite = limite - 1 WHERE id=?')->execute([$rid]);
    }

    // Registra resgate
    $db->prepare('INSERT INTO resgates (id,recompensa_id,membro_id,pontos_gastos) VALUES (UUID(),?,?,?)')
       ->execute([$rid, $sess['membro_id'], (int)$r['pontos']]);

    // Histórico de pontos
    $db->prepare('INSERT INTO pontuacao_historico (id,membro_id,delta,motivo,referencia_id) VALUES (UUID(),?,?,?,?)')
       ->execute([$sess['membro_id'], -(int)$r['pontos'], 'resgate', $rid]);

    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    // Se for nossa mensagem de erro, relança; caso contrário, erro interno
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
    exit;
}

// Retorna novo saldo
$stmt = $db->prepare('SELECT pontos FROM membros WHERE id=?');
$stmt->execute([$sess['membro_id']]);
$novo = $stmt->fetch();
ok(['novo_saldo' => (int)$novo['pontos'], 'recompensa' => $r['nome']]);
