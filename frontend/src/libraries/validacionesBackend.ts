//Aqui estan todas las funciones que marcan como se validan los datos en la aplicacion, reciben el dato y devuelven true si es valido

import { z } from "zod";

const idPattern = z.string().uuid();
const nicknamePattern = z.string().min(4).max(15).regex(/^[a-zA-Z0-9._\-|]+$/);
const nombrePattern = z.string().min(5).max(100);
const correoPattern = z.string().email();
const timestampPattern = z.string().regex(/^-?\d{1,15}$/);
const urlPattern = /^https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,512}(?::\d{1,5})?(?:\/[-a-zA-Z0-9()@:%_+.~#?&\/=,]*)?$/;
const versionPattern = /^(?=.*\d).{1,16}$/;
const comalistaPattern = /^[a-zA-Z0-9-]+(?:,[a-zA-Z0-9-]+)*$/;
const precioPattern = /^(?:[^0-9]+\d+[.,]\d{2}[^0-9]*|\d+[.,]\d{2}[^0-9]+)$/;
const tituloJuegoPattern = z.string().min(3).max(64);
const nombreArchivoPattern = /^[a-zA-Z0-9._-]+$/;

//Valida un id uuid
export const id = (data: unknown): data is string => idPattern.safeParse(data).success;

//Valida un nickname de usuario, de 4 a 15 caracteres que sean letras, numeros o simbolos concretos
export const nickname = (data: unknown): data is string => nicknamePattern.safeParse(data).success;

//Valida un nombre de usuario, de 5 a 100 caracteres
export const nombre = (data: unknown): data is string => nombrePattern.safeParse(data).success;

//Valida una contrasegna, debe tener entre 8 y 32 caracteres y contener una letra mayuscula y minuscula, un numero y un simbolo
export const contrasegna = (data: unknown): data is string => z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}$$:;<>,.?~\\/-]).*$/).safeParse(data).success;

//Valida que la contrasegna en reposo sea correcta (osea el hash)
export const contrasegnaReposo = (data: unknown): data is string => z.string().min(1).safeParse(data).success;

//Valida un correo
export const correo = (data: unknown): data is string => correoPattern.safeParse(data).success;

//Valida que sea un correo o un nickname valido (identificacion para login)
export const identificacion = (data: unknown): data is string => z.union([correoPattern, nicknamePattern]).safeParse(data).success;

//Valida una descripcion de un usuario, hasta 511 caracteres
export const descripcionUsuario = (data: unknown): data is string => z.string().max(511).safeParse(data).success;

//Valida una url
export const url = (data: unknown): data is string => z.string().refine(val => urlPattern.test(val) || val === "/public/nopfp.png" || val === "").safeParse(data).success;

//Valida un timestamp (fecha)
export const timestamp = (data: unknown): data is string => timestampPattern.safeParse(data).success;

//Valida la fecha de cumpleagnos
export const cumpleagnos = (data:string):boolean => {
    const texto = new Date(Number(data));
    return timestamp(data + "") && texto < new Date();
}

//Valida el titulo de un juego
export const tituloJuego = (data: unknown): data is string => tituloJuegoPattern.safeParse(data).success;

//Valida la descripcion de un juego
export const descripcionJuego = (data: unknown): data is string => z.string().max(8191).safeParse(data).success;

//Valida la descripcion corta de un juego
export const descripcionCortaJuego = (data: unknown): data is string => z.string().max(127).safeParse(data).success;

//Valida el texto de la version de un juego
export const version = (data: unknown): data is string => z.string().refine(val => versionPattern.test(val) || val === "").safeParse(data).success;

//Valida una lista de palabras separadas por coma
export const comalista = (data: unknown): data is string => z.string().refine(val => comalistaPattern.test(val) || val === "").safeParse(data).success;

//Valida el texto de un precio
export const precio = (data: unknown): data is string => z.string().refine(val => precioPattern.test(val) || val === "").safeParse(data).success;

//Valida el texto general de una adicion a un juego
export const subtituloAdicionJuego = (data: unknown): data is string => z.string().max(32).safeParse(data).success;

//Valida el contenido de un comentario
export const contenidoComentario = (data: unknown): data is string => z.string().max(512).safeParse(data).success;

//Valida el nombre de un archivo usable en Linux y Windows
export const nombreArchivo = (data: unknown): data is string => z.string().refine(val => nombreArchivoPattern.test(val)).safeParse(data).success;

//Valida la descripcion de un foro
export const descripcionForo = (data: unknown): data is string => z.string().max(255).safeParse(data).success;

//Valida el titulo de un foro
export const tituloForo = (data: unknown): data is string => tituloJuegoPattern.safeParse(data).success;
