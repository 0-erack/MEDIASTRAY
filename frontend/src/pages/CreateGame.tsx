
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de crear un juego nuevo
 */
const CreateGame = memo(function CreateGame() {

  useTituloDinamico("createGame");

  return (
    <>
      <Titulo>CreateGame</Titulo>
    </>
  )
});

export default CreateGame;