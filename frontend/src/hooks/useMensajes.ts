import React, { useContext } from "react";
import { MensajesContexto } from "../contexts/MensajesProvider.jsx";

const useMensajes = () => {

  const contexto = useContext(MensajesContexto);

  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useMensajes;