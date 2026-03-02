import { pgTable, varchar, integer, boolean, text, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- TABLA USUARIOS ---
export const usuarios = pgTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey(), // Identificador UUID o similar
  nickname: varchar("nickname", { length: 15 }).unique().notNull(),
  nombre: varchar("nombre", { length: 100 }).unique().notNull(),
  contrasegna: varchar("contrasegna", { length: 127 }).notNull(),
  correo: varchar("correo", { length: 255 }).unique().notNull(),
  descripcion: varchar("descripcion", { length: 511 }).default(""),
  urlFoto: varchar("url_foto", { length: 255 }).default("/public/nopfp.png"),
  cumpleagnos: varchar("cumpleagnos", { length: 15 }), // Almacenado como string/timestamp según tu lógica
  fechacreacion: varchar("fechacreacion", { length: 15 }),
  strikes: integer("strikes").default(0),
  disponibilidad: integer("disponibilidad").default(0),
  premium: varchar("premium", { length: 15 }).default(""),
  cantidadSeguidores: integer("cantidad_seguidores").default(0),
  nivelPublico: integer("nivel_publico").default(0),
  nivelAcceso: integer("nivel_acceso").default(0),
});

// --- TABLA JUEGOS ---
export const juegos = pgTable("juegos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: varchar("titulo", { length: 63 }).unique().notNull(),
  urlPortada1: varchar("url_portada1", { length: 255 }).default("/public/coverless1.png"),
  urlPortada2: varchar("url_portada2", { length: 255 }).default("/public/coverless2.png"),
  urlPortada3: varchar("url_portada3", { length: 255 }).default("/public/coverless3.png"),
  publico: boolean("publico").default(true),
  versionactual: varchar("versionactual", { length: 15 }).default("1.0.0"),
  fechaCreacion: varchar("fecha_creacion", { length: 15 }),
  fechaUltima: varchar("fecha_ultima", { length: 15 }),
  descripcion: varchar("descripcion", { length: 1023 }).default(""),
  idCreador: varchar("id_creador", { length: 36 })
    .notNull()
    .references(() => usuarios.id),
  tokenAdministracion: varchar("token_administracion", { length: 32 }),
  generos: varchar("generos", { length: 255 }), // Separados por coma
  idiomas: varchar("idiomas", { length: 255 }), // Separados por coma
  cantidadSeguidores: integer("cantidad_seguidores").default(0),
  cantidadLikes: integer("cantidad_likes").default(0),
});

// --- TABLA FOROS ---
export const foros = pgTable("foros", {
  id: varchar("id", { length: 36 }).primaryKey(),
  titulo: varchar("titulo", { length: 63 }).unique().notNull(),
  descripcion: varchar("descripcion", { length: 511 }).default(""),
  urlFoto: varchar("url_foto", { length: 255 }).default("/public/coverless_forum.png"),
  urlBanner: varchar("url_banner", { length: 255 }).default("/public/bannerless.png"),
  publico: boolean("publico").default(true),
  idCreador: varchar("id_creador", { length: 36 }).references(() => usuarios.id),
  fechaCreacion: varchar("fecha_creacion", { length: 15 }),
  cantidadSeguidores: integer("cantidad_seguidores").default(0),
  cantidadLikes: integer("cantidad_likes").default(0),
  juegoAsociado: varchar("juego_asociado", { length: 36 }),
});

// --- RELACIONES (Opcional, pero recomendado para usar db.query) ---
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