//Entidades en la base de datos sql, las de Mongo se manejan en otro archivo

import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

//Usuarios generales de la aplicacion
export const usuarios = pgTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  nickname: varchar("nickname", { length: 16 }).unique().notNull(), //Nombre identificador
  nombre: varchar("nombre", { length: 64 }).unique().notNull(), //Nombre normal
  contrasegna: varchar("contrasegna", { length: 128 }).notNull(), //Contrasegna encriptada
  correo: varchar("correo", { length: 255 }).unique().notNull(), //Correo para login
  descripcion: varchar("descripcion", { length: 512 }).default(""), //Descripcion markdown
  urlFoto: varchar("urlFoto", { length: 255 }).default("/public/nopfp.png"), //Url de su foto
  cumpleagnos: varchar("cumpleagnos", { length: 16 }), //Fecha de nacimiento en timestamp para evitar juegos +18
  fechaCreacion: varchar("fechaCreacion", { length: 16 }), //Fecha de creacion del usuario en timestamp
  strikes: integer("strikes").default(0), //Manejo interno
  disponibilidad: integer("disponibilidad").default(0), //Permisos restrictivos: 0 disponible, 1 desabilitada de subir juegos, 2 desabilitada de interactuar, 3 desabilitada de login...
  premium: varchar("premium", { length: 16 }).default(""), //Si tiene el premium (se almacena la fecha de caducidad, si esta vacio no tiene directamente)
  cantidadSeguidores: integer("cantidadSeguidores").default(0), //Cantidad de seguidores que tiene
  nivelPublico: integer("nivelPublico").default(0), //Nivel de anonimato: 0 normal, 1 pueden saber que existe pero no ver datos, 2 totalmente anonimo...
  nivelAcceso: integer("nivelAcceso").default(0), //Permisos permisisvos: 0 normal, 1 panel de administracion, 2 full admin (no controla desde interfaz), 3 moderador
});

//Juegos guardados y sus datos
export const juegos = pgTable("juegos", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  titulo: varchar("titulo", { length: 64 }).unique().notNull(), //Titulo del juego
  //Url de las portadas en distinta resolucion
  urlPortada1: varchar("urlPortada1", { length: 512 }).default("/public/coverless1.png"), //Pequegno (460x215px)
  urlPortada2: varchar("urlPortada2", { length: 512 }).default("/public/coverless2.png"), //Vertical (600x900px)
  urlPortada3: varchar("urlPortada3", { length: 512 }).default("/public/coverless3.png"), //Grande (1920x1080px)
  publico: boolean("publico").default(true), //Si esta publicado (indexado)
  versionActual: varchar("versionactual", { length: 16 }).default("1.0.0"), //Ultima version
  fechaCreacion: varchar("fechaCreacion", { length: 16 }), //Fecha en la que se creo
  fechaUltima: varchar("fechaUltima", { length: 16 }), //Ultima fecha en la que se edito el juego
  descripcion: varchar("descripcion", { length: 8192 }).default(""), //Descripcion en markdown (alternativamente cambia en los archivos html)
  descripcionCorta: varchar("descripcionCorta", { length: 127 }), //Descripcion mas corta para el engagement
  idCreador: varchar("id_creador", { length: 36 }).references(() => usuarios.id, { onDelete: "set null" }), //FK id de su creador
  tokenJuego: varchar("tokenJuego", { length: 300 }), //Token actual para la api de juegos
  generos: varchar("generos", { length: 255 }), //Generos separados por comas
  tags: varchar("tags", { length: 255 }), //Tags separados por comas
  idiomas: varchar("idiomas", { length: 255 }), //Idiomas separados por comas
  avisos: varchar("avisos", {length: 255}), //Avisos antes de jugar al juego
  cantidadSeguidores: integer("cantidadSeguidores").default(0), //Cantidad de seguidores actual
  edad: integer("edad").default(0), //Edad minima para jugar el juego
  cantidadJugadores: integer("cantidadJugadores").default(0), //Cantidad de jugadores (no anonimos) que lo han jugado, tambien contaria como vistos ya que se aumenta cuando se entra en su pagina
  cantidadComentarios: integer("cantidadComentarios").default(0), //Cantidad de comentarios del juego, para rendimiento
  precio: varchar("precio", { length: 20 }).default(""), //Precio del juego (solo para usuarios premium de momento) (string porque tambien almacena la moneda)
  //TODO: logros builds savedatas extensiones paginas
});

//Foros existentes y sus datos principales
export const foros = pgTable("foros", {
  id: varchar("id", { length: 36 }).primaryKey(), //Identificador
  titulo: varchar("titulo", { length: 63 }).unique().notNull(), //Titulo del foro
  descripcion: varchar("descripcion", { length: 511 }).default(""), //Descripcion en markdown
  urlFoto: varchar("urlFoto", { length: 255 }).default("/public/coverless_forum.png"), //Url de la foto principal
  urlBanner: varchar("url_banner", { length: 255 }).default("/public/bannerless.png"), //Url de la foto principal (horizontal)
  //TODO publico o no, exclusivo, igdb
  idCreador: varchar("id_creador", { length: 36 }).references(() => usuarios.id, { onDelete: "cascade" }), //FK id de su creador
  fechaCreacion: varchar("fechaCreacion", { length: 15 }), //Fecha en la que se creo
  cantidadSeguidores: integer("cantidadSeguidores").default(0), //Cantidad de seguidores actual
  cantidadLikes: integer("cantidad_likes").default(0), //Cantidad de likes actual
  juegoAsociado: varchar("juego_asociado", { length: 36 }), //FK? juego asociado
});

//Relaciones entre las entidades, consultar mejor el diagrama uml

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