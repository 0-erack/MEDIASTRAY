
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function BrowseGames() {

  useTituloDinamico("browseGames");

  return (
    <>
      <Titulo>BrowseGames</Titulo>
    </>
  )
}

export default BrowseGames;