import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080";

export const UsuariosPage = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "recepcion",
  });
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const canManage = user?.rol === "admin";

  useEffect(() => {
    fetchUsuarios();
  }, [page, search, rolFilter]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        per_page: "10",
      });
      if (search) params.append("search", search);
      if (rolFilter) params.append("rol", rolFilter);

      const response = await fetch(`${API_URL}/usuarios?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.data && data.pagination) {
        setUsuarios(data.data);
        setPagination(data.pagination);
      } else {
        setUsuarios(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error al cargar usuarios", err);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editId
        ? `${API_URL}/usuarios/${editId}`
        : `${API_URL}/usuarios`;
      const method = editId ? "PUT" : "POST";

      const payload = { ...formData };
      if (editId && !formData.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar usuario");
      }

      setShowForm(false);
      setEditId(null);
      setFormData({
        nombre: "",
        correo: "",
        password: "",
        rol: "recepcion",
      });
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: "",
      rol: usuario.rol,
    });
    setEditId(usuario.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar usuario");
      }

      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      nombre: "",
      correo: "",
      password: "",
      rol: "recepcion",
    });
  };

  return (
    <div>
      <h1>Gestión de Usuarios</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {canManage && (
        <button onClick={() => setShowForm(true)}>Nuevo Usuario</button>
      )}

      {showForm && canManage && (
        <div>
          <h2>{editId ? "Editar" : "Nuevo"} Usuario</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Correo:</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Contraseña:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editId}
                placeholder={editId ? "Dejar en blanco para no cambiar" : ""}
              />
            </div>
            <div>
              <label>Rol:</label>
              <select
                value={formData.rol}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
                required
              >
                <option value="recepcion">Recepción</option>
                <option value="medico">Médico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit">Guardar</button>
            <button type="button" onClick={handleCancelForm}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={rolFilter}
          onChange={(e) => {
            setRolFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="medico">Médico</option>
          <option value="recepcion">Recepción</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.rol}</td>
                  {canManage && (
                    <td>
                      <button onClick={() => handleEdit(usuario)}>
                        Editar
                      </button>
                      {usuario.id !== user?.id && (
                        <button onClick={() => handleDelete(usuario.id)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && (
            <div>
              <button
                disabled={!pagination.has_prev}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span>
                Página {pagination.current_page} de {pagination.total_pages}{" "}
                (Total: {pagination.total})
              </span>
              <button
                disabled={!pagination.has_next}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
