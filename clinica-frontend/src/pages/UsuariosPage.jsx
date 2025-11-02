import { useState, useEffect, useCallback } from "react";
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

  const fetchUsuarios = useCallback(async () => {
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
  }, [page, search, rolFilter]);

  useEffect(() => {
    fetchUsuarios();
  }, [page, search, rolFilter, fetchUsuarios]);

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
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <h1>Gestión de Usuarios</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {canManage && (
        <button
          className="mb-4 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          onClick={() => setShowForm(true)}
        >
          Nuevo Usuario
        </button>
      )}
      {showForm && canManage && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editId ? "Editar" : "Nuevo"} Usuario
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recepcion">Recepción</option>
                <option value="medico">Médico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="max-h-10 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="max-h-10 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={rolFilter}
          onChange={(e) => {
            setRolFilter(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-green-500 text-white dark:bg-green-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Rol
                </th>
                {canManage && (
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm">{usuario.id}</td>
                  <td className="px-4 py-3 text-sm">{usuario.nombre}</td>
                  <td className="px-4 py-3 text-sm">{usuario.correo}</td>
                  <td className="px-4 py-3 text-sm">{usuario.rol}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-sm">
                      <button
                        className="mr-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                        onClick={() => handleEdit(usuario)}
                      >
                        Editar
                      </button>
                      {usuario.id !== user?.id && (
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                          onClick={() => handleDelete(usuario.id)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <button
            disabled={!pagination.has_prev}
            onClick={() => setPage(page - 1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {pagination.current_page} de {pagination.total_pages} (Total:{" "}
            {pagination.total})
          </span>
          <button
            disabled={!pagination.has_next}
            onClick={() => setPage(page + 1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
