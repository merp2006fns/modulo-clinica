import { useAuth } from "../context/AuthContext";
import { RegisterForm } from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <h1>Bienvenido, {user.nombre}!</h1>
      <p>Correo: {user.correo}</p>
      <p>Rol: {user.rol}</p>

      {user.rol === "admin" && (
        <div>
          <h2>Administración</h2>
          <RegisterForm />
        </div>
      )}

      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};
