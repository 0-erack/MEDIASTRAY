import { Juego } from "./Juego.js";
import { Usuario } from "./Usuario.js";

//Entidad de foro dentro de la aplicacion
export type Foro = {
    id: string;
    titulo: string;
    urlFoto: string | null;
    urlBanner: string | null;
    idCreador: string | Usuario;
    juegoAsociado: null | string | Juego;
    tokenJuego: string;
    fechaCreacion: string;
    cantidadSeguidores: number;
    cantidadComentarios: number;
    descripcion: string | null;
}
