import fs from 'fs';
import path from "path";
import unzipper from 'unzipper';
import { v4 as uuidv4 } from 'uuid';
import { borrarArchivo, escribirArchivo } from "../connections/archivos.js";
import { nombreArchivo } from '../libraries/validaciones.js';
import { Archivo } from "../models/schemaMongo.js";
import { buscarJuego } from "./juegoController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";

/**
 * Publicar un archivo de juego
 * @param usuario quien sube el juego
 * @param juego id del juego al que subir el archivo
 * @param archivo objeto de blob de la api
 * @param nombre tag del archivo subido
 * @returns ruta para descargar
 */
export const subirArchivosJuego = async (idUsuario: string, idJuego: string, archivo: any, nombre: string): Promise<string|null> => {
    const usuario = await buscarUsuario(idUsuario);
    if (!usuario || usuario.disponibilidad >= 2 || usuario.nivelPublico > 0) throw { message: "User not found", code: 404 };
    
    const juego = await buscarJuego(idJuego);
    if (!juego) throw { message: "Game not found", code: 404 };
    if (!nombreArchivo(nombre)) throw { message: "File name not situable", code: 409 };

    const previos = await Archivo.find({juego: idJuego}).lean();
    const existente = previos.filter((e) => {return e.nombre === nombre});
    if (existente?.length) throw { message: "Name already in use for this game", code: 409, doubleName: true };

    const esPremium = await usuarioTienePremium(idUsuario, false);
    const ruta = path.join(process.env.GAMES_FILES_PATH ?? './games', idJuego, nombre);
    if (!esPremium) {
        if (previos.length >= 2) throw { message: "Non premium users can only post up to 2 files", code: 409, manyFiles: true };
        if (archivo.buffer.length > 2147483648) throw { message: "Non premium users can only post files up to 2GB", code: 409, tooLong: true };
    }
    if (previos.length >= 8) throw { message: "Premium users can post up to 8 files", code: 409, manyFiles: true };
    if (archivo.buffer.length > 8589934592) throw { message: "Premium users can post files up to 8GB", code: 409, tooLong: true };
    const id = uuidv4();
    await Archivo.insertOne({id: id, nombre: nombre, juego: idJuego, peso: archivo.buffer.length, fecha: Date.now() + ""});
    const resultado = await escribirArchivo(archivo.buffer, ruta, nombre + ".zip", false);
    if (!resultado) throw { message: "Couldn't save file", code: 500 };
    if (nombre == "web") fs.createReadStream(path.join(ruta, nombre + ".zip")).pipe(unzipper.Extract({ path: ruta })); //No es await porque se espera que tarde un rato largo y el dato no es necesario ahora
    //await borrarArchivo(path.join(ruta, nombre + ".zip"));










    //TODO: limpiar y sdk











    return "/games/" + idJuego;
}

/**
 * Borrar un archivo de juego y su registro
 * @param idJuego juego a manipular
 * @param idUsuario que usuario hace la operacion
 * @param nombre el archivo a borrar, si no hay nada borra todos
 * @return true si ha ido todo bien
 */
export const borrarArchivoJuego = async (idJuego: string, idUsuario: string, nombre?: string): Promise<boolean> => {
    const usuario = await buscarUsuario(idUsuario);
    if (!usuario) throw { message: "User not found", code: 404 };
    const juego = await buscarJuego(idJuego);
    if (!juego || juego.idCreador !== usuario.id) throw { message: "Game not found", code: 404 };
    const resultado = await Archivo.deleteOne(nombre ? {juego: idJuego, nombre: nombre} : {juego: idJuego});
    if (!resultado.deletedCount) throw { message: "Game files not found", code: 404 };
    const ruta = nombre ? path.join(process.env.GAMES_FILES_PATH ?? './games', idJuego, nombre) : path.join(process.env.GAMES_FILES_PATH ?? './games', idJuego);
    const borrado = await borrarArchivo(ruta);
    return borrado;
}

/**
 * Listar los archivos de un juego
 * @param idJuego juego al que consultar los archivos
 * @param idVisor usuario que lo ve
 * @returns array con la presentacion de los archivos si va todo bien
 */
export const listarArchivosJuego = async (idJuego: string, idVisor?:string): Promise<Array<Record<string, any>|null>> => {
    const juego = await buscarJuego(idJuego);
    if (!juego) throw { message: "Game not found", code: 404 };
    if (idVisor) {
        if (juego.idCreador !== idVisor && !juego.publico) throw { message: "Game not found", code: 404 };
    } else if (!juego.publico) throw { message: "Game not found", code: 404 };
    const archivos = await Archivo.find({juego: idJuego}).lean();
    if (!archivos.length) return [];
    return archivos.map((e) => {return {id: e.id, name: e.nombre, size: e.peso, date: e.fecha, game: e.juego}});
}