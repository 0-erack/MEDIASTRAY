import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Texto from '../Texto';
import InputBasico from '../Elements/InputBasico';
import BotonFuncion from '../Elements/BotonFuncion';
import { identificacion as validarIdentificacion, contrasegna as validarContrasegna } from '../../libraries/validacionesBackend';
import { TextoTraducido } from '../../libraries/traducir';
import useAjustes from '../../hooks/useAjustes';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import ImgCargando from '../Principal/ImgCargando';
import useMensajes from '../../hooks/useMensajes';

interface FormularioLoginProps {
  enviarPersonalizado?: (data: any) => void; 
}

function FormularioLogin({enviarPersonalizado}: FormularioLoginProps) {

  const { login, cargando } = useApiUsuarios();
  const objetoLoginBasico = { identificacion: "", contrasegna: "", verContrasegna: false }
  const [objetoLogin, setObjetoLogin] = useState({ ...objetoLoginBasico });
  const [errorFormulario, setErrorFormulario] = useState("");
  const { idiomaActual } = useAjustes();
  const navegar = useNavigate();
  const { lanzarMensaje } = useMensajes();

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
          lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "loginBien"), 1);
          navegar("/user/" + resultado.data.user.nickname);
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
