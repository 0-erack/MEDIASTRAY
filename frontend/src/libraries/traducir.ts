import { textos } from '../assets/textosInterfaz.json';

const TextoTraducido = (tipo, idiomaActual, nombre) => {
    return textos[tipo][idiomaActual][nombre] ?? "";
}

export { TextoTraducido, textos }