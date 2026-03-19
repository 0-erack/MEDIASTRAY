
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function Browse() {

  useTituloDinamico("browse");

  return (
    <>
      <Titulo>Browse</Titulo>
    </>
  )
}

export default Browse;