/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoC from '../assets/images/LogoC.png';
import BotonFuncion from '../components/Elements/BotonFuncion';
import Titulo from '../components/Elements/Titulo';
import FondoPortadaJuego from '../components/Juego/FondoPortadaJuego';
import ListaJuegosDestacados from '../components/Juego/ListaJuegosDestacados';
import TarjetaJuego from '../components/Juego/TarjetaJuego';
import useApiJuegos from '../hooks/api/useApiJuegos';
import useAjustes from '../hooks/useAjustes';
import useIdioma from '../hooks/useIdioma';
import useSesion from '../hooks/useSesion';
import { cambiarTitulo } from '../libraries/accionesIndex';
import { Juego } from '../types/Juego';

/**
 * Pagina de inicio
 */
function Inicio() {

    const { PUBLIC_URL } = useAjustes();
    const traduccion = useIdioma();
    const { usuario } = useSesion();
    const navegar = useNavigate();
    const { verJuegoTemporal } = useApiJuegos();
    const [juegoDiario, setJuegoDiario] = useState<Partial<Juego>|null>(null);
    const [juegoSemanal, setJuegoSemanal] = useState<Partial<Juego>|null>(null);

    const inicio = async () => {
        setJuegoDiario(await verJuegoTemporal() ?? null);
        setJuegoSemanal(await verJuegoTemporal(true) ?? null);
    }
    useEffect(() => {
        cambiarTitulo("MEDIASTRAY");
        /*(async () => {
            let datos = await fetch(API_URL + "/prueba");
            datos = await datos.json();
            //console.log(await datos);
        })();*/
        inicio();
    }, []);

    return (
        <div className='sm:p-10 p-2'>
            <FondoPortadaJuego url={PUBLIC_URL + "/fondoInicio.png"} />
            <div className='text-center'>
                <img className='relative z-10 sm:w-5xl w-lg m-auto' src={logoC ?? PUBLIC_URL + "/logoC.png"} alt="Logo" style={{ imageRendering: 'pixelated' }} />
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
                    {juegoDiario && (<TarjetaJuego juego={juegoDiario} mediano={true} />)}
                </div>
            </div>
            <div className='p-5'>
                <Titulo magnitud={3}>{traduccion("titulos", "juegoSemanal")}</Titulo>
                <div className='p-1 border border-principal sm:mx-[10%]'>
                    {juegoSemanal && (<TarjetaJuego juego={juegoSemanal} mediano={true} />)}
                </div>
            </div>
            <div className='sm:flex m-auto justify-between gap-10 mb-5 p-5'>
                

                
                <div className='w-full'>
                    <Titulo magnitud={3}>{traduccion("titulos", "forosDestacados")}</Titulo>
                    <div className='p-1 border border-principal w-full'>
                        <br/>
                        <p>W.I.P.</p>
                        <br/>
                    </div>
                </div>
            </div>
            <hr />
            <div className='p-5'>
                <Titulo>{traduccion("titulos", "juegosDestacados")}</Titulo>
                <div className='p-1 border-2 border-principal'>
                    <ListaJuegosDestacados infinito={true}/>
                </div>
            </div>
        </div>
    )
}

export default Inicio;