
import useTituloDinamico from '../hooks/useTituloDinamico.js';
import { useParams } from 'react-router-dom';
import VerUsuarioCompleto from '../components/Usuario/VerUsuarioCompleto';
import useSesion from '../hooks/useSesion.js';

function ViewUser() {

  const { usuario } = useSesion();
  let {id} = useParams();
  id = id ?? ((typeof usuario === 'object' && usuario) ? usuario!.id! : '');
  useTituloDinamico("viewUser");

  return (
    <>
      <VerUsuarioCompleto id={id} />
    </>
  )
}

export default ViewUser;