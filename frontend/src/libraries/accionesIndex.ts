// 1. We type the elements as specific HTML types or null
let etiquetaTitulo: HTMLElement | null = null;
let etiquetaIcono: HTMLLinkElement | null = null;

const cambiarTitulo = (nuevoTitulo: string): void => {
    if (!etiquetaTitulo) {
        etiquetaTitulo = document.getElementById("head-titulo");
    }
    if (etiquetaTitulo) {
        etiquetaTitulo.innerHTML = nuevoTitulo;
    }
}

const cambiarIcono = (nuevoIcono: string): void => {
    if (!etiquetaIcono) {
        etiquetaIcono = document.getElementById("head-icono") as HTMLLinkElement;
    }
    if (etiquetaIcono) {
        etiquetaIcono.href = nuevoIcono;
    }
}

const cambiarIdiomaHtml = (nuevoIdioma: string): void => {
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
        htmlElement.lang = nuevoIdioma;
    }
}

export { cambiarIdiomaHtml, cambiarTitulo, cambiarIcono };