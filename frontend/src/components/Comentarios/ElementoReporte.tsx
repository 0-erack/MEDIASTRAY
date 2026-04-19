import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import useApiComentarios from "../../hooks/api/useApiComentarios";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import Icono from "../Principal/Icono";

interface ElementoReporteProps {
  tipoObjeto: string;
  idObjeto: string;
}

interface FormValues {
  contenido: string;
}

/**
 * Componente con el formulario y el boton para reportar algo
 * @param tipoObjeto que tipo de objeto se va a reportar
 * @param idObjeto id del objeto a reportar
 */
const ElementoReporte = memo(function ElementoReporte({ tipoObjeto, idObjeto }: ElementoReporteProps) {

  const { usuario } = useSesion();
  const { enviarReporte } = useApiComentarios();
  const [intencionReportar, setIntencionReportar] = useState(false);
  const traduccion = useIdioma();
  const { register, watch, formState: { errors }, reset } = useForm<FormValues>({ defaultValues: { contenido: "" }, mode: 'onChange' });
  const datos = watch();
  const { lanzarMensaje } = useMensajes();

  /**
   * Boton de enviar el reporte
   */
  const enviar = useCallback(async () => {
    const resultado = (datos?.contenido && datos.contenido?.length < 256) ? await enviarReporte(idObjeto, tipoObjeto, datos.contenido) : false;
    if (resultado) {
      lanzarMensaje(traduccion("mensajes", "reporteEnviar"), 3);
      reset();
      setIntencionReportar(false);
    } else {
      lanzarMensaje(traduccion("errores", "noReporte"), 2);
    }
  }, [datos.contenido, idObjeto, tipoObjeto, traduccion]);

  return (
    <>
      {intencionReportar ? (<form className="block basis-full max-w-125">

        <InputBasico titulo={traduccion("formularios", "contenidoReporte")} nombre="contenido" ancho='full' tipo="textarea" validador={(v) => !v || v?.length < 256} objetoHook={register("contenido", { validate: (v) => !v || v?.length < 256 || traduccion("errores", "muyLargo") })} mensajeError={errors?.contenido?.message ?? ''} />
        {errors.contenido && <CajaError>{errors.contenido.message}</CajaError>}


        <BotonFuncion tipo={2} titulo={traduccion("botones", "reportar")} funcion={enviar}><Icono numero={11} color="var(--color-error)" /></BotonFuncion>
        <p>{traduccion("formularios", "infoReporte")}</p>
        {!usuario && (<p>{traduccion("formularios", "reporteAnonimo")}</p>)}
      </form>) : (<BotonFuncion titulo={traduccion("botones", "reportar")} funcion={() => setIntencionReportar(true)}><Icono numero={11} color="var(--color-error)" /></BotonFuncion>)}
    </>
  )
});

export default ElementoReporte; 
