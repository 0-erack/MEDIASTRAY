export type Usuario = {
    id: string;
    nickname: string;
    nombre: string;
    contrasegna: string;
    correo: string;
    descripcion: string|null;
    urlFoto: string|null;
    cumpleagnos: string;
    fechaCreacion: string;
    strikes: number;
    disponibilidad: number;
    premium: string;
    cantidadSeguidores: number;
    nivelPublico: number;
    nivelAcceso: number;
}