/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import useApiJuegos from '../hooks/api/useApiJuegos';
import useSesion from '../hooks/useSesion';
import { Juego } from '../types/Juego';
import { validarJuegoLocal } from '../validators/validacionesJuego';

interface JuegosProviderType {
  fallo: any;
  misJuegos: Array<Partial<Juego>>;
  actualizarBackend: (usuarioActivo: boolean) => Promise<void>;
  borrarJuegoLocal: (id: string) => boolean;
  agregarJuegoLocal: (juego: Record<string, any>) => boolean;
  editarJuegoLocal: (id: string, juego: Partial<Juego>) => boolean;
}

export const JuegosContext = createContext<JuegosProviderType | null>(null);

/**
 * Contexto para los juegos, especialmente los propios del usuario o las sesiones de juego
 * @param children
 * @returns 
 */
const JuegosProvider = ({ children }: { children: ReactNode }) => {

  //Juegos del usuario (que han sido creados por este) (en un futuro este contexto podria funcionar como biblioteca de juegos comprados)
  const [misJuegos, setMisJuegos] = useState<Array<Partial<Juego>>>([]);
  const [fallo, setFallo] = useState<any>(false);
  const { usuario, tokenSesionActual } = useSesion();
  const { verTodosMisJuegos } = useApiJuegos();

  /**
   * Descargar todos los juegos del usuario del backend desde 0
   */
  const actualizarBackend = useCallback(async (usuarioActivo: boolean) => {
    setMisJuegos([]);
    if (usuarioActivo) { //Solo se pueden tener juegos teniendo la sesion iniciada
      const resultado = await verTodosMisJuegos();
      setMisJuegos(resultado ?? []);
    }
  }, []);

  /**
   * Borrar un juego localmente
   * @param id el juego a buscar y borrar en el array del estado
   * @returns true si realmente ha pasado algo
   */
  const borrarJuegoLocal = useCallback((id: string): boolean => {
    const longitudPrevia = misJuegos.length;
    const nuevoArray = misJuegos.filter((e) => e.id !== id);
    setMisJuegos(nuevoArray);
    return longitudPrevia !== nuevoArray.length;
  }, []);

  /**
   * Agregar un juego localmente
   * @param juego el juego a agregar
   * @returns true si realmente ha pasado algo
   */
  const agregarJuegoLocal = useCallback((juego: Record<string, any>): boolean => {
    if (!validarJuegoLocal(juego)) return false;
    if (misJuegos.filter((e) => e.id === juego.id).length) return false;
    setMisJuegos([...misJuegos, juego]);
    return true;
  }, []);

  /**
   * Editar un juego localmente
   * @param id el juego a cambiar
   * @param juego datos del nuevo juego, debe de ser un juego entero valido (similar a metodo put)
   * @returns true si realmente ha pasado algo
   */
  const editarJuegoLocal = useCallback((id: string, juego: Partial<Juego>): boolean => {
    if (!validarJuegoLocal(juego)) return false;
    return borrarJuegoLocal(id) ? agregarJuegoLocal(juego) : false;
  }, []);

  const inicio = useCallback(async (elUsuario: any) => {
    console.log("act ju");
    await actualizarBackend(elUsuario ? true : false);
  }, []);
  useEffect(() => {
    inicio(usuario);
  }, [usuario, tokenSesionActual]);

  const exportaciones = useMemo(() => ({
    fallo, misJuegos, borrarJuegoLocal, actualizarBackend, agregarJuegoLocal, editarJuegoLocal
  }), [fallo, misJuegos]);

  return (
    <JuegosContext.Provider value={exportaciones}>
      {children}
    </JuegosContext.Provider>
  );
};

export default JuegosProvider;