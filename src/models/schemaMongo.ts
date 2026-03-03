import mongoose, { Schema, model } from 'mongoose';

const IntermediarioSchema = new Schema({
    id: { type: String, required: true },
    sujeto: { type: String, required: true },
    verbo: { type: String, required: true },
    predicado: { type: String, required: true },
    extra: { type: Object, default: {} }
}, { 
    collection: 'intermediario',
    timestamps: true
});

const ComentarioSchema = new Schema({
    id: { type: String, required: true },
    creador: { type: String, required: true },
    contenido: { type: String, required: true },
    objetivo: { type: String, required: true },
    respuestas: { type: [String], default: [] },
    cantidadLikes: { type: [String], default: [] }
}, { 
    collection: 'comentario'
});

const TestInitSchema = new Schema({
    nombre: String,
    numero: Number
}, { collection: 'test-init' });

const WildcardSchema = new Schema({
    id: { type: String, required: true },
    data: {type: Object, default: {}}
}, { collection: 'test-init' });

export const Intermediario = model('Intermediario', IntermediarioSchema);
export const Comentario = model('Comentario', ComentarioSchema);
export const Test = model('Test', TestInitSchema);
export const Wildcard = model('Wildcard', WildcardSchema);
