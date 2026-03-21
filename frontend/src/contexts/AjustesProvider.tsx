/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, ReactNode, useEffect, useState } from 'react';
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
  TAMAGNO_PAGINA: string|number;
  textosInterfaz: any;
  textosInterfazEnlacesCabecera: any;
  FRECUENCIA_ACTUALIZACION: number;
  cambiarIdiomaActual: (nuevo: string) => Promise<void>;
}

export const AjustesContext = createContext<AjustesContextType | null>(null); 

const AjustesProvider = ({ children }: { children: ReactNode }) => {

  const API_URL = import.meta.env.VITE_API_URL ?? ((window as any).process?.env?.REACT_APP_API_URL ?? "/api");
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? ((window as any).process?.env?.REACT_APP_PUBLIC_URL ?? "/public");
  const GAMES_URL = import.meta.env.VITE_GAMES_URL ?? ((window as any).process?.env?.REACT_APP_GAMES_URL ?? "/games");
  const API_KEY = import.meta.env.VITE_API_KEY ?? ((window as any).process?.env?.REACT_APP_API_KEY ?? "");
  const TAMAGNO_PAGINA = import.meta.env.VITE_TAMAGNO_PAGINA ?? ((window as any).process?.env?.REACT_APP_TAMAGNO_PAGINA ?? "50");
  const FRECUENCIA_ACTUALIZACION = import.meta.env.VITE_FRECUENCIA_ACTUALIZACION ?? ((window as any).process?.env?.REACT_APP_FRECUENCIA_ACTUALIZACION ?? 1000);

  const [idiomaActual, setIdiomaActual] = useState("");
  const idiomasAdmitidos = ["EN-us", "ES-es", "ZH-ch"];
  const [fallo, setFallo] = useState<any>(false);
  const { leerLS, guardarLS, borrarLS } = useLocalStorage();
  const { lanzarMensaje } = useMensajes();

  const inicio = async () => {
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
  }

  const cambiarIdiomaActual = async (nuevo: string) => {
    if (idiomasAdmitidos.find((e) => e === nuevo)) {
      setIdiomaActual(nuevo);
      await guardarLS("idiomaActual", nuevo);
    } else {
      setFallo({ error: true, code: "language-not-found" });
      lanzarMensaje("Unknown error", 2);
    }
  }

  const exportaciones: AjustesContextType = {
    fallo, idiomaActual, idiomasAdmitidos, API_URL, API_KEY, PUBLIC_URL, GAMES_URL,
    textosInterfaz: textos, TAMAGNO_PAGINA: parseInt(TAMAGNO_PAGINA), FRECUENCIA_ACTUALIZACION: parseInt(FRECUENCIA_ACTUALIZACION),
    textosInterfazEnlacesCabecera: (textos as any).enlacesCabecera,
    cambiarIdiomaActual
  }

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