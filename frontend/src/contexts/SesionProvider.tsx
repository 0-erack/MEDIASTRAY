import { createContext, useState, ReactNode, useEffect } from "react";
import { Usuario } from "../types/Usuario";
import useLocalStorage from "../hooks/useLocalStorage";
import { peticionBasica } from "../libraries/peticiones";
import useAjustes from "../hooks/useAjustes";
import { deApiAUsuario, validarUsuarioLocal } from "../validators/validacionesUsuario";
import useMensajes from "../hooks/useMensajes";
import useIdioma from "../hooks/useIdioma";

interface SesionContextType {
    usuario: Partial<Usuario> | null;
    tokenSesionActual: string | null;
    cambiarUsuarioActual: (usuario: Partial<Usuario>) => Promise<boolean>;
    logout: () => Promise<void>;
    cambiarTokenSesionActual: (token: string) => Promise<boolean>;
    fallo: any;
    esAdmin: boolean;
    bloqueado: boolean;
    premium: boolean;
}

export const SesionContext = createContext<SesionContextType | null>(null);

export const SesionProvider = ({ children }: { children: ReactNode }) => {

    const [tokenSesionActual, setTokenSesionActual] = useState<string | null>("");
    const [usuarioActual, setUsuarioActual] = useState<Partial<Usuario> | null>(null);
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
                    await logout();
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
                setPremium(false);
                const resultado = await cambiarUsuarioActual(deApiAUsuario(datosUsuario.data));
                if (!resultado) {
                    await logout();
                    return;
                }

            } else {
                await logout();
                return;
            }

        } catch (e) {
            console.log(e);
            setUsuarioActual(null);
            setTokenSesionActual(null);
            lanzarMensaje(useIdioma("err", "genericoSesion"), 2);
        }
    }

    const logout = async () => {
        await borrarLS("tokenSesionActual");
        setUsuarioActual(null);
        setTokenSesionActual(null);
        setEsAdmin(false);
        setBloqueado(false);
        setFallo(false);
        await peticionBasica(API_URL + "/user/logout", {"X-auth-api": API_KEY,"X-auth-session": tokenSesionActual ?? ''}, "DELETE", undefined, tokenSesionActual + "");
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
        <SesionContext.Provider value={{ premium, usuario: usuarioActual, tokenSesionActual, logout, cambiarUsuarioActual, cambiarTokenSesionActual, fallo, esAdmin, bloqueado }}>
            {(usuarioActual?.id || usuarioActual == null) && (<>
                {JSON.stringify(usuarioActual)}
                {children}
            </>)}
        </SesionContext.Provider>
    );
};
