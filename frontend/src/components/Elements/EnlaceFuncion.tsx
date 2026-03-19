import { useNavigate } from "react-router";

interface EnlaceFuncionProps {
  cabecera?: boolean|string|null;
  titulo: string|null|React.ReactNode;
  funcion: string | ((data?: any) => void) | null; 
}

function EnlaceFuncion({cabecera, titulo, funcion}: EnlaceFuncionProps) {
  
  const navegar = useNavigate();
  const esEnlace = typeof funcion === 'string';
  const esUrl = esEnlace && funcion.startsWith("http");

  return (
        <span className={(cabecera ? "enlace-cabecera" : "") + "enlace-funcion text-resaltado underline cursor-pointer fuente2 hover:text-principal"}>
            <a href={esUrl ? funcion : ""} onClick={(e) => {
              if (!esUrl) {
                e.preventDefault();
                return;
              }
              if (esEnlace) {
                navegar(funcion);
              } else {
                try {(funcion! as Function)()} catch (e) {e}
              }
            }}>{titulo ?? ""}</a>
        </span>
  )
}

export default EnlaceFuncion;
