
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
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
      <Titulo><Icono numero={8} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "documentacion")}</Titulo>
    </>
  )
});

export default InicioDocumentacion;