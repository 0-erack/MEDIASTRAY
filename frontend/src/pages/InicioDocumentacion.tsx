
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

const InicioDocumentacion = memo(function InicioDocumentacion() {

  useTituloDinamico("inicioDocumentacion");

  return (
    <>
      <Titulo>InicioDocumentacion</Titulo>
    </>
  )
});

export default InicioDocumentacion;