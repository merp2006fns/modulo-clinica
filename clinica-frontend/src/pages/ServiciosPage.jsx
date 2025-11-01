import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8080";

export const ServiciosPage = () => {
  const { user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);

  const canManage = user?.rol === "admin";

  useEffect(() => {
    fetchServicios();
  }, [page, search]);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        per_page: "10",
      });
      if (search) params.append("search", search);

      const response = await fetch(`${API_URL}/servicios?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.data && data.pagination) {
        setServicios(data.data);
        setPagination(data.pagination);
      } else {
        setServicios(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error al cargar servicios", err);
      setError("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editId
        ? `${API_URL}/servicios/${editId}`
        : `${API_URL}/servicios`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar servicio");
      }

      setShowForm(false);
      setEditId(null);
      setFormData({
        nombre: "",
        precio: "",
      });
      fetchServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (servicio) => {
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio.toString(),
    });
    setEditId(servicio.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const response = await fetch(`${API_URL}/servicios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar servicio");
      }

      fetchServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      nombre: "",
      precio: "",
    });
  };

  return (
    <div>
      <h1>Gestión de Servicios</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {canManage && (
        <button onClick={() => setShowForm(true)}>Nuevo Servicio</button>
      )}

      {showForm && canManage && (
        <div>
          <h2>{editId ? "Editar" : "Nuevo"} Servicio</h2>
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
              <label>Precio:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
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
          placeholder="Buscar servicios..."
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
                <th>Precio</th>
                {canManage && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td>{servicio.id}</td>
                  <td>{servicio.nombre}</td>
                  <td>${servicio.precio}</td>
                  {canManage && (
                    <td>
                      <button onClick={() => handleEdit(servicio)}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(servicio.id)}>
                        Eliminar
                      </button>
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
