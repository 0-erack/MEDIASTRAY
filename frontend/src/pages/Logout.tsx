import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAjustes from '../hooks/useAjustes';
import { TextoTraducido } from '../libraries/traducir';
import useMensajes from '../hooks/useMensajes';
import useSesion from '../hooks/useSesion';

function Logout() {

  const { idiomaActual } = useAjustes();
  const { logout } = useSesion();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();
  let hecho = false;

  const cerrarSesion = async () => {
    if (!hecho) lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "logout"), 3);
    await logout(true);
    navegar("/");
    hecho = true;
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