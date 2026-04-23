<?php
/** DELETE /api/tarefas/delete.php  Body: {id} */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('DELETE','POST');
$sess = requireAuth();
$db   = getDB();
$b    = body();
$id   = $b['id'] ?? '';
if (!$id) err('ID obrigatório.');
$stmt = $db->prepare('DELETE FROM tarefas WHERE id = ? AND familia_id = ?');
$stmt->execute([$id, $sess['familia_id']]);
if ($stmt->rowCount() === 0) err('Tarefa não encontrada.', 404);
ok(['message' => 'Tarefa excluída.']);
