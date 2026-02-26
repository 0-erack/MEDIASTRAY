import React, { useState } from "react";

const useLocalStorage = () => {

  const [cargando, setCargando] = useState(false);

  const localStoragePermitido = () => {
    return typeof Storage !== "undefined";
  }

  const resetLS = async () => {
    if (localStoragePermitido()) {
      setCargando(true);
      await localStorage.clear();
      setCargando(false);
      return true;
    } else {
      return false;
    }
  }

  const guardarLS = async (clave, valor) => {
    if (localStoragePermitido()) {
      setCargando(true);
      await localStorage.setItem(clave, typeof valor === "object" ? JSON.stringify(valor) : (valor + ""));
      setCargando(false);
      return true;
    } else {
      return false;
    }
  }

  const leerLS = async (clave) => {
    if (localStoragePermitido()) {
      setCargando(true);
      const resultado = await localStorage.getItem(clave) ?? null;
      setCargando(false);
      return resultado;
    } else {
      return null;
    }
  }

  const borrarLS = async (clave) => {
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