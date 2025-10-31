<?php
class Response
{
    public static function json($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }

    public static function error($message, $statusCode = 400)
    {
        self::json(['error' => $message], $statusCode);
    }
}
