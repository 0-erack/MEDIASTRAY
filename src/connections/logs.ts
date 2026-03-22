//Funciones relacionadas con los logs

import { agnadirEnArchivo } from "./archivos.js";

let logsPendientes:Array<any> = [];
let iterador:any = null;

/**
 * Agnade un log para que se guarde en un archivo
 * @param archivo nombre del archivo al cual poner el log
 * @param texto texto del log
 * @param suprimirConsola si evita mostrarlo por consola
 */
export const agnadirLog = async (archivo:string, texto:string, suprimirConsola:boolean = false) => {
    if (iterador !== null) logsPendientes = [...logsPendientes, {archivo, texto: Date.now() + ":   " + texto}];
    if (!suprimirConsola) console.log(archivo, Date.now() + ":   " + texto);
}



//Inicia el proceso para guardar los logs en los archivos cada x tiempo
export const iniciarServicioLogs = () => {
    const ruta = process.env.RUTA_LOGS ?? './logs';
    iterador = setInterval(() => {
        logsPendientes.forEach(async (e) => {
            await agnadirEnArchivo(e.texto, ruta, e.archivo);
        });
        logsPendientes = [];
    }, parseInt(process.env.TIEMPO_LOGS ?? "8000", 10));
}

//Parar el proceso de los logs temporalmente
export const pararLogs = () => {
    clearInterval(iterador);
    iterador = null;
}
