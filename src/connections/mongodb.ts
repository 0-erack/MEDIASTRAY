//Funciones relacionadas con Mongodb

import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
//import { inicializarMongo } from './base/init.js';

let cliente: any = null; //Conexión reusable a Mongodb
let conectado = false;

/**
 * Recibe la conexión de Mongodb
 * @returns objeto de conexion
 */
export const getConexion = async (): Promise<any> => {
    if (!cliente) {
        try {
            cliente = new MongoClient(process.env.MONGODB_URI ?? '');
            await cliente.connect();
            //inicializarMongo(cliente);
            cliente.on("close", () => {
                cliente = null;
                console.log("DESCONECTADO mongodb");
            });
            return cliente;
        } catch (error) {
            //cliente = null; getConexion();
            console.error(error);
            return null;
        }
    }
    return cliente;
}

/**
 * Inserta un json en Mongodb en una colección
 * @param collectionNombre nombre de la coleccion a la que insertar
 * @param data datos en json
 * @returns el resultado o true si todo ha ido bien
 */
export const mongoSet = async (collectionNombre: string, data: Record<string, any>|Array<Record<string, any>>, multiple = false): Promise<boolean | object> => {
    if (!cliente) await getConexion();
    try {
        const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base');
        const collection = db.collection(collectionNombre);
        if (multiple) {
             const result = await collection.insertMany(data);
            return result ?? true;
        } else {
            const result = await collection.insertOne(data);
            return result ?? true;
        }
    } catch (error) {
        //cliente = null; getConexion();
        console.error(error);
        return false;
    }
}

/**
 * Devuelve los elementos que coincidan con el json en la coleccion
 * @param collectionNombre nombre de la colecion en la que buscar
 * @param consulta objeto json para buscar
 * @param multiple si se esperan varios resultados
 * @returns resultados de la consulta
 */
export const mongoGet = async (collectionNombre: string, consulta: Record<string, any>, multiple = false): Promise<object | Record<string, any> | any> => {
    if (!cliente) await getConexion();
    try {
        const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base')//.toArray();
        const collection = db.collection(collectionNombre);
        const result = multiple ? await collection.find(consulta) : await collection.findOne(consulta);
        return result;
    } catch (error) {
        //cliente = null; getConexion();
        console.error(error);
        return null;
    }
}

/**
 * Borra el elemento que coincida con el json en la coleccion
 * @param collectionNombre coleccion en la que borrar
 * @param consulta objeto json para buscar el objeto
 * @param multiple si se van a borrar mas de uno
 * @returns el resultado o true si todo ha ido bien
 */
export const mongoDelete = async (collectionNombre: string, consulta: Record<string, any>, multiple: boolean = false): Promise<any> => {
    if (!cliente) await getConexion();
    try {
        const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base')//.toArray();
        const collection = db.collection(collectionNombre);
        if (multiple) return await collection.deleteMany(consulta);
        return await collection.deleteOne(consulta);
    } catch (error) {
        //cliente = null; getConexion();
        console.error(error);
        return null;
    }
}

/**
 * Devuelve la conexión para hacer operaciones personalizadas
 * @returns objeto de cliente
 */
export const getCliente = async (): Promise<any> => {
    if (!cliente) await getConexion();
    try {
        return cliente.db(process.env.MONGODB_DATABASE ?? 'base');
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Devuelve el objeto db de Mongoose para operaciones mas complejas
 * @returns objeto de cliente de Mongoose
 */
export const getConexionMongoose = async (): Promise<mongoose.Connection | null> => {    
    if (!conectado) {
        try {
            const uri = process.env.MONGODB_URI ?? '';
            const dbName = process.env.MONGODB_DATABASE ?? 'base';
            await mongoose.connect(uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                dbName: dbName
            });
            conectado = true;
            mongoose.connection.on("disconnected", () => {
                conectado = false;
                console.log("DESCONECTADO mongodb (Mongoose)");
            });

            return mongoose.connection;
        } catch (error) {
            console.error("Error en conexión Mongoose:", error);
            return null;
        }
    }
    return mongoose.connection;
}
export const getMongoose = async () => {
    if (!conectado) await getConexionMongoose();
    return mongoose;
}
