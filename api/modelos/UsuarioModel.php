<?php
require_once __DIR__ . '/BaseModel.php';

class UsuarioModel extends BaseModel
{
    protected $table = "usuarios";
    protected $campos = [
        'id',
        'nombre',
        'correo',
        'password',
        'rol'
    ];

    public function getByNombre($nombre)
    {
        $sql = "SELECT * FROM {$this->table} WHERE nombre = :nombre";
        $result = $this->query($sql, ['nombre' => $nombre]);
        return $result ? $result[0] : false;
    }

    public function getByCorreo($correo)
    {
        $sql = "SELECT * FROM {$this->table} WHERE correo = :correo";
        $result = $this->query($sql, ['correo' => $correo]);
        return $result ? $result[0] : false;
    }

    public function verificarPassword($password, $passwordHash)
    {
        return password_verify($password, $passwordHash);
    }

    public function hashPassword($password)
    {
        return password_hash($password, PASSWORD_DEFAULT);
    }
}
