import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const canAccessCitas = ["admin", "recepcion", "medico"].includes(user?.rol);
  const canAccessPacientes = ["admin", "recepcion"].includes(user?.rol);
  const canAccessServicios = user?.rol === "admin";
  const canAccessUsuarios = user?.rol === "admin";

  return (
    <nav className="bg-green-600 text-white shadow-md dark:bg-green-800">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-white">Sistema de Clínica</h2>
          <p className="text-sm opacity-90">
            Usuario: {user?.nombre} ({user?.rol})
          </p>
        </div>
        <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0 w-full md:w-auto justify-center md:justify-end">
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          {canAccessCitas && (
            <li>
              <Link to="/citas">Citas</Link>
            </li>
          )}
          {canAccessPacientes && (
            <li>
              <Link to="/pacientes">Pacientes</Link>
            </li>
          )}
          {canAccessServicios && (
            <li>
              <Link to="/servicios">Servicios</Link>
            </li>
          )}
          {canAccessUsuarios && (
            <li>
              <Link to="/usuarios">Usuarios</Link>
            </li>
          )}
          <li>
            <a
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};
