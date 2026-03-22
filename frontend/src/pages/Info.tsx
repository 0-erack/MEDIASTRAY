
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de informacion sobre Mediastray
 */
const Info = memo(function Info() {

  useTituloDinamico("info");

  return (
    <>
      <Titulo>info</Titulo>
    </>
  )
});

export default Info;