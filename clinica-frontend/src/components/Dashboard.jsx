import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useAuth();

  const canAccessCitas = ['admin', 'recepcion', 'medico'].includes(user?.rol);
  const canAccessPacientes = ['admin', 'recepcion'].includes(user?.rol);
  const canAccessServicios = user?.rol === 'admin';
  const canAccessUsuarios = user?.rol === 'admin';

  return (
    <div>
      <h1>Bienvenido, {user?.nombre} {user?.apellido}!</h1>
      <p>Correo: {user?.correo}</p>
      <p>Rol: {user?.rol}</p>

      <div>
        <h2>Acceso Rápido</h2>
        {canAccessCitas && (
          <div>
            <h3>
              <Link to="/citas">Gestionar Citas</Link>
            </h3>
            <p>Ver y gestionar todas las citas médicas</p>
          </div>
        )}
        {canAccessPacientes && (
          <div>
            <h3>
              <Link to="/pacientes">Gestionar Pacientes</Link>
            </h3>
            <p>Ver y gestionar el registro de pacientes</p>
          </div>
        )}
        {canAccessServicios && (
          <div>
            <h3>
              <Link to="/servicios">Gestionar Servicios</Link>
            </h3>
            <p>Administrar los servicios médicos disponibles</p>
          </div>
        )}
        {canAccessUsuarios && (
          <div>
            <h3>
              <Link to="/usuarios">Gestionar Usuarios</Link>
            </h3>
            <p>Administrar usuarios del sistema</p>
          </div>
        )}
      </div>
    </div>
  );
};
