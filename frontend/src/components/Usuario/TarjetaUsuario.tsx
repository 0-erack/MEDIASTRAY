import { memo } from "react";
import useIdioma from "../../hooks/useIdioma";
import { Usuario } from "../../types/Usuario";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface TarjetaUsuarioProps {
    usuario: Partial<Usuario>;
}

/**
 * Componente para mostrar la miniatura de un usuario
 * @param usuario datos a mostrar (no hacen falta todos)
 */
const TarjetaUsuario = memo(function TarjetaUsuario({usuario}: TarjetaUsuarioProps) {
  
    const traduccion = useIdioma();

  return (
    <div className="border border-principal m-2 mt-4 h-15 flex bg-fondo-especial-1">
        <span>
            <img src={usuario.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className='h-auto w-14 max-w-50 aspect-square object-cover'/>
        </span>
        <span className="p-1 ml-2 text-left">
            <div>
                <EnlaceFuncion titulo={usuario.nickname} funcion={"/user/" + usuario.nickname} />
                <span>{" ("}{usuario.cantidadSeguidores}{")"}</span>
            </div>
            <div>
                <span>{usuario.nombre}</span>
            </div>
        </span>
    </div>
  );
})

export default TarjetaUsuario;
