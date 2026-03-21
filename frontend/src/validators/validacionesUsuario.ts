import { correo, cumpleagnos, descripcionUsuario, id, nickname, nombre, timestamp, url } from '../libraries/validacionesBackend';
import { Usuario } from '../types/Usuario';

export const validarUsuarioLocal = (data:any): boolean => {
    try {
        if (typeof data === "string") data = JSON.parse(data);
        return typeof data === "object"
            && id(data?.id)
            && nickname(data?.nickname)
            && nombre(data?.nombre)
            && correo(data?.correo)
            && descripcionUsuario(data?.descripcion ?? '')
            && (data?.urlFoto ? url(data?.urlFoto) : true)
            && cumpleagnos(data?.cumpleagnos)
            && timestamp(data?.fechaCreacion)
            && typeof data?.cantidadSeguidores === "number" && data.cantidadSeguidores >= 0;
    } catch (e) {return false;} 
}

export const deApiAUsuario = (data:Record<string, any>):Partial<Usuario> => {
    return {id: data.id, fechaCreacion: data.creationDate, descripcion: data.description, correo: data.email, cantidadSeguidores: data.followersAmount ?? data.followers, cumpleagnos: data.birthdate, nombre: data.name, nickname: data.nickname, urlFoto: data.urlPhoto}
}

export const deUsuarioAApi = (data:Partial<Usuario>):Record<string, any> => {
    return { password: data?.contrasegna ?? undefined, description: data?.descripcion ?? undefined, email: data?.correo ?? undefined, birthdate: data?.cumpleagnos ?? undefined, name: data?.nombre ?? undefined, nickname: data?.nickname ?? undefined, urlPhoto: data?.urlFoto ?? undefined}
}