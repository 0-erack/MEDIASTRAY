
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import TripleBuscador from '../components/Busqueda/TripleBuscador';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina para buscar
 */
const Browse  = memo(function Browse() {

  useTituloDinamico("browse");
  const traduccion = useIdioma();
  const { query } = useParams();

  return (
    <>
      <Titulo><Icono numero={4} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "browse")}</Titulo>
      <TripleBuscador inicial={query ?? ''} key={query ?? 'ee'} />
    </>
  )
});

export default Browse;