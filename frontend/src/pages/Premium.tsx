
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonFuncion from '../components/Elements/BotonFuncion';
import EnlaceFuncion from '../components/Elements/EnlaceFuncion';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useApiUsuarios from '../hooks/api/useApiUsuarios';
import useIdioma from '../hooks/useIdioma';
import useMensajes from '../hooks/useMensajes';
import useSesion from '../hooks/useSesion';
import useTituloDinamico from '../hooks/useTituloDinamico';
import { timestampAFecha } from '../libraries/extraFechas';

/**
 * Pagina para comprar la cuenta premium (ver los detalles)
 */
const Premium = function Premium() {

  const traduccion = useIdioma();
  const { premium, usuario } = useSesion();
  const [tiempoRestante, setTiempoRestante] = useState("");
  useTituloDinamico("MAGNA");
  const { verPremium } = useApiUsuarios();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();
  const botonPrincipal = () => (usuario ? (<>
    {tiempoRestante ? (<p>{traduccion("extra", "labelCaducidad")} {timestampAFecha(tiempoRestante)} <BotonFuncion tipo={3} hueco={false} titulo={traduccion("botones", "irComprarPremiumMas")} funcion={() => navegar("/renewMagna")} /></p>)
      : (<BotonFuncion tipo={3} hueco={false} titulo={traduccion("botones", "irComprarPremium")} funcion={() => navegar("/renewMagna")} />)}
  </>) : (<>
    <BotonFuncion tipo={1} titulo={traduccion("botones", "iniciarSesion")} funcion={() => navegar("/login")} />
    <BotonFuncion tipo={1} titulo={traduccion("botones", "crearCuenta")} funcion={() => navegar("/register")} />
  </>));

  const verFechaCaducidad = async () => {
    const resultado = await verPremium((typeof usuario === 'object' && usuario) ? usuario!.id! : '');
    if (!resultado || !resultado?.active) { //En caso de que haya expirado y el frontend diga que es premium pero el backend no
      location.reload();
      lanzarMensaje(traduccion("mensajes", "premiumExpirado"), 2);
      return;
    }
    setTiempoRestante(resultado.date);
  }
  useEffect(() => {
    if (premium) verFechaCaducidad();
  }, []);

  return (
    <>
      <div className='text-center bg-fondo2 p-5 mt-4'>
        <span className='text-resaltado'><Titulo magnitud={1}>{traduccion("titulos", "presentacionMagna")}</Titulo></span>
        <Icono tamagno={32} numero={18} color='var(--color-info1)' />{"\ \ \ "}<Icono tamagno={32} numero={7} color='var(--color-info1)' />{"\ \ \ "}<Icono tamagno={32} numero={21} color='var(--color-info1)' />
        <p className='mb-5'>{traduccion("parrafos", "textoPremium1")}</p>
        {botonPrincipal()}
        <p><EnlaceFuncion funcion="/info" titulo={traduccion("botones", "masInformacion")} /></p>
        <Titulo magnitud={3} >{traduccion("titulos", "mejorasPremium")}</Titulo>
        {/*//TODO: revisar mejoras y poner imagenes y hacer cambios segun region*/}
        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-10 sm:flex border-5 border-info1 m-5 text-lg gap-3 items-center'>
          <div className='flex-1'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium2")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium3")}</p>
          </div>
          <div className='flex items-center justify-center w-full sm:w-64 sm:h-64  py-4 sm:py-0'>
            <img src="https://placehold.co/256x256" alt="Example" className='w-32 h-32 sm:w-full sm:h-full object-contain' />
          </div>
        </div>

        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-10 sm:flex border-5 border-info1 m-5 text-lg gap-3 items-center'>
          <div className='flex items-center justify-center w-full sm:w-64 sm:h-64  py-4 sm:py-0'>
            <img src="https://placehold.co/256x256" alt="Example" className='w-32 h-32 sm:w-full sm:h-full object-contain' />
          </div>
          <div className='flex-1'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium4")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium5")}</p>
          </div>
        </div>

        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-10 sm:flex border-5 border-info1 m-5 text-lg gap-3 items-center'>
          <div className='flex-1'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium6")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium7")}</p>
          </div>
          <div className='flex items-center justify-center w-full sm:w-64 sm:h-64  py-4 sm:py-0'>
            <img src="https://placehold.co/256x256" alt="Example" className='w-32 h-32 sm:w-full sm:h-full object-contain' />
          </div>
        </div>

        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-5 sm:flex border-5 border-info1 m-5 text-lg gap-3 items-center'>
          <div className='flex items-center justify-center w-full sm:w-64 sm:h-64  py-4 sm:py-0'>
            <img src="https://placehold.co/256x256" alt="Example" className='w-32 h-32 sm:w-full sm:h-full object-contain' />
          </div>
          <div className='flex-1'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium8")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium9")}</p>
          </div>
        </div>

        {/*Convendria mejorar el sistema de precios, pero los pagos no han sido implementados*/}
        <Titulo magnitud={3}>{traduccion("titulos", "precios")}</Titulo>
        <div className='sm:flex text-center justify-center mb-5 sm:gap-10 gap-2'>
          <div className='border-2 border-info1 bg-fondo-especial-1 p-2 my-2'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium10")}</Titulo>
            <p className='font-black text-resaltado'>{traduccion("dinero", "premium1Mes")}</p>
          </div>
          <div className='border-2 border-info1 bg-fondo-especial-1 p-2 sm:scale-120 my-2'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium11")}</Titulo>
            <p className='font-black text-resaltado'>{traduccion("dinero", "premium6Meses")}</p>
          </div>
          <div className='border-2 border-info1 bg-fondo-especial-1 p-2 my-2'>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium12")}</Titulo>
            <p className='font-black text-resaltado'>{traduccion("dinero", "premium1Agno")}</p>
          </div>
        </div>
        <p>{traduccion("parrafos", "textoPremium13")}</p>

        {botonPrincipal()}
        <p><EnlaceFuncion funcion="/info" titulo={traduccion("botones", "masInformacion")} /></p>
      </div>
    </>
  )
};

export default Premium;