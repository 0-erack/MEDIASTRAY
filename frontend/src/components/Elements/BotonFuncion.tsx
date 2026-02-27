
interface BotonFuncionProps {
  cabecera?: string|null;
  titulo: string|null|React.ReactNode;
  funcion?: (data?: any) => any | null; 
}

function BotonFuncion({cabecera, titulo, funcion}: BotonFuncionProps) {
  
  return (
        <span className={(cabecera ? "boton-cabecera" : "") + "boton-funcion"}>
            <button onClick={(e)=>{e.preventDefault(); funcion?.(e)}}>{titulo}</button>
        </span>
  )
}

export default BotonFuncion;
