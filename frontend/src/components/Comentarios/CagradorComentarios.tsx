import { useEffect, useState } from "react";
import useApiComentarios from "../../hooks/api/useApiComentarios";
import useIdioma from "../../hooks/useIdioma";
import useSesion from "../../hooks/useSesion";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import ImgCargando from "../Principal/ImgCargando";
import Comentario from "./Comentario";

interface CagradorComentariosProps {
  idObjeto: string;
  tipoObjeto: string;
}

/**
 * Componente para cargar y mostrar los comentarios de algo, no es un contexto porque no es informacion compartida, sino exclusiva de x entidad
 * @param idObjeto objeto al que revisar los comentarios
 * @param tipoObjeto nombre del objeto en la api
 */
function CagradorComentarios({ idObjeto, tipoObjeto }: CagradorComentariosProps) {

  const { verComentarios, error, cargando, borrarComentario } = useApiComentarios();
  const { usuario } = useSesion();
  const traduccion = useIdioma();
  const [paginasCargadas, setPaginasCargadas] = useState(0);
  const [comentarios, setComentarios] = useState<Array<Record<string, any>>>([]);

  /**
   * Boton de cargar mas comentarios
   */
  const cargarMas = async () => {
    const pagina = paginasCargadas + 1;
    setPaginasCargadas(pagina);
    const nuevos = await verComentarios(idObjeto, tipoObjeto, 1, pagina, 0);
    if (nuevos?.length) setComentarios([...comentarios, ...nuevos]);
  }

  const cargaInicial = async () => {
    const primerosComentarios = await verComentarios(idObjeto, tipoObjeto, 1, 0, 0);
    setComentarios(primerosComentarios ?? []);
  }
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div>
      {(!error && !cargando && usuario && tipoObjeto !== "comment") && (<>
        FORM POSTEAR
      </>)}
      {(!error && !cargando && usuario && tipoObjeto === "comment") && (<>
        FORM RESPONDER
      </>)}
      {error ? (<CajaError>{traduccion("errores", "noComentarios")}</CajaError>) : (
        cargando ? (<ImgCargando />) : (
          comentarios.length ? (
            <>
              {comentarios.map((e, i) => {
                if (e) return (<Comentario comentario={e} key={i} />)
              })}

                <BotonFuncion titulo={traduccion("botones", "mostrarMas")} funcion={cargarMas} />
            </>
          ) : (<p>{tipoObjeto === "comment" ? '' : traduccion("errores", "noComentarios")}</p>)
        )
      )}
    </div>
  )
}

export default CagradorComentarios; 
