<?php
require_once __DIR__ . '/Response.php';
class Auth
{
    public static function iniciarSesion($usuario)
    {
        $_SESSION['id'] = $usuario['id'];
        $_SESSION['nombre'] = $usuario['nombre'];
        $_SESSION['correo'] = $usuario['correo'];
        $_SESSION['rol'] = $usuario['rol'];
        $_SESSION['logueado'] = true;
        $_SESSION['timestamp'] = time();
    }

    public static function cerrarSesion()
    {
        session_unset();
        session_destroy();
    }

    public static function estaLogueado()
    {
        return isset($_SESSION['logueado']) && $_SESSION['logueado'] === true;
    }

    public static function getUsuarioId()
    {
        return $_SESSION['id'] ?? null;
    }

    public static function getRol()
    {
        return $_SESSION['rol'] ?? null;
    }

    public static function esAdmin()
    {
        return self::getRol() === 'admin';
    }

    public static function requiereAuth()
    {
        if (!self::estaLogueado()) {
            Response::error('No autorizado. Inicie sesión.', 401);
            exit;
        }
    }

    public static function requiereAdmin()
    {
        self::requiereAuth();
        if (!self::esAdmin()) {
            Response::error('Acceso denegado. Se requieren privilegios de administrador.', 403);
            exit;
        }
    }
}
