
import './MensajeFlotante.css';

interface MensajeFlotanteProps {
  mensaje: string;
  tipo: number|null;
}


function MensajeFlotante({ mensaje, tipo }: MensajeFlotanteProps) {

    const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  
  return (
    <>
        <div className={"mensaje-flotante " + (tipos[tipo ?? 0])}>
            <p>{mensaje}</p>
        </div>
    </>
  )
}

export default MensajeFlotante;
