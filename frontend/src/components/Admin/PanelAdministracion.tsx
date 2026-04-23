import { useForm } from "react-hook-form";
import useIdioma from "../../hooks/useIdioma";
import useSesion from "../../hooks/useSesion";
import IndicadorPagina from "../Busqueda/IndicadorPagina";
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

  return (
    <form>
      <p>{traduccion("parrafos", "infoAdmin1")}</p>
      <p>{traduccion("parrafos", "infoAdmin2")}</p>
      <p>{traduccion("parrafos", "infoAdmin6")}</p>
      <InputBasico titulo={traduccion("formularios", "idJuego")} nombre="idJuego" ancho='full' tipo="text" objetoHook={register("idJuego")}/>
      <InputBasico titulo={traduccion("formularios", "idUsuario")} nombre="idUsuario" ancho='full' tipo="text" objetoHook={register("idUsuario")}/>
      <InputBasico titulo={traduccion("formularios", "idComentario")} nombre="idComentario" ancho='full' tipo="text" objetoHook={register("idComentario")}/>
      <InputBasico titulo={traduccion("formularios", "busquedaReporte")} nombre="idBusquedaReportes" ancho='full' tipo="text" objetoHook={register("idBusquedaReportes")}/>
      <IndicadorPagina control={control} setValue={setValue} />
      {esAdmin > 0 && (<> {/*Moderador*/}

        <p>{traduccion("parrafos", "infoAdmin5")}</p>
      </>)}
      {esAdmin === 2 && (<> {/*Sudo*/}

        <p>{traduccion("parrafos", "infoAdmin4")}</p>
      </>)}
      {(esAdmin === 1 || esAdmin === 2) && (<> {/*Admin*/}

        <p>{traduccion("parrafos", "infoAdmin3")}</p>
      </>)}
    </form>
  )
}

export default PanelAdministracion;
