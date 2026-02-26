import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Info() {

  useTituloDinamico("info");

  return (
    <>
      <h2>info</h2>
    </>
  )
}

export default Info;