import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Texto from '../Texto.jsx';
import InputBasico from '../Elements/InputBasico.jsx';
import BotonFuncion from '../Elements/BotonFuncion.jsx';
import { identificacion as validarIdentificacion, contrasegna as validarContrasegna } from '../../libraries/validacionesBackend.js';
import { TextoTraducido } from '../../libraries/traducir.js';
import useAjustes from '../../hooks/useAjustes.js';
import useApi from '../../hooks/useApi.js';
import ImgCargando from '../Principal/ImgCargando.jsx';
import useMensajes from '../../hooks/useMensajes.js';

function FormularioLogin(props) {

  const { login, cargando } = useApi();
  const objetoLoginBasico = { identificacion: "", contrasegna: "", verContrasegna: false }
  const [objetoLogin, setObjetoLogin] = useState({ ...objetoLoginBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const { idiomaActual } = useAjustes();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();

  const cambio = (e) => {
    if (e.target.nodeName === "INPUT") {
      if (e.target.type === "checkbox") {
        setObjetoLogin({ ...objetoLogin, [e.target.name]: e.target.checked });
      } else {
        e.preventDefault();
        setObjetoLogin({ ...objetoLogin, [e.target.name]: e.target.value });
      }
    }
  }

  const reset = () => {
    setObjetoLogin({ ...objetoLoginBasico });
  }

  const validar = () => {
    return validarIdentificacion(objetoLogin.identificacion) && validarContrasegna(objetoLogin.contrasegna);
  }

  const enviar = async (e) => {
    e.preventDefault();
    if (validar()) {
      setErrorFormulario("");
      if (typeof props.enviarPersonalizado === "function") {
        props.enviarPersonalizado(objetoLogin);
      } else {
        const resultado = await login(objetoLogin);
        if (resultado.code === 200 && !resultado.fallo) {
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "loginBien"), 1);
          navegar("/user/" + resultado.user.nickname);
          reset();
        } else {
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "loginMal"), 2);
          setErrorFormulario(TextoTraducido("errores", idiomaActual, "noLogin"));
        }
      }
    } else {
      lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "loginMal"), 2);
      setErrorFormulario(TextoTraducido("errores", idiomaActual, "noLogin"));
    }
  }

  return (
    <div>
      {cargando ? (<ImgCargando />) : (<form onChange={cambio}>
        <InputBasico nombre="identificacion" titulo={<Texto tipo="formularios" nombre="identificacion" />} valor={objetoLogin.identificacion} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionIdentificacion" />} validador={validarIdentificacion} />
        <InputBasico nombre="contrasegna" titulo={<Texto tipo="formularios" nombre="contrasegna" />} valor={objetoLogin.contrasegna} tipo={objetoLogin.verContrasegna ? "text" : "password"} placeholder="········" />
        <InputBasico nombre="verContrasegna" titulo={<Texto tipo="formularios" nombre="contrasegnaMostrar" />} estaChecked={objetoLogin.verContrasegna} tipo="checkbox" />
        <BotonFuncion titulo={<Texto tipo="botones" nombre="iniciarSesion" />} funcion={enviar} />
        <div className="caja-errores">{errorFormulario}</div>
      </form>)}
    </div>
  )
}

export default FormularioLogin;
