import React from 'react';

function EnlaceFuncion(props) {
  
  return (
        <span className={(props.cabecera ? "enlace-cabecera" : "") + "enlace-funcion"}>
            <a href="" onClick={(e) => {
              e.preventDefault();
              try {props.funcion()} catch (e) {e}
            }}>{props.titulo ?? ""}</a>
        </span>
  )
}

export default EnlaceFuncion;
