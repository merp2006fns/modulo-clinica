<?php
require_once __DIR__ . '/BaseModel.php';

class PacientesModel extends BaseModel
{
    protected $table = "pacientes";
    protected $campos = [
        'id',
        'nombre',
        'telefono',
        'correo',
        'fecha_registro'
    ];

    public function buscarByDatos(string $termino)
    {
        return $this->buscarByTermino($termino, ['nombre', 'telefono', 'correo']);
    }
}