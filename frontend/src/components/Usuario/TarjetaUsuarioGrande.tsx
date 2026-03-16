import { useEffect, useState } from 'react';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useMensajes from '../../hooks/useMensajes';
import useSesion from '../../hooks/useSesion';
import { timestampAFecha } from '../../libraries/extraFechas';
import BotonFuncion from '../Elements/BotonFuncion';
import BotonNavegacion from '../Elements/BotonNavegacion';
import FormularioEditarPerfil from '../Forms/FormularioEditarPerfil';

interface TarjetaUsuarioGrandeProps {
  usuario: Record<string, any>;
  soyYo: boolean|null;
  esPremium: boolean;
}

function TarjetaUsuarioGrande({ usuario, soyYo, esPremium }: TarjetaUsuarioGrandeProps) {

  const { usuario: usuarioActual } = useSesion();
  const fechaCumpleagnos = timestampAFecha(usuario.cumpleagnos);
  const fechaCreacion = timestampAFecha(usuario.fechaCreacion);
  const [siguiendo, setSiguiendo] = useState(false);
  const [teSigue, setTeSigue] = useState(false);
  const { verSeguir, seguir } = useApiUsuarios();
  const [seguidoresSimulados, setSeguidoresSimulados] = useState(usuario.cantidadSeguidores);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const { lanzarMensaje } = useMensajes();

  const alternarSeguir = async () => {
    if (soyYo || !usuarioActual) return false;
    if (siguiendo) {
      const resultado = await seguir(usuario.id, -1);
      if (resultado && !resultado.error) {
        lanzarMensaje(useIdioma("mensajes", "noSeguirUsuario"), 4);
        setSiguiendo(!siguiendo);
        setSeguidoresSimulados(seguidoresSimulados - 1);
      }
    } else {
      const resultado = await seguir(usuario.id, 1);
      if (resultado && !resultado.error) {
        lanzarMensaje(useIdioma("mensajes", "seguirUsuario"), 4);
        setSiguiendo(!siguiendo); 
        setSeguidoresSimulados(seguidoresSimulados + 1);
      }
    }
  }

  const verSiguiendo = async (deVuelta?:boolean):Promise<boolean> => {
    if (soyYo || !usuarioActual) return false;
    if (deVuelta) {
      const siguiendo = await verSeguir(usuario.id, (typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '');
      return siguiendo;
    } else {
      const siguiendo = await verSeguir((typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '', usuario.id);
      return siguiendo;
    }
  }

  const cargaInicial = async () => {
    if (usuarioActual && !soyYo) {
      setSiguiendo(await verSiguiendo());
      setTeSigue(await verSiguiendo(true));
    }
  }
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div className="tarjeta-usuario-grande">
        <h2>{usuario.nombre}</h2>
        <img src={usuario.urlFoto ?? "#"} alt={useIdioma("errores", "nopfp")} />
        <p>{"("}{usuario.nickname}{")"}</p>
        {soyYo && (<p>{usuario.correo}</p>)}
        <p>{usuario.descripcion?.length ? usuario.descripcion : useIdioma("errores", "noDescripcion")}</p>
        {soyYo && (<p>{useIdioma("formularios", "cumpleagnos")} {fechaCumpleagnos}</p>)}
        <p>{useIdioma("formularios", "fechaCreacion")} {fechaCreacion}</p>
        <p>{useIdioma("formularios", "premium")} {esPremium ? useIdioma("palabras", "si") : useIdioma("palabras", "no")}</p>
        <p>{useIdioma("formularios", "seguidores")} {seguidoresSimulados} {(!soyYo && usuarioActual) && (<span>
          <BotonFuncion funcion={alternarSeguir} titulo={useIdioma("botones", siguiendo ? "noSeguir" : "seguir")} />
          <span>{usuario.nombre} {useIdioma("formularios", teSigue ? "teSigue" : "noTeSigue")}</span>
        </span>)}</p>
        {(soyYo) ? (<div>
          {!editandoPerfil && (<BotonFuncion funcion={() => {setEditandoPerfil(true)}} titulo={useIdioma("botones", "editarPerfil")} />)}
          <br />
          <BotonNavegacion direccion="/logout" titulo={useIdioma("botones", "logout")} />
        </div>) : (<p>REPORTAR USUARIO</p>) /*//TODO: */}
        {editandoPerfil && soyYo && (<FormularioEditarPerfil usuario={usuario} />)}
    </div>
  )
}

export default TarjetaUsuarioGrande;
