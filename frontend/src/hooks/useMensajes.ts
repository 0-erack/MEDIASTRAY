import { useContext } from "react";
import { MensajesContext } from "../contexts/MensajesProvider";

const useMensajes = () => {

  const contexto = useContext(MensajesContext);
   //const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  if (!contexto) {
    throw new Error(
      "El hook debe ser utilizado dentro del proveedor."
    );
  }

  return contexto;
};

export default useMensajes;