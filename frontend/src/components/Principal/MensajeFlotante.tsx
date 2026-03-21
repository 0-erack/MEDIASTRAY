
import { memo } from 'react';
import './MensajeFlotante.css';

interface MensajeFlotanteProps {
  mensaje: string;
  tipo: number|null;
}

/**
 * Mensaje flotante que aparece en una esquina
 * @param mensaje texto a mostrar
 * @param tipo como se estilizara (0: generico, 1: exito, 2: error, 3: alerta, 4: informacion)
 */
const MensajeFlotante = memo(function MensajeFlotante({ mensaje, tipo }: MensajeFlotanteProps) {

    const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  
  return (
    <>
        <div className={"mensaje-flotante " + (tipos[tipo ?? 0])}>
            <p>{mensaje}</p>
        </div>
    </>
  )
})

export default MensajeFlotante;
