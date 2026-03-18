
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function Info() {

  useTituloDinamico("info");

  return (
    <>
      <Titulo>info</Titulo>
    </>
  )
}

export default Info;