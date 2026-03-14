import { useContext } from "react";
import { AjustesContext } from "../contexts/AjustesProvider";

const useAjustes = () => {

  const contexto = useContext(AjustesContext);

  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useAjustes;