import { useEffect, useRef } from "react";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { Juego } from "../../types/Juego";
import BotonFuncion from "../Elements/BotonFuncion";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface PantallaJuegoProps {
  juego: Partial<Juego>;
}

function PantallaJuego({ juego }: PantallaJuegoProps) {
  const { GAMES_URL } = useAjustes();
  const direccion = `${GAMES_URL}/${juego.id}/web/index.html`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const traduccion = useIdioma();

  useEffect(() => {
    const manejarEsc = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        console.log("quita")
        // Esto quita el foco del iframe y libera el pointer-lock del canvas
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    // Escuchamos en window porque el evento sube desde el iframe al padre
    window.addEventListener("keydown", manejarEsc);
    
    return () => {
      window.removeEventListener("keydown", manejarEsc);
    };
  }, []);

  const alternarPantallaCompleta = () => {
    if (!iframeRef.current) return;
    iframeRef.current.requestFullscreen().then(() => {
      iframeRef.current?.focus();
    });
  }

  return (
    <div>
      <div className="w-full h-max min-h-[620px] bg-black my-5 relative">
        <iframe
          ref={iframeRef}
          src={direccion}
          tabIndex={0}
          className="w-full h-full border-0 min-h-[600px] block"
          // Mantenemos tus atributos originales intactos para evitar errores de carga
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
          allow="fullscreen; pointer-lock; autoplay"
          title={juego.titulo}
        />
      </div>
      <div className="flex gap-4">
        <BotonFuncion 
          titulo={traduccion("botones", "pantallaCompleta")} 
          funcion={alternarPantallaCompleta} 
        /> 
        <EnlaceFuncion 
          titulo={traduccion("botones", "directoJugar")} 
          funcion={`${GAMES_URL}/${juego.id}/web`} 
        />
      </div>
    </div>
  );
}

export default PantallaJuego;