import bcrypt from 'bcrypt';
import { verSesionToken } from "../controllers/sessionController.js";
import { fallo } from './respuesta.js';


//Para requerir el token de la api en el header X-auth-api
export const autenticarTokenApi = (req, res, next) => {
    const API_TOKEN = process.env.API_PRIVATE_TOKEN;
    try {
        const auth = req.header('X-auth-api');
        if (auth !== API_TOKEN || API_TOKEN === undefined || auth === undefined) {
            return res.status(401).json(fallo("Valid token not provided at private endpoint", null, 401));
        } else {
            next();
        }
    } catch (e) {
        return res.status(401).json(fallo("Valid token not provided at private endpoint", null, 401));
    }
}

//Para requerir el token de sesion de un usuario en el header X-auth-session
export const autenticarTokenSesion = async (req, res, next) => {
    try {
        const tokenActual = req.headers.authorization?.split(" ")[1] ?? (req?.body?.token ?? (req.header('X-auth-session') ?? ""));
        const datosSesion = await verSesionToken(tokenActual);
        if (datosSesion?.id) {
            req.datosSesion = datosSesion;
            req.datosSesion.token = tokenActual;
            next();
        } else {
            return res.status(401).json(fallo("User session token NOT valid OR server error", null, 401));
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json(fallo("User session token NOT valid OR server error", null, 401));
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
