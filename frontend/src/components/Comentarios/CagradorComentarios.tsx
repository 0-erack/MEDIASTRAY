import { memo, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiComentarios from "../../hooks/api/useApiComentarios";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { contenidoComentario } from "../../libraries/validacionesBackend";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import MarkdownDisplay from "../Elements/MarkdownDisplay";
import Icono from "../Principal/Icono";
import ImgCargando from "../Principal/ImgCargando";
import Comentario from "./Comentario";

interface CagradorComentariosProps {
  idObjeto: string;
  tipoObjeto: string;
}

interface FormValues {
  contenido: string;
}

/**
 * Componente para cargar y mostrar los comentarios de algo, no es un contexto porque no es informacion compartida, sino exclusiva de x entidad
 * @param idObjeto objeto al que revisar los comentarios
 * @param tipoObjeto nombre del objeto en la api
 */
const CagradorComentarios = memo(function CagradorComentarios({ idObjeto, tipoObjeto }: CagradorComentariosProps) {

  const { verComentarios, error, cargando, hacerComentario } = useApiComentarios();
  const { usuario, premium } = useSesion();
  const traduccion = useIdioma();
  const [paginasCargadas, setPaginasCargadas] = useState(0);
  const [comentarios, setComentarios] = useState<Array<Record<string, any>>>([]);
  const { register, watch, formState: { errors }, reset } = useForm<FormValues>({ defaultValues: { contenido: "" }, mode: 'onChange' });
  const datos = watch();
  const { lanzarMensaje } = useMensajes();
  const formularioPublicar = () => (<form className="border border-principal p-2">
    <InputBasico titulo={traduccion("formularios", tipoObjeto === "comment" ? "contenidoRespuesta" : "contenidoComentario")} nombre="contenido" ancho='full' tipo="textarea" validador={(v) => !v || contenidoComentario(v)} objetoHook={register("contenido", { validate: (v) => !v || contenidoComentario(v) || traduccion("errores", "muyLargo") })} mensajeError={errors?.contenido?.message ?? ''} />
    {errors.contenido && <CajaError>{errors.contenido.message}</CajaError>}
    {(premium && datos.contenido) && (<MarkdownDisplay text={datos.contenido} />)}
    {datos.contenido && (<BotonFuncion titulo={traduccion("botones", "publicar")} funcion={crearComentario}><Icono numero={5} /></BotonFuncion>)}
  </form>);

  /**
   * Boton de publicar comentario
   */
  const crearComentario = useCallback(async () => {
    if (contenidoComentario(datos.contenido)) {
      const resultado = await hacerComentario(tipoObjeto + "_" + idObjeto, datos.contenido);
      if (resultado) {
        //setComentarios([resultado, ...comentarios]);
        setComentarios(prev => [resultado, ...comentarios]);
        reset();
        lanzarMensaje(traduccion("mensaje", "comentarioPost"), 1);
      } else {
        lanzarMensaje(traduccion("errores", "error"), 2);
      }
    } else {
      lanzarMensaje(traduccion("errores", "error"), 2);
    }
  }, [datos.contenido, idObjeto, tipoObjeto, traduccion]);

  /**
   * Boton de cargar mas comentarios
   */
  const cargarMas = useCallback(async () => {
    const pagina = paginasCargadas + 1;
    setPaginasCargadas(pagina);
    const nuevos = await verComentarios(idObjeto, tipoObjeto, 1, pagina, 0);
    if (nuevos?.length) setComentarios([...comentarios, ...nuevos]);
  }, [paginasCargadas, idObjeto, tipoObjeto]);

  const cargaInicial = useCallback(async () => {
    const primerosComentarios = await verComentarios(idObjeto, tipoObjeto, 1, 0, 0);
    setComentarios(primerosComentarios ?? []);
  }, [idObjeto, tipoObjeto]);
  useEffect(() => {
    cargaInicial();
  }, [cargaInicial]);

  return (
    <div>
      {(!error && !cargando && usuario && tipoObjeto !== "comment") && (<>
        {formularioPublicar()}
      </>)}
      {(!error && !cargando && usuario && tipoObjeto === "comment") && (<>
        {formularioPublicar()}
      </>)}
      {error ? (<CajaError>{traduccion("errores", "noComentarios")}</CajaError>) : (
        cargando ? (<ImgCargando />) : (
          comentarios.length ? (
            <>
              {comentarios.map((e, i) => {
                if (e) return (<Comentario comentario={e} key={i} />)
              })}

              {contenidoComentario(datos.contenido) && (<BotonFuncion titulo={traduccion("botones", "mostrarMas")} funcion={cargarMas} />)}
            </>
          ) : (<p>{tipoObjeto === "comment" ? '' : traduccion("errores", "noComentarios")}</p>)
        )
      )}
    </div>
  )
});

export default CagradorComentarios; 
