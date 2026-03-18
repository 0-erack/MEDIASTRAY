
import Titulo from '../components/Elements/Titulo.js';
import FormularioLogin from '../components/Forms/FormularioLogin';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Login() {

  useTituloDinamico("login");

  return (
    <>
      <Titulo><Texto tipo="titulos" nombre="login" /></Titulo>
      <FormularioLogin />
    </>
  )
}

export default Login;