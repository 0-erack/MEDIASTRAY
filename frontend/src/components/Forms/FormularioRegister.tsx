import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Texto from '../Texto.jsx';
import InputBasico from '../Elements/InputBasico.jsx';
import BotonFuncion from '../Elements/BotonFuncion.jsx';
import { correo as validarCorreo, contrasegna as validarContrasegna, nickname as validarNickname, nombre as validarNombre, cumpleagnos as validarCumpleagnos } from '../../libraries/validacionesBackend.js';
import { TextoTraducido } from '../../libraries/traducir.js';
import { nicknameFalso, nombreFalso, correoFalso } from '../../libraries/datosFalsos.js';
import useAjustes from '../../hooks/useAjustes.js';
import useApi from '../../hooks/useApi.js';
import ImgCargando from '../Principal/ImgCargando.jsx';
import useMensajes from '../../hooks/useMensajes.js';

function FormularioRegister(props) {

  const { register, cargando, error, resetEstados } = useApi();
  const objetoRegisterBasico = { correo: "", nickname: "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: "", cumpleagnos: "" }
  const [objetoRegister, setObjetoRegister] = useState({ ...objetoRegisterBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const { idiomaActual } = useAjustes();
  const navegar = useNavigate();
  const nombreFalsoPlaceholder = useMemo(() => nombreFalso(), []);
  const nicknameFalsoPlaceholder = useMemo(() => nicknameFalso(), []);
  const correoFalsoPlaceholder = useMemo(() => correoFalso(), []);
  const { lanzarMensaje } = useMensajes();

  const cambio = (e) => {
    if (e.target.nodeName === "INPUT") {
      if (e.target.type === "checkbox") {
        setObjetoRegister({ ...objetoRegister, [e.target.name]: e.target.checked });
      } else {
        e.preventDefault();
        setObjetoRegister({ ...objetoRegister, [e.target.name]: e.target.value });
      }
    }
  }

  const reset = () => {
    setObjetoRegister(objetoRegisterBasico);
    resetEstados();
  }

  const validar = () => {
    return validarContrasegna(objetoRegister.contrasegna)
      && objetoRegister.contrasegna2 === objetoRegister.contrasegna
      && validarNombre(objetoRegister.nombre)
      && validarCorreo(objetoRegister.correo)
      && validarNickname(objetoRegister.nickname)
      && validarCumpleagnos(objetoRegister.cumpleagnos);
  }

  const enviar = async (e) => {
    e.preventDefault();
    if (validar()) {
      setErrorFormulario("");
      if (typeof props.enviarPersonalizado === "function") {
        props.enviarPersonalizado(objetoRegister);
      } else {
        const resultado = await register(objetoRegister);
        if (!error && !resultado.error) {
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "registrarMal"), 1);
          navegar("/user/" + resultado.user.nickname);
          reset();
        } else {
          if (resultado?.error?.result?.data.doubleNickname) {
            setErrorFormulario(TextoTraducido("errores", idiomaActual, "nicknameRepetido"));
          } else if (resultado?.error?.result?.data.doubleEmail) {
            setErrorFormulario(TextoTraducido("errores", idiomaActual, "correoRepetido"));
          } else {
            setErrorFormulario(TextoTraducido("errores", idiomaActual, "noRegister"));
          }
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "registrarMal"), 2);
        }
        resetEstados();
      }
    } else {
      lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "registrarMal"), 2);
      setErrorFormulario(TextoTraducido("errores", idiomaActual, "noRegister"));
    }
    if (objetoRegister.contrasegna2 !== objetoRegister.contrasegna) setErrorFormulario(TextoTraducido("errores", idiomaActual, "dobleContrasegna"));
  }

  return (
    <div>
      <form onChange={cambio}>
        <InputBasico nombre="nickname" placeholder={nicknameFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nickname" />} valor={objetoRegister.nickname} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNickname" />} validador={validarNickname} />
        <InputBasico nombre="correo" placeholder={correoFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="correo" />} valor={objetoRegister.correo} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionEmail" />} validador={validarCorreo} />
        <InputBasico nombre="nombre" placeholder={nombreFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nombre" />} valor={objetoRegister.nombre} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNombre" />} validador={validarNombre} />
        <InputBasico nombre="cumpleagnos" titulo={<Texto tipo="formularios" nombre="cumpleagnos" />} valor={objetoRegister.cumpleagnos} tipo="date" mensajeError={<Texto tipo="errores" nombre="validacionCumpleagnos" />} validador={validarCumpleagnos} />
        <InputBasico nombre="contrasegna" titulo={<Texto tipo="formularios" nombre="contrasegna" />} valor={objetoRegister.contrasegna} tipo={objetoRegister.verContrasegna ? "text" : "password"} placeholder="········" mensajeError={<Texto tipo="errores" nombre="validacionContrasegna" />} validador={validarContrasegna} />
        <InputBasico nombre="contrasegna2" titulo={<Texto tipo="formularios" nombre="contrasegna2" />} valor={objetoRegister.contrasegna2} tipo={objetoRegister.verContrasegna ? "text" : "password"} placeholder="········" />
        <InputBasico nombre="verContrasegna" titulo={<Texto tipo="formularios" nombre="contrasegnaMostrar" />} estaChecked={objetoRegister.verContrasegna} tipo="checkbox" />
        <BotonFuncion titulo={<Texto tipo="botones" nombre="crearCuenta" />} funcion={enviar} />
        <BotonFuncion titulo={<Texto tipo="botones" nombre="reset" />} funcion={reset} />
        <div className="caja-errores">{errorFormulario}</div>
        {cargando && (<ImgCargando />)}
      </form>
    </div>
  )
}

export default FormularioRegister;
