
import { memo } from 'react';
import EnlaceFuncion from '../components/Elements/EnlaceFuncion';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useAjustes from '../hooks/useAjustes';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina inicial de la documentacion
 */
const InicioDocumentacion = memo(function InicioDocumentacion() {

  useTituloDinamico("inicioDocumentacion");
  const traduccion = useIdioma();
  const { PUBLIC_URL } = useAjustes();

  return (
    <>
      <Titulo><Icono numero={8} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "documentacion")}</Titulo>
      <p><EnlaceFuncion titulo={traduccion("parrafos", "infoEnlace4")} funcion={PUBLIC_URL + "/API.html"} /></p>
      aaaaa
    </>
  )
});

export default InicioDocumentacion;