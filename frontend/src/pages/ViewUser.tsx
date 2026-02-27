
import useTituloDinamico from '../hooks/useTituloDinamico.js';
import { useParams } from 'react-router-dom';
import VerUsuarioCompleto from '../components/Usuario/VerUsuarioCompleto';

function ViewUser() {

  let {id} = useParams();
  id = id ?? "";
  useTituloDinamico("viewUser", (id ?? '') + " ");

  return (
    <>
      <VerUsuarioCompleto id={id} />
    </>
  )
}

export default ViewUser;