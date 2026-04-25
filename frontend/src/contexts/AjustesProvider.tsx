/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { textos } from '../assets/textosInterfaz.json';
import useLocalStorage from '../hooks/useLocalStorage';
import useMensajes from '../hooks/useMensajes';

interface AjustesContextType {
  fallo: any;
  idiomaActual: string;
  idiomasAdmitidos: string[];
  API_URL: string;
  API_KEY: string;
  PUBLIC_URL: string;
  GAMES_URL: string;
  TAMAGNO_PAGINA: string | number;
  textosInterfaz: any;
  textosInterfazEnlacesCabecera: any;
  FRECUENCIA_ACTUALIZACION: number;
  cambiarIdiomaActual: (nuevo: string) => Promise<void>;
}

export const AjustesContext = createContext<AjustesContextType | null>(null);

/**
 * Contexto de ajustes varios (tokens, localStorage, .env, ...)
 * @param children
 */
const AjustesProvider = ({ children }: { children: ReactNode }) => {

  //Url de la api
  const API_URL = import.meta.env.VITE_API_URL ?? ((window as any).process?.env?.REACT_APP_API_URL ?? "/api");
  //Url de recursos publicos
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? ((window as any).process?.env?.REACT_APP_PUBLIC_URL ?? "/public");
  //Url de los recursos de los juegos
  const GAMES_URL = import.meta.env.VITE_GAMES_URL ?? ((window as any).process?.env?.REACT_APP_GAMES_URL ?? "/games");
  //Clave para acceder a las rutas escondidas de la api
  const API_KEY = import.meta.env.VITE_API_KEY ?? ((window as any).process?.env?.REACT_APP_API_KEY ?? "");
  //Tamagno en el paginado
  const TAMAGNO_PAGINA = import.meta.env.VITE_TAMAGNO_PAGINA ?? ((window as any).process?.env?.REACT_APP_TAMAGNO_PAGINA ?? "50");
  //Milisegundos de intervalo de actualizacion en algunas llamadas a la api
  const FRECUENCIA_ACTUALIZACION = import.meta.env.VITE_FRECUENCIA_ACTUALIZACION ?? ((window as any).process?.env?.REACT_APP_FRECUENCIA_ACTUALIZACION ?? 1000);

  //Texto indicador con el idioma que esta actualmente elegido
  const [idiomaActual, setIdiomaActual] = useState("");
  //Idiomas admitidos en la pagina, estan representados en textosInterfaz.json
  const idiomasAdmitidos = ["EN-us", "ES-es", "ZH-ch"];
  //Posible informacion de error relacionada con este contexto
  const [fallo, setFallo] = useState<any>(false);
  const { leerLS, guardarLS } = useLocalStorage();
  const { lanzarMensaje } = useMensajes();

  /**
   * Inicio absoluto de la aplicacion
   */
  const inicio = useCallback(async () => {
    console.log("ATTENTION: if you're here to claim advantages in the app as some people in the internet might have told you to do, STOP, IT IS A FRAUD");
    console.log("We wont ever ask you to put any information here, neither to paste commands or scripts");
    console.log("However, if you're here to test the API, we recommend you to check the documentation");
    try {
      await guardarLS("API_URL", API_URL);
      await guardarLS("PUBLIC_URL", PUBLIC_URL);
      await guardarLS("GAMES_URL", GAMES_URL);
      await guardarLS("API_KEY", API_KEY);

      const idiomaPreferente = navigator.language ?? 'en-US';
      const idiomaPrecargado = await leerLS("idiomaActual") ?? `${(idiomaPreferente[0] + idiomaPreferente[1]).toUpperCase()}-${(idiomaPreferente[3] + idiomaPreferente[4]).toLowerCase()}`;
      setIdiomaActual(idiomaPrecargado ?? "EN-us");
      await guardarLS("idiomaActual", idiomaPrecargado ?? "EN-us");

      setFallo(false);
    } catch (error) {
      setFallo({ error: true, objeto: error });
      lanzarMensaje("Unknown error", 2);
    }
  }, []);

  /**
   * Cambia el idioma actual de la aplicacion
   * @param nuevo texto indicador del idioma
   */
  const cambiarIdiomaActual = useCallback(async (nuevo: string) => {
    if (idiomasAdmitidos.find((e) => e === nuevo)) {
      setIdiomaActual(nuevo);
      await guardarLS("idiomaActual", nuevo);
    } else {
      setFallo({ error: true, code: "language-not-found" });
      lanzarMensaje("Unknown error", 2);
    }
  }, []);

  const exportaciones: AjustesContextType = useMemo(() => ({
    fallo, idiomaActual, idiomasAdmitidos, API_URL, API_KEY, PUBLIC_URL, GAMES_URL,
    textosInterfaz: textos, TAMAGNO_PAGINA: parseInt(TAMAGNO_PAGINA), FRECUENCIA_ACTUALIZACION: parseInt(FRECUENCIA_ACTUALIZACION),
    textosInterfazEnlacesCabecera: (textos as any).enlacesCabecera,
    cambiarIdiomaActual
  }), [fallo, idiomaActual, cambiarIdiomaActual]);

  useEffect(() => {
    inicio();
  }, [])

  return (
    <AjustesContext.Provider value={exportaciones}>
      {idiomaActual && children}
    </AjustesContext.Provider>
  )
}

export default AjustesProvider;