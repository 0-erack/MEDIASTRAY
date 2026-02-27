import datosFalsos from '../assets/textosDummy.json';

const correoFalso = ():string => {
    return datosFalsos.correos[Math.floor(Math.random() * datosFalsos.correos.length)];
}

const nicknameFalso = ():string => {
    return datosFalsos.nicknames[Math.floor(Math.random() * datosFalsos.nicknames.length)];
}

const identificacionFalsa = ():string => {
    return Math.random() < 0.5 ? correoFalso() : nicknameFalso();
}

const nombreFalso = ():string => {
    return datosFalsos.nombres[Math.floor(Math.random() * datosFalsos.nombres.length)];
}

export { correoFalso, nicknameFalso, identificacionFalsa, nombreFalso }