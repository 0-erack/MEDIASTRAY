//Comprueba que sea string (no null)
const esString = (data) => {
    return typeof data === 'string';
}

//Valida un numero entero positivo
const enteroPositivo = (data) => {
    return typeof data === 'number' && Number.isInteger(data) && data >= 0;
}

//Valida un uuid
const uuid = (data) => {
    return esString(data) && /^[0-9a-fA-F\-]{36}$/.test(data);
}

//Valida un nickname de usuario, de 4 a 15 caracteres que sean letras, numeros o simbolos concretos
const nickname = (data) => {
    return esString(data) && /^[a-zA-Z0-9._\-|]{4,15}$/.test(data);
}

//Valida un nombre de usuario, de 5 a 100 caracteres
const nombre = (data) => {
    return esString(data) && data.length >= 5 && data.length < 100;
}

//Valida una contrasegna, debe tener entre 8 y 32 caracteres y contener una letra mayuscula y minuscula, un numero y un simbolo
const contrasegna = (data) => {
    return esString(data) && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}$$:;<>,.?~\\/-]).{8,32}$/.test(data);
}

//Valida un correo
const correo = (data) => {
    return esString(data) && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data);
}

//Valida que sea un correo o un nickname valido (identificacion para login)
const identificacion = (data) => {
    return correo(data) || nickname(data);
}

//Valida una descripcion de un usuario, hasta 511 caracteres
const descripcionUsuario = (data) => {
    return esString(data) && data.length < 512;
}

//Valida una url
const url = (data) => {
    return esString(data) && (/^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}(?::\d{1,5})?\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/.test(data) || data === "/public/nopfp.png" || data === "");
}

//Valida un timestamp (fecha)
const timestamp = (data) => {
    return esString(data) && /^\d{1,15}$/.test(data);
}

//Valida el titulo de un juego, de 3 a 63 caracteres
const titulo = (data) => {
    return esString(data) && data.length > 2 && data.length < 64;
}

//Valida la version de un juego, debe ser <lo que sea><numero(s)>.<numero(s)><lo que sea> pero hasta 15 caracteres
const version = (data) => {
    return esString(data) && data.length < 16 && /^\D*\d+\.\d+\D*$/.test(data);
}

//Valida la descripcion de un juego, hasta 1023 caracteres
const descripcionJuego = (data) => {
    return esString(data) && data.length < 1024;
}

//Valida el nombre de un foro, de 3 a 63 caracteres
const nombreForo = (data) => {
    return esString(data) && data.length > 2 && data.length < 64;
}

//Valida la descripcion de un foro, hasta 511 caracteres
const descripcionForo = (data) => {
    return esString(data) && data.length < 512;
}

//Valida el campo de texto del juego asociado a un foro (un juego externo o un uuid de un juego en la plataforma)
const juegoDeForo = (data) => {
    return esString(data) && (uuid(data) || (data.length > 2 && data.length < 36));
}

//Valida la fecha de cumpleagnos
const cumpleagnos = (data) => {
    const texto = Date.parse(data);
    return timestamp(texto + "") && texto < Date.now();
}

//Pensada para validar el localstorage
const validarDatosUsuarioLS = (usuario) => {
    return typeof usuario === "object"
        && uuid(usuario.uuid)
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

export { esString, validarDatosUsuarioLS, cumpleagnos, version, descripcionForo, descripcionJuego, timestamp, titulo, nombre, nickname, nombreForo, juegoDeForo, enteroPositivo, url, contrasegna, correo, descripcionUsuario, uuid, identificacion }