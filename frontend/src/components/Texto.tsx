import useAjustes from '../hooks/useAjustes';

interface TextoProps {
  tipo: string;
  nombre: string;
}

function Texto({ tipo, nombre }: TextoProps) {
  
  const { idiomaActual, textosInterfaz } = useAjustes();

  return (
    <>
        {textosInterfaz[tipo][idiomaActual][nombre] ?? ""}
    </>
  )
}

export default Texto;
