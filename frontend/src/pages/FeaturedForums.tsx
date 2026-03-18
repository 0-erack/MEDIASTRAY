
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function FeaturedForums() {

  useTituloDinamico("featuredForums");

  return (
    <>
      <Titulo>FeaturedForums</Titulo>
    </>
  )
}

export default FeaturedForums;