import { useState } from "react";

/**
 * Hook para manejar las operaciones con localStorage
 * @returns funciones
 */
const useLocalStorage = () => {

  const [cargando, setCargando] = useState(false);

  /**
   * Saber si el navegador permite localStorage
   * @returns si lo permite o no
   */
  const localStoragePermitido = (): boolean => {
    return typeof Storage !== "undefined";
  }

  /**
   * Borra todo el localStorage
   * @returns true en funcion de si no ha habido ningun error
   */
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

  /**
   * Guardar un valor
   * @param clave en que clave se guarda
   * @param valor texto a guardar
   * @returns true en funcion de si no ha habido ningun error
   */
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

  /**
   * Leer un valor en el localStorage
   * @param clave que clave leer
   * @returns valor en esa clave o null si no habia nada
   */
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

  /**
   * Borrar un valor en el localStorage
   * @param clave que valor borrar
   * @returns true en funcion de si no ha habido ningun error
   */
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