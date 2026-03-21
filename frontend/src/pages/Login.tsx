
import Titulo from '../components/Elements/Titulo.js';
import FormularioLogin from '../components/Forms/FormularioLogin';
import Icono from '../components/Principal/Icono.js';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Login() {

  useTituloDinamico("login");

  return (
    <>
      <Titulo><Icono numero={2} color="var(--color-resaltado)" /> <Texto tipo="titulos" nombre="login" /></Titulo>
      <FormularioLogin />
    </>
  )
}

export default Login;