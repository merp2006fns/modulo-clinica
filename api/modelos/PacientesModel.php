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

    public function buscarByDatos(string $termino, $page = null, $perPage = null)
    {
        return $this->buscarByTermino($termino, ['nombre', 'telefono', 'correo'], false, [], '', [], '*', $page, $perPage);
    }

    public function getAllPaginated($page = 1, $perPage = 10, $conditions = [], $orderBy = 'nombre ASC')
    {
        return parent::getAllPaginated($page, $perPage, $conditions, $orderBy);
    }
}