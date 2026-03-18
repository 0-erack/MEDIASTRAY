
interface BotonFuncionProps {
  cabecera?: string|null;
  titulo: string|null|React.ReactNode;
  funcion?: (data?: any) => any | null; 
  hueco?: boolean;
  colorA?: string;
  colorB?: string;
}

function BotonFuncion({cabecera, titulo, funcion, hueco = false, colorA = 'var(--color-principal)', colorB = 'var(--color-fondo2)'}: BotonFuncionProps) {
  
  return (
        <span className={`${cabecera ? "boton-cabecera" : ""} boton-funcion`}>
            <button className={`text-[${colorA}] border-2 border-[${colorA}] bg-[${hueco ? 'fondo2' : colorB}] cursor-pointer py-1 px-2 `} onClick={(e)=>{e.preventDefault(); funcion?.(e)}}>{titulo}</button>
        </span>
  )
}

export default BotonFuncion;
