
import Titulo from '../components/Elements/Titulo';
import FormularioRegister from '../components/Forms/FormularioRegister';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico';

function Register() {

  useTituloDinamico("register");

  return (
    <>
      <Titulo><Texto tipo="titulos" nombre="register" /></Titulo>
      <FormularioRegister />
    </>
  )
}

export default Register;