import React from 'react';
import { Link } from 'react-router-dom';

function BotonNavegacion(props) {
  
  return (
        <span className={(props.cabecera ? "boton-cabecera" : "") + "boton-navegacion"}>
            <Link to={props.direccion ?? '/'}>{props.titulo ?? ''}</Link>
        </span>
  )
}

export default BotonNavegacion;
