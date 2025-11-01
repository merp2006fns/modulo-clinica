import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const canAccessCitas = ['admin', 'recepcion', 'medico'].includes(user?.rol);
  const canAccessPacientes = ['admin', 'recepcion'].includes(user?.rol);
  const canAccessServicios = user?.rol === 'admin';
  const canAccessUsuarios = user?.rol === 'admin';

  return (
    <nav>
      <div>
        <h2>Sistema de Clínica</h2>
        <p>Usuario: {user?.nombre} {user?.apellido} ({user?.rol})</p>
      </div>
      <ul>
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
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </li>
      </ul>
    </nav>
  );
};

