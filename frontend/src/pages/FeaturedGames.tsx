
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

const FeaturedGames = memo(function FeaturedGames() {

  useTituloDinamico("featuredGames");

  return (
    <>
      <Titulo>FeaturedGames</Titulo>
    </>
  )
});

export default FeaturedGames;