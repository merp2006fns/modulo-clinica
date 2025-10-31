import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "recepcion",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { registerUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const result = await registerUser(formData);
      console.log(result);
      setSuccess("Usuario registrado exitosamente");
      setFormData({
        nombre: "",
        correo: "",
        password: "",
        rol: "recepcion",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Registrar Usuario</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="rol">Rol:</label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
          >
            <option value="recepcion">Recepción</option>
            <option value="medico">Médico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit">Registrar Usuario</button>
      </form>
    </div>
  );
};
