import { Usuario } from "./Usuario.js";

//Entidad de juego dentro de la aplicacion
export type Juego = {
    id: string;
    titulo: string;
    urlPortada1: string | null;
    urlPortada2: string | null;
    urlPortada3: string | null;
    publico: boolean;
    versionActual: string | null;
    fechaCreacion: string;
    fechaUltima: string;
    descripcion: string | null;
    descripcionCorta: string | null;
    idCreador: string | Usuario;
    tokenJuego: string;
    generos: string | Array<string> | null;
    tags: string | Array<string> | null;
    idiomas: string | Array<string> | null;
    avisos: string | Array<string> | null;
    cantidadSeguidores: number;
    edad: number | null;
    cantidadJugadores: number;
    cantidadComentarios: number;
    precio: string | null; // | number
}
