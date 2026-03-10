import express from 'express';
import { hacerTestsConexiones } from '../tests/tests.js';
import { alterarSeguidores, verUsuario } from '../controllers/usuarioController.js';
import { exito, fallo, manejadorRuta } from './respuesta.js';

const router = express.Router();

//Rutas de la API

router.get("/prueba", (req, res) => {
    res.json({ message: `Hello, World! Processed`, code: 200 });
});

//Devuelve si el usuario A sigue al usuario B (id_a, id_b)
router.get("/user/follow/:id_a/:id_b", async (req, res) => {
    return manejadorRuta(req, res, async () => {
        if (await alterarSeguidores(req.params.id_a, req.params.id_b, 0)) {
            return res.json(exito("Follows", true));
        } else {
            return res.json(exito("Does not follow", false));
        }
    });
});

//Devuelve los datos públicos base de un usuario
router.get("/user/:id", async (req, res) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params.id) return res.status(404).json(fallo("User not found", null, 404));
        const usuario = await verUsuario(req.params.id) ?? false;
        if (!usuario.id) return res.status(404).json(fallo("User not found", null, 404));
        return res.json(exito("User found", usuario));
    });
});

if (process.env.NODE_ENV === "DEVELOPMENT") router.get('/test', async (req, res) => { //Re-ejecutar los tests
    await hacerTestsConexiones();
    res.json({ok:true, message: `Hello, World! Test Processed`, code: 200 });
});



export default router;