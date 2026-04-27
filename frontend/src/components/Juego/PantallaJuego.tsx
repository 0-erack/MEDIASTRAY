import { useRef } from "react";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { Juego } from "../../types/Juego";
import BotonFuncion from "../Elements/BotonFuncion";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface PantallaJuegoProps {
  juego: Partial<Juego>;
}

/**
 * Representa un archivo del juego
 * @param juego datos del juego
 */
function PantallaJuego({ juego }: PantallaJuegoProps) {
  const { GAMES_URL } = useAjustes();
  const direccion = `${GAMES_URL}/${juego.id}/web/index.html`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const traduccion = useIdioma();

  const alternarPantallaCompleta = () => {
    if (!iframeRef.current) return;
    iframeRef.current.requestFullscreen().then(() => {
      iframeRef.current?.focus();
    });
  }

  //TODO: arreglar compatibilidades y adherir sdk

  return (
    <div>
      <div className="w-full h-max min-h-[600px] bg-black my-5 relative">
        <iframe
          ref={iframeRef}
          src={direccion}
          tabIndex={0}
          className="w-full h-full border-0 min-h-[600px] block"
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
