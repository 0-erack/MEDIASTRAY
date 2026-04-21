//Rutas exclusivas de los administradores

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { eliminarReporte, verReportes } from '../controllers/adminController.js';
import { autenticarAdmin, autenticarModerador, autenticarSudo, autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { exito, fallo, manejadorRuta } from './respuesta.js';

const routerAdmin = express.Router();

//Rutas exclusivas de usuarios con permisos extendidos

//Rutas exclusivas de los admins

//Comprobar si el usuario que hace la peticion es admin
routerAdmin.get("/check", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is admin"));
    });
});


//Rutas disponibles para los admins y para los moderadores

//Comprobar si el usuario que hace la peticion es admin
routerAdmin.get("/checkMod", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is a moderator"));
    });
});

//Ver reportes en base a una consulta
routerAdmin.get("/reports", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const reportes = await verReportes((req.query?.id as string) ?? '', pagina);
        if (!reportes || !reportes?.length) return res.status(404).json(fallo("Reports not found", null, 404));
        return res.json(exito("Reports found", {reports: reportes}));
    });
});

//Eliminar un reporte
routerAdmin.delete("/reports/:id", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await eliminarReporte(req.params?.id as string);
        if (!resultado) return res.status(404).json(fallo("Reports not found", null, 404));
        return res.json(exito("Report deleted", true));
    });
});


//Rutas disponibles solo para sudo

//Comprobar si el usuario que hace la peticion es sudo
routerAdmin.get("/checkSudo", autenticarTokenApi, autenticarTokenSesion, autenticarSudo, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is sudo"));
    });
});


export default routerAdmin;