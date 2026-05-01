
import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonFuncion from '../components/Elements/BotonFuncion';
import CajaError from '../components/Elements/CajaError';
import Titulo from '../components/Elements/Titulo';
import useApiUsuarios from '../hooks/api/useApiUsuarios';
import useAjustes from '../hooks/useAjustes';
import useIdioma from '../hooks/useIdioma';
import useMensajes from '../hooks/useMensajes';
import useSesion from '../hooks/useSesion';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina para comprar premium
 */
const RenewPremium = memo(function RenewPremium() {

  useTituloDinamico("renovar");
  const traduccion = useIdioma();
  const navegar = useNavigate();
  const { usuario, premium } = useSesion();
  const [cantidadMeses, setCantidadMeses] = useState(1);
  const [etiquetaPrecio, setEtiquetaPrecio] = useState("");
  const { idiomaActual } = useAjustes();
  const [datosTarjeta, setDatosTarjeta] = useState<Record<string, any>>({});
  const { renovarPremium } = useApiUsuarios();
  const [error, setError] = useState(false);
  const { lanzarMensaje } = useMensajes();

  const comprarPremium = async () => {
    const resultado = await renovarPremium(cantidadMeses, datosTarjeta);
    if (resultado) {
      navegar("/user");
      location.reload();
      lanzarMensaje(traduccion("mensajes", "renovadoPremium"), 4);
      return;
    }
    setError(true);
  }

  useEffect(() => {
    setDatosTarjeta({});
    if (!usuario) navegar("/login");
  }, []);
  useEffect(() => {
    if (cantidadMeses == 1) {
      setEtiquetaPrecio(traduccion("dinero", "premium1Mes"));
    } else if (cantidadMeses == 6) {
      setEtiquetaPrecio(traduccion("dinero", "premium6Meses"));
    } else if (cantidadMeses == 12) {
      setEtiquetaPrecio(traduccion("dinero", "premium1Agno"));
    }
    setError(false);
  }, [cantidadMeses, idiomaActual]);

  return (
    <>
      <Titulo>{traduccion("titulos", "comprarMeses")}</Titulo>
      <p>{traduccion("parrafos", "textoPremium14")}</p>
      <div>
        <p>{traduccion("extra", "labelCantidad")} <BotonFuncion hueco={cantidadMeses != 1} titulo={traduccion("parrafos", "textoPremium10")} funcion={()=>setCantidadMeses(1)} /> <BotonFuncion hueco={cantidadMeses != 6} titulo={traduccion("parrafos", "textoPremium11")} funcion={()=>setCantidadMeses(6)} /> <BotonFuncion hueco={cantidadMeses != 12} titulo={traduccion("parrafos", "textoPremium12")} funcion={()=>setCantidadMeses(12)} /></p>
        <p><span className='font-black text-resaltado'>{etiquetaPrecio}</span></p>
      </div>
      <div className='border border-principal my-5 px-10 py-3'>
        <p>{traduccion("extra", "indicadorPago")}</p>
        <p>Aún no se ha implementado el sistema de pagos, esta versión de la app es para pruebas, aqui iria un formulario con los datos</p> {/*//TODO:*/}
        <CajaError texto={error && traduccion("errores", "errorCompra")} />
      </div>
      <BotonFuncion hueco={false} tipo={3} titulo={traduccion("botones", "comprar")} funcion={comprarPremium} /> 
      <p>{traduccion("parrafos", "textoLegal1")}</p>
    </>
  )
});

export default RenewPremium;