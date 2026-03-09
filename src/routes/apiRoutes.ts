import express from 'express';
import { hacerTestsConexiones } from '../tests/tests.js';
import { alterarSeguidores, verUsuario } from '../controllers/usuarioController.js';
import { exito, fallo, falloInterno, manejadorRuta } from './respuesta.js';

const router = express.Router();

//Rutas de la API

router.get("/prueba", (req, res) => {
    res.json({ message: `Hello, World! Processed`, code: 200 });
});

//Devuelve si el usuario A sigue al usuario B (id_a, id_b)
router.get("/userFollow/:id_a/:id_b", async (req, res) => {
    manejadorRuta(req, res, async () => {
        if (await alterarSeguidores(req.params.id_a, req.params.id_b, 0)) {
            return res.json(exito("Follows", true));
        } else {
            return res.json(exito("Does not follow", false));
        }
    });
});

//Devuelve los datos públicos base de un usuario
router.get("/user/:id", async (req, res) => {
    try {
        if (!req.params.id) return res.status(404).json({ok: false, message: "User not found or not present", code: 404});
        const usuario = await verUsuario(req.params.id) ?? false;
        if (!usuario.id) return res.status(404).json({ok: false, message: "User not found", code: 404});
        return res.json({ok:true, code: 200, data: usuario });
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok: false,message: error.message, code: error.code ?? 400});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok: false, message: "Server error", code: 500});
        }
    }
});

if (process.env.NODE_ENV === "DEVELOPMENT") router.get('/test', async (req, res) => { //Re-ejecutar los tests
    await hacerTestsConexiones();
    res.json({ok:true, message: `Hello, World! Test Processed`, code: 200 });
});



export default router;