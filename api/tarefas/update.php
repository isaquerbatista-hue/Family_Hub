<?php
/** PUT /api/tarefas/update.php  Body: {id, ...campos} */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

requireMethod('PUT', 'POST');
$sess = requireAuth();
$db   = getDB();
$b    = body();

$id = $b['id'] ?? '';
if (!$id) err('ID da tarefa é obrigatório.');

// Confirma que a tarefa pertence à família
$stmt = $db->prepare('SELECT * FROM tarefas WHERE id = ? AND familia_id = ?');
$stmt->execute([$id, $sess['familia_id']]);
$tarefa = $stmt->fetch();
if (!$tarefa) err('Tarefa não encontrada.', 404);

$titulo     = trim($b['titulo']     ?? $tarefa['titulo']);
$descricao  = trim($b['descricao']  ?? $tarefa['descricao']);
$tag        = trim($b['tag']        ?? $tarefa['tag']);
$prioridade = $b['prioridade']      ?? $tarefa['prioridade'];
$status     = $b['status']          ?? $tarefa['status'];
$prazo      = array_key_exists('prazo', $b) ? ($b['prazo'] ?: null) : $tarefa['prazo'];
$ordem      = array_key_exists('ordem', $b) ? (int)$b['ordem'] : (int)$tarefa['ordem'];
$membros    = $b['membros'] ?? null;   // null = não atualizar

$concluido_em = $tarefa['concluido_em'];
if ($status === 'done' && $tarefa['status'] !== 'done') {
    $concluido_em = date('Y-m-d H:i:s');
} elseif ($status !== 'done') {
    $concluido_em = null;
}

$db->prepare(
    'UPDATE tarefas SET titulo=?, descricao=?, tag=?, prioridade=?, status=?, prazo=?, ordem=?,
     concluido_em=?, atualizado_em=NOW() WHERE id=?'
)->execute([$titulo, $descricao ?: null, $tag ?: null, $prioridade, $status, $prazo,
            $ordem, $concluido_em, $id]);

// Atualizar membros se fornecidos
if ($membros !== null) {
    $db->prepare('DELETE FROM tarefa_membros WHERE tarefa_id = ?')->execute([$id]);
    if (!empty($membros)) {
        $ins = $db->prepare('INSERT IGNORE INTO tarefa_membros (tarefa_id, membro_id) VALUES (?, ?)');
        foreach ($membros as $mid) {
            $ins->execute([$id, $mid]);
        }
    }
}

// Log
$tipo = $status === 'done' && $tarefa['status'] !== 'done' ? 'concluiu'
      : ($status !== 'done' && $tarefa['status'] === 'done' ? 'reabriu' : 'editou');
$db->prepare('INSERT INTO tarefa_atividades (id, tarefa_id, membro_id, tipo) VALUES (UUID(),?,?,"' . $tipo . '")')->execute([$id, $sess['membro_id']]);

// Creditar pontos ao concluir
if ($status === 'done' && $tarefa['status'] !== 'done') {
    $resp = $db->prepare('SELECT membro_id FROM tarefa_membros WHERE tarefa_id = ?');
    $resp->execute([$id]);
    foreach ($resp->fetchAll() as $row) {
        $db->prepare('UPDATE membros SET pontos = pontos + 10 WHERE id = ?')->execute([$row['membro_id']]);
        $db->prepare('INSERT INTO pontuacao_historico (id,membro_id,delta,motivo,referencia_id) VALUES (UUID(),?,10,"tarefa_concluida",?)')->execute([$row['membro_id'], $id]);
    }
}

ok(['message' => 'Tarefa atualizada.']);
