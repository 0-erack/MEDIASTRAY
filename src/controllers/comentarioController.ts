import { v4 as uuidv4 } from 'uuid';
import { mongoDelete, mongoSet } from "../connections/mongodb.js";
import { contenidoComentario } from "../libraries/validaciones.js";
import { Comentario, Intermediario } from '../models/schemaMongo.js';
import { buscarJuego } from "./juegoController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";


//Tamagno de pagina estandar para las consultas
const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 50;

/**
 * Busca uno o varios comentarios
 * @param modo 0 = un solo comentario por su id, 1 = comentarios referentes a x objetivo, 2 = comentarios de un usuario
 * @param id id de busqueda
 * @param pagina en la que buscar
 * @param paginaSub pagina en la que buscar las respuestas a ese comentario
 * @param idCreadorObjeto id del creador del objeto comentado, sus comentarios aparecen antes
 * @returns array con los comentarios
 */
export const buscarComentario = async (modo: 0 | 1 | 2, id: string, pagina = 0, paginaSub = 0, idCreadorObjeto?: string): Promise<Array<Record<string, any>> | null> => {
    if (pagina < 0) pagina = 0;
    const filtro = {} as Record<string, any>;
    if (modo == 0) filtro.id = id;
    if (modo == 1) filtro.target = id;
    if (modo == 2) filtro.owner = id;
    //Orden: idCreadorObjeto == owner, featured == true, por likesAmount, por responsesAmount
    const resultado = await Comentario.aggregate([
        { $match: filtro },
        {
            $addFields: {
                esCreador: { $cond: { if: { $eq: ["$owner", idCreadorObjeto] }, then: 1, else: 0 } },
                esDestacado: { $cond: { if: { $eq: ["$featured", true] }, then: 1, else: 0 } }
            }
        },
        { $sort: { esCreador: -1, esDestacado: -1, likesAmount: -1, responsesAmount: -1 } },
        { $skip: pagina * tamagnoPagina },
        { $limit: tamagnoPagina },
        {
            $addFields: {
                respuestas: {
                    $slice: [
                        {
                            $sortArray: {
                                input: "$responses",
                                sortBy: { esCreador: -1, esDestacado: -1, likesAmount: -1, responsesAmount: -1 }
                            }
                        },
                        paginaSub * tamagnoPagina,
                        tamagnoPagina
                    ]
                }
            }
        }
    ]);
    return resultado ?? null;
}

/**
 * Pone un comentario a un juego
 * @param id juego que comentar
 * @param contenido texto del comentario
 * @param idAutor quien lo comenta
 * @returns datos enteros del comentario subido
 */
export const comentarJuego = async (id: string, contenido: string, idAutor: string): Promise<Record<string, any>> => {
    if (!contenidoComentario(contenido) || !contenido) {
        throw { message: "Missing comment content", code: 409 };
    } else {
        contenido = contenido.trim();
    }
    const usuario = await buscarUsuario(idAutor);
    if (!usuario || usuario.disponibilidad >= 2 || usuario.nivelPublico > 0) throw { message: "User doesn't exist or doesn't have permissions for this", code: 403 };
    const juego = await buscarJuego(id);
    if (!juego || !juego.publico) throw { message: "Game not found", code: 404 };
    const esPremium = await usuarioTienePremium(usuario.id);
    const idComentario = uuidv4();
    const comentario = { id: idComentario, onwer: usuario.id, content: contenido, target: "game_" + juego.id, responsesAmount: 0, featured: esPremium ? true : false, date: Date.now() + "", responses: [], likesAmount: 0 }
    const resultado = await mongoSet("comentario", comentario);
    if (!resultado) throw { message: "Unexcepted error", code: 500 };
    return comentario;
}

/**
 * Cambia el estado de like a un comentario o lo lee
 * @param id comentario a consultar
 * @param idUsuario usuario que haria el like
 * @param cantidad -1 quitar like, 0 leer, 1 poner like
 * @returns el estado de like o si se manipula, true si ha ido bien
 */
export const likeComentario = async (id: string, idUsuario: string, cantidad = 0): Promise<boolean> => {
    const usuario = await buscarUsuario(idUsuario);
    if (!usuario || usuario.nivelPublico === 2) throw { message: "User not found", code: 404 }
    const yaLike = await Intermediario.findOne({ sujeto: idUsuario, verbo: "sigue", perdicado: id }) ?? null;
    if (cantidad == 0) {
        return yaLike?.id ? true : false;
    } else {
        if (cantidad > 0 && yaLike?.id) return false;
        if (cantidad < 0 && !yaLike?.id) return false;
        if (cantidad < 0) await mongoDelete("intermediario", { sujeto: idUsuario, verbo: "sigue", predicado: id }, true);
        if (cantidad > 0) await mongoSet("intermediario", { id: uuidv4(), sujeto: idUsuario, verbo: "sigue", predicado: id, extra: { comentario: true } });
        const resultado = await Comentario.updateOne({ id: id }, { $inc: { likesAmount: cantidad } });
        return resultado.modifiedCount !== 0;
    }
}

/**
 * Busca uno o varios comentarios, primero los tuyos, luego los que ha dado like, luego los destacados y luego el resto
 * @param modo 0 = un solo comentario por su id, 1 = comentarios referentes a x objetivo, 2 = comentarios de un usuario
 * @param id id de busqueda
 * @param pagina en la que buscar
 * @param paginaSub pagina en la que buscar las respuestas a ese comentario
 * @param idVisor id de quien esta haciendo esta consulta, se usa para mostrar que comentarios ha dado like o que aparezcan los suyos arriba
 * @returns array con los comentarios
 */
export const verComentario = async (modo: 0 | 1 | 2, id: string, pagina = 0, paginaSub = 0, idVisor?: string): Promise<Array<Record<string, any>> | null> => {
    if (isNaN(pagina) || pagina < 0) pagina = 0;
    if (isNaN(paginaSub) || paginaSub < 0) paginaSub = 0;
    if (isNaN(modo) || modo < 0 || modo > 2) paginaSub = 0;
    if (!idVisor) {
        return await buscarComentario(modo, id, pagina, paginaSub) ?? null;
    }


    //Buscar creador de objeto y pasar a la funcion adf asdkf ajsdlkf 



    return [];
}


//like/dislike, comentar comentario, eliminar comentario, borrado en cascada en juegos, tus comentarios aparecen primero asi como los que te gustan, rutas y testing
