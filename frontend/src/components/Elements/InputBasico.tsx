import React, { useState } from 'react';
import CajaError from '../Principal/CajaError.jsx';
import './InputBasico.css';

function InputBasico(props) {
  const [correcto, setCorrecto] = useState(true);
  const funcionValidadora = props.validador ?? (() => true);

  return (
    <div className="input-basico">
      <label htmlFor={props.nombre}>{props.titulo}</label>
      {props.tipo === "textarea" ? (
        <textarea 
        cols="80" rows="300" 
        name={props.nombre ?? ''} id={props.nombre ?? ''} 
        onChange={(e)=>{setCorrecto(funcionValidadora(e.target.value) ?? true)}} 
        value={props.valor ?? ''} />
        /*<div contentEditable="true" onBlur={handleTextareaChange} >{props.valor}</div>*/
      ) : (
        <input
          onChange={(e)=>{setCorrecto(funcionValidadora(e.target.value) ?? true)}}
          type={props.tipo ?? "text"}
          value={props.valor ?? ''}
          name={props.nombre ?? ''}
          id={props.nombre ?? ''}
          checked={props.tipo === "checkbox" && props.estaChecked }
          placeholder={props.placeholder ?? ''}
        />
      )}
      {!correcto && (<CajaError texto={props.mensajeError ?? ''} nivel="input" />)}
    </div>
  );
}

export default InputBasico;
