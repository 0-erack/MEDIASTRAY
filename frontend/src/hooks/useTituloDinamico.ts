import React, { useEffect } from "react";
import { cambiarTitulo } from "../libraries/accionesIndex.js";
import { TextoTraducido } from "../libraries/traducir.js";
import useAjustes from "./useAjustes.js";

const useTituloDinamico = (dondeIdioma, extra) => {

    const { idiomaActual } = useAjustes();
    useEffect(()=>{
      cambiarTitulo((extra ?? '') + TextoTraducido("titulosHtml", idiomaActual, dondeIdioma ?? 'nada') + " - MEDIASTRAY");
    }, [idiomaActual]);
    
  return { };
};

export default useTituloDinamico;