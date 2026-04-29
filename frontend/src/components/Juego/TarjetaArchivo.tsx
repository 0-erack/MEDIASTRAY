import { memo, useCallback, useMemo } from "react";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { timestampAFecha } from "../../libraries/extraFechas";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface TarjetaArchivoProps {
  archivo: Record<string, any>;
  funcionEliminar?: (id:string) => Promise<void>;
}

/**
 * Representa un archivo del juego
 * @param archivo datos del archivo
 */
const TarjetaArchivo = memo(function TarjetaArchivo({ archivo, funcionEliminar }: TarjetaArchivoProps) {
  const { GAMES_URL } = useAjustes();
  const traduccion = useIdioma();

  const peso = useMemo(() => ((archivo.size / 1024) / 1024).toFixed(2) + " Mb", [archivo.size]);
  const direccion = useMemo(() => `${GAMES_URL}/${archivo.game}/${archivo.name}/${archivo.name}.zip`, [GAMES_URL, archivo.game, archivo.name]);
  const fecha = useMemo(() => archivo.date && timestampAFecha(archivo.date), [archivo.date]);
  const eliminar = useCallback(() => funcionEliminar?.(archivo.name), [archivo.name, funcionEliminar]);



  return (
    <div className="border border-principal p-2 my-1 flex gap-4 sm:gap-8">
      <span className="font-bold">{archivo.name ?? 'file'}</span>
      <span>{peso}</span>
      <span>{archivo.date && timestampAFecha(archivo.date)}</span>
      <span><EnlaceFuncion titulo={traduccion("botones", "descargar")} funcion={direccion} /></span>
      {funcionEliminar && (<span><EnlaceFuncion titulo={traduccion("botones", "borrar")} funcion={() => funcionEliminar(archivo.name)} /></span>)}
    </div>
  )
});

export default TarjetaArchivo; 
