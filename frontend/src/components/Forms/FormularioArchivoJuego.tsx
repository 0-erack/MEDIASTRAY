import { useState } from "react";
import { useForm } from "react-hook-form";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useIdioma from "../../hooks/useIdioma";
import useMensajes from "../../hooks/useMensajes";
import useSesion from "../../hooks/useSesion";
import { nombreArchivo } from "../../libraries/validacionesBackend";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";
import TarjetaArchivo from "../Juego/TarjetaArchivo";
import Icono from "../Principal/Icono";
import ImgCargando from "../Principal/ImgCargando";

interface FormValues {
  nombre: string;
  archivo: any;
}

interface FormularioArchivoJuegoProps {
  previos: Array<Record<string, any>>;
  actualizar: (e: any) => void;
  idJuego: string;
}

/**
 * Formulario para subir archivos de juego
 */
function FormularioArchivoJuego({ actualizar, previos, idJuego }: FormularioArchivoJuegoProps) {

  const formBase = { nombre: '', archivo: null }
  const traduccion = useIdioma();
  const { premium } = useSesion();
  const tamagnoMaximo = 1073741824 * (premium ? 4 : 2);
  const { register, watch, formState: { errors }, reset } = useForm<FormValues>({ defaultValues: formBase, mode: 'onChange' });
  const datos = watch();
  const selectedFile = datos.archivo?.[0];
  const { eliminarArchivo, cargando, subirArchivo } = useApiJuegos();
  const { lanzarMensaje } = useMensajes();
  const [error, setError] = useState("");

  /**
   * Borrar un archivo en concreto
   * @param nombre que archivo borrar de este juego
   */
  const borrarArchivo = async (nombre: string) => {
    const resultado = await eliminarArchivo(idJuego, nombre);
    setError("");
    if (resultado) {
      actualizar(previos.filter((e) => {return e.name !== nombre}));
      lanzarMensaje(traduccion("mensajes", "exitoBorrarArchivo"), 3);
    } else {
      lanzarMensaje(traduccion("mensajes", "errorArchivo"), 2);
      setError(traduccion("mensajes", "errorArchivo"));
    }
  }

  /**
   * Handler para publicar el archivo zip
   */
  const publicarArchivo = async () => {
    setError("");
    if (nombreArchivo(datos.nombre) && selectedFile && previos.length < ((premium ? 2 : 8))) {
      const resultado = await subirArchivo(idJuego, datos.nombre, selectedFile);
      if (resultado) {
        actualizar([...previos, {date: Date.now() + "", name: datos.nombre, size: selectedFile.size, game: idJuego}]);
        reset();
      } else {
        lanzarMensaje(traduccion("mensajes", "errorArchivo"), 2);
        setError(traduccion("errores", "errorArchivo"));
      }
    } else {
      lanzarMensaje(traduccion("mensajes", "errorArchivo"), 2);
      setError(traduccion("errores", "errorArchivo"));
    }
  }

  return (
    <div className="p-4">
      {cargando && <ImgCargando />}
      <p>{traduccion("parrafos", "infoArchivos1")}</p>
      <p>{traduccion("parrafos", "infoArchivos2")}</p>
      <p>{traduccion("parrafos", "infoArchivos3")}</p>
      {error && <CajaError>{error}</CajaError>}
      {previos.map((e, i) => {
        return (<TarjetaArchivo key={i} archivo={e} funcionEliminar={borrarArchivo} />)
      })}
      <hr />
      {previos.length < ((premium ? 2 : 8)) && (<form>
      <Titulo magnitud={4}>{datos.nombre === "web" ? "WEB: " : ''}{traduccion("formularios", "nuevoArchivo")}</Titulo>
        <InputBasico placeholder={"portable"} titulo={traduccion("formularios", "nombreArchivo")} nombre="nombre" ancho='full' tipo="text" validador={(v) => !v || nombreArchivo(v)} objetoHook={register("nombre", { validate: (v) => !v || nombreArchivo(v) || traduccion("errores", "errorNombreArchivo") })} mensajeError={errors?.nombre?.message ?? ''} />
        {errors.nombre && <CajaError>{errors.nombre.message}</CajaError>}

        <div className="flex flex-col gap-2">
          <label htmlFor="juegoZip" className="font-bold">
            {traduccion("formularios", "archivo")}
          </label>
          <input
            id="juegoZip"
            type="file"
            accept=".zip"
            {...register("archivo", {
              required: traduccion("errores", "errorArchivo"),
              validate: {
                isZip: (files) => {
                  if (!files[0]) return true;
                  const name = files[0].name.toLowerCase();
                  const isValidType = files[0].type === "application/x-zip-compressed" || 
                                    files[0].type === "application/zip" || 
                                    name.endsWith(".zip");
                  
                  if (!isValidType) return traduccion("errores", "soloZip");
                  return nombreArchivo(files[0].name) || traduccion("errores", "errorNombreArchivo");
                },
                lessThanMax: (files) => {
                  if (!files[0]) return true;
                  return files[0].size <= tamagnoMaximo || traduccion("errores", "archivoMuyGrande");
                }
              },
            })}
            className="border p-2 underline cursor-pointer"
          />
          
          {selectedFile && (
            <div className="text-xs text-gray-500">
              <strong>{selectedFile.name}</strong> 
              ({ (selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {errors.archivo && (
            <CajaError>{errors.archivo.message as string}</CajaError>
          )}
        </div>
          <BotonFuncion funcion={publicarArchivo} titulo={traduccion("botones", "publicar")} hueco={false} tipo={1} ><Icono numero={3} color="var(--color-fondo1)" /></BotonFuncion>
      </form>)}
    </div>
  );
}

export default FormularioArchivoJuego;
