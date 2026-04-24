import { memo, useCallback, useEffect, useMemo, useState } from "react";
import useApiComentarios from "../../hooks/api/useApiComentarios";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { timestampAFecha } from "../../libraries/extraFechas";
import { Usuario } from "../../types/Usuario";
import BotonFuncion from "../Elements/BotonFuncion";
import MarkdownDisplay from "../Elements/MarkdownDisplay";
import Icono from "../Principal/Icono";
import TarjetaUsuario from "../Usuario/TarjetaUsuario";
import CagradorComentarios from "./CagradorComentarios";
import ElementoReporte from "./ElementoReporte";

interface ComentarioProps {
  comentario: Record<string, any>;
}

/**
 * Componente para ver un comentario, muestra sus respuestas
 * @param comentario el comentairo
 */
const Comentario = memo(function Comentario({ comentario }: ComentarioProps) {

  const { usuario, esAdmin } = useSesion();
  const [duegno, setDuegno] = useState<Partial<Usuario> | null>(null);
  const { verUsuario } = useApiUsuarios();
  const traduccion = useIdioma();
  const [mostrandoRespuestas, setMostrandoRespuestas] = useState(false);
  const [gustado, setGustado] = useState(usuario ? comentario?.liked : false);
  const [intencionBorrar, setIntencionBorrar] = useState(false);
  const { borrarComentario, likeComentario } = useApiComentarios();
  const { lanzarMensaje } = useMensajes();
  const fechaComentario = useMemo(() => timestampAFecha(comentario?.date), [comentario?.date]);

  /**
   * Alterna el estado de like en el comentario
   */
  const alternarMeGusta = useCallback(async () => {
    const resultado = await likeComentario(comentario.id, gustado ? -1 : 1);
    if (resultado) {
      comentario.likesAmount += gustado ? -1 : 1;
      setGustado(!gustado);
      lanzarMensaje(traduccion("mensajes", "comentarioLike"), 1);
    } else {
      lanzarMensaje(traduccion("errores", "error"), 2);
    }
  }, [gustado, comentario.id, traduccion]);

  /**
   * Borra el comentario y actualiza la lista
   */
  const borrar = useCallback(async () => {
    if (intencionBorrar) {
      const resultado = await borrarComentario(comentario.id);
      if (resultado) {
        location.reload(); //TODO: 
        lanzarMensaje(traduccion("mensajes", "comentarioBorrar"), 3);
      } else {
        lanzarMensaje(traduccion("errores", "error"), 2);
      }
    } else {
      setIntencionBorrar(true);
    }
  }, [intencionBorrar, comentario.id, traduccion]);

  /**
   * Funcion para ver los datos del creador del comentario
   */
  const buscarDuegno = useCallback(async () => {
    setDuegno(await verUsuario(comentario.owner) ?? null);
  }, [comentario.owner]);
  useEffect(() => {
    buscarDuegno();
  }, [buscarDuegno]);

  return (
    <div className="border-2 border-principal p-3 m-3 my-6">
      <div className="lg:flex gap-2 tiems-start *:my-2 flex-wrap">
        {duegno && (<TarjetaUsuario usuario={duegno} destacado={comentario.featured} />)}
        {usuario && (<>
          {(typeof usuario === "object" && comentario.owner !== usuario.id && !comentario.fromMe) ? (<>
            <BotonFuncion funcion={alternarMeGusta} titulo={traduccion("botones", gustado ? "noMeGusta" : "meGusta")}><Icono numero={gustado ? 18 : 19} /></BotonFuncion>
            <ElementoReporte idObjeto={comentario.id} tipoObjeto="comment" />
          </>) : (<>
            <BotonFuncion tipo={2} funcion={borrar} titulo={intencionBorrar ? traduccion("botones", "borrar").toUpperCase() : traduccion("botones", "borrar")}><Icono numero={10} color="var(--color-error)" /></BotonFuncion>
          </>)}
        </>)}
        <span>
          {fechaComentario ?? ''} <Icono numero={5} color='var(--color-principal)' /> {comentario.responsesAmount ?? 0} <Icono numero={18} color='var(--color-principal)' /> {comentario?.likesAmount ?? 0}
            {(esAdmin > 0 && usuario) && (<p>{comentario.id}</p>)}
        </span>
      </div>
      {comentario?.featured ? (<MarkdownDisplay text={comentario?.content ?? ''} />) : (<p>{comentario?.content ?? ''}</p>)}

      <div className={mostrandoRespuestas ? "pl-3 mt-6" : ''}>
        {(mostrandoRespuestas) ? (<CagradorComentarios tipoObjeto="comment" idObjeto={comentario.id} />) : ''}
        {(!mostrandoRespuestas) ? (<BotonFuncion funcion={() => setMostrandoRespuestas(true)} titulo={traduccion("botones", "mostrarRespuestas")} />) : ''}
      </div>

    </div>
  )
});

export default Comentario; 
