import { redisGet } from "../connections/redis.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//Para requerir el token de la api en el header X-auth-api
const autenticarTokenApi = (req, res, next) => {
    const API_TOKEN = process.env.API_PRIVATE_TOKEN;
    try {
        const auth = req.header('X-auth-api');
        if (auth !== API_TOKEN || API_TOKEN === undefined || auth === undefined) {
            return res.status(401).json({message: "401: Valid token not provided at private endpoint", code: 401, ok: false });
        } else {
            next();
        }
    } catch (e) {
        return res.status(401).json({message: "401: Token not provided at private endpoint", code: 401, ok: false});
    }
}

//Para requerir el token de sesion de un usuario en el header X-auth-session
const autenticarTokenSesion = async (req, res, next) => {
    try {
        const TOKEN_SECRET = process.env.JWT_SECRET;
        const token = req?.body?.token ?? (req.header('X-auth-session') ?? "");
        const uuid = await redisGet("SESSION-TOKEN-" + token) ?? "";
        const token2 = await redisGet("SESSION-TOKEN-" + uuid) ?? "";
        const uuid2 = jwt.verify(token, TOKEN_SECRET)?.uuid ?? undefined;
        if (token2 === token && uuid2 === uuid && token !== "" && token2 !== "" && uuid !== "" && uuid2) {
            next();
        } else {
            throw { message: `User session token NOT valid OR server error`, code: 401, ok: false }
        }
    } catch (error) {
        console.log(error);
        return res.json({ message: `User session token NOT valid OR server error`, code: 401, ok: false });
    }
}

const autenticarContrasegnaUsuario = async (entrante:string, encriptada:string):Promise<Boolean> => {
    const contrasegnaCoincide = await bcrypt.compare(entrante, encriptada ?? '');
    return contrasegnaCoincide;
}

//Para requerir el token de sesion de juego (de un usuario) en el header X-auth-playtime
const autenticarTokenJuego = (req, res, next) => {

}

//Para requerir el token de edicion de un juego en el header X-auth-game
const autenticarTokenAdministracionJuego = (req, res, next) => {

}

export { autenticarTokenApi, autenticarTokenJuego, autenticarTokenSesion, autenticarTokenAdministracionJuego, autenticarContrasegnaUsuario };