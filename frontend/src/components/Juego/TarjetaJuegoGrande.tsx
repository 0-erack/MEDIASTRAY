

interface TarjetaJuegoGrandeProps {
  juego: Record<string, any>;
  esMio: boolean | null;
}

/**
 * Componente para mostrar todos los datos de un juego y mas
 * @param juego datos a mostrar
 * @param esMio si se muestra como que el juego es del propio usuario
 */
function TarjetaJuegoGrande ({ juego, esMio }: TarjetaJuegoGrandeProps) {



  return (
    <>
        {JSON.stringify(juego)}
    </>
  )
}

export default TarjetaJuegoGrande; 
