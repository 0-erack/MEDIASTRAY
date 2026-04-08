//Funciones de validacion y formateo relacionadas con los juegos

import { comalista, descripcionJuego, id, precio, timestamp, tituloJuego, url, version } from '../libraries/validacionesBackend';
import { Juego } from '../types/Juego';

/**
 * Valida los datos de un juego localmente
 * @param data datos del juego
 * @returns true si es valido
 */
export const validarJuegoLocal = (data:any): boolean => {
    try {
        if (typeof data === "string") data = JSON.parse(data);
        return typeof data === "object"
            && id(data?.id)
            && tituloJuego(data?.titulo)
            && data?.urlPortada1 ? url(data.urlPortada1) : true
            && data?.urlPortada2 ? url(data.urlPortada2) : true
            && data?.urlPortada3 ? url(data.urlPortada3) : true
            && data?.versionActual ? version(data.versionActual) : true
            && timestamp(data.fechaCreacion)
            && data?.fechaUltima ? timestamp(data.fechaUltima) : true
            && data?.descripcion ? descripcionJuego(data.descripcion) : true
            && data?.idCreador
            && data?.generos ? (comalista(data.generos) || Array.isArray(data?.generos)) : true
            && data?.tags ? (comalista(data.tags) || Array.isArray(data.tags)) : true
            && data?.avisos ? (comalista(data.avisos) || Array.isArray(data.avisos)) : true
            && data?.idiomas ? (comalista(data.idiomas) || Array.isArray(data.idiomas)) : true
            && data?.edad ? (!isNaN(data.edad) && data.edad >= 0 && data.edad < 100) : true
            && data?.precio ? precio(data.precio) : true;

    } catch (e) {return false;} 
}

/**
 * Transforma los datos de un juego internos del frontend al formato admitido por la api (de espagnol a ingles)
 * @param data datos del juego en formato interno
 * @returns datos del juego en formato api
 */
export const deApiAJuego = (data:Record<string, any>):Partial<Juego> => {
    return {id: data.id, fechaCreacion: data.publishDate, descripcion: data.description, titulo: data.title, publico: data.public, tokenJuego: data.token, adiciones: data.additions, idCreador: data.owner, edad: data.age, fechaUltima: data.updateDate, cantidadSeguidores: data.followers, cantidadJugadores: data.players, cantidadComentarios: data.comments, urlPortada1: data.cover1, urlPortada2: data.cover2, urlPortada3: data.cover3, versionActual: data.version, descripcionCorta: data.shortDescription, precio: data.price, generos: data.genres, tags: data.tags, idiomas: data.languages, avisos: data.warnings}
}

/**
 * Transforma los datos de un juego devuelto por la api al formato del frontend (de ingles a espagnol)
 * @param data datos del juego devueltos por la api
 * @returns juego en el formato interno del frontend
 */
export const deJuegoAApi = (data:Partial<Juego>):Record<string, any> => {
    return {id: data.id, description: data?.descripcion ?? undefined, title: data?.titulo ?? undefined, public: data?.publico ?? undefined, additions: data?.adiciones ?? undefined, age: data?.edad ?? undefined, cover1: data?.urlPortada1 ?? undefined, cover2: data?.urlPortada2 ?? undefined, cover3: data?.urlPortada3 ?? undefined, version: data?.versionActual ?? undefined, shortDescription: data?.descripcionCorta ?? undefined, price: data?.precio ?? undefined, genres: data?.generos ?? undefined, tags: data.tags, languages: data?.idiomas ?? undefined, warnings: data?.avisos ?? undefined}
}