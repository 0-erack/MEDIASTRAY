
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function BrowseForums() {

  useTituloDinamico("browseForums");

  return (
    <>
      <Titulo>BrowseForums</Titulo>
    </>
  )
}

export default BrowseForums;