import { memo } from 'react';
import useAjustes from '../hooks/useAjustes';

interface TextoProps {
  tipo: string;
  nombre: string;
}

/**
 * Componente legacy para mostrar un texto traducido dependiendo del idioma actual
 * @param tipo seccion en textosInterfaz.json
 * @param nombre valor en textosInterfaz.json
 */
const Texto = memo(function Texto({ tipo, nombre }: TextoProps) {
  
  const { idiomaActual, textosInterfaz } = useAjustes();

  return (
    <>
        {textosInterfaz[tipo][idiomaActual][nombre] ?? ""}
    </>
  )
})

export default Texto;
