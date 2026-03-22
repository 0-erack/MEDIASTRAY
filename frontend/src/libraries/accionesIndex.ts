//Funciones que permiten hacer operaciones sobre el index.html con el dom

let etiquetaTitulo: HTMLElement | null = null;
let etiquetaIcono: HTMLLinkElement | null = null;

/**
 * Cambiar el titulo de la pestagna
 * @param nuevoTitulo texto a poner en su lugar
 */
const cambiarTitulo = (nuevoTitulo: string): void => {
    if (!etiquetaTitulo) {
        etiquetaTitulo = document.getElementById("head-titulo");
    }
    if (etiquetaTitulo) {
        etiquetaTitulo.innerHTML = nuevoTitulo;
    }
}

/**
 * Cambiar el icono de la pestagna
 * @param nuevoIcono ruta del icono
 */
const cambiarIcono = (nuevoIcono: string): void => {
    if (!etiquetaIcono) {
        etiquetaIcono = document.getElementById("head-icono") as HTMLLinkElement;
    }
    if (etiquetaIcono) {
        etiquetaIcono.href = nuevoIcono;
    }
}

/**
 * Cambiar el atributo lang de la etiqueta html
 * @param nuevoIdioma valor nuevo ya formateado, seria el texto que representa al idioma
 */
const cambiarIdiomaHtml = (nuevoIdioma: string): void => {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
        htmlElement.lang = nuevoIdioma;
    }
}

export { cambiarIcono, cambiarIdiomaHtml, cambiarTitulo };
