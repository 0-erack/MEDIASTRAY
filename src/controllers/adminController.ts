import { Reporte } from "../models/schemaMongo.js";
import { reporteAApi } from "./reportesController.js";


//Tamagno de pagina estandar para las consultas
const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 50;

/**
 * Ver los reportes, o todos o los de cierto objeto
 * Los admins y moderadores deberian ser capaces de esto
 * @param id objeto del cual ver los reportes, si no hay nada se ve de todos
 * @param pagina en que pagina ver los reportes
 * @returns array de reportes si todo va bien
 */
export const verReportes = async (id?: string, pagina = 0): Promise<Array<Record<string,any>>|null> => {
    if (isNaN(pagina) || pagina < 0) pagina = 0;
    const reportes = await Reporte.find(id ? {$or: [{id: id}, {idReportado: id}, {idReportador: id}]} : undefined).skip(pagina * tamagnoPagina).limit(tamagnoPagina).lean();
    return reportes?.map(reporteAApi) ?? null;
}

/**
 * Borrar un reporte
 * Los admins y moderadores deberian ser capaces de esto
 * @param id el reporte a borrar
 * @returns true si se ha borrado
 */
export const eliminarReporte = async (id: string): Promise<boolean> => {
    const resultado = await Reporte.deleteOne({id: id});
    return resultado.deletedCount ? true : false;
}

//eliminar comentario
//eliminar juego
//quitar publico juego
//eliminar usuario
//restringir usuario

//ver cualquier juego
//ver cualquier usuario
//dar/quitar admin (solo supremo)