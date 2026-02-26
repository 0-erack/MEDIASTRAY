import React from 'react';
import Texto from '../Texto.jsx';
import gifCagrando from '../../assets/images/cargando.gif';

function ImgCargando() {
  
  return (
    <>
        <img className="cargando" src={gifCagrando} alt={<Texto tipo="titulos" nombre="cargando" />} />
    </>
  )
}

export default ImgCargando;
