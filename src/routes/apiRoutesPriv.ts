//Rutas ocultas para las cuales se necesita el token de la api

import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { borrarComentario, comentarComentario, comentarJuego, likeComentario, verComentario } from '../controllers/comentarioController.js';
import { borrarJuego, cambiarIndexacionJuego, crearJuego, editarAdicionesJuego, editarJuego, seguirJuego, verJuego, verJuegosSeguidos, verJuegosUsuario } from '../controllers/juegoController.js';
import { cerrarSesion, verSesionToken } from '../controllers/sessionController.js';
import { alterarSeguidores, borrarUsuario, crearUsuario, editarUsuario, loginUsuario, logoutUsuario, renovarPremium, verUsuario } from '../controllers/usuarioController.js';
import { autenticarTokenApi, autenticarTokenSesion } from './autenticaciones.js';
import { exito, fallo, falloInterno, manejadorRuta } from './respuesta.js';

const routerPriv = express.Router();

//Rutas de la API, pero privadas porque necesitan el token de la api (pequegna capa de seguridad extra)

//Valida si el API token es valido (el del header)
routerPriv.get("/auth/apiToken", autenticarTokenApi, (req, res) => {
    res.json(exito("Private API token valid"));
});

//Valida si un token de sesion de usuario es valido (en el body)
routerPriv.get("/auth/sessionToken", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const token = req.header('X-auth-session') ?? "";
        const data = await verSesionToken(token);
        return res.json(exito("User session token valid", data));
    });
});

//Ruta para crear el usuario, requiere en el body (usuario): nombre, nickname, correo, contrasegna, cumpleagnos. Devuelve un token de sesion
routerPriv.post("/user/create", autenticarTokenApi, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const { token, usuario } = await crearUsuario(req.body.user);
        res.setHeader('X-auth-session', token);
        return res.json(exito("User created successfully", { sessionToken: token, user: usuario }, 201));
    });
});

//Ruta para hacer login con un usuario existente, requiere en el body (credentials): contrasegna, identificacion (su correo o nickname). Devuelve un token de sesion valido por 4 horas y los datos del usuario
routerPriv.post("/user/login", autenticarTokenApi, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const { token, usuario } = await loginUsuario(req.body.credentials);
        res.setHeader('X-auth-session', token);
        return res.json(exito("User logged in successfully", { sessionToken: token, user: usuario }));
    })
});

//Ruta para borrar la sesion actual de un usuario
routerPriv.delete("/user/logout", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await logoutUsuario(req.datosSesion!.id, req.datosSesion!.token);
        if (resultado) {
            res.setHeader('X-auth-session', '');
            return res.json(exito("User logged out successfully"));
        }
        return res.json(falloInterno());
    })
});

//Ruta para editar un usuario existente, requiere en el body (newData) todos los posibles nuevos datos. Devuelve true si va todo bien
//Concretamente se pueden editar: nickname, nombre, contrasegna, correo, descripcion, urlFoto, cumpleagnos. Para nickname, correo o contrasegna se requiere tambien la contrasegna antigua (contrasegnaAntigua)
routerPriv.patch("/user/edit", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const { usuarioRenovado, tokenNuevo } = await editarUsuario(req.body.newData, req.datosSesion!.id);
        res.setHeader('X-auth-session', tokenNuevo);
        return res.json(exito("User editted successfully", { sessionToken: tokenNuevo, user: usuarioRenovado }));
    });
});

//Ver los datos del usuario que ha hecho la peticion
routerPriv.get("/user/me", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const usuario = await verUsuario(req.datosSesion!.id, false) ?? false;
        if (!usuario) return res.status(404).json(fallo("User not found", null, 404));
        return res.json(exito("User found", usuario));
    });
});

//Ruta para borrar un usuario, requiere de su contrasegna (sin encriptar, introducida por el usuario) en el body asi como el token de sesion
routerPriv.delete("/user", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (await borrarUsuario(req.body?.password ?? '', req.datosSesion!.id)) {
            res.setHeader('X-auth-session', '');
            await cerrarSesion(req.datosSesion!.id, req.datosSesion!.token);
            return res.json(exito("User deleted successfully..."));
        } else {
            return res.status(403).json(fallo("Invalid credentials", null, 403));
        }
    });
});

//Usuario A sigue a usuario B, se crea el registro en mongodb y se altera la cantidad de seguidores en el usuario B, requiere follow +1 o -1 para seguir o desseguir (si es posible) (id_b, cantidad)
routerPriv.post("/user/follow", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        let cantidad = Math.sign(req.body?.quantity) ?? 0;
        if (cantidad != 0 && await alterarSeguidores(req.datosSesion!.id, req.body.id_b, cantidad)) {
            return res.json(exito("User followed/unfollowed successfully", undefined, 201));
        } else {
            return res.status(409).json(fallo("Couldn't perform action (follow)", null, 409));
        }
    });
});

//Renovar el premium del usuario x meses, esto deriva en el proceso de compra tambien, requiere los datos de pago y la cantidad de meses
routerPriv.post("/premium/renew", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await renovarPremium(req.datosSesion!.id, req.body?.months ?? -1, req.body?.payment ?? {});
        if (resultado) {
            return res.json(exito("Premium renewed succesfully"));
        } else {
            return res.status(402).json(fallo("Couldn't renew premium", null, 402));
        }
    });
});







//Crear un nuevo juego asociado a ese usuario
routerPriv.post("/game/create", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const juego = await crearJuego(req.body.game, req.datosSesion!.id);
        if (juego) {
            return res.json(exito("Game created succesfully", { game: juego }));
        } else {
            return res.status(409).json(fallo("Couldn't create game", null, 409));
        }
    });
});

//Buscar un juego, en este caso al requerir autenticacion puede ver los datos de un juego oculto del propio usuario si era suyo, asi como aumentar la estadistica de cantidad de jugadores
routerPriv.get("/game/personal/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const juego = await verJuego(req.params.id, false, req.datosSesion!.id, true);
        if (juego) {
            return res.json(exito("Game found", { ...juego }));
        } else {
            return res.status(404).json(fallo("Couldn't find game", null, 404));
        }
    });
});

//Devuelve todos los juegos de ese usuario
routerPriv.get("/game/my", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const juegos = await verJuegosUsuario(req.datosSesion!.id, req.datosSesion!.id, req.query?.all ? -1 : pagina);
        if (!juegos) return res.status(404).json(fallo("Games not found", null, 404));
        return res.json(exito("Own games", { games: juegos }));
    });
});

//Borrar un juego y todo lo que eso implica
routerPriv.delete("/game/delete/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await borrarJuego(req.params.id, req.body?.password, req.datosSesion!.id);
        if (resultado) {
            return res.json(exito("Game deleted..."));
        } else {
            return res.status(404).json(fallo("Couldn't delete game or invalid credentials", null, 404));
        }
    });
});

//Publicar o des-publicar un juego
routerPriv.patch("/game/index/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await cambiarIndexacionJuego(req.params.id, req.body?.state, req.datosSesion!.id);
        if (resultado) {
            return res.json(exito("Game settings changed"));
        } else {
            return res.status(404).json(fallo("Couldn't change game settings or invalid credentials", null, 404));
        }
    });
});

//Editar un juego a modo de patch
routerPriv.patch("/game/edit/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await editarJuego(req.body?.newData, req.params.id, req.datosSesion!.id);
        if (resultado) {
            return res.json(exito("Game settings changed", { game: resultado }));
        } else {
            return res.status(404).json(fallo("Couldn't change game settings or invalid credentials", null, 404));
        }
    });
});

//Establecer las adiciones a un juego (borra las que ya estaban)
routerPriv.put("/game/additions/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await editarAdicionesJuego(req.body?.additions, req.params.id, req.datosSesion!.id);
        if (resultado) {
            return res.json(exito("Game additions setted", { current: resultado }));
        } else {
            return res.status(409).json(fallo("There was an error changing the additions of the game", null, 409));
        }
    });
});

//El usuario actual sigue un juego
routerPriv.post("/game/follow", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const cantidad = Math.sign(req.body?.quantity) ?? 0;
        const resultado = await seguirJuego(req.body?.id, req.datosSesion!.id, cantidad);
        if (resultado) {
            return res.json(exito("Game followed/unfollowed", resultado));
        } else {
            return res.status(409).json(fallo("There was an error following/unfollowing the game", null, 409));
        }
    });
});

//Ver los juegos seguidos por el usuario actual
routerPriv.get("/game/followed", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const resultado = await verJuegosSeguidos(req.datosSesion!.id, pagina);
        if (!resultado || !resultado?.length) return res.status(404).json(fallo("Followed games not found", null, 404));
        return res.json(exito("Game follow information", resultado));
    });
});

//Ver si el usuario sigue un juego
routerPriv.get("/game/follow/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await seguirJuego(req.params?.id, req.datosSesion!.id, 0);
        return res.json(exito("Game follow information", resultado ?? false));
    });
});




//Comentar un juego
routerPriv.post("/comment/game/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Game not found", null, 404));
        const resultado = await comentarJuego(req.params?.id, req.body?.content, req.datosSesion!.id);
        if (!resultado) return res.status(404).json(fallo("Comment didn't get posted", null, 400));
        return res.json(exito("Comment posted", { comment: resultado }));
    });
});

//Comentar un comentario
routerPriv.post("/comment/comment/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        if (!req.params?.id) return res.status(404).json(fallo("Comment not found", null, 404));
        const resultado = await comentarComentario(req.params?.id, req.body?.content, req.datosSesion!.id);
        if (!resultado) return res.status(404).json(fallo("Comment didn't get posted", null, 400));
        return res.json(exito("Comment posted", { comment: resultado }));
    });
});

//Ver comentarios de un juego personalmente
routerPriv.get("/comment/personal/:modo/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest<{ id: string; modo: 0 | 1 | 2; }>, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const pagina = parseInt(req.query.page as string) ?? 0;
        const paginaSub = parseInt(req.query.pageSub as string) ?? 0;
        if (!req.params?.modo) return res.status(404).json(fallo("Comment not found", null, 404));
        if (!req.params?.id) return res.status(404).json(fallo("Comment not found", null, 404));
        const comentarios = await verComentario(req.params?.modo ?? 0, req.params?.id, pagina, paginaSub, req.datosSesion!.id) ?? null;
        if (!comentarios) return res.status(404).json(fallo("Comment not found", null, 404));
        return res.json(exito("Comments found", { comments: comentarios }));
    });
});

//El usuario actual da like a un comentario
routerPriv.post("/comment/like/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const cantidad = Math.sign(req.body?.quantity) ?? 0;
        const resultado = await likeComentario(req.body?.id, req.datosSesion!.id, cantidad);
        if (resultado) {
            return res.json(exito("Comment liked/unliked", resultado));
        } else {
            return res.status(409).json(fallo("There was an error liking/unliking the comment", null, 409));
        }
    });
});

//Borrar un comentario y subcomentarios
routerPriv.delete("/comment/delete/:id", autenticarTokenApi, autenticarTokenSesion, async (req: ExpressRequest, res: ExpressResponse) => {
    return manejadorRuta(req, res, async () => {
        const resultado = await borrarComentario(req.body?.id, req.datosSesion!.id);
        if (resultado) {
            return res.json(exito("Comment deleted"));
        } else {
            return res.status(409).json(fallo("There was an error deleting the comment", null, 409));
        }
    });
});



export default routerPriv;