
import useTituloDinamico from '../hooks/useTituloDinamico.js';
import FormularioLogin from '../components/Forms/FormularioLogin';
import Texto from '../components/Texto';

function Login() {

  useTituloDinamico("login");

  return (
    <>
      <h2><Texto tipo="titulos" nombre="login" /></h2>
      <FormularioLogin />
    </>
  )
}

export default Login;