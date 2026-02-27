
import BotonNavegacion from '../components/Elements/BotonNavegacion';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function ErrorNotFound() {

  useTituloDinamico("errorNotFound");

  return (
    <>
      <h2><Texto tipo="titulos" nombre="error404" /></h2>
      <p><Texto tipo="parrafos" nombre="error404Explicacion" /></p>
      <BotonNavegacion direccion={"/"} titulo={<Texto tipo="botones" nombre="irInicio" />} />
    </>
  )
}

export default ErrorNotFound;