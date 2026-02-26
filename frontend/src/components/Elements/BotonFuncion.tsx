import React from 'react';

function BotonFuncion(props) {
  
  return (
        <span className={(props.cabecera ? "boton-cabecera" : "") + "boton-funcion"}>
            <button onClick={(e)=>{e.preventDefault(); props?.funcion(e)}}>{props.titulo}</button>
        </span>
  )
}

export default BotonFuncion;
