//Aqui estan todas las funciones que marcan como se validan los datos en la aplicacion, reciben el dato y devuelven true si es valido

import { z } from "zod";

const idSchema = z.string().uuid();
const nicknameSchema = z.string().min(4).max(15).regex(/^[a-zA-Z0-9._\-|]+$/);
const nombreSchema = z.string().min(5).max(100);
const correoSchema = z.string().email();
const timestampSchema = z.string().regex(/^-?\d{1,15}$/);
const urlPattern = /^(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,512}\.[a-zA-Z0-9()]{1,6}(?::\d{1,5})?\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*))/;
const versionPattern = /^(?=.*\d).{1,16}$/;
const comalistaPattern = /^[a-z0-9]+(?:,[a-z0-9]+)*$/;
const precioPattern = /^(?:[^0-9]+\d+[.,]\d{2}[^0-9]*|\d+[.,]\d{2}[^0-9]+)$/;
const tituloJuegoSchema = z.string().min(3).max(64);

//Valida un id uuid
export const id = (data: unknown): data is string => idSchema.safeParse(data).success;

//Valida un nickname de usuario, de 4 a 15 caracteres que sean letras, numeros o simbolos concretos
export const nickname = (data: unknown): data is string => nicknameSchema.safeParse(data).success;

//Valida un nombre de usuario, de 5 a 100 caracteres
export const nombre = (data: unknown): data is string => nombreSchema.safeParse(data).success;

//Valida una contrasegna, debe tener entre 8 y 32 caracteres y contener una letra mayuscula y minuscula, un numero y un simbolo
export const contrasegna = (data: unknown): data is string => z.string().min(8).max(32).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}$$:;<>,.?~\\/-]).*$/).safeParse(data).success;

//Valida que la contrasegna en reposo sea correcta (osea el hash)
export const contrasegnaReposo = (data: unknown): data is string => z.string().min(1).safeParse(data).success;

//Valida un correo
export const correo = (data: unknown): data is string => correoSchema.safeParse(data).success;

//Valida que sea un correo o un nickname valido (identificacion para login)
export const identificacion = (data: unknown): data is string => z.union([correoSchema, nicknameSchema]).safeParse(data).success;

//Valida una descripcion de un usuario, hasta 511 caracteres
export const descripcionUsuario = (data: unknown): data is string => z.string().max(511).safeParse(data).success;

//Valida una url
export const url = (data: unknown): data is string => z.string().refine(val => urlPattern.test(val) || val === "/public/nopfp.png" || val === "").safeParse(data).success;

//Valida un timestamp (fecha)
export const timestamp = (data: unknown): data is string => timestampSchema.safeParse(data).success;

//Valida la fecha de cumpleagnos
export const cumpleagnos = (data:string):boolean => {
    const texto = new Date(Number(data));
    return timestamp(data + "") && texto < new Date();
}

//Valida el titulo de un juego
export const tituloJuego = (data: unknown): data is string => tituloJuegoSchema.safeParse(data).success;

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
