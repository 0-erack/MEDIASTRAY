import { useState } from 'react';
import CajaError from '../Principal/CajaError';
import './InputBasico.css';

interface InputBasicoProps {
  validador?: (data: any) => any | null;
  nombre?: string|null;
  tipo?: string|null;
  titulo?: string|null|React.ReactNode;
  valor?: any;
  mensajeError?: string|null|React.ReactNode;
  placeholder?: any;
  estaChecked?: any;
}

function InputBasico({validador, nombre, tipo, titulo, valor, mensajeError, placeholder, estaChecked}: InputBasicoProps) {
  const [correcto, setCorrecto] = useState(true);
  const funcionValidadora = validador ?? (() => true);

  return (
    <div className="input-basico">
      <label htmlFor={nombre ?? ''}>{titulo}</label>
      {tipo === "textarea" ? (
        <textarea 
        cols={80} rows={300} 
        name={nombre ?? ''} id={nombre ?? ''} 
        onChange={(e)=>{setCorrecto(funcionValidadora(e.target.value) ?? true)}} 
        value={valor ?? ''} />
        /*<div contentEditable="true" onBlur={handleTextareaChange} >{valor}</div>*/
      ) : (
        <input
          onChange={(e)=>{setCorrecto(funcionValidadora(e.target.value) ?? true)}}
          type={tipo ?? "text"}
          value={valor ?? ''}
          name={nombre ?? ''}
          id={nombre ?? ''}
          checked={tipo === "checkbox" && estaChecked }
          placeholder={placeholder ?? ''}
        />
      )}
      {!correcto && (<CajaError texto={mensajeError ?? ''} nivel="input" />)}
    </div>
  );
}

export default InputBasico;
