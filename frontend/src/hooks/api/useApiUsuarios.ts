import { useState } from "react";
import useAjustes from "../useAjustes";
import { peticionBasica } from "../../libraries/peticiones";
import useSesion from "../useSesion";
import { deApiAUsuario, deUsuarioAApi } from "../../validators/validacionesUsuario";

const useApiUsuarios = () => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<boolean|object>(false);
    const { API_URL, API_KEY } = useAjustes();
    const { cambiarTokenSesionActual, cambiarUsuarioActual, logout, tokenSesionActual, usuario } = useSesion();

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

    const login = async (objetoLogin:Record<string, any>):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/login", "POST", {credentials: { password: objetoLogin.contrasegna, identification: objetoLogin.identificacion}});
            if (resultado.ok) {
                cambiarTokenSesionActual(resultado.data.sessionToken);
                cambiarUsuarioActual(deApiAUsuario(resultado.data.user));
            }
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const register = async (objetoRegister:Record<string, any>):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/create", "POST", { user: { ...(deUsuarioAApi(objetoRegister)), birthdate: Date.parse(objetoRegister?.cumpleagnos) + "" } });
            if (resultado.ok) {
                cambiarTokenSesionActual(resultado.data.sessionToken);
                cambiarUsuarioActual(deApiAUsuario(resultado.data.user));
            }
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const verUsuario = async (id:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user/" + (id ?? ''), "GET");
            if (resultado.ok) return deApiAUsuario(resultado.data);
            return null;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const verSeguir = async (id1:string, id2:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/userFollow/${id1}/${id2}`, "GET");
            return resultado.data ?? false;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const seguir = async (id:string, cantidad:number):Promise<any> => {
        try {
            let cantidadCorrecta = cantidad;
            if (cantidadCorrecta > 1) cantidadCorrecta = 1;
            if (cantidadCorrecta < -1) cantidadCorrecta = -1;
            await peticionGenerica(API_URL + `/userFollow/`, "POST", {"id_b": id, "cantidad": cantidadCorrecta});
            return true;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const editarUsuario = async (datosNuevos:Record<string, any>):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/userEdit", "PATCH", { newData: {...datosNuevos, cumpleagnos: Date.parse(datosNuevos?.cumpleagnos) + "", correoEliminar: undefined, contrasegnaEliminar: undefined} });
            cambiarTokenSesionActual(resultado.sessionToken);
            cambiarUsuarioActual(resultado.user);
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const borrarUsuario = async (contrasegna:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/userDelete", "DELETE", {contrasegna});
            await logout();
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const resetEstados = () => {
        setCargando(false);
        setError(false)
    }

    return { cargando, error, peticionGenerica, login, register, verUsuario, resetEstados, verSeguir, seguir, borrarUsuario, editarUsuario };
};

export default useApiUsuarios;