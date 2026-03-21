
import { memo } from 'react';
import gifCagrando from '../../assets/images/cargando.gif';

/**
 * Componente para mostrar la animacion de cargando
 */
const ImgCargando = memo(function ImgCargando() {
  
  return (
    <>
        <img className="cargando" src={gifCagrando} alt={"..."} />
    </>
  )
})

export default ImgCargando;
