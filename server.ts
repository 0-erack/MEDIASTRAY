import express from 'express';
import dotenv from 'dotenv';
import { getConexionMongoose } from './src/connections/mongodb.js';
import { abrirServidorMetricas } from './src/servidorMetricas.js';
import apiRoutes from "./src/routes/apiRoutes.js";
import apiRoutesPriv from "./src/routes/apiRoutesPriv.js";
import path from 'path';
import { iniciarServicioLogs } from './src/connections/logs.js';
import { fileURLToPath } from 'url'
import cors from 'cors';
import { hacerTestsConexiones } from './src/tests/tests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//dotenv.config();
//dotenv.config({path: new URL("./.env", import.meta.url).pathname});
dotenv.config({ path: path.join(process.cwd(), '.env') });
const APP_PORT = process.env.BACKEND_PORT ?? 8510;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
iniciarServicioLogs();

await getConexionMongoose();

if (process.env.INIT_TESTS === "true") {
    //Iniciar los tests para establecer las conexiones permanentes. Se hacen varias veces para asegurarse de que las bases de datos estan realmente preparadas
    setTimeout(async () => {
        await hacerTestsConexiones();
        await hacerTestsConexiones();
        await hacerTestsConexiones();
    }, 5000);
}
if (process.env.NODE_ENV === "DEVELOPMENT") { //Código solo para development
    console.log("ACTUALMENTE EN DEV");
    app.use(cors({
        //origin: process.env.FREE_CORS ?? "n" === "s" ? true : 'http://localhost:8520', //Permitir peticiones de vite
        origin: process.env.FRONTEND_URL_DEV ?? 'http://localhost:8520', //Permitir peticiones de vite
        credentials: true,
    }));
} else { 
    const origenes = [
        process.env.FRONTEND_URL, 
        "app://.",
        "capacitor://localhost",
        "http://localhost",
        //"http://localhost:3000",
        //"*",
    ]
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || origenes.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error());
            }
        },
        credentials: true
    }));

    //app.use(cors({
    //    origin: process.env.FRONTEND_URL ?? "localhost",
    //    credentials: true
    //}));
}


//Rutas con contenido estático
if (process.env.SERVE_STATIC === "true") app.use("/public", express.static(process.env.PUBLIC_FILES_PATH ?? './public'));
if (process.env.SERVE_STATIC === "true") app.use("/games", express.static(process.env.GAMES_FILES_PATH ?? './games'));
//Peticiones a la API (se gestionan manualmente por el servidor)
app.use("/api/v1", apiRoutes);
app.use("/api/v1", apiRoutesPriv);
//Las peticiones en / se dirigen al dist del frontend

//Errores 404
app.use((req, res) => {
    if (req.path.startsWith("/public")) {
        if (process.env.SERVE_STATIC === "false") {
            res.status(404).json({message: "404 Not found", code: 404});
            return;
        }
        res.status(404).redirect('/public/err404.html');
    } else if (req.path.startsWith("/games")) {
        if (process.env.SERVE_STATIC === "false") {
            res.status(404).json({message: "404 Not found", code: 404});
            return;
        }
        res.status(404).redirect('/games/err404.html');
    } else if (req.path.startsWith("/api")) {
        res.status(404).json({message: "404 Not found", code: 404});
    } else {
        if (process.env.SERVE_FRONTEND === "false") {
            res.status(404).json({message: "404 Not found", code: 404});
            return;
        }
        res.sendFile(path.join(process.cwd(), process.env.FRONTEND_DIST_PATH ?? './frontend/dist', "index.html")); //El error 404 en / lo maneja el frontend
    }
});

if (process.env.SERVE_FRONTEND === "true") {
  const frontendPath = path.join(process.cwd(), process.env.FRONTEND_DIST_PATH ?? './frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

if (process.env.INIT_METRICS === "true") try {abrirServidorMetricas(app);} catch (e) {console.log("No se han habierto los servicios de métricas");} //Abrir el servidor de métricas

app.listen(APP_PORT, () => {
    console.log(`Ejecutandose en ${APP_PORT}`);
});

