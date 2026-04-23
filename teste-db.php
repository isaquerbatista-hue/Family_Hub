<?php
require_once 'api/config/db.php';

try {
    $db = getDB();
    echo "✅ Conexão bem-sucedida!";
    $stmt = $db->query("SHOW TABLES");
    echo "\n📊 Tabelas encontradas: " . count($stmt->fetchAll());
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>