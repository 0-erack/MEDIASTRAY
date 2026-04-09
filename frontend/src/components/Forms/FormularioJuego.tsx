import { useForm } from "react-hook-form";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { tituloJuego, url, version } from "../../libraries/validacionesBackend";
import { Juego } from "../../types/Juego";
import InputBasico from "../Elements/InputBasico";

interface FormValues {
  titulo?: string | null;
  urlPortada1?: string | null;
  urlPortada2?: string | null;
  urlPortada3?: string | null;
  versionActual?: string | null;
  descripcion?: string | null;
  descripcionCorta?: string | null;
  generos?: string | Array<string>;
  tags?: string | Array<string>;
  avisos?: string | Array<string>;
  idiomas?: string | Array<string>;
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

  const formBase: FormValues = juegoEditar ?? { edad: 0, adiciones: [], versionActual: "v1.0.0", generos: [], tags: [], avisos: [], idiomas: [] }
  const traduccion = useIdioma();
  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const { lanzarMensaje } = useMensajes();
  const { usuario, premium } = useSesion();

  const reset = () => {

  }

  const validarTodo = (): boolean => {
    return true;
  }

  const enviar = async () => {

  }



  return (
    <div>
      {JSON.stringify(datos)}
      <form className="w-full sm:w-[50%]">
        <span>
          <InputBasico titulo={(juegoEditar ? "" : "(*) ") + traduccion("formularios", "tituloJuego")} nombre="titulo" ancho='full' tipo="text" validador={tituloJuego} objetoHook={register("titulo", { required: traduccion("errores", "estaPropiedadObligatoria"), minLength: { value: 3, message: traduccion("errores", "validacionTituloJuego") } })} mensajeError={errors?.titulo?.message ?? ''} />
          {errors.titulo && <p className='text-error'>{errors.titulo.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "urlPortada1")} nombre="urlPortada1" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada1", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada1?.message ?? ''} />
          <img src={datos.urlPortada1 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada1 ? 'w-[460px] h-[215px]' : 'hidden'}`} />
          {errors.urlPortada1 && <p className='text-error'>{errors.urlPortada1.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "urlPortada2")} nombre="urlPortada2" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada2", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada2?.message ?? ''} />
          <img src={datos.urlPortada2 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada2 ? 'w-[300px] h-[450px]' : 'hidden'}`} />
          {errors.urlPortada2 && <p className='text-error'>{errors.urlPortada2.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "urlPortada3")} nombre="urlPortada3" ancho='full' tipo="text" validador={(v) => !v || url(v)} objetoHook={register("urlPortada3", { validate: (v) => !v || url(v) || traduccion("errores", "validacionUrl") })} mensajeError={errors?.urlPortada3?.message ?? ''} />
          <img src={datos.urlPortada3 ?? "/public/coverless1.png"} className={`lg:mb-0 mb-3 mx-auto object-cover relative border border-principal ${datos.urlPortada3 ? 'w-[480px] h-[270px]' : 'hidden'}`} />
          {errors.urlPortada3 && <p className='text-error'>{errors.urlPortada3.message}</p>}
        </span>
        <span>
          <InputBasico titulo={traduccion("formularios", "versionActual")} nombre="versionActual" ancho='full' tipo="text" validador={(v) => !v || version(v)} objetoHook={register("versionActual", { validate: (v) => !v || version(v) || traduccion("errores", "validacionVersion") })} mensajeError={errors?.versionActual?.message ?? ''} />
          {errors.versionActual && <p className='text-error'>{errors.versionActual.message}</p>}
        </span>
      </form>
    </div>
  );
}

export default FormularioJuego;
