
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de foros populares
 */
const FeaturedForums = memo(function FeaturedForums() {

  useTituloDinamico("featuredForums");

  return (
    <>
      <Titulo>FeaturedForums</Titulo>
    </>
  )
});

export default FeaturedForums;