import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();

  const canAccessCitas = ["admin", "recepcion", "medico"].includes(user?.rol);
  const canAccessPacientes = ["admin", "recepcion"].includes(user?.rol);
  const canAccessServicios = user?.rol === "admin";
  const canAccessUsuarios = user?.rol === "admin";

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1>
        Bienvenido, {user?.nombre}!
      </h1>
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Correo:</strong> {user?.correo}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Rol:</strong> {user?.rol}
        </p>
      </div>
      <div>
        <h2>Acceso Rápido</h2>
        <div className="dashboard-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {canAccessCitas && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              <h3>
                <Link to="/citas">Gestionar Citas</Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ver y gestionar todas las citas médicas
              </p>
            </div>
          )}
          {canAccessPacientes && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              <h3>
                <Link to="/pacientes">Gestionar Pacientes</Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ver y gestionar el registro de pacientes
              </p>
            </div>
          )}
          {canAccessServicios && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              <h3>
                <Link to="/servicios">Gestionar Servicios</Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Administrar los servicios médicos disponibles
              </p>
            </div>
          )}
          {canAccessUsuarios && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
              <h3>
                <Link to="/usuarios">Gestionar Usuarios</Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Administrar usuarios del sistema
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
