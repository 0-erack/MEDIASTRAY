
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de crear un juego nuevo
 */
const CreateGame = memo(function CreateGame() {

  useTituloDinamico("createGame");
  const traduccion = useIdioma();

  return (
    <>
      <Titulo>{traduccion("titulos", "crearJuego")}</Titulo>
    </>
  )
});

export default CreateGame;