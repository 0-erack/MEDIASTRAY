import React, { useContext } from "react";
import { AjustesContexto } from "../contexts/AjustesProvider.jsx";

const useAjustes = () => {

  const contexto = useContext(AjustesContexto);

  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useAjustes;