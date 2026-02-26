/* eslint-disable react-hooks/set-state-in-effect */
import { React, createContext, useState } from 'react';
import MensajeFlotante from '../components/Principal/MensajeFlotante';

const MensajesContexto = createContext();

const MensajesProviders = (props) => {
  const [mensajesPendientes, setMensajesPendientes] = useState([]);
  const duracionGeneral = 2000;

  // ["generico", "exito", "error", "alerta", "informacion"]
  const lanzarMensaje = (mensaje, tipo) => {
    const id = self.crypto.randomUUID();
    setMensajesPendientes((prev) => [...prev, { mensaje, tipo: tipo ?? 0, id }]);
    mandarQuitar(id);
  };

  const mandarQuitar = (id) => {
    setTimeout(() => {
      setMensajesPendientes((prev) => prev.filter((e) => e.id !== id));
    }, duracionGeneral);
  };

  const borrarMensajes = () => {
    setMensajesPendientes([]);
  };

  const exportaciones = { lanzarMensaje, mensajesPendientes, borrarMensajes };

  return (
    <MensajesContexto.Provider value={exportaciones}>
      <div className="zona-mensajes">
        {mensajesPendientes.map((e) => (
          <MensajeFlotante key={e.id} mensaje={e.mensaje} tipo={e.tipo} />
        ))}
      </div>
      {props.children}
    </MensajesContexto.Provider>
  );
};

export default MensajesProviders;
export { MensajesContexto };