<?php
/** DELETE /api/membros/delete.php  Body: {id} */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('DELETE','POST');
requireAdmin();
$db = getDB();
$b  = body();
$id = $b['id'] ?? '';
$sess = requireAuth();
if (!$id) err('ID obrigatório.');
if ($id === $sess['membro_id']) err('Você não pode remover a si mesmo.', 400);
$stmt = $db->prepare('DELETE FROM membros WHERE id = ? AND familia_id = ?');
$stmt->execute([$id, $sess['familia_id']]);
if ($stmt->rowCount() === 0) err('Membro não encontrado.', 404);
ok(['message' => 'Membro removido.']);
