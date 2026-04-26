import path from "path";
import { escribirArchivo } from "../connections/archivos.js";
import { buscarJuego } from "./juegoController.js";
import { buscarUsuario, usuarioTienePremium } from "./usuarioController.js";

/**
 * Publicar un archivo de juego
 * @param usuario quien sube el juego
 * @param juego id del juego al que subir el archivo
 * @param archivo objeto de blob de la api
 * @param nombre tag del archivo subido
 * @returns ruta para descargar
 */
export const subirArchivosJuego = async (idUsuario: string, idJuego: string, archivo: any, nombre: string): Promise<string|null> => {
    const usuario = await buscarUsuario(idUsuario);
    if (!usuario) throw { message: "User not found", code: 404 };
    const juego = await buscarJuego(idJuego);
    if (!juego) throw { message: "Game not found", code: 404 };

    //comprobar que no exista ya, si es premium solo pueden haber 2

    const esPremium = await usuarioTienePremium(idUsuario, false);
    const ruta = path.join(process.env.GAMES_FILES_PATH ?? './games', idJuego, nombre);
    if (!esPremium) {
        //no premium solo 1gb
    }
    if (nombre === "web") {
        //webgl
    }
    const resultado = await escribirArchivo(archivo.buffer, ruta, nombre + ".zip", false);
    if (!resultado) throw { message: "Couldn't save file", code: 500 };

    //descomprimir y borrar zip

    return "/games/" + idJuego;
}
