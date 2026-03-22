import { TextoTraducido } from "../libraries/traducir";
import useAjustes from "./useAjustes";

/**
 * Hook para tener los textos traducidos mas rapido
 * @param idioma idioma al que tarducir, si no se incluye se usa el actual
 * @returns funcion de traduccion
 */
const useIdioma = (idioma?:string) => {
    const { idiomaActual } = useAjustes();
    /**
     * En base al idioma escogido, traduce un texto
     * @param seccion donde esta en textosInterfaz.json
     * @param nombre nombre del texto
     * @returns texto tarducido
     */
    const traduccion = (seccion:string, nombre:string):string => {
        return TextoTraducido(seccion, idioma ?? idiomaActual, nombre) ?? '';
    }
    return traduccion;
};

export default useIdioma;