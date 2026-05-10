//Funciones para datos dummy, usando textosDummy.json

import datosFalsos from '../assets/textosDummy.json';

/**
 * @returns un correo falso
 */
export const correoFalso = ():string => {
    return datosFalsos.correos[Math.floor(Math.random() * datosFalsos.correos.length)];
}

/**
 * @returns un nickname falso
 */
export const nicknameFalso = ():string => {
    return datosFalsos.nicknames[Math.floor(Math.random() * datosFalsos.nicknames.length)];
}

/**
 * @returns aleatoriamente un correo falso o un nickname falso
 */
export const identificacionFalsa = ():string => {
    return Math.random() < 0.5 ? correoFalso() : nicknameFalso();
}

/**
 * @returns un nombre falso
 */
export const nombreFalso = ():string => {
    return datosFalsos.nombres[Math.floor(Math.random() * datosFalsos.nombres.length)];
}

/**
 * @returns un titulo de juego falso
 */
export const tituloJuegoFalso = ():string => {
    return datosFalsos.titulosJuegos[Math.floor(Math.random() * datosFalsos.titulosJuegos.length)];
}

/**
 * Generar un UUID ya que la API de crypto puede no estar disponible
 * @returns UUID nuevo
 */
export const getUUID = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback to a basic manual UUID generator (v4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};