import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BotonNavegacoinProps {
  cabecera?: boolean|string|null;
  direccion: string|null;
  titulo: string|null|React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Boton de navegacion para la cabecera u otros
 * @param cabecera si se estiliza como en la cabecera
 * @param direccion a donde lleva
 * @param titulo texto del boton
 * @param children
 */
const BotonNavegacion = memo(function BotonNavegacion({cabecera, direccion, titulo, children}: BotonNavegacoinProps) {

  const slug = useLocation();
  const coincide = direccion === "/" ? slug.pathname === "/" : slug.pathname.includes(direccion ?? 'x');
  
  return (<>
      <Link className={(cabecera ? "boton-cabecera" : "") + " boton-navegacion px-1 whitespace-nowrap " + (coincide ? 'bg-resaltado! text-fondo1' : '')} to={direccion ?? '/'}>{children}{titulo ?? ''}</Link>
    </>
  )
})

export default BotonNavegacion;
