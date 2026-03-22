import { useEffect } from "react";
import { cambiarTitulo } from "../libraries/accionesIndex";
import { TextoTraducido } from "../libraries/traducir";
import useAjustes from "./useAjustes";

/**
 * Cambiar el titulo de la pestagna
 * @param dondeIdioma de normal se busca en textosInterfaz.json .titulosHtml.dondeIdioma, asi que esto es el nombre de la propiedad
 * @param extra texto extra a agregar
 */
const useTituloDinamico = (dondeIdioma:string, extra?:string) => {

    const { idiomaActual } = useAjustes();
    useEffect(()=>{
      cambiarTitulo((extra ?? '') + TextoTraducido("titulosHtml", idiomaActual, dondeIdioma ?? 'nada') + " - MEDIASTRAY");
    }, [idiomaActual, extra, dondeIdioma]);
    
  return { };
};

export default useTituloDinamico;