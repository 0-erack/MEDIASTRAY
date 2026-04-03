//Funciones relacionadas con el manejo de juegos

import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { agnadirLog } from "../connections/logs.js";
import { mongoGet, mongoSet } from "../connections/mongodb.js";
import { getDB } from "../connections/postgresql.js";
import { juegos, usuarios } from '../models/schema.js';
import { autenticarContrasegnaUsuario } from "../routes/autenticaciones.js";
import { Juego } from "../types/Juego.js";
import { formatearJuegoMiniatura, formatearJuegoPrivado, formatearJuegoPublico, validarCreacionJuego, validarEdicionJuego } from "../validators/validacionesJuego.js";
import { crearTokenJuego } from "./sessionController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";


/**
 * Buscar un juego entero segun su id
 * @param id juego a buscar
 * @returns el juego en si
 */
const buscarJuego = async (id: string): Promise<Juego | null> => {
    const db = getDB();
    const juegoPrevio = await db.select().from(juegos).where(eq(juegos.id, id)).limit(1);
    const juego = (juegoPrevio[0] as Juego) ?? null;
    return juego;
}

//Tamagno de pagina estandar para las consultas
const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 50;

/**
 * Crear un juego nuevo
 * @param datosCreacion datos de la peticion al crear el juego 
 * @param idCreador id del usuario creador
 * @returns datos del juego creadoff
 */
export const crearJuego = async (datosCreacion: Record<string, any>, idCreador): Promise<Record<string, any>> => {
    const datosCorrectos = validarCreacionJuego(datosCreacion);
    const db = getDB();
    const usuarioExiste = await buscarUsuario(idCreador);
    if (!usuarioExiste || usuarioExiste.disponibilidad >= 2 || usuarioExiste.nivelPublico > 0) throw { message: "User doesn't exist or doesn't have permissions for this", code: 403 };
    const tituloExiste = await db.select({ id: juegos.id }).from(juegos).where(eq(juegos.titulo, datosCorrectos.titulo!)).limit(1);
    if (tituloExiste[0]) throw { message: "Title already in use", code: 409, data: { doubleTitle: true } };
    datosCorrectos.id = uuidv4();
    if (!(await usuarioTienePremium(usuarioExiste.id))) datosCorrectos.precio = ""; //Solo los usuarios premium pueden poner precio a sus juegos
    const tokenJuego = await crearTokenJuego(datosCorrectos.id, usuarioExiste.id);
    const creacion = await db.insert(juegos).values({
        id: datosCorrectos.id,
        titulo: datosCorrectos.titulo,
        urlPortada1: datosCorrectos.urlPortada1,
        urlPortada2: datosCorrectos.urlPortada2,
        urlPortada3: datosCorrectos.urlPortada3,
        publico: datosCorrectos.publico ? true : false,
        versionActual: datosCorrectos.versionActual,
        fechaCreacion: Date.now() + "",
        descripcion: datosCorrectos.descripcion,
        descripcionCorta: datosCorrectos.descripcionCorta,
        idCreador: usuarioExiste.id,
        tokenJuego: tokenJuego,
        generos: datosCorrectos.generos,
        tags: datosCorrectos.tags,
        idiomas: datosCorrectos.idiomas,
        avisos: datosCorrectos.avisos,
        edad: datosCorrectos.edad,
        precio: datosCorrectos.precio
    }).returning({ id: juegos.id });
    const juegoFinal = await buscarJuego(datosCorrectos.id);
    if (!creacion.length || !juegoFinal) throw { message: "Internal server error", code: 500 }
    agnadirLog("backend.log", "New game created " + juegoFinal.id);
    agnadirLog("db.log", "New game created JUEGOS " + juegoFinal.id);
    return formatearJuegoPublico(juegoFinal);
    //TODO: subida de archivos y encrustacion
}

/**
 * Ver los datos de un juego
 * @param id juego a buscar
 * @param miniatura si se pide el formato miniatura
 * @param idVisor el id del usuario que lo ve, usado para determinar que datos se muestran
 * @returns los datos del juego
 */
export const verJuego = async (id: string, miniatura = false, idVisor = ""): Promise<Partial<Juego>> => {
    const juego = await buscarJuego(id);
    if (!juego || (idVisor !== juego.idCreador && !juego.publico)) throw { message: "Game not found", code: 404 }
    if (idVisor && !miniatura) {
        const yaVisto = await mongoGet("intermediario", { sujeto: idVisor, verbo: "juega", predicado: id });
        if (!yaVisto?.id) {
            await mongoSet("intermediario", { id: uuidv4(), sujeto: idVisor, verbo: "juega", predicado: id });
            const db = getDB();
            await db.update(juegos).set({ cantidadJugadores: sql`${juegos.cantidadJugadores} + 1` }).where(eq(juegos.id, id));
        }
    }
    if (miniatura) return formatearJuegoMiniatura(juego);
    return idVisor === juego.idCreador ? formatearJuegoPrivado(juego) : formatearJuegoPublico(juego);
}

/**
 * Borrar un juego y todo lo que eso conlleva
 * @param id juego a borrar
 * @param contrasegnaDuegno contrasegna del duegno para mas seguridad
 * @param idDuegno para comprobar quien hace la operacion
 * @returns true si se ha borrado correctamente 
 */
export const borrarJuego = async (id: string, contrasegnaDuegno: string, idDuegno: string): Promise<boolean> => {
    const juego = await buscarJuego(id);
    if (!juego) throw { message: "Game not found", code: 404 }
    if (juego.idCreador !== idDuegno) throw { message: "Can't delete game", code: 401 }
    const duegno = await buscarUsuario(juego.idCreador as string);
    const contrasegnaCoincide = await autenticarContrasegnaUsuario(contrasegnaDuegno, duegno!.contrasegna ?? '');
    if (!contrasegnaCoincide) throw { message: "Can't delete game", code: 403 }
    const db = getDB();
    const resultado = await db.delete(juegos).where(eq(juegos.id, id)).returning({ id: juegos.id });
    if (!resultado && !resultado?.length) throw { message: "Couldn't delete game", code: 500 }
    //TODO: borrado en cascada
    return true;
}

/**
 * Cambia si un juego es publico o no y todo lo que eso conlleva
 * @param id juego a cambiar
 * @param estado como va a quedar
 * @param idDuegno para comprobar quien hace la operacion
 * @returning true si todo ha ido bien
 */
export const cambiarIndexacionJuego = async (id: string, estado: boolean, idDuegno: string): Promise<boolean> => {
    const juego = await buscarJuego(id);
    if (!juego) throw { message: "Game not found", code: 404 }
    if (juego.idCreador !== idDuegno) throw { message: "Can't delete game", code: 401 }
    const db = getDB();
    const resultado = await db.update(juegos).set({publico: estado}).where(eq(juegos.id, id));
    if (!resultado) throw { message: "Couldn't change game settings", code: 500 }
    //TODO: deshabilitacion en cascada si termina en false
    if (estado == false) {

    }
    agnadirLog("backend.log", "Game changed indexed " + id);
    return true;
}

export const editarJuego = async (nuevos: Record<string, any>, id: string, idDuegno: string): Promise<Record<string, any>> => {
    const datosNuevos = validarEdicionJuego(nuevos);
    const juegoPrevio = await buscarJuego(id);
    if (!juegoPrevio) throw { message: "Game not found", code: 404 }
    if (juegoPrevio.idCreador !== idDuegno) throw { message: "Can't delete game", code: 401 }
    const db = getDB();
    if (datosNuevos.titulo && datosNuevos.titulo != juegoPrevio.titulo) {
         const tituloExiste = await db.select({ id: juegos.id }).from(juegos).where(eq(juegos.titulo, datosNuevos.titulo!)).limit(1);
        if (tituloExiste[0]) throw { message: "Title already in use", code: 409, data: { doubleTitle: true } };
    }
    if (datosNuevos.precio) {
        if (!(await usuarioTienePremium(idDuegno))) datosNuevos.precio = "";
    }
    const edicion = await db.update(juegos).set({
        titulo: datosNuevos.titulo ?? juegoPrevio.titulo,
        urlPortada1: datosNuevos.urlPortada1 ?? juegoPrevio.urlPortada1,
        urlPortada2: datosNuevos.urlPortada2 ?? juegoPrevio.urlPortada2,
        urlPortada3: datosNuevos.urlPortada3 ?? juegoPrevio.urlPortada3,
        versionActual: datosNuevos.versionActual ?? juegoPrevio.versionActual,
        fechaUltima: Date.now() + "",
        descripcion: datosNuevos.descripcion ?? juegoPrevio.descripcion,
        descripcionCorta: datosNuevos.descripcionCorta ?? juegoPrevio.descripcionCorta,
        generos: datosNuevos.generos ?? juegoPrevio.generos,
        tags: datosNuevos.tags ?? juegoPrevio.tags,
        idiomas: datosNuevos.idiomas ?? juegoPrevio.idiomas,
        avisos: datosNuevos.avisos ?? juegoPrevio.avisos,
        edad: datosNuevos.edad ?? juegoPrevio.edad,
        precio: datosNuevos.precio ?? juegoPrevio.precio
    }).where(eq(juegos.id, id)).returning({id: usuarios.id});
    const juegoFinal = await buscarJuego(id);
    if (!juegoFinal || !edicion || !edicion.length) throw { message: "Couldn't edit game", code: 500 }
    agnadirLog("db.log", "Game editted via update JUEGOS " + id);
    agnadirLog("backend.log", "Game editted " + id);
    return formatearJuegoPublico(juegoFinal);
}

//ver juego diario, ver juegos destacados, buscar juegos, token, archivos
