import { v4 as uuidv4 } from 'uuid';
import { nombre as validarNombre, nickname as validarNickname, correo as validarCorreo, timestamp as validarCumpleagnos, contrasegna as validarContrasegna, descripcionUsuario as validarDescripcion, url as validarUrl, contrasegna, correo } from '../libraries/validaciones.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redisDelete, redisSet } from '../connections/redis.js';
import { consulta, getDB } from '../connections/postgresql.js';
import { agnadirLog } from '../connections/logs.js';
import { mongoDelete, mongoGet, mongoSet } from '../connections/mongodb.js';
import { autenticarContrasegnaUsuario } from '../routes/autenticaciones.js';
import { Usuario } from '../types/Usuario.js';
import { validarCreacionUsuario, validarLoginUsuario } from '../validators/validacionesUsuario.js';
import { eq, or } from 'drizzle-orm';
import { usuarios } from '../models/schema.js';
import { crearSesion, cerrarSesion, verSesionToken, verSesionUsuario } from './sessionController.js';


const validarJsonLoginUsuario = (credenciales: Record<string, any>): boolean => {
    return (validarCorreo(credenciales.identification) || validarNickname(credenciales.identification)) && validarContrasegna(credenciales.contrasegna);
}

const validarJsonEdicionUsuario = (usuario: Record<string, any>) => {
    if (usuario.nombre && !validarNombre(usuario.nombre)) throw { message: "Invalid credentials (name)", code: 401 };
    if (usuario.url_foto && !validarUrl(usuario.url_foto)) throw { message: "Invalid credentials (pfp url)", code: 401 };
    if (usuario.descripcion && !validarDescripcion(usuario.descripcion)) throw { message: "Invalid credentials (description)", code: 401 };
    if (usuario.cumpleagnos && !validarCumpleagnos(usuario.cumpleagnos)) throw { message: "Invalid credentials (birth date)", code: 401 };
    if (usuario.nickname && !validarNickname(usuario.nickname)) throw { message: "Invalid credentials (nickname)", code: 401 };
    if (usuario.correo && !validarCorreo(usuario.correo)) throw { message: "Invalid credentials (email)", code: 401 };
    if (usuario.contrasegna && !validarContrasegna(usuario.contrasegna)) throw { message: "Invalid credentials (password)", code: 401 };
}

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
    agnadirLog("backend.log", "New user created " + usuarioCreado.id);
    agnadirLog("db.log", "New user created USUARIOS " + usuarioCreado.id);
    usuarioCreado.contrasegna = undefined;
    return { token: token, usuario: usuarioCreado };
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
    console.log(usuario)
    const token = await crearSesion(usuario.id!);
    usuario.contrasegna = undefined;
    agnadirLog("backend.log", "User logged in " + usuario.id);
    return { token, usuario };
}

//Cierra la sesion de un usuario
export const logoutUsuario = async (id: string): Promise<boolean> => {
    return true;
}

//Editar un usuario actualizando sus datos, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
//Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, url_foto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
export const editarUsuario = async (nuevos: Record<string, any>, id: string): Promise<Record<string, any>> => {
    try {
        if (!nuevos || !id) throw { message: "Invalid credentials", code: 401 };
        const usuarioPrevio = await consulta("SELECT * FROM USUARIOS WHERE id = $1;", [id]);
        if (!usuarioPrevio[0]) throw { message: "Invalid credentials", code: 401 };
        if (usuarioPrevio[0].disponibilidad >= 2) throw { message: "User has not allowed login nor edit credentials or profile", code: 401 };
        validarJsonEdicionUsuario(nuevos);
        let proporcionadoContrasegnaAntigua = false;
        if (!nuevos.cambiarContrasegna) { //Solo se pide la contrasegna original si se va a cambiar a otra distinta
            proporcionadoContrasegnaAntigua = true;
        } else {
            if (nuevos.contrasegnaAntigua) {
                const contrasegnaCoincide = await autenticarContrasegnaUsuario(nuevos.contrasegnaAntigua, usuarioPrevio[0].contrasegna);
                if (contrasegnaCoincide) {
                    proporcionadoContrasegnaAntigua = true;
                } else {
                    throw { message: "Validate password is needed", code: 401, data: { failedPassword: true } }
                };
            }
        }
        if (nuevos.nickname && nuevos.nickname !== usuarioPrevio[0].nickname) {
            if (!proporcionadoContrasegnaAntigua) throw { message: "Validate password is needed", code: 401 };
            const conEseNickname = await consulta("SELECT id FROM USUARIOS WHERE nickname = $1;", [nuevos.nickname]);
            if (conEseNickname[0]) throw { message: "Nickname already in use", code: 401, data: { doubleNickname: true } };
        }
        if (nuevos.correo && nuevos.correo !== usuarioPrevio[0].correo) {
            if (!proporcionadoContrasegnaAntigua) throw { message: "Validate password is needed", code: 401 };
            const conEseEmail = await consulta("SELECT id FROM USUARIOS WHERE correo = $1;", [nuevos.correo]);
            if (conEseEmail[0]) throw { message: "Email already in use", code: 401, data: { doubleEmail: true } };
        }
        if (nuevos.contrasegna && nuevos.cambiarContrasegna) {
            console.log("casmbiocon", nuevos.contrasegna);
            if (!proporcionadoContrasegnaAntigua) throw { message: "Validate password is needed", code: 401 };
            nuevos.contrasegna = await bcrypt.hash(nuevos.contrasegna, 10);
        } else {
            nuevos.contrasegna = usuarioPrevio[0].contrasegna;
        }
        if (await consulta("UPDATE USUARIOS SET nickname = $1, nombre = $2, contrasegna = $3, correo = $4, descripcion = $5, url_foto = $6, cumpleagnos = $7 WHERE id = $8;",
            [nuevos.nickname ?? usuarioPrevio[0].nickname, nuevos.nombre ?? usuarioPrevio[0].nombre, nuevos.contrasegna ?? usuarioPrevio[0].contrasegna, nuevos.correo ?? usuarioPrevio[0].correo, nuevos.descripcion ?? usuarioPrevio[0].descripcion, nuevos.url_foto ?? usuarioPrevio[0].url_foto, nuevos.cumpleagnos ?? usuarioPrevio[0].cumpleagnos, id])) {
            const TOKEN_SECRET = process.env.JWT_SECRET;
            const token = await jwt.sign({ id, nickname: nuevos.nickname ?? usuarioPrevio[0].nickname }, TOKEN_SECRET, { expiresIn: '20h', algorithm: 'HS256' });
            await redisDelete("SESSION-TOKEN-" + id);
            await redisDelete("SESSION-TOKEN-" + token);
            await redisSet("SESSION-TOKEN-" + id, token, 72000);
            await redisSet("SESSION-TOKEN-" + token, id, 72000);
            const nuevoTodo = await consulta("SELECT * FROM USUARIOS WHERE id = $1;", [id]);
            nuevoTodo[0].contrasegna = "";
            agnadirLog("backend.log", "User editted " + id);
            agnadirLog("db.log", "User editted via update USUARIOS " + id);
            return { usuarioRenovado: nuevoTodo[0] ?? {}, tokenNuevo: token }
        } else {
            throw { message: "There was an error updating the user", code: 401 };
        }
    } catch (error) {
        throw error;
    }
}

//Borra el usuario, requiere de su contrasegna en el body asi como el token de sesion
export const borrarUsuario = async (contrasegna: string, id: string): Promise<boolean> => {
    try {
        const usuario = await consulta("SELECT * FROM USUARIOS WHERE id = $1;", [id]);
        if (!usuario[0]) throw { message: "Invalid credentials", code: 401 };
        console.log(usuario[0].contrasegna, "no");
        const contrasegnaCoincide = await autenticarContrasegnaUsuario(contrasegna, usuario[0].contrasegna);
        if (contrasegnaCoincide) {
            //const resultado = await consulta("DELETE FROM USUARIOS WHERE id = $1", [id]);































            const seguidos = await mongoGet("intermediario", { sujeto: id, verbo: "sigue" });
            console.log("BORR", seguidos);

            agnadirLog("backend.log", "User deleted " + id);
            agnadirLog("db.log", "User deleted USUARIOS " + id);
            return true;
        } else {
            throw { message: "Validate password is needed", code: 401 }
        }
    } catch (error) {
        throw error;
    }
}

//Devuelve datos básicos y públicos de un usuario a partir de su id o su nickname
export const verUsuario = async (id: string): Promise<Record<string, any>> => {
    try {
        const usuario = await consulta("SELECT * FROM USUARIOS WHERE id = $1 OR nickname = $2;", [id, id]);
        if (!usuario[0] || usuario[0].nivel_publico === 2) throw { message: "User not found", code: 401 }
        //usuario[0].contrasegna = undefined;
        if (usuario[0].nivel_publico === 1) {
            return { ...usuario[0], contrasegna: "", correo: undefined, cumpleagnos: "", cantidad_seguidores: 0, premium: "", };
        }
        return { ...usuario[0], contrasegna: "", correo: undefined, cumpleagnos: "" };
    } catch (error) {
        throw error;
    }
}

//Altera la disponibilidad de un usuario (no para api), 0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
export const alterarDisponibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    try {
        const resultado = await consulta("UPDATE USUARIOS SET disponibilidad = $1 WHERE id = $2;", [nuevoValor, id]);
        agnadirLog("backend.log", `User ${id} altered its disponibility to ${nuevoValor}`);
        //EN UN FUTURO, HACER EL BORRADO EN CASCADA
        return resultado ? true : false;
    } catch (error) {
        throw error;
    }
}

//Altera la visibilidad del usuario, 0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
export const alterarVisibilidadUsuario = async (nuevoValor: number, id: string): Promise<boolean> => {
    try {
        const resultado = await consulta("UPDATE USUARIOS SET nivel_publico = $1 WHERE id = $2;", [nuevoValor, id]);



        agnadirLog("backend.log", `User ${id} altered its visibility to ${nuevoValor}`);

        return resultado ? true : false;
    } catch (error) {
        throw error;
    }
}

//Renueva el premium de un usuario estableciendo la fecha de caducidad
export const alterarPremiumUsuario = async (id: string, fechaCaducidad: string): Promise<boolean> => {
    try {
        const resultado = await consulta("UPDATE USUARIOS SET premium = $1 WHERE id = $2;", [fechaCaducidad, id]);
        agnadirLog("backend.log", "User got premium " + id);
        agnadirLog("db.log", "User got premium USUARIO to current date " + id);
        return resultado ? true : false;
    } catch (error) {
        throw error;
    }
}

//Altera la cantidad de seguidores de un usuario (en su registro sql), si la cantidad es 0 devuelve si el usuario a sigue al b
export const alterarSeguidores = async (idA: string, idB: string, cantidad: number): Promise<boolean> => {
    try {
        const yaLeSigue = await mongoGet("intermediario", { sujeto: idA, verbo: "sigue", predicado: idB }) ?? {};
        if (cantidad === 0) return yaLeSigue.id;
        const seguidoresPrevios = await consulta("SELECT cantidad_seguidores, disponibilidad, nivel_publico FROM USUARIOS WHERE id = $1;", [idB]);
        if (!seguidoresPrevios[0] || seguidoresPrevios[0].nivel_publico >= 1 || seguidoresPrevios[0].disponibilidad >= 2) throw { message: "Invalid credentials", code: 401 };
        const usuarioSeguidor = await consulta("SELECT disponibilidad FROM USUARIOS WHERE id = $1;", [idA]);
        if (!usuarioSeguidor[0] || usuarioSeguidor[0].disponibilidad >= 2) throw { message: "Invalid credentials", code: 401 };
        let resultado: boolean | Array<any> = false;
        if (yaLeSigue.id && cantidad < 0) {
            await mongoDelete("intermediario", { sujeto: idA, verbo: "sigue", predicado: idB }, true);
            resultado = await consulta("UPDATE USUARIOS SET cantidad_seguidores = $1 WHERE id = $2;", [seguidoresPrevios[0].cantidad_seguidores + cantidad, idB]);
        } else if (!yaLeSigue.id && cantidad > 0) {
            await mongoSet("intermediario", { id: uuidv4(), sujeto: idA, verbo: "sigue", predicado: idB });
            resultado = await consulta("UPDATE USUARIOS SET cantidad_seguidores = $1 WHERE id = $2;", [seguidoresPrevios[0].cantidad_seguidores + cantidad, idB]);
        } else {
            return false;
        }
        //if (!validarEnteroPositivo(cantidad)) throw {message: "Invalid amount", code: 401};
        return resultado ? true : false;
    } catch (error) {
        //console.log(error);
        throw error;
    }
}
