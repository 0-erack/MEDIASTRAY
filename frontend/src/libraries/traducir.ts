import { textos as rawTextos } from '../assets/textosInterfaz.json';

const textos = rawTextos as any;

const TextoTraducido = (tipo:string, idiomaActual:string, nombre:string):string => {
    return textos[tipo][idiomaActual][nombre] ?? "";
}

export { TextoTraducido, textos }