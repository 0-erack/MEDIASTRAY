import { TextoTraducido } from "../libraries/traducir";
import useAjustes from "./useAjustes";

const useIdioma = (seccion:string, nombre:string, idioma?:string):string => {
    const { idiomaActual } = useAjustes();
    return TextoTraducido(seccion, idioma ?? idiomaActual, nombre) ?? '';
};

export default useIdioma;