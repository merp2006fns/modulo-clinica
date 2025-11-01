<?php
require_once __DIR__ . '/BaseModel.php';

class ServiciosModel extends BaseModel
{
    protected $table = "servicios";
    protected $campos = [
        'id',
        'nombre',
        'precio'
    ];

    public function buscarByDatos(string $termino, $page = null, $perPage = null)
    {
        return $this->buscarByTermino($termino, ['nombre'], false, [], '', [], '*', $page, $perPage);
    }

    public function getAllPaginated($page = 1, $perPage = 10, $conditions = [], $orderBy = 'nombre ASC')
    {
        return parent::getAllPaginated($page, $perPage, $conditions, $orderBy);
    }
}