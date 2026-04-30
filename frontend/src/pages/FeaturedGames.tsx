
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import ListaJuegosDestacados from '../components/Juego/ListaJuegosDestacados';
import Icono from '../components/Principal/Icono';
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
      <Titulo><Icono color='var(--color-resaltado)' numero={3} tamagno={16} /> {traduccion("titulos", "juegosDestacados")}</Titulo>
      <p>{traduccion("parrafos", "explicarDestacados")}</p>
      <ListaJuegosDestacados infinito={false} />
    </>
  )
});

export default FeaturedGames;