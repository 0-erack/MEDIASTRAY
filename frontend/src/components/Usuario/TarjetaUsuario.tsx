import { memo } from "react";
import useIdioma from "../../hooks/useIdioma";
import { Usuario } from "../../types/Usuario";
import EnlaceFuncion from "../Elements/EnlaceFuncion";

interface TarjetaUsuarioProps {
    usuario: Partial<Usuario>;
    destacado: true|false|undefined;
}

/**
 * Componente para mostrar la miniatura de un usuario
 * @param usuario datos a mostrar (no hacen falta todos)
 * @param destacado si aparece con un color destacado
 */
const TarjetaUsuario = memo(function TarjetaUsuario({usuario, destacado = false}: TarjetaUsuarioProps) {
  
    const traduccion = useIdioma();

  return (
    <div className={`border ${destacado ? 'border-info1' : 'border-principal'} m-2 pr-1 mt-4 h-15 flex bg-fondo-especial-1`}>
        <span>
            <img src={usuario.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className='h-auto w-14 max-w-50 aspect-square object-cover'/>
        </span>
        <span className="p-1 ml-2 text-left">
            <div>
                <EnlaceFuncion titulo={usuario.nickname} funcion={"/user/" + usuario.nickname} color={destacado ? 2 : 1} />
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
