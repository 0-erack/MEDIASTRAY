import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useMensajes from '../../hooks/useMensajes';
import { correoFalso, nicknameFalso, nombreFalso } from '../../libraries/datosFalsos';
import { inputDateATimestamp } from '../../libraries/extraFechas';
import { contrasegna as validarContrasegna, correo as validarCorreo, cumpleagnos as validarCumpleagnos, nickname as validarNickname, nombre as validarNombre } from '../../libraries/validacionesBackend';
import BotonFuncion from '../Elements/BotonFuncion';
import InputBasico from '../Elements/InputBasico';
import ImgCargando from '../Principal/ImgCargando';
import Texto from '../Texto';

interface FormularioRegisterProps {
  enviarPersonalizado?: (data: any) => void; 
}

function FormularioRegister({enviarPersonalizado}: FormularioRegisterProps) {

  const { register, cargando, error, resetEstados } = useApiUsuarios();
  const objetoRegisterBasico = { correo: "", nickname: "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: "", cumpleagnos: "" }
  const [objetoRegister, setObjetoRegister] = useState({ ...objetoRegisterBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const navegar = useNavigate();
  const nombreFalsoPlaceholder = useMemo(() => nombreFalso(), []);
  const nicknameFalsoPlaceholder = useMemo(() => nicknameFalso(), []);
  const correoFalsoPlaceholder = useMemo(() => correoFalso(), []);
  const { lanzarMensaje } = useMensajes();
  const traduccion = useIdioma();

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
          lanzarMensaje(traduccion("mensajes", "registrarBien"), 1);
          navegar("/user/" + resultado.data.user.nickname);
          reset();
        } else {
          if (resultado?.error?.result?.data?.doubleNickname) {
            setErrorFormulario(traduccion("errores", "nicknameRepetido"));
          } else if (resultado?.error?.result?.data?.doubleEmail) {
            setErrorFormulario(traduccion("errores", "correoRepetido"));
          } else {
            setErrorFormulario(traduccion("errores", "noRegister"));
          }
          lanzarMensaje(traduccion("mensajes", "registrarMal"), 2);
        }
        resetEstados();
      }
    } else {
      lanzarMensaje(traduccion("mensajes", "registrarMal"), 2);
      setErrorFormulario(traduccion("errores", "noRegister"));
    }
    if (objetoRegister.contrasegna2 !== objetoRegister.contrasegna) setErrorFormulario(traduccion("errores", "dobleContrasegna"));
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
