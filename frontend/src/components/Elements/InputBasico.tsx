import { useState } from 'react';
import CajaError from './CajaError';
import MarkdownDisplay from './MarkdownDisplay';

interface InputBasicoProps {
  validador?: (data: any) => any | null;
  nombre?: string|null;
  tipo?: string|null;
  titulo?: string|null|React.ReactNode;
  valor?: any;
  mensajeError?: string|null|React.ReactNode;
  placeholder?: any;
  estaChecked?: any;
  markdown?: boolean;
  objetoHook?: any;
}

function InputBasico({validador, nombre, tipo, titulo, valor, mensajeError, placeholder, estaChecked, markdown, objetoHook}: InputBasicoProps) {
  const [correcto, setCorrecto] = useState(true);
  const funcionValidadora = validador ?? (() => true);

  return (
    <div className={`input-basico m-4 pl-1 border-l-2 ${correcto ? 'border-l-principal' : 'border-l-error'}`}> 
      <label htmlFor={nombre ?? ''} className='pr-2'>{titulo}<br/></label>
      {tipo === "textarea" ? (
        <textarea 
        cols={80} rows={300} 
        name={nombre ?? ''} id={nombre ?? ''} 
        onChange={(e)=>{setCorrecto(funcionValidadora(e.target.value) ?? true)}} 
        value={valor ?? ''} 
        className='bg-fondo2 ml-2 inline max-h-100
        {...(objetoHook ?? {})}
      '/>
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
          className='bg-fondo2 ml-2'
          {...(objetoHook ?? {})}
        />
      )}
      {markdown && (<div className='w-full ml-1'><MarkdownDisplay text={valor ?? ''} /></div>)}
      {!correcto && (<CajaError texto={mensajeError ?? ''} nivel="input" />)}
    </div>
  );
}

export default InputBasico;
