import React from 'react';
import './MensajeFlotante.css';

function MensajeFlotante(props) {

    const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  
  return (
    <>
        <div className={"mensaje-flotante " + (tipos[props.tipo ?? 0])}>
            <p>{props.mensaje}</p>
        </div>
    </>
  )
}

export default MensajeFlotante;
