import { useState } from "react";
import { peticionBasica } from "../../libraries/peticiones";
import { Juego } from "../../types/Juego";
import { deApiAJuego, deJuegoAApi } from "../../validators/validacionesJuego";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los juegos
 * @returns funciones
 */
const useApiJuegos = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean/*|object*/ | Record<string, any>>(false);
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
            return { fallo: true, error }
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
            const resultado = await peticionGenerica(API_URL + "/game/follow", "POST", { id, amount: cantidadCorrecta });
            if (resultado.ok) return true;
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Crear un juego nuevo que sea del usuario actual
     * @param juego datos del juego nuevo
     * @returns juego nuevo devuelto por la api, o null
     */
    const crearJuego = async (juego: Partial<Juego>): Promise<Partial<Juego> | null> => {
        try {
            if (!usuario) return null;
            const resultado = await peticionGenerica(API_URL + "/game/create", "POST", { game: deJuegoAApi(juego) });
            if (!resultado.ok) return null;
            return deApiAJuego(resultado.data.game);
        } catch (error) {
            return null;
        }
    }

    /**
     * Edita un juego existente que sea del usuario actual
     * @param id juego a editar
     * @param juego datos nuevos del juego
     * @returns juego nuevo devuelto por la api, o null
     */
    const editarJuego = async (id: string, juego: Partial<Juego>): Promise<Partial<Juego> | null> => {
        try {
            if (!usuario || !id) return null;
            const resultado = await peticionGenerica(API_URL + "/game/edit/" + id, "PATCH", { newData: deJuegoAApi(juego) });
            if (!resultado.ok) return null;
            return deApiAJuego(resultado.data.game);
        } catch (error) {
            return null;
        }
    }

    /**
     * Borra un juego existente que sea del usuario actual
     * @param id juego a borrar
     * @param contrasegna paso adicional de seguridad
     * @returns true si todo ha ido bien
     */
    const borrarJuego = async (id: string, contrasegna: string): Promise<boolean> => {
        try {
            if (!usuario || !id) return false;
            const resultado = await peticionGenerica(API_URL + "/game/delete/" + id, "DELETE", { password: contrasegna });
            if (resultado.ok) return true;
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Cambia el atributo publico de un juego
     * @param id juego a cambiar
     * @param estado como deberia acabar
     * @returns true si todo ha ido bien
     */
    const editarPublicoJuego = async (id: string, estado: boolean): Promise<boolean> => {
        try {
            if (!usuario || !id) return false;
            const resultado = await peticionGenerica(API_URL + "/game/index/" + id, "PATCH", { state: estado });
            if (resultado.ok) return true;
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Cambia las adiciones de un juego (borrando las que ya habian, metodo put)
     * @param id juego a cambiar
     * @param adiciones nuevas
     * @returns las nuevas adiciones si todo ha ido bien
     */
    const establecerAdiciones = async (id: string, adiciones: Array<Record<string, any>>): Promise<Array<Record<string, any>> | null> => {
        try {
            if (!usuario || !id) return null;
            const resultado = await peticionGenerica(API_URL + "/game/additions/" + id, "PUT", { additions: adiciones });
            if (resultado.ok) return resultado.data.current;
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Busca los juegos de un usuario
     * @param id usuario a consultar
     * @param pagina en que pagina buscar (de 50 en 50)
     * @returns los juegos en formato miniatura
     */
    const buscarJuegosUsuario = async (id: string, pagina = 0): Promise<Array<Partial<Juego>> | null> => {
        try {
            if (!id) return null;
            const resultado = await peticionGenerica(API_URL + `/user/games/${id}?page=${pagina ?? '0'}`, "GET");
            if (resultado.ok) return resultado.data.games.map(deApiAJuego);
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Busca los juegos que sigue el usuario
     * @param pagina en que pagina buscar (de 50 en 50)
     * @returns los juegos en formato miniatura
     */
    const buscarJuegosSeguidos = async (pagina = 0): Promise<Array<Partial<Juego>>> => {
        try {
            if (!usuario) return [];
            const resultado = await peticionGenerica(API_URL + `/game/followed?page=${pagina}`, "GET");
            if (resultado.ok) return resultado.data.map(deApiAJuego);
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Busca los juegos a partir de un texto
     * @param busqueda texto de busqueda
     * @param pagina en la cual buscar
     * @param order tipo de orden, definido por el backend
     * @returns los juegos en formato miniatura
     */
    const buscar = async (busqueda: string, pagina = 0, order = 0): Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/game/search/${busqueda}?page=${pagina}&order=${order}`, "GET");
            if (resultado.ok) return resultado.data.results.map(deApiAJuego);
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Busca el juego semanal o diario actual
     * @param semanal true para ver el semanal y no el diario
     * @returns el juego en formato miniatura
     */
    const verJuegoTemporal = async (semanal = false): Promise<Partial<Juego> | null> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/game/${semanal ? 'weekly' : 'daily'}`, "GET");
            if (resultado.ok) return deApiAJuego(resultado.data.game);
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Busca los juegos destacados en x pagina
     * @param pagina en que pagina buscar (de 50 en 50)
     * @returns los juegos en formato miniatura
     */
    const verJuegosDestacados = async (pagina = 0): Promise<Array<Partial<Juego>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/game/featured?page=${pagina}`, "GET");
            if (resultado.ok) return resultado.data.games.map(deApiAJuego);
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Busca los archivos de un juego
     * @param id juego a consultar
     * @returns la informacion de los archivos del juego
     */
    const verArchivos = async (id: string): Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/gameFile/${usuario ? 'personal/' : ''}${id}`, "GET");
            if (resultado.ok) return resultado.data.files;
            return [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Elimina un archivo de un juego
     * @param id juego a consultar
     * @param nombre que archivo eliminar
     * @returns true si ha ido todo bien
     */
    const eliminarArchivo = async (id: string, nombre: string): Promise<boolean> => {
        try {
            if (!usuario) return false;
            const resultado = await peticionGenerica(API_URL + `/gameFile`, "DELETE", { id: id, name: nombre });
            if (resultado.ok) return true;
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Sube un archivo de juego al servidor (esta ya no envia json asi que es distinta)
     * @param id que juego subir el archivo
     * @param nombre como se llamara el archivo
     * @param archivo blob en si
     * @returns true si ha ido todo bien
     */
    const subirArchivo = async (id: string, nombre: string, archivo: any): Promise<boolean> => {
        if (!usuario) return false;

        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("name", nombre);
            const fileToUpload = archivo instanceof FileList ? archivo[0] : archivo;
            if (!fileToUpload) return false;
            formData.append("archivo", fileToUpload);
            const response = await fetch(`${API_URL}/gameFile`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-auth-session': tokenSesionActual ?? '',
                    'X-auth-api': API_KEY,
                    'Authorization': `Bearer ${tokenSesionActual ?? ''}`
                },
                body: formData,
            });
            if (!response.ok) return false;
            return true;
        } catch (error) {
            return false;
        }
    }


    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, subirArchivo, eliminarArchivo, verArchivos, verJuegosDestacados, verJuegoTemporal, buscar, editarPublicoJuego, buscarJuegosSeguidos, buscarJuegosUsuario, establecerAdiciones, crearJuego, borrarJuego, editarJuego, peticionGenerica, resetEstados, verJuego, verTodosMisJuegos, verSiguiendoJuego, seguirJuego };
};

export default useApiJuegos;