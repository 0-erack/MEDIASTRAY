import { useState } from "react";

const useLocalStorage = () => {

  const [cargando, setCargando] = useState(false);

  const localStoragePermitido = (): boolean => {
    return typeof Storage !== "undefined";
  }

  const resetLS = async (): Promise<boolean> => {
    if (localStoragePermitido()) {
      setCargando(true);
      await localStorage.clear();
      setCargando(false);
      return true;
    } else {
      return false;
    }
  }

  const guardarLS = async (clave:string, valor:string):Promise<Boolean> => {
    if (localStoragePermitido()) {
      setCargando(true);
      await localStorage.setItem(clave, typeof valor === "object" ? JSON.stringify(valor) : (valor + ""));
      setCargando(false);
      return true;
    } else {
      return false;
    }
  }

  const leerLS = async (clave:string): Promise<string|null> => {
    if (localStoragePermitido()) {
      setCargando(true);
      const resultado = await localStorage.getItem(clave) ?? null;
      setCargando(false);
      return resultado;
    } else {
      return null;
    }
  }

  const borrarLS = async (clave:string): Promise<string|null|boolean> => {
    if (localStoragePermitido()) {
      setCargando(true);
      const resultado = await localStorage.removeItem(clave) ?? false;
      setCargando(false);
      return resultado;
    } else {
      return false;
    }
  }

  return { cargando, resetLS, guardarLS, leerLS, borrarLS };
};

export default useLocalStorage;