/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { validarDatosUsuarioLS } from '../libraries/validacionesBackend';
import { textos } from '../assets/textosInterfaz.json';
import useLocalStorage from '../hooks/useLocalStorage';
import { peticionBasica } from '../libraries/peticiones';

interface AjustesContextType {
  fallo: any;
  tokenSesionActual: string|null;
  usuarioActual: any;
  tokenJuegoActual: string|null;
  idiomaActual: string;
  idiomasAdmitidos: string[];
  API_URL: string;
  API_KEY: string;
  PUBLIC_URL: string;
  GAMES_URL: string;
  textosInterfaz: any;
  textosInterfazEnlacesCabecera: any;
  cambiarUsuarioActual: (usuario: any) => Promise<void>;
  cambiarTokenJuegoActual: (token: string) => Promise<void>;
  cambiarIdiomaActual: (nuevo: string) => Promise<void>;
  cambiarTokenSesionActual: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AjustesContexto = createContext<AjustesContextType | null>(null);

interface Props {
  children: ReactNode;
}

const AjustesProvider = ({ children }: Props) => {

  const API_URL = import.meta.env.VITE_API_URL ?? ((window as any).process?.env?.REACT_APP_API_URL ?? "/api");
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? ((window as any).process?.env?.REACT_APP_PUBLIC_URL ?? "/public");
  const GAMES_URL = import.meta.env.VITE_GAMES_URL ?? ((window as any).process?.env?.REACT_APP_GAMES_URL ?? "/games");
  const API_KEY = import.meta.env.VITE_API_KEY ?? ((window as any).process?.env?.REACT_APP_API_KEY ?? "");

  const [usuarioActual, setUsuarioActual] = useState<any>({});
  const [tokenSesionActual, setTokenSesionActual] = useState<string | null>("");
  const [tokenJuegoActual, setTokenJuegoActual] = useState<string | null>("");
  const [idiomaActual, setIdiomaActual] = useState("");
  const idiomasAdmitidos = ["EN-us", "ES-es"];
  const [fallo, setFallo] = useState<any>(false);
  const { leerLS, guardarLS, borrarLS } = useLocalStorage();

  const inicio = async () => {
    try {
      await guardarLS("API_URL", API_URL);
      await guardarLS("PUBLIC_URL", PUBLIC_URL);
      await guardarLS("GAMES_URL", GAMES_URL);
      await guardarLS("API_KEY", API_KEY);

      const tokenFromLS:string|null = await leerLS("tokenSesionActual");
      setTokenSesionActual(tokenFromLS);
      setTokenJuegoActual(await leerLS("tokenJuegoActual"));

      const idiomaPreferente = navigator.language ?? 'en-US';
      const idiomaPrecargado = await leerLS("idiomaActual") ?? `${(idiomaPreferente[0] + idiomaPreferente[1]).toUpperCase()}-${(idiomaPreferente[3] + idiomaPreferente[4]).toLowerCase()}`;
      setIdiomaActual(idiomaPrecargado ?? "EN-us");
      await guardarLS("idiomaActual", idiomaPrecargado ?? "EN-us");

      const usuarioRaw = await leerLS("usuarioActual");
      const usuarioPrecargado = JSON.parse(usuarioRaw ?? '{"ninguno": true}');
      
      if (validarDatosUsuarioLS(usuarioPrecargado) && usuarioPrecargado?.id) {
        setUsuarioActual(usuarioPrecargado);
      } else {
        setUsuarioActual({ ninguno: true });
        await borrarLS("usuarioActual");
      }

      if (usuarioPrecargado.id) {
        const sesionValida = await peticionBasica(API_URL + "/authSessionToken", { 
          "X-auth-api": API_KEY, 
          "X-auth-session": tokenFromLS ?? '' 
        }, "GET");
        
        if (!sesionValida.ok || sesionValida.id !== usuarioPrecargado.id || sesionValida.id === "") {
          await logout();
          window.location.reload();
          return;
        }
      }
      setFallo(false);
    } catch (error) {
      console.log(error);
      setUsuarioActual({ ninguno: true });
      setFallo({ error: true, objeto: error });
    }
  };

  const logout = async () => {
    await borrarLS("tokenSesionActual");
    await borrarLS("tokenJuegoActual");
    await guardarLS("usuarioActual", JSON.stringify({ ninguno: true }));
    setUsuarioActual({ ninguno: true });
    setTokenJuegoActual("");
    setTokenSesionActual("");
  };

  const cambiarUsuarioActual = async (usuario: any) => {
    if (validarDatosUsuarioLS(usuario)) {
      setUsuarioActual(usuario);
      await guardarLS("usuarioActual", JSON.stringify(usuario));
    } else {
      setFallo({ error: true, code: "user-non-validable" });
    }
  };

  const cambiarTokenSesionActual = async (token: string) => {
    if (token) {
      setTokenSesionActual(token);
      await guardarLS("tokenSesionActual", token);
    }
  };

  const cambiarTokenJuegoActual = async (token: string) => {
    if (token) {
      setTokenJuegoActual(token);
      await guardarLS("tokenJuegoActual", token);
    }
  };

  const cambiarIdiomaActual = async (nuevo: string) => {
    if (idiomasAdmitidos.find((e) => e === nuevo)) {
      setIdiomaActual(nuevo);
      await guardarLS("idiomaActual", nuevo);
    } else {
      setFallo({ error: true, code: "language-not-found" });
    }
  };

  const exportaciones: AjustesContextType = {
    fallo, tokenSesionActual, usuarioActual, tokenJuegoActual, idiomaActual, idiomasAdmitidos, API_URL, API_KEY, PUBLIC_URL, GAMES_URL, 
    textosInterfaz: textos, 
    textosInterfazEnlacesCabecera: (textos as any).enlacesCabecera,
    cambiarUsuarioActual, cambiarTokenJuegoActual, cambiarIdiomaActual, cambiarTokenSesionActual, logout
  };

  useEffect(() => {
    inicio();
  }, []);

  return (
    <AjustesContexto.Provider value={exportaciones}>
      {(usuarioActual.ninguno || usuarioActual.id) && idiomaActual && children}
    </AjustesContexto.Provider>
  );
};

export default AjustesProvider;