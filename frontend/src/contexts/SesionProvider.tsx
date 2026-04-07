import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useAjustes from "../hooks/useAjustes";
import useLocalStorage from "../hooks/useLocalStorage";
import { peticionBasica } from "../libraries/peticiones";
import { Usuario } from "../types/Usuario";
import { deApiAUsuario, validarUsuarioLocal } from "../validators/validacionesUsuario";

interface SesionContextType {
    usuario: Partial<Usuario> | null | boolean;
    tokenSesionActual: string | null;
    cambiarUsuarioActual: (usuario: Partial<Usuario>) => Promise<boolean>;
    logout: (conPeticion?: boolean) => Promise<void>;
    cambiarTokenSesionActual: (token: string) => Promise<boolean>;
    fallo: any;
    esAdmin: boolean;
    bloqueado: boolean;
    premium: boolean;
    actualizarEstadoPremium: (id:string, token:string)=> Promise<void>;
}

export const SesionContext = createContext<SesionContextType | null>(null);

/**
 * Contexto para los datos relacionados con los usuarios
 * @param children
 */
export const SesionProvider = ({ children }: { children: ReactNode }) => {

    const [tokenSesionActual, setTokenSesionActual] = useState<string | null>(""); //Token de sesion que se usara en las peticiones
    const [usuarioActual, setUsuarioActual] = useState<Partial<Usuario> | null | boolean>(null); //Objeto con el usuario actual, o null si no hay
    const { leerLS, guardarLS, borrarLS } = useLocalStorage();
    const [fallo, setFallo] = useState<any>(false);
    const { API_KEY, API_URL } = useAjustes();
    const [esAdmin, setEsAdmin] = useState<boolean>(false); //Guarda si el usuario actual es admin
    const [bloqueado, setBloqueado] = useState<boolean>(false); //Guarda si el usuario actual tiene un bloqueo
    const [premium, setPremium] = useState<boolean>(false); //Guarda si el usuario actual es premium

    const inicio = useCallback(async () => {
        try {
            const tokenFromLS: string | null = await leerLS("tokenSesionActual");
            setTokenSesionActual(tokenFromLS ?? '');
            if (tokenFromLS) {
                const sesionValida = await peticionBasica(API_URL + "/auth/sessionToken", {
                    "X-auth-api": API_KEY,
                    "X-auth-session": tokenFromLS ?? ''
                }, "GET", undefined, tokenFromLS + "");
                if (!sesionValida.ok) {
                    await logout(true);
                    window.location.reload();
                    return;
                }
                //Sesion es valida al recargar la pagina
                const datosUsuario = await peticionBasica(API_URL + "/user/me", {"X-auth-api": API_KEY,"X-auth-session": tokenFromLS ?? ''}, "GET", undefined, tokenFromLS + "");
                if (!datosUsuario?.data?.id) {
                    await logout();
                    return;
                }
                setEsAdmin(false); //TODO: 
                setBloqueado(false);
                await actualizarEstadoPremium(datosUsuario.data.id, tokenFromLS);
                const resultado = await cambiarUsuarioActual(deApiAUsuario(datosUsuario.data));
                if (!resultado) {
                    await logout(true);
                    return;
                }

            } else {
                await logout();
                //lanzarMensaje(useIdioma("errores", "sesionExpirada"), 2);
                return;
            }
        } catch (e) {
            await logout();
            //lanzarMensaje(useIdioma("errores", "genericoSesion"), 2);
        }
    }, []);

    const logout = useCallback(async (conPeticion = false) => {
        await borrarLS("tokenSesionActual");
        setUsuarioActual(false);
        setTokenSesionActual(null);
        setEsAdmin(false);
        setBloqueado(false);
        setFallo(false);
        setPremium(false);
        if (conPeticion) await peticionBasica(API_URL + "/user/logout", {"X-auth-api": API_KEY,"X-auth-session": tokenSesionActual ?? ''}, "DELETE", undefined, tokenSesionActual + "");
    }, []);

    const cambiarUsuarioActual = useCallback(async (usuario: Partial<Usuario>) => {
        if (validarUsuarioLocal(usuario)) {
            setUsuarioActual(usuario);
            return true;
        } else {
            setFallo({ error: true, code: "user-non-validable" });
            return false;
        }
    }, []);

    const actualizarEstadoPremium = useCallback(async (id: string, token: string) => {
        const datosPremium = await peticionBasica(API_URL + "/user/premium/" + id, {"X-auth-api": API_KEY,"X-auth-session": token ?? ''}, "GET", undefined, token + "");
        setPremium(datosPremium?.data?.active ? true : false);
    }, []);

    const cambiarTokenSesionActual = useCallback(async (token: string) => {
        if (token) {
            setTokenSesionActual(token);
            await guardarLS("tokenSesionActual", token);
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        inicio();
    }, []);

    const exportaciones = useMemo(() => ({actualizarEstadoPremium, premium, usuario: usuarioActual, tokenSesionActual, logout, cambiarUsuarioActual, cambiarTokenSesionActual, fallo, esAdmin, bloqueado}), 
        [usuarioActual, tokenSesionActual, fallo, esAdmin, bloqueado, premium, logout, cambiarUsuarioActual, actualizarEstadoPremium, cambiarTokenSesionActual]);

    return (
        <SesionContext.Provider value={exportaciones}>
            {((usuarioActual && typeof usuarioActual === 'object' && 'id' in usuarioActual) || usuarioActual === false) && (<>
                {children}
                {/*JSON.stringify(usuarioActual)*/}{/*JSON.stringify(premium)*/}
            </>)}
        </SesionContext.Provider>
    );
};
