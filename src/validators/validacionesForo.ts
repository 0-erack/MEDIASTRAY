//Funciones de formateo y validacion de los juegos

import { descripcionForo, id, timestamp, tituloForo, url } from "../libraries/validaciones.js";
import { Foro } from "../types/Foro.js";

/**
 * Valida los datos para crear un foro
 * @param data datos a validar
 * @returns el foro en si si es valido para la operacion
 * @throws error si no es valido
 */
export const validarCreacionForo = (data:any) : Partial<Foro> => {if (!id(data.id)) throw new Error("Invalid id");
    if (!tituloForo(data.titulo)) throw new Error("Invalid title");
    if (data.urlBanner != undefined && !url(data.urlBanner)) throw new Error("Invalid game cover 1");
    if (data.urlFoto != undefined && !url(data.urlFoto)) throw new Error("Invalid game cover 2");
    if (data.descripcion != undefined && !descripcionForo(data.descripcion)) throw new Error("Invalid description");
    if (data.juegoAsociado != undefined && (!id(data.juegoAsociado) && !('id' in data.juegoAsociado))) throw new Error("Invalid game");
    return {titulo: data.title?.trim(), urlBanner: data?.banner?.trim() ?? undefined, urlFoto: data?.cover?.trim() ?? undefined, descripcion: data?.description?.trim() ?? undefined, juegoAsociado: data?.juegoAsociado ?? undefined}
}

/**
 * Valida los datos para editar un foro
 * @param data datos a validar
 * @returns el foro en si si es valido para la operacion
 * @throws error si no es valido
 */
export const validarEdicionForo = (data:any) : Record<string, any> => {if (!tituloForo(data.titulo)) throw new Error("Invalid title");
    if (data.urlBanner != undefined && !url(data.urlBanner)) throw new Error("Invalid game cover 1");
    if (data.urlFoto != undefined && !url(data.urlFoto)) throw new Error("Invalid game cover 2");
    if (data.descripcion != undefined && !descripcionForo(data.descripcion)) throw new Error("Invalid description");
    return {urlBanner: data?.banner?.trim() ?? undefined, urlFoto: data?.cover?.trim() ?? undefined, descripcion: data?.description?.trim() ?? undefined}
}

/**
 * Valida los datos de un foro entero en el formato que deberia tener en la base de datos
 * @param data datos a validar
 * @returns el foro en si si es valido
 * @throws error si no es valido
 */
export const validarForo = (data:Foro) : Foro => {
    if (!id(data.id)) throw new Error("Invalid id");
    if (!tituloForo(data.titulo)) throw new Error("Invalid title");
    if (data.urlBanner != undefined && !url(data.urlBanner)) throw new Error("Invalid game cover 1");
    if (data.urlFoto != undefined && !url(data.urlFoto)) throw new Error("Invalid game cover 2");
    if (!timestamp(data.fechaCreacion)) throw new Error("Invalid date");
    if (data.descripcion != undefined && !descripcionForo(data.descripcion)) throw new Error("Invalid description");
    if (!id(data.idCreador) && !('id' in data.idCreador)) throw new Error("Invalid owner");
    if (data.juegoAsociado != undefined && (!id(data.juegoAsociado) && !('id' in data.juegoAsociado))) throw new Error("Invalid game");
    if (data.cantidadSeguidores < 0) throw new Error("Invalid followers amount");
    if (data.cantidadComentarios < 0) throw new Error("Invalid comments amount");
    return data;
}

/**
 * Formatea los datos para mostrar los que sean publicos de un foro
 * @param data foro en crudo
 * @returns datos correctos para la api
 */
export const formatearForoPublico = (data:Partial<Foro>): Record<string, any> => {
    return {id: data.id, owner: data.idCreador, game: data.juegoAsociado, publishDate: data.fechaCreacion, followers: data.cantidadSeguidores, title: data.titulo, banner: data.urlBanner, cover: data.urlFoto, description: data.descripcion, commentsAmount: data.cantidadComentarios}
}
