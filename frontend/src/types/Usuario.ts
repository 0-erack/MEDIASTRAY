export type Usuario = {
    id: string;
    nickname: string;
    nombre: string;
    correo: string;
    descripcion: string|null;
    urlFoto: string|null;
    cumpleagnos: string|null;
    fechaCreacion: string;
    premium: string|null;
    cantidadSeguidores: number;
}
