import { createContext, useState, ReactNode, useEffect } from "react";
import { Usuario } from "../types/Usuario";
import useLocalStorage from "../hooks/useLocalStorage";
import { peticionBasica } from "../libraries/peticiones";
import useAjustes from "../hooks/useAjustes";
import { deApiAUsuario, validarUsuarioLocal } from "../validators/validacionesUsuario";
import useMensajes from "../hooks/useMensajes";
import useIdioma from "../hooks/useIdioma";

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

export const SesionProvider = ({ children }: { children: ReactNode }) => {

    const [tokenSesionActual, setTokenSesionActual] = useState<string | null>("");
    const [usuarioActual, setUsuarioActual] = useState<Partial<Usuario> | null | boolean>(null);
    const { leerLS, guardarLS, borrarLS } = useLocalStorage();
    const [fallo, setFallo] = useState<any>(false);
    const { API_KEY, API_URL } = useAjustes();
    const { lanzarMensaje } = useMensajes();
    const [esAdmin, setEsAdmin] = useState<boolean>(false);
    const [bloqueado, setBloqueado] = useState<boolean>(false);
    const [premium, setPremium] = useState<boolean>(false);

    const inicio = async () => {
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
                return;
            }

        } catch (e) {
            await logout();
            lanzarMensaje(useIdioma("err", "genericoSesion"), 2);
        }
    }

    const logout = async (conPeticion = false) => {
        await borrarLS("tokenSesionActual");
        setUsuarioActual(false);
        setTokenSesionActual(null);
        setEsAdmin(false);
        setBloqueado(false);
        setFallo(false);
        setPremium(false);
        if (conPeticion) await peticionBasica(API_URL + "/user/logout", {"X-auth-api": API_KEY,"X-auth-session": tokenSesionActual ?? ''}, "DELETE", undefined, tokenSesionActual + "");
    }

    const cambiarUsuarioActual = async (usuario: Partial<Usuario>) => {
        if (validarUsuarioLocal(usuario)) {
            setUsuarioActual(usuario);
            return true;
        } else {
            setFallo({ error: true, code: "user-non-validable" });
            return false;
        }
    }

    const actualizarEstadoPremium = async (id: string, token: string) => {
        const datosPremium = await peticionBasica(API_URL + "/user/premium/" + id, {"X-auth-api": API_KEY,"X-auth-session": token ?? ''}, "GET", undefined, token + "");
        setPremium(datosPremium?.data ? true : false);
    }

    const cambiarTokenSesionActual = async (token: string) => {
        if (token) {
            setTokenSesionActual(token);
            await guardarLS("tokenSesionActual", token);
            return true;
        }
        return false;
    }

    useEffect(() => {
        inicio();
    }, []);

    return (
        <SesionContext.Provider value={{ actualizarEstadoPremium, premium, usuario: usuarioActual, tokenSesionActual, logout, cambiarUsuarioActual, cambiarTokenSesionActual, fallo, esAdmin, bloqueado }}>
            {((usuarioActual && typeof usuarioActual === 'object' && 'id' in usuarioActual) || usuarioActual === false) && (<>
                {JSON.stringify(usuarioActual)}{JSON.stringify(premium)}
                {children}
            </>)}
        </SesionContext.Provider>
    );
};
