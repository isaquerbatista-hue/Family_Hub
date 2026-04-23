<?php
/**
 * Family Hub — Headers CORS + helpers de resposta JSON
 */

// Permite chamadas do frontend (localhost e qualquer origem em dev)
$allowedOrigins = ['http://localhost', 'http://127.0.0.1', 'http://localhost:8000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins) || str_starts_with($origin, 'file://')) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Responde pre-flight OPTIONS imediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Envia JSON de sucesso e encerra.
 */
function ok(mixed $data = null, int $status = 200): never {
    http_response_code($status);
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Envia JSON de erro e encerra.
 */
function err(string $msg, int $status = 400): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lê o body JSON da requisição.
 */
function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw ?: '{}', true) ?? [];
}

/**
 * Garante que o método HTTP é o esperado.
 */
function requireMethod(string ...$methods): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods)) {
        err('Método não permitido.', 405);
    }
}
