
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina inicial de la documentacion
 */
const InicioDocumentacion = memo(function InicioDocumentacion() {

  useTituloDinamico("inicioDocumentacion");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo>{traduccion("titulos", "documentacion")}</Titulo>
    </>
  )
});

export default InicioDocumentacion;