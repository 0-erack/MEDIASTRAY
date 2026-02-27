/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useState, ReactNode } from 'react';
import MensajeFlotante from '../components/Principal/MensajeFlotante';
interface Mensaje {
  mensaje: string;
  tipo: null | number;
  id: string;
}
interface MensajesContextType {
  lanzarMensaje: (mensaje: string, tipo: number) => void;
  mensajesPendientes: Mensaje[];
  borrarMensajes: () => void;
}

export const MensajesContexto = createContext<MensajesContextType | null>(null);

interface Props {
  children: ReactNode;
}

const MensajesProviders = ({ children }: Props) => {

  const [mensajesPendientes, setMensajesPendientes] = useState<Mensaje[]>([]);
  const duracionGeneral = 2000;

  const lanzarMensaje = (mensaje: string, tipo: number) => {
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
    <MensajesContexto.Provider value={exportaciones}>
      <div className="zona-mensajes">
        {mensajesPendientes.map((e) => (
          <MensajeFlotante key={e.id} mensaje={e.mensaje} tipo={e.tipo} />
        ))}
      </div>
      {children}
    </MensajesContexto.Provider>
  );
};

export default MensajesProviders;