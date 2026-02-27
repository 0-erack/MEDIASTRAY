
import { Link } from 'react-router-dom';

interface BotonNavegacoinProps {
  cabecera?: boolean|string|null;
  direccion: string|null;
  titulo: string|null|React.ReactNode;
}

function BotonNavegacion({cabecera, direccion, titulo}: BotonNavegacoinProps) {
  
  return (
        <span className={(cabecera ? "boton-cabecera" : "") + "boton-navegacion"}>
            <Link to={direccion ?? '/'}>{titulo ?? ''}</Link>
        </span>
  )
}

export default BotonNavegacion;
