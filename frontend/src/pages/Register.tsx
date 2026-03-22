
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import FormularioRegister from '../components/Forms/FormularioRegister';
import Icono from '../components/Principal/Icono';
import Texto from '../components/Texto';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina para registrarse
 */
const Register = memo(function Register() {

  useTituloDinamico("register");

  return (
    <>
      <Titulo><Icono numero={1} color="var(--color-resaltado)" /> <Texto tipo="titulos" nombre="register" /></Titulo>
      <FormularioRegister />
    </>
  )
});

export default Register;