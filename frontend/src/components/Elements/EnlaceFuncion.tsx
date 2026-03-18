
interface EnlaceFuncionProps {
  cabecera?: boolean|string|null;
  titulo: string|null|React.ReactNode;
  funcion: (data?: any) => void | null; 
}

function EnlaceFuncion({cabecera, titulo, funcion}: EnlaceFuncionProps) {
  
  return (
        <span className={(cabecera ? "enlace-cabecera" : "") + "enlace-funcion text-resaltado underline cursor-pointer fuente2 hover:text-principal"}>
            <a href="" onClick={(e) => {
              e.preventDefault();
              try {funcion()} catch (e) {e}
            }}>{titulo ?? ""}</a>
        </span>
  )
}

export default EnlaceFuncion;
