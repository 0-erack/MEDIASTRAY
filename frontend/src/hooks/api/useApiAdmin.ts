import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los juegos
 * @returns funciones
 */
const useApiAdmin = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean | Record<string, any>>(false);
    const { API_URL, API_KEY } = useAjustes();
    const { usuario, tokenSesionActual } = useSesion();

    /**
     * Funcion de peticion generica usando los tokens necesarios
     * @param url a donde hacer la peticion
     * @param verbo que metodo http tendra
     * @param body el body en formato json
     * @param headersExtra nuevos headers ademas de los que ya se agnaden por defecto
     * @returns resultado de la peticion, normalmente estara en resultado.data, este objeto tambien devuelve el codigo http resultante, o algun mensaje para dar contexto
     */
    const peticionGenerica = async (url: string, verbo = "GET", body?: Record<string, any>, headersExtra: Record<string, any> = {}): Promise<any> => {
        await setCargando(true);
        await setError(false);
        try {
            const resultado = await peticionBasica(url, { ...headersExtra, "X-auth-api": API_KEY, "X-auth-session": tokenSesionActual ?? '', }, verbo, body ?? undefined, tokenSesionActual ?? '');
            if (!resultado.ok || resultado.code >= 400) throw { fallo: true, code: resultado.code ?? '', message: "Error api", result: resultado }
            return resultado;
        } catch (error) {
            setError({ fallo: true, error });
            throw error;
        } finally {
            setCargando(false);
        }
    }

    


    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, peticionGenerica, resetEstados };
};

export default useApiAdmin;