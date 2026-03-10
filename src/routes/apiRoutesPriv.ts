import express from 'express';
import { autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { crearUsuario, loginUsuario, editarUsuario, borrarUsuario, alterarSeguidores } from '../controllers/usuarioController.js';
import { redisGet } from '../connections/redis.js';
import { exito, fallo, manejadorRuta } from './respuesta.js';

const routerPriv = express.Router();

//Rutas de la API, pero privadas porque necesitan el token de la api (pequegna capa de seguridad extra)

//Valida si el API token es valido (el del header)
routerPriv.get("/auth/apiToken", autenticarTokenApi, (req, res) => {
    res.json(exito("Private API token valid"));
});

//Valida si un token de sesion de usuario es valido (en el body)
routerPriv.get("/auth/sessionToken", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const token = req.header('X-auth-session') ?? "";
        const id = await redisGet("SESSION-TOKEN-" + token) ?? "";
        return res.json(exito("User session token valid", id));
    });
});

//Ruta para crear el usuario, requiere en el body (usuario): nombre, nickname, correo, contrasegna, cumpleagnos. Devuelve un token de sesion
routerPriv.post("/user/create", autenticarTokenApi, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const { token, usuario } = await crearUsuario(req.body.usuario);
        usuario.contrasegna = "";
        res.setHeader('X-auth-session', token);
        return res.json(exito("User created successfully", {sessionToken: token, user: usuario}));
    });
});

//Ruta para hacer login con un usuario existente, requiere en el body (credentials): contrasegna, identificacion (su correo o nickname). Devuelve un token de sesion valido por 4 horas y los datos del usuario
routerPriv.post("/user/login", autenticarTokenApi, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const { token, usuario } = await loginUsuario(req.body.credentials);
        usuario.contrasegna = "";
        res.setHeader('X-auth-session', token);
        return res.json(exito("User logged in successfully", {sessionToken: token, user: usuario}));
    })
});

//Ruta para editar un usuario existente, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
//Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, url_foto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
routerPriv.patch("/user/edit", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const id = await redisGet("SESSION-TOKEN-" + token) ?? "";
        if (id === "") return res.status(401).json(fallo("Invalid credentials", null, 401));
        const { usuarioRenovado, tokenNuevo } = await editarUsuario(req.body.newData, id);
        res.setHeader('X-auth-session', tokenNuevo);
        return res.json(exito("User logged in successfully", {sessionToken: tokenNuevo, user: usuarioRenovado}));
    });
});

//Ruta para borrar un usuario, requiere de su contrasegna (sin encriptar, introducida por el usuario) en el body asi como el token de sesion
routerPriv.delete("/user/delete", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const id = await redisGet("SESSION-TOKEN-" + token) ?? "";
        if (id === "" || !req.body.contrasegna) return res.status(401).json(fallo("Invalid credentials", null, 401));
        if (await borrarUsuario(req.body.contrasegna, id)) {
            return res.json(exito("User deleted successfully..."));
            //MAS cascada
        } else {
            return res.status(401).json(fallo("Invalid credentials", null, 401));
        }
    });
});

//Usuario A sigue a usuario B, se crea el registro en mongodb y se altera la cantidad de seguidores en el usuario B, requiere follow +1 o -1 para seguir o desseguir (si es posible) (id_b, cantidad)
routerPriv.post("/user/follow", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    return manejadorRuta(req, res, async () => {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const id = await redisGet("SESSION-TOKEN-" + token) ?? "";
        let cantidad = req.body.cantidad;
        if (cantidad > 1) cantidad = 1;
        if (cantidad < -1) cantidad = -1;
        if (await alterarSeguidores(id, req.body.id_b, cantidad)) {
            return res.json(exito("User followed/unfollowed successfully"));
        } else {
            return res.status(401).json(fallo("Couldn't perform action (follow)", null, 401));
        }
    });
});


export default routerPriv;