import { v4 as uuidv4 } from 'uuid';
import { Reporte } from "../models/schemaMongo.js";
import { buscarComentario } from "./comentarioController.js";
import { buscarJuego } from "./juegoController.js";
import { buscarUsuario } from "./usuarioController.js";

/**
 * Formatea un reporte de la base de datos hacia la api
 * @param reporte objeto del reporte
 * @return reporte formateado
 */
export const reporteAApi = (reporte: Record<string, any>): Record<string, any> => {
    return {_id: undefined, text: reporte.texto, idReporter: reporte.idReportador, idReportee: reporte?.idReportado ?? '', type: reporte.tipo, id: reporte.id}
}

/**
 * Reporta un objeto en la plataforma
 * @param id objeto a reportar
 * @param tipo tipo de objeto a reportar
 * @param idReportador usuario que reporta (en caso de anonimo no se pone o es "")
 * @param texto info del reporte
 * @returns true si ha ido todo bien
 */
export const reportarObjeto = async (id: string, tipo: "game"|"forum"|"comment"|"user", idReportador?: string, texto?: string): Promise<boolean> => {
    if (texto && texto.length > 256) throw { message: "Text too long", code: 409 }
    switch (tipo) {
        case "game":
            const juego = await buscarJuego(id);
            if (!juego) throw { message: "Game not found", code: 404 }
        break;
        case "forum":

        break;
        case "comment":
            const comentario = await buscarComentario(0, id);
            if (!comentario) throw { message: "Comment not found", code: 404 }
        break;
        case "user":
            const usuario = await buscarUsuario(id);
            if (!usuario) throw { message: "User not found", code: 404 }
        break;
        default: 
            return false;
        break;
    }
    if (idReportador) {
        const reportador = await buscarUsuario(idReportador);
        if (!reportador) throw { message: "User not found", code: 404 }
        const yaReportado = await Reporte.findOne({idReportado: id, idReportador: idReportador});
        if (yaReportado) throw { message: "User already reported this", code: 409, doubleReport: true }
    }
    const idNuevo = uuidv4();
    await Reporte.insertOne({id: idNuevo, texto: texto, idReportador: idReportador ?? '', tipo: tipo, idReportado: id});

    return true;
}

//TODO: admins pueden verlos, pero en admincontroller
