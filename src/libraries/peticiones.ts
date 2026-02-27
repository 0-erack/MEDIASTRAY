
const peticionBasica = async (url:string, headers:Record<string, any>, verbo:string, body?:Record<string, any>): Promise<any> => {
    try {
        const peticion = new Request(url, {method: verbo, body: verbo === "GET" ? undefined : JSON.stringify(body ?? {}), headers: {...headers, "Content-Type": "application/json"}});
        const resultado = await fetch(peticion);
        return await resultado.json();
    } catch (error) {
        return {error, fallo: true}
    }
}

export { peticionBasica }