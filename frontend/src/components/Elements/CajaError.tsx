import { memo } from 'react';
import Texto from '../Texto';

interface CajaErrorProps {
  nivel?: string | null;
  enLinea?: boolean | null;
  nombre?: string | null;
  texto?: string | null | React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Caja sencilla para mostrar un error
 * @param nivel interno del error
 * @param enLinea si es inline
 * @param nombre automatizacion a textosInterfaz.json
 * @param texto del error
 * @param children 
 */
const CajaError = memo(function CajaError({ nivel, enLinea, nombre, texto, children }: CajaErrorProps) {

  return (
    <>
      {enLinea ?
        (<span className={`${nivel ? ("error error-" + nivel) : "error"} text-error`}>
          {texto ? texto : (<>
            {children}
            {nombre && (<Texto tipo="errores" nombre={nombre ?? "error"} />)}
          </>)}
        </span>) :
        (<p className={`${nivel ? ("error-" + nivel) : "error"} text-error`}>
          {texto ? texto : (<>
            {children}
            {nombre && (<Texto tipo="errores" nombre={nombre ?? "error"} />)}
          </>)}
        </p>)}
    </>
  )
})

export default CajaError;
