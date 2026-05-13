import { useEffect, useState } from "react";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import Icono from "../Principal/Icono";

interface TarjetaJuegoProps {
  juego: Record<string, any>;
  mediano?: boolean;
  //TODO: que salga si sigues al juego
}

/**
 * Representa la miniatura de un juego
 * @param juego datos a mostrar
 * @param mediano si se muestra en formato mediano
 */
function TarjetaJuego({ juego, mediano = false }: TarjetaJuegoProps) {

  const urlEnUso = mediano ? juego.urlPortada2 : juego.urlPortada1;
  const { verUsuario } = useApiUsuarios();
  const [duegno, setDuegno] = useState<Record<string, any>|null>(null);
  const traduccion = useIdioma();
  const { PUBLIC_URL } = useAjustes();

  const buscarDuegno = async () => {
    setDuegno(await verUsuario(juego.idCreador));
  }
  useEffect(() => {
    if (mediano) buscarDuegno();
  }, []);

  return (
    <div className={`${mediano ? '' : 'border-2 border-principal sm:mx-0 m-5 mb-0 text-xs'} relative min-h-[110px] z-101 sm:grid grid-cols-[auto_1fr] w-full bg-fondo-especial-1`}>
      <img src={urlEnUso ?? `${PUBLIC_URL}/coverless${mediano ? '2' : '1'}.png`} className={mediano ? 'm-auto w-[150px] max-h-[225px] sm:mr-3' : "mx-0 max-w-[230px] max-h-[107px] object-cover [image-rendering-pixelated]"} />
      <div className="p-2 pt-1 break-all">
        <span className="text-lg"><EnlaceFuncion titulo={juego.titulo} funcion={"/game/" + juego.id} /> </span>
        <span className="whitespace-nowrap col-span-2 px-2 mt-1 tracking-widest">
          <Icono color='var(--color-principal)' numero={1} /> {juego.cantidadJugadores} {"|"} <Icono color='var(--color-principal)' numero={18} /> {juego.cantidadSeguidores}
          {juego.precio && (<span> | {juego.precio}</span>)}
        </span><br />
        <p className="overflow-y-scroll max-h-8">{juego.descripcionCorta}</p>
        {juego.generos && (
          <p className="col-span-2">- {juego.generos.join(", ")}</p>
        )}
        {(juego.tags && mediano) && (
          <p className="col-span-2">- {juego.tags.join(", ")}</p>
        )}
        {duegno && (<span className="text-sm">{traduccion("palabras", "hechoPor")}<EnlaceFuncion color={1} titulo={duegno.nombre} funcion={"/user/" + duegno.nickname} /></span>)}
      </div>
    </div>
  )
}

export default TarjetaJuego; 
