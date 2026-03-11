declare namespace Express {
  interface Request {
    datosSesion?: Record<String, any>;
  }
}