//Funciones para manejar datos con Redis

import { createClient } from 'redis';

let cliente:any = null; //Conexión reusable a Redis

/**
 * Establecer la conexión a Redis
 * @returns resultado de la operacion
 */
export const getConexion = async ():Promise<any> => {
    if (!cliente) {
        try {
            const client = createClient({ url: `redis://${process.env.REDIS_HOST}` });
            client.on('error', err => console.log('Redis Client Error', err));
            await client.connect();
            cliente = client;
            cliente.on("end", () => {
                cliente = null;
                console.log("DESCONECTADO redis");
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    return cliente;
}

/**
 * Establecer un valor en Redis
 * @param clave clave en la base de datos
 * @param valor valor a guardar
 * @param ttl milisegundos de caducidad
 * @returns true si todo ha ido bien
 */
export const redisSet = async (clave:string, valor:string, ttl?:number):Promise<boolean> => {
    if (!cliente) await getConexion();
    try {
        await cliente.set(clave, valor, {EX: ttl});
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

/**
 * Leer un valor de Redis
 * @param clave a buscar
 * @returns el valor de eesa clave o null si no existe o ha habido algun error
 */
export const redisGet = async (clave:string):Promise<string|null> => {
    if (!cliente) await getConexion();
    try {
        return await cliente.get(clave);
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * Borrar un registro en redis manualmente
 * @param clave registro a borrar
 * @returns true si se ha borrado correctamente y existia
 */
export const redisDelete = async (clave:string):Promise<boolean> => {
    if (!cliente) await getConexion();
    try {
        await cliente.del(clave);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

/**
 * Devuelve la conexión para hacer operaciones personalizadas
 * @returns objeto de conexion a Redis
 */
export const getCliente = async ():Promise<any> => {
    if (!cliente) await getConexion();
    try {
        return cliente;
    } catch (error) {
        console.error(error);
        return null;
    }
}

//getConexion();
