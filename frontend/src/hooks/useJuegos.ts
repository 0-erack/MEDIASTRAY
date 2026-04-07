import { useContext } from "react";
import { JuegosContext } from "../contexts/JuegosProvider";

const useJuegos = () => {

  const contexto = useContext(JuegosContext);

  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useJuegos;