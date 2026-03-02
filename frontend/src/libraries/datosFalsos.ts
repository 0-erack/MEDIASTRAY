import datosFalsos from '../assets/textosDummy.json';

export const correoFalso = ():string => {
    return datosFalsos.correos[Math.floor(Math.random() * datosFalsos.correos.length)];
}

export const nicknameFalso = ():string => {
    return datosFalsos.nicknames[Math.floor(Math.random() * datosFalsos.nicknames.length)];
}

export const identificacionFalsa = ():string => {
    return Math.random() < 0.5 ? correoFalso() : nicknameFalso();
}

export const nombreFalso = ():string => {
    return datosFalsos.nombres[Math.floor(Math.random() * datosFalsos.nombres.length)];
}
