<?php
/**
 * GET  /api/tarefas/index.php  → lista todas da família
 * POST /api/tarefas/index.php  → cria nova tarefa
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

requireMethod('GET', 'POST');
$sess = requireAuth();
$db   = getDB();

/* ── GET ── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare(
        'SELECT t.*,
                GROUP_CONCAT(m.nome ORDER BY m.nome SEPARATOR ",") AS membros_nomes,
                GROUP_CONCAT(m.id   ORDER BY m.nome SEPARATOR ",") AS membros_ids
         FROM tarefas t
         LEFT JOIN tarefa_membros tm ON tm.tarefa_id = t.id
         LEFT JOIN membros m         ON m.id = tm.membro_id
         WHERE t.familia_id = ?
         GROUP BY t.id
         ORDER BY t.ordem ASC, t.criado_em ASC'
    );
    $stmt->execute([$sess['familia_id']]);
    $rows = $stmt->fetchAll();

    $tarefas = array_map(function($r) {
        return [
            'id'        => $r['id'],
            'titulo'    => $r['titulo'],
            'descricao' => $r['descricao'],
            'tag'       => $r['tag'],
            'prioridade'=> $r['prioridade'],
            'status'    => $r['status'],
            'prazo'     => $r['prazo'],
            'ordem'     => (int)$r['ordem'],
            'criado_em' => $r['criado_em'],
            'membros'   => $r['membros_nomes'] ? explode(',', $r['membros_nomes']) : [],
            'membro_ids'=> $r['membros_ids']   ? explode(',', $r['membros_ids'])   : [],
        ];
    }, $rows);

    ok($tarefas);
}

/* ── POST ── */
$b = body();
$titulo    = trim($b['titulo']    ?? '');
$descricao = trim($b['descricao'] ?? '');
$tag       = trim($b['tag']       ?? '');
$prioridade= $b['prioridade'] ?? 'baixa';
$status    = $b['status']     ?? 'todo';
$prazo     = $b['prazo']      ?: null;
$ordem     = (int)($b['ordem'] ?? 0);
$membros   = $b['membros']    ?? [];   // array de IDs

if (!$titulo) err('Título é obrigatório.');

$db->prepare(
    'INSERT INTO tarefas (id, familia_id, titulo, descricao, tag, prioridade, status, prazo, ordem, criado_por)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?)'
)->execute([$sess['familia_id'], $titulo, $descricao ?: null, $tag ?: null,
            $prioridade, $status, $prazo, $ordem, $sess['membro_id']]);

// Recupera o UUID gerado
$stmt = $db->prepare('SELECT * FROM tarefas WHERE criado_por = ? ORDER BY criado_em DESC LIMIT 1');
$stmt->execute([$sess['membro_id']]);
$tarefa = $stmt->fetch();

// Atribuir membros
if (!empty($membros) && !empty($tarefa['id'])) {
    $ins = $db->prepare('INSERT IGNORE INTO tarefa_membros (tarefa_id, membro_id) VALUES (?, ?)');
    foreach ($membros as $mid) {
        $ins->execute([$tarefa['id'], $mid]);
    }
}

// Log de atividade
$db->prepare(
    'INSERT INTO tarefa_atividades (id, tarefa_id, membro_id, tipo) VALUES (UUID(), ?, ?, "criou")'
)->execute([$tarefa['id'], $sess['membro_id']]);

ok($tarefa, 201);
