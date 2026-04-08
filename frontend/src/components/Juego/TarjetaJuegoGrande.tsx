import { useCallback, useEffect, useState } from "react";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useIdioma from "../../hooks/useIdioma";
import useSesion from "../../hooks/useSesion";
import useTituloDinamico from "../../hooks/useTituloDinamico";
import { timestampAFecha } from "../../libraries/extraFechas";
import { Usuario } from "../../types/Usuario";
import BotonFuncion from "../Elements/BotonFuncion";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import MarkdownDisplay from "../Elements/MarkdownDisplay";
import Titulo from "../Elements/Titulo";
import Icono from "../Principal/Icono";
import TarjetaUsuario from "../Usuario/TarjetaUsuario";
import FondoPortadaJuego from "./FondoPortadaJuego";

interface TarjetaJuegoGrandeProps {
  juego: Record<string, any>;
  esMio: boolean | null;
}

/**
 * Componente para mostrar todos los datos de un juego y mas
 * @param juego datos a mostrar
 * @param esMio si se muestra como que el juego es del propio usuario
 */
function TarjetaJuegoGrande({ juego, esMio }: TarjetaJuegoGrandeProps) {

  const [jugando, setJugando] = useState(false);
  const traduccion = useIdioma();
  const [siguiendo, setSiguiendo] = useState(false);
  const { usuario } = useSesion();
  const [editando, setEditando] = useState(false);
  const [creadorEsPremium, setCreadorEsPremium] = useState(false);
  const { verPremium, verUsuario } = useApiUsuarios();
  const { verSiguiendoJuego, seguirJuego } = useApiJuegos();
  const [usuarioCreador, setUsuarioCreador] = useState<Partial<Usuario> | null>(null);
  useTituloDinamico("", juego.titulo);

  const alternarSeguir = async () => {
    const resultado = await seguirJuego(juego.id, siguiendo ? -1 : 1);
    if (resultado) {
      setSiguiendo(!siguiendo);
      juego.cantidadSeguidores += siguiendo ? -1 : 1;
    }
  }

  const filtrarAdiciones = (tipo: string): Array<Record<string, any>> => {
    if (!juego?.adiciones) return [];
    return juego.adiciones.filter((e: Record<string, any>) => e?.type as string === tipo) ?? [];
  }

  const cargaInicial = useCallback(async () => {
    setCreadorEsPremium((await verPremium(juego.idCreador))?.active ?? false);
    setUsuarioCreador(await verUsuario(juego.idCreador) ?? null);
    setSiguiendo(await verSiguiendoJuego(juego.id));
  }, []);
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div className="overflow-hidden relative w-full p-1">
      {(juego.urlPortada3 && juego.urlPortada3 !== "/public/coverless3.png" && !jugando) && (<FondoPortadaJuego url={juego.urlPortada3} />)}
      <div className="sm:flex items-center">
        <Titulo>{juego.titulo ?? '???'}</Titulo>
        {!jugando && (<BotonFuncion titulo={traduccion("botones", "jugar")} funcion={() => { setJugando(true); setEditando(false) }} tipo={1} hueco={false}>
          <Icono numero={15} color="var(--color-fondo1)" />
        </BotonFuncion>)}
        {!esMio && usuario && (<BotonFuncion titulo={traduccion("botones", siguiendo ? "noSeguir" : "seguir")} funcion={alternarSeguir} tipo={1}>
          {siguiendo ? (<Icono numero={18} color='var(--color-info1)' />) : (<Icono numero={19} color='var(--color-principal)' />)}
        </BotonFuncion>)}
        {!jugando && esMio && !editando && (<BotonFuncion titulo={traduccion("botones", "editarJuego")} funcion={() => { setEditando(true) }} tipo={1}>
          <Icono numero={9} color="var(--color-principal)" />
        </BotonFuncion>)}
        {juego.precio && (<Titulo magnitud={3}>{juego.precio}</Titulo>)}
      </div>
      {jugando && (<div className="w-full h-max min-h-[600px] bg-black my-5 z-1000">
        JUGAR
      </div>)}
      <div className="lg:flex gap-5">
        {juego.urlPortada1 && (<img src={juego.urlPortada1 ?? "/public/coverless1.png"} alt={juego.titulo} className="w-[460px] h-[215px] lg:mb-0 mb-3 mx-auto shrink-0 object-cover relative z-100 border border-principal text-center" />)}
        <div className='flex-1'>
          <div>{juego.descripcion?.length ?
            (creadorEsPremium ?
              (<MarkdownDisplay text={juego.descripcion} />)
              : (<div className='overflow-y-scroll w-auto border border-principal p-2 bg-fondo-especial-1' style={{ maxHeight: '400px' }}>{juego.descripcion}</div>))
            : traduccion("errores", "noDescripcion")}</div>
        </div>
      </div>
      <div className="lg:grid grid-cols-1 sm:grid-cols-2 gap-4 w-full p-1 mt-6">
        {filtrarAdiciones("trailer").map((e, i) => {
          return (
            <div key={i} className="border border-principal p-2 h-80 overflow-auto flex flex-col">
              <p className="font-bold mb-2">{e.subtitle}</p>
              <div className="flex-1 flex items-center justify-center bg-black/20">
                {e?.url && (<video controls className="w-full max-h-full" src={e.url}></video>)}
                {e?.data?.iframe && (<div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: e.data.iframe }} />)}
              </div>
            </div>
          );
        })}
        {filtrarAdiciones("images").map((e, i) => {
          return (<div key={i} className="border border-principal p-2 h-80 overflow-auto flex flex-col">
            <p className="font-bold mb-2">{e.subtitle}</p>
            {e?.url && (<EnlaceFuncion funcion={e.url} titulo={e.url} />)}
            {e.data.images.map((ee: string, ii: number) => {
              return (<img src={ee} key={ii} className="object-cover relative z-100 m-4" />)
            })}
          </div>);
        })}
      </div>
      <div className="lg:flex items-center text-center">
        {usuarioCreador && (<TarjetaUsuario usuario={usuarioCreador} destacado={creadorEsPremium} />)}
        <div className="m-5 text-left">
          <div><Icono numero={1} color="var(--color-principal)" /> {traduccion("extra", "labelJugadores")} <strong>{juego.cantidadJugadores}</strong></div>
          <div><Icono numero={18} color="var(--color-principal)" /> {traduccion("extra", "labelSeguidores")} <strong>{juego.cantidadSeguidores}</strong></div>
          <div><Icono numero={5} color="var(--color-principal)" /> {traduccion("extra", "labelComentarios")} <strong>{juego.cantidadComentarios}</strong></div>
        </div>
        <div className="text-left">
          <div>{traduccion("formularios", "fechaCreacion")} {timestampAFecha(juego.fechaCreacion)}</div>
          <div>{traduccion("formularios", "fechaActualizacion")} {timestampAFecha(juego.fechaUltima ?? juego.fechaCreacion)}</div>
          {juego.versionActual && (<div>{traduccion("formularios", "versionActual")} {juego.versionActual}</div>)}
          {juego.edad != 0 && <div>{traduccion("formularios", "edadMinima")} {juego.edad}</div>}
        </div>
        <div className="ml-0 lg:ml-5 text-left">
          {juego.generos?.length != 0 && (<p>{traduccion("formularios", "listaGeneros")} {juego.generos.join(", ")}</p>)}
          {juego.tags?.length != 0 && (<p>{traduccion("formularios", "listaTags")} {juego.tags.join(", ")}</p>)}
          {juego.avisos?.length != 0 && (<p>{traduccion("formularios", "listaAvisos")} {juego.avisos.join(", ")}</p>)}
          {juego.idiomas?.length != 0 && (<p>{traduccion("formularios", "listaIdiomas")} {juego.idiomas.join(", ")}</p>)}
        </div>
        <div className="ml-0 sm:ml-5">
          REPORTAR
        </div>
      </div>
      <div>
        ADICIONES




















      </div>
      <div>
        COMENTARIOS
      </div>
    </div>
  )
}

export default TarjetaJuegoGrande; 
