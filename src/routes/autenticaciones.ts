import bcrypt from 'bcrypt';
import { verSesionToken } from "../controllers/sessionController.js";

//Para requerir el token de la api en el header X-auth-api
export const autenticarTokenApi = (req, res, next) => {
    const API_TOKEN = process.env.API_PRIVATE_TOKEN;
    try {
        const auth = req.header('X-auth-api');
        if (auth !== API_TOKEN || API_TOKEN === undefined || auth === undefined) {
            return res.status(401).json({message: "401: Valid token not provided at private endpoint", code: 401});
        } else {
            next();
        }
    } catch (e) {
        return res.status(401).json({message: "401: Token not provided at private endpoint", code: 401});
    }
}

//Para requerir el token de sesion de un usuario en el header X-auth-session
export const autenticarTokenSesion = async (req, res, next) => {
    try {
        const TOKEN_SECRET = process.env.JWT_SECRET;
        /*const token = req?.body?.token ?? (req.header('X-auth-session') ?? "");
        const id = await redisGet("SESSION-TOKEN-" + token) ?? "";
        const token2 = await redisGet("SESSION-TOKEN-" + id) ?? "";
        const id2 = jwt.verify(token, TOKEN_SECRET)?.id ?? undefined;
        if (token2 === token && id2 === id && token !== "" && token2 !== "" && id !== "" && id2) {*/
        const datosSesion = await verSesionToken(req?.body?.token ?? (req.header('X-auth-session') ?? ""));
        if (datosSesion?.id) {
            req.datosSesion = datosSesion;
            next();
        } else {
            throw { message: `User session token NOT valid OR server error`, code: 401}
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: `User session token NOT valid OR server error`, code: 401});
    }
}

export const autenticarContrasegnaUsuario = async (entrante:string, encriptada:string):Promise<Boolean> => {
    const contrasegnaCoincide = await bcrypt.compare(entrante, encriptada ?? '');
    return contrasegnaCoincide;
}

//Para requerir el token de sesion de juego (de un usuario) en el header X-auth-playtime
export const autenticarTokenJuego = (req, res, next) => {

}

//Para requerir el token de edicion de un juego en el header X-auth-game
export const autenticarTokenAdministracionJuego = (req, res, next) => {

}
