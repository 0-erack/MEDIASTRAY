import { useState } from "react";
import { limpiarVaciosStrings, peticionBasica } from "../../libraries/peticiones";
import { deApiAUsuario, deUsuarioAApi } from "../../validators/validacionesUsuario";
import useAjustes from "../useAjustes";
import useSesion from "../useSesion";

const useApiUsuarios = () => {
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
            const resultado = await peticionGenerica(API_URL + `/user/follow/${id1}/${id2}`, "GET");
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
            await peticionGenerica(API_URL + `/user/follow/`, "POST", {"id_b": id, "cantidad": cantidadCorrecta});
            return true;
        } catch (error) {
            return {fallo: true, error}
        }
    }

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

    const borrarUsuario = async (contrasegna:string):Promise<any> => {
        try {
            const resultado = await peticionGenerica(API_URL + "/user", "DELETE", {password: contrasegna});
            await logout(true);
            return resultado;
        } catch (error) {
            return {fallo: true, error}
        }
    }

    const verPremium = async (id:string):Promise<boolean> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/premium/${id}`, "GET");
            return resultado?.data ?? false;
        } catch (error) {
            return false;
        }
    }

    const buscar = async (consulta:string, pagina = 0, orden = 0):Promise<Array<Record<string, any>>> => {
        try {
            const resultado = await peticionGenerica(API_URL + `/user/search/${consulta}?page=${pagina}&order=${orden}`, "GET");
            return resultado?.data?.results?.map((e: Record<string,any>) => deApiAUsuario(e)) ?? [];
        } catch (error) {
            return [];
        }
    }

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