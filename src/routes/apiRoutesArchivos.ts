//Rutas ocultas para las cuales se necesita el token de la api

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { subidaJuego } from '../connections/archivos.js';
import { subirArchivosJuego } from '../controllers/archivosController.js';
import { autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { exito, fallo, manejadorRuta } from './respuesta.js';

const routerArchivos = express.Router();

//Rutas de la API que no usan un body json


//Subir los archivos de un juego
routerArchivos.post("/gameFile", autenticarTokenApi, autenticarTokenSesion, subidaJuego.single("archivo"), async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.body?.id || !req.body?.name) return res.status(404).json(fallo("Insufficient data", null, 409));
        if (!req.file) return res.status(400).json(fallo("No file uploaded", null, 400));
        const resultado = await subirArchivosJuego(req.datosSesion!.id, req.body.id, req.file, req.body.name);
        if (!resultado) return res.status(500).json(fallo("Error saving file", null, 500));
        return res.json(exito("File uploaded", resultado, 200));
    });
});




export default routerArchivos;