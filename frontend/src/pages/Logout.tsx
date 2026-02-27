import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAjustes from '../hooks/useAjustes';
import { TextoTraducido } from '../libraries/traducir';
import useMensajes from '../hooks/useMensajes';

function Logout() {

  const { logout, idiomaActual } = useAjustes();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();

  const cerrarSesion = async () => {
    lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "logout"), 3);
    await logout();
    navegar("/");
  }

  useEffect(() => {
    cerrarSesion();
  }, []);

  return (
    <>
      <h2>Logout</h2>
    </>
  )
}

export default Logout;