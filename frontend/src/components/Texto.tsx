import React from 'react';
import useAjustes from '../hooks/useAjustes.js';

function Cabecera(props) {
  
  const { idiomaActual, textosInterfaz } = useAjustes();

  return (
    <>
        {textosInterfaz[props.tipo][idiomaActual][props.nombre] ?? ""}
    </>
  )
}

export default Cabecera;
