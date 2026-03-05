import { pgTable, varchar, integer, boolean, text, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usuarios = pgTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  nickname: varchar("nickname", { length: 16 }).unique().notNull(), //Nombre identificador
  nombre: varchar("nombre", { length: 64 }).unique().notNull(), //Nombre normal
  contrasegna: varchar("contrasegna", { length: 128 }).notNull(), //Contrasegna encriptada
  correo: varchar("correo", { length: 255 }).unique().notNull(), //Correo para login
  descripcion: varchar("descripcion", { length: 512 }).default(""), //Descripcion markdown
  urlFoto: varchar("url_foto", { length: 255 }).default("/public/nopfp.png"), //Url de su foto
  cumpleagnos: varchar("cumpleagnos", { length: 16 }), //Fecha de nacimiento en timestamp para evitar juegos +18
  fechacreacion: varchar("fechacreacion", { length: 16 }), //Fecha de creacion del usuario en timestamp
  strikes: integer("strikes").default(0), //Manejo interno
  disponibilidad: integer("disponibilidad").default(0), //Permisos restrictivos: 0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
  premium: varchar("premium", { length: 16 }).default(""), //Si tiene el premium (se almacena la fecha de caducidad, si esta vacio no tiene directamente)
  cantidadSeguidores: integer("cantidad_seguidores").default(0), //Cantidad de seguidores que tiene
  nivelPublico: integer("nivel_publico").default(0), //Nivel de anonimato: 0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
  nivelAcceso: integer("nivel_acceso").default(0), //Permisos permisisvos: 0 normal, 1 panel de administracion, 2 full admin (no controla desde interfaz), 3 moderador
});

export const juegos = pgTable("juegos", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  titulo: varchar("titulo", { length: 63 }).unique().notNull(), //Titulo del juego
  //Url de las portadas en distinta resolucion
  urlPortada1: varchar("url_portada1", { length: 256 }).default("/public/coverless1.png"),
  urlPortada2: varchar("url_portada2", { length: 256 }).default("/public/coverless2.png"),
  urlPortada3: varchar("url_portada3", { length: 256 }).default("/public/coverless3.png"),
  publico: boolean("publico").default(true), //Si esta publicado
  versionactual: varchar("versionactual", { length: 16 }).default("1.0.0"), //Ultima version
  fechaCreacion: varchar("fecha_creacion", { length: 16 }), //Fecha en la que se creo
  fechaUltima: varchar("fecha_ultima", { length: 16 }), //Ultima fecha en la que se edito el juego
  descripcion: varchar("descripcion", { length: 1024 }).default(""), //Descripcion en markdown (alternativamente cambia en los archivos html)
  idCreador: varchar("id_creador", { length: 36 }).notNull().references(() => usuarios.id), //FK id de su creador
  tokenAdministracion: varchar("token_administracion", { length: 32 }), //Token actual para administracion y edicion
  //TODO logros builds savedatas extensiones paginas
  generos: varchar("generos", { length: 255 }), //Generos separados por comas
  idiomas: varchar("idiomas", { length: 255 }), //Idiomas separados por comas
  cantidadSeguidores: integer("cantidad_seguidores").default(0), //Cantidad de seguidores actual
  cantidadLikes: integer("cantidad_likes").default(0), //Cantidad de likes actual
  edad: integer("edad").default(0), //Edad minima para jugar el juego
});

export const foros = pgTable("foros", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  titulo: varchar("titulo", { length: 63 }).unique().notNull(), //Titulo del foro
  descripcion: varchar("descripcion", { length: 511 }).default(""), //Descripcion en markdown
  urlFoto: varchar("url_foto", { length: 255 }).default("/public/coverless_forum.png"), //Url de la foto principal
  urlBanner: varchar("url_banner", { length: 255 }).default("/public/bannerless.png"), //Url de la foto principal (horizontal)
  //TODO publico o no, exclusivo, igdb
  idCreador: varchar("id_creador", { length: 36 }).references(() => usuarios.id), //FK id de su creador
  fechaCreacion: varchar("fecha_creacion", { length: 15 }), //Fecha en la que se creo
  cantidadSeguidores: integer("cantidad_seguidores").default(0), //Cantidad de seguidores actual
  cantidadLikes: integer("cantidad_likes").default(0), //Cantidad de likes actual
  juegoAsociado: varchar("juego_asociado", { length: 36 }), //FK? juego asociado
});


export const usuariosRelations = relations(usuarios, ({ many }) => ({
  juegos: many(juegos),
  foros: many(foros),
}));

export const juegosRelations = relations(juegos, ({ one }) => ({
  creador: one(usuarios, {
    fields: [juegos.idCreador],
    references: [usuarios.id],
  }),
}));

export const forosRelations = relations(foros, ({ one }) => ({
  creador: one(usuarios, {
    fields: [foros.idCreador],
    references: [usuarios.id],
  }),
}));