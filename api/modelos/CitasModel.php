<?php
require_once __DIR__ . '/BaseModel.php';

class CitasModel extends BaseModel
{
    protected $table = "citas";
    protected $campos = [
        'id',
        'paciente_id',
        'servicio_id',
        'medico_usuario_id',
        'fecha_hora',
        'estado',
        'notas'
    ];

    public function getAllWithJoin($conditions = [], $orderBy = 'c.fecha_hora DESC', $page = null, $perPage = null)
    {
        $joins = [
            "INNER JOIN pacientes p ON c.paciente_id = p.id",
            "INNER JOIN servicios s ON c.servicio_id = s.id",
            "INNER JOIN usuarios u ON c.medico_usuario_id = u.id"
        ];

        $selectFields = "c.*, 
                        p.nombre AS paciente_nombre,
                        u.nombre AS medico_nombre,
                        s.nombre AS servicio_nombre";

        $config = [
            'joins' => $joins,
            'selectFields' => $selectFields,
            'conditions' => $conditions,
            'orderBy' => $orderBy,
            'tableAlias' => 'c'
        ];

        if ($page !== null && $perPage !== null) {
            $config['page'] = $page;
            $config['perPage'] = $perPage;
        }

        return parent::getAllWithJoin($config);
    }

    public function buscarByTerminoWithJoin($termino, $exacto = false, $conditions = [], $orderBy = 'c.fecha_hora DESC', $page = null, $perPage = null)
    {
        if (empty($termino)) {
            return $this->getAllWithJoin($conditions, $orderBy, $page, $perPage);
        }

        $joins = [
            "INNER JOIN pacientes p ON c.paciente_id = p.id",
            "INNER JOIN servicios s ON c.servicio_id = s.id",
            "INNER JOIN usuarios u ON c.medico_usuario_id = u.id"
        ];

        $selectFields = "c.*, 
                        p.nombre AS paciente_nombre,
                        u.nombre AS medico_nombre,
                        s.nombre AS servicio_nombre";

        $camposBusqueda = [
            'c.notas',
            'c.estado',
            'p.nombre',
            'u.nombre',
            's.nombre'
        ];

        return $this->buscarByTermino(
            $termino,
            $camposBusqueda,
            $exacto,
            $conditions,
            $orderBy,
            $joins,
            $selectFields,
            $page,
            $perPage,
            'c'
        );
    }

    public function buscarPorPaciente($nombrePaciente, $page = null, $perPage = null)
    {
        return $this->buscarByTerminoWithJoin(
            $nombrePaciente,
            false,
            [],
            'c.fecha_hora DESC',
            $page,
            $perPage
        );
    }

    public function buscarPorMedico($nombreMedico, $page = null, $perPage = null)
    {
        return $this->buscarByTerminoWithJoin(
            $nombreMedico,
            false,
            [],
            'c.fecha_hora DESC',
            $page,
            $perPage
        );
    }

    public function buscarCitasPorFechaYTermino($termino, $fecha = null, $page = null, $perPage = null)
    {
        $conditions = [];
        if ($fecha) {
            $conditions['DATE(c.fecha_hora)'] = $fecha;
        }

        return $this->buscarByTerminoWithJoin(
            $termino,
            false,
            $conditions,
            'c.fecha_hora ASC',
            $page,
            $perPage
        );
    }

    public function getCitasFiltradas($filtros = [])
    {
        $conditions = [];

        if (!empty($filtros['medico_id'])) {
            $conditions['c.medico_usuario_id'] = $filtros['medico_id'];
        }

        if (!empty($filtros['estado'])) {
            $conditions['c.estado'] = $filtros['estado'];
        }

        if (!empty($filtros['fecha'])) {
            $conditions['DATE(c.fecha_hora)'] = $filtros['fecha'];
        }

        if (!empty($filtros['paciente_id'])) {
            $conditions['c.paciente_id'] = $filtros['paciente_id'];
        }

        $orderBy = 'c.fecha_hora ' . ($filtros['orden'] ?? 'DESC');
        
        $page = $filtros['page'] ?? null;
        $perPage = $filtros['per_page'] ?? null;

        return $this->getAllWithJoin($conditions, $orderBy, $page, $perPage);
    }

    public function getAllPaginated($page = 1, $perPage = 10, $conditions = [], $orderBy = 'c.fecha_hora DESC')
    {
        return $this->getAllWithJoin($conditions, $orderBy, $page, $perPage);
    }
}
