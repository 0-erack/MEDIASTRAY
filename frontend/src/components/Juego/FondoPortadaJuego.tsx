import { memo } from "react";

/**
 * Componente para mostrar el fondo en un juego
 * @param url del fondo
 */
const FondoPortadaJuego = memo(function FondoPortadaJuego({ url }: { url: string }) {

  return (
    <div className="absolute inset-0 z-0 pointer-events-none"
      style={{
        WebkitMaskImage: `
          linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%),
          linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)
        `,
        WebkitMaskComposite: 'source-in',
        maskImage: `
          linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%),
          linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)
        `,
        maskComposite: 'intersect'
      }}>
      <div
        className="w-full h-full opacity-10 scale-110 bg-repeat-y bg-top"
        style={{
          backgroundImage: `url('${url}')`,
          backgroundSize: '100% 500px'
        }}
      ></div>
    </div>
  );
});

export default FondoPortadaJuego;