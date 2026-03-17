import { TextoTraducido } from "../libraries/traducir";
import useAjustes from "./useAjustes";

const useIdioma = (idioma?:string) => {
    const { idiomaActual } = useAjustes();
    const traduccion = (seccion:string, nombre:string):string => {
        return TextoTraducido(seccion, idioma ?? idiomaActual, nombre) ?? '';
    }
    return traduccion;
};

export default useIdioma;