import { eq, sql } from "drizzle-orm";
import { agnadirLog } from "../connections/logs.js";
import { getDB } from "../connections/postgresql.js";
import { usuarios } from "../models/schema.js";
import { buscarUsuario } from "./usuarioController.js";


/**
 * Altera los strikes de un usuario incrementando (funciona solo como una flag)
 * Los moderadores y admins pueden hacer esto
 * @param id usuario a alterar
 * @param cantidad cantidad a incrementar, puede ser negativo para restar, si es 0 slo ve los actuales
 * @returns numero con el numero de strikes final si ha ido todo bien
 */
export const alterarStrikesUsuario = async (id: string, cantidad: number): Promise<number|null> => {
    const usuario = await buscarUsuario(id);
    if (!usuario) throw { message: "User not found", code: 404 };
    if (isNaN(cantidad)) return null;
    if (cantidad == 0) {
        return usuario.strikes;
    } else {
        const db = getDB();
        const resultado = await db.update(usuarios).set({ strikes: sql`${usuarios.strikes} + ${cantidad}` }).where(eq(usuarios.id, id))//.returning({ id: usuarios.id });
        if (!resultado) return null;
        agnadirLog("backend.log", `User ${id} added ${cantidad} strikes`);
        return usuario.strikes + cantidad;
    }
}

/**
 * Altera el nivel de acceso de un usuario, alterando sus permisos
 * Solo admins con sudo pueden hacer esto
 * @param id usuario a afectar
 * @param nuevoValor valor a establecer en el campo
 * @returns true si ha ido todo bien
 */
export const alterarNivelAccesoUsuario = async (id: string, nuevoValor: number): Promise<boolean> => {
    if (nuevoValor < 0 || nuevoValor > 4) return false;
    const db = getDB();
    const resultado = await db.update(usuarios).set({ nivelAcceso: nuevoValor }).where(eq(usuarios.id, id)).returning({ id: usuarios.id });
    if (resultado?.length) agnadirLog("backend.log", `User ${id} altered its access level to ${nuevoValor}`);
    return resultado?.length ? true : false;
}
