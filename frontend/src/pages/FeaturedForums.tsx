
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
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
      <Titulo><Icono numero={5} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "foros")}</Titulo>
      <p>W.I.P.</p>
    </>
  )
});

export default FeaturedForums;