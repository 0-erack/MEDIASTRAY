import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { tituloJuegoFalso } from "../../libraries/datosFalsos";
import { limpiarVaciosStrings } from "../../libraries/peticiones";
import { comalista, descripcionCortaJuego, descripcionJuego, precio, tituloJuego, url, version } from "../../libraries/validacionesBackend";
import { Juego } from "../../types/Juego";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import Icono from "../Principal/Icono";
import ImgCargando from "../Principal/ImgCargando";

interface FormValues {
  titulo?: string | null;
  urlPortada1?: string | null;
  urlPortada2?: string | null;
  urlPortada3?: string | null;
  versionActual?: string | null;
  descripcion?: string | null;
  descripcionCorta?: string | null;
  generos?: string | null;
  tags?: string | null;
  avisos?: string | null;
  idiomas?: string | null;
  edad?: number | null;
  precio?: string | null;
}

interface FormularioJuegoProps {
  juegoEditar?: Partial<Juego> | null;
}

/**
 * Formulario para editar o crear un juego
 * @param juegoEditar datos originales si se esta editando un juego
 */
function FormularioJuego({ juegoEditar = null }: FormularioJuegoProps) {

  const tagsMostrables = Array.isArray(juegoEditar?.tags) ? juegoEditar.tags.join(',') : (juegoEditar?.tags || "");
  const generosMostrables = Array.isArray(juegoEditar?.generos) ? juegoEditar.generos.join(',') : (juegoEditar?.generos || "");
  const avisosMostrables = Array.isArray(juegoEditar?.avisos) ? juegoEditar.avisos.join(',') : (juegoEditar?.avisos || "");
  const idiomasMostrables = Array.isArray(juegoEditar?.idiomas) ? juegoEditar.idiomas.join(',') : (juegoEditar?.idiomas || "");
  const formBase: FormValues = juegoEditar
    ? { ...juegoEditar, tags: tagsMostrables, generos: generosMostrables, avisos: avisosMostrables, idiomas: idiomasMostrables, titulo: juegoEditar.titulo ?? "", descripcion: juegoEditar.descripcion ?? "", descripcionCorta: juegoEditar.descripcionCorta ?? "", precio: juegoEditar.precio ?? "0", edad: juegoEditar.edad ?? 0, }
    : { titulo: "", edad: 0, versionActual: "v1.0.0", tags: "", generos: "", avisos: "", idiomas: "" };
  const traduccion = useIdioma();
  const { register, handleSubmit, control, watch, formState: { errors }, setValue, reset } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const tituloFalsoPlaceholder = useMemo(() => tituloJuegoFalso(), []);
  const [errorFormulario, setErrorFormulario] = useState("");
  const { lanzarMensaje } = useMensajes();
  const { premium } = useSesion();
  const { cargando, crearJuego, editarJuego } = useApiJuegos();
  const navegar = useNavigate();

  const normalizarComalista = (comalista: string): string => {
    const normalizado = comalista.trim().toLowerCase().replaceAll(" ", ",").replaceAll(".", ",").replaceAll(";", ",");
    return [...new Set(normalizado.split(","))].join(",");
  }

  const resetForm = () => {
    setErrorFormulario("");
    reset(formBase);
  }

  const validarTodo = (): boolean => {
    return tituloJuego(datos.titulo)
      && (datos.urlPortada1 != undefined && url(datos.urlPortada1))
      && (datos.urlPortada2 != undefined && url(datos.urlPortada2))
      && (datos.urlPortada3 != undefined && url(datos.urlPortada3))
      && (datos.versionActual != undefined && version(datos.versionActual))
      && (datos.descripcionCorta != undefined && descripcionCortaJuego(datos.descripcionCorta))
      && (datos.descripcion != undefined && descripcionJuego(datos.descripcion))
      && (datos.descripcion != undefined && precio(datos.precio))
      && (datos.tags != undefined && comalista(normalizarComalista(datos.tags)))
      && (datos.idiomas != undefined && comalista(normalizarComalista(datos.idiomas)))
      && (datos.avisos != undefined && comalista(normalizarComalista(datos.avisos)))
      && (datos.generos != undefined && comalista(normalizarComalista(datos.generos)))
      && (datos.edad != undefined && (datos.edad >= 0 && datos.edad < 50));
  }

  const enviar = async () => {
    if (validarTodo()) {
      setErrorFormulario("");
      const datosEnviar = {...limpiarVaciosStrings(datos), publico: false, precio: premium ? datos.precio : undefined, adiciones: undefined, tags: datos.tags ? normalizarComalista(datos.tags).split(",") : undefined, avisos: datos.avisos ? normalizarComalista(datos.avisos).split(",") : undefined, idiomas: datos.idiomas ? normalizarComalista(datos.idiomas).split(",") : undefined, generos: datos.generos ? normalizarComalista(datos.generos).split(",") : undefined}
      const resultado = juegoEditar ? await editarJuego(juegoEditar.id ?? '', datosEnviar) : await crearJuego(datosEnviar);
      if (!resultado) {
        lanzarMensaje(traduccion("errores", "errorFormularioJuego"), 2);
        setErrorFormulario(traduccion("errores", "errorFormularioJuego"));
      } else {
        lanzarMensaje(traduccion("mensajes", "exitoCrearJuego"), 1);
        navegar("/game/" + resultado.id);
        resetForm();
        if (juegoEditar) location.reload();
      }
    } else {
      lanzarMensaje(traduccion("errores", "errorFormularioJuego"), 2);
      setErrorFormulario(traduccion("errores", "genericoFormulario"));
    }
  }

  return (
    <div>
      <p>{juegoEditar ? traduccion("parrafos", "tipCreacionJuego1") : traduccion("parrafos", "tipCreacionJuego2")}</p>
      <form className="w-full lg:w-[60%] pr-10 lg:pr-0">
        <span>
          <InputBasico placeholder={tituloFalsoPlaceholder} titulo={(juegoEditar ? "" : "(*) ") + traduccion("formularios", "tituloJuego")} nombre="titulo" ancho='full' tipo="text" validador={tituloJuego} objetoHook={register("titulo", { required: traduccion("errores", "estaPropiedadObligatoria"), minLength: { value: 3, message: traduccion("errores", "validacionTituloJuego") } })} mensajeError={errors?.titulo?.message ?? ''} />
          {errors.titulo && <p className='text-error'>{errors.titulo.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/460x215" titulo={traduccion("formularios", "urlPortada1")} nombre="urlPortada1" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada1", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada1?.message ?? ''} />
          <img src={datos.urlPortada1 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada1 ? 'w-[460px] h-[215px]' : 'hidden'}`} />
          {errors.urlPortada1 && <p className='text-error'>{errors.urlPortada1.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/600x900" titulo={traduccion("formularios", "urlPortada2")} nombre="urlPortada2" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada2", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada2?.message ?? ''} />
          <img src={datos.urlPortada2 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada2 ? 'w-[300px] h-[450px]' : 'hidden'}`} />
          {errors.urlPortada2 && <p className='text-error'>{errors.urlPortada2.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/1920x1080" titulo={traduccion("formularios", "urlPortada3")} nombre="urlPortada3" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada3", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada3?.message ?? ''} />
          <img src={datos.urlPortada3 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada3 ? 'w-[480px] h-[270px]' : 'hidden'}`} />
          {errors.urlPortada3 && <p className='text-error'>{errors.urlPortada3.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="v1.0.0" titulo={traduccion("formularios", "versionActual")} nombre="versionActual" ancho='full' tipo="text" validador={(v) => !v || version(v)} objetoHook={register("versionActual", { validate: (v) => !v || version(v) || traduccion("errores", "validacionVersion") })} mensajeError={errors?.versionActual?.message ?? ''} />
          {errors.versionActual && <p className='text-error'>{errors.versionActual.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "descripcionCorta")} nombre="descripcionCorta" ancho='full' tipo="textarea" validador={(v) => !v || descripcionCortaJuego(v)} objetoHook={register("descripcionCorta", { validate: (v) => !v || descripcionCortaJuego(v) || traduccion("errores", "descripcionCorta") })} mensajeError={errors?.descripcionCorta?.message ?? ''} />
          {errors.descripcionCorta && <p className='text-error'>{errors.descripcionCorta.message}</p>}
        </span>
        <span>
          <InputBasico markdown={premium} valor={datos.descripcion} titulo={traduccion("formularios", "descripcion")} nombre="descripcion" ancho='full' tipo="textarea" validador={(v) => !v || descripcionJuego(v)} objetoHook={register("descripcion", { validate: (v) => !v || descripcionJuego(v) || traduccion("errores", "descripcion") })} mensajeError={errors?.descripcion?.message ?? ''} />
          {errors.descripcion && <p className='text-error'>{errors.descripcion.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "edad")} nombre="edad" ancho='10px' tipo="number" validador={(v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) < 50)} objetoHook={register("edad", { min: { value: 0, message: traduccion("errores", "validacionEdad") }, max: { value: 49, message: traduccion("errores", "validacionEdad") }, validate: (v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) < 50) || traduccion("errores", "validacionEdad") })} mensajeError={errors?.edad?.message ?? ''} />
          {errors.edad && <p className='text-error'>{errors.edad.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="short,retro,terror,free2play,multiplayer,indie,story,etc" titulo={traduccion("formularios", "tags")} nombre="tags" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("tags", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionTags") })} mensajeError={errors?.tags?.message ?? ''} />
          {errors.tags && <p className='text-error'>{errors.tags.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="rpg,platformer,shooter,visualnovel,strategy,puzzles,etc" titulo={traduccion("formularios", "generos")} nombre="generos" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("generos", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionGeneros") })} mensajeError={errors?.generos?.message ?? ''} />
          {errors.generos && <p className='text-error'>{errors.generos.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="jumpscares,violence,epilepsy,gore,nudity,drugs,etc" titulo={traduccion("formularios", "avisos")} nombre="avisos" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("avisos", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionAvisos") })} mensajeError={errors?.avisos?.message ?? ''} />
          {errors.avisos && <p className='text-error'>{errors.avisos.message}</p>}
        </span>
        <span>
          <InputBasico placeholder="ES-es,ZH-cn,EN-us,HI-in,ES-es,FR-fr,BN-bd,PT-br,RU-ru,PL-pl,IT-it,AR-eg,DE-de,TR-tr,etc" titulo={traduccion("formularios", "idiomas")} nombre="idiomas" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("idiomas", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionIdiomas") })} mensajeError={errors?.idiomas?.message ?? ''} />
          {errors.idiomas && <p className='text-error'>{errors.idiomas.message}</p>}
        </span>
        {premium && (<span>
          <InputBasico placeholder="3.99€" titulo={traduccion("formularios", "precio")} nombre="precio" ancho='10px' tipo="text" validador={(v) => !v || precio(v)} objetoHook={register("precio", { validate: (v) => !v || precio(v) || traduccion("errores", "validacionPrecio") })} mensajeError={errors?.precio?.message ?? ''} />
          {errors.precio && <p className='text-error'>{errors.precio.message}</p>}
        </span>)}
        <CajaError texto={errorFormulario ?? ''} nivel="input" />
        <BotonFuncion titulo={traduccion("botones", juegoEditar ? "editarJuego" : "publicarJuego")} funcion={enviar} tipo={1} hueco={false} ><Icono numero={juegoEditar ? 9 : 16} color='var(--color-fondo1)' /></BotonFuncion>
        <BotonFuncion titulo={traduccion("botones", "reset")} funcion={resetForm} tipo={2} ><Icono numero={10} color='var(--color-error)' /></BotonFuncion><br />
        {cargando && (<ImgCargando />)}
      </form>
    </div>
  );
}

export default FormularioJuego;
