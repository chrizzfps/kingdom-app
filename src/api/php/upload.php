<?php
// 1. CORS: Permitir acceso desde cualquier lugar para evitar bloqueos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Si es una verificación previa (OPTIONS), terminar aquí con éxito
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. Clave de seguridad
$API_KEY = 'kingdom_secret_key_2024';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($authHeader !== "Bearer $API_KEY") {
     http_response_code(401);
     echo json_encode(['error' => 'Clave incorrecta']);
     exit;
}

// 3. Subida
if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay archivo']);
    exit;
}

$file = $_FILES['file'];
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $ext;

// Crear carpeta uploads si no existe (ajusta la ruta según tu estructura local vs server)
$targetDir = __DIR__ . '/uploads';
if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

if (move_uploaded_file($file['tmp_name'], "$targetDir/$filename")) {
    $domain = 'https://app.kingdomagency.es'; 
    // Usar serve_image.php para evitar problemas de CORS/acceso directo
    echo json_encode(['url' => "$domain/api/serve_image.php?file=$filename"]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Fallo al guardar']);
}
?>
