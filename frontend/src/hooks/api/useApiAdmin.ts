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
     * Las funciones de API aqui funcionan algo distinto porque estan disegnadas para ofrecer informacion mas tecnica al usuario que lo ve, que es un administrador.
     * Por ejemplo se espera que devuelva el codigo de error para mostrarlo en el frontend porque quien usa el panel de administracion es lo que se conoce como "power user".
     */

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

    /**
     * Borra un comentario y sus respuestas
     * @param id comentario a borrar
     * @returns respuesta de la API
     */
    const borrarComentairio = async (id:string):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/comment/${id}`, "DELETE");
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Aumenta o disminuye los strikes de un usuario
     * @param id usuario a cambiar
     * @param cantidad a cambiar
     * @returns respuesta de la API (y los strikes nuevos)
     */
    const cambiarStrikes = async (id:string, cantidad: number):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/strike`, "PATCH", {id, amount: cantidad});
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Mirar todos los datos de cualquier usuario
     * @param id usuario a mirar
     * @returns respuesta de la API (y datos del usuario)
     */
    const verUsuario = async (id:string):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/user/${id}`, "GET");
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Mirar todos los datos de cualquier juego
     * @param id usuario a mirar
     * @returns respuesta de la API (y datos del usuario)
     */
    const verJuego = async (id:string):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/game/${id}`, "GET");
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Cambia la visibilidad de cualquier juego
     * @param id usuario a mirar
     * @param visibilidad como va a quedar la visibilidad del juego
     * @returns respuesta de la API
     */
    const cambiarVisibilidadJuego = async (id:string, visibilidad = false):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/alterIndexGame`, "PATCH", {id, new: visibilidad});
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Cambia el nivel publico de un usuario
     * @param id usuario a cambiar
     * @param nivel valor a establecer
     * @returns respuesta de la API (y datos del usuario)
     */
    const cambiarNivelPublicoUsuario = async (id:string, nivel: number):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/alterVisibility`, "PATCH", {id, new: nivel});
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Cambia el nivel de disponibilidad de un usuario
     * @param id usuario a cambiar
     * @param nivel valor a establecer
     * @returns respuesta de la API (y datos del usuario)
     */
    const cambiarNivelDisponibleUsuario = async (id:string, nivel: number):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/alterAvailability`, "PATCH", {id, new: nivel});
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Elimina cualquier juego
     * @param id juego a eliminar
     * @returns respuesta de la API
     */
    const borrarJuego = async (id:string):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/game/${id}`, "DELETE");
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Elimina un reporte
     * @param id reporte a eliminar
     * @returns respuesta de la API
     */
    const borrarReporte = async (id:string):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/reports/${id}`, "DELETE");
        } catch (error) {}
        return resultado ?? {ok: false};
    }

    /**
     * Buscar reportes activos
     * @param id con el que buscar
     * @param pagina en la que buscar
     * @returns respuesta de la API (y datos de los reportes)
     */
    const verReportes = async (id?:string, pagina = 0):Promise<Record<string, any>> => {
        let resultado;
        try {
            resultado = await peticionGenerica(API_URL + `/admin/reports?page=${pagina}${id ? ('&id=' + id) : ''}`, "GET");
        } catch (error) {}
        return resultado ?? {ok: false};
    }


    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, borrarReporte, verReportes, borrarJuego, cambiarNivelPublicoUsuario, cambiarNivelDisponibleUsuario, cambiarVisibilidadJuego, peticionGenerica, resetEstados, verJuego, verUsuario, cambiarStrikes, borrarComentairio };
};

export default useApiAdmin;