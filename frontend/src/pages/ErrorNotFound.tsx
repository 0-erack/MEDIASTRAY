
import { memo } from 'react';
import BotonNavegacion from '../components/Elements/BotonNavegacion';
import Titulo from '../components/Elements/Titulo';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico';

const ErrorNotFound = memo(function ErrorNotFound() {

  useTituloDinamico("errorNotFound");

  return (
    <>
      <Titulo><Texto tipo="titulos" nombre="error404" /></Titulo>
      <p><Texto tipo="parrafos" nombre="error404Explicacion" /></p>
      <BotonNavegacion direccion={"/"} titulo={<Texto tipo="botones" nombre="irInicio" />} />
    </>
  )
});

export default ErrorNotFound;