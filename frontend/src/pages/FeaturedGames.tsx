
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function FeaturedGames() {

  useTituloDinamico("featuredGames");

  return (
    <>
      <Titulo>FeaturedGames</Titulo>
    </>
  )
}

export default FeaturedGames;