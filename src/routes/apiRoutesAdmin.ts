import express from 'express';
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { exito, fallo, manejadorRuta } from './respuesta.js';
import { autenticarAdmin, autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';

const routerAdmin = express.Router();

//Rutas exclusivas de usuarios con permisos extendidos

routerAdmin.get("/check", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is admin"));
    });
});


export default routerAdmin;