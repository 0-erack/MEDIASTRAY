import { MongoClient } from 'mongodb';
import { inicializarMongo } from './base/init.js';

let cliente:any = null; //Conexión reusable a Mongodb

//Recibe la conexión de Mongodb
const getConexion = async ():Promise<any> => {
    if (!cliente) {
        try {
            cliente = new MongoClient(process.env.MONGODB_URI ?? '');
            await cliente.connect();
            inicializarMongo(cliente);
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

//Inserta un json en Mongodb en una colección
const mongoSet = async (collectionNombre:string, data:Record<string,any>):Promise<boolean|object> => {
    if (!cliente) await getConexion();
    try {
        const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base');
        const collection = db.collection(collectionNombre);
        const result = await collection.insertOne(data);
        return result ?? true;
    } catch (error) {
        //cliente = null; getConexion();
        console.error(error);
        return false;
    }
}

//Devuelve los elementos que coincidan con el json en la coleccion
const mongoGet = async (collectionNombre:string, consulta:Record<string,any>):Promise<object|Record<string,any>|any> => {
    if (!cliente) await getConexion();
    try {
        const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base')//.toArray();
        const collection = db.collection(collectionNombre);
        const result = await collection.findOne(consulta);
        return result;
    } catch (error) {
        //cliente = null; getConexion();
        console.error(error);
        return null;
    }
}

//Borra el elemento que coincida con el json en la coleccion
const mongoDelete = async (collectionNombre:string, consulta:Record<string,any>, multiple:boolean = false):Promise<any> => {
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

//Devuelve la conexión para hacer operaciones personalizadas
const getCliente = async ():Promise<any> => {
    if (!cliente) await getConexion();
    try {
        return cliente.db(process.env.MONGODB_DATABASE ?? 'base');
    } catch (error) {
        console.error(error);
        return null;
    }
}

export { getConexion, mongoGet, mongoSet, getCliente, mongoDelete }
