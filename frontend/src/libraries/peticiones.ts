//Funciones en relacion a las conexiones con la api usando fetch

/**
 * Funcion unificada para hacer peticiones
 * @param url a donde hacer la peticion
 * @param headers headers que se usaran ademas de los que ya se ponen por defecto
 * @param verbo metodo http
 * @param body cuerpo de la peticion en formato json
 * @param token token de sesion a usar
 * @returns resultado de la peticion
 */
export const peticionBasica = async (url: string, headers: Record<string, any>, verbo: string, body?: Record<string, any>, token?: string): Promise<any> => {
    try {
        const peticion = new Request(url, { method: verbo, body: verbo === "GET" ? undefined : JSON.stringify(body ?? {}), headers: { ...headers, "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token ?? ''}` } });
        const resultado = await fetch(peticion);
        return await resultado.json();
    } catch (error) {
        return { error, fallo: true, ok: false }
    }
}

/**
 * Limpia un body en json quitando todos los valores null o undefinied
 * @param objeto objeto a limpiar
 * @returns objeto limpiado y listo para las peticiones
 */
export const limpiarVaciosStrings = (objeto: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(objeto).map(([key, value]) => [
            key,
            value === "" ? undefined : value
        ])
    );
}
