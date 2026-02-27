import { useEffect } from "react";
import { cambiarTitulo } from "../libraries/accionesIndex";
import { TextoTraducido } from "../libraries/traducir";
import useAjustes from "./useAjustes";

const useTituloDinamico = (dondeIdioma:string, extra?:string) => {

    const { idiomaActual } = useAjustes();
    useEffect(()=>{
      cambiarTitulo((extra ?? '') + TextoTraducido("titulosHtml", idiomaActual, dondeIdioma ?? 'nada') + " - MEDIASTRAY");
    }, [idiomaActual, extra, dondeIdioma]);
    
  return { };
};

export default useTituloDinamico;