import { Usuario } from "../types/Usuario.js";
import { correo, nickname, nombre, contrasegnaReposo, contrasegna, cumpleagnos, url, descripcionUsuario, id, timestamp } from "../libraries/validaciones.js";

/**
 * Valida los datos de creacion de un usuario (preparado para peticiones)
 * @param data datos a validar
 * @returns parte del usuario en caso de ser correcto
 * @throws error si no es valido
 */
export const validarCreacionUsuario = (data:any): Partial<Usuario> => {
    if (!correo(data.email)) throw new Error("Invalid email");
    if (!nombre(data.name)) throw new Error("Invalid name");
    if (!nickname(data.nickname)) throw new Error("Invalid nickname");
    if (!contrasegna(data.password)) throw new Error("Invalid password");
    if (!cumpleagnos(data.birthdate)) throw new Error("Invalid birthdate");
    return {nombre: data.name, correo: data.email, nickname: data.nickname, contrasegna: data.password, cumpleagnos: data.birthdate} as Partial<Usuario>;
}

/**
 * Valida los datos de edicion de un usuario (preparado para peticiones)
 * @param data datos a validar
 * @returns parte del usuario en caso de ser correcto
 * @throws error si no es valido
 */
export const validarEdicionUsuario = (data:any): Record<string, any> => {
    if (data.name != undefined && !nombre(data.name)) throw new Error("Invalid name");
    if (data.urlPhoto != undefined && !url(data.urlPhoto)) throw new Error("Invalid photo url");
    if (data.description != undefined && !descripcionUsuario(data.description)) throw new Error("Invalid description");
    if (data.birthdate != undefined && !cumpleagnos(data.birthdate)) throw new Error("Invalid birthdate");
    if (data.nickname != undefined && !nickname(data.nickname)) throw new Error("Invalid nickname");
    if (data.email != undefined && !correo(data.email)) throw new Error("Invalid email");
    if (data.password != undefined && !contrasegna(data.password)) throw new Error("Invalid password");
    if (data.changePassword == true || data.nickname != undefined || data.email != undefined || data.password != undefined) {
        if (data.oldPassword == undefined || !contrasegna(data.oldPassword)) throw new Error("Invalid old password");
    }
    return {cambiarContrasegna: data.changePassword, nombre: data.name, nickname: data.nickname, urlFoto: data.urlPhoto, descripcion: data.description, cumpleagnos: data.birthdate, correo: data.email, contrasegna: data.password, contrasegnaAntigua: data.oldPassword} as Partial<Usuario>;
}

/**
 * Valida los datos de inicio de sesion (preparado para peticiones)
 * @param data datos a validar
 * @returns true si es correcto
 * @throws error si no es valido
 */
export const validarLoginUsuario = (data:any): boolean => {
    if (!correo(data.identification) && !nickname(data.identification)) throw new Error("Invalid email or nickname");
    if (!contrasegnaReposo(data.password)) throw new Error("Invalid password");
    return true;
}

/**
 * Valida un usuario entero en el formato en el que deberia estar en la base de datos
 * @param data datos a validar
 * @returns el usuario en si si es valido
 * @throws error si no es valido
 */
export const validarUsuario = (data:Usuario): Usuario => {
    if (!id(data.id)) throw new Error("Invalid id");
    if (!nickname(data.nickname)) throw new Error("Invalid nickname");
    if (!nombre(data.nombre)) throw new Error("Invalid name");
    if (!contrasegnaReposo(data.contrasegna)) throw new Error("Invalid password");
    if (!correo(data.correo)) throw new Error("Invalid email");
    if (data.descripcion != undefined && !descripcionUsuario(data.descripcion)) throw new Error("Invalid description");
    if (data.urlFoto != undefined && !url(data.urlFoto)) throw new Error("Invalid url");
    if (!cumpleagnos(data.cumpleagnos)) throw new Error("Invalid birthdate");
    if (!timestamp(data.fechaCreacion)) throw new Error("Invalid creation date");
    if (isNaN(data.strikes)) throw new Error("Invalid strikes");
    if (isNaN(data.disponibilidad)) throw new Error("Invalid disponibility");
    if (isNaN(data.cantidadSeguidores)) throw new Error("Invalid follower amount");
    if (isNaN(data.nivelAcceso)) throw new Error("Invalid access level");
    if (isNaN(data.nivelPublico)) throw new Error("Invalid public level");
    return data;
}

/**
 * Formatea los datos de un usuario para presentarlos hacia fuera de la api
 * @param data el usuario crudo
 */
export const formatearUsuarioPrivado = (data:Partial<Usuario>): Record<string, any> => {
    return {id: data.id, nickname: data.nickname, name: data.nombre, email: data.correo, password: undefined, description: data.descripcion, urlPhoto: data.urlFoto, birthdate: data.cumpleagnos, creationDate: data.fechaCreacion, followersAmount: data.cantidadSeguidores}
}

/**
 * Formatea los datos de un usuario para presentarlos hacia fuera de la api
 * @param data el usuario crudo
 */
export const formatearUsuarioPublico = (data:Partial<Usuario>): Record<string, any> => {
    return {id: data.id, nickname: data.nickname, name: data.nombre, email: undefined, password: undefined, description: data.descripcion, urlPhoto: data.urlFoto, birthdate: undefined, creationDate: data.fechaCreacion, followersAmount: data.cantidadSeguidores}
}

/**
 * Formatea los datos de un usuario para devolver solo los datos indispensables en una lista
 * @param data el usuario crudo
 */
export const formatearUsuarioMiniatura = (data:Partial<Usuario>): Record<string, any> => {
    return {id: data.id, nickname: data.nickname, urlPhoto: data.urlFoto}
}
