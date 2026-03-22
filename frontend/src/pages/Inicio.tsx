/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import img from '../assets/react.svg';
import useAjustes from '../hooks/useAjustes';
import useMensajes from '../hooks/useMensajes';
import { cambiarTitulo } from '../libraries/accionesIndex';

/**
 * Pagina de inicio
 */
function Inicio() {

    const { lanzarMensaje } = useMensajes();
    const [count, setCount] = useState(0);
    const { API_URL, PUBLIC_URL/*, API_KEY*/ } = useAjustes();

    useEffect(() => {
        cambiarTitulo("MEDIASTRAY");
        //console.log(API_URL);
        (async () => {
            let datos = await fetch(API_URL + "/prueba");
            datos = await datos.json();
            //console.log(await datos);
        })();
    }, []);

    return (
        <>
            <h2>quess</h2>
            <img src={PUBLIC_URL + "/2Q2.png"} alt="la imagen no va" />
            <Link to={"/info"}>info</Link>
            <h1>Vite + React</h1>
            <img src={img} alt="no va" />
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <button onClick={()=>{
                lanzarMensaje("hola" + Math.random(), 0);
                lanzarMensaje("hola" + Math.random(), 1);
                lanzarMensaje("hola" + Math.random(), 2);
                lanzarMensaje("hola" + Math.random(), 3);
                lanzarMensaje("hola" + Math.random(), 4);
                }}>si</button>
        </>
    )
}

export default Inicio;