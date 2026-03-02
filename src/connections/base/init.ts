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
            required: ["id", "sujeto", "verbo", "predicado"],
            properties: {
                id: {bsonType: "string"}, //id del objeto
                sujeto: {bsonType: "string"}, //Quien realiza la acción, id de usuario normalmente
                verbo: {bsonType: "string"}, //"like" "sigue" "edita 1" "crea" "jugado" "pertenece", para saber quien hizo x cosa o tiene permisos sobre x
                predicado: {bsonType: "string"}, //A quien se le hace la acción, puede ser el id de otro usuario, un foro, un comentario, un juego...
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
            required: ["id", "creador", "contenido", "objetivo"],
            properties: {
                id: {bsonType: "string"}, //id del objeto
                creador: {bsonType: "string"}, //id del usuario creador
                contenido: {bsonType: "string"}, //Su contenido, normalmente markdown
                objetivo: {bsonType: "string"}, //El id del objeto al que se le hace (a un foro (seria un post), a un juego, a otro post, etc)
                respuestas: {bsonType: "array"}, //Otros objetos de este tipo que hagan de respuesta (anidados)
                cantidadLikes: {bsonType: "array"} //Cantidad de likes que tiene y de quienes son (id de los usuarios)
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