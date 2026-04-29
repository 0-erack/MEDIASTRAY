
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de foros populares
 */
const FeaturedForums = memo(function FeaturedForums() {

  useTituloDinamico("featuredForums");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo>{traduccion("titulos", "foros")}</Titulo>
      
    </>
  )
});

export default FeaturedForums;