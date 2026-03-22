//Rutas exclusivas de los administradores

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { autenticarAdmin, autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { exito, manejadorRuta } from './respuesta.js';

const routerAdmin = express.Router();

//Rutas exclusivas de usuarios con permisos extendidos

//Comprobar si el usuario que hace la peticion es admin
routerAdmin.get("/check", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is admin"));
    });
});


export default routerAdmin;