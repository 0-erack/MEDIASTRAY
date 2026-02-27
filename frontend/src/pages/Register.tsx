
import useTituloDinamico from '../hooks/useTituloDinamico';
import FormularioRegister from '../components/Forms/FormularioRegister';
import Texto from '../components/Texto';

function Register() {

  useTituloDinamico("register");

  return (
    <>
      <h2><Texto tipo="titulos" nombre="register" /></h2>
      <FormularioRegister />
    </>
  )
}

export default Register;