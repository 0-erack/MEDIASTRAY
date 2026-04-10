import { useCallback, useEffect, useState } from "react";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useIdioma from "../../hooks/useIdioma";
import useJuegos from "../../hooks/useJuegos";
import useSesion from "../../hooks/useSesion";
import { esMayorEdad } from "../../libraries/extraFechas";
import { Juego } from "../../types/Juego";
import CajaError from "../Elements/CajaError";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import ImgCargando from "../Principal/ImgCargando";
import TarjetaJuegoGrande from "./TarjetaJuegoGrande";

interface VerJuegoCompletoProps {
    id: string;
}

/**
 * Componente para cargar los datos de un juego a partir de un id
 * @param id del juego
 */
const VerJuegoCompleto = ({ id }: VerJuegoCompletoProps) => {

    const { usuario } = useSesion();
    const [juegoCargado, setJuegoCargado] = useState<Partial<Juego> | null>(null);
    const [esMio, setEsMio] = useState(false);
    const [fallo, setFallo] = useState(false);
    const traduccion = useIdioma();
    const { agregarJuegoLocal, misJuegos } = useJuegos();
    const { verJuego, cargando, error } = useApiJuegos();
    const errorNoEdad = useCallback(() => (<div className="text-center">{" +" + juegoCargado!.edad} <CajaError nombre="edadInsuficiente" /> <EnlaceFuncion titulo={traduccion("botones", "irInicio")} funcion="/" /></div>), [juegoCargado, traduccion]);

    const cargaInicial = async () => {
        setEsMio(false);
        if (!id) {
            setFallo(true);
        } else {
            if (usuario) {
                const juegoCache = misJuegos.filter((e) => e.id === id);
                if (juegoCache?.length) {
                    setJuegoCargado(juegoCache[0]);
                    setEsMio(true);
                    return;
                }
            }
            const resultado = await verJuego(id);
            if (!resultado?.id) {
                setFallo(true);
                return;
            }
            if (usuario && typeof usuario === 'object' && 'id' in usuario && resultado.idCreador === usuario.id) {
                setEsMio(true);
                agregarJuegoLocal(resultado);
            }
            setJuegoCargado(resultado);
        }
    }
    useEffect(() => {
        cargaInicial();
    }, [id]);

    return (
        <>
            {id ? (<div>
                {(fallo || error) ? (<div className="text-center">
                    <CajaError nombre="juegoNoEncontrado" />
                    <EnlaceFuncion titulo={traduccion("botones", "irInicio")} funcion="/" />
                </div>) : (<div>
                    {(juegoCargado && !cargando) ? (<div className="ver-juego">

                        {(usuario && typeof usuario === "object" && "cumpleagnos" in usuario) ? 
                            (juegoCargado.edad ? 
                                (esMayorEdad(usuario?.cumpleagnos as string, juegoCargado.edad ?? 0) ? 
                                    (<TarjetaJuegoGrande juego={juegoCargado} esMio={esMio} />) 
                                    : (errorNoEdad())) 
                                : (<TarjetaJuegoGrande juego={juegoCargado} esMio={esMio} />)) 
                            : (juegoCargado.edad 
                                ? (errorNoEdad()) 
                                : (<TarjetaJuegoGrande juego={juegoCargado} esMio={esMio} />))}

                    </div>) : (<ImgCargando />)}
                </div>)}
            </div>) : (<CajaError nombre="juegoNoEncontrado" />)}
        </>
    )
}

export default VerJuegoCompleto;