
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import VerJuegoCompleto from '../components/Juego/VerJuegoCompleto';

/**
 * Pagina de ver un juego
 */
const ViewGame = memo(function ViewGame() {

  //useTituloDinamico("viewGame");
  const {id} = useParams();

  return (
    <>
      <VerJuegoCompleto id={id ?? ''} />
    </>
  )
});

export default ViewGame;