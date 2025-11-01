import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import SearchSelect from "../components/SearchSelect";

const API_URL = "http://localhost:8080";

export const CitasPage = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: "",
    servicio_id: "",
    medico_usuario_id: "",
    fecha_hora: "",
    estado: "programada",
    notas: "",
  });
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: "",
    fecha: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const searchTimeoutRef = useRef(null);

  const canCreate = ["admin", "recepcion"].includes(user?.rol);
  const canEdit = ["admin", "recepcion", "medico"].includes(user?.rol);
  const canDelete = ["admin", "recepcion"].includes(user?.rol);

  const fetchCitas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        per_page: "10",
      });
      if (filtros.estado) params.append("estado", filtros.estado);
      if (filtros.fecha) params.append("fecha", filtros.fecha);
      if (filtros.search) params.append("q", filtros.search);

      const response = await fetch(`${API_URL}/citas?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.data && data.pagination) {
        setCitas(data.data);
        setPagination(data.pagination);
      } else {
        setCitas(Array.isArray(data) ? data : []);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error al cargar citas", err);
      setError("Error al cargar citas");
    } finally {
      setLoading(false);
    }
  }, [page, filtros.estado, filtros.fecha, filtros.search]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (filtros.search) {
      searchTimeoutRef.current = setTimeout(() => {
        setPage(1);
        fetchCitas();
      }, 500);
    } else {
      fetchCitas();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filtros.search, fetchCitas]);

  useEffect(() => {
    if (!filtros.search) {
      fetchCitas();
    }
  }, [page, filtros.estado, filtros.fecha, fetchCitas, filtros.search]);

  const searchPacientes = async (searchTerm) => {
    try {
      let url = `${API_URL}/pacientes/search`;
      if (searchTerm) {
        url += `?termino=${encodeURIComponent(searchTerm)}&limit=10`;
      } else {
        url += `?limit=10`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      const data = await response.json();
      return data.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al buscar pacientes", err);
      return [];
    }
  };

  const searchServicios = async (searchTerm) => {
    try {
      let url = `${API_URL}/servicios/search`;
      if (searchTerm) {
        url += `?termino=${encodeURIComponent(searchTerm)}&limit=10`;
      } else {
        url += `?limit=10`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      const data = await response.json();
      return data.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al buscar servicios", err);
      return [];
    }
  };

  const searchMedicos = async (searchTerm) => {
    try {
      let url = `${API_URL}/medicos/search`;
      if (searchTerm) {
        url += `?termino=${encodeURIComponent(searchTerm)}&limit=10`;
      } else {
        url += `?limit=10`;
      }

      const response = await fetch(url, {
        credentials: "include",
      });
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error al buscar médicos", err);
      return [];
    }
  };

  useEffect(() => {
    if (editId && showForm) {
      const cita = citas.find((c) => c.id === editId);
      if (cita) {
        const loadSpecificData = async () => {
          try {
            if (cita.paciente_id) {
              const pacienteResponse = await fetch(
                `${API_URL}/pacientes/${cita.paciente_id}`,
                {
                  credentials: "include",
                }
              );
              const paciente = await pacienteResponse.json();
              setPacientes([paciente]);
            }

            if (cita.servicio_id) {
              const servicioResponse = await fetch(
                `${API_URL}/servicios/${cita.servicio_id}`,
                {
                  credentials: "include",
                }
              );
              const servicio = await servicioResponse.json();
              setServicios([servicio]);
            }

            if (cita.medico_usuario_id) {
              const medicoResponse = await fetch(
                `${API_URL}/medicos/${cita.medico_usuario_id}`,
                {
                  credentials: "include",
                }
              );
              const medico = await medicoResponse.json();
              setMedicos([medico]);
            }
          } catch (error) {
            console.error("Error loading specific data:", error);
          }
        };

        loadSpecificData();
      }
    } else if (!showForm) {
      setPacientes([]);
      setServicios([]);
      setMedicos([]);
    }
  }, [editId, showForm, citas]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editId ? `${API_URL}/citas/${editId}` : `${API_URL}/citas`;
      const method = editId ? "PUT" : "POST";

      const dataToSend = editId
        ? formData
        : (() => {
            const { _estado, ...rest } = formData;
            return rest;
          })();

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar cita");
      }

      setShowForm(false);
      setEditId(null);
      setFormData({
        paciente_id: "",
        servicio_id: "",
        medico_usuario_id: "",
        fecha_hora: "",
        estado: "programada",
        notas: "",
      });
      fetchCitas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (cita) => {
    setFormData({
      paciente_id: cita.paciente_id,
      servicio_id: cita.servicio_id,
      medico_usuario_id: cita.medico_usuario_id,
      fecha_hora: cita.fecha_hora
        ? cita.fecha_hora.replace(" ", "T").substring(0, 16)
        : "",
      estado: cita.estado,
      notas: cita.notas || "",
    });
    setEditId(cita.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;

    try {
      const response = await fetch(`${API_URL}/citas/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar cita");
      }

      fetchCitas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      paciente_id: "",
      servicio_id: "",
      medico_usuario_id: "",
      fecha_hora: "",
      estado: "programada",
      notas: "",
    });
    setPacientes([]);
    setServicios([]);
    setMedicos([]);
  };

  return (
    <div>
      <h1>Gestión de Citas</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {canCreate && (
        <button onClick={() => setShowForm(true)}>Nueva Cita</button>
      )}

      {showForm && canCreate && (
        <div>
          <h2>{editId ? "Editar" : "Nueva"} Cita</h2>
          <form onSubmit={handleSubmit}>
            <SearchSelect
              onSearch={searchPacientes}
              onChange={(value) =>
                setFormData({ ...formData, paciente_id: value })
              }
              value={formData.paciente_id}
              placeholder="Buscar paciente..."
              name="paciente_id"
              id="paciente_id"
              minSearchLength={2}
              debounceMs={500}
              initialOptions={pacientes}
            />

            <SearchSelect
              onSearch={searchServicios}
              onChange={(value) =>
                setFormData({ ...formData, servicio_id: value })
              }
              value={formData.servicio_id}
              placeholder="Buscar servicio..."
              name="servicio_id"
              id="servicio_id"
              minSearchLength={2}
              debounceMs={500}
              initialOptions={servicios}
            />

            <SearchSelect
              onSearch={searchMedicos}
              onChange={(value) =>
                setFormData({ ...formData, medico_usuario_id: value })
              }
              value={formData.medico_usuario_id}
              placeholder="Buscar médico..."
              name="medico_usuario_id"
              id="medico_usuario_id"
              minSearchLength={2}
              debounceMs={500}
              initialOptions={medicos}
            />

            <div>
              <label>Fecha y Hora:</label>
              <input
                type="datetime-local"
                value={formData.fecha_hora}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_hora: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Estado:</label>
              {editId ? (
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                  required
                >
                  <option value="programada">Programada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_asistio">No Asistió</option>
                </select>
              ) : (
                <input
                  type="text"
                  value="Programada"
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              )}
            </div>
            <div>
              <label>Notas:</label>
              <textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
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
        <h3>Filtros</h3>
        <div>
          <label>Estado:</label>
          <select
            value={filtros.estado}
            onChange={(e) => {
              setFiltros({ ...filtros, estado: e.target.value });
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_asistio">No Asistió</option>
          </select>
        </div>
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            value={filtros.fecha}
            onChange={(e) => {
              setFiltros({ ...filtros, fecha: e.target.value });
              setPage(1);
            }}
          />
        </div>
        <div>
          <label>Buscar por término (paciente, médico, servicio, notas):</label>
          <input
            type="text"
            value={filtros.search}
            onChange={(e) => {
              setFiltros({ ...filtros, search: e.target.value });
            }}
            placeholder="Buscar citas..."
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Médico</th>
                <th>Fecha/Hora</th>
                <th>Estado</th>
                <th>Notas</th>
                {canEdit && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>{cita.id}</td>
                  <td>
                    {cita.paciente_nombre} {cita.paciente_apellido}
                  </td>
                  <td>{cita.servicio_nombre}</td>
                  <td>
                    {cita.medico_nombre} {cita.medico_apellido}
                  </td>
                  <td>{new Date(cita.fecha_hora).toLocaleString()}</td>
                  <td>{cita.estado}</td>
                  <td>{cita.notas || "-"}</td>
                  {canEdit && (
                    <td>
                      {(user?.rol === "admin" ||
                        user?.rol === "recepcion" ||
                        (user?.rol === "medico" &&
                          cita.medico_usuario_id == user?.id)) && (
                        <button onClick={() => handleEdit(cita)}>Editar</button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(cita.id)}>
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
