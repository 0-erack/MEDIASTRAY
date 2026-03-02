//Comprueba que sea string (no null)
export const esString = (data:string):boolean => {
    return typeof data === 'string';
}

//Valida un numero entero positivo
export const enteroPositivo = (data:string):boolean => {
    return typeof data === 'number' && Number.isInteger(data) && data >= 0;
}

//Valida un id uuid
export const id = (data:string):boolean => {
    return esString(data) && /^[0-9a-fA-F\-]{36}$/.test(data);
}

//Valida un nickname de usuario, de 4 a 15 caracteres que sean letras, numeros o simbolos concretos
export const nickname = (data:string):boolean => {
    return esString(data) && /^[a-zA-Z0-9._\-|]{4,15}$/.test(data);
}

//Valida un nombre de usuario, de 5 a 100 caracteres
export const nombre = (data:string):boolean => {
    return esString(data) && data.length >= 5 && data.length < 100;
}

//Valida una contrasegna, debe tener entre 8 y 32 caracteres y contener una letra mayuscula y minuscula, un numero y un simbolo
export const contrasegna = (data:string):boolean => {
    return esString(data) && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}$$:;<>,.?~\\/-]).{8,32}$/.test(data);
}

//Valida un correo
export const correo = (data:string):boolean => {
    return esString(data) && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data);
}

//Valida que sea un correo o un nickname valido (identificacion para login)
export const identificacion = (data:string):boolean => {
    return correo(data) || nickname(data);
}

//Valida una descripcion de un usuario, hasta 511 caracteres
export const descripcionUsuario = (data:string):boolean => {
    return esString(data) && data.length < 512;
}

//Valida una url
export const url = (data:string):boolean => {
    return esString(data) && (/^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}(?::\d{1,5})?\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*))/.test(data) || data === "/public/nopfp.png" || data === "");
}

//Valida un timestamp (fecha)
export const timestamp = (data:string):boolean => {
    return esString(data) && /^\d{1,15}$/.test(data);
}

//Valida el titulo de un juego, de 3 a 63 caracteres
export const titulo = (data:string):boolean => {
    return esString(data) && data.length > 2 && data.length < 64;
}

//Valida la version de un juego, debe ser <lo que sea><numero(s)>.<numero(s)><lo que sea> pero hasta 15 caracteres
export const version = (data:string):boolean => {
    return esString(data) && data.length < 16 && /^\D*\d+\.\d+\D*$/.test(data);
}

//Valida la descripcion de un juego, hasta 1023 caracteres
export const descripcionJuego = (data:string):boolean => {
    return esString(data) && data.length < 1024;
}

//Valida el nombre de un foro, de 3 a 63 caracteres
export const nombreForo = (data:string):boolean => {
    return esString(data) && data.length > 2 && data.length < 64;
}

//Valida la descripcion de un foro, hasta 511 caracteres
export const descripcionForo = (data:string):boolean => {
    return esString(data) && data.length < 512;
}

//Valida el campo de texto del juego asociado a un foro (un juego externo o un id de un juego en la plataforma)
export const juegoDeForo = (data:string):boolean => {
    return esString(data) && (id(data) || (data.length > 2 && data.length < 36));
}

//Valida la fecha de cumpleagnos
export const cumpleagnos = (data:string):boolean => {
    const texto = Date.parse(data);
    return timestamp(texto + "") && texto < Date.now();
}

//Pensada para validar el localstorage
export const validarDatosUsuarioLS = (usuario:any):boolean => {
    return typeof usuario === "object"
        && id(usuario.id)
        && nickname(usuario.nickname)
        && nombre(usuario.nombre)
        && correo(usuario.correo)
        && descripcionUsuario(usuario.descripcion)
        && (url(usuario.url_foto) || usuario.url_foto === "/public/nopfp.png" || usuario.url_foto === "")
        && timestamp(usuario.cumpleagnos)
        && timestamp(usuario.fechacreacion)
        && enteroPositivo(usuario.disponibilidad)
        && (usuario.premium === "" || timestamp(usuario.premium))
        //&& enteroPositivo(usuario.permisos);
}

