import React from 'react';
import useTituloDinamico from '../hooks/useTituloDinamico.js';
import { useParams } from 'react-router-dom';
import VerUsuarioCompleto from '../components/Usuario/VerUsuarioCompleto.jsx';

function ViewUser() {

  const {id} = useParams();
  useTituloDinamico("viewUser", (id ?? '') + " ");

  return (
    <>
      <VerUsuarioCompleto id={id} />
    </>
  )
}

export default ViewUser;