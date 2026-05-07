
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
    <div className='text-center'>
      <Titulo><Icono numero={8} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "documentacion")}</Titulo>
      <p>{traduccion("parrafos", "infoDocumentacion1")}</p>
      <p>{traduccion("parrafos", "infoDocumentacion2")}</p>
      <p><EnlaceFuncion pestagna='_blank' titulo={traduccion("parrafos", "infoEnlace4")} funcion={PUBLIC_URL + "/API.html"} /></p>
      <p><EnlaceFuncion pestagna='_blank' titulo={traduccion("parrafos", "infoEnlace5")} funcion={PUBLIC_URL + "/DOCUMENTACION.pdf"} /></p>
      <img className='relative z-10 sm:w-5xl w-lg m-auto mt-5' src={PUBLIC_URL + "/LogoE.png"} alt="Logo" style={{ imageRendering: 'pixelated' }} />
    </div>
  )
});

export default InicioDocumentacion;