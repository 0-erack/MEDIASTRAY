import { useContext } from "react";
import { SesionContext } from "../contexts/SesionProvider";

const useSesion = () => {

  const contexto = useContext(SesionContext);

  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useSesion;