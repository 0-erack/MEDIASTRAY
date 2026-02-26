/* eslint-disable react-hooks/set-state-in-effect */
import { React, createContext, useState, useEffect } from 'react';
import { validarDatosUsuarioLS } from '../libraries/validacionesBackend.js';
import { textos } from '../assets/textosInterfaz.json';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { peticionBasica } from '../libraries/peticiones.js';

const AjustesContexto = createContext();

const AjustesProvider = (props) => {

  const API_URL = import.meta.env.VITE_API_URL ?? (process.env.REACT_APP_API_URL ?? "/api");
  const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL ?? (process.env.REACT_APP_PUBLIC_URL ?? "/public");
  const GAMES_URL = import.meta.env.VITE_GAMES_URL ?? (process.env.REACT_APP_GAMES_URL ?? "/games");
  const API_KEY = import.meta.env.VITE_API_KEY ?? (process.env.REACT_APP_API_KEY ?? "");
  const [usuarioActual, setUsuarioActual] = useState({});
  const [tokenSesionActual, setTokenSesionActual] = useState("");
  const [tokenJuegoActual, setTokenJuegoActual] = useState("");
  const [idiomaActual, setIdiomaActual] = useState("");
  const idiomasAdmitidos = ["EN-us", "ES-es"];
  const [fallo, setFallo] = useState(false);
  const { leerLS, guardarLS, borrarLS } = useLocalStorage();

  //Carga al inicio
  const inicio = async () => {
    try {

      await guardarLS("API_URL", API_URL);
      await guardarLS("PUBLIC_URL", PUBLIC_URL);
      await guardarLS("GAMES_URL", GAMES_URL);
      await guardarLS("API_KEY", API_KEY);

      const tokenSesionActual = await leerLS("tokenSesionActual")
      setTokenSesionActual(tokenSesionActual);
      setTokenJuegoActual(await leerLS("tokenJuegoActual"));

      const idiomaPreferente = navigator.language ?? 'en-US';
      const idiomaPrecargado = await leerLS("idiomaActual") ?? `${(idiomaPreferente[0] + idiomaPreferente[1]).toUpperCase()}-${(idiomaPreferente[3] + idiomaPreferente[4]).toLowerCase()}`;
      setIdiomaActual(idiomaPrecargado ?? "EN-us");
      await guardarLS("idiomaActual", idiomaPrecargado ?? "EN-us");

      const usuarioPrecargado = JSON.parse(await leerLS("usuarioActual") ?? '{"ninguno": true}');
      if (validarDatosUsuarioLS(usuarioPrecargado) && usuarioPrecargado?.uuid) {
        setUsuarioActual(usuarioPrecargado);
      } else {
        setUsuarioActual({ ninguno: true });
        await borrarLS("usuarioActual");
      }

      if (usuarioPrecargado.uuid) {
        const sesionValida = await peticionBasica(API_URL + "/authSessionToken", { "X-auth-api": API_KEY, "X-auth-session": tokenSesionActual ?? '' }, "GET");
        if (!sesionValida.ok || sesionValida.uuid !== usuarioPrecargado.uuid || sesionValida.uuid === "") {
          await logout();
          window.location.reload();
          return;
        }
      }


      //await leerLS("usuarioActual", JSON.stringify(usuarioActual));
      setFallo(false);
    } catch (error) {
      console.log(error);
      setUsuarioActual({ ninguno: true });
      setFallo({ error: true, objeto: error });
    }
  }

  const logout = async () => {
    await borrarLS("tokenSesionActual");
    await borrarLS("tokenJuegoActual");
    await guardarLS("usuarioActual", { ninguno: true });
    setUsuarioActual({ ninguno: true });
    setTokenJuegoActual("");
    setTokenSesionActual("");
  }

  const cambiarUsuarioActual = async (usuario) => {
    if (validarDatosUsuarioLS(usuario)) {
      setUsuarioActual(usuario);
      await guardarLS("usuarioActual", JSON.stringify(usuario));
    } else {
      setFallo({ error: true, code: "user-non-validable" });
      //await guardarLS("usuarioActual", "");
    }
  }

  const cambiarTokenSesionActual = async (token) => {
    if (token) {
      setTokenSesionActual(token);
      await guardarLS("tokenSesionActual", token);
    }
  }
  const cambiarTokenJuegoActual = async (token) => {
    if (token) {
      setTokenJuegoActual(token);
      await guardarLS("tokenJuegoActual", token);
    }
  }

  const cambiarIdiomaActual = async (nuevo) => {
    if (idiomasAdmitidos.find((e) => e === nuevo)) {
      setIdiomaActual(nuevo);
      await guardarLS("idiomaActual", nuevo);
    } else {
      setFallo({ error: true, code: "language-not-found" });
    }
  }

  const exportaciones = /*useMemo(()=>(*/{
    fallo: fallo, tokenSesionActual, usuarioActual, tokenJuegoActual, idiomaActual, idiomasAdmitidos, API_URL, API_KEY, PUBLIC_URL, GAMES_URL, textosInterfaz: textos, textosInterfazEnlacesCabecera: textos.enlacesCabecera,
    cambiarUsuarioActual, cambiarTokenJuegoActual, cambiarIdiomaActual, cambiarTokenSesionActual, logout
  }//), [fallo, tokenSesionActual, usuarioActual, tokenJuegoActual, idiomaActual, idiomasAdmitidos, API_URL, API_KEY, PUBLIC_URL, GAMES_URL, textos, cambiarUsuarioActual, cambiarTokenJuegoActual, cambiarIdiomaActual, cambiarTokenSesionActual]);

  useEffect(() => {
    //useLayoutEffect(() => {
    inicio();
  }, []);

  return (
    <AjustesContexto value={exportaciones}>
      {(usuarioActual.ninguno || usuarioActual.uuid) && idiomaActual && props.children}
    </AjustesContexto>
  )
}

export default AjustesProvider;
export { AjustesContexto }