import Texto from '../Texto';

interface CajaErrorProps {
  nivel?: string|null;
  enLinea?: boolean|null;
  nombre?: string|null;
  texto?: string|null|React.ReactNode;
}

function CajaError({ nivel, enLinea, nombre, texto }: CajaErrorProps) {

  return (
    <>
        {enLinea ? 
        (<span className={nivel ? ("error error-" + nivel) : "error"}>
            {texto ? texto : (<Texto tipo="errores" nombre={nombre ?? "error"} />)}
        </span>) : 
        (<p className={nivel ? ("error-" + nivel) : "error"}>
            {texto ? texto : (<Texto tipo="errores" nombre={nombre ?? "error"} />)}
        </p>)}
    </>
  )
}

export default CajaError;
