import { Usuario } from "./Usuario";

//Datos que un juego deberia tener
export type Juego = {
    id: string;
    titulo: string;
    urlPortada1: string|null;
    urlPortada2: string|null;
    urlPortada3: string|null;
    publico: boolean;
    versionActual: string|null;
    fechaCreacion: string;
    fechaUltima: string|null;
    descripcion: string|null;
    descripcionCorta: string|null;
    idCreador: string|Usuario;
    tokenJuego: string|null;
    generos: string|Array<string>;
    tags: string|Array<string>;
    avisos: string|Array<string>;
    idiomas: string|Array<string>;
    cantidadSeguidores: number;
    edad: number|null;
    cantidadJugadores: number;
    cantidadComentarios: number;
    precio: string|null;
    adiciones: Array<any>|null;
}