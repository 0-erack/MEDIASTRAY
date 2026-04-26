import { useEffect, useRef, useState } from "react";
import useAjustes from "../../hooks/useAjustes";
import useIdioma from "../../hooks/useIdioma";
import { Juego } from "../../types/Juego";
import BotonFuncion from "../Elements/BotonFuncion";

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
  const [muteado, setMuteado] = useState(false);
  const [volumen, setVolumen] = useState(1);
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const traduccion = useIdioma();

  const alternarPantallaCompleta = () => {
    if (!iframeRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      iframeRef.current.requestFullscreen();
    }
  };

  const alternarMute = () => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: "mute", value: !muteado }, "*");
    setMuteado(!muteado);
  };

  const cambiarVolumen = (nuevoVolumen: number) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: "volume", value: nuevoVolumen }, "*");
    setVolumen(nuevoVolumen);
  };

  const alternarPausa = (pausar: boolean) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: "pause", value: pausar }, "*");
  };

  const manejarMovimientoRaton = () => {
    setCursorVisible(true);
    if (cursorTimer.current) clearTimeout(cursorTimer.current);
    cursorTimer.current = setTimeout(() => setCursorVisible(false), 2000);
  };

  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement) setCursorVisible(true);
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  return (
    <div>
      <div onMouseMove={manejarMovimientoRaton} className="w-full h-max min-h-[600px] bg-black my-5 z-1000" style={{ cursor: (!cursorVisible || document.fullscreenElement) ? 'none' : 'default' }}>
        <iframe
          ref={iframeRef}
          src={direccion}
          className="w-full h-full min-h-[600px] border-0"
          sandbox="allow-scripts allow-same-origin"
          allow="fullscreen; pointer-lock; autoplay"
          title={juego.titulo}
        />
      </div>
      <BotonFuncion titulo={traduccion("botones", "pantallaCompleta")} funcion={alternarPantallaCompleta}></BotonFuncion>
      <BotonFuncion titulo={muteado ? traduccion("botones", "desSilenciar") : traduccion("botones", "silenciar")} funcion={alternarMute}></BotonFuncion>
      <input
        type="range" min={0} max={1} step={0.1}
        value={volumen}
        onChange={(e) => cambiarVolumen(Number(e.target.value))}
      />
      <BotonFuncion titulo={traduccion("botones", "pausa")} funcion={() => alternarPausa(true)}></BotonFuncion>
      <BotonFuncion titulo={traduccion("botones", "noPausa")} funcion={() => alternarPausa(false)}></BotonFuncion>
    </div>
  )
}

export default PantallaJuego; 
