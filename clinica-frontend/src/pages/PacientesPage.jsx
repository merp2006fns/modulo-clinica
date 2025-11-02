import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080";

export const PacientesPage = () => {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const canCreate = ["admin", "recepcion"].includes(user?.rol);
  const canEdit = ["admin", "recepcion"].includes(user?.rol);
  const canDelete = user?.rol === "admin";

  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        per_page: "10",
      });
      if (search) params.append("search", search);

      const response = await fetch(`${API_URL}/pacientes?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.data && data.pagination) {
        setPacientes(data.data);
        setPagination(data.pagination);
      } else {
        setPacientes(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error al cargar pacientes", err);
      setError("Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPacientes();
  }, [page, search, fetchPacientes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editId
        ? `${API_URL}/pacientes/${editId}`
        : `${API_URL}/pacientes`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar paciente");
      }

      setShowForm(false);
      setEditId(null);
      setFormData({
        nombre: "",
        telefono: "",
        correo: "",
      });
      fetchPacientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (paciente) => {
    setFormData({
      nombre: paciente.nombre,
      telefono: paciente.telefono,
      correo: paciente.correo,
    });
    setEditId(paciente.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este paciente?")) return;

    try {
      const response = await fetch(`${API_URL}/pacientes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar paciente");
      }

      fetchPacientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      nombre: "",
      telefono: "",
      correo: "",
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <h1>Gestión de Pacientes</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {canCreate && (
        <button
          className="mb-4 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          onClick={() => setShowForm(true)}
        >
          Nuevo Paciente
        </button>
      )}
      {showForm && canCreate && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editId ? "Editar" : "Nuevo"} Paciente
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
              <label>Teléfono:</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar pacientes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
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
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Fecha Registro
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-sm">{paciente.id}</td>
                  <td className="px-4 py-3 text-sm">{paciente.nombre}</td>
                  <td className="px-4 py-3 text-sm">{paciente.telefono}</td>
                  <td className="px-4 py-3 text-sm">{paciente.correo}</td>
                  <td className="px-4 py-3 text-sm">
                    {paciente.fecha_registro
                      ? new Date(paciente.fecha_registro).toLocaleDateString()
                      : "-"}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-sm">
                      <button
                        className="mr-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                        onClick={() => handleEdit(paciente)}
                      >
                        Editar
                      </button>
                      {canDelete && (
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                          onClick={() => handleDelete(paciente.id)}
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
