
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

const Premium = memo(function Premium() {

  useTituloDinamico("premium");

  return (
    <>
      <Titulo magnitud={1}>Premium</Titulo>
    </>
  )
});

export default Premium;