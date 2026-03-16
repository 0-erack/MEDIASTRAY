
export const peticionBasica = async (url: string, headers: Record<string, any>, verbo: string, body?: Record<string, any>, token?: string): Promise<any> => {
    try {
        const peticion = new Request(url, { method: verbo, body: verbo === "GET" ? undefined : JSON.stringify(body ?? {}), headers: { ...headers, "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token ?? ''}` } });
        const resultado = await fetch(peticion);
        return await resultado.json();
    } catch (error) {
        return { error, fallo: true, ok: false }
    }
}

export const limpiarVaciosStrings = (objeto: Record<string, any>): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(objeto).map(([key, value]) => [
            key,
            value === "" ? undefined : value
        ])
    );
}
