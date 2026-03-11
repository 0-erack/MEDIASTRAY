import jwt from 'jsonwebtoken';
import { redisDelete, redisSet, redisGet } from '../connections/redis.js';

/**
 * Crea una nueva sesion a partir del id de un usuario
 * @param id id del usuario (aqui no se comprueba que exista)
 * @param datosExtra posibles datos extras a agnadir al jwt
 * @returns el token generado
 */
export const crearSesion = async (id:string, datosExtra:Record<string, any> = {}):Promise<string> => {
    const token = await jwt.sign({ id, datosExtra, entropia: Math.random()*(Math.random()*10) }, process.env.JWT_SECRET, { expiresIn: process.env.DURACION_SESION_TOKEN ?? '20h', algorithm: 'HS256' });
    await cerrarSesion(id, token);
    await redisSet("SESSION-TOKEN-" + id, token, parseInt(process.env.DURACION_SESION ?? '72000'));
    //await redisSet("SESSION-TOKEN-" + token, id, parseInt(process.env.DURACION_SESION ?? '72000'));
    return token;
}

/**
 * Cierra la sesion de un usuario a partir de su id y su token
 * @param id 
 * @param token 
 */
export const cerrarSesion = async (id:string, token:string) => {
    await redisDelete("SESSION-TOKEN-" + id);
    //await redisDelete("SESSION-TOKEN-" + token);
}

/**
 * Ver los datos de sesion de un usuario a partir de su token de sesion
 * @param token token a descifrar
 * @returns los datos de la sesion si el token es valido o null en caso de que no
 */
export const verSesionToken = async (token:string):Promise<Record<string, any>|null> => {
    const datos = await jwt.verify(token, process.env.JWT_SECRET);
    if (!datos) return null;
    //const idGuardado = await redisGet("SESSION-TOKEN-" + token);
    //const tokenGuardado = await redisGet("SESSION-TOKEN-" + idGuardado);
    //if (token !== tokenGuardado || idGuardado !== datos.id) return null;
    return datos;
}

/**
 * Ver los datos de sesion de un usuario a partir de su id
 * @param id id del usuario a buscar
 * @returns los datos de la sesion si el token es valido o null en caso de que no
 */
export const verSesionUsuario = async (id:string):Promise<Record<string, any>|null> => {
    return await verSesionToken(await redisGet("SESSION-TOKEN-" + id) ?? '');
}

