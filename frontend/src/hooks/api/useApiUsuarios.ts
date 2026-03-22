import { useState } from "react";
import { limpiarVaciosStrings, peticionBasica } from "../../libraries/peticiones";
import { deApiAUsuario, deUsuarioAApi } from "../../validators/validacionesUsuario";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

/**
 * Hook para las peticiones a la api en relacion a los usuarios
 * @returns funciones
 */
const useApiUsuarios = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean|object>(false);
    const { API_URL, API_KEY } = useAjustes();
    const { cambiarTokenSesionActual, cambiarUsuarioActual, logout, tokenSesionActual, usuario, actualizarEstadoPremium } = useSesion();

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
     * Inicia sesion en la aplicacion usando el endpoint, tambien actualiza los valores actuales de usuario y token
     * @param objetoLogin objeto con los datos del formulario de iniciar sesion
     * @returns resultado para saber si es correcto
     */
    const login = async (objetoLogin:Record<string, any>):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/login", "POST", {credentials: { password: objetoLogin.contrasegna, identification: objetoLogin.identificacion}});
            if (resultado.ok) {
                cambiarTokenSesionActual(resultado.data.sessionToken);
                cambiarUsuarioActual(deApiAUsuario(resultado.data.user));
                await actualizarEstadoPremium(resultado.data.user.id, resultado.data.sessionToken);
            }
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Crear un nuevo usuario y iniciar sesion con este
     * @param objetoRegister datos del formulario de registro
     * @returns resultado con la peticion, con los datos del usuario creado y el token
     */
    const register = async (objetoRegister:Record<string, any>):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/create", "POST", { user: { ...(deUsuarioAApi(objetoRegister)), birthdate: Date.parse(objetoRegister?.cumpleagnos) + "" } });
            if (resultado.ok) {
                cambiarTokenSesionActual(resultado.data.sessionToken);
                cambiarUsuarioActual(deApiAUsuario(resultado.data.user));
                await actualizarEstadoPremium(resultado.data.user.id, resultado.data.sessionToken);
            }
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Devuelve los datos publicos de un usuario
     * @param id usuario a consultar
     * @returns datos del usuario
     */
    const verUsuario = async (id:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/" + (id ?? ''), "GET");
            if (resultado.ok) return deApiAUsuario(resultado.data);
            return null;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Comprueba si un usuario sigue a otro, en caso de duda (o que dicha informacion sea privada), constara como que no lo sigue o que el usuario no existe
     * @param id1 usuario que sigue
     * @param id2 usuario seguido
     * @returns datos de la consulta (normalmente booleano en caso de que no haya un error)
     */
    const verSeguir = async (id1:string, id2:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/follow/${id1}/${id2}`, "GET");
            return resultado.data ?? false;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Sigue a un usuario con el usuario actual
     * @param id usuario a seguir
     * @param cantidad -1 = dejar de seguir, 0 = consultar estado actual, 1 = seguir
     * @returns resultado de la peticion
     */
    const seguir = async (id:string, cantidad:number):Promise<any> => {
        try {
            let cantidadCorrecta = cantidad;
            if (cantidadCorrecta > 1) cantidadCorrecta = 1;
            if (cantidadCorrecta < -1) cantidadCorrecta = -1;
            await peticionGenerica(API_URL + `/user/follow/`, "POST", {"id_b": id, "cantidad": cantidadCorrecta});
            return true;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Edita el usuario actual, lo que tambien provoca un nuevo inicio de sesion y cambio de token
     * @param datosNuevos datos del formulario de edicion, los datos que no esten presentes no cambiaran (algunos son obligatorios para cambiar otros, mejor explicado en el backend)
     * @returns datos de la peticion, con el usuario con los datos actualizados
     */
    const editarUsuario = async (datosNuevos:Record<string, any>):Promise<any> => {
        try {
            datosNuevos = limpiarVaciosStrings(datosNuevos);
            const objetoEdicion = {...(deUsuarioAApi(datosNuevos)), birthdate: Date.parse(datosNuevos?.cumpleagnos) + "", changePassword: datosNuevos.contrasegna?.length ? true : false, oldPassword: datosNuevos.contrasegnaAntigua?.length ? datosNuevos.contrasegnaAntigua : undefined}
            const resultado = await peticionGenerica(API_URL + "/user/edit", "PATCH", { newData: objetoEdicion });
            cambiarTokenSesionActual(resultado.sessionToken);
            cambiarUsuarioActual(deApiAUsuario(resultado.data.user));
            await actualizarEstadoPremium(resultado.data.user.id, resultado.data.sessionToken);
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Borra el usuario actual
     * @param contrasegna paso extra para seguridad
     * @returns resultado de la peticion
     */
    const borrarUsuario = async (contrasegna:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user", "DELETE", {password: contrasegna});
            await logout(true);
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    /**
     * Consultar si un usuario es premium
     * @param id usuario a consultar
     * @returns true si lo es, false si no o si hay dudas
     */
    const verPremium = async (id:string):Promise<boolean> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/premium/${id}`, "GET");
            return resultado?.data ?? false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Buscar usuarios en base a un texto
     * @param consulta texto de busqueda
     * @param pagina pagina en la que buscar
     * @param orden tipo de orden, 0 = relevancia, 1 = alfabeticamente, 2 = aleatorio
     * @returns datos del resultado, con el array de usuarios encontrados
     */
    const buscar = async (consulta:string, pagina = 0, orden = 0):Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/search/${consulta}?page=${pagina}&order=${orden}`, "GET");
            return resultado?.data?.results?.map((e: Record<string,any>) => deApiAUsuario(e)) ?? [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Ver los seguidos/seguidores de un usuario
     * @param seguidores true para ver los seguidores, false para los seguidos
     * @param id usuario a consultar
     * @param pagina en que pagina se busca
     * @returns array con los nickname y los id de los usuarios
     */
    const verSeguimientos = async (seguidores: boolean, id: string, pagina = 0):Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/follow/${seguidores ? 'followersList' : 'followingsList'}/${id}?page=${pagina}`, "GET");
            return resultado?.data?.results ?? [];
        } catch (error) {
            return [];
        }
    }

    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, peticionGenerica, verSeguimientos, login, buscar, register, verUsuario, resetEstados, verSeguir, seguir, borrarUsuario, editarUsuario, verPremium };
};

export default useApiUsuarios;