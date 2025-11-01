<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../modelos/PacientesModel.php';
require_once __DIR__ . '/../utilidades/Response.php';
require_once __DIR__ . '/../utilidades/Auth.php';

class PacientesController extends BaseController
{
    protected $modelClass = 'PacientesModel';
    protected $requiredFields = ['nombre', 'telefono', 'correo'];

    public function getAll()
    {
        Auth::requiereAuth();
        try {
            $page = $_GET['page'] ?? null;
            $perPage = $_GET['per_page'] ?? null;
            $search = $_GET['search'] ?? '';

            if (!empty($search)) {
                $result = $this->model->buscarByDatos($search, $page, $perPage);
                Response::json($result);
            } elseif ($page !== null && $perPage !== null) {
                $result = $this->model->getAllPaginated((int)$page, (int)$perPage);
                Response::json($result);
            } else {
                $data = $this->model->getAll();
                Response::json($data);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function search()
    {
        Auth::requiereAuth();

        try {
            $search = $_GET['termino'] ?? '';
            $limit = $_GET['limit'] ?? 0;

            if (empty($search) && $limit >= 1) {
                $pacientes = $this->model->getAll();

                Response::json(array_slice($pacientes, 0, $limit));
                return;
            }

            if (empty($search) || strlen($search) < 2) {
                Response::json([]);
                return;
            }

            $result = $this->model->buscarByDatos($search, null, null);

            if (isset($result['data'])) {
                $pacientes = $result['data'];
            } else {
                $pacientes = $result;
            }

            $pacientes = array_slice($pacientes, 0, (int)$limit);

            Response::json(array_values($pacientes));
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function create()
    {
        Auth::requiereAuth();

        $rol = Auth::getRol();
        if (!in_array($rol, ['recepcion', 'admin'])) {
            Response::error('No tienes permiso para crear pacientes', 403);
            return;
        }

        try {
            $data = $this->getInputData();
            $this->validateRequiredFields($data);

            if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
                Response::error('Formato de correo inválido', 400);
                return;
            }

            $pacienteExistente = $this->model->getAll(['correo' => $data['correo']]);
            if (!empty($pacienteExistente)) {
                Response::error('El correo ya está registrado', 400);
                return;
            }

            $data['fecha_registro'] = date('Y-m-d H:i:s');

            $id = $this->model->insert($data);
            Response::json([
                'id' => $id,
                'message' => 'Paciente creado exitosamente'
            ], 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update($id)
    {
        Auth::requiereAuth();

        $rol = Auth::getRol();
        if (!in_array($rol, ['recepcion', 'admin'])) {
            Response::error('No tienes permiso para actualizar pacientes', 403);
            return;
        }

        try {
            $this->validateId($id);
            $data = $this->getInputData();

            if (isset($data['correo']) && !filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
                Response::error('Formato de correo inválido', 400);
                return;
            }

            if (isset($data['correo'])) {
                $pacienteExistente = $this->model->getAll(['correo' => $data['correo']]);
                if (!empty($pacienteExistente) && $pacienteExistente[0]['id'] != $id) {
                    Response::error('El correo ya está registrado por otro paciente', 400);
                    return;
                }
            }

            $success = $this->model->updateById((int)$id, $data);
            if ($success) {
                Response::json(['message' => 'Paciente actualizado exitosamente']);
            } else {
                Response::error('Paciente no encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete($id)
    {
        Auth::requiereAdmin();

        try {
            $this->validateId($id);

            require_once __DIR__ . '/../modelos/CitasModel.php';
            $citasModel = new CitasModel();
            $citas = $citasModel->getAll(['paciente_id' => $id]);

            if (!empty($citas)) {
                Response::error('No se puede eliminar el paciente porque tiene citas asociadas', 400);
                return;
            }

            $success = $this->model->deleteById((int)$id);

            if ($success) {
                Response::json(['message' => 'Paciente eliminado exitosamente']);
            } else {
                Response::error('Paciente no encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
