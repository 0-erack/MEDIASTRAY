import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useMensajes from '../../hooks/useMensajes';
import { contrasegna as validarContrasegna, identificacion as validarIdentificacion } from '../../libraries/validacionesBackend';
import BotonFuncion from '../Elements/BotonFuncion';
import CajaError from '../Elements/CajaError';
import EnlaceFuncion from '../Elements/EnlaceFuncion';
import InputBasico from '../Elements/InputBasico';
import Icono from '../Principal/Icono';
import ImgCargando from '../Principal/ImgCargando';
import Texto from '../Texto';

interface FormularioLoginProps {
  enviarPersonalizado?: (data: any) => void; 
}

/**
 * Formulario para hacer login
 * @param enviarPersonalizado funcion alternativa en lugar de llamar a la api
 */
function FormularioLogin({enviarPersonalizado}: FormularioLoginProps) {

  const { login, cargando } = useApiUsuarios();
  const objetoLoginBasico = { identificacion: "", contrasegna: "", verContrasegna: false }
  const [objetoLogin, setObjetoLogin] = useState({ ...objetoLoginBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();
  const traduccion = useIdioma();

  const cambio = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    if (target.nodeName === "INPUT") {
      if (target.type === "checkbox") {
        setObjetoLogin({ ...objetoLogin, [target.name]: target.checked });
      } else {
        e.preventDefault();
        setObjetoLogin({ ...objetoLogin, [target.name]: target.value });
      }
    }
  }

  const reset = () => {
    setObjetoLogin({ ...objetoLoginBasico });
  }

  const validar = () => {
    return validarIdentificacion(objetoLogin.identificacion) && validarContrasegna(objetoLogin.contrasegna);
  }

  const enviar = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (validar()) {
      setErrorFormulario("");
      if (typeof enviarPersonalizado === "function") {
        enviarPersonalizado(objetoLogin);
      } else {
        const resultado = await login(objetoLogin);
        if (resultado.code === 200 && !resultado.fallo) {
          lanzarMensaje(traduccion("mensajes", "loginBien"), 1);
          navegar("/user/" + resultado.data.user.nickname);
          reset();
        } else {
          lanzarMensaje(traduccion("mensajes", "loginMal"), 2);
          setErrorFormulario(traduccion("errores", "noLogin"));
        }
      }
    } else {
      lanzarMensaje(traduccion("mensajes", "loginMal"), 2);
      setErrorFormulario(traduccion("errores", "noLogin"));
    }
  }

  return (
    <div>
      {cargando ? (<ImgCargando />) : (<form onChange={cambio}>
        <InputBasico iconoA={1} nombre="identificacion" titulo={<Texto tipo="formularios" nombre="identificacion" />} valor={objetoLogin.identificacion} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionIdentificacion" />} validador={validarIdentificacion} />
        <InputBasico iconoA={2} nombre="contrasegna" titulo={<Texto tipo="formularios" nombre="contrasegna" />} valor={objetoLogin.contrasegna} tipo={objetoLogin.verContrasegna ? "text" : "password"} placeholder="········" />
        <InputBasico iconoA={13} nombre="verContrasegna" titulo={<Texto tipo="formularios" nombre="contrasegnaMostrar" />} estaChecked={objetoLogin.verContrasegna} tipo="checkbox" />
        <BotonFuncion titulo={<Texto tipo="botones" nombre="iniciarSesion" />} funcion={enviar} hueco={false} ><Icono numero={15} color='var(--color-fondo1)' /></BotonFuncion>
        <CajaError texto={errorFormulario ?? ''} nivel="input" />
        <EnlaceFuncion titulo={traduccion("formularios", "preguntaRegister")} funcion="/register" />
      </form>)}

    </div>
  )
}

export default FormularioLogin;
