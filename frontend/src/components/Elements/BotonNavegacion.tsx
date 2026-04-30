import { NavLink } from 'react-router-dom';

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
const BotonNavegacion = ({ cabecera, direccion, titulo, children }: BotonNavegacoinProps) => {
  return (
    <NavLink 
      to={direccion ?? '/'}
      className={({ isActive }) => 
        (cabecera ? "boton-cabecera" : "") + 
        " boton-navegacion px-1 whitespace-nowrap " + 
        (isActive ? 'bg-resaltado! text-fondo1' : '')
      }
    >
      {children}{titulo ?? ''}
    </NavLink>
  );
};
export default BotonNavegacion;
