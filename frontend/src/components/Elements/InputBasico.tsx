import { useState } from 'react';
import Icono from '../Principal/Icono';
import CajaError from './CajaError';
import MarkdownDisplay from './MarkdownDisplay';

interface InputBasicoProps {
  validador?: (data: any) => any | null;
  nombre?: string | null;
  tipo?: string | null;
  titulo?: string | null | React.ReactNode;
  valor?: any;
  mensajeError?: string | null | React.ReactNode;
  placeholder?: any;
  estaChecked?: any;
  markdown?: boolean;
  objetoHook?: any;
  ancho?: number | string;
  inline?: boolean;
  iconoA?: number;
  iconoB?: number;
  iconoC?: number;
  children?: React.ReactNode;
  opcionesSelect?: Array<Record<string, any>>;
}

function InputBasico({ validador, nombre, tipo, titulo, valor, mensajeError, placeholder, estaChecked, markdown, objetoHook, ancho, inline, iconoA, iconoB, iconoC, opcionesSelect, children }: InputBasicoProps) {
  const [correcto, setCorrecto] = useState(true);
  const funcionValidadora = validador ?? (() => true);

  return (
    <div className={`input-basico m-4 pl-1 border-l-2 ${correcto ? 'border-l-principal' : 'border-l-error'} ${inline ? 'inline-flex items-center mr-2' : 'm-4'}`}>
      {titulo && (<label htmlFor={nombre ?? ''} className='pr-1'>{iconoA && (<Icono numero={iconoA ?? 0} color="var(--color-principal)" />)} {titulo}<br /></label>)}
      {children}
      {tipo === "select" ? (<select
        name={nombre ?? ''}
        id={nombre ?? ''}
        onChange={(e) => { setCorrecto(funcionValidadora(e.target.value) ?? true) }}
        {...(!objetoHook ? { value: valor ?? '' } : {})}
        className={`bg-fondo2 p-1 ml-1 w-${ancho ?? 'max'}`}
        {...(objetoHook ?? {})}
        defaultValue={"0"}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {opcionesSelect?.map((opcion, ) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>) : (<>
        {tipo === "textarea" ? (
          <textarea
            cols={80} rows={ancho ?? 300}
            name={nombre ?? ''} id={nombre ?? ''}
            onChange={(e) => { setCorrecto(funcionValidadora(e.target.value) ?? true) }}
            {...(!objetoHook ? { value: valor ?? '' } : {})}
            className='bg-fondo2 ml-2 inline max-h-100'
            {...(objetoHook ?? {})}
          />
        ) : (
          <input
            onChange={(e) => { setCorrecto(funcionValidadora(e.target.value) ?? true) }}
            type={tipo ?? "text"}
            {...(!objetoHook ? { value: valor ?? '' } : {})}
            name={nombre ?? ''}
            id={nombre ?? ''}
            checked={tipo === "checkbox" && estaChecked}
            placeholder={placeholder ?? ''}
            className={`bg-fondo2 ml-1 ${tipo==="number" ? 'w-14 text-center' : `w-${ancho ?? 'max'}`} ${ancho ? ("w-" + ancho) : 'max'} ${(tipo === "checkbox" && iconoC && iconoB) ? 'hidden' : ''}`}
            {...(objetoHook ?? {})}
          />
        )}
        {(tipo === "checkbox" && iconoC && iconoB) && (<>{(estaChecked)
          ? <Icono numero={iconoB ?? 12} color="var(--color-resaltado)" />
          : <Icono numero={iconoC ?? 10} color="var(--color-resaltado)" />
        }</>)}

        {markdown && (<div className='w-full ml-1'><MarkdownDisplay text={valor ?? ''} /></div>)}
      </>)}

      {!correcto && (<CajaError texto={mensajeError ?? ''} nivel="input" />)}
    </div>
  );
}

export default InputBasico;
