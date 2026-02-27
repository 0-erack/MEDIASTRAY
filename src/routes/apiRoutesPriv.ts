import express from 'express';
import { autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { crearUsuario, loginUsuario, editarUsuario, borrarUsuario, alterarSeguidores } from '../controllers/usuarioController.js';
import { redisGet } from '../connections/redis.js';

const routerPriv = express.Router();

//Rutas de la API, pero privadas porque necesitan el token de la api (pequegna capa de seguridad extra)

//Valida si el API token es valido (el del header)
routerPriv.get("/authApiToken", autenticarTokenApi, (req, res) => {
    res.json({ok:true, message: `Private API token valid`, code: 200 });
});

//Valida si un token de sesion de usuario es valido (en el body)
routerPriv.get("/authSessionToken", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    const token = req.header('X-auth-session') ?? "";
    const uuid = await redisGet("SESSION-TOKEN-" + token) ?? "";
    return res.json({ok:true, message: `User session token valid`, code: 200, uuid });
});

//Ruta para crear el usuario, requiere en el body (usuario): nombre, nickname, correo, contrasegna, cumpleagnos. Devuelve un token de sesion
routerPriv.post("/userCreate", autenticarTokenApi, async (req, res) => {
    try {
        const { token, usuario } = await crearUsuario(req.body.usuario);
        usuario.contrasegna = "";
        res.setHeader('X-auth-session', token);
        return res.json({ok:true, message: `User created successfully`, code: 200, sessionToken: token, user: usuario });
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok:false, message: error.message, code: error.code, data: error.data ?? {}});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok: false, message: "Server error", code: 500});
        }
    }
});

//Ruta para hacer login con un usuario existente, requiere en el body (credentials): contrasegna, identificacion (su correo o nickname). Devuelve un token de sesion valido por 4 horas y los datos del usuario
routerPriv.post("/userLogin", autenticarTokenApi, async (req, res) => {
    try {
        const { token, usuario } = await loginUsuario(req.body.credentials);
        usuario.contrasegna = "";
        res.setHeader('X-auth-session', token);
        return res.json({ok:true, message: `User logged in successfully`, code: 200, sessionToken: token, user: usuario });
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok:false, message: error.message, code: error.code, data: error.data ?? {}});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok:false, message: "Server error", code: 500});
        }
    }
});

//Ruta para editar un usuario existente, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
//Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, url_foto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
routerPriv.patch("/userEdit", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    try {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const uuid = await redisGet("SESSION-TOKEN-" + token) ?? "";
        if (uuid === "") throw {message: "Invalid credentials", code: 401}
        const { usuarioRenovado, tokenNuevo } = await editarUsuario(req.body.newData, uuid);
        res.setHeader('X-auth-session', tokenNuevo);
        return res.json({ok:true, message: `Data editted successfully`, code: 200, user: usuarioRenovado, sessionToken: tokenNuevo });
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok:false, message: error.message, code: error.code ?? 400, data: error.data ?? {}});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok: false, message: "Server error", code: 500});
        }
    }
});

//Ruta para borrar un usuario, requiere de su contrasegna (sin encriptar, introducida por el usuario) en el body asi como el token de sesion
routerPriv.delete("/userDelete", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    try {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const uuid = await redisGet("SESSION-TOKEN-" + token) ?? "";
        if (uuid === "" || !req.body.contrasegna) throw {message: "Invalid credentials", code: 401}
        if (await borrarUsuario(req.body.contrasegna, uuid)) {
            return res.json({ok:true, message: `User deleted successfully...`, code: 200 });
            //MAS cascada
        } else {
            throw {message: "Invalid credentials", code: 401};
        }
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok:false, message: error.message, code: error.code, data: error.data ?? {}});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok:false, message: "Server error", code: 500});
        }
    }
});

//Usuario A sigue a usuario B, se crea el registro en mongodb y se altera la cantidad de seguidores en el usuario B, requiere follow +1 o -1 para seguir o desseguir (si es posible) (uuid_b, cantidad)
routerPriv.post("/userFollow", autenticarTokenApi, autenticarTokenSesion, async (req, res) => {
    try {
        const token = req.body.token ?? (req.header('X-auth-session') ?? "");
        const uuid = await redisGet("SESSION-TOKEN-" + token) ?? "";
        let cantidad = req.body.cantidad;
        if (cantidad > 1) cantidad = 1;
        if (cantidad < -1) cantidad = -1;
        if (await alterarSeguidores(uuid, req.body.uuid_b, cantidad)) {
            return res.json({ok:true, message: `User followed/unfollowed successfully`, code: 200 });
        } else {
            throw {message: "Couldn't perform action (follow)", code: 401};
        }
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error.code).json({ok:false, message: error.message, code: error.code ?? 400, data: error.data ?? {}});
        } catch (error2) {
            //console.log(error2);
            return res.status(500).json({ok:false, message: "Server error", code: 500});
        }
    }
});


export default routerPriv;