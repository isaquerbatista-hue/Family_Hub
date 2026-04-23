<?php
/**
 * GET /api/auth/me.php
 * Retorna os dados do usuário da sessão atual.
 * 401 se não autenticado.
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

requireMethod('GET');
$sess = requireAuth();

$db = getDB();
$stmt = $db->prepare(
    'SELECT m.id, m.nome, m.email, m.papel, m.pontos, m.iniciais, m.cor_avatar,
            m.notif_email_diario, m.notif_tarefas_atraso, m.notif_atribuicao,
            m.familia_id, f.nome AS familia_nome, f.fuso_horario
     FROM membros m
     JOIN familias f ON f.id = m.familia_id
     WHERE m.id = ?'
);
$stmt->execute([$sess['membro_id']]);
$membro = $stmt->fetch();

if (!$membro) {
    err('Membro não encontrado.', 404);
}

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
        'id'          => $membro['familia_id'],
        'nome'        => $membro['familia_nome'],
        'fuso_horario'=> $membro['fuso_horario'],
    ],
]);
