<?php
require_once __DIR__ . '/../utilidades/Auth.php';

abstract class BaseController
{
    protected $model;
    protected $modelClass;
    protected $requiredFields = [];
    protected $idField = 'id';

    public function __construct()
    {
        if ($this->modelClass) {
            $this->model = new $this->modelClass();
        }
    }

    public function getAll()
    {
        Auth::requiereAuth();
        try {
            $method = method_exists($this->model, 'getAllWithOwner')
                ? 'getAllWithOwner'
                : 'getAll';

            $data = $this->model->$method();
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

            $data = $this->model->getById((int)$id);
            if ($data) {
                Response::json($data);
            } else {
                Response::error($this->getNotFoundMessage(), 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function create()
    {
        Auth::requiereAuth();
        try {
            $data = $this->getInputData();
            $this->validateRequiredFields($data);

            $id = $this->model->insert($data);
            Response::json([
                'id' => $id,
                'message' => $this->getCreatedMessage()
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
            $data = $this->getInputData();

            $success = $this->model->updateById((int)$id, $data);
            if ($success) {
                Response::json(['message' => $this->getUpdatedMessage()]);
            } else {
                Response::error($this->getNotFoundMessage(), 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function delete($id)
    {
        Auth::requiereAuth();
        try {
            $this->validateId($id);

            if (method_exists($this->model, 'softDeleteById')) {
                $success = $this->model->softDeleteById((int)$id);
            } else {
                $success = $this->model->deleteById((int)$id);
            }

            if ($success) {
                Response::json(['message' => $this->getDeletedMessage()]);
            } else {
                Response::error($this->getNotFoundMessage(), 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    protected function validateId($id)
    {
        if (!is_numeric($id)) {
            Response::error('ID debe ser numérico', 400);
            exit;
        }
    }

    protected function getInputData()
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    protected function validateRequiredFields($data)
    {
        foreach ($this->requiredFields as $field) {
            if (empty($data[$field])) {
                Response::error("El campo '$field' es requerido", 400);
                exit;
            }
        }
    }

    protected function getNotFoundMessage()
    {
        return 'Registro no encontrado';
    }

    protected function getCreatedMessage()
    {
        return 'Registro creado exitosamente';
    }

    protected function getUpdatedMessage()
    {
        return 'Registro actualizado exitosamente';
    }

    protected function getDeletedMessage()
    {
        return 'Registro eliminado exitosamente';
    }
}