import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';
import FormularioRegister from '../components/Forms/FormularioRegister.jsx';
import Texto from '../components/Texto.jsx';

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