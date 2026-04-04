//Entidades en la base de datos de mongo, cada una en su coleccion

import { Schema, model } from 'mongoose';

//Objeto de relacion para cuando un objeto hace x a otro
const IntermediarioSchema = new Schema({
    id: { type: String, required: true },
    sujeto: { type: String, required: true }, //Entidad qeu realiza la accion
    verbo: { type: String, required: true }, //Que accion se hace: sigue, reporta, like, juega, pertenece
    predicado: { type: String, required: true }, //Entidad a las que se le hace la accion
    extra: { type: Object, default: {} } //Datos extra
}, { 
    collection: 'intermediario',
    timestamps: true
});

//Objeto para ampliar la informacion de un juego
const AdicionJuegoSchema = new Schema({
    id: { type: String, required: true },
    juego: { type: String, required: true }, //Juego al que hace referencia
    tipo: { type: String, required: true }, //Tipo de adicion: trailer (datos.iframe para youtube), pagina (usado para agregar la pagina del juego o cualquier enlace, data.icono para url del icono del enlace), ost (datos.portadaDisco para la imagen del ost), imagenes (datos.imagenes array de hasta 10/30 con url de imagenes), requerimientos (data.specs con el texto de los requerimientos en el formato que quiera el usuario), eventos (data.info para el texto, data.imagen para la url de la imagen del evento), texto (campo de texto simple, data.texto), mencion (data.nickname para id de un usuario)
    datos: { type: Object, default: {url: "", subtitulo: ""} } //Datos de la adicion, siempre tendra una url pero se pueden poner mas cosas dependiendo del tipo
},{
    collection: 'adicionJuego',
    timestamps: true
});

//Objeto de comentario de un usuario hacia una entidad
const ComentarioSchema = new Schema({
    id: { type: String, required: true },
    creador: { type: String, required: true }, //Que usuario comenta
    contenido: { type: String, required: true }, //Contenido del comentario
    objetivo: { type: String, required: true }, //A que entidad se comenta
    respuestas: { type: [String], default: [] }, //Datos con las respuestas (o si no, comentarios haciendo referencia a otros)
    cantidadLikes: { type: [String], default: [] } //Cantidad de likes del comentario
}, { 
    collection: 'comentario'
});

//Objeto de test
const TestInitSchema = new Schema({
    nombre: String,
    numero: Number
}, { collection: 'test-init' });

const WildcardSchema = new Schema({
    id: { type: String, required: true },
    data: {type: Object, default: {}}
}, { collection: 'test-init' });

export const Intermediario = model('Intermediario', IntermediarioSchema);
export const AdicionJuego = model('AdicionJuego', AdicionJuegoSchema);
export const Comentario = model('Comentario', ComentarioSchema);
export const Test = model('Test', TestInitSchema);
export const Wildcard = model('Wildcard', WildcardSchema);
