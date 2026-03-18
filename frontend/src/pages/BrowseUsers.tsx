
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function BrowseUsers() {

  useTituloDinamico("browseUsers");

  return (
    <>
      <Titulo>BrowseUsers</Titulo>
    </>
  )
}

export default BrowseUsers;