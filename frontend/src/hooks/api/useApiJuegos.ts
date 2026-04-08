import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import { deApiAJuego } from "../../validators/validacionesJuego";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los juegos
 * @returns funciones
 */
const useApiJuegos = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean|object>(false);
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

    /**
     * Devuelve un juego, el comportamiento en el backend podria variar dependiendo si el usuario tiene sesion o no
     * @param id juego a buscar
     * @returns el juego en si o null
     */
    const verJuego = async (id: string): Promise<Record<string, any> | null> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/game/" + (usuario ? 'personal/' : '') + (id ?? ''), "GET");
            if (resultado.ok) return deApiAJuego(resultado.data);
            return null;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Devuelve todos los juegos del usuario activo
     * @returns array de juegos
     */
    const verTodosMisJuegos = async (): Promise<Array<Record<string, any>>> => {
        try {
            if (!usuario) return [];
            const resultado = await peticionGenerica(API_URL + "/game/my?all=true", "GET");
            if (resultado.ok) return resultado.data.games.map(deApiAJuego);
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Comprueba si se esta siguiendo un juego
     * @param id juego a consultar
     * @returns true si se sigue
     */
    const verSiguiendoJuego = async (id: string): Promise<boolean> => {
        try {
            if (!usuario) return false;
            const resultado = await peticionGenerica(API_URL + "/game/follow/" + id, "GET");
            if (resultado.ok) return resultado.data ? true : false;
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Sigue o deja de seguir un juego
     * @param id juego a seguir/no seguir
     * @param cantidad -1 para dejar de seguir, 1 para seguir
     * @returns true si todo ha ido bien
     */
    const seguirJuego = async (id: string, cantidad: number): Promise<boolean> => {
        try {
            if (!usuario) return false;
            let cantidadCorrecta = cantidad;
            if (cantidadCorrecta > 1) cantidadCorrecta = 1;
            if (cantidadCorrecta < -1) cantidadCorrecta = -1;
            const resultado = await peticionGenerica(API_URL + "/game/follow", "POST", {id, quantity: cantidadCorrecta});
            if (resultado.ok) return true;
            return false;
        } catch (error) {
            return false;
        }
    }



    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, peticionGenerica, resetEstados, verJuego, verTodosMisJuegos, verSiguiendoJuego, seguirJuego };
};

export default useApiJuegos;