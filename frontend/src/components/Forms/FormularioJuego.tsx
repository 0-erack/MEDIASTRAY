import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import useJuegos from "../../hooks/useJuegos";
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
import FormularioAdiciones from "./FormularioAdiciones";

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

  const tagsMostrables = useMemo(() => Array.isArray(juegoEditar?.tags) ? juegoEditar.tags.join(',') : (juegoEditar?.tags || ""), [juegoEditar?.tags]);
  const generosMostrables = useMemo(() => Array.isArray(juegoEditar?.generos) ? juegoEditar.generos.join(',') : (juegoEditar?.generos || ""), [juegoEditar?.generos]);
  const avisosMostrables = useMemo(() => Array.isArray(juegoEditar?.avisos) ? juegoEditar.avisos.join(',') : (juegoEditar?.avisos || ""), [juegoEditar?.avisos]);
  const idiomasMostrables = useMemo(() => Array.isArray(juegoEditar?.idiomas) ? juegoEditar.idiomas.join(',') : (juegoEditar?.idiomas || ""), [juegoEditar?.idiomas]);
  const formBase: FormValues = useMemo(()=> juegoEditar
    ? { ...juegoEditar, urlPortada1: (!juegoEditar?.urlPortada1 || juegoEditar.urlPortada1 === "/public/coverless1.png") ? '' : juegoEditar.urlPortada1, urlPortada2: (!juegoEditar?.urlPortada2 || juegoEditar.urlPortada2 === "/public/coverless2.png") ? '' : juegoEditar.urlPortada2, urlPortada3: (!juegoEditar?.urlPortada3 || juegoEditar.urlPortada3 === "/public/coverless3.png") ? '' : juegoEditar.urlPortada3, tags: tagsMostrables, generos: generosMostrables, avisos: avisosMostrables, idiomas: idiomasMostrables, titulo: juegoEditar.titulo ?? "", descripcion: juegoEditar.descripcion ?? "", descripcionCorta: juegoEditar.descripcionCorta ?? "", precio: juegoEditar.precio ?? "0", edad: juegoEditar.edad ?? 0, }
    : { titulo: "", edad: 0, versionActual: "v1.0.0", tags: "", generos: "", avisos: "", idiomas: "" },
      [juegoEditar, tagsMostrables, generosMostrables, avisosMostrables, idiomasMostrables]);
  const traduccion = useIdioma();
  const { register, watch, formState: { errors }, reset } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const tituloFalsoPlaceholder = useMemo(() => tituloJuegoFalso(), []);
  const [errorFormulario, setErrorFormulario] = useState("");
  const { lanzarMensaje } = useMensajes();
  const { premium } = useSesion();
  const { cargando, crearJuego, editarJuego, borrarJuego, editarPublicoJuego, error } = useApiJuegos();
  const navegar = useNavigate();
  const { borrarJuegoLocal, agregarJuegoLocal, editarJuegoLocal } = useJuegos();
  const [intencionBorrar, setIntencionBorrar] = useState(false);
  const [contrasegnaBorrar, setContrasegnaBorrar] = useState("");
  const [errorBorrarJuego, setErrorBorrarJuego] = useState("");
  const [editandoAdiciones, setEditandoAdiciones] = useState(false);
  const { PUBLIC_URL } = useAjustes();

  /**
   * Formatea una comalista a un formato normal
   * @param comalista texto base en crudo
   * @returns comalista formateada
   */
  const normalizarComalista = useCallback((comalista: string): string => {
    const normalizado = comalista.trim().toLowerCase().replaceAll(" ", ",").replaceAll(".", ",").replaceAll(";", ",");
    return [...new Set(normalizado.split(","))].join(",");
  }, []);

  /**
   * Reinicia el formulario a los datos iniciales
   */
  const resetForm = useCallback(() => {
    setErrorFormulario("");
    reset(formBase);
  }, [formBase]);

  /**
   * Validar los datos actuales del juego
   * @returns true si son validos
   */
  const validarTodo = (): boolean => {
    return tituloJuego(datos.titulo)
      && (datos.urlPortada1 != undefined && url(datos.urlPortada1))
      && (datos.urlPortada2 != undefined && url(datos.urlPortada2))
      && (datos.urlPortada3 != undefined && url(datos.urlPortada3))
      && (datos.versionActual != undefined && version(datos.versionActual))
      && (datos.descripcionCorta != undefined && descripcionCortaJuego(datos.descripcionCorta))
      && (datos.descripcion != undefined && descripcionJuego(datos.descripcion))
      && (datos.precio == undefined || precio(datos.precio))
      && (datos.tags != undefined && comalista(normalizarComalista(datos.tags)))
      && (datos.idiomas != undefined && comalista(normalizarComalista(datos.idiomas)))
      && (datos.avisos != undefined && comalista(normalizarComalista(datos.avisos)))
      && (datos.generos != undefined && comalista(normalizarComalista(datos.generos)))
      && (datos.edad != undefined && (datos.edad >= 0 && datos.edad < 50));
  }

  /**
   * Enviar a editar/crear el juego
   */
  const enviar = useCallback(async () => {
    if (validarTodo()) {
      setErrorFormulario("");
      const datosEnviar = { ...limpiarVaciosStrings(datos), publico: false, precio: premium ? datos.precio : undefined, adiciones: undefined, tags: datos.tags ? normalizarComalista(datos.tags).split(",") : undefined, avisos: datos.avisos ? normalizarComalista(datos.avisos).split(",") : undefined, idiomas: datos.idiomas ? normalizarComalista(datos.idiomas).split(",") : undefined, generos: datos.generos ? normalizarComalista(datos.generos).split(",") : undefined }
      const resultado = juegoEditar ? await editarJuego(juegoEditar.id ?? '', datosEnviar) : await crearJuego(datosEnviar);
      if (!resultado) {
        if (typeof error === "object" && error?.error?.result?.data?.doubleTitle) { //Error falso de VSCode
          lanzarMensaje(traduccion("errores", "juegoRepetido"), 2);
          setErrorFormulario(traduccion("errores", "juegoRepetido"));
        } else {
          lanzarMensaje(traduccion("errores", "errorFormularioJuego"), 2);
          setErrorFormulario(traduccion("errores", "errorFormularioJuego"));
        }
      } else {
        lanzarMensaje(traduccion("mensajes", "exitoCrearJuego"), 1);
        resetForm();
        if (juegoEditar) {
          editarJuegoLocal(resultado.id ?? '', resultado);
          location.reload();
        } else {
          agregarJuegoLocal(resultado);
          navegar("/game/" + resultado.id);
        }
      }
    } else {
      lanzarMensaje(traduccion("errores", "errorFormularioJuego"), 2);
      setErrorFormulario(traduccion("errores", "errorFormularioJuego"));
    }
  }, [datos, premium, juegoEditar, traduccion]);

  /**
   * Manda a borrar el juego actual
   */
  const borrarJuegoBoton = useCallback(async () => {
    if (!juegoEditar || !intencionBorrar) return;
    const resultado = await borrarJuego(juegoEditar.id ?? '', contrasegnaBorrar);
    if (resultado) {
      lanzarMensaje(traduccion("mensajes", "exitoBorrarJuego"), 3);
      setErrorBorrarJuego("");
      borrarJuegoLocal(juegoEditar.id ?? '');
      navegar("/user");
    } else {
      lanzarMensaje(traduccion("errores", "errorFormularioJuego"), 2);
      setErrorBorrarJuego(traduccion("errores", "genericoFormulario"));
    }
  }, [juegoEditar, intencionBorrar, contrasegnaBorrar, traduccion]);

  /**
   * Alterna el estado publico de un juego
   */
  const alternarPublico = useCallback(async () => {
    if (!juegoEditar) return;
    const nuevoEstado = juegoEditar?.publico ? false : true;
    const resultado = await editarPublicoJuego(juegoEditar.id ?? '', nuevoEstado);
    if (resultado) {
      lanzarMensaje(traduccion("mensajes", "exitoCambiarPublicoJuego"), 3);
      editarJuegoLocal(juegoEditar.id ?? '', {...juegoEditar, publico: nuevoEstado});
      location.reload();
    } else {
      lanzarMensaje(traduccion("errores", "error"), 2);
    }
  }, [juegoEditar, traduccion]);

  return (
    <div>
      {juegoEditar ? (<>
        {editandoAdiciones ? (<>
          <FormularioAdiciones id={juegoEditar?.id ?? ''} adicionesPrevias={(juegoEditar?.adiciones ?? []).map((e) => {return {...e, id: undefined}})} />
          <br />
        </>) : (<BotonFuncion titulo={traduccion("botones", "editarAdiciones")} funcion={() => setEditandoAdiciones(true)} tipo={0} ><Icono numero={8} color='var(--color-principal)' /></BotonFuncion>)}
        <BotonFuncion titulo={traduccion("botones", juegoEditar.publico ? "hacerPrivado" : "hacerPublico")} funcion={alternarPublico} tipo={0} ><Icono numero={juegoEditar.publico ? 14 : 13} color='var(--color-principal)' /></BotonFuncion>
        {intencionBorrar ? (<form onChange={(e: React.SyntheticEvent) => { setContrasegnaBorrar((e.target as HTMLInputElement).value) }}>
          <CajaError>{traduccion("parrafos", "avisoCatastrofe2")}</CajaError>
          <InputBasico placeholder="········" titulo={traduccion("formularios", "contrasegnaBorrarJuego")} nombre="contrasegna" ancho='30px' tipo="password" mensajeError={errorBorrarJuego ?? ''} valor={contrasegnaBorrar} />
          <BotonFuncion titulo={traduccion("botones", "borrarJuego").toUpperCase()} funcion={borrarJuegoBoton} hueco={false} tipo={2} ><Icono numero={10} color='var(--color-fondo1)' /></BotonFuncion>
        </form>)
          : (<BotonFuncion titulo={traduccion("botones", "borrarJuego")} funcion={() => setIntencionBorrar(true)} tipo={2} ><Icono numero={10} color='var(--color-error)' /></BotonFuncion>)}
      </>) : ''}
      <p>{juegoEditar != undefined ? traduccion("parrafos", "tipCreacionJuego1") : traduccion("parrafos", "tipCreacionJuego2")}</p>
      <form className="w-full lg:w-[60%] pr-10 lg:pr-0">
        <span>
          <InputBasico placeholder={tituloFalsoPlaceholder} titulo={(juegoEditar ? "" : "(*) ") + traduccion("formularios", "tituloJuego")} nombre="titulo" ancho='full' tipo="text" validador={tituloJuego} objetoHook={register("titulo", { required: traduccion("errores", "estaPropiedadObligatoria"), minLength: { value: 3, message: traduccion("errores", "validacionTituloJuego") } })} mensajeError={errors?.titulo?.message ?? ''} />
          {errors.titulo && <CajaError>{errors.titulo.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/460x215" titulo={traduccion("formularios", "urlPortada1")} nombre="urlPortada1" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada1", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada1?.message ?? ''} />
          <img src={datos.urlPortada1 ?? PUBLIC_URL + "/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada1 ? 'w-[460px] h-[215px]' : 'hidden'}`} />
          {errors.urlPortada1 && <CajaError>{errors.urlPortada1.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/600x900" titulo={traduccion("formularios", "urlPortada2")} nombre="urlPortada2" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada2", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada2?.message ?? ''} />
          <img src={datos.urlPortada2 ?? PUBLIC_URL + "/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada2 ? 'w-[300px] h-[450px]' : 'hidden'}`} />
          {errors.urlPortada2 && <CajaError>{errors.urlPortada2.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="https://coversforgames.com/images/1/1920x1080" titulo={traduccion("formularios", "urlPortada3")} nombre="urlPortada3" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada3", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada3?.message ?? ''} />
          <img src={datos.urlPortada3 ?? PUBLIC_URL + "/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada3 ? 'w-[480px] h-[270px]' : 'hidden'}`} />
          {errors.urlPortada3 && <CajaError>{errors.urlPortada3.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="v1.0.0" titulo={traduccion("formularios", "versionActual")} nombre="versionActual" ancho='full' tipo="text" validador={(v) => !v || version(v)} objetoHook={register("versionActual", { validate: (v) => !v || version(v) || traduccion("errores", "validacionVersion") })} mensajeError={errors?.versionActual?.message ?? ''} />
          {errors.versionActual && <CajaError>{errors.versionActual.message}</CajaError>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "descripcionCorta")} nombre="descripcionCorta" ancho='full' tipo="textarea" validador={(v) => !v || descripcionCortaJuego(v)} objetoHook={register("descripcionCorta", { validate: (v) => !v || descripcionCortaJuego(v) || traduccion("errores", "descripcionCorta") })} mensajeError={errors?.descripcionCorta?.message ?? ''} />
          {errors.descripcionCorta && <CajaError>{errors.descripcionCorta.message}</CajaError>}
        </span>
        <span>
          <InputBasico markdown={premium} valor={datos.descripcion} titulo={traduccion("formularios", "descripcion")} nombre="descripcion" ancho='full' tipo="textarea" validador={(v) => !v || descripcionJuego(v)} objetoHook={register("descripcion", { validate: (v) => !v || descripcionJuego(v) || traduccion("errores", "descripcion") })} mensajeError={errors?.descripcion?.message ?? ''} />
          {errors.descripcion && <CajaError>{errors.descripcion.message}</CajaError>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "edad")} nombre="edad" ancho='10px' tipo="number" validador={(v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) < 50)} objetoHook={register("edad", { min: { value: 0, message: traduccion("errores", "validacionEdad") }, max: { value: 49, message: traduccion("errores", "validacionEdad") }, validate: (v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) < 50) || traduccion("errores", "validacionEdad") })} mensajeError={errors?.edad?.message ?? ''} />
          {errors.edad && <CajaError>{errors.edad.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="short,retro,terror,free2play,multiplayer,indie,story,etc" titulo={traduccion("formularios", "tags")} nombre="tags" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("tags", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionTags") })} mensajeError={errors?.tags?.message ?? ''} />
          {errors.tags && <CajaError>{errors.tags.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="rpg,platformer,shooter,visualnovel,strategy,puzzles,etc" titulo={traduccion("formularios", "generos")} nombre="generos" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("generos", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionGeneros") })} mensajeError={errors?.generos?.message ?? ''} />
          {errors.generos && <CajaError>{errors.generos.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="jumpscares,violence,epilepsy,gore,nudity,drugs,etc" titulo={traduccion("formularios", "avisos")} nombre="avisos" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("avisos", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionAvisos") })} mensajeError={errors?.avisos?.message ?? ''} />
          {errors.avisos && <CajaError>{errors.avisos.message}</CajaError>}
        </span>
        <span>
          <InputBasico placeholder="ES-es,ZH-cn,EN-us,HI-in,ES-es,FR-fr,BN-bd,PT-br,RU-ru,PL-pl,IT-it,AR-eg,DE-de,TR-tr,etc" titulo={traduccion("formularios", "idiomas")} nombre="idiomas" ancho='full' tipo="text" validador={(v) => !v || comalista(normalizarComalista(v))} objetoHook={register("idiomas", { validate: (v) => !v || comalista(normalizarComalista(v)) || traduccion("errores", "validacionIdiomas") })} mensajeError={errors?.idiomas?.message ?? ''} />
          {errors.idiomas && <CajaError>{errors.idiomas.message}</CajaError>}
        </span>
        {premium && (<span>
          <InputBasico placeholder="3.99€" titulo={traduccion("formularios", "precio")} nombre="precio" ancho='10px' tipo="text" validador={(v) => !v || precio(v)} objetoHook={register("precio", { validate: (v) => !v || precio(v) || traduccion("errores", "validacionPrecio") })} mensajeError={errors?.precio?.message ?? ''} />
          {errors.precio && <CajaError>{errors.precio.message}</CajaError>}
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
