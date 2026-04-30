import { useEffect, useMemo, useState } from "react";
import { useForm } from 'react-hook-form';
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { Juego } from "../../types/Juego";
import { Usuario } from "../../types/Usuario";
import BotonFuncion from "../Elements/BotonFuncion";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";
import TarjetaJuego from "../Juego/TarjetaJuego";
import Icono from "../Principal/Icono";
import TarjetaUsuario from "../Usuario/TarjetaUsuario";
import IndicadorPagina from "./IndicadorPagina";

interface FormValues {
  busquedaActual: string;
  buscarUsuarios: boolean;
  buscarJuegos: boolean;
  buscarForos: boolean;
  orden: string;
  pagina: number | string;
}

/**
 * Pagina para buscar usuarios, juegos y foros con filtros, orden y paginado
 * @param inicial texto inicial en el buscador
 */
function TripleBuscador({ inicial }: { inicial: string }) {

  const formBase: FormValues = { busquedaActual: inicial ?? "", buscarUsuarios: true, buscarJuegos: true, buscarForos: true, orden: '0', pagina: 0 }
  const traduccion = useIdioma();
  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm<FormValues>({ defaultValues: formBase });
  const datos = watch(); /*useState<FormValues>(formBase);*/
  const [textoPrevio, setTextoPrevio] = useState("");
  const { TAMAGNO_PAGINA, FRECUENCIA_ACTUALIZACION } = useAjustes();
  const { buscar: buscarUsuarios } = useApiUsuarios();
  const { buscar: buscarJuegos } = useApiJuegos();
  const [usuariosCargados, setUsuariosCargados] = useState<Array<Partial<Usuario>>>([]);
  const [juegosCargados, setJuegosCargados] = useState<Array<Partial<Juego>>>([]);
  const [forosCargados, setForosCargados] = useState([]);
  const opcionesOrden = useMemo(() => [
    { valor: "0", etiqueta: traduccion("formularios", "busquedaOrdenRelevancia") },
    { valor: "1", etiqueta: traduccion("formularios", "busquedaOrdenAlfabetica") },
    { valor: "2", etiqueta: traduccion("formularios", "busquedaOrdenAleatorio") },
  ], [traduccion]);

  /**
   * Actualiza la busqueda actual usando la api en base a un texto de busqueda
   * @param texto a buscar
   */
  const buscar = async (texto: string) => {
    if (texto) {
      if (datos.buscarUsuarios) {
        const resultado = await buscarUsuarios(texto, parseInt(datos?.pagina as string) ?? 0, parseInt(datos.orden) ?? 0);
        setUsuariosCargados(resultado.length ? resultado : []);
      }
      if (datos.buscarJuegos) {
        const resultado = await buscarJuegos(texto, parseInt(datos?.pagina as string) ?? 0, parseInt(datos.orden) ?? 0);
        setJuegosCargados(resultado.length ? resultado : []);
      }
    }
  }

  // 1. Handle the "Reset" when the search is empty
useEffect(() => {
  if (!datos.busquedaActual) {
    setJuegosCargados([]);
    setUsuariosCargados([]);
    setForosCargados([]);
  }
}, [datos.busquedaActual]); // Only runs when the text actually changes to empty

// 2. Handle the "Debounced" Search (Replacing your Interval)
// This is much lighter on the CPU and allows the Router to interrupt
useEffect(() => {
  if (!datos.busquedaActual) return;

  // We use a timeout. If the user types again within the frequency, 
  // the previous search is cancelled. This prevents the "UI Lock".
  const delay = FRECUENCIA_ACTUALIZACION || 1000;
  
  const timer = setTimeout(() => {
    buscar(datos.busquedaActual);
  }, delay);

  return () => clearTimeout(timer); // CRITICAL: Stops the search if you navigate away
}, [datos.busquedaActual, datos.orden, datos.pagina, datos.buscarUsuarios, datos.buscarJuegos, datos.buscarForos]);

// 3. Handle the Initial Load from URL Slug
useEffect(() => {
  if (inicial) {
    // Only set the value if it's different to prevent loops
    setValue("busquedaActual", inicial);
    buscar(inicial);
  }
}, [inicial, setValue]);

  return (
    <div>
      <div>
        <form>
          <div className="flex items-center gap-2">
            <span className="flex-1">
              {errors.busquedaActual && <p className='text-error'>{errors.busquedaActual.message}</p>}
              <InputBasico placeholder={". . . . . . . ."} nombre="busquedaActual" ancho='full' tipo="text" validador={(e) => /*e?.length < 64*/true} objetoHook={register("busquedaActual", { required: "Busca algo", minLength: { value: 1, message: "minimo 1" } })} mensajeError={errors?.busquedaActual?.message ?? ''} />
            </span>
            <span>
              <BotonFuncion tipo={1} titulo={traduccion("titulosHtml", "browse")} funcion={async () => await buscar(datos?.busquedaActual ?? '')} >
                <Icono numero={4} color="var(--color-principal)" />
              </BotonFuncion>
            </span>
          </div>
          <div className="text-center">
            <IndicadorPagina control={control} setValue={setValue} />
            <InputBasico iconoA={2} inline={true} nombre="buscarUsuarios" titulo={traduccion("formularios", "activarBusquedaUsuarios")} objetoHook={register("buscarUsuarios")} tipo="checkbox" />
            <InputBasico iconoA={3} inline={true} nombre="buscarJuegos" titulo={traduccion("formularios", "activarBusquedaJuegos")} objetoHook={register("buscarJuegos")} tipo="checkbox" />
            <InputBasico iconoA={5} inline={true} nombre="buscarForos" titulo={traduccion("formularios", "activarBusquedaForos")} objetoHook={register("buscarForos")} tipo="checkbox" />
            <InputBasico iconoA={4} inline={true} nombre="orden" titulo={traduccion("formularios", "busquedaOrden")} objetoHook={register("orden")} tipo="select" opcionesSelect={opcionesOrden} />
            {/*//TODO: filtros mas*/}
          </div>
        </form>
      </div>
      <p>{traduccion("parrafos", "tipBuscador")}</p>
      <hr />
      <div className="xl:flex w-full items-start gap-5 h-full">
        {datos.buscarUsuarios && (
          <div className="flex-1 p-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
            <Titulo magnitud={3}><Icono numero={1} color="var(--color-principal)" /> {traduccion("titulos", "parteUsuarios")}</Titulo>
            {usuariosCargados.length ? (<>
              {usuariosCargados.map((e) => (<TarjetaUsuario key={e.id} usuario={e} destacado={false} />))}
            </>) : (<p>{traduccion("errores", "usuarioNoEncontrado")}</p>)}
          </div>
        )}
        {datos.buscarJuegos && (
          <div className="flex-1 p-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
            <Titulo magnitud={3}><Icono numero={3} color="var(--color-principal)" /> {traduccion("titulos", "parteJuegos")}</Titulo>
            {juegosCargados.length ? (<div className="text-left">
              {juegosCargados.map((e, i) => (<TarjetaJuego key={i} juego={e} />))}
            </div>) : (<p>{traduccion("errores", "juegoNoEncontrado")}</p>)}
          </div>
        )}
        {datos.buscarForos && (
          <div className="flex-1 p-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
            <Titulo magnitud={3}><Icono numero={5} color="var(--color-principal)" /> {traduccion("titulos", "parteForos")}</Titulo>
            {forosCargados.length ? (<>
              {forosCargados.map((e) => (<></>))}
            </>) : (<p>{traduccion("errores", "foroNoEncontrado")}</p>)}
          </div>
        )}
        {!datos.buscarForos && !datos.buscarJuegos && !datos.buscarUsuarios && (
          <div className="flex-1 flex justify-center">
            <p>{traduccion("errores", "noBusqueda")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripleBuscador;
