<?php
require_once __DIR__ . '/BaseModel.php';

class SaludoModel extends BaseModel
{
    protected $table = "saludo";
    protected $campos = [
        'id',
        'placa',
        'marca',
        'modelo',
        'año',
        'color',
        'propietario_id',
        'foto_url',
        'estado',
        'activo',
        'fecha_creacion',
        'fecha_actualizacion'
    ];

    public function getAllWithOwner()
    {
        $sql = "SELECT 
                id, placa, marca, modelo, año, color, estado, foto_url,
                propietario_nombre, departamento_propietario, 
                propietario_email, propietario_telefono,
                fecha_creacion, fecha_actualizacion
            FROM vista_vehiculos_completa 
            ORDER BY estado DESC, fecha_actualizacion DESC";

        return $this->query($sql);
    }

    public function getByEstado($estado)
    {
        return $this->getAll(['estado' => $estado, 'activo' => true], 'fecha_actualizacion DESC');
    }

    public function getByPlaca($placa)
    {
        $result = $this->getAll(['placa' => $placa, 'activo' => true]);
        return $result ? $result[0] : false;
    }
}
