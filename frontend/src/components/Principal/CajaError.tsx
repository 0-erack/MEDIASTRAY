import React from 'react';
import Texto from '../Texto.jsx';

function CajaError(props) {

  return (
    <>
        {props.enLinea ? 
        (<span className={props.nivel ? ("error error-" + props.nivel) : "error"}>
            {props.texto ? props.texto : (<Texto tipo="errores" nombre={props.nombre ?? "error"} />)}
        </span>) : 
        (<p className={props.nivel ? ("error-" + props.nivel) : "error"}>
            {props.texto ? props.texto : (<Texto tipo="errores" nombre={props.nombre ?? "error"} />)}
        </p>)}
    </>
  )
}

export default CajaError;
