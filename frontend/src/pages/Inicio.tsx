/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import logoC from '../assets/images/LogoC.png';
import BotonFuncion from '../components/Elements/BotonFuncion';
import Titulo from '../components/Elements/Titulo';
import useAjustes from '../hooks/useAjustes';
import useIdioma from '../hooks/useIdioma';
import useSesion from '../hooks/useSesion';
import { cambiarTitulo } from '../libraries/accionesIndex';

/**
 * Pagina de inicio
 */
function Inicio() {

    const { PUBLIC_URL } = useAjustes();
    const traduccion = useIdioma();
    const { usuario } = useSesion();
    const navegar = useNavigate();

    useEffect(() => {
        cambiarTitulo("MEDIASTRAY");
        /*(async () => {
            let datos = await fetch(API_URL + "/prueba");
            datos = await datos.json();
            //console.log(await datos);
        })();*/
    }, []);

    return (
        <div className='sm:p-10 p-2'>
            <div className='text-center'>
                <img className='sm:w-5xl w-lg m-auto' src={logoC ?? PUBLIC_URL + "/logoC.png"} alt="Logo" style={{ imageRendering: 'pixelated' }} />
                <div>
                    <Titulo magnitud={4}>{traduccion("titulos", "inicio")}</Titulo>
                    {!usuario ? (<>
                        <BotonFuncion titulo={traduccion("botones", "iniciarSesion")} funcion={() => navegar("/login")} />
                        <BotonFuncion titulo={traduccion("botones", "crearCuenta")} funcion={() => navegar("/register")} />
                    </>) : ""}
                </div>
            </div>
            <div className='p-5'>
                <Titulo magnitud={3}>{traduccion("titulos", "juegoDiario")}</Titulo>
                <div className='p-1 border border-principal sm:mx-[10%]'>
                    TARJETA JUEGO<br/>
                    TARJETA JUEGO<br/>
                    TARJETA JUEGO<br/>
                    TARJETA JUEGO<br/>
                    TARJETA JUEGO<br/>
                </div>
            </div>
            <div className='sm:flex m-auto justify-between gap-10 mb-5'>
                <div className='w-full'>
                    <Titulo magnitud={3}>{traduccion("titulos", "juegosDestacados")}</Titulo>
                    <div className='p-1 border border-principal'>
                        TARJETAS JUEGOS<br/>
                        TARJETAS JUEGOS<br/>
                        TARJETAS JUEGOS<br/>
                        TARJETAS JUEGOS<br/>
                        
                    </div>
                </div>
                <div className='w-full'>
                    <Titulo magnitud={3}>{traduccion("titulos", "forosDestacados")}</Titulo>
                    <div className='p-1 border border-principal w-full'>
                        TARJETAS FOROS<br/>
                        TARJETAS FOROS<br/>
                        TARJETAS FOROS<br/>
                        TARJETAS FOROS<br/>
                        TARJETAS FOROS<br/>
                        TARJETAS FOROS<br/>
                        
                    </div>
                </div>
            </div>
            <hr />
            <div className='p-5'>
                <div className='p-1 border border-principal'>
                    TARJETA JUEGO MUCHOS<br/>
                    TARJETA JUEGO MUCHOS<br/>
                    TARJETA JUEGO MUCHOS<br/>
                    TARJETA JUEGO MUCHOS<br/>
                    TARJETA JUEGO MUCHOS<br/>
                    TARJETA JUEGO MUCHOS<br/>
                </div>
            </div>
        </div>
    )
}

export default Inicio;