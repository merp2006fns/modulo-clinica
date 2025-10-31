<?php
require_once __DIR__ . '/../config/database.php';

abstract class BaseModel
{
    protected $pdo;
    protected $table;
    protected $campos = [];

    public function __construct()
    {
        $database = Database::getInstance();
        $this->pdo = $database->getConnection();
    }

    public function query($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);

            if (stripos($sql, 'SELECT') === 0) {
                return $stmt->fetchAll();
            }

            return true;
        } catch (PDOException $e) {
            throw new Exception("Error en query: " . $e->getMessage());
        }
    }

    public function getAll($conditions = [], $orderBy = '')
    {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];

        if (!empty($conditions)) {
            $whereParts = [];
            foreach ($conditions as $key => $value) {
                $whereParts[] = "$key = :$key";
                $params[$key] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereParts);
        }

        if ($orderBy) {
            $sql .= " ORDER BY $orderBy";
        }

        return $this->query($sql, $params);
    }

    public function getById(int $id)
    {
        $result = $this->getAll(['id' => $id]);
        return $result ? $result[0] : false;
    }

    public function insert(array $data)
    {
        $filtered_data = array_intersect_key($data, array_flip($this->campos));

        if (empty($filtered_data)) {
            throw new Exception("No hay datos válidos para insertar");
        }

        $campos_list = implode(', ', array_keys($filtered_data));
        $placeholders = ':' . implode(', :', array_keys($filtered_data));

        $sql = "INSERT INTO {$this->table} ({$campos_list}) VALUES ({$placeholders})";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($filtered_data);
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Error en insert: " . $e->getMessage());
        }
    }

    public function updateById(int $id, array $data)
    {
        $set_parts = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $this->campos)) {
                $set_parts[] = "{$key} = :{$key}";
                $params[$key] = $value;
            }
        }

        if (empty($set_parts)) {
            throw new Exception("No hay campos válidos para actualizar");
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $set_parts) . " WHERE id = :id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error en updateById: " . $e->getMessage());
        }
    }

    public function deleteById(int $id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = :id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['id' => $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error en deleteById: " . $e->getMessage());
        }
    }

    public function count($conditions = [])
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];

        if (!empty($conditions)) {
            $whereParts = [];
            foreach ($conditions as $key => $value) {
                $whereParts[] = "$key = :$key";
                $params[$key] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $whereParts);
        }

        $result = $this->query($sql, $params);
        return $result[0]['total'];
    }

    public function buscarByTermino($termino, $camposBusqueda = [], $exacto = false, $conditions = [], $orderBy = '')
    {
        if (empty($termino)) {
            return $this->getAll($conditions, $orderBy);
        }

        if (empty($camposBusqueda)) {
            $camposBusqueda = $this->campos;
        }

        $camposValidos = array_intersect($camposBusqueda, $this->campos);

        if (empty($camposValidos)) {
            throw new Exception("No hay campos válidos para búsqueda");
        }

        $whereParts = [];
        $params = [];

        if (!empty($conditions)) {
            foreach ($conditions as $key => $value) {
                $whereParts[] = "$key = :cond_$key";
                $params["cond_$key"] = $value;
            }
        }

        $busquedaParts = [];
        foreach ($camposValidos as $campo) {
            if ($exacto) {
                $busquedaParts[] = "$campo = :busq_$campo";
                $params["busq_$campo"] = $termino;
            } else {
                $busquedaParts[] = "$campo LIKE :busq_$campo";
                $params["busq_$campo"] = "%$termino%";
            }
        }

        if (!empty($busquedaParts)) {
            $whereParts[] = "(" . implode(' OR ', $busquedaParts) . ")";
        }

        $sql = "SELECT * FROM {$this->table}";

        if (!empty($whereParts)) {
            $sql .= " WHERE " . implode(' AND ', $whereParts);
        }

        if ($orderBy) {
            $sql .= " ORDER BY $orderBy";
        }

        return $this->query($sql, $params);
    }
}
