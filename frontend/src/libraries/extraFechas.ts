export const timestampAInputDate = (timestamp:string):string => {
    if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    const date = new Date(Number(timestamp));
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const inputDateATimestamp = (fecha: string): string => {
    return new Date(fecha).getTime() + "";
}

export const timestampAFecha = (timestamp:string):string => {
    //if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    return new Date(Number(timestamp)).toLocaleDateString();
}

export const esMayorEdad = (timestamp:string, edad = 18):boolean => {
    if (isNaN(parseInt(timestamp))) return false;
    const fecha = new Date(parseInt(timestamp));
    const ahora = new Date();
    const limite = new Date(fecha);
    limite.setFullYear(fecha.getFullYear() + edad);
    return ahora >= limite;
}
