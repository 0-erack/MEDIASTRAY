import fs from 'fs/promises';
import path from 'path';

//Comprueba que un archivo exista, y sea un archivo
export const archivoExiste = async (ruta: string): Promise<boolean> => {
    try {
        await fs.access(ruta);
        return true;
    } catch {
        return false;
    }
}

//Escribe un archivo con x contenido, en una ruta, con un nombre. Se debe saber si es de texto o no. Si ya existe lo reemplaza, y crea las carpetas necesarias para la ruta
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
        console.log(error);
        return false;
    }
}

//Agnade nuevas lineas en un archivo
export const agnadirEnArchivo = async (lineas:any, ruta:string, nombre:string):Promise<boolean> => {
    try {
        await fs.appendFile(path.join(ruta, nombre), lineas + "\n", 'utf8');
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

//Devuelve el contenido de un archivo a partir de la ruta. Se debe saber si es de texto o no. Si no existe o no es legible no devuelve nada
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
        console.log(error);
        return "";
    }
}

//Borra un archivo a partir de una ruta si existe
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
        console.log(error);
        return false;
    }
}

