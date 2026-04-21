//Rutas exclusivas de los administradores

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { agnadirLog } from '../connections/logs.js';
import { alterarNivelAccesoUsuario, alterarStrikesUsuario } from '../controllers/adminController.js';
import { borrarComentario } from '../controllers/comentarioController.js';
import { borrarJuego, cambiarIndexacionJuego, verJuego } from '../controllers/juegoController.js';
import { eliminarReporte, verReportes } from '../controllers/reportesController.js';
import { alterarDisponibilidadUsuario, alterarVisibilidadUsuario, borrarUsuario, verUsuario } from '../controllers/usuarioController.js';
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

//Cambia el parametro de visibilidad de un usuario ajeno
routerAdmin.patch("/alterVisibility", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await alterarVisibilidadUsuario(req.body?.new, req.body?.id);
        if (!resultado) return res.status(409).json(fallo("Couldn't alter user or maybe (404) it doesn't exist", null, 409));
        agnadirLog("backend.log", `User ${req.body?.id} changed visibility by sudo admin`);
        return res.json(exito("User alterated"));
    });
});

//Cambia el parametro de publico de un juego ajeno
routerAdmin.patch("/alterIndexGame", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await cambiarIndexacionJuego(req.body?.id, req.body?.new);
        if (!resultado) return res.status(409).json(fallo("Couldn't alter game or maybe (404) it doesn't exist", null, 409));
        agnadirLog("backend.log", `game ${req.body?.id} changed public value by sudo admin`);
        return res.json(exito("Game alterated"));
    });
});

//Eliminar un juego totalmente
routerAdmin.delete("/game/:id", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await borrarJuego(req.params?.id as string, "");
        if (!resultado) return res.status(404).json(fallo("Game not found", null, 404));
        agnadirLog("backend.log", `Game ${req.params?.id} deleted by sudo admin`);
        return res.json(exito("Game and sub objects deleted...", true));
    });
});

//Cambia el parametro de disponibilidad de un usuario ajeno
routerAdmin.patch("/alterAvailability", autenticarTokenApi, autenticarTokenSesion, autenticarAdmin, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await alterarDisponibilidadUsuario(req.body?.new, req.body?.id);
        if (!resultado) return res.status(409).json(fallo("Couldn't alter user or maybe (404) it doesn't exist", null, 409));
        agnadirLog("backend.log", `User ${req.body?.id} changed availability by sudo admin`);
        return res.json(exito("User alterated"));
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
        if (!resultado) return res.status(404).json(fallo("Report not found", null, 404));
        agnadirLog("backend.log", `Report ${req.params?.id} deleted by admin or moderator`);
        return res.json(exito("Report deleted", true));
    });
});

//Eliminar un comentario
routerAdmin.delete("/comment/:id", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await borrarComentario(req.params?.id as string);
        if (!resultado) return res.status(404).json(fallo("Comment not found", null, 404));
        agnadirLog("backend.log", `Comment ${req.params?.id} deleted by admin or moderator`);
        return res.json(exito("Comment and responses deleted", true));
    });
});

//Ver los datos de cualquier usuario
routerAdmin.get("/user/:id", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await verUsuario(req.params?.id as string, false);
        if (!resultado) return res.status(404).json(fallo("User not found", null, 404));
        return res.json(exito("User data", resultado));
    });
});

//Ver los datos de cualquier juego
routerAdmin.get("/game/:id", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await verJuego(req.params?.id as string, false, "", true, true);
        if (!resultado) return res.status(404).json(fallo("Game not found", null, 404));
        return res.json(exito("Game data", resultado));
    });
});

//Cambiar los strikes de un usuario
routerAdmin.patch("/strike", autenticarTokenApi, autenticarTokenSesion, autenticarModerador, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const cantidad = parseInt(req.body.amount as string) ?? 0;
        const resultado = await alterarStrikesUsuario(req.body?.id as string, cantidad);
        return res.json(exito("After strike data", resultado));
    });
});



//Rutas disponibles solo para sudo

//Comprobar si el usuario que hace la peticion es sudo
routerAdmin.get("/checkSudo", autenticarTokenApi, autenticarTokenSesion, autenticarSudo, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        return res.json(exito("User is sudo"));
    });
});

//Eliminar un usuario totalmente
routerAdmin.delete("/user/:id", autenticarTokenApi, autenticarTokenSesion, autenticarSudo, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await borrarUsuario("", req.params?.id as string, true);
        if (!resultado) return res.status(404).json(fallo("User not found", null, 404));
        agnadirLog("backend.log", `User ${req.params?.id} deleted by sudo admin`);
        return res.json(exito("User and sub objects deleted... Games were keeped due to a preservation policy.", true));
    });
});

//Cambiar los permisos (nivel de acceso) de un usuario
routerAdmin.patch("/userPermissions", autenticarTokenApi, autenticarTokenSesion, autenticarSudo, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const valor = parseInt(req.body.level as string) ?? 0;
        const resultado = await alterarNivelAccesoUsuario(req.body?.id as string, valor);
        return res.json(exito("Result of alteration", resultado));
    });
});



export default routerAdmin;