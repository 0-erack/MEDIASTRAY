import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
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
        const premium = await usuarioTienePremium(req.params.id);
        return res.json(exito("Premium state", premium));
    });
});

//Devuelve los datos públicos base de un usuario
router.get("/user/:id", async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("User not found", null, 404));
        const usuario = await verUsuario(req.params?.id, true) ?? false;
        if (!usuario) return res.status(404).json(fallo("User not found", null, 404));
        return res.json(exito("User found", usuario));
    });
});



if (process.env.NODE_ENV === "DEVELOPMENT") router.get('/test', async (req, res) => { //Re-ejecutar los tests
    await hacerTestsConexiones();
    res.json({ok:true, message: `Hello, World! Test Processed`, code: 200 });
});



export default router;