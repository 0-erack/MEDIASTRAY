import { useEffect, useState } from "react";
import { useForm } from 'react-hook-form';
import useApiUsuarios from "../../hooks/api/useApiUsuarios";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { Usuario } from "../../types/Usuario";
import BotonFuncion from "../Elements/BotonFuncion";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";
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

function TripleBuscador() {

  const formBase: FormValues = { busquedaActual: "", buscarUsuarios: true, buscarJuegos: true, buscarForos: true, orden: 'relevancia', pagina: 0 }
  const traduccion = useIdioma();
  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm<FormValues>({ defaultValues: formBase });
  const datos = watch() /*useState<FormValues>(formBase);*/
  const [textoPrevio, setTextoPrevio] = useState("");
  const { TAMAGNO_PAGINA, FRECUENCIA_ACTUALIZACION } = useAjustes();
  const { buscar: buscarUsuarios } = useApiUsuarios();
  const [usuariosCargados, setUsuariosCargados] = useState<Array<Partial<Usuario>>>([]);
  const [juegosCargados, setJuegosCargados] = useState([]);
  const [forosCargados, setForosCargados] = useState([]);

  const buscar = async (texto: string) => {
    if (texto) {
      if (datos.buscarUsuarios) {
        const resultado = await buscarUsuarios(texto, parseInt(datos?.pagina as string) ?? 0, parseInt(datos.orden) ?? 0);
        setUsuariosCargados(resultado.length ? resultado : []);
      }
    }
  }

  useEffect(() => {
    if (FRECUENCIA_ACTUALIZACION != 0) {
      const intervalo = setInterval(() => {
        if (datos.busquedaActual! && textoPrevio !== datos.busquedaActual!) buscar(datos!.busquedaActual!);
        setTextoPrevio(datos?.busquedaActual ?? '');
      }, FRECUENCIA_ACTUALIZACION ?? 1000);
      return () => clearInterval(intervalo);
    }
  }, [datos]);
  useEffect(() => {
    if (datos.busquedaActual) buscar(datos.busquedaActual);
  }, [datos.orden, datos.buscarForos, datos.buscarUsuarios, datos.buscarJuegos, datos.pagina]);

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
            <InputBasico iconoA={4} inline={true} nombre="orden" titulo={traduccion("formularios", "busquedaOrden")} objetoHook={register("orden")} tipo="select" opcionesSelect={[
              { valor: "0", etiqueta: traduccion("formularios", "busquedaOrdenRelevancia") },
              { valor: "1", etiqueta: traduccion("formularios", "busquedaOrdenAlfabetica") },
              { valor: "2", etiqueta: traduccion("formularios", "busquedaOrdenAleatorio") },
            ]} />
            {/*//TODO: filtros mas*/}
          </div>
        </form>
      </div>
      <hr />
      <div className="sm:flex w-full items-start gap-5 h-full">
        {datos.buscarUsuarios && (
          <div className="flex-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
            <Titulo magnitud={3}><Icono numero={1} color="var(--color-principal)" /> {traduccion("titulos", "parteUsuarios")}</Titulo>
            {usuariosCargados.length ? (<>
              {usuariosCargados.map((e) => (<TarjetaUsuario key={e.id} usuario={e} />))}
            </>) : (<p>{traduccion("errores", "usuarioNoEncontrado")}</p>)}
          </div>
        )}
        {datos.buscarJuegos && (
          <div className="flex-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
            <Titulo magnitud={3}><Icono numero={3} color="var(--color-principal)" /> {traduccion("titulos", "parteJuegos")}</Titulo>
            {juegosCargados.length ? (<>
              {juegosCargados.map((e) => (<></>))}
            </>) : (<p>{traduccion("errores", "juegoNoEncontrado")}</p>)}
          </div>
        )}
        {datos.buscarForos && (
          <div className="flex-1 min-w-0 overflow-hidden text-center justify-center border border-principal mb-5">
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
