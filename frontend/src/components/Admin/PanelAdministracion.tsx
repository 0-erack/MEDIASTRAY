import { useState } from "react";
import { useForm } from "react-hook-form";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import IndicadorPagina from "../Busqueda/IndicadorPagina";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";

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
const PanelAdministracion = () => {

  const { esAdmin } = useSesion();
  const traduccion = useIdioma();
  const formBase: FormValues = {idJuego: "", idUsuario: "", idComentario: "", idBusquedaReportes: "", pagina: 0}
  const { register, watch, formState: { errors }, reset, control, setValue } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const { lanzarMensaje } = useMensajes();
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [datosResultado, setDatosResultado] = useState("");

  /**
   * Handler para las operaciones que no sean de lectura
   * @param resultado resultado de la operacion de la API, para poner mensaje de exito o error
   */
  const realizarOperacion = async (resultado: Record<string, any>): Promise<void> => {
      setMensajeError("");
      setMensajeExito("");
      setDatosResultado("");
      if (resultado.ok) {
        if (resultado.data) setDatosResultado(JSON.stringify(resultado.data));
        lanzarMensaje(traduccion("mensajes", "exitoAdmin"), 1);
        setMensajeExito(traduccion("mensajes", "exitoAdmin"));
      } else {
        lanzarMensaje(traduccion("mensajes", "falloAdmin"), 2);
        setMensajeError(traduccion("mensajes", "falloAdmin") + " - " + (resultado?.code ?? 400) + " - " + (resultado?.message ?? ''));
      }
  }

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
          {datosResultado && (<div>
            {datosResultado}
          </div>)}
        </>)}
      </div>

      {esAdmin > 0 && (<> {/*Moderador*/}
        <p>{traduccion("parrafos", "infoAdmin5")}</p>
        <BotonFuncion titulo={traduccion("botones", "adminBorrarComentario")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminMenosStrike")} funcion={realizarOperacion} />
        <BotonFuncion titulo={traduccion("botones", "adminMasStrike")} funcion={realizarOperacion} />
        <BotonFuncion titulo={traduccion("botones", "adminVerUsuario")} funcion={realizarOperacion} />
        <BotonFuncion titulo={traduccion("botones", "adminVerJuego")} funcion={realizarOperacion} />
      </>)}
      {(esAdmin === 1 || esAdmin === 2) && (<> {/*Admin*/}
        <p>{traduccion("parrafos", "infoAdmin3")}</p>
        <BotonFuncion titulo={traduccion("botones", "adminOcultarJuego")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioNormal")} funcion={realizarOperacion} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioRestringido")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminPublicoUsuarioOculto")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminBorrarJuego")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccionNo")} funcion={realizarOperacion} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccion")} funcion={realizarOperacion} tipo={2} />
        <BotonFuncion titulo={traduccion("botones", "adminRestriccionSi")} funcion={realizarOperacion} tipo={2} />
      </>)}
      {esAdmin === 2 && (<> {/*Sudo*/}
        <p>{traduccion("parrafos", "infoAdmin4")}</p>
      </>)}
      
      todo relacionado reportes
      <InputBasico titulo={traduccion("formularios", "busquedaReporte")} nombre="idBusquedaReportes" ancho='full' tipo="text" objetoHook={register("idBusquedaReportes")}/>
      <IndicadorPagina control={control} setValue={setValue} /><br />
    </form>
  )
}

export default PanelAdministracion;
