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
    game: { type: String, required: true }, //Juego al que hace referencia
    /*Tipo de adicion: 
        trailer (data.iframe para youtube), 
        images (data.images array de hasta 10/32 con url de imagenes), 
        site (usado para agregar la pagina del juego o cualquier enlace, data.icon para url del icono del enlace), 
        ost (data.cover para la imagen del ost), 
        requirements (data.specs con el texto de los requerimientos en el formato que quiera el usuario), 
        event (data.info para el texto, data.image para la url de la imagen del evento), 
        text (campo de texto simple, data.text), 
        mention (data.nickname para id de un usuario)
    */
    type: { type: String, required: true }, 
    subtitle: { type: String, required: false }, //Texto de la adicion
    url: { type: String, required: false }, //URL de la adicion
    data: { type: Object, default: {url: "", subtitle: ""} } //Datos de la adicion, siempre tendra una url pero se pueden poner mas cosas dependiendo del tipo
},{
    collection: 'adicionJuego',
    timestamps: true
});

//Objeto de comentario de un usuario hacia una entidad
const ComentarioSchema = new Schema({
    id: { type: String, required: true },
    owner: { type: String, required: true }, //Que usuario comenta
    content: { type: String, required: true }, //Contenido del comentario
    target: { type: String, required: true }, //A que entidad se comenta (game_<id>, comment_<id>, forum_<id>)
    responsesAmount: {type: Number, required: false}, //Tambien se guarda cacheado la cantidad de respuestas
    featured: {type: Boolean, required: false}, //Si lo ha hecho un usuario premium y tiene que aparecer arriba
    date: {type: String, required: false}, //Timestamp de cuando se publico
    responses: { type: [String], default: [] }, //Datos con las respuestas (o si no, comentarios haciendo referencia a otros)
    likesAmount: { type: [String], default: [] } //Cantidad de likes del comentario
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
