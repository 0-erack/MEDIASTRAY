import useIdioma from "../../hooks/useIdioma";

interface FormValues {
  nombre: string;
  archivo: any;
}

interface FormularioArchivoJuegoProps {
  previos: Array<Record<string, any>>;
}

/**
 * Formulario para subir archivos de juego
 */
function FormularioArchivoJuego({previos}: FormularioArchivoJuegoProps) {

  const traduccion = useIdioma();
  
  return (
    <div>
      <p>{traduccion("parrafos", "infoArchivos1")}</p>
      <p>{traduccion("parrafos", "infoArchivos2")}</p>
      {JSON.stringify(previos)}
    </div>
  );
}

export default FormularioArchivoJuego;
