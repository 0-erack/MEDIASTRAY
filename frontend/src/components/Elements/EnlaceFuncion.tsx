import { memo } from "react";
import { useNavigate } from "react-router";

interface EnlaceFuncionProps {
  cabecera?: boolean | string | null;
  titulo: string | null | React.ReactNode;
  funcion: string | ((data?: any) => void) | null;
  color?: number;
  subrallado?: boolean;
}

/**
 * Enlace que ejecuta una funcion o lleva a una url/sitio
 * @param cabecera si se estiliza como en la cabecera
 * @param titulo texto
 * @param funcion si es string lleva a esa ruta/url, si es una funcion la ejecuta
 * @param color que color se usara
 * @param subrallado si tiene underline
 */
const EnlaceFuncion = memo(function EnlaceFuncion({ cabecera, titulo, funcion, color = 0, subrallado = true }: EnlaceFuncionProps) {

  const navegar = useNavigate();
  const esEnlace = typeof funcion === 'string';
  const esUrl = esEnlace && funcion.startsWith("http");

  return (
    <span className={`${cabecera ? "enlace-cabecera" : ""} enlace-funcion pr-2 hover:text-resaltado ${['text-resaltado', 'text-principal'][color ?? 0]} ${subrallado ? 'underline' : ''} cursor-pointer fuente2 hover:text-principal`}>
      <a href={esUrl ? funcion : ""} onClick={(e) => {
        e.preventDefault();
        if (typeof funcion === 'string') {
          if (esUrl) {
            window.location.href = funcion;
          } else {
            navegar(funcion);
          }
        } else {
          try { (funcion as Function)() } catch (e) { e }
        }
      }}>{titulo ?? ""}</a>
    </span>
  )
})

export default EnlaceFuncion;
