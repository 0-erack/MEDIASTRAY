import { memo } from "react";

interface BotonFuncionProps {
  cabecera?: string|null;
  titulo: string|null|React.ReactNode;
  funcion?: (data?: any) => any | null; 
  hueco?: boolean;
  tipo?: 0 | 1 | 2 | 3;
  children?: React.ReactNode;
}

/**
 * Boton sencillo que llama a una funcion
 * @param cabecera si se estiliza como en la cabecera
 * @param titulo texto del boton
 * @param funcion a ejecutar
 * @param hueco si se estiliza sin fondo
 * @param tipo que estilo usara
 * @param children
 */
const BotonFuncion = memo(function BotonFuncion({cabecera, titulo, funcion, hueco = true, tipo = 0, children}: BotonFuncionProps) {
  
  const colorClasses = {
    0: { border: 'border-principal', bg: 'bg-principal' },   // normal
    1: { border: 'border-resaltado', bg: 'bg-resaltado' },   // resaltado
    2: { border: 'border-error', bg: 'bg-error' },           // rojo
    3: { border: 'border-info1', bg: 'bg-info1' }            // premium
  };

  const currentStyles = colorClasses[tipo as keyof typeof colorClasses] || colorClasses[0];
  const bgClass = hueco ? 'bg-fondo1' : currentStyles.bg;
  const textClass = hueco ? 'text-principal' : 'text-fondo-especial-1';

  return (
    <span className={`${cabecera ? "boton-cabecera" : ""} boton-funcion m-1`}>
      <button 
        className={`cursor-pointer py-1 px-2 border-2 my-1 ${currentStyles.border} ${bgClass} ${textClass} transition-colors hover:border-fondo2 hover:brightness-80 hover:scale-110`}
        onClick={(e) => {
          e.preventDefault(); 
          funcion?.(e);
        }}
      >
        {children && (<span className="mr-2 inline-block pt-1">{children}</span>)}
        {titulo}
      </button>
    </span>
  );
})

export default BotonFuncion;
