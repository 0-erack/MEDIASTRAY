import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function FeaturedGames() {

  useTituloDinamico("featuredGames");

  return (
    <>
      <h2>FeaturedGames</h2>
    </>
  )
}

export default FeaturedGames;