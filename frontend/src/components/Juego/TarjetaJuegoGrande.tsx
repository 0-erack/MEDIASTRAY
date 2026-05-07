import { useCallback, useEffect, useState } from "react";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import useTituloDinamico from "../../hooks/useTituloDinamico";
import { timestampAFecha } from "../../libraries/extraFechas";
import { Usuario } from "../../types/Usuario";
import CagradorComentarios from "../Comentarios/CagradorComentarios";
import ElementoReporte from "../Comentarios/ElementoReporte";
import BotonFuncion from "../Elements/BotonFuncion";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import MarkdownDisplay from "../Elements/MarkdownDisplay";
import Titulo from "../Elements/Titulo";
import FormularioArchivoJuego from "../Forms/FormularioArchivoJuego";
import FormularioJuego from "../Forms/FormularioJuego";
import Icono from "../Principal/Icono";
import TarjetaUsuario from "../Usuario/TarjetaUsuario";
import FondoPortadaJuego from "./FondoPortadaJuego";
import PantallaJuego from "./PantallaJuego";
import TargetaArchivo from "./TarjetaArchivo";

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
  const { usuario, esAdmin } = useSesion();
  const [editando, setEditando] = useState(false);
  const [editandoArchivos, setEditandoArchivos] = useState(false);
  const [creadorEsPremium, setCreadorEsPremium] = useState(false);
  const { verPremium, verUsuario } = useApiUsuarios();
  const { verSiguiendoJuego, seguirJuego, verArchivos } = useApiJuegos();
  const [usuarioCreador, setUsuarioCreador] = useState<Partial<Usuario> | null>(null);
  const { lanzarMensaje } = useMensajes();
  const { PUBLIC_URL, GAMES_URL } = useAjustes();
  const [archivos, setArchivos] = useState<Array<Record<string, any>>>([]);
  useTituloDinamico("", juego.titulo);

  const alternarSeguir = useCallback(async () => {
    const resultado = await seguirJuego(juego.id, siguiendo ? -1 : 1);
    if (resultado) {
      lanzarMensaje(traduccion("mensajes", siguiendo ? "noSeguirJuego" : "seguirJuego"), siguiendo ? 3 : 1);
      juego.cantidadSeguidores += siguiendo ? -1 : 1;
      setSiguiendo(!siguiendo);
    }
  }, [siguiendo, juego.id, traduccion]);

  const filtrarAdiciones = useCallback((tipo: string, negativo = false, personalizadas: Array<Record<string, any>> = []): Array<Record<string, any>> => {
    if (!juego?.adiciones && !personalizadas.length) return [];
    return (personalizadas.length ? personalizadas : juego.adiciones).filter((e: Record<string, any>) => negativo ? e?.type as string !== tipo : e?.type as string === tipo) ?? [];
  }, [juego.adiciones]);

  const cargaInicial = useCallback(async () => {
    setCreadorEsPremium((await verPremium(juego.idCreador))?.active ?? false);
    setUsuarioCreador(await verUsuario(juego.idCreador) ?? null);
    setSiguiendo(await verSiguiendoJuego(juego.id));
    setArchivos(await verArchivos(juego.id));
  }, []);
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div className="overflow-hidden relative w-full p-1">
      {(juego.urlPortada3 && juego.urlPortada3 !== PUBLIC_URL + "/coverless3.png" && !jugando && !editando) && (<FondoPortadaJuego url={juego.urlPortada3} />)}
      <div className="sm:flex items-center">
        {(esAdmin > 0 && usuario) && (<p>{juego.id}</p>)}
        <Titulo>{juego.titulo ?? '???'}</Titulo>
        {(!jugando && archivos.filter((e) => { return e.name == "web" }).length) ? (<BotonFuncion titulo={traduccion("botones", "jugar")} funcion={() => { setJugando(true); setEditando(false) }} tipo={1} hueco={false}>
          <Icono numero={15} color="var(--color-fondo1)" />
        </BotonFuncion>) : ''}
        {!esMio && usuario && (<BotonFuncion titulo={traduccion("botones", siguiendo ? "noSeguir" : "seguir")} funcion={alternarSeguir} tipo={1}>
          {siguiendo ? (<Icono numero={18} color='var(--color-info1)' />) : (<Icono numero={19} color='var(--color-principal)' />)}
        </BotonFuncion>)}
        {!jugando && esMio && !editando && (<BotonFuncion titulo={traduccion("botones", "editarJuego")} funcion={() => { setEditando(true) }} tipo={0}>
          <Icono numero={9} color="var(--color-principal)" />
        </BotonFuncion>)}

        {!jugando && esMio && !editandoArchivos && (<BotonFuncion titulo={traduccion("botones", "editarArchivosJuego")} funcion={() => { setEditandoArchivos(true) }} tipo={0}>
          <Icono numero={21} color="var(--color-principal)" />
        </BotonFuncion>)}

        {juego.precio && (<Titulo magnitud={3}>{juego.precio}</Titulo>)}
      </div>
      {juego.publico == false && (<p>{traduccion("extra", "juegoEsPrivado")}</p>)}

      {editandoArchivos && (<div className="border-2 border-principal p-2 m-4">
        <FormularioArchivoJuego idJuego={juego.id} actualizar={setArchivos} previos={archivos} />
      </div>)}
      {editando && (<div className="border-2 border-principal p-2 m-4">
        <FormularioJuego juegoEditar={juego} />
      </div>)}
      {jugando && (<><div>
        <PantallaJuego juego={juego} />
      </div>
        <hr />
      </>)}
      <div className="lg:flex gap-5 mx-3">
        {juego.urlPortada1 && (<img src={juego.urlPortada1 ?? PUBLIC_URL + "/coverless1.png"} alt={juego.titulo} className="w-[460px] h-[215px] lg:mb-0 mb-3 mx-auto shrink-0 object-cover relative z-100 border border-principal text-center" />)}
        <div className='flex-1'>
          <div className="md:h-[215px] md:flex md:flex-col md:[&>*]:min-h-0 md:[&>*]:flex-1 md:[&>*]:overflow-y-auto">{juego.descripcion?.length ?
            (creadorEsPremium ?
              (<MarkdownDisplay text={juego.descripcion} />)
              : (<div className='overflow-y-scroll w-auto border border-principal p-2 bg-fondo-especial-1' style={{ maxHeight: '400px' }}>{juego.descripcion}</div>))
            : traduccion("errores", "noDescripcion")}</div>
        </div>
      </div>
      <div className="lg:grid grid-cols-1 mx-2 sm:grid-cols-2 gap-4 w-full p-1 mt-6 relative z-100">
        {filtrarAdiciones("trailer").map((e, i) => {
          return (
            <div key={i} className="border border-principal p-2 h-80 overflow-auto flex flex-col">
              <p className="font-bold mb-2 fuente2">{e.subtitle}</p>
              <div className="flex-1 flex items-center justify-center bg-black/20">
                {e?.url && (<video controls className="w-full max-h-full" src={e.url}></video>)}
                {e?.data?.iframe && (<div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: e.data.iframe }} />)}
              </div>
            </div>
          );
        })}
        {filtrarAdiciones("images").map((e, i) => {
          return (<div key={i} className="border border-principal p-2 h-80 flex flex-col">
            <EnlaceFuncion funcion={e.url} titulo={e.subtitle ?? e.url} color={1} />
            <div className="flex overflow-x-auto h-[430px] items-stretch py-2">
              {e.data.images.map((ee: string, ii: number) => {
                return (
                  <a href={ee} target="_blank" key={ii} className="mx-2 shrink-0 h-full">
                    <img
                      src={ee}
                      className="object-contain cursor-pointer z-100 h-full w-auto"
                      alt="Gallery item"
                    />
                  </a>
                )
              })}
            </div>
          </div>);
        })}
      </div>
      <div className="sm:flex items-center text-center mx-4">
        {usuarioCreador && (<TarjetaUsuario usuario={usuarioCreador} destacado={creadorEsPremium} />)}
        <div className="m-5 text-left">
          <div><Icono numero={1} color="var(--color-principal)" /> {traduccion("extra", "labelJugadores")} <strong>{juego.cantidadJugadores}</strong></div>
          <div><Icono numero={18} color="var(--color-principal)" /> {traduccion("extra", "labelSeguidores")} <strong>{juego.cantidadSeguidores}</strong></div>
          <div><Icono numero={5} color="var(--color-principal)" /> {traduccion("extra", "labelComentarios")} <strong>{juego.cantidadComentarios}</strong></div>
        </div>
        <div className="text-left">
          <div>{traduccion("formularios", "fechaCreacion")} <strong>{timestampAFecha(juego.fechaCreacion)}</strong></div>
          <div>{traduccion("formularios", "fechaActualizacion")} <strong>{timestampAFecha(juego.fechaUltima ?? juego.fechaCreacion)}</strong></div>
          {juego.versionActual && (<div>{traduccion("formularios", "versionActual")} <strong>{juego.versionActual}</strong></div>)}
          {juego.edad != 0 && <div>{traduccion("formularios", "edadMinima")} <strong>{juego.edad}</strong></div>}
        </div>
        <div className="ml-0 lg:ml-5 text-left">
          {(juego.generos && juego.generos?.length != 0) && (<p>{traduccion("formularios", "listaGeneros")} <strong>{juego?.generos?.map((e: string) => (<EnlaceFuncion titulo={e} funcion={"/browseSpecific/" + e} color={1} />))}</strong></p>)}
          {(juego.tags && juego.tags?.length != 0) && (<p>{traduccion("formularios", "listaTags")} <strong>{juego?.tags?.map((e: string) => (<EnlaceFuncion titulo={e} funcion={"/browseSpecific/" + e} color={1} />))}</strong></p>)}
          {(juego.avisos && juego.avisos?.length != 0) && (<p>{traduccion("formularios", "listaAvisos")} <strong>{juego?.avisos?.join(", ")}</strong></p>)}
          {(juego.idiomas && juego.idiomas?.length != 0) && (<p>{traduccion("formularios", "listaIdiomas")} <strong>{juego?.idiomas?.join(", ")}</strong></p>)}
        </div>
        {(typeof usuario === "object" && usuario?.id != juego.idCreador) ? (<div className="ml-0 sm:ml-5">
          <ElementoReporte idObjeto={juego.id} tipoObjeto="game" />
        </div>) : ''}
      </div>
      <div className="grid lg:grid-cols-4 mx-2 grid-cols-2 gap-2 w-full p-1">
        {filtrarAdiciones("images", true, filtrarAdiciones("trailer", true)).map((e, i) => {
          return (<div key={i} className="border flex border-principal">
            <div className="*:pl-3 my-auto *:m-0">
              {e?.subtitle && (<p className="font-bold mb-2">{e.subtitle}</p>)}
              {e?.url && (<EnlaceFuncion funcion={e.url} titulo={traduccion("botones", "textoEnlaceAdicion_" + e.type) ?? e.url} color={1} />)}
              {e.type === "requirements" && (<p>{e.data.specs}</p>)}
              {e.type === "text" && (<p>{e.data.text}</p>)}
              {e.type === "event" && (<p>{e.data.info}</p>)}
              {e.type === "mention" && (<p><EnlaceFuncion funcion={"/user/" + e.data.nickname} titulo={e.data.nickname} color={1} /></p>)}
            </div>
            <img src={e.data.icon ?? e.data.cover ?? e.data.image} className="ml-auto max-h-20 max-w-20" />
          </div>)
        })}
      </div>
      <div>
        {archivos.filter((e) => { return e.name != "web" }).length > 0 && (<>
          <Titulo magnitud={4}>{traduccion("titulos", "archivos")}</Titulo>
          {archivos.map((e, i) => {
            if (e.name != "web") return (<TargetaArchivo key={i} archivo={e} />)
          })}
        </>)}
      </div>
      {juego.publico && (<div>
        <Titulo magnitud={4}>{traduccion("titulos", "seccionComentarios")}</Titulo>
        {juego && (<CagradorComentarios idObjeto={juego.id} tipoObjeto="game" />)}
      </div>)}
    </div>
  )
}

export default TarjetaJuegoGrande; 
