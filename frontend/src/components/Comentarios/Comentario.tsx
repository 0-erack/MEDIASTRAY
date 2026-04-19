import { useEffect, useState } from "react";
import useApiComentarios from "../../hooks/api/useApiComentarios";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useIdioma from "../../hooks/useIdioma";
import useSesion from "../../hooks/useSesion";
import { timestampAFecha } from "../../libraries/extraFechas";
import { Usuario } from "../../types/Usuario";
import BotonFuncion from "../Elements/BotonFuncion";
import MarkdownDisplay from "../Elements/MarkdownDisplay";
import Icono from "../Principal/Icono";
import TarjetaUsuario from "../Usuario/TarjetaUsuario";
import CagradorComentarios from "./CagradorComentarios";

interface ComentarioProps {
  comentario: Record<string, any>;
}

/**
 * Componente para ver un comentario, muestra sus respuestas
 * @param comentario el comentairo
 */
function Comentario({ comentario }: ComentarioProps) {

  const { usuario } = useSesion();
  const [duegno, setDuegno] = useState<Partial<Usuario> | null>(null);
  const { verUsuario } = useApiUsuarios();
  const traduccion = useIdioma();
  const [mostrandoRespuestas, setMostrandoRespuestas] = useState(false);
  const [gustado, setGustado] = useState(usuario ? comentario?.liked : false);
  const [intencionBorrar, setIntencionBorrar] = useState(false);
  const { borrarComentario, likeComentario } = useApiComentarios();

  const alternarMeGusta = async () => {
    const resultado = await likeComentario(comentario.id, gustado ? -1 : 1);
    if (resultado) {
      comentario.likesAmount += gustado ? -1 : 1;
      setGustado(!gustado);
    }
  }

  const borrar = async () => {
    if (intencionBorrar) {
      await borrarComentario(comentario.id);
      location.reload();
    } else {
      setIntencionBorrar(true);
    }
  }

  const buscarDuegno = async () => {
    setDuegno(await verUsuario(comentario.owner) ?? null);
  }
  useEffect(() => {
    buscarDuegno();
  }, []);

  return (
    <div className="border border-principal p-3 m-3">
      <div className="lg:flex gap-2 align-top">
        {duegno && (<TarjetaUsuario usuario={duegno} destacado={comentario.featured} />)}
        {usuario && (<>
          {(typeof usuario === "object" && comentario.owner !== usuario.id && !comentario.fromMe) ? (<>
            <BotonFuncion funcion={alternarMeGusta} titulo={traduccion("botones", gustado ? "noMeGusta" : "meGusta")}><Icono numero={gustado ? 18 : 19} /></BotonFuncion>
            REPORTAR
          </>) : (<>
            <BotonFuncion tipo={2} funcion={borrar} titulo={intencionBorrar ? traduccion("botones", "borrar").toUpperCase() : traduccion("botones", "borrar")}><Icono numero={10} color="var(--color-error)" /></BotonFuncion>
          </>)}
        </>)}
        <div>
        </div>
        <p>{timestampAFecha(comentario?.date)} <Icono numero={5} color='var(--color-principal)' /> {comentario.responsesAmount ?? 0} <Icono numero={18} color='var(--color-principal)' /> {comentario?.likesAmount ?? 0}</p>
      </div>
        {comentario?.featured ? (<MarkdownDisplay text={comentario?.content ?? ''} />) : (<p>{comentario?.content ?? ''}</p>)}

      <div className={mostrandoRespuestas ? "border-l-3 border-principal" : ''}>
        {(comentario?.responses?.length && mostrandoRespuestas) ? (<CagradorComentarios tipoObjeto="comment" idObjeto={comentario.id} />) : ''}
        {(comentario?.responses?.length && !mostrandoRespuestas) ? (<BotonFuncion funcion={() => setMostrandoRespuestas(true)} titulo={traduccion("botones", "mostrarRespuestas")} />) : ''}
      </div>

    </div>
  )
}

export default Comentario; 
