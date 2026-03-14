
export const peticionBasica = async (url:string, headers:Record<string, any>, verbo:string, body?:Record<string, any>, token?: string): Promise<any> => {
    try {
        const peticion = new Request(url, {method: verbo, body: verbo === "GET" ? undefined : JSON.stringify(body ?? {}), headers: {...headers, "Content-Type": "application/json", "Authorization": `Bearer ${token ?? ''}`}});
        const resultado = await fetch(peticion);
        return await resultado.json();
    } catch (error) {
        return {error, fallo: true}
    }
}
