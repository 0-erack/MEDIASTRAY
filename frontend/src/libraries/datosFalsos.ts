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
