import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { nickname, subtituloAdicionJuego, url } from "../../libraries/validacionesBackend";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";
import Icono from "../Principal/Icono";
import ImgCargando from "../Principal/ImgCargando";
import ImagesInputExtra from "./ImageInputExtra";

interface Adicion {
  type: string;
  subtitle?: string;
  url?: string;
  data?: {
    iframe?: string;
    icon?: string;
    cover?: string;
    images?: string[];
    specs?: string;
    info?: string;
    image?: string;
    text?: string;
    nickname?: string;
  };
}

interface FormValues {
  adiciones: Adicion[];
}

interface FormularioAdicionesProps {
  id: string;
  adicionesPrevias: Array<Record<string, any>> | null;
}

/**
 * Formulario para editar las adiciones de un juego
 * @param id juego a editar
 * @param adicionesPrevias adiciones que salen por defecto (originales del juego)
 */
function FormularioAdiciones({ id, adicionesPrevias }: FormularioAdicionesProps) {

  const { premium } = useSesion();
  const traduccion = useIdioma();
  const formBase = { adiciones: adicionesPrevias ?? [] }
  const { register, control, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const { fields, append, remove } = useFieldArray({ control, name: "adiciones" });
  const datos = watch("adiciones");
  const [errorFormulario, setErrorFormulario] = useState("");
  const { cargando, establecerAdiciones } = useApiJuegos();
  const tiposAdicion = useMemo(() => ["trailer", "images", "site", "ost", "requirements", "event", "text", "mention"], []);
  const opcionesSelect = useMemo(() => tiposAdicion.map((e) => { return { valor: e, etiqueta: traduccion("formularios", "tipoAdicion_" + e) } }), [traduccion, tiposAdicion]);
  const { lanzarMensaje } = useMensajes();

  /**
   * Resete el formulario entero de adiciones
   */
  const resetForm = useCallback(() => {
    setErrorFormulario("");
    reset(formBase);
  }, [formBase]);

  /**
   * Funcion para validar una adicion, es una copia ligeramente cambiada de la que se usa en el backend
   * @param data adicion a validar
   * @returns true si esta todo bien
   */
  const validarAdicionJuego = (data: any): boolean => {
    if (typeof data !== "object" || typeof data.data !== "object" || typeof data.type !== "string" || data._id || data.id || data.game) return false;
    if ((data.url != undefined && !url(data.url)) || (data.subtitle != undefined && !subtituloAdicionJuego(data.subtitle))) return false;
    switch (data.type) {
      case "trailer":
        if (data.data.iframe != undefined && (typeof data.data.iframe !== "string" || data.data.iframe.length > 430)) return false;
        break;
      case "site":
        if (data.data.icon != undefined && !url(data.data.icon)) return false;
        break;
      case "ost":
        if (data.data.cover != undefined && !url(data.data.cover)) return false;
        break;
      case "images":
        if (!Array.isArray(data.data.images) || data.data.images.length > 32 || !data.data.images.length || !data.data.images.every(url)) return false;
        break;
      case "requirements":
        if (typeof data.data.specs !== "string" || !data.data.specs.length || data.data.specs.length > 1024) return false;
        break;
      case "event":
        if (data.data.image != undefined && !url(data.data.image)) return false;
        if (typeof data.data.info !== "string" || !data.data.info.length || data.data.info.length > 128) return false;
        break;
      case "text":
        if (typeof data.data.text !== "string" || !data.data.text.length || data.data.text.length > 64) return false;
        break;
      case "mention":
        if (!nickname(data.data.nickname)) return false;
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   * Valida todas las adiciones actuales
   * @returns true si son correctas
   */
  const validarTodo = (): boolean => {
    if (datos.length === 0) return true;
    return datos.every(validarAdicionJuego);
  }

  /**
   * Enviar a editar las adiciones del juego
   */
  const enviar = async () => {
    if (validarTodo()) {
      setErrorFormulario("");
      const resultado = await establecerAdiciones(id, datos);
      if (resultado) {
        lanzarMensaje(traduccion("mensajes", "exitoCrearJuego"), 1);
        location.reload();
      } else {
        lanzarMensaje(traduccion("errores", "errorCambiarAdiciones"), 2);
        setErrorFormulario(traduccion("errores", "errorCambiarAdiciones"));
      }
    } else {
      lanzarMensaje(traduccion("errores", "errorCambiarAdiciones"), 2);
      setErrorFormulario(traduccion("errores", "errorCambiarAdiciones"));
    }
  }

  const tiposPrevios = useRef<string>('');
  useEffect(() => {
    const tiposActuales = datos.map(d => d.type).join(',');
    if (tiposPrevios.current === '') {
      tiposPrevios.current = tiposActuales;
      return;
    }
    const tiposArray = tiposActuales.split(',');
    const tiposPreviosArray = tiposPrevios.current.split(',');
    tiposArray.forEach((tipo, i) => {
      if (tipo !== tiposPreviosArray[i]) {
        setValue(`adiciones.${i}.data`, {});
      }
    });
    tiposPrevios.current = tiposActuales;
  }, [datos.map(d => d.type).join(',')]);

  return (
    <div className="border-2 border-principal p-2 m-1">
      {cargando && (<ImgCargando />)}
      <Titulo magnitud={3}>{traduccion("formularios", "pantallaEditarAdiciones")}</Titulo>
      <p>{traduccion("parrafos", "explicarAdiciones1")}</p>
      <p>{traduccion("parrafos", "explicarAdiciones2")}</p>
      <form>
        {fields.map((field, i) => {
          return (<div key={i} className="border border-principal my-8 p-3 *:my-50">

            <InputBasico titulo={traduccion("formularios", "adicionTipo")} nombre={`adiciones.${i}.type`} ancho='50%' tipo="select" opcionesSelect={opcionesSelect} validador={(v) => !v || tiposAdicion.includes(v)} objetoHook={register(`adiciones.${i}.type`, { validate: (v) => !v || tiposAdicion.includes(v) || traduccion("errores", "error") })} mensajeError={errors?.adiciones?.[i]?.type?.message ?? ''} />
            <InputBasico titulo={traduccion("formularios", "adicionSubtitulo")} nombre={`adiciones.${i}.subtitle`} ancho='full' tipo="text" validador={(v) => !v || subtituloAdicionJuego(v)} objetoHook={register(`adiciones.${i}.subtitle`, { validate: (v) => !v || subtituloAdicionJuego(v) || traduccion("errores", "validacionSubtituloAdicion") })} mensajeError={errors?.adiciones?.[i]?.subtitle?.message ?? ''} />
            {errors?.adiciones?.[i]?.subtitle && <CajaError>{errors?.adiciones?.[i]?.subtitle?.message}</CajaError>}
            <InputBasico titulo={traduccion("formularios", "adicionUrl")} nombre={`adiciones.${i}.url`} ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register(`adiciones.${i}.url`, { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.adiciones?.[i]?.url?.message ?? ''} />
            {errors?.adiciones?.[i]?.url && <CajaError>{errors?.adiciones?.[i]?.url?.message}</CajaError>}

            {datos[i]?.type === "trailer" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionIframe")} nombre={`adiciones.${i}.data.iframe`} ancho='full' tipo="text" validador={(v) => !v || v?.length < 430} objetoHook={register(`adiciones.${i}.data.iframe`, { validate: (v) => !v || v?.length < 430 || traduccion("errores", "muyLargo") })} mensajeError={errors?.adiciones?.[i]?.data?.iframe?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.iframe && <CajaError>{errors?.adiciones?.[i]?.data?.iframe?.message}</CajaError>}
            </>)}
            {datos[i]?.type === "images" && (<>
              <p>{traduccion("formularios", "adicionCarrusel")}</p>
              <ImagesInputExtra index={i} setValue={setValue} urlsPrevias={datos[i]?.data?.images ?? []} />
            </>)}
            {datos[i]?.type === "site" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionIcon")} nombre={`adiciones.${i}.data.icon`} ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register(`adiciones.${i}.data.icon`, { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.adiciones?.[i]?.data?.icon?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.icon && <CajaError>{errors?.adiciones?.[i]?.data?.icon?.message}</CajaError>}
              {datos[i]?.data?.icon && (<img src={datos[i]?.data?.icon ?? ''} className="ml-5 max-h-20 max-w-20" />)}
            </>)}
            {datos[i]?.type === "ost" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionCover")} nombre={`adiciones.${i}.data.cover`} ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register(`adiciones.${i}.data.cover`, { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.adiciones?.[i]?.data?.cover?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.cover && <CajaError>{errors?.adiciones?.[i]?.data?.cover?.message}</CajaError>}
              {datos[i]?.data?.cover && (<img src={datos[i]?.data?.cover ?? ''} className="ml-5 max-h-20 max-w-20" />)}
            </>)}
            {datos[i]?.type === "requirements" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionSpecs")} nombre={`adiciones.${i}.data.specs`} ancho='full' tipo="textarea" validador={(v) => !v || v?.length < 1024} objetoHook={register(`adiciones.${i}.data.specs`, { validate: (v) => !v || v?.length < 430 || traduccion("errores", "muyLargo") })} mensajeError={errors?.adiciones?.[i]?.data?.specs?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.specs && <CajaError>{errors?.adiciones?.[i]?.data?.specs?.message}</CajaError>}
            </>)}
            {datos[i]?.type === "event" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionInfoEvento")} nombre={`adiciones.${i}.data.info`} ancho='full' tipo="textarea" validador={(v) => !v || v?.length < 128} objetoHook={register(`adiciones.${i}.data.info`, { validate: (v) => !v || v?.length < 128 || traduccion("errores", "muyLargo") })} mensajeError={errors?.adiciones?.[i]?.data?.info?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.info && <CajaError>{errors?.adiciones?.[i]?.data?.info?.message}</CajaError>}
              <InputBasico titulo={traduccion("formularios", "adicionImagenEvento")} nombre={`adiciones.${i}.data.image`} ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register(`adiciones.${i}.data.image`, { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.adiciones?.[i]?.data?.image?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.image && <CajaError>{errors?.adiciones?.[i]?.data?.image?.message}</CajaError>}
              {datos[i]?.data?.image && (<img src={datos[i]?.data?.image ?? ''} className="ml-5 max-h-20 max-w-20" />)}
            </>)}
            {datos[i]?.type === "text" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionText")} nombre={`adiciones.${i}.data.text`} ancho='full' tipo="textarea" validador={(v) => !v || v?.length < 64} objetoHook={register(`adiciones.${i}.data.text`, { validate: (v) => !v || v?.length < 64 || traduccion("errores", "muyLargo") })} mensajeError={errors?.adiciones?.[i]?.data?.text?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.text && <CajaError>{errors?.adiciones?.[i]?.data?.text?.message}</CajaError>}
            </>)}
            {datos[i]?.type === "mention" && (<>
              <InputBasico titulo={traduccion("formularios", "adicionMention")} nombre={`adiciones.${i}.data.nickname`} ancho='50%' tipo="text" validador={(v) => !v || nickname(v)} objetoHook={register(`adiciones.${i}.data.nickname`, { validate: (v) => !v || nickname(v) || traduccion("errores", "validacionNickname") })} mensajeError={errors?.adiciones?.[i]?.data?.nickname?.message ?? ''} />
              {errors?.adiciones?.[i]?.data?.nickname && <CajaError>{errors?.adiciones?.[i]?.data?.nickname?.message}</CajaError>}
            </>)}

            <br /><BotonFuncion titulo={traduccion("botones", "eliminar")} funcion={() => remove(i)} tipo={2} ><Icono numero={10} color='var(--color-principal)' /></BotonFuncion>
          </div>)
        })}
        <BotonFuncion titulo={traduccion("botones", "guardar")} funcion={enviar} tipo={1} hueco={false} ><Icono numero={12} color='var(--color-fondo1)' /></BotonFuncion>
        <BotonFuncion titulo={traduccion("botones", "reset")} funcion={resetForm} tipo={2} ><Icono numero={10} color='var(--color-principal)' /></BotonFuncion>
        {fields.length < (premium ? 10 : 31) && (<BotonFuncion titulo={traduccion("botones", "agnadir")} funcion={() => append({ type: "text", subtitle: "" })} tipo={0} ><Icono numero={16} color='var(--color-principal)' /></BotonFuncion>)}
        <CajaError texto={errorFormulario ?? ''} nivel="input" ></CajaError>
        {cargando && (<ImgCargando />)}
      </form>
    </div>
  );
}

export default FormularioAdiciones;
