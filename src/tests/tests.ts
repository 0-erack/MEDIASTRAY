import { escribirArchivo, leerArchivo, borrarArchivo } from '../connections/archivos.js';
import { Test } from '../models/schemaMongo.js';
import { getDB } from '../connections/postgresql.js';
import { redisGet, redisSet } from '../connections/redis.js';
import { agnadirLog } from '../connections/logs.js';
import { usuarios } from '../models/schema.js';
import { eq, and } from 'drizzle-orm';

/*import { testMongodb } from './testMongodb.js';
import { testRedis } from './testRedis.js';
import { testSql } from './testPostgresql.js';
import { testFs } from './testFs.js';*/
//import { testMail } from './testMail.js';

//Hace tests por cuenta propia y de la manera normal usando las conexiones normales de las bases de datos
export const hacerTestsConexiones = async () => {
    try {
        /*await testRedis();
        await testSql(); 
        await testMongodb();
        await testFs();*/
        //await testMail();

        console.log("----------- REDIS");
        await redisSet("test-init", "12345");
        console.log(await redisGet("test-init"));
        console.log("----------- MONGODB");
        //await mongoSet("test-init", {hola: "hello", numero: 12345});
        //console.log(await mongoGet("test-init", {numero: 12345}));
        //await mongoDelete("test-init", {hola: "hello"}, true);
        await Test.create({ nombre: "hello", numero: 12345 });
        const resultado = await Test.findOne({ numero: 12345 }).lean();
        console.log(resultado);
        await Test.deleteOne({nombre: "hello"});
        console.log("----------- ARCHIVOS");
        await escribirArchivo("hola 1234", "./src/files/prueba", "prueba.txt", true);
        console.log(await leerArchivo("./src/files/prueba/prueba.txt", true));
        await borrarArchivo("./src/files/prueba/prueba.txt");
        console.log("----------- POSTGRESQL");
        const db = getDB();
        //console.log(await consulta("SELECT 1 FROM USUARIOS LIMIT 1;"));
        const test1 = await db.select().from(usuarios).limit(1);
        console.log("test:", test1);
        //const sql1 = await consulta("SELECT * FROM USUARIOS LIMIT 4;");
        //console.log("primero", sql1);
        const sql1 = await db.query.usuarios.findMany({limit: 4});
        console.log("primero", sql1);
        //const sql2 = await consulta("SELECT * FROM USUARIOS WHERE nombre = $1 AND nickname = $2;", ["nombre", "nickname"])
        //console.log("segundo", sql2);
        const sql2 = await db.select().from(usuarios).where(and(eq(usuarios.nombre, "nombre"),eq(usuarios.nickname, "nickname")));
        console.log("segundo", sql2);
        console.log("------------");
        agnadirLog("backend.log", "una prueba de logs");
    } catch (error) {
        console.log(error);
        //if (res) res.json({ message: `error` });
    }
}
