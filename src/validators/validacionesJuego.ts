//Funciones de formateo y validacion de los juegos

import { comalista, descripcionCortaJuego, descripcionJuego, id, nickname, precio, subtituloAdicionJuego, timestamp, tituloJuego, url, version } from "../libraries/validaciones.js";
import { Juego } from "../types/Juego.js";
//import { Usuario } from "../types/Usuario.js";

/**
 * Valida los datos para crear un juego
 * @param data datos a validar
 * @returns el juego en si si es valido para la operacion
 * @throws error si no es valido
 */
export const validarCreacionJuego = (data:any) : Partial<Juego> => {
    if (!tituloJuego(data.title)) throw new Error("Invalid title");
    if (data.cover1 != undefined && !url(data.cover1)) throw new Error("Invalid game cover 1");
    if (data.cover2 != undefined && !url(data.cover2)) throw new Error("Invalid game cover 2");
    if (data.cover3 != undefined && !url(data.cover3)) throw new Error("Invalid game cover 3");
    if (typeof data.public !== "boolean") throw new Error("Invalid publicness");
    if (data.version != undefined && !version(data.version)) throw new Error("Invalid game version");
    if (data.description != undefined && !descripcionJuego(data.description)) throw new Error("Invalid description");
    if (data.shortDescription != undefined && !descripcionCortaJuego(data.shortDescription)) throw new Error("Invalid short description");
    if (data.genres != undefined && !(Array.isArray(data.genres) || comalista(data.genres))) throw new Error("Invalid genre list");
    if (data.tags != undefined && !(Array.isArray(data.tags) || comalista(data.tags))) throw new Error("Invalid tag list");
    if (data.languages != undefined && !(Array.isArray(data.languages) || comalista(data.languages))) throw new Error("Invalid language list");
    if (data.warnings != undefined && !(Array.isArray(data.warnings) || comalista(data.warnings))) throw new Error("Invalid warnings list");
    if (data.price != undefined && !precio(data.price)) throw new Error("Invalid price");
    if (data.age != undefined && data.age > 100 || data.age < 0) throw new Error("Invalid age");
    if (Array.isArray(data.genres)) data.genres = data.genres.map((e) => e.toLowerCase()?.trim()).join(",");
    if (Array.isArray(data.tags)) data.tags = data.tags.map((e) => e.toLowerCase()?.trim()).join(",");
    if (Array.isArray(data.languages)) data.languages = data.languages.map((e) => e.trim()).join(",");
    if (Array.isArray(data.warnings)) data.warnings = data.warnings.map((e) => e.toLowerCase()?.trim()).join(",");
    return {titulo: data.title?.trim(), edad: data.age, urlPortada1: data.cover1?.trim() ?? undefined, urlPortada2: data.cover2?.trim() ?? undefined, urlPortada3: data.cover3?.trim() ?? undefined, publico: data.public, versionActual: data.version?.trim() ?? undefined, descripcion: data.description, descripcionCorta: data.shortDescription?.trim() ?? undefined, precio: data.price?.trim() ?? undefined, generos: data.genres, tags: data.tags, idiomas: data.languages, avisos: data.warnings}
}

/**
 * Valida los datos para editar un juego
 * @param data datos a validar
 * @returns el juego en si si es valido para la operacion
 * @throws error si no es valido
 */
export const validarEdicionJuego = (data:any) : Record<string, any> => {
    if (data.title !== undefined && !tituloJuego(data.title)) throw new Error("Invalid title");
    if (data.cover1 != undefined && !url(data.cover1)) throw new Error("Invalid game cover 1");
    if (data.cover2 != undefined && !url(data.cover2)) throw new Error("Invalid game cover 2");
    if (data.cover3 != undefined && !url(data.cover3)) throw new Error("Invalid game cover 3");
    if (data.version != undefined && !version(data.version)) throw new Error("Invalid game version");
    if (data.description != undefined && !descripcionJuego(data.description)) throw new Error("Invalid description");
    if (data.shortDescription != undefined && !descripcionCortaJuego(data.shortDescription)) throw new Error("Invalid short description");
    if (data.genres != undefined && !(Array.isArray(data.genres) || comalista(data.genres))) throw new Error("Invalid genre list");
    if (data.tags != undefined && !(Array.isArray(data.tags) || comalista(data.tags))) throw new Error("Invalid tag list");
    if (data.languages != undefined && !(Array.isArray(data.languages) || comalista(data.languages))) throw new Error("Invalid language list");
    if (data.warnings != undefined && !(Array.isArray(data.warnings) || comalista(data.warnings))) throw new Error("Invalid warnings list");
    if (data.price != undefined && !precio(data.price)) throw new Error("Invalid price");
    if (data.age != undefined && data.age > 100 || data.age < 0) throw new Error("Invalid age");
    if (Array.isArray(data.genres)) data.genres = data.genres.map((e) => e.toLowerCase()?.trim()).join(",");
    if (Array.isArray(data.tags)) data.tags = data.tags.map((e) => e.toLowerCase()?.trim()).join(",");
    if (Array.isArray(data.languages)) data.languages = data.languages.map((e) => e.trim()).join(",");
    if (Array.isArray(data.warnings)) data.warnings = data.warnings.map((e) => e.toLowerCase()?.trim()).join(",");
    return {titulo: data.title?.trim(), edad: data.age, urlPortada1: data.cover1?.trim() ?? undefined, urlPortada2: data.cover2?.trim() ?? undefined, urlPortada3: data.cover3?.trim() ?? undefined, versionActual: data.version?.trim() ?? undefined, descripcion: data.description, descripcionCorta: data.shortDescription?.trim() ?? undefined, precio: data.price?.trim() ?? undefined, generos: data.genres, tags: data.tags, idiomas: data.languages, avisos: data.warnings}
}

/**
 * Valida los datos de un juego entero en el formato que deberia tener en la base de datos
 * @param data datos a validar
 * @returns el juego en si si es valido
 * @throws error si no es valido
 */
export const validarJuego = (data:Juego) : Juego => {
    if (!id(data.id)) throw new Error("Invalid id");
    if (!tituloJuego(data.titulo)) throw new Error("Invalid title");
    if (data.urlPortada1 != undefined && !url(data.urlPortada1)) throw new Error("Invalid game cover 1");
    if (data.urlPortada2 != undefined && !url(data.urlPortada2)) throw new Error("Invalid game cover 2");
    if (data.urlPortada3 != undefined && !url(data.urlPortada3)) throw new Error("Invalid game cover 3");
    if (typeof data.publico !== "boolean") throw new Error("Invalid publicness");
    if (data.versionActual != undefined && !version(data.versionActual)) throw new Error("Invalid game version");
    if (!timestamp(data.fechaCreacion)) throw new Error("Invalid date");
    if (!timestamp(data.fechaUltima)) throw new Error("Invalid update date");
    if (data.descripcion != undefined && !descripcionJuego(data.descripcion)) throw new Error("Invalid description");
    if (data.descripcionCorta != undefined && !descripcionCortaJuego(data.descripcionCorta)) throw new Error("Invalid short description");
    if (!id(data.idCreador) && !('id' in data.idCreador)) throw new Error("Invalid owner");
    if (data.generos != undefined && !(Array.isArray(data.generos) || comalista(data.generos))) throw new Error("Invalid genre list");
    if (data.tags != undefined && !(Array.isArray(data.tags) || comalista(data.tags))) throw new Error("Invalid tag list");
    if (data.idiomas != undefined && !(Array.isArray(data.idiomas) || comalista(data.idiomas))) throw new Error("Invalid language list");
    if (data.avisos != undefined && !(Array.isArray(data.avisos) || comalista(data.avisos))) throw new Error("Invalid warnings list");
    if (isNaN(data.cantidadSeguidores) || data.cantidadSeguidores < 0) throw new Error("Invalid followers amount");
    if (isNaN(data.cantidadJugadores) || data.cantidadJugadores < 0) throw new Error("Invalid players amount");
    if (isNaN(data.cantidadComentarios) || data.cantidadComentarios < 0) throw new Error("Invalid comments amount");
    if (data.precio != undefined && !precio(data.precio)) throw new Error("Invalid price");
    if (data.edad != undefined && data.edad > 100 || data.edad! < 0) throw new Error("Invalid age");
    return data;
}

/**
 * Formatea los datos para mostrar los que sean publicos de un juego
 * @param data juego en crudo
 * @returns datos correctos para la api
 */
export const formatearJuegoPublico = (data:Partial<Juego>): Record<string, any> => {
    if (typeof data.avisos == "string") data.avisos = data.avisos!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.tags == "string") data.tags = data.tags!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.idiomas == "string") data.idiomas = data.idiomas!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.generos == "string") data.generos = data.generos!.split(",").filter(Boolean).map(e => e?.trim());
    return {id: data.id, public: data.publico, owner: data.idCreador, age: data.edad, additions: data.adiciones, publishDate: data.fechaCreacion, updateDate: data.fechaUltima, followers: data.cantidadSeguidores, players: data.cantidadJugadores, comments: data.cantidadComentarios, title: data.titulo, cover1: data.urlPortada1, cover2: data.urlPortada2, cover3: data.urlPortada3, version: data.versionActual, description: data.descripcion, shortDescription: data.descripcionCorta, price: data.precio, genres: data.generos, tags: data.tags, languages: data.idiomas, warnings: data.avisos}
}

/**
 * Formatea los datos para mostrar todos los datos de un juego
 * @param data juego en crudo
 * @returns datos correctos para la api
 */
export const formatearJuegoPrivado = (data:Partial<Juego>): Record<string, any> => {
    if (typeof data.avisos == "string") data.avisos = data.avisos!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.tags == "string") data.tags = data.tags!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.idiomas == "string") data.idiomas = data.idiomas!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.generos == "string") data.generos = data.generos!.split(",").filter(Boolean).map(e => e?.trim());
    return {token: data.tokenJuego, public: data.publico, additions: data.adiciones, id: data.id, owner: data.idCreador, age: data.edad, publishDate: data.fechaCreacion, updateDate: data.fechaUltima, followers: data.cantidadSeguidores, players: data.cantidadJugadores, comments: data.cantidadComentarios, title: data.titulo, cover1: data.urlPortada1, cover2: data.urlPortada2, cover3: data.urlPortada3, version: data.versionActual, description: data.descripcion, shortDescription: data.descripcionCorta, price: data.precio, genres: data.generos, tags: data.tags, languages: data.idiomas, warnings: data.avisos}
}

/**
 * Formatea los datos para mostrar lo indispensable de un juego
 * @param data juego en crudo
 * @returns datos correctos para la api
 */
export const formatearJuegoMiniatura = (data:Partial<Juego>): Record<string, any> => {
    if (typeof data.tags == "string") data.tags = data.tags!.split(",").filter(Boolean).map(e => e?.trim());
    if (typeof data.generos == "string") data.generos = data.generos!.split(",").filter(Boolean).map(e => e?.trim());
    return {id: data.id, additions: data.adiciones, owner: data.idCreador, followers: data.cantidadSeguidores, players: data.cantidadJugadores, title: data.titulo, cover1: data.urlPortada1, cover2: data.urlPortada2, shortDescription: data.descripcionCorta, price: data.precio, genres: data.generos, tags: data.tags}
}

/**
 * Valida los datos de una adicion de juego entrante
 * @param data una sola adicion tal cual llega por la api y tal cual se guardaria en la base de datos
 * @returns true si es correcta
 */
export const validarAdicionJuego = (data: any): boolean => {
    if (typeof data !== "object" || typeof data.data !== "object" || typeof data.type !== "string" || data._id || data.id || data.game) return false;
    if ((data.url != undefined && !url(data.url)) || (data.subtitle != undefined && !subtituloAdicionJuego(data.subtitle))) return false;
    switch (data.type) {
        case "trailer": 
            if (data.data.iframe != undefined && (typeof data.data.iframe !== "string" || data.data.iframe.length > 430)) return false;
            break;
        case "site": 
            if (data.data.icon != undefined && !url(data.data.icon)) return false;
            break;
        case "ost": 
            if (data.data.cover != undefined && !url(data.data.cover)) return false;
            break;
        case "images": 
            if (!Array.isArray(data.data.images) || data.data.images.length > 32 || !data.data.images.length || !data.data.images.every(url)) return false;
            break;
        case "requirements": 
            if (typeof data.data.specs !== "string" || !data.data.specs.length || data.data.specs.length > 1024) return false;
            break;
        case "event": 
            if (data.data.image != undefined && !url(data.data.image)) return false;
            if (typeof data.data.info !== "string" || !data.data.info.length || data.data.info.length > 128) return false;
            break;
        case "text": 
            if (typeof data.data.text !== "string" || !data.data.text.length || data.data.text.length > 64) return false;
            break;
        case "mention": 
            if (!nickname(data.data.nickname)) return false;
            break;        
        default: 
            return false;
    }
    return true;
}