import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los comentarios
 * @returns funciones
 */
const useApiComentarios = () => {
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
     * Ver los comentarios de algun objeto
     * @param id el objeto
     * @param tipo tipo de objeto (comment, game, forum)
     * @param modo 0 = un solo comentario por su id, 1 = comentarios referentes a x objetivo, 2 = comentarios de un usuario
     * @param pagina pagina en la que ver los comentarios
     * @param subPagina pagina en la que ver las respuestas
     * @returns array de comentarios
     */
    const verComentarios = async (id:string, tipo: string, modo = 1, pagina = 0, subPagina = 0):Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/comment${usuario ? '/personal' : ''}/${modo}/${tipo}_${id}?page=${pagina}&pageSub=${subPagina}`, "GET");
            return resultado?.data?.comments ?? [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Borrar un comentario y sus respuestas
     * @param id el comentario a borrar
     * @returns true si ha ido todo bien
     */
    const borrarComentario = async (id:string):Promise<boolean> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/comment/delete/${id}`, "DELETE");
            return resultado.ok ? true : false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Da like a un comentario o mira su estado
     * @param id comentario a dar like
     * @param cantidad -1 quitar like, 0 mirar, 1 poner like
     * @returns true si todo ha ido bien o si es la info que devuelve la api
     */
    const likeComentario = async (id:string, cantidad = 0):Promise<boolean> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/comment/like`, "POST", {id: id, quantity: cantidad});
            return resultado.ok ? resultado?.data : false;
        } catch (error) {
            return false;
        }
    }

    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, peticionGenerica, resetEstados, verComentarios, borrarComentario, likeComentario };
};

export default useApiComentarios;