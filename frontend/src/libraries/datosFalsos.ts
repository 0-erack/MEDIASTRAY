import datosFalsos from '../assets/textosDummy.json';

const correoFalso = () => {
    return datosFalsos.correos[Math.floor(Math.random() * datosFalsos.correos.length)];
}

const nicknameFalso = () => {
    return datosFalsos.nicknames[Math.floor(Math.random() * datosFalsos.nicknames.length)];
}

const identificacionFalsa = () => {
    return Math.random() < 0.5 ? correoFalso() : nicknameFalso();
}

const nombreFalso = () => {
    return datosFalsos.nombres[Math.floor(Math.random() * datosFalsos.nombres.length)];
}

export { correoFalso, nicknameFalso, identificacionFalsa, nombreFalso }