
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonNavegacion from '../components/Elements/BotonNavegacion';
import Titulo from '../components/Elements/Titulo';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de error 404
 */
const ErrorNotFound = memo(function ErrorNotFound() {

  useTituloDinamico("errorNotFound");
  const navegar = useNavigate();

  useEffect(() => {
    if (location.pathname.startsWith("/games")) {
      navegar("/public/err404.html");
      location.reload();
    }
    //if ( location.pathname.startsWith("/public")) navegar("/public/err404.html");
  }, []);

  return (
    <>
      <Titulo><Texto tipo="titulos" nombre="error404" /></Titulo>
      <p><Texto tipo="parrafos" nombre="error404Explicacion" /></p>
      <BotonNavegacion direccion={"/"} titulo={<Texto tipo="botones" nombre="irInicio" />} />
    </>
  )
});

export default ErrorNotFound;