//Rutas abiertas al publico para la cuales no se necesita el token de la api

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { verComentario } from '../controllers/comentarioController.js';
import { buscarJuegos, verJuego, verJuegosDestacados, verJuegosUsuario, verJuegoTemporada } from '../controllers/juegoController.js';
import { alterarSeguidores, buscarUsuarios, usuarioTienePremium, verSeguimientosUsuario, verUsuario } from '../controllers/usuarioController.js';
import { hacerTestsConexiones } from '../tests/tests.js';
import { exito, fallo, manejadorRuta } from './respuesta.js';

const router = express.Router();

//Rutas de la API

//Solo una prueba para comprobar que el backend este operativo
router.get("/prueba", (req, res) => {
    res.json({ message: `Hello, World! Processed`, code: 200 });
});

//Devuelve la lista de uuid de usuarios que le siguen
router.get("/user/follow/followersList/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const resultado = await verSeguimientosUsuario(req.params?.id, pagina, false);
        return res.json(exito("List of followers of the user", {results: resultado, amount: resultado.length}));
    });
});

//Devuelve la lista de uuid de usuarios que sigue
router.get("/user/follow/followingsList/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const resultado = await verSeguimientosUsuario(req.params?.id, pagina, true);
        return res.json(exito("List of users that follow the user", {results: resultado, amount: resultado.length}));
    });
});

//Busqueda de usuarios por texto, usar ! para que salgan todos
router.get("/user/search/:query", async (req: ExpressRequest<{ query: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const orden = parseInt(req.query.order as string) ?? 0;
        const resultado = await buscarUsuarios(req.params?.query === "!" ? '' : req.params?.query, pagina, orden);
        return res.json(exito("Users found", {results: resultado, amount: resultado.length}));
    });
});

//Devuelve si el usuario A sigue al usuario B (id_a, id_b)
router.get("/user/follow/:id_a/:id_b", async (req: ExpressRequest<{ id_a: string; id_b: string }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (await alterarSeguidores(req.params?.id_a, req.params?.id_b, 0)) {
            return res.json(exito("Follows", true));
        } else {
            return res.json(exito("Does not follow", false));
        }
    });
});

//Ver si un usuario es premium o no
router.get("/user/premium/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("User not found", null, 404));
        const premium = await usuarioTienePremium(req.params.id, true);
        return res.json(exito("Premium state", premium));
    });
});

//Devuelve los juegos de un usuario
router.get("/user/games/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        if (!req.params?.id) return res.status(404).json(fallo("User not found", null, 404));
        const juegos = await verJuegosUsuario(req.params.id, null, pagina);
        if (!juegos) return res.status(404).json(fallo("Games not found", null, 404));
        return res.json(exito("Games by user", {games: juegos}));
    });
});

//Devuelve los datos publicos base de un usuario
router.get("/user/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("User not found", null, 404));
        const usuario = await verUsuario(req.params?.id, true) ?? false;
        if (!usuario) return res.status(404).json(fallo("User not found", null, 404));
        return res.json(exito("User found", usuario));
    });
});





//Devuelve el juego diario
router.get("/game/daily", async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const juego = await verJuegoTemporada(false);
        if (!juego) return res.status(404).json(fallo("Game not found", null, 404));
        return res.json(exito("Game found", {game: juego}));
    });
});

//Devuelve el juego semanal
router.get("/game/weekly", async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const juego = await verJuegoTemporada(true);
        if (!juego) return res.status(404).json(fallo("Game not found", null, 404));
        return res.json(exito("Game found", {game: juego}));
    });
});

//Devuelve el juego semanal
router.get("/game/featured", async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const juegos = await verJuegosDestacados(pagina);
        if (!juegos || !juegos?.length) return res.status(404).json(fallo("Games not found", null, 404));
        return res.json(exito("Games found", {games: juegos}));
    });
});

//Busqueda de juegos por texto, usar ! para que salgan todos
router.get("/game/search/:query", async (req: ExpressRequest<{ query: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const orden = parseInt(req.query.order as string) ?? 0;
        const resultado = await buscarJuegos(req.params?.query === "!" ? '' : req.params?.query, pagina, orden);
        return res.json(exito("Games found", {results: resultado, amount: resultado.length}));
    });
});

//Devuelve los datos publicos base de un juego
router.get("/game/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const usuario = await verJuego(req.params?.id, false, undefined, true) ?? false;
        if (!usuario) return res.status(404).json(fallo("Game not found", null, 404));
        return res.json(exito("Game found", usuario));
    });
});




//Devuelve los comentarios que coincidan con la busqueda
router.get("/comment/:modo/:id", async (req: ExpressRequest<{ id: string; modo: 0|1|2; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const paginaSub = parseInt(req.query.pageSub as string) ?? 0;
        if (!req.params?.modo) return res.status(404).json(fallo("Comment not found", null, 404));
        if (!req.params?.id) return res.status(404).json(fallo("Comment not found", null, 404));
        const comentarios = await verComentario(req.params?.modo ?? 0, req.params?.id, pagina, paginaSub) ?? null;
        if (!comentarios) return res.status(404).json(fallo("Comment not found", null, 404));
        return res.json(exito("Comments found", {comments: comentarios}));
    });
});


if (process.env.NODE_ENV === "DEVELOPMENT") router.get('/test', async (req, res) => { //Re-ejecutar los tests
    await hacerTestsConexiones();
    res.json({ok:true, message: `Hello, World! Test Processed`, code: 200 });
});



export default router;