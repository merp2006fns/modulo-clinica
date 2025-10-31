<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/rutas/api.php';

try {
    $router->dispatch();
} catch (Exception $e) {
    Response::error('Error interno del servidor: ' . $e->getMessage(), 500);
}

// php -S localhost:8080 -t ../api