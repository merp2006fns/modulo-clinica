import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchPacientes();
  }, [page, search]);

  const fetchPacientes = async () => {
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
  };

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
    <div>
      <h1>Gestión de Pacientes</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {canCreate && (
        <button onClick={() => setShowForm(true)}>Nuevo Paciente</button>
      )}

      {showForm && canCreate && (
        <div>
          <h2>{editId ? "Editar" : "Nuevo"} Paciente</h2>
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
              <label>Teléfono:</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
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
          placeholder="Buscar pacientes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
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
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Fecha Registro</th>
                {canEdit && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.id}</td>
                  <td>{paciente.nombre}</td>
                  <td>{paciente.telefono}</td>
                  <td>{paciente.correo}</td>
                  <td>
                    {paciente.fecha_registro
                      ? new Date(paciente.fecha_registro).toLocaleDateString()
                      : "-"}
                  </td>
                  {canEdit && (
                    <td>
                      <button onClick={() => handleEdit(paciente)}>
                        Editar
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(paciente.id)}>
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
