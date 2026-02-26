import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Premium() {

  useTituloDinamico("premium");

  return (
    <>
      <h2>Premium</h2>
    </>
  )
}

export default Premium;