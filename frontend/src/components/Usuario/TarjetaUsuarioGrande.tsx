import React, { useState, useEffect } from 'react';
import { TextoTraducido } from '../../libraries/traducir.js';
import useAjustes from '../../hooks/useAjustes.js';
import BotonFuncion from '../Elements/BotonFuncion.jsx';
import useApi from '../../hooks/useApi.js';
import FormularioEditarPerfil from '../Forms/FormularioEditarPerfil.jsx';
import { timestampAFecha } from '../../libraries/extraFechas.js';
import BotonNavegacion from '../Elements/BotonNavegacion.jsx';
import useMensajes from '../../hooks/useMensajes.js';

function TarjetaUsuarioGrande(props) {

  const { idiomaActual, usuarioActual } = useAjustes();
  const esPremium = props.usuario.premium ? (props.usuario.premium > Date.now()) : false;
  const fechaCumpleagnos = timestampAFecha(props.usuario.cumpleagnos);
  const fechaCreacion = timestampAFecha(props.usuario.fechacreacion);
  const fechaPremium = timestampAFecha(props.usuario.premium);
  const [siguiendo, setSiguiendo] = useState(false);
  const [teSigue, setTeSigue] = useState(false);
  const { verSeguir, seguir } = useApi();
  const [seguidoresSimulados, setSeguidoresSimulados] = useState(props.usuario.cantidad_seguidores);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const { lanzarMensaje } = useMensajes();

  const alternarSeguir = async () => {
    if (props.soyYo || !usuarioActual.uuid) return false;
    if (siguiendo) {
      const resultado = await seguir(props.usuario.uuid, -1);
      if (resultado && !resultado.error) {
        lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "noSeguirUsuario"), 4);
        setSiguiendo(!siguiendo);
        setSeguidoresSimulados(seguidoresSimulados - 1);
      }
    } else {
      const resultado = await seguir(props.usuario.uuid, 1);
      if (resultado && !resultado.error) {
        lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "seguirUsuario"), 4);
        setSiguiendo(!siguiendo); 
        setSeguidoresSimulados(seguidoresSimulados + 1);
      }
    }
  }

  const verSiguiendo = async (deVuelta) => {
    if (props.soyYo || !usuarioActual.uuid) return false;
    if (deVuelta) {
      const siguiendo = await verSeguir(props.usuario.uuid, usuarioActual.uuid);
      return siguiendo;
    } else {
      const siguiendo = await verSeguir(usuarioActual.uuid, props.usuario.uuid);
      return siguiendo;
    }
  }

  const cargaInicial = async () => {
    if (usuarioActual.uuid && !props.soyYo) {
      setSiguiendo(await verSiguiendo());
      setTeSigue(await verSiguiendo(true));
    }
  }
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div className="tarjeta-usuario-grande">
      {JSON.stringify(props.usuario)}
        <h2>{props.usuario.nombre}</h2>
        <img src={props.usuario.url_foto ?? "#"} alt={TextoTraducido("errores", idiomaActual, "nopfp")} />
        <p>{"("}{props.usuario.nickname}{")"}</p>
        {props.soyYo && (<p>{props.usuario.correo}</p>)}
        <p>{props.usuario.descripcion.length ? props.usuario.descripcion : TextoTraducido("errores", idiomaActual, "noDescripcion")}</p>
        {props.soyYo && (<p>{TextoTraducido("formularios", idiomaActual, "cumpleagnos")} {fechaCumpleagnos}</p>)}
        <p>{TextoTraducido("formularios", idiomaActual, "fechaCreacion")} {fechaCreacion}</p>
        <p>{TextoTraducido("formularios", idiomaActual, "premium")} {esPremium ? TextoTraducido("palabras", idiomaActual, "si") : TextoTraducido("palabras", idiomaActual, "no")}</p>
        {esPremium && (<p>{TextoTraducido("formularios", idiomaActual, "premiumCaducidad")} {fechaPremium}</p>)}
        <p>{TextoTraducido("formularios", idiomaActual, "seguidores")} {seguidoresSimulados} {(!props.soyYo && usuarioActual.uuid) && (<span>
          <BotonFuncion funcion={alternarSeguir} titulo={TextoTraducido("botones", idiomaActual, siguiendo ? "noSeguir" : "seguir")} />
          <span>{props.usuario.nombre} {TextoTraducido("formularios", idiomaActual, teSigue ? "teSigue" : "noTeSigue")}</span>
        </span>)}</p>
        {(props.soyYo) ? (<div>
          {!editandoPerfil && (<BotonFuncion funcion={() => {setEditandoPerfil(true)}} titulo={TextoTraducido("botones", idiomaActual, "editarPerfil")} />)}
          <br />
          <BotonNavegacion direccion="/logout" titulo={TextoTraducido("botones", idiomaActual, "logout")} />
        </div>) : (<p>REPORTAR USUARIO</p>)}
        {editandoPerfil && props.soyYo && (<FormularioEditarPerfil usuario={props.usuario} />)}
    </div>
  )
}

export default TarjetaUsuarioGrande;
