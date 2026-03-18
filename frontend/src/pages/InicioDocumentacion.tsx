
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

function InicioDocumentacion() {

  useTituloDinamico("inicioDocumentacion");

  return (
    <>
      <Titulo>InicioDocumentacion</Titulo>
    </>
  )
}

export default InicioDocumentacion;