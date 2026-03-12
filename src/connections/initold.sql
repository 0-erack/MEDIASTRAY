-- CREATE EXTENSION pg_redis;
-- ALTER SYSTEM SET pg_redis_host = 'redis';
-- ALTER SYSTEM SET pg_redis_port = 6379;
-- ALTER SYSTEM SET pg_redis_password = '<YOUR_REDIS_PASSWORD>';
-- ALTER SYSTEM SET pg_redis_db = 0;
-- SELECT pg_reload_conf();


DROP TABLE IF EXISTS FOROS;
DROP TABLE IF EXISTS JUEGOS;
DROP TABLE IF EXISTS USUARIOS;

CREATE TABLE USUARIOS (
    uuid VARCHAR(36) PRIMARY KEY, --Identificador
    nickname VARCHAR(15) UNIQUE NOT NULL, --Nombre identificador
    nombre VARCHAR(100) UNIQUE NOT NULL, --Nombre normal
    contrasegna VARCHAR(127) NOT NULL, --Contrasegna encriptada
    correo VARCHAR(255) UNIQUE NOT NULL, --Correo para login
    descripcion VARCHAR(511) DEFAULT '', --Descripcion markdown
    urlFoto VARCHAR(255) DEFAULT '/public/nopfp.png', --Url de su foto
    --telefono VARCHAR(20),
    cumpleagnos VARCHAR(15), --Fecha de nacimiento en timestamp para evitar juegos +18
    fechacreacion VARCHAR(15), --Fecha de creacion del usuario en timestamp
    strikes INTEGER DEFAULT 0, --Manejo interno
    disponibilidad INTEGER DEFAULT 0, --0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
    premium VARCHAR(15) DEFAULT '', --Si tiene el premium (se almacena la fecha de caducidad, si esta vacio no tiene directamente)
    cantidad_seguidores INTEGER DEFAULT 0, --Cantidad de seguidores que tiene
    nivel_publico INTEGER DEFAULT 0, --0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
    nivel_acceso INTEGER DEFAULT 0 --0 normal, 1 panel de administracion, 2 full admin (no controla desde interfaz), 3 moderador
);

CREATE TABLE JUEGOS (
    uuid VARCHAR(36) PRIMARY KEY, --Identificador
    titulo VARCHAR(63) UNIQUE NOT NULL, --Titulo del juego
    --Url de las portadas en distinta resolucion
    url_portada1 VARCHAR(255) DEFAULT '/public/coverless1.png',
    url_portada2 VARCHAR(255) DEFAULT '/public/coverless2.png',
    url_portada3 VARCHAR(255) DEFAULT '/public/coverless3.png',
    --urlportada4 VARCHAR(255) DEFAULT '/public/coverless4.png',
    publico BOOLEAN DEFAULT TRUE, --Si esta publicado
    versionactual VARCHAR(15) DEFAULT '1.0.0', --Ultima version
    fecha_creacion VARCHAR(15), --Fecha en la que se creo
    fecha_aultima VARCHAR(15), --Ultima fecha en la que se edito el juego
    descripcion VARCHAR(1023) DEFAULT '', --Descripcion en markdown (alternativamente cambia en los archivos html)
    uuid_creador VARCHAR(36) REFERENCES USUARIOS(uuid), --uuid de su creador
    token_administracion VARCHAR(32),
    --builds
    --logros
    --savedatas
    generos VARCHAR(255), --Generos separados por ,
    idiomas VARCHAR(255), --Idiomas separados por ,
    cantidad_seguidores INTEGER DEFAULT 0, --Cantidad de seguidores del juego
    cantidad_likes INTEGER DEFAULT 0 --Cantidad de likes del juego
);

CREATE TABLE FOROS (
    uuid VARCHAR(36) PRIMARY KEY, --Identificador
    titulo VARCHAR(63) UNIQUE NOT NULL, --Titulo del foro
    descripcion VARCHAR(511) DEFAULT '', --Descripcion en markdown
    urlFoto VARCHAR(255) DEFAULT '/public/coverless_forum.png', --Url de la foto principal
    url_banner VARCHAR(255) DEFAULT '/public/bannerless.png', --Url del banner (foto horizontal)
    publico BOOLEAN DEFAULT TRUE, --Si esta publico
    uuid_creador VARCHAR(36) REFERENCES USUARIOS(uuid), --uuid de su creador
    fecha_creacion VARCHAR(15), --Fecha en la que se creo en formato timestamp
    cantidad_seguidores INTEGER DEFAULT 0, --Cantidad de seguidores que tiene
    cantidad_likes INTEGER DEFAULT 0, --Cantidad de likes que tiene
    juego_asociado VARCHAR(36) --A que juego esta asociado, puede ser un id de igdb o un uuid de un juego en la plataforma
);
