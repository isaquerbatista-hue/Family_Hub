<?php
/**
 * GET /api/dashboard/index.php
 * Retorna em uma única chamada: métricas, tarefas urgentes,
 * agenda, ranking e notificações.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';
requireMethod('GET');
$sess = requireAuth();
$db   = getDB();
$fid  = $sess['familia_id'];
$mid  = $sess['membro_id'];
$today = date('Y-m-d');

/* Métricas */
$stmt = $db->prepare('SELECT status, prazo FROM tarefas WHERE familia_id=?');
$stmt->execute([$fid]);
$all = $stmt->fetchAll();
$pendentes  = count(array_filter($all, fn($t) => $t['status'] !== 'done'));
$concluidas = count(array_filter($all, fn($t) => $t['status'] === 'done'));
$atrasadas  = count(array_filter($all, fn($t) => $t['status'] !== 'done' && $t['prazo'] && $t['prazo'] < $today));
$total      = count($all);
$pct        = $total ? round($concluidas / $total * 100) : 0;

/* Tarefas urgentes (top 3 não concluídas, maior prioridade) */
$stmt = $db->prepare(
    'SELECT t.id, t.titulo, t.prioridade,
            GROUP_CONCAT(m.nome ORDER BY m.nome SEPARATOR ", ") AS responsaveis,
            GROUP_CONCAT(m.id   ORDER BY m.nome SEPARATOR ",")  AS membro_ids
     FROM tarefas t
     LEFT JOIN tarefa_membros tm ON tm.tarefa_id = t.id
     LEFT JOIN membros m         ON m.id = tm.membro_id
     WHERE t.familia_id=? AND t.status != "done"
     GROUP BY t.id
     ORDER BY FIELD(t.prioridade,"alta","media","baixa"), t.prazo ASC
     LIMIT 3'
);
$stmt->execute([$fid]);
$urgentes = $stmt->fetchAll();

/* Agenda (próximos 3 eventos) */
$stmt = $db->prepare(
    'SELECT titulo, inicio, categoria FROM eventos WHERE familia_id=? AND inicio >= NOW() ORDER BY inicio LIMIT 3'
);
$stmt->execute([$fid]);
$agenda = $stmt->fetchAll();

/* Ranking */
$stmt = $db->prepare('SELECT nome, pontos FROM membros WHERE familia_id=? ORDER BY pontos DESC LIMIT 4');
$stmt->execute([$fid]);
$ranking = $stmt->fetchAll();
foreach ($ranking as &$r) $r['pontos'] = (int)$r['pontos'];

/* Notificações não lidas */
$stmt = $db->prepare(
    'SELECT mensagem, criado_em FROM notificacoes WHERE membro_id=? AND lida=0 ORDER BY criado_em DESC LIMIT 5'
);
$stmt->execute([$mid]);
$notifs = $stmt->fetchAll();

ok([
    'metricas' => [
        'pendentes'  => $pendentes,
        'concluidas' => $concluidas,
        'atrasadas'  => $atrasadas,
        'pct_semana' => $pct,
    ],
    'urgentes'       => $urgentes,
    'agenda'         => $agenda,
    'ranking'        => $ranking,
    'notificacoes'   => $notifs,
]);
