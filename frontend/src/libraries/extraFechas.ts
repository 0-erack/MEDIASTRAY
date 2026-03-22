//Funciones varias referentes a las fechas

/**
 * Convierte un timestamp Unix Epoch al valor que usa un input type date
 * @param timestamp numero en formato string
 * @returns texto apto para el valor del input
 */
export const timestampAInputDate = (timestamp:string):string => {
    if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    const date = new Date(Number(timestamp));
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Convierte el valor de un input type date a un timestamp Unix Epoch
 * @param fecha texto del valor del input
 * @returns timestamp en formato string
 */
export const inputDateATimestamp = (fecha: string): string => {
    return new Date(fecha).getTime() + "";
}

/**
 * Convierte un timestamp Unix Epoch en el formato de fechas que se usa en la aplicacion
 * @param timestamp tiempo en formato string
 * @returns texto con la fecha (en este caso sin hora)
 */
export const timestampAFecha = (timestamp:string):string => {
    //if (typeof timestamp !== "string" && typeof timestamp !== "number") return "";
    return new Date(Number(timestamp)).toLocaleDateString();
}

/**
 * Evalua si en base a una fecha de nacimiento, esa persona seria mayor de edad (teniendo en cuenta la fecha actual)
 * @param timestamp fecha de nacimiento en formato timestamp Unix Epoch string
 * @param edad edad a comparar, normalmente 18
 * @returns true si es mayor de esa edad
 */
export const esMayorEdad = (timestamp:string, edad = 18):boolean => {
    if (isNaN(parseInt(timestamp))) return false;
    const fecha = new Date(parseInt(timestamp));
    const ahora = new Date();
    const limite = new Date(fecha);
    limite.setFullYear(fecha.getFullYear() + edad);
    return ahora >= limite;
}
