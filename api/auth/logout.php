<?php
/** POST /api/auth/logout.php */
require_once __DIR__ . '/../config/cors.php';
if (session_status() === PHP_SESSION_NONE) session_start();
requireMethod('POST');
$_SESSION = [];
session_destroy();
ok(['message' => 'Sessão encerrada.']);
