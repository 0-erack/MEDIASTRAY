import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { mongoDelete, mongoSet } from "../connections/mongodb.js";
import { getDB } from '../connections/postgresql.js';
import { contenidoComentario } from "../libraries/validaciones.js";
import { juegos } from '../models/schema.js';
import { Comentario, Intermediario } from '../models/schemaMongo.js';
import { buscarJuego } from "./juegoController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";



/**
     * Dentro de la plataforma los comentarios son un tipo de objeto muy volatil, dinamico y rapido, lo que quiere decir que se manejaran en grandes volumenes de manera rapida
     * Por eso, al contrario que con el resto de objetos, se tratan como objetos de este tipo lo cual implica prescindir de algunas comodidades de usuario en favor al rendimiento
     * La justificacion de este tradeoff es que el hecho de que los comentarios carguen y se publiquen rapidamente y sin errores es mas importante que, por ejemplo aumente el numero en la interfaz inmediatamente al responder a uno
     * Tanto en el backend como en el frontend los comentarios estan diseñados para funcionar a la maxima velocidad a costa de detalles como estos, en terminos de disegno implementar este tipo de detalles sin perjudicar al rendimiento seria muy dificil.
*/



//Tamagno de pagina estandar para las consultas
const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 10;

/**
 * Formatea un comentario para que este presentable para la api
 * @param data comentario original
 * @returns comentario formateado
 */
const formatearPublicoComentario = (data: Record<string, any>): Record<string, any> => {
    return { ...data, _id: undefined, liked: data?.liked, fromOwner: data?.esCreador, fromMe: data?.esMio, esDestacado: undefined, respuestas: undefined, esMio: undefined, esCreador: undefined }
}

/**
 * Busca uno o varios comentarios
 * @param modo 0 = un solo comentario por su id, 1 = comentarios referentes a x objetivo, 2 = comentarios de un usuario
 * @param id id de busqueda
 * @param pagina en la que buscar
 * @param paginaSub pagina en la que buscar las respuestas a ese comentario
 * @param idCreadorObjeto id del creador del objeto comentado, sus comentarios aparecen antes
 * @param idVisor id de quien ve los comentarios, los tuyos propios aparecen primero
 * @returns array con los comentarios
 */
export const buscarComentario = async (modo: 0 | 1 | 2, id: string, pagina = 0, paginaSub = 0, idCreadorObjeto?: string, idVisor?: string): Promise<Array<Record<string, any>> | null> => {
    if (pagina < 0) pagina = 0;
    const filtro = {} as Record<string, any>;
    if (modo == 0) { filtro.id = id; filtro.parentId = { $exists: false }; }
    if (modo == 1) { filtro.target = id; } // works for games and comments
    if (modo == 2) { filtro.owner = id; filtro.parentId = { $exists: false }; }

    let resultado = await Comentario.aggregate([
        { $match: filtro },
        {
            $addFields: {
                esCreador: { $cond: { if: { $eq: ["$owner", idCreadorObjeto] }, then: 1, else: 0 } },
                esMio: { $cond: { if: { $eq: ["$owner", idVisor] }, then: 1, else: 0 } },
                esDestacado: { $cond: { if: { $eq: ["$featured", true] }, then: 1, else: 0 } }
            }
        },
        { $sort: { esCreador: -1, esMio: -1, esDestacado: -1, likesAmount: -1, responsesAmount: -1 } },
        { $skip: pagina * tamagnoPagina },
        { $limit: tamagnoPagina },
        {
            $lookup: {
                from: "comentario",
                let: { commentId: "$id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$parentId", "$$commentId"] } } },
                    {
                        $addFields: {
                            esCreador: { $cond: { if: { $eq: ["$owner", idCreadorObjeto] }, then: 1, else: 0 } },
                            esMio: { $cond: { if: { $eq: ["$owner", idVisor] }, then: 1, else: 0 } },
                            esDestacado: { $cond: { if: { $eq: ["$featured", true] }, then: 1, else: 0 } }
                        }
                    },
                    { $sort: { esCreador: -1, esMio: -1, esDestacado: -1, likesAmount: -1, responsesAmount: -1 } },
                    { $skip: paginaSub * tamagnoPagina },
                    { $limit: tamagnoPagina }
                ],
                as: "respuestas"
            }
        }
    ]);

    const ids = resultado.map(c => "comment_" + c.id);
    const todasRespuestas = await Comentario.find({ target: { $in: ids } })
        .sort({ likesAmount: -1, responsesAmount: -1 })
        .limit(tamagnoPagina)
        .lean();

    if (idVisor) {
        resultado = await Promise.all(resultado.map(async (e) => {
            const seguido = await Intermediario.findOne({ sujeto: idVisor, verbo: "like", predicado: e.id });
            return {...e, liked: seguido ? true : false};
        }));
    }
    return resultado.map((comentario) => ({
        ...formatearPublicoComentario(comentario),
        responses: todasRespuestas
            .filter(r => r.target === "comment_" + comentario.id)
            .map(formatearPublicoComentario)
    })) ?? null;

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
    const comentario = { id: idComentario, owner: usuario.id, content: contenido, target: "game_" + juego.id, responsesAmount: 0, featured: esPremium ? true : false, date: Date.now() + "", likesAmount: 0 }
    const resultado = await mongoSet("comentario", comentario);
    if (!resultado) throw { message: "Unexcepted error", code: 500 };
    const db = getDB();
    await db.update(juegos).set({ cantidadComentarios: sql`${juegos.cantidadComentarios} + 1` }).where(eq(juegos.id, id)).returning({ id: juegos.id });
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
    const comentario = await Comentario.findOne({id});
    if (!comentario) return false;
    const yaLike = await Intermediario.findOne({ sujeto: idUsuario, verbo: "like", predicado: id });
    if (cantidad == 0) {
        return yaLike?.id ? true : false;
    } else {
        if (cantidad > 0 && yaLike) return false;
        if (cantidad < 0 && !yaLike) return false;
        if (cantidad < 0) await mongoDelete("intermediario", { sujeto: idUsuario, verbo: "like", predicado: id }, true);
        if (cantidad > 0) await mongoSet("intermediario", { id: uuidv4(), sujeto: idUsuario, verbo: "like", predicado: id, extra: { comentario: true } });
        const resultado = await Comentario.updateOne({ id: id }, { $inc: { likesAmount: Number(cantidad) } });
        return resultado ? true : false;
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
    let autorObjetoComentado;
    if (modo == 1 && id.startsWith("game_")) {
        const juego = await buscarJuego(id.replaceAll("game_", ""));
        if (juego) autorObjetoComentado = juego?.idCreador;
    }
    /*if (modo == 1 && id.startsWith("comment_")) {
        return await buscarComentario(modo, id, pagina, paginaSub) ?? null;
    }*/
    if (modo == 1 && id.startsWith("forum_")) {
        //TODO: si pide forum
    }
    if (modo == 0) {
        const resultado = await Comentario.find({ id: id }).lean();
        return resultado ?? [];
    }
    if (modo == 2) {
        const resultado = await Comentario.find({ id: id }).lean();
        return resultado ?? [];
    }
    if (modo == 1 && !idVisor) {
        return await buscarComentario(modo, id, pagina, paginaSub, autorObjetoComentado ?? undefined) ?? null;
    }
    if (modo == 1 && idVisor) {
        return await buscarComentario(modo, id, pagina, paginaSub, autorObjetoComentado ?? undefined, idVisor ?? undefined) ?? null;
    }
    return null;
}

/**
 * Agnade un comentario a un comentario, a modo de respuesta. A esta respuesta tambien se le puede poner otra subrespuesta
 * @param id comentario a comentar
 * @param contenido texto del comentario
 * @param idAutor usuario que comenta
 * @returns el comentario nuevo si todo ha ido bien
 */
export const comentarComentario = async (id: string, contenido: string, idAutor: string): Promise<Record<string, any> | null> => {
    if (!contenidoComentario(contenido) || !contenido) {
        throw { message: "Missing comment content", code: 409 };
    } else {
        contenido = contenido.trim();
    }
    const usuario = await buscarUsuario(idAutor);
    if (!usuario || usuario.disponibilidad >= 2 || usuario.nivelPublico > 0) throw { message: "User doesn't exist or doesn't have permissions for this", code: 403 };
    const comentarioOriginal = await Comentario.findOne({ id: id });
    if (!comentarioOriginal) throw { message: "Comment not found", code: 404 };
    const esPremium = await usuarioTienePremium(usuario.id);
    const idComentario = uuidv4();
    const comentario = { id: idComentario, owner: usuario.id, content: contenido, target: "comment_" + id, responsesAmount: 0, featured: esPremium ? true : false, date: Date.now() + "", likesAmount: 0 }
    //const resultado = await Comentario.updateOne({id: id}, {$push: {responses: comentario}});
    const resultado = await mongoSet("comentario", comentario);
    await Comentario.updateOne({ id: id }, { $inc: { responsesAmount: 1 } });
    if (!resultado) throw { message: "Unexcepted error", code: 500 };
    return comentario ?? null;
}

/**
 * Borra un comentario y todas sus respuestas
 * @param id el comentario a borrar
 * @param idVisor quien lo borra (debe ser el duegno), si no esta presente no hace la comprobacion
 * @returns true si todo ha ido bien
 */
export const borrarComentario = async (id: string, idVisor?: string): Promise<boolean> => {
    if (idVisor) {
        const usuario = await buscarUsuario(idVisor);
        if (!usuario) throw { message: "User doesn't exist or doesn't have permissions for this", code: 403 };
    }
    const comentario = await Comentario.findOne({ id: id });
    if (!comentario) throw { message: "Comment doesn't exist or can't delete it", code: 404 };
    if (idVisor && comentario.owner !== idVisor) throw { message: "Comment doesn't exist or can't delete it", code: 404 };
    const resultado = await Comentario.deleteOne({ id: id });
    if (!resultado?.deletedCount) throw { message: "Unexcepted error", code: 500 };
    await Comentario.deleteMany({ verbo: "like", predicado: id }); //TODO: borrado en cascada intermediario seguir RECURSIVO
    if (comentario.target.startsWith("comment_")) {
        await Comentario.updateOne({ id: comentario.target }, { $inc: { commentsAmount: -1 } });
    }
    if (comentario.target.startsWith("game_")) {
        const db = getDB();
        await db.update(juegos).set({ cantidadComentarios: sql`${juegos.cantidadComentarios} - 1` }).where(eq(juegos.id, comentario.target.replaceAll("game_", ""))).returning({ id: juegos.id });
    }
    return true;
}