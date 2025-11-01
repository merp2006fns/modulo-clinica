<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../modelos/ServiciosModel.php';
require_once __DIR__ . '/../utilidades/Response.php';
require_once __DIR__ . '/../utilidades/Auth.php';

class ServiciosController extends BaseController
{
    protected $modelClass = 'ServiciosModel';
    protected $requiredFields = ['nombre', 'precio'];

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
                $data = $this->model->getAll([], 'nombre ASC');
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
                $servicios = $this->model->getAll();

                Response::json(array_slice($servicios,0,$limit));
                return;
            }

            if (empty($search) || strlen($search) < 2) {
                Response::json([]);
                return;
            }

            $result = $this->model->buscarByDatos($search, null, null);

            if (isset($result['data'])) {
                $servicios = $result['data'];
            } else {
                $servicios = $result;
            }

            $servicios = array_slice($servicios, 0, (int)$limit);

            Response::json(array_values($servicios));
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function create()
    {
        Auth::requiereAdmin();

        try {
            $data = $this->getInputData();
            $this->validateRequiredFields($data);

            if (!is_numeric($data['precio']) || $data['precio'] < 0) {
                Response::error('El precio debe ser un número positivo', 400);
                return;
            }

            $servicios = $this->model->getAll(['nombre' => $data['nombre']]);
            if (!empty($servicios)) {
                Response::error('Ya existe un servicio con ese nombre', 400);
                return;
            }

            $id = $this->model->insert($data);
            Response::json([
                'id' => $id,
                'message' => 'Servicio creado exitosamente'
            ], 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function update($id)
    {
        Auth::requiereAdmin();

        try {
            $this->validateId($id);
            $data = $this->getInputData();

            if (isset($data['precio'])) {
                if (!is_numeric($data['precio']) || $data['precio'] < 0) {
                    Response::error('El precio debe ser un número positivo', 400);
                    return;
                }
            }

            if (isset($data['nombre'])) {
                $servicios = $this->model->getAll(['nombre' => $data['nombre']]);
                if (!empty($servicios) && $servicios[0]['id'] != $id) {
                    Response::error('Ya existe un servicio con ese nombre', 400);
                    return;
                }
            }

            $success = $this->model->updateById((int)$id, $data);
            if ($success) {
                Response::json(['message' => 'Servicio actualizado exitosamente']);
            } else {
                Response::error('Servicio no encontrado', 404);
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
            $citas = $citasModel->getAll(['servicio_id' => $id]);

            if (!empty($citas)) {
                Response::error('No se puede eliminar el servicio porque tiene citas asociadas', 400);
                return;
            }

            $success = $this->model->deleteById((int)$id);

            if ($success) {
                Response::json(['message' => 'Servicio eliminado exitosamente']);
            } else {
                Response::error('Servicio no encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
