/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, ReactNode, useState } from 'react';
import MensajeFlotante from '../components/Principal/MensajeFlotante';
interface Mensaje {
  mensaje: string;
  //tipo: null | 0 | 1 | 2 | 3 | 4;
  tipo: null | number;
  id: string;
}
interface MensajesContextType {
  lanzarMensaje: (mensaje: string, tipo: number) => void; //const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  mensajesPendientes: Mensaje[];
  borrarMensajes: () => void;
}

export const MensajesContext = createContext<MensajesContextType | null>(null);

const MensajesProviders = ({ children }: { children: ReactNode }) => {

  const [mensajesPendientes, setMensajesPendientes] = useState<Mensaje[]>([]);
  const duracionGeneral = 4000;

  const lanzarMensaje = (mensaje: string, tipo = 0) => {
    const id = self.crypto.randomUUID();
    setMensajesPendientes((prev) => [...prev, { mensaje, tipo: tipo ?? 0, id }]);
    mandarQuitar(id);
  };

  const mandarQuitar = (id: string) => {
    setTimeout(() => {
      setMensajesPendientes((prev) => prev.filter((e) => e.id !== id));
    }, duracionGeneral);
  };

  const borrarMensajes = () => {
    setMensajesPendientes([]);
  };

  const exportaciones: MensajesContextType = { 
    lanzarMensaje, 
    mensajesPendientes, 
    borrarMensajes 
  };

  return (
    <MensajesContext.Provider value={exportaciones}>
      <div className="zona-mensajes">
        {mensajesPendientes.map((e) => (
          <MensajeFlotante key={e.id} mensaje={e.mensaje} tipo={e.tipo} />
        ))}
      </div>
      {children}
    </MensajesContext.Provider>
  );
};

export default MensajesProviders;