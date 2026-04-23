<?php
/** PUT /api/recompensas/update.php */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('PUT','POST');
requireAdmin();
$db   = getDB();
$sess = requireAuth();
$b    = body();
$id   = $b['id'] ?? '';
if (!$id) err('ID obrigatório.');
$stmt = $db->prepare('SELECT * FROM recompensas WHERE id=? AND familia_id=?');
$stmt->execute([$id,$sess['familia_id']]);
$r = $stmt->fetch();
if (!$r) err('Recompensa não encontrada.',404);
$nome      = trim($b['nome']      ?? $r['nome']);
$descricao = trim($b['descricao'] ?? $r['descricao']);
$pontos    = (int)($b['pontos']   ?? $r['pontos']);
$categoria = $b['categoria']      ?? $r['categoria'];
$limite    = array_key_exists('limite',$b) ? ($b['limite']!==''&&$b['limite']!==null?(int)$b['limite']:null) : $r['limite'];
$ativo     = isset($b['ativo']) ? (int)(bool)$b['ativo'] : (int)$r['ativo'];
$db->prepare('UPDATE recompensas SET nome=?,descricao=?,pontos=?,categoria=?,limite=?,ativo=?,atualizado_em=NOW() WHERE id=?')
   ->execute([$nome,$descricao?:null,$pontos,$categoria,$limite,$ativo,$id]);
ok(['message'=>'Recompensa atualizada.']);
