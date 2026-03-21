
import { memo } from 'react';
import TripleBuscador from '../components/Busqueda/TripleBuscador';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

const Browse  = memo(function Browse() {

  useTituloDinamico("browse");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo><Icono numero={4} color="var(--color-resaltado)" /> {traduccion("titulos", "browse")}</Titulo>
      <TripleBuscador />
    </>
  )
});

export default Browse;