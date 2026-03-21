
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import VerUsuarioCompleto from '../components/Usuario/VerUsuarioCompleto';
import useSesion from '../hooks/useSesion.js';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

const ViewUser = memo(function ViewUser() {

  const { usuario } = useSesion();
  let {id} = useParams();
  id = id ?? ((typeof usuario === 'object' && usuario) ? usuario!.id! : '');
  useTituloDinamico("viewUser");

  return (
    <>
      <VerUsuarioCompleto id={id} />
    </>
  )
});

export default ViewUser;