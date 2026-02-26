let etiquetaTitulo = null;
const cambiarTitulo = (nuevoTitulo) => {
    if (!etiquetaTitulo) etiquetaTitulo = document.getElementById("head-titulo");
    etiquetaTitulo.innerHTML = nuevoTitulo;
}

let etiquetaIcono = null;
const cambiarIcono = (nuevoIcono) => {
    if (!etiquetaTitulo) etiquetaTitulo = document.getElementById("head-icono");
    etiquetaIcono.href = nuevoIcono;
}

const cambiarIdiomaHtml = (nuevoIdioma) => {
    document.querySelector("html").lang = nuevoIdioma;
}

export { cambiarIdiomaHtml, cambiarTitulo, cambiarIcono }