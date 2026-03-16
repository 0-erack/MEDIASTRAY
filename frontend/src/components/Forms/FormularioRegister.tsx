import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Texto from '../Texto';
import InputBasico from '../Elements/InputBasico';
import BotonFuncion from '../Elements/BotonFuncion';
import { correo as validarCorreo, contrasegna as validarContrasegna, nickname as validarNickname, nombre as validarNombre, cumpleagnos as validarCumpleagnos } from '../../libraries/validacionesBackend';
import { TextoTraducido } from '../../libraries/traducir';
import { nicknameFalso, nombreFalso, correoFalso } from '../../libraries/datosFalsos';
import useAjustes from '../../hooks/useAjustes';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import ImgCargando from '../Principal/ImgCargando';
import useMensajes from '../../hooks/useMensajes';
import { inputDateATimestamp } from '../../libraries/extraFechas';

interface FormularioRegisterProps {
  enviarPersonalizado?: (data: any) => void; 
}

function FormularioRegister({enviarPersonalizado}: FormularioRegisterProps) {

  const { register, cargando, error, resetEstados } = useApiUsuarios();
  const objetoRegisterBasico = { correo: "", nickname: "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: "", cumpleagnos: "" }
  const [objetoRegister, setObjetoRegister] = useState({ ...objetoRegisterBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const { idiomaActual } = useAjustes();
  const navegar = useNavigate();
  const nombreFalsoPlaceholder = useMemo(() => nombreFalso(), []);
  const nicknameFalsoPlaceholder = useMemo(() => nicknameFalso(), []);
  const correoFalsoPlaceholder = useMemo(() => correoFalso(), []);
  const { lanzarMensaje } = useMensajes();

  const cambio = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.nodeName === "INPUT") {
      if (target.type === "checkbox") {
        setObjetoRegister({ ...objetoRegister, [target.name]: target.checked });
      } else {
        e.preventDefault();
        setObjetoRegister({ ...objetoRegister, [target.name]: target.value });
      }
    }
  }

  const reset = () => {
    setObjetoRegister(objetoRegisterBasico);
    resetEstados();
  }

  const validarFechaInput = (e:string) => validarCumpleagnos(inputDateATimestamp(e));

  const validar = ():boolean => {
    return validarContrasegna(objetoRegister.contrasegna)
      && objetoRegister.contrasegna2 === objetoRegister.contrasegna
      && validarNombre(objetoRegister.nombre)
      && validarCorreo(objetoRegister.correo)
      && validarNickname(objetoRegister.nickname)
      && validarFechaInput(objetoRegister.cumpleagnos);
  }

  const enviar = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (validar()) {
      setErrorFormulario("");
      if (typeof enviarPersonalizado === "function") {
        enviarPersonalizado(objetoRegister);
      } else {
        const resultado = await register(objetoRegister);
        if (!error && !resultado.error) {
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "registrarBien"), 1);
          navegar("/user/" + resultado.data.user.nickname);
          reset();
        } else {
          if (resultado?.error?.result?.data?.doubleNickname) {
            setErrorFormulario(TextoTraducido("errores", idiomaActual, "nicknameRepetido"));
          } else if (resultado?.error?.result?.data?.doubleEmail) {
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
        <InputBasico nombre="cumpleagnos" titulo={<Texto tipo="formularios" nombre="cumpleagnos" />} valor={objetoRegister.cumpleagnos} tipo="date" mensajeError={<Texto tipo="errores" nombre="validacionCumpleagnos" />} validador={validarFechaInput} />
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
