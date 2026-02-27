//import { MongoClient } from 'mongodb';
//import mongoose from 'mongoose';
//import { mongoSet } from '../mongodb.js';

//Operaciones iniciales para Mongodb
const inicializarMongo = async (cliente) => {
    const db = cliente.db(process.env.MONGODB_DATABASE ?? 'base');

    //Coleccion intermediaria, x cosa hace y sobre z
    const validadorIntermediario = {
        $jsonSchema: {
            bsonType: "object",
            required: ["uuid", "sujeto", "verbo", "predicado"],
            properties: {
                uuid: {bsonType: "string"}, //uuid del objeto
                sujeto: {bsonType: "string"}, //Quien realiza la acción, uuid de usuario normalmente
                verbo: {bsonType: "string"}, //"like" "sigue" "edita 1" "crea", para saber quien hizo x cosa o tiene permisos sobre x
                predicado: {bsonType: "string"}, //A quien se le hace la acción, puede ser el uuid de otro usuario, un foro, un comentario, un juego...
                extra: {bsonType: "object"} //Datos extra
            }
        }
    }
    const comandoIntermediario = {
            collMod: "intermediario",
            validator: validadorIntermediario,
            validationAction: 'warn'
    }

    //Coleccion para posts y comentarios
    const validadorComentario = {
        $jsonSchema: {
            bsonType: "object",
            required: ["uuid", "creador", "contenido", "objetivo"],
            properties: {
                uuid: {bsonType: "string"}, //uuid del objeto
                creador: {bsonType: "string"}, //uuid del usuario creador
                contenido: {bsonType: "string"}, //Su contenido, normalmente markdown
                objetivo: {bsonType: "string"}, //El uuid del objeto al que se le hace (a un foro (seria un post), a un juego, a otro post, etc)
                respuestas: {bsonType: "array"}, //Otros objetos de este tipo que hagan de respuesta (anidados)
                cantidadLikes: {bsonType: "array"} //Cantidad de likes que tiene y de quienes son (uuid de los usuarios)
            }
        }
    }
    const comandoComentario = {
            collMod: "comentario",
            validator: validadorComentario,
            validationAction: 'warn'
    }

    //Aplicar en la base de datos
    try {
        if (await db.listCollections({ name: "intermediario" }).hasNext()) {
            await db.command(comandoIntermediario);
        } else {
            await db.createCollection("intermediario");
            await db.command(comandoIntermediario);
        }

        if (await db.listCollections({ name: "comentario" }).hasNext()) {
            await db.command(comandoComentario);
        } else {
            await db.createCollection("comentario");
            await db.command(comandoComentario);
        }
    } catch (error) {
        console.log(error);
    }
}

export { inicializarMongo }