/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import MensajeFlotante from '../components/Principal/MensajeFlotante';
import { getUUID } from '../libraries/datosFalsos';
interface Mensaje {
  mensaje: string;
  //tipo: null | 0 | 1 | 2 | 3 | 4;
  tipo: null | number;
  id: string;
  children?: React.ReactNode;
}
interface MensajesContextType {
  lanzarMensaje: (mensaje: string, tipo: number) => void; //const tipos = ["generico", "exito", "error", "alerta", "informacion"];
  mensajesPendientes: Mensaje[];
  borrarMensajes: () => void;
}

export const MensajesContext = createContext<MensajesContextType | null>(null);

/**
 * Contexto para los mensajes que aparecen en la esquina
 * @param children
 */
const MensajesProviders = ({ children }: { children: ReactNode }) => {

  //Mensajes aun pendientes
  const [mensajesPendientes, setMensajesPendientes] = useState<Mensaje[]>([]);
  //Duracion en milisegundos de un mensaje, sincronizado con la animacion
  const duracionGeneral = 4000;

  /**
   * Manda a quitar un mensaje concreto
   * @param id del mensaje
   */
  const mandarQuitar = useCallback((id: string) => {
    setTimeout(() => {
      setMensajesPendientes((prev) => prev.filter((e) => e.id !== id));
    }, duracionGeneral);
  }, []);

  /**
   * Lanzar un nuevo mensaje
   * @param mensaje texto a mostrar
   * @param tipo como se estilizara
   * @param children
   */
  const lanzarMensaje = useCallback((mensaje: string, tipo = 0, children?: React.ReactNode) => {
    //const id = self.crypto.randomUUID();
    const id = getUUID();
    setMensajesPendientes((prev) => [...prev, { mensaje, tipo: tipo ?? 0, id, children: children ?? undefined }]);
    mandarQuitar(id);
  }, [mandarQuitar]);

  /**
   * Manda borrar a todos los mensajes
   */
  const borrarMensajes = useCallback(() => {
    setMensajesPendientes([]);
  }, []);

  const exportaciones: MensajesContextType = useMemo(() => ({ 
    lanzarMensaje, 
    mensajesPendientes, 
    borrarMensajes 
  }), [lanzarMensaje, mensajesPendientes, borrarMensajes ]);

  return (
    <MensajesContext.Provider value={exportaciones}>
      <div className="zona-mensajes">
        {mensajesPendientes.map((e) => (
          <MensajeFlotante key={e.id} mensaje={e.mensaje} tipo={e.tipo} >
            {e.children ?? undefined}
          </MensajeFlotante>
        ))}
      </div>
      {children}
    </MensajesContext.Provider>
  );
};

export default MensajesProviders;