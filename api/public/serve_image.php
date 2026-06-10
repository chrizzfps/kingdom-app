<?php
// serve_image.php - Sirve imágenes con cabeceras CORS correctas
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: *");

if (isset($_GET['file'])) {
    $file = basename($_GET['file']); // Seguridad: evitar '..'
    $filepath = __DIR__ . '/uploads/' . $file;

    if (file_exists($filepath)) {
        // Detectar tipo MIME (importante para el navegador/PDF)
        $mime = mime_content_type($filepath);
        if ($mime) {
            header("Content-Type: $mime");
        }
        // Servir el archivo
        readfile($filepath);
        exit;
    } else {
        http_response_code(404);
        echo "File not found.";
    }
} else {
    http_response_code(400);
    echo "No file specified.";
}
?>