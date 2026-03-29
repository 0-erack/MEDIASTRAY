
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import BotonFuncion from '../components/Elements/BotonFuncion';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useApiUsuarios from '../hooks/api/useApiUsuarios';
import useIdioma from '../hooks/useIdioma';
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
  const botonPrincipal = () => (usuario ? (<>
          {tiempoRestante ? (<p>{traduccion("extra", "labelCaducidad")} {timestampAFecha(tiempoRestante)}</p>) : (<BotonFuncion tipo={3} hueco={false} titulo={traduccion("botones", "irComprarPremium")} funcion={() => navegar("/renewMagna")} />)}
        </>) : (<>
          <BotonFuncion tipo={1} titulo={traduccion("botones", "iniciarSesion")} funcion={() => navegar("/login")} />
          <BotonFuncion tipo={1} titulo={traduccion("botones", "crearCuenta")} funcion={() => navegar("/register")} />
        </>));

  const verFechaCaducidad = async () => {
    const resultado = await verPremium((typeof usuario === 'object' && usuario) ? usuario!.id! : '');
    if (!resultado || !resultado.ok || !resultado?.data?.active) location.reload(); //En caso de que haya expirado y el frontend diga que es premium pero el backend no
    setTiempoRestante(resultado.data.date);
  }
  useEffect(() => {
    if (premium) verFechaCaducidad();
  }, []);

  return (
    <>
      <div className='text-center bg-fondo2 p-5'>
        <span className='text-resaltado'><Titulo magnitud={1}>{traduccion("titulos", "presentacionMagna")}</Titulo></span>
        <Icono tamagno={32} numero={18} color='var(--color-info1)' />{"\ \ \ "}<Icono tamagno={32} numero={7} color='var(--color-info1)' />{"\ \ \ "}<Icono tamagno={32} numero={21} color='var(--color-info1)' />
        <p className='mb-5'>{traduccion("parrafos", "textoPremium1")}</p>
        {botonPrincipal()}
        <Titulo magnitud={3} >{traduccion("titulos", "mejorasPremium")}</Titulo>
        {/*//TODO: revisar mejoras y poner imagenes*/}
        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-15 flex border-5 border-info1 m-5 text-lg gap-3 justify-between items-stretch'>
          <div>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium2")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium3")}</p>
          </div>
          <div className='border border-info1 h-full w-64'></div>
        </div>
        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-15 flex border-5 border-info1 m-5 text-lg gap-3 justify-between items-stretch'>
          <div className='border border-info1 h-full w-64'></div>
          <div>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium4")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium5")}</p>
          </div>
        </div>
        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-15 flex border-5 border-info1 m-5 text-lg gap-3 justify-between items-stretch'>
          <div>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium6")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium7")}</p>
          </div>
          <div className='border border-info1 h-full w-64'></div>
        </div>
        <div className='text-left bg-fondo-especial-1 p-5 sm:mx-30 mb-15 flex border-5 border-info1 m-5 text-lg gap-3 justify-between items-stretch'>
          <div className='border border-info1 h-full w-64'></div>
          <div>
            <Titulo magnitud={4}>{traduccion("parrafos", "textoPremium8")}</Titulo>
            <p className='m-5'>{traduccion("parrafos", "textoPremium9")}</p>
          </div>
        </div>
        PLANES


        {botonPrincipal()}
      </div>
    </>
  )
};

export default Premium;