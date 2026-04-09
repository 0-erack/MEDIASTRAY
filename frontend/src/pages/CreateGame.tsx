
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Titulo from '../components/Elements/Titulo';
import FormularioJuego from '../components/Forms/FormularioJuego';
import Icono from '../components/Principal/Icono';
import useIdioma from '../hooks/useIdioma';
import useSesion from '../hooks/useSesion';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de crear un juego nuevo
 */
const CreateGame = memo(function CreateGame() {

  useTituloDinamico("createGame");
  const traduccion = useIdioma();
  const { usuario } = useSesion();
  const navegar = useNavigate();
  
  useEffect(() => {
    if (!usuario) navegar("/login");
  });

  return (
    <>
      <Titulo><Icono numero={21} color="var(--color-resaltado)" /> {traduccion("titulos", "crearJuego")}</Titulo>
      <FormularioJuego />
    </>
  )
});

export default CreateGame;