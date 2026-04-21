import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los comentarios
 * @returns funciones
 */
const useApiComentarios = () => {

    /**
     * Dentro de la plataforma los comentarios son un tipo de objeto muy volatil, dinamico y rapido, lo que quiere decir que se manejaran en grandes volumenes de manera rapida
     * Por eso, al contrario que con el resto de objetos, se tratan como objetos de este tipo lo cual implica prescindir de algunas comodidades de usuario en favor al rendimiento
     * La justificacion de este tradeoff es que el hecho de que los comentarios carguen y se publiquen rapidamente y sin errores es mas importante que, por ejemplo aumente el numero en la interfaz inmediatamente al responder a uno
     * Tanto en el backend como en el frontend los comentarios estan diseñados para funcionar a la maxima velocidad a costa de detalles como estos, en terminos de disegno implementar este tipo de detalles sin perjudicar al rendimiento seria muy dificil.
     */


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
            const resultado = await peticionGenerica(API_URL + `/comment/like`, "POST", {id: id, amount: cantidad});
            return resultado.ok ? resultado?.data : false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Hacer un comentario, a un juego, foro o incluso respuesta a otro comentario
     * @param objetivo id del objeto a comentar
     * @param texto contenido del comentario
     * @returns si va todo bien, el comentario
     */
    const hacerComentario = async (objetivo:string, texto: string):Promise<Record<string, any>|null> => {
        try {
            if (objetivo.startsWith("game_")) {
                const resultado = await peticionGenerica(API_URL + `/comment/game/${objetivo.replaceAll("game_", "")}`, "POST", {content: texto});
                return resultado.ok ? resultado?.data?.comment : null;
            } else if (objetivo.startsWith("comment_")) {
                const resultado = await peticionGenerica(API_URL + `/comment/comment/${objetivo.replaceAll("comment_", "")}`, "POST", {content: texto});
                return resultado.ok ? resultado?.data?.comment : null;
            } else if (objetivo.startsWith("forum_")) {
                return {}
            } else {
                return null
            }
        } catch (error) {
            return null;
        }
    }

    /**
     * Envia un reporte sobre un objeto
     * Realmente no es un comentario, pero por su similitud esta en el mismo hook
     * @param idObjeto objeto a reportar
     * @param tipoObjeto tipo del objeto a reportar
     * @param texto info del reporte
     * @returns true si ha ido todo bien
     */
    const enviarReporte = async (idObjeto: string, tipoObjeto: string, texto: string):Promise<boolean> => {
        try {
            const resultado = await peticionGenerica(API_URL + `${usuario ? '' : '/anonymous'}/report/${idObjeto}`, "POST", {type: tipoObjeto, text: texto});
            return resultado.ok ? true : false;
        } catch (error) {
            return false;
        }
    }

    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, enviarReporte, hacerComentario, peticionGenerica, resetEstados, verComentarios, borrarComentario, likeComentario };
};

export default useApiComentarios;