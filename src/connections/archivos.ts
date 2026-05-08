//Funciones relacionadas con el manejo de archivos

import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';

/**
 * Comprueba que un archivo exista, y sea un archivo
 * @param ruta del archivo
 * @returns true si existe
 */
export const archivoExiste = async (ruta: string): Promise<boolean> => {
    try {
        await fs.access(ruta);
        return true;
    } catch {
        return false;
    }
}

/**
 * Escribe un archivo con x contenido, en una ruta, con un nombre. Se debe saber si es de texto o no. Si ya existe lo reemplaza, y crea las carpetas necesarias para la ruta
 * @param contenido contenido del archivo
 * @param ruta ruta del archivo
 * @param nombre nombre del archivo
 * @param esTexto si es un archivo de texto
 * @returns true si todo ha ido bien
 */
export const escribirArchivo = async (contenido:any, ruta:string, nombre:string, esTexto:boolean = false):Promise<boolean> => {
    try {
        await fs.mkdir(ruta, {recursive:true});
        if (esTexto) {
            await fs.writeFile(path.join(ruta, nombre), contenido, 'utf8');
        } else {
            await fs.writeFile(path.join(ruta, nombre), contenido);
            
        }
        return true;
    } catch (error) {
        //console.log(error);
        return false;
    }
}

/**
 * Agnade nuevas lineas en un archivo
 * @param lineas contenido nuevo
 * @param ruta donde esta el archivo
 * @param nombre del archivo
 * @returns true si todo ha ido bien
 */
export const agnadirEnArchivo = async (lineas:any, ruta:string, nombre:string):Promise<boolean> => {
    try {
        await fs.appendFile(path.join(ruta, nombre), lineas + "\n", 'utf8');
        return true;
    } catch (error) {
        //console.log(error);
        return false;
    }
}

/**
 * Devuelve el contenido de un archivo a partir de la ruta. Se debe saber si es de texto o no. Si no existe o no es legible no devuelve nada
 * @param rutaMasNombre ruta y nombre del archivo a leer
 * @param esTexto si es un archivo de texto
 * @returns contenido del archivo
 */
export const leerArchivo = async (rutaMasNombre:string, esTexto:boolean):Promise<string|null> => {
    try {
        let contenido:any = "";
        if (esTexto) {
            contenido = await fs.readFile(path.join(rutaMasNombre), 'utf8');
        } else {
            contenido = await fs.readFile(path.join(rutaMasNombre));
        }
        return contenido;
    } catch (error) {
        //console.log(error);
        return "";
    }
}

/**
 * Borra un archivo a partir de una ruta si existe
 * @param rutaMasNombre ruta y nombre del archivo
 * @returns true si el archivo se ha borrado correctamente
 */
export const borrarArchivo = async (rutaMasNombre:string):Promise<boolean> => {
    try {
        const esCarpeta = await fs.stat(rutaMasNombre).then(stats => stats.isDirectory());
        if (esCarpeta) {
            await fs.rm(path.join(rutaMasNombre), { recursive: true, force: true });
        } else {
            await fs.unlink(path.join(rutaMasNombre));
        }
        return true;
    } catch (error) {
        //console.log(error);
        return false;
    }
}

/**
 * Handler para subir archivos de juego mediante la api
 */
export const subidaJuego = multer({ 
  storage: multer.memoryStorage(), // store in memory first
  limits: { fileSize: 1073741824 * (Number(process.env.MAX_TAMAGNO) ? Number(process.env.MAX_TAMAGNO) : 4) },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files allowed'));
    }
  }
});
