<?php
/**
 * GET /api/relatorios/index.php
 * Retorna dados agregados para os gráficos e relatórios.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

requireMethod('GET');
$sess = requireAuth();
$db   = getDB();
$fid  = $sess['familia_id'];

// 1. Tarefas concluídas por membro
$stmtMembros = $db->prepare('
    SELECT m.nome, COUNT(tm.tarefa_id) as concluidas
    FROM membros m
    LEFT JOIN tarefa_membros tm ON tm.membro_id = m.id
    LEFT JOIN tarefas t ON t.id = tm.tarefa_id AND t.status = "done"
    WHERE m.familia_id = ?
    GROUP BY m.id, m.nome
    ORDER BY concluidas DESC
');
$stmtMembros->execute([$fid]);
$porMembro = $stmtMembros->fetchAll();

// 2. Distribuição de tarefas (todas) por Tag/Categoria
$stmtTags = $db->prepare('
    SELECT COALESCE(tag, "Sem Categoria") as tag, COUNT(id) as total
    FROM tarefas
    WHERE familia_id = ?
    GROUP BY tag
    ORDER BY total DESC
');
$stmtTags->execute([$fid]);
$porTag = $stmtTags->fetchAll();

// 3. Status Geral das Tarefas
$stmtStatus = $db->prepare('
    SELECT status, COUNT(id) as total
    FROM tarefas
    WHERE familia_id = ?
    GROUP BY status
');
$stmtStatus->execute([$fid]);
$porStatusRaw = $stmtStatus->fetchAll();

$porStatus = [
    'todo' => 0,
    'progress' => 0,
    'done' => 0
];
foreach ($porStatusRaw as $row) {
    $porStatus[$row['status']] = (int)$row['total'];
}

ok([
    'por_membro' => array_map(fn($r) => ['nome' => $r['nome'], 'concluidas' => (int)$r['concluidas']], $porMembro),
    'por_tag'    => array_map(fn($r) => ['tag' => $r['tag'], 'total' => (int)$r['total']], $porTag),
    'por_status' => $porStatus
]);
