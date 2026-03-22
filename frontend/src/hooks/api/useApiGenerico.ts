import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para peticiones que no entren en ninguna categoria
 * @returns funciones
 */
const useApiGenerico = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean|object>(false);
    const { API_URL, API_KEY } = useAjustes();
    const { cambiarTokenSesionActual, cambiarUsuarioActual, logout, tokenSesionActual, usuario, actualizarEstadoPremium } = useSesion();

    const peticionGenerica = async (url:string, verbo = "GET", body?:Record<string, any>, headersExtra:Record<string, any> = {}):Promise<any> => {
        await setCargando(true);
        await setError(false);
        try {
            const resultado = await peticionBasica(url, {...headersExtra, "X-auth-api": API_KEY, "X-auth-session": tokenSesionActual ?? '', }, verbo, body ?? undefined, tokenSesionActual ?? '');
            if (!resultado.ok || resultado.code >= 400) throw {fallo: true, code: resultado.code ?? '', message: "Error api", result: resultado}
            return resultado;
        } catch (error) {
            setError({fallo: true, error});
            throw error;
        } finally {
            setCargando(false);
        }
    }

    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, resetEstados };
};

export default useApiGenerico;