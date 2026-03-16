import { v4 as uuidv4 } from 'uuid';
import { contrasegna as validarContrasegna } from '../libraries/validaciones.js';
import bcrypt from 'bcrypt';
import { getDB } from '../connections/postgresql.js';
import { agnadirLog } from '../connections/logs.js';
import { mongoDelete, mongoGet, mongoSet } from '../connections/mongodb.js';
import { autenticarContrasegnaUsuario } from '../routes/autenticaciones.js';
import { Usuario } from '../types/Usuario.js';
import { formatearUsuarioMiniatura, formatearUsuarioPrivado, formatearUsuarioPublico, validarCreacionUsuario, validarEdicionUsuario, validarLoginUsuario } from '../validators/validacionesUsuario.js';
import { eq, or, ilike, sql, inArray, desc } from 'drizzle-orm';
import { usuarios } from '../models/schema.js';
import { crearSesion, cerrarSesion } from './sessionController.js';
import { Intermediario } from '../models/schemaMongo.js';


/**
 * Busca un usuario en la base de datos segun su id
 * @param id el id a buscar
 * @returns el usuario encontrado, o null si no se ha encontrado
 */
const buscarUsuario = async (id: string): Promise<Usuario | null> => {
    const db = getDB();
    const usuarioPrevio = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
    const usuario = usuarioPrevio[0] as Usuario;
    if (!usuario || !usuarioPrevio.length) return null;
    return usuario;
}

/**
 * Efectua un borrado en cascada de un usuario en las entidades fuera de sql
 * @param id usuario a hacer el borrado en cascada
 */
const cascadaUsuario = async (id: string): Promise<boolean> => {
    try {
        await cerrarSesion(id);
        const usuariosSeguidos = await Intermediario.find({ sujeto: id, verbo: "sigue" });
        const ids = usuariosSeguidos.map(e => e.predicado);
        const db = getDB();
        await db.update(usuarios).set({ cantidadSeguidores: sql`${usuarios.cantidadSeguidores} - 1` }).where(inArray(usuarios.id, ids));
        await Intermediario.deleteMany({ sujeto: id });
        await Intermediario.deleteMany({ predicado: id });
        return true;
    } catch (e) { return false }
}

//Tamagno de pagina estandar para las consultas
const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 50;

/**
 * Registrarse, requiere en el body (usuario): nombre, nickname, correo, contrasegna, cumpleagnos. Devuelve un token de sesion
 * @param datos datos del registro
 * @returns usuario final creado y el token de sesion
 */
export const crearUsuario = async (datos: Record<string, any>): Promise<Record<string, any>> => {
    const usuarioCreado = validarCreacionUsuario(datos);
    const db = getDB();
    const nicknameExiste = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.nickname, usuarioCreado.nickname!)).limit(1);
    const correoExiste = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.correo, usuarioCreado.correo!)).limit(1);
    if (nicknameExiste[0]) throw { message: "Nickname already in use", code: 409, data: { doubleNickname: true } };
    if (correoExiste[0]) throw { message: "Email already in use", code: 409, data: { doubleEmail: true } };
    usuarioCreado.id = uuidv4();
    usuarioCreado.contrasegna = await bcrypt.hash(usuarioCreado.contrasegna!, 10);
    usuarioCreado.fechaCreacion = Date.now() + "";
    const token = await crearSesion(usuarioCreado.id, { recienCreado: true });
    const creacion = await db.insert(usuarios).values({
        id: usuarioCreado.id,
        nickname: usuarioCreado.nickname,
        nombre: usuarioCreado.nombre,
        contrasegna: usuarioCreado.contrasegna,
        correo: usuarioCreado.correo,
        cumpleagnos: usuarioCreado.cumpleagnos,
        fechaCreacion: usuarioCreado.fechaCreacion
    }).returning({ id: usuarios.id });
    if (!creacion.length) throw { message: "Internal server error", code: 500 }
    const usuarioFinal = await buscarUsuario(usuarioCreado.id);
    agnadirLog("backend.log", "New user created " + usuarioCreado.id);
    agnadirLog("db.log", "New user created USUARIOS " + usuarioCreado.id);
    return { token: token, usuario: formatearUsuarioPrivado(usuarioFinal!) };
}

/**
 * Hacer login con el usuario, requiere en el body (credentials): contrasegna, identificacion (su correo o nickname). Devuelve un token de sesion valido por 4 horas y los datos del usuario
 * @param datosLogin identificacion para el login
 * @returns datos del usuairo y token de sesion
 */
export const loginUsuario = async (datosLogin: Record<string, any>): Promise<Record<string, any>> => {
    if (!validarLoginUsuario(datosLogin)) throw { message: "Invalid user data", code: 422 }
    const db = getDB();
    const elUsuario = await db.select().from(usuarios).where(or(eq(usuarios.nickname, datosLogin.identification), eq(usuarios.correo, datosLogin.identification))).limit(1);
    if (!elUsuario[0]?.id) throw { message: "User not found", code: 404 }
    const contrasegnaCoincide = await autenticarContrasegnaUsuario(datosLogin.password, elUsuario[0].contrasegna);
    if (!elUsuario[0] || !contrasegnaCoincide) throw { message: "Invalid credentials", code: 403 };
    const usuario = elUsuario[0] as Partial<Usuario>;
    if (elUsuario[0].disponibilidad === 3) throw { message: "User has not allowed login", code: 403 };
    const token = await crearSesion(usuario.id!);
    usuario.contrasegna = undefined;
    agnadirLog("backend.log", "User logged in " + usuario.id);
    return { token, usuario: formatearUsuarioPrivado(usuario) };
}

/**
 * Cierra la sesion de un usuario
 * @param id usuario al cual cerrar la sesion
 * @param token opcionalmente el token de sesion
 * @returns 
 */
export const logoutUsuario = async (id: string, token?: string): Promise<boolean> => {
    await cerrarSesion(id, token);
    return true;
}

/**
 * Editar un usuario actualizando sus datos, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
 * Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, urlFoto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
 * @param nuevos nuevos datos a actualizar
 * @param id usuario a actualizar
 * @returns usuario con los nuevos datos
 */
export const editarUsuario = async (nuevos: Record<string, any>, id: string): Promise<Record<string, any>> => {
    const datosNuevos = validarEdicionUsuario(nuevos);
    const usuarioPrevio = await buscarUsuario(id);
    if (!usuarioPrevio) throw { message: "Invalid credentials", code: 403 };
    if (usuarioPrevio.disponibilidad >= 2) throw { message: "User has not allowed login edit credentials nor profile", code: 403 };
    let edicionAutenticada = false; //Hace referencia a si la peticion esta autorizada para editar datos sensibles
    //Solo se pide la contrasegna original si se va a cambiar a otra distinta
    if (datosNuevos.contrasegnaAntigua != undefined) { 
        const contrasegnaCoincide = await autenticarContrasegnaUsuario(datosNuevos.contrasegnaAntigua, usuarioPrevio.contrasegna!);
        if (contrasegnaCoincide) {
            edicionAutenticada = true;
        } else {
            throw { message: "Validate password is needed", code: 422, data: { failedPassword: true } }
        }
    }
    const db = getDB();
    if (datosNuevos.nickname && datosNuevos.nickname !== usuarioPrevio.nickname) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 422, data: { failedPassword: true } };
        const conEseNickname = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.nickname, datosNuevos.nickname!)).limit(1);
        if (conEseNickname[0]) throw { message: "Nickname already in use", code: 409, data: { doubleNickname: true } };
    }
    if (datosNuevos.correo && datosNuevos.correo !== usuarioPrevio.correo) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 422, data: { failedPassword: true } };
        const conEseEmail = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.correo, datosNuevos.correo!)).limit(1);
        if (conEseEmail[0]) throw { message: "Email already in use", code: 409, data: { doubleEmail: true } };
    }
    if (datosNuevos.contrasegna && datosNuevos.cambiarContrasegna) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 422, data: { failedPassword: true } };
        if (!validarContrasegna(datosNuevos.contrasegna)) throw { message: "New password doesnt have the required security", code: 422, data: { failedPassword: true } };
        datosNuevos.contrasegna = await bcrypt.hash(datosNuevos.contrasegna, 10);
    } else {
        datosNuevos.contrasegna = usuarioPrevio.contrasegna;
    }
    const resultado = await db.update(usuarios).set({
        nombre: datosNuevos.nombre ?? usuarioPrevio.nombre,
        contrasegna: datosNuevos.contrasegna ?? usuarioPrevio.contrasegna,
        nickname: datosNuevos.nickname ?? usuarioPrevio.nickname,
        urlFoto: datosNuevos.urlFoto ?? usuarioPrevio.urlFoto,
        descripcion: datosNuevos.descripcion ?? usuarioPrevio.descripcion,
        cumpleagnos: datosNuevos.cumpleagnos || usuarioPrevio.cumpleagnos,
        correo: datosNuevos.correo ?? usuarioPrevio.correo
    }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    if (resultado.length) {
        const token = await crearSesion(id);
        const usuarioFinal = await buscarUsuario(id);
        usuarioFinal!.contrasegna! = "";
        agnadirLog("backend.log", "User editted " + id);
        agnadirLog("db.log", "User editted via update USUARIOS " + id);
        return { usuarioRenovado: formatearUsuarioPrivado(usuarioFinal!), tokenNuevo: token }
    } else {
        throw { message: "There was an error updating the user", code: 400 };
    }
}

/**
 * Borra el usuario, requiere de su contrasegna en el body asi como el token de sesion
 * Esta accion tiene un borrado en cascada
 * @param contrasegna seguridad adicional antes de borrar
 * @param id usuario a borrar
 * @returns 
 */
export const borrarUsuario = async (contrasegna: string, id: string): Promise<boolean> => {
    const usuario = await buscarUsuario(id);
    if (!usuario || !validarContrasegna(contrasegna)) throw { message: "Invalid credentials", code: 403 };
    const contrasegnaCoincide = await autenticarContrasegnaUsuario(contrasegna, usuario.contrasegna!);
    if (contrasegnaCoincide) {
        const db = getDB();
        const resultado = await db.delete(usuarios).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
        if (resultado.length) {
            await cascadaUsuario(usuario.id);
            agnadirLog("backend.log", "User deleted " + id);
            agnadirLog("db.log", "User deleted USUARIOS " + id);
            return true;
        } else {
            throw { message: "Couldn't delete user", code: 500 }
        }
    } else {
        throw { message: "Validate password is needed", code: 422 }
    }
}

/**
 * Devuelve datos básicos y públicos de un usuario a partir de su id o su nickname
 * @param id usuario a buscar, sirven el id o el nickname
 * @param publico si se van a devolver solo los datos publicos
 * @returns datos del usuario
 */
export const verUsuario = async (id: string, publico = true): Promise<Record<string, any>> => {
    const db = getDB();
    const usuario = await db.select().from(usuarios).where(or(eq(usuarios.id, id), eq(usuarios.nickname, id))).limit(1);
    if (!usuario[0] || usuario[0].nivelPublico === 2) throw { message: "User not found", code: 404 }
    if (usuario[0].nivelPublico === 1) {
        return { ...usuario, contrasegna: "", correo: undefined, cumpleagnos: "", cantidadSeguidores: 0, premium: "", };
    }
    if (publico) {
        return formatearUsuarioPublico(usuario[0]);
    } else {
        return formatearUsuarioPrivado(usuario[0]);
    }
}

/**
 * Altera la disponibilidad de un usuario (no para api), 0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
 * Si se establece a 3 se elimina toda la informacion referente a sus seguidores y seguidos
 * @param nuevoValor valor a establecer en el campo
 * @param id usuario a afectar
 * @returns 
 */
export const alterarDisponibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ disponibilidad: nuevoValor }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    if (nuevoValor == 3) await cascadaUsuario(id);
    agnadirLog("backend.log", `User ${id} altered its disponibility to ${nuevoValor}`);
    return resultado ? true : false;
}

/**
 * Altera la visibilidad del usuario, 0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
 * Si se establece a 2 se elimina toda la informacion referente a sus seguidores y seguidos
 * @param nuevoValor valor a establecer en el campo
 * @param id usuario a afectar
 * @returns 
 */
export const alterarVisibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ nivelPublico: nuevoValor }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    if (nuevoValor == 2) await cascadaUsuario(id);
    agnadirLog("backend.log", `User ${id} altered its visibility to ${nuevoValor}`);
    return resultado ? true : false;
}

/**
 * Renueva el premium de un usuario estableciendo la fecha de caducidad
 * @param id usuario a a fectar
 * @param fechaCaducidad timestamp con la nueva fecha de caducidad del premium
 * @returns 
 */
export const alterarPremiumUsuario = async (id: string, fechaCaducidad: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ premium: fechaCaducidad }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    agnadirLog("backend.log", "User got premium " + id);
    agnadirLog("db.log", "User got premium USUARIO to current date " + id);
    return resultado ? true : false;
}

/**
 * Altera la cantidad de seguidores de un usuario (en su registro sql), si la cantidad es 0 devuelve si el usuario a sigue al b sin alterar nada
 * @param idA usuario que sigue
 * @param idB usuario seguido 
 * @param cantidad 1 para seguir, -1 para dejar de seguir, 0 para ver el valor
 * @returns como ha acabado la interaccion
 */
export const alterarSeguidores = async (idA: string, idB: string, cantidad: number): Promise<boolean> => {
    const yaLeSigue = await mongoGet("intermediario", { sujeto: idA, verbo: "sigue", predicado: idB }) ?? false;
    if (cantidad === 0) return yaLeSigue.id;
    const usuarioA = await buscarUsuario(idA);
    const usuarioB = await buscarUsuario(idB);
    if (!usuarioA || !usuarioB || usuarioA.nivelPublico >= 1 || usuarioB.nivelPublico >= 1 || usuarioA.disponibilidad >= 2 || usuarioB.disponibilidad >= 2) throw { message: "User not found", code: 404 }
    const seguidoresPrevios = usuarioB.cantidadSeguidores;
    const db = getDB();
    if (yaLeSigue?.id && cantidad < 0) { //Dejar de seguir
        await mongoDelete("intermediario", { sujeto: idA, verbo: "sigue", predicado: idB }, true);
    } else if (!yaLeSigue?.id && cantidad > 0) { //Seguir
        await mongoSet("intermediario", { id: uuidv4(), sujeto: idA, verbo: "sigue", predicado: idB, extra: { nicknameA: usuarioA.nickname, nicknameB: usuarioB.nickname } });
    } else {
        return false;
    }
    const resultado = await db.update(usuarios).set({ cantidadSeguidores: seguidoresPrevios + cantidad }).where(eq(usuarios.id, idB)).returning({ id: usuarios.id });
    return resultado.length ? true : false;
}

/**
 * Devuelve los seguidos o los seguidores de un usuario
 * @param id usuario al cual hacerle la consulta
 * @param pagina pagina en la que buscar en caso de que la lista sea muy larga
 * @param seguidos si se buscan los seguidos o los seguidores
 * @returns datos del seguimiento
 */
export const verSeguimientosUsuario = async (id: string, pagina = 0, seguidos = false): Promise<Record<string, any>[]> => {
    const usuario = await buscarUsuario(id);
    if (!usuario || usuario.nivelPublico >= 1 || usuario.disponibilidad >= 2) throw { message: "User not found", code: 404 }
    const lista = seguidos ?
        await Intermediario.find({ sujeto: id, verbo: "sigue" }).skip(pagina * tamagnoPagina).limit(tamagnoPagina) :
        await Intermediario.find({ predicado: id, verbo: "sigue" }).skip(pagina * tamagnoPagina).limit(tamagnoPagina);
    if (!lista.length) throw { message: "No entry found for this query", code: 404 }
    return lista.map((e) => {
        return { id: seguidos ? e.predicado : e.sujeto, nickname: seguidos ? e.extra.nicknameB ?? '' : e.extra.nicknameA ?? '' }
    });
}

/**
 * Realiza una busqueda de usuarios, teniendo en cuenta su nickname y su nombre, ordenado por seguidores
 * @param consulta texto a buscar
 * @param pagina valor de paginado en caso de haber muchas coincidencias
 * @returns array con los usuarios encontrados
 */
export const buscarUsuarios = async (consulta: string, pagina = 0): Promise<Record<string, any>[]> => {
    const db = getDB();
    const usuariosEncontrados = await db.select({ id: usuarios.id, urlFoto: usuarios.urlFoto, nickname: usuarios.nickname })
        .from(usuarios).where(or(ilike(usuarios.nickname, `%${consulta}%`), ilike(usuarios.nombre, `%${consulta}%`)))
        .orderBy(desc(usuarios.cantidadSeguidores)).limit(tamagnoPagina).offset(pagina * tamagnoPagina);
    if (!usuariosEncontrados.length) throw { message: "No entry found for this query", code: 404 }
    return usuariosEncontrados.map((e) => {
        return formatearUsuarioMiniatura(e);
    });
}

/**
 * Consulta si un usuario es premium o no, mirando si la fecha actual esta antes de la fecha de caducidad
 * @param id usuario a consultar
 * @returns si es premium o no
 */
export const usuarioTienePremium = async (id: string): Promise<boolean> => {
    const db = getDB();
    const usuario = await db.select({ premium: usuarios.premium }).from(usuarios).where(eq(usuarios.id, id)).limit(1);
    if (!usuario.length) return false;
    let fecha: any = Number(usuario[0].premium);
    if (isNaN(fecha)) return false;
    fecha = new Date(fecha);
    if (isNaN(fecha.getTime())) return false;
    return fecha > new Date();
}

/**
 * Consulta si un usuario tiene permisos de administracion
 * @param id usuario a consultar
 * @returns si es admin
 */
export const usuarioEsAdmin = async (id: string): Promise<boolean> => {
    const usuario = await buscarUsuario(id);
    if (!usuario) return false;
    return usuario.nivelAcceso >= 1 && usuario.disponibilidad < 2;//&& usuario.nivelPublico < 2;
}
