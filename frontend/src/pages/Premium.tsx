
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function Premium() {

  useTituloDinamico("premium");

  return (
    <>
      <Titulo magnitud={1}>Premium</Titulo>
    </>
  )
}

export default Premium;