import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useIdioma from '../hooks/useIdioma';
import useMensajes from '../hooks/useMensajes';
import useSesion from '../hooks/useSesion';

function Logout() {

  const { logout } = useSesion();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();
  let hecho = false;

  const cerrarSesion = async () => {
    if (!hecho) lanzarMensaje(useIdioma("mensajes", "logout"), 3);
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