import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { timestampAFecha } from "../../libraries/extraFechas";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface TarjetaArchivoProps {
  archivo: Record<string, any>;
}

/**
 * Representa un archivo del juego
 * @param archivo datos del archivo
 */
function TarjetaArchivo({ archivo }: TarjetaArchivoProps) {

  const peso = ((archivo.size / 1024) / 1024).toFixed(2) + " Mb";
  const { GAMES_URL } = useAjustes();
  const traduccion = useIdioma();
  const direccion = `${GAMES_URL}/${archivo.game}/${archivo.name}/${archivo.name}.zip`;

  return (
    <div className="border border-principal p-2 my-1 flex gap-4 sm:gap-8">
      <span className="font-bold">{archivo.name ?? 'file'}</span>
      <span>{peso}</span>
      <span>{archivo.date && timestampAFecha(archivo.date)}</span>
      <span><EnlaceFuncion titulo={traduccion("botones", "descargar")} funcion={direccion} /></span>
    </div>
  )
}

export default TarjetaArchivo; 
