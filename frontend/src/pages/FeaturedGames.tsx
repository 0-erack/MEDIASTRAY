
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina juegos populares
 */
const FeaturedGames = memo(function FeaturedGames() {

  useTituloDinamico("featuredGames");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo>{traduccion("titulos", "juegosDestacados")}</Titulo>

    </>
  )
});

export default FeaturedGames;