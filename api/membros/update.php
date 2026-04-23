<?php
/** PUT /api/membros/update.php  Body: {id?, nome, email, papel, cor_avatar, notif_*} */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('PUT','POST');
$sess = requireAuth();
$db   = getDB();
$b    = body();

// Se não há id, edita o próprio perfil
$id = $b['id'] ?? $sess['membro_id'];

// Apenas admin pode editar outros membros
if ($id !== $sess['membro_id']) requireAdmin();

$stmt = $db->prepare('SELECT * FROM membros WHERE id = ? AND familia_id = ?');
$stmt->execute([$id, $sess['familia_id']]);
$m = $stmt->fetch();
if (!$m) err('Membro não encontrado.', 404);

$nome      = trim($b['nome']      ?? $m['nome']);
$email     = trim($b['email']     ?? $m['email']);
$papel     = in_array($b['papel'] ?? '', ['admin','membro']) ? $b['papel'] : $m['papel'];
$cor       = $b['cor_avatar'] ?? $m['cor_avatar'];
$notifEmail= isset($b['notif_email_diario'])   ? (int)(bool)$b['notif_email_diario']   : (int)$m['notif_email_diario'];
$notifAtrs = isset($b['notif_tarefas_atraso']) ? (int)(bool)$b['notif_tarefas_atraso'] : (int)$m['notif_tarefas_atraso'];
$notifAtr  = isset($b['notif_atribuicao'])     ? (int)(bool)$b['notif_atribuicao']     : (int)$m['notif_atribuicao'];

$partes   = explode(' ', $nome);
$iniciais = strtoupper(substr($partes[0],0,1).(isset($partes[1])?substr($partes[1],0,1):''));

// Hash de nova senha se fornecida
$senhaHash = $m['senha_hash'];
if (!empty($b['nova_senha'])) {
    if (strlen($b['nova_senha']) < 6) err('Senha deve ter ao menos 6 caracteres.');
    $senhaHash = password_hash($b['nova_senha'], PASSWORD_BCRYPT);
}

$db->prepare(
    'UPDATE membros SET nome=?,email=?,iniciais=?,cor_avatar=?,papel=?,senha_hash=?,
     notif_email_diario=?,notif_tarefas_atraso=?,notif_atribuicao=?,atualizado_em=NOW()
     WHERE id=?'
)->execute([$nome,$email,$iniciais,$cor,$papel,$senhaHash,$notifEmail,$notifAtrs,$notifAtr,$id]);

// Atualiza sessão se editando o próprio perfil
if ($id === $sess['membro_id']) {
    $_SESSION['nome']  = $nome;
    $_SESSION['papel'] = $papel;
}

ok(['message' => 'Membro atualizado.']);
