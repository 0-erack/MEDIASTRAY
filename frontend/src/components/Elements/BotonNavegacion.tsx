
import { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BotonNavegacoinProps {
  cabecera?: boolean|string|null;
  direccion: string|null;
  titulo: string|null|React.ReactNode;
  children?: ReactElement;
}

function BotonNavegacion({cabecera, direccion, titulo, children}: BotonNavegacoinProps) {

  const slug = useLocation();
  const coincide = direccion === "/" ? slug.pathname === "/" : slug.pathname.includes(direccion ?? 'x');
  
  return (<>
      <Link className={(cabecera ? "boton-cabecera" : "") + " boton-navegacion px-1 whitespace-nowrap " + (coincide ? 'bg-resaltado!' : '')} to={direccion ?? '/'}>{children}{titulo ?? ''}</Link>
    </>
  )
}

export default BotonNavegacion;
