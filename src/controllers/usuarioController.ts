import { v4 as uuidv4 } from 'uuid';
import { contrasegna as validarContrasegna } from '../libraries/validaciones.js';
import bcrypt from 'bcrypt';
import { getDB } from '../connections/postgresql.js';
import { agnadirLog } from '../connections/logs.js';
import { mongoDelete, mongoGet, mongoSet } from '../connections/mongodb.js';
import { autenticarContrasegnaUsuario } from '../routes/autenticaciones.js';
import { Usuario } from '../types/Usuario.js';
import { formatearUsuarioPrivado, formatearUsuarioPublico, validarCreacionUsuario, validarEdicionUsuario, validarLoginUsuario } from '../validators/validacionesUsuario.js';
import { eq, or } from 'drizzle-orm';
import { usuarios } from '../models/schema.js';
import { crearSesion, cerrarSesion, verSesionToken, verSesionUsuario } from './sessionController.js';
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

const tamagnoPagina = parseInt(process.env.TAMAGNO_PAGINA as string) || 50;

//Registrarse, requiere en el body (usuario): nombre, nickname, correo, contrasegna, cumpleagnos. Devuelve un token de sesion
export const crearUsuario = async (datos: Record<string, any>): Promise<Record<string, any>> => {
    const usuarioCreado = validarCreacionUsuario(datos);
    const db = getDB();
    const nicknameExiste = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.nickname, usuarioCreado.nickname!)).limit(1);
    const correoExiste = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.correo, usuarioCreado.correo!)).limit(1);
    if (nicknameExiste[0]) throw { message: "Nickname already in use", code: 400, data: { doubleNickname: true } };
    if (correoExiste[0]) throw { message: "Email already in use", code: 400, data: { doubleEmail: true } };
    usuarioCreado.id = uuidv4();
    usuarioCreado.contrasegna = await bcrypt.hash(usuarioCreado.contrasegna!, 10);
    usuarioCreado.fechaCreacion = Date.now() + "";
    const token = await crearSesion(usuarioCreado.id, { recienCreado: true });
    const creacion = await db.insert(usuarios).values({ id: usuarioCreado.id, nickname: usuarioCreado.nickname, nombre: usuarioCreado.nombre, contrasegna: usuarioCreado.contrasegna, correo: usuarioCreado.correo, cumpleagnos: usuarioCreado.cumpleagnos, fechaCreacion: usuarioCreado.fechaCreacion }).returning({ id: usuarios.id });
    if (!creacion.length) throw { message: "Internal server error", code: 500 }
    const usuarioFinal = await buscarUsuario(usuarioCreado.id);
    agnadirLog("backend.log", "New user created " + usuarioCreado.id);
    agnadirLog("db.log", "New user created USUARIOS " + usuarioCreado.id);
    return { token: token, usuario: formatearUsuarioPrivado(usuarioFinal!) };
}

//Hacer login con el usuario, requiere en el body (credentials): contrasegna, identificacion (su correo o nickname). Devuelve un token de sesion valido por 4 horas y los datos del usuario
export const loginUsuario = async (datosLogin: Record<string, any>): Promise<Record<string, any>> => {
    if (!validarLoginUsuario(datosLogin)) throw { message: "Invalid user data", code: 401 }
    const db = getDB();
    const elUsuario = await db.select().from(usuarios).where(or(eq(usuarios.nickname, datosLogin.identification), eq(usuarios.correo, datosLogin.identification))).limit(1);
    if (!elUsuario[0]?.id) throw { message: "User not found", code: 404 }
    const contrasegnaCoincide = await autenticarContrasegnaUsuario(datosLogin.password, elUsuario[0].contrasegna);
    if (!elUsuario[0] || !contrasegnaCoincide) throw { message: "Invalid credentials", code: 401 };
    const usuario = elUsuario[0] as Partial<Usuario>;
    if (elUsuario[0].disponibilidad === 3) throw { message: "User has not allowed login", code: 401 };
    const token = await crearSesion(usuario.id!);
    usuario.contrasegna = undefined;
    agnadirLog("backend.log", "User logged in " + usuario.id);
    return { token, usuario: formatearUsuarioPrivado(usuario) };
}

//Cierra la sesion de un usuario
export const logoutUsuario = async (id: string, token: string): Promise<boolean> => {
    await cerrarSesion(id, token);
    return true;
}

//Editar un usuario actualizando sus datos, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
//Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, urlFoto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
export const editarUsuario = async (nuevos: Record<string, any>, id: string): Promise<Record<string, any>> => {
    const datosNuevos = validarEdicionUsuario(nuevos);
    const usuarioPrevio = await buscarUsuario(id);
    if (!usuarioPrevio) throw { message: "Invalid credentials", code: 401 };
    if (usuarioPrevio.disponibilidad >= 2) throw { message: "User has not allowed login edit credentials nor profile", code: 401 };
    let edicionAutenticada = false; //Hace referencia a si la peticion esta autorizada para editar datos sensibles
    if (datosNuevos.cambiarContrasegna && datosNuevos.contrasegnaAntigua != undefined) { //Solo se pide la contrasegna original si se va a cambiar a otra distinta
        const contrasegnaCoincide = await autenticarContrasegnaUsuario(datosNuevos.contrasegnaAntigua, usuarioPrevio.contrasegna!);
        if (contrasegnaCoincide) {
            edicionAutenticada = true;
        } else {
            throw { message: "Validate password is needed", code: 401, data: { failedPassword: true } }
        }
    }
    const db = getDB();
    if (datosNuevos.nickname && datosNuevos.nickname !== usuarioPrevio.nickname) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 401 };
        const conEseNickname = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.nickname, datosNuevos.nickname!)).limit(1);
        if (conEseNickname[0]) throw { message: "Nickname already in use", code: 401, data: { doubleNickname: true } };
    }
    if (datosNuevos.correo && datosNuevos.correo !== usuarioPrevio.correo) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 401 };
        const conEseEmail = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.correo, datosNuevos.correo!)).limit(1);
        if (conEseEmail[0]) throw { message: "Email already in use", code: 401, data: { doubleEmail: true } };
    }
    if (datosNuevos.contrasegna && datosNuevos.cambiarContrasegna) {
        if (!edicionAutenticada) throw { message: "Validate password is needed", code: 401 };
        if (!validarContrasegna(datosNuevos.contrasegna)) throw { message: "New password doesnt have the required security", code: 401 };
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
        throw { message: "There was an error updating the user", code: 401 };
    }
}

//Borra el usuario, requiere de su contrasegna en el body asi como el token de sesion
export const borrarUsuario = async (contrasegna: string, id: string): Promise<boolean> => {
        const usuario = await buscarUsuario(id);
        if (!usuario || !validarContrasegna(contrasegna)) throw { message: "Invalid credentials", code: 401 };
        const contrasegnaCoincide = await autenticarContrasegnaUsuario(contrasegna, usuario.contrasegna!);
        if (contrasegnaCoincide) {
            const db = getDB();
            const resultado = await db.delete(usuarios).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
            if (resultado.length) {





                const seguidos = await mongoGet("intermediario", { sujeto: id, verbo: "sigue" });
                console.log("BORR", seguidos);













                //TODO: borrado en cascada real
                agnadirLog("backend.log", "User deleted " + id);
                agnadirLog("db.log", "User deleted USUARIOS " + id);
                return true;
            } else {
                throw { message: "Couldn't delete user", code: 500 }
            }
        } else {
            throw { message: "Validate password is needed", code: 401 }
        }

}

//Devuelve datos básicos y públicos de un usuario a partir de su id o su nickname
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

//Altera la disponibilidad de un usuario (no para api), 0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
export const alterarDisponibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ disponibilidad: nuevoValor }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    agnadirLog("backend.log", `User ${id} altered its disponibility to ${nuevoValor}`);
    //TODO: EN UN FUTURO, HACER EL BORRADO EN CASCADA
    return resultado ? true : false;
}

//Altera la visibilidad del usuario, 0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
export const alterarVisibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ nivelPublico: nuevoValor }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });

    //TODO: EN UN FUTURO, HACER EL BORRADO EN CASCADA
    agnadirLog("backend.log", `User ${id} altered its visibility to ${nuevoValor}`);
    return resultado ? true : false;
}

//Renueva el premium de un usuario estableciendo la fecha de caducidad
export const alterarPremiumUsuario = async (id: string, fechaCaducidad: string): Promise<boolean> => {
    const db = getDB();
    const resultado = await db.update(usuarios).set({ premium: fechaCaducidad }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    agnadirLog("backend.log", "User got premium " + id);
    agnadirLog("db.log", "User got premium USUARIO to current date " + id);
    return resultado ? true : false;
}

//Altera la cantidad de seguidores de un usuario (en su registro sql), si la cantidad es 0 devuelve si el usuario a sigue al b sin alterar nada
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
        await mongoSet("intermediario", { id: uuidv4(), sujeto: idA, verbo: "sigue", predicado: idB, extra: {nicknameA: usuarioA.nickname, nicknameB: usuarioB.nickname} });
    } else {
        return false;
    }
    const resultado = await db.update(usuarios).set({cantidadSeguidores: seguidoresPrevios + cantidad}).where(eq(usuarios.id, idB)).returning({ id: usuarios.id });
    return resultado.length ? true : false;
}

//Devuelve los seguidos o los seguidores de un usuario
export const verSeguimientosUsuario = async (id: string, pagina = 0, seguidos = false): Promise<Record<string, any>[]> => {
    const usuario = await buscarUsuario(id);
    if (!usuario || usuario.nivelPublico >= 1 || usuario.disponibilidad >= 2) throw { message: "User not found", code: 404 }
    const lista = seguidos ? await Intermediario.find({sujeto: id, verbo: "sigue"}).skip(pagina * tamagnoPagina).limit(tamagnoPagina) : await Intermediario.find({predicado: id, verbo: "sigue"}).skip(pagina * tamagnoPagina).limit(tamagnoPagina);
    if (!lista.length) throw { message: "No entry found for this query", code: 404 }
    return lista.map((e) => {
        return {id: seguidos ? e.predicado : e.sujeto, nickname: seguidos ? e.extra.nicknameB ?? '' : e.extra.nicknameA ?? ''}
    });
}

//Realiza una busqueda de usuarios, teniendo en cuenta su nickname y su nombre, ordenado por seguidores
export const buscarUsuarios = async (consulta:string, pagina = 0): Promise<Record<string, any>[]> => {
    const db = getDB();
    const usuarios = db;




    return [];
}


//TODO: mejorar documentacion