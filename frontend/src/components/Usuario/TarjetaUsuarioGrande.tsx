import { useState, useEffect } from 'react';
import { TextoTraducido } from '../../libraries/traducir';
import useAjustes from '../../hooks/useAjustes';
import BotonFuncion from '../Elements/BotonFuncion';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import FormularioEditarPerfil from '../Forms/FormularioEditarPerfil';
import { timestampAFecha } from '../../libraries/extraFechas';
import BotonNavegacion from '../Elements/BotonNavegacion';
import useMensajes from '../../hooks/useMensajes';
import useSesion from '../../hooks/useSesion';

interface TarjetaUsuarioGrandeProps {
  usuario: Record<string, any>;
  soyYo: boolean|null
}

function TarjetaUsuarioGrande({ usuario, soyYo }: TarjetaUsuarioGrandeProps) {

  const { idiomaActual } = useAjustes();
  const { usuario: usuarioActual } = useSesion();
  const esPremium = usuario.premium ? (usuario.premium > Date.now()) : false;
  const fechaCumpleagnos = timestampAFecha(usuario.cumpleagnos);
  const fechaCreacion = timestampAFecha(usuario.fechaCreacion);
  const fechaPremium = timestampAFecha(usuario.premium);
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
        lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "noSeguirUsuario"), 4);
        setSiguiendo(!siguiendo);
        setSeguidoresSimulados(seguidoresSimulados - 1);
      }
    } else {
      const resultado = await seguir(usuario.id, 1);
      if (resultado && !resultado.error) {
        lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "seguirUsuario"), 4);
        setSiguiendo(!siguiendo); 
        setSeguidoresSimulados(seguidoresSimulados + 1);
      }
    }
  }

  const verSiguiendo = async (deVuelta?:boolean):Promise<boolean> => {
    if (soyYo || !usuarioActual) return false;
    if (deVuelta) {
      const siguiendo = await verSeguir(usuario.id, usuarioActual!.id ?? '');
      return siguiendo;
    } else {
      const siguiendo = await verSeguir(usuarioActual!.id ?? '', usuario.id);
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
      {JSON.stringify(usuario)}
        <h2>{usuario.nombre}</h2>
        <img src={usuario.urlFoto ?? "#"} alt={TextoTraducido("errores", idiomaActual, "nopfp")} />
        <p>{"("}{usuario.nickname}{")"}</p>
        {soyYo && (<p>{usuario.correo}</p>)}
        <p>{usuario.descripcion?.length ? usuario.descripcion : TextoTraducido("errores", idiomaActual, "noDescripcion")}</p>
        {soyYo && (<p>{TextoTraducido("formularios", idiomaActual, "cumpleagnos")} {fechaCumpleagnos}</p>)}
        <p>{TextoTraducido("formularios", idiomaActual, "fechaCreacion")} {fechaCreacion}</p>
        <p>{TextoTraducido("formularios", idiomaActual, "premium")} {esPremium ? TextoTraducido("palabras", idiomaActual, "si") : TextoTraducido("palabras", idiomaActual, "no")}</p>
        {esPremium && (<p>{TextoTraducido("formularios", idiomaActual, "premiumCaducidad")} {fechaPremium}</p>)}
        <p>{TextoTraducido("formularios", idiomaActual, "seguidores")} {seguidoresSimulados} {(!soyYo && usuarioActual) && (<span>
          <BotonFuncion funcion={alternarSeguir} titulo={TextoTraducido("botones", idiomaActual, siguiendo ? "noSeguir" : "seguir")} />
          <span>{usuario.nombre} {TextoTraducido("formularios", idiomaActual, teSigue ? "teSigue" : "noTeSigue")}</span>
        </span>)}</p>
        {(soyYo) ? (<div>
          {!editandoPerfil && (<BotonFuncion funcion={() => {setEditandoPerfil(true)}} titulo={TextoTraducido("botones", idiomaActual, "editarPerfil")} />)}
          <br />
          <BotonNavegacion direccion="/logout" titulo={TextoTraducido("botones", idiomaActual, "logout")} />
        </div>) : (<p>REPORTAR USUARIO</p>)}
        {editandoPerfil && soyYo && (<FormularioEditarPerfil usuario={usuario} />)}
    </div>
  )
}

export default TarjetaUsuarioGrande;
