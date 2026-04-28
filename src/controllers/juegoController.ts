//Funciones relacionadas con el manejo de juegos

import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { agnadirLog } from "../connections/logs.js";
import { mongoDelete, mongoSet } from "../connections/mongodb.js";
import { getDB } from "../connections/postgresql.js";
import { redisGet, redisSet } from "../connections/redis.js";
import { hashStringToInt, lunesMadrugada } from "../libraries/miscelanea.js";
import { juegos, usuarios } from '../models/schema.js';
import { AdicionJuego, Comentario, Intermediario } from "../models/schemaMongo.js";
import { autenticarContrasegnaUsuario } from "../routes/autenticaciones.js";
import { Juego } from "../types/Juego.js";
import { formatearJuegoMiniatura, formatearJuegoPrivado, formatearJuegoPublico, validarAdicionJuego, validarCreacionJuego, validarEdicionJuego } from "../validators/validacionesJuego.js";
import { borrarArchivoJuego } from "./archivosController.js";
import { crearTokenJuego } from "./sessionController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";


/**
 * Buscar un juego entero segun su id
 * @param id juego a buscar
 * @returns el juego en si
 */
export const buscarJuego = async (id: string): Promise<Juego | null> => {
    const db = getDB();
    const juegoPrevio = await db.select().from(juegos).where(eq(juegos.id, id)).limit(1);
    if (!juegoPrevio) return null;
    const juego = (juegoPrevio[0] as Juego) ?? null;
    return juego;
}

/**
 * Actualiza la fecha de actualizacion de un juego
 * @param id juego a actualizar
 * @returns true si ha ido todo bien
 */
export const actualizarFechaUltimaJuego = async (id: string): Promise<boolean> => {
    const juego = await buscarJuego(id);
    if (!juego) return false;
    const db = getDB();
    await db.update(juegos).set({ fechaUltima: Date.now() + "" }).where(eq(juegos.id, id));
    return true;
}

/**
 * Devuelve las adiciones de un juego, si no hay o no existe devuelve []
 * @param id juego a consultar
 * @returns objetos de mongo coincidentes
 */
const buscarAdicionesJuego = async (id: string): Promise<Array<Record<string, any>> | null> => {
    if (!id) return null;
    //const adiciones = await mongoGet("adicionJuego", {game: id}, true);
    const adiciones = await AdicionJuego.find({ game: id }).lean();
    return adiciones.map((e) => { return { ...e, game: undefined, _id: undefined } }) ?? null;
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
 * @param verPrivado obliga a devolver todos los datos incluso en juegos privados
 * @returns los datos del juego
 */
export const verJuego = async (id: string, miniatura = false, idVisor = "", adiciones = false, verPrivado = false): Promise<Partial<Juego>> => {
    const juego = await buscarJuego(id);
    if (!juego) throw { message: "Game not found", code: 404 }
    if (!verPrivado) {
        if (idVisor !== juego.idCreador && !juego.publico && !verPrivado) throw { message: "Game not found", code: 404 }
    }
    if (idVisor && !miniatura) {
        //const yaVisto = await mongoGet("intermediario", { sujeto: idVisor, verbo: "juega", predicado: id });
        const yaVisto = await Intermediario.findOne({ sujeto: idVisor, verbo: "juega", predicado: id });
        if (!yaVisto?.id) {
            await mongoSet("intermediario", { id: uuidv4(), sujeto: idVisor, verbo: "juega", predicado: id });
            const db = getDB();
            await db.update(juegos).set({ cantidadJugadores: sql`${juegos.cantidadJugadores} + 1` }).where(eq(juegos.id, id));
        }
    }
    if (miniatura) return formatearJuegoMiniatura(juego);

    if (adiciones) {
        const encontradas = await buscarAdicionesJuego(juego.id);
        juego.adiciones = encontradas ?? null;
    }
    return idVisor === juego.idCreador ? formatearJuegoPrivado(juego) : formatearJuegoPublico(juego);
}

/**
 * Borrar un juego y todo lo que eso conlleva
 * @param id juego a borrar
 * @param contrasegnaDuegno contrasegna del duegno para mas seguridad
 * @param idDuegno para comprobar quien hace la operacion, si no esta presente no se hace la comprobacion
 * @returns true si se ha borrado correctamente 
 */
export const borrarJuego = async (id: string, contrasegnaDuegno: string, idDuegno?: string): Promise<boolean> => {
    const juego = await buscarJuego(id);
    if (!juego) throw { message: "Game not found", code: 404 }
    if (idDuegno) {
        if (juego.idCreador !== idDuegno) throw { message: "Can't delete game", code: 401 }
        const duegno = await buscarUsuario(juego.idCreador as string);
        const contrasegnaCoincide = await autenticarContrasegnaUsuario(contrasegnaDuegno, duegno!.contrasegna ?? '');
        if (!contrasegnaCoincide) throw { message: "Can't delete game", code: 403 }
    }
    const db = getDB();
    const resultado = await db.delete(juegos).where(eq(juegos.id, id)).returning({ id: juegos.id });
    if (!resultado && !resultado?.length) throw { message: "Couldn't delete game", code: 500 }
    await borrarArchivoJuego(juego.id, idDuegno ?? (juego.idCreador as string));
    //await mongoDelete("adicionJuego", {game: id}, true);
    await AdicionJuego.deleteMany({ game: id });
    //await mongoDelete("intermediario", {predicado: id}, true);
    await Intermediario.deleteMany({ predicado: id });
    await Comentario.deleteMany({target: id}); //RECURSIVO RECURSIVO ERCURSIV
    //TODO: borrado en cascada
    return true;
}

/**
 * Cambia si un juego es publico o no y todo lo que eso conlleva
 * @param id juego a cambiar
 * @param estado como va a quedar
 * @param idDuegno para comprobar quien hace la operacion, si no esta presente se hace sin la comprobacion
 * @returning true si todo ha ido bien
 */
export const cambiarIndexacionJuego = async (id: string, estado: boolean, idDuegno?: string): Promise<boolean> => {
    const juego = await buscarJuego(id); 
    if (!juego) throw { message: "Game not found", code: 404 }
    if (idDuegno && juego.idCreador !== idDuegno) throw { message: "Can't update game", code: 401 }
    const db = getDB();
    const resultado = await db.update(juegos).set(estado ? { publico: estado } : {publico: estado/*, cantidadComentarios: 0, cantidadJugadores: 0, cantidadSeguidores: 0*/}).where(eq(juegos.id, id));
    if (!resultado) throw { message: "Couldn't change game settings", code: 500 }
    //TODO: deshabilitacion en cascada si termina en false
    if (estado == false) {
        await AdicionJuego.deleteMany({ game: id });
        await Intermediario.deleteMany({ predicado: id });
    }
    await actualizarFechaUltimaJuego(id);
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
    }).where(eq(juegos.id, id)).returning({ id: usuarios.id });
    const juegoFinal = await buscarJuego(id);
    if (!juegoFinal || !edicion || !edicion.length) throw { message: "Couldn't edit game", code: 500 }
    agnadirLog("db.log", "Game editted via update JUEGOS " + id);
    agnadirLog("backend.log", "Game editted " + id);
    return formatearJuegoPublico(juegoFinal);
}

/**
 * Borra las adiciones anteriores de un juego y pone solo las nuevas a modo de put
 * @param adiciones array con las nuevas adiciones
 * @param id juego a modificar
 * @param idDuegno para comprobar quien hace la operacion
 * @returns si todo ha ido bien devuelve las adiciones
 */
export const editarAdicionesJuego = async (adiciones: Array<Record<string, any>>, id: string, idDuegno: string): Promise<Array<Record<string, any>> | null> => {
    const esPremium = await usuarioTienePremium(idDuegno); //Ser premium permite pasar de 10 a 30 adiciones, similar con las imagenes
    adiciones = adiciones.map((e, i) => {
        if (!validarAdicionJuego(e) || (e.type === "imagenes" && e.data.images.length > 10 && !esPremium) || (i > 10 && !esPremium) || i > 32) throw { message: "This addition(s) is/are invalid: " + i, code: 409, data: i }
        e.game = id;
        e.id = uuidv4();
        return e;
    });
    const juego = await buscarJuego(id);
    if (!juego) throw { message: "Game not found", code: 404 }
    if (juego.idCreador !== idDuegno) throw { message: "Can't alter game", code: 401 }
    //const borrado = await mongoDelete("adicionJuego", {game: id}, true);
    const borrado = await AdicionJuego.deleteMany({ game: id });

    const nuevos = adiciones.length ? (await mongoSet("adicionJuego", adiciones.map((e) => {
        return {
            id: e.id, game: e.game, type: e.type, url: e.url ?? undefined, subtitle: e.subtitle ?? undefined, data:
                { iframe: e.data?.iframe ?? undefined, icon: e.data?.icon ?? undefined, cover: e.data?.cover ?? undefined, images: e.data?.images ?? undefined, specs: e.data?.specs ?? undefined, info: e.data?.info ?? undefined, image: e.data?.image ?? undefined, text: e.data?.text ?? undefined, nickname: e.data?.nickname ?? undefined }
        }
    }), true)) : true;
    await actualizarFechaUltimaJuego(id);
    return borrado && nuevos ? adiciones : null;
}

/**
 * Devuelve los juegos de un usuario
 * @param id usuario a buscar
 * @param idVisor que usuario hace esto, usado para saber si se ven todos los juegos o solo los publicos
 * @param pagina pagina en la que buscar
 * @returns array con los juegos de ese usuario
 */
export const verJuegosUsuario = async (id: string, idVisor: string | null, pagina = 0): Promise<Array<Partial<Juego>> | null> => {
    const usuario = await buscarUsuario(id);
    if (!usuario || usuario.nivelPublico === 2) throw { message: "User not found", code: 404 }
    const db = getDB();
    if (isNaN(pagina) || pagina < -1) pagina = 0;
    let juegosUsuario;
    if (id === idVisor) {
        //Si pagina es -1 devuelve todos, solo disponible para el propio usuario
        juegosUsuario = pagina == -1 ? await db.select().from(juegos).where(eq(juegos.idCreador, id)).orderBy(desc(juegos.cantidadJugadores))
            : await db.select().from(juegos).where(eq(juegos.idCreador, id)).orderBy(desc(juegos.cantidadJugadores)).limit(tamagnoPagina).offset(pagina * tamagnoPagina);
    } else {
        juegosUsuario = await db.select().from(juegos).where(and(eq(juegos.idCreador, id), eq(juegos.publico, true))).orderBy(desc(juegos.cantidadJugadores)).limit(tamagnoPagina).offset(pagina * tamagnoPagina);
    }
    if (!juegosUsuario || !juegosUsuario.length) throw { message: "Games not found", code: 404 }
    if (id === idVisor && pagina == -1) juegosUsuario = await Promise.all(juegosUsuario.map(async (e) => {
        const adiciones = await buscarAdicionesJuego(e.id) ?? [];
        return {...e, adiciones}
    })) 
    return juegosUsuario?.map(pagina == -1 ? formatearJuegoPublico : formatearJuegoMiniatura) ?? null;
}

/**
 * Sigue un juego o mira si el usuario lo sigue
 * @param id juego a seguir
 * @param idSeguidor usuario que realiza la accion
 * @param cantidad si es -1 deja de seguir, si es 0 simplemente devuelve si lo seguia, si es 1 lo empieza a seguir
 * @returns true si la informacion es verdadera o la operacion ha tenido exito
 */
export const seguirJuego = async (id: string, idSeguidor: string, cantidad = 0): Promise<boolean> => {
    const usuario = await buscarUsuario(idSeguidor);
    if (!usuario || usuario.nivelPublico === 2) throw { message: "User not found", code: 404 }
    const juego = await buscarJuego(id);
    if (!juego || !juego.publico) throw { message: "Game not found", code: 404 }
    if (juego.idCreador === idSeguidor) throw { message: "Can't follow your own game", code: 409 }
    //const yaLeSigue = await mongoGet("intermediario", { sujeto: idSeguidor, verbo: "sigue", predicado: id }) ?? false;
    const yaLeSigue = await Intermediario.findOne({ sujeto: idSeguidor, verbo: "sigue", predicado: id }) ?? null;
    if (cantidad == 0) {
        return yaLeSigue?.id ? true : false;
    } else {
        if (cantidad > 0 && yaLeSigue?.id) return false;
        if (cantidad < 0 && !yaLeSigue?.id) return false;
        if (cantidad < 0) await mongoDelete("intermediario", { sujeto: idSeguidor, verbo: "sigue", predicado: id }, true);
        if (cantidad > 0) await mongoSet("intermediario", { id: uuidv4(), sujeto: idSeguidor, verbo: "sigue", predicado: id, extra: { juego: true } });
        const db = getDB();
        const resultado = await db.update(juegos).set({ cantidadSeguidores: sql`${juegos.cantidadSeguidores} + ${cantidad}` }).where(eq(juegos.id, id)).returning({ id: juegos.id });
        return resultado.length ? true : false;
    }
}

/**
 * Ver los juegos que sigue un usuario
 * @param id usuario que sigue
 * @param pagina en que pagina se busca
 * @returns array con los juegos que sigue
 */
export const verJuegosSeguidos = async (id: string, pagina = 0): Promise<Array<Partial<Juego>> | null> => {
    const usuario = await buscarUsuario(id);
    if (!usuario || usuario.nivelPublico === 2) throw { message: "User not found", code: 404 }
    if (isNaN(pagina) || pagina < 0) pagina = 0;
    const seguidos = await Intermediario.find({ sujeto: id, verbo: "sigue", extra: { juego: true } }).skip(pagina * tamagnoPagina).limit(tamagnoPagina);
    if (!seguidos?.length) throw { message: "No entry found for this query", code: 404 }
    const lista = seguidos.map((e) => e.predicado);
    const db = getDB();
    const juegosSeguidos = await db.select().from(juegos).where(inArray(juegos.id, lista)).orderBy(desc(juegos.cantidadSeguidores)).limit(tamagnoPagina);
    if (!juegosSeguidos || !juegosSeguidos?.length) throw { message: "No entry found for this query", code: 404 }
    return juegosSeguidos.map(formatearJuegoMiniatura);
}

/**
 * Ver el juego diario o semanal en base a un algoritmo, intenta ayudar a los juegos menos conocidos para darles la oportunidad
 * @param semanal si se pide el semanal, si no lo que se da es el diario
 * @returns Juego escogido
 */
export const verJuegoTemporada = async (semanal = true): Promise<Record<string, any> | null> => {
    //Se guarda en redis la fecha de la proxima vez que hay que recalcular, si aun no hace falta devuelve el juego en cache, y si no lo recalcula
    //Al recalcular se establece una nueva fecha proxima y se elige un juego aleatorio de los top mas populares usando como seed la fecha de hoy
    //El algoritmo diario ayuda a juegos no tan reconocidos a darse a la luz, y el semanal es un poco mas elitista, pero nunca se mostraran los juegos mas populares
    //En un futuro se podria agnadir uno mensual, o incluso goty
    const ahora = Date.now();
    if (semanal) {
        const juegoActualizado = await redisGet("juegoSemanalUltimaFecha");
        if (!juegoActualizado || ahora >= Number(juegoActualizado)) {
            await redisSet("juegoSemanalUltimaFecha", (lunesMadrugada() + ""));
            const db = getDB();
            let candidatos = await db.select().from(juegos).where(eq(juegos.publico, true)).orderBy(desc(sql`${juegos.cantidadJugadores} + (${juegos.cantidadSeguidores} * 2)`)).limit(100);
            if (!candidatos || !candidatos?.length) return null;
            if (candidatos.length > 80) candidatos = candidatos.slice(60);
            const seed = hashStringToInt(new Date().toISOString().split('T')[0]);
            const elegido = candidatos[seed % candidatos.length];
            await redisSet("juegoSemanalActual", JSON.stringify(elegido));
            return formatearJuegoPublico(elegido);
        } else {
            const juego = JSON.parse(await redisGet("juegoSemanalActual") ?? '');
            return formatearJuegoPublico(juego) ?? null;
        }
    } else {
        const juegoActualizado = await redisGet("juegoDiarioUltimaFecha");
        if (!juegoActualizado || ahora >= Number(juegoActualizado)) {
            await redisSet("juegoDiarioUltimaFecha", (new Date()).setHours(24, 0, 0, 0) + "");
            const db = getDB();
            let candidatos = await db.select().from(juegos).where(eq(juegos.publico, true)).orderBy(desc(sql`${juegos.cantidadJugadores} + (${juegos.cantidadSeguidores} * 2)`)).limit(200);
            if (!candidatos || !candidatos?.length) return null;
            if (candidatos.length > 180) candidatos = candidatos.slice(140);
            const seed = hashStringToInt(new Date().toISOString().split('T')[0]);
            const elegido = candidatos[seed % candidatos.length];
            await redisSet("juegoDiarioActual", JSON.stringify(elegido));
            return formatearJuegoPublico(elegido);
        } else {
            const juego = JSON.parse(await redisGet("juegoDiarioActual") ?? '');
            return formatearJuegoPublico(juego) ?? null;
        }
    }
}

/**
 * Ver los juegos destacados en base a cierto criterio, se actualizan cada dia y se cachean las primeras 5 paginas, se actualizan diariamente (al actualizarse diariamente, un juego nuevo no aparecera como destacado hasta el dia siguiente, lo mismo si sus datos cambian)
 * @param pagina donde mirar
 * @returns array con los juegos de la consulta
 */
const PAGINAS_CACHEADAS = 5;
export const verJuegosDestacados = async (pagina = 0): Promise<Array<Partial<Juego>> | null> => {
    if (isNaN(pagina) || pagina < 0) pagina = 0;
    const ahora = Date.now();
    const juegoActualizado = await redisGet("juegosDestacadosUltimaFecha");
    if (!juegoActualizado || ahora >= Number(juegoActualizado)) { //Toca recalcular los juegos destacados
        const db = getDB();
        await redisSet("juegosDestacadosUltimaFecha", (new Date()).setHours(24, 0, 0, 0) + "");
        let juegosCachear = await db.select().from(juegos).where(eq(juegos.publico, true)).orderBy(desc(sql`${juegos.cantidadJugadores} + (${juegos.cantidadSeguidores} * 2)`)).limit(tamagnoPagina * PAGINAS_CACHEADAS)
        if (!juegosCachear || !juegosCachear?.length) return null;
        juegosCachear = juegosCachear.map(formatearJuegoMiniatura);
        for (let i=0;i<PAGINAS_CACHEADAS;i++) {
            await redisSet("juegosDestacados-" + i, JSON.stringify(juegosCachear.slice(tamagnoPagina * i, tamagnoPagina * (i + 1))));
        }
    }
    const cacheado = await redisGet("juegosDestacados-" + pagina)
    if (pagina < PAGINAS_CACHEADAS && cacheado) return JSON.parse(cacheado ?? '') ?? null;
    const db = getDB();
    const juegosConsulta = await db.select().from(juegos).where(eq(juegos.publico, true)).orderBy(desc(sql`${juegos.cantidadJugadores} + (${juegos.cantidadSeguidores} * 2)`)).limit(tamagnoPagina).offset(pagina * tamagnoPagina);
    if (!juegosConsulta || !juegosConsulta?.length) return null;
    return juegosConsulta.map(formatearJuegoMiniatura);
}

/**
 * Realiza una busqueda de juegos en base a un texto, admitiendo criterios de ordenanza, paginado y teniendo en cuenta el titulo, la description corta, los generos y las tags
 * @param consulta texto a buscar
 * @param pagina valor de paginado en caso de haber muchas coincidencias
 * @param orden 0 = por relevancia, 1 = alfabeticamente segun el nombre, 2 = aleatorio
 * @returns array con los juegos encontrados
 */
export const buscarJuegos = async (consulta: string, pagina = 0, orden = 0): Promise<Record<string, any>[]> => {
    const db = getDB();
    consulta = consulta.trim();
    const posiblesOrdenes = [desc(sql`${juegos.cantidadJugadores} + (${juegos.cantidadSeguidores} * 2)`), asc(juegos.titulo), sql`RANDOM()`];
    if (isNaN(orden) || orden < 0 || orden >= posiblesOrdenes.length) orden = 0;
    if (isNaN(pagina) || pagina < 0) pagina = 0;
    const juegosEncontrados = await db.select().from(juegos)
        .where(and(eq(juegos.publico, true), or(ilike(juegos.titulo, `%${consulta}%`), ilike(juegos.descripcionCorta, `%${consulta}%`), ilike(juegos.generos, `%${consulta}%`), ilike(juegos.tags, `%${consulta}%`))))
        .orderBy(posiblesOrdenes[orden]).limit(tamagnoPagina).offset(pagina * tamagnoPagina);
    if (!juegosEncontrados || !juegosEncontrados?.length)throw { message: "No entry found for this query", code: 404 }
    return juegosEncontrados.map(formatearJuegoMiniatura);
}

//optimizar select(), no formatear aqui, buscar juegos, token, archivos y encrustacion, compras y biblioteca
