<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../modelos/CitasModel.php';
require_once __DIR__ . '/../utilidades/Response.php';
require_once __DIR__ . '/../utilidades/Auth.php';

class CitasController extends BaseController
{
    protected $modelClass = 'CitasModel';
    protected $requiredFields = ['paciente_id', 'servicio_id', 'medico_usuario_id', 'fecha_hora'];

    public function getAll()
    {
        Auth::requiereAuth();
        try {
            $page = $_GET['page'] ?? null;
            $perPage = $_GET['per_page'] ?? null;
            $filtros = [];

            if (isset($_GET['medico_id'])) {
                $filtros['medico_id'] = $_GET['medico_id'];
            }
            if (isset($_GET['estado'])) {
                $filtros['estado'] = $_GET['estado'];
            }
            if (isset($_GET['fecha'])) {
                $filtros['fecha'] = $_GET['fecha'];
            }
            if (isset($_GET['paciente_id'])) {
                $filtros['paciente_id'] = $_GET['paciente_id'];
            }
            if (isset($_GET['orden'])) {
                $filtros['orden'] = $_GET['orden'];
            }

            $termino = $_GET['q'] ?? '';
            
            $rol = Auth::getRol();
            if ($rol === 'medico') {
                $filtros['medico_id'] = Auth::getUsuarioId();
            }

            if (!empty($termino)) {
                $pageNum = $page !== null ? (int)$page : null;
                $perPageNum = $perPage !== null ? (int)$perPage : null;
                $conditions = [];
                
                if (!empty($filtros['estado'])) {
                    $conditions['c.estado'] = $filtros['estado'];
                }
                if (!empty($filtros['fecha'])) {
                    $conditions['DATE(c.fecha_hora)'] = $filtros['fecha'];
                }
                if (!empty($filtros['medico_id'])) {
                    $conditions['c.medico_usuario_id'] = $filtros['medico_id'];
                }
                
                $data = $this->model->buscarByTerminoWithJoin(
                    $termino,
                    false,
                    $conditions,
                    'c.fecha_hora ' . ($filtros['orden'] ?? 'DESC'),
                    $pageNum,
                    $perPageNum
                );
                Response::json($data);
                return;
            }

            if (!empty($filtros) || ($page !== null && $perPage !== null)) {
                if ($page !== null && $perPage !== null) {
                    $filtros['page'] = (int)$page;
                    $filtros['per_page'] = (int)$perPage;
                }
                $data = $this->model->getCitasFiltradas($filtros);
            } else {
                $data = $this->model->getAllWithJoin();
            }

            Response::json($data);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getById($id)
    {
        Auth::requiereAuth();
        try {
            $this->validateId($id);
            $cita = $this->model->getById((int)$id);
            
            if (!$cita) {
                Response::error('Cita no encontrada', 404);
                return;
            }

            $rol = Auth::getRol();
            if ($rol === 'medico' && $cita['medico_usuario_id'] != Auth::getUsuarioId()) {
                Response::error('No tienes permiso para ver esta cita', 403);
                return;
            }

            $citas = $this->model->getAllWithJoin(['c.id' => $id]);
            if (!empty($citas)) {
                if (isset($citas['data']) && !empty($citas['data'])) {
                    Response::json($citas['data'][0]);
                } else if (is_array($citas) && !empty($citas)) {
                    Response::json($citas[0]);
                } else {
                    Response::error('Cita no encontrada', 404);
                }
            } else {
                Response::error('Cita no encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function create()
    {
        Auth::requiereAuth();
        
        $rol = Auth::getRol();
        if (!in_array($rol, ['recepcion', 'admin'])) {
            Response::error('No tienes permiso para crear citas', 403);
            return;
        }

        try {
            $data = $this->getInputData();
            $this->validateRequiredFields($data);

            $fechaHora = strtotime($data['fecha_hora']);
            if ($fechaHora === false || $fechaHora < time()) {
                Response::error('La fecha y hora deben ser futuras', 400);
                return;
            }

            unset($data['estado']);

            $id = $this->model->insert($data);
            Response::json([
                'id' => $id,
                'message' => 'Cita creada exitosamente'
            ], 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update($id)
    {
        Auth::requiereAuth();
        try {
            $this->validateId($id);
            
            $cita = $this->model->getById((int)$id);
            if (!$cita) {
                Response::error('Cita no encontrada', 404);
                return;
            }

            $rol = Auth::getRol();
            
            if ($rol === 'medico' && $cita['medico_usuario_id'] != Auth::getUsuarioId()) {
                Response::error('No tienes permiso para actualizar esta cita', 403);
                return;
            }

            $data = $this->getInputData();

            if (isset($data['estado'])) {
                $estadosValidos = ['programada', 'confirmada', 'en_proceso', 'completada', 'cancelada', 'no_asistio'];
                if (!in_array($data['estado'], $estadosValidos)) {
                    Response::error('Estado inválido', 400);
                    return;
                }
            }

            if (isset($data['fecha_hora'])) {
                $fechaHora = strtotime($data['fecha_hora']);
                if ($fechaHora === false || $fechaHora < time()) {
                    Response::error('La fecha y hora deben ser futuras', 400);
                    return;
                }
            }

            $success = $this->model->updateById((int)$id, $data);
            if ($success) {
                Response::json(['message' => 'Cita actualizada exitosamente']);
            } else {
                Response::error('Cita no encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete($id)
    {
        Auth::requiereAuth();
        
        $rol = Auth::getRol();
        if (!in_array($rol, ['recepcion', 'admin'])) {
            Response::error('No tienes permiso para eliminar citas', 403);
            return;
        }

        try {
            $this->validateId($id);
            $success = $this->model->deleteById((int)$id);
            
            if ($success) {
                Response::json(['message' => 'Cita eliminada exitosamente']);
            } else {
                Response::error('Cita no encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function buscar()
    {
        Auth::requiereAuth();
        try {
            $termino = $_GET['q'] ?? '';
            $fecha = $_GET['fecha'] ?? null;
            $page = $_GET['page'] ?? null;
            $perPage = $_GET['per_page'] ?? null;

            $rol = Auth::getRol();
            $filtros = [];

            if ($rol === 'medico') {
                $filtros['medico_id'] = Auth::getUsuarioId();
            }

            $result = $this->model->buscarCitasPorFechaYTermino($termino, $fecha, $page, $perPage);
            Response::json($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}

