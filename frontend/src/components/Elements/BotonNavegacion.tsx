
import { Link, useLocation } from 'react-router-dom';

interface BotonNavegacoinProps {
  cabecera?: boolean|string|null;
  direccion: string|null;
  titulo: string|null|React.ReactNode;
}

function BotonNavegacion({cabecera, direccion, titulo}: BotonNavegacoinProps) {

  const slug = useLocation();
  const coincide = slug.pathname.includes(direccion ?? 'x');
  
  return (<>
      <Link className={(cabecera ? "boton-cabecera" : "") + " boton-navegacion whitespace-nowrap " + (coincide ? 'bg-resaltado!' : '')} to={direccion ?? '/'}>{titulo ?? ''}</Link>
    </>
  )
}

export default BotonNavegacion;
