import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiAdmin from "../../hooks/api/useApiAdmin";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import IndicadorPagina from "../Busqueda/IndicadorPagina";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";
import InfoReporte from "./InfoReporte";

interface FormValues {
  idJuego: string;
  idUsuario: string;
  idComentario: string;
  idBusquedaReportes: string;
  pagina: number;
}

/**
 * Controles relacionados con la administracion de Mediastray, no todas las operaciones estan disponibles aqui
 */
const PanelAdministracion = ({id}: {id: string}) => {

  const { esAdmin } = useSesion();
  const traduccion = useIdioma();
  const formBase: FormValues = {idJuego: "", idUsuario: "", idComentario: "", idBusquedaReportes: "", pagina: 0}
  const { register, watch, formState: { errors }, reset, control, setValue } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const { lanzarMensaje } = useMensajes();
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [datosResultado, setDatosResultado] = useState("");
  const [primeraVez, setPrimeraVez] = useState(true);
  const [reportesCargados, setReportesCargados] = useState<Array<Record<string, any>>>([]);
  const { verJuego, verUsuario, cambiarStrikes, borrarReporte, verReportes, borrarComentairio, cambiarVisibilidadJuego, cambiarNivelDisponibleUsuario, cambiarNivelPublicoUsuario, borrarJuego } = useApiAdmin();

  /**
   * Handler para las operaciones que no sean de lectura
   * @param resultado resultado de la operacion de la API, para poner mensaje de exito o error
   */
  const realizarOperacion = useCallback((resultado: Record<string, any>) => {
      setMensajeError("");
      setMensajeExito("");
      setDatosResultado("");
      if (resultado.ok) {
        if (resultado.data) setDatosResultado(JSON.stringify(resultado.data));
        lanzarMensaje(traduccion("mensajes", "exitoAdmin"), 1);
        setMensajeExito(traduccion("mensajes", "exitoAdmin") + (resultado?.message ? (" - " + resultado.message) : ''));
      } else {
        lanzarMensaje(traduccion("mensajes", "falloAdmin"), 2);
        setMensajeError(traduccion("mensajes", "falloAdmin") + " - " + (resultado?.code ?? 400) + " - " + (resultado?.message ?? ''));
      }
  }, [traduccion]);

  /**
   * Handler para eliminar un reporte
   * @param id reporte a eliminar
   */
  const elimninarReporte = useCallback(async (id: string) => {
    const resultado = await borrarReporte(id);
    if (resultado?.ok) {
      setReportesCargados(reportesCargados.filter((e) => {return e.id != id}));
      lanzarMensaje(traduccion("mensajes", "exitoAdmin"), 3);
      setMensajeExito(traduccion("mensajes", "exitoAdmin") + (resultado?.message ? (" - " + resultado.message) : ''));
    } else {
      lanzarMensaje(traduccion("mensajes", "falloAdmin"), 2);
      setMensajeError(traduccion("mensajes", "falloAdmin") + " - " + (resultado?.code ?? 400) + " - " + (resultado?.message ?? ''));
    }
  }, [traduccion]);

  const cargaInicial = useCallback(async () => {
    const resultado = await verReportes(datos?.idBusquedaReportes ?? undefined, datos.pagina ?? 0);
    if (resultado?.ok && Array.isArray(resultado?.data?.reports)) {
      setReportesCargados(resultado?.data?.reports);
    } else {
      setReportesCargados([]);
    }
  }, [datos.pagina, datos.idBusquedaReportes]);
  useEffect(() => {
    if (!primeraVez) cargaInicial();
  }, [datos.pagina, datos.idBusquedaReportes, id]);

  useEffect(() => {
    if (id) {
      const idUsar = id.replaceAll("game_", "").replaceAll("user_", "").replaceAll("comment_", "").replaceAll("forum_", "");
      setValue("idBusquedaReportes", idUsar, { shouldValidate: true, shouldDirty: true });
      if (id.startsWith("game_")) setValue("idJuego", idUsar, { shouldValidate: true, shouldDirty: true });
      if (id.startsWith("comment_")) setValue("idComentario", idUsar, { shouldValidate: true, shouldDirty: true });
      if (id.startsWith("user_")) setValue("idUsuario", idUsar, { shouldValidate: true, shouldDirty: true });
      setPrimeraVez(false);
      //if (id.startsWith("forum_"))
    }
  }, []);

  return (
    <form>
      <p>{traduccion("parrafos", "infoAdmin1")}</p>
      <p>{traduccion("parrafos", "infoAdmin2")}</p>
      <p>{traduccion("parrafos", "infoAdmin6")}</p>
      <InputBasico titulo={traduccion("formularios", "idJuego")} nombre="idJuego" ancho='full' tipo="text" objetoHook={register("idJuego")}/>
      <InputBasico titulo={traduccion("formularios", "idUsuario")} nombre="idUsuario" ancho='full' tipo="text" objetoHook={register("idUsuario")}/>
      <InputBasico titulo={traduccion("formularios", "idComentario")} nombre="idComentario" ancho='full' tipo="text" objetoHook={register("idComentario")}/>
      <div>
        {mensajeError && (<CajaError>{mensajeError}</CajaError>)}
        {mensajeExito && (<>
          <p>{mensajeExito}</p>
          {datosResultado && (<div className="bg-principal text-fondo1 p-2 fuente3">
            {datosResultado}
          </div>)}
        </>)}
      </div>

      {esAdmin > 0 && (<> {/*Moderador*/}
        <p>{traduccion("parrafos", "infoAdmin5")}</p>
        <BotonFuncion titulo={traduccion("botones", "adminBorrarComentario")} funcion={async () => realizarOperacion(await borrarComentairio(datos.idComentario))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminMenosStrike")} funcion={async () => realizarOperacion(await cambiarStrikes(datos.idUsuario, -1))} />
        <BotonFuncion titulo={traduccion("botones", "adminMasStrike")} funcion={async () => realizarOperacion(await cambiarStrikes(datos.idUsuario, 1))} />
        <BotonFuncion titulo={traduccion("botones", "adminVerUsuario")} funcion={async () => realizarOperacion(await verUsuario(datos.idUsuario))} />
        <BotonFuncion titulo={traduccion("botones", "adminVerJuego")} funcion={async () => realizarOperacion(await verJuego(datos.idJuego))} />
      </>)}
      {(esAdmin === 1 || esAdmin === 2) && (<> {/*Admin*/}
        <p>{traduccion("parrafos", "infoAdmin3")}</p>
        <BotonFuncion titulo={traduccion("botones", "adminOcultarJuego")} funcion={async () => realizarOperacion(await cambiarVisibilidadJuego(datos.idJuego, false))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioNormal")} funcion={async () => realizarOperacion(await cambiarNivelPublicoUsuario(datos.idUsuario, 0))} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioRestringido")} funcion={async () => realizarOperacion(await cambiarNivelPublicoUsuario(datos.idUsuario, 1))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioOculto")} funcion={async () => realizarOperacion(await cambiarNivelPublicoUsuario(datos.idUsuario, 2))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminBorrarJuego")} funcion={async () => realizarOperacion(await borrarJuego(datos.idJuego))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccionNo")} funcion={async () => realizarOperacion(await cambiarNivelDisponibleUsuario(datos.idUsuario, 0))} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccion")} funcion={async () => realizarOperacion(await cambiarNivelDisponibleUsuario(datos.idUsuario, 2))} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccionSi")} funcion={async () => realizarOperacion(await cambiarNivelDisponibleUsuario(datos.idUsuario, 3))} tipo={2} />
      </>)}
      {esAdmin === 2 && (<> {/*Sudo*/}
        <p>{traduccion("parrafos", "infoAdmin4")}</p>
      </>)}
      
      <Titulo magnitud={3}>{traduccion("titulos", "seccionReportes")}</Titulo>
      <InputBasico titulo={traduccion("formularios", "busquedaReporte")} nombre="idBusquedaReportes" ancho='full' tipo="text" objetoHook={register("idBusquedaReportes")}/>
      <IndicadorPagina control={control} setValue={setValue} /><br />
        <div>
          {reportesCargados.map((e, i) => {
            return (<InfoReporte reporte={e} key={i} funcionEliminar={elimninarReporte}/>)
          })}
        </div>
    </form>
  )
}

export default PanelAdministracion;
