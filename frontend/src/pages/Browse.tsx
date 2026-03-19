
import TripleBuscador from '../components/Busqueda/TripleBuscador';
import Titulo from '../components/Elements/Titulo';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

function Browse() {

  useTituloDinamico("browse");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo>{traduccion("titulos", "browse")}</Titulo>
      <TripleBuscador />
    </>
  )
}

export default Browse;