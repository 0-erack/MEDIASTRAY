import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useMensajes from '../../hooks/useMensajes';
import { correoFalso, nicknameFalso, nombreFalso } from '../../libraries/datosFalsos';
import { inputDateATimestamp, timestampAInputDate } from '../../libraries/extraFechas';
import { contrasegna as validarContrasegna, correo as validarCorreo, cumpleagnos as validarCumpleagnos, descripcionUsuario as validarDescripcion, nickname as validarNickname, nombre as validarNombre, url as validarUrl } from '../../libraries/validacionesBackend';
import BotonFuncion from '../Elements/BotonFuncion';
import CajaError from '../Elements/CajaError';
import InputBasico from '../Elements/InputBasico';
import Titulo from '../Elements/Titulo';
import Icono from '../Principal/Icono';
import ImgCargando from '../Principal/ImgCargando';
import Texto from '../Texto';

/**
 * Formulario para editar el perfil de un usuario
 * @param usuario datos del usuario originales
 */
function FormularioEditarPerfil({usuario}: {usuario: any}) {

    const previo = usuario;
    const { editarUsuario, borrarUsuario, cargando, error, resetEstados } = useApiUsuarios();
    //const objetoPatchBasico = useMemo(() => {return {correo: previo.correo ?? "", nickname: previo.nickname ?? "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: previo.nombre ?? "", cumpleagnos: timestampAInputDate(previo.cumpleagnos) ?? "", descripcion: previo.descripcion ?? "", urlFoto: previo.urlFoto ?? "", cambiarContrasegna: false, contrasegnaAntigua: "", contrasegnaEliminar: "", correoEliminar: "" }}, [previo]);
    const objetoPatchBasico = {correo: previo.correo ?? "", nickname: previo.nickname ?? "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: previo.nombre ?? "", cumpleagnos: timestampAInputDate(previo.cumpleagnos) ?? "", descripcion: previo.descripcion ?? "", urlFoto: previo.urlFoto ?? "", cambiarContrasegna: false, contrasegnaAntigua: "", contrasegnaEliminar: "", correoEliminar: "" }
    const [objetoPatch, setObjetoPatch] = useState(objetoPatchBasico);
    const [errorFormulario, setErrorFormulario] = useState("");
    const nombreFalsoPlaceholder = useMemo(() => nombreFalso(), []);
    const nicknameFalsoPlaceholder = useMemo(() => nicknameFalso(), []);
    const correoFalsoPlaceholder = useMemo(() => correoFalso(), []);
    const [quiereEliminar, setQuiereEliminar] = useState(false);
    const navegar = useNavigate();
    const traduccion = useIdioma();
    const { lanzarMensaje } = useMensajes();

    const cambio = (e: React.SyntheticEvent) => {
        const target = e.target as HTMLInputElement;
        if (target.nodeName === "INPUT" || target.nodeName === "TEXTAREA") {
            if (target.type === "checkbox") {
                setObjetoPatch({ ...objetoPatch, [target.name]: target.checked });
            } else {
                e.preventDefault();
                setObjetoPatch({ ...objetoPatch, [target.name]: target.value });
            }
        }
    }

    const reset = () => {
        setObjetoPatch(objetoPatchBasico);
        resetEstados();
    }

    const validarFechaInput = (e:string) => validarCumpleagnos(inputDateATimestamp(e));

    const validarEdicion = () => {
        const contrasegnasBien = objetoPatch.cambiarContrasegna ? (validarContrasegna(objetoPatch.contrasegna) && objetoPatch.contrasegna === objetoPatch.contrasegna2 && validarContrasegna(objetoPatch.contrasegnaAntigua)) : true;
        return contrasegnasBien
            && objetoPatch.contrasegna2 === objetoPatch.contrasegna
            && validarNombre(objetoPatch.nombre)
            && validarCorreo(objetoPatch.correo)
            && validarNickname(objetoPatch.nickname)
            && validarFechaInput(objetoPatch.cumpleagnos)
            && validarUrl(objetoPatch.urlFoto)
            && validarDescripcion(objetoPatch.descripcion);
    }

    const validarBorrado = () => {
        return objetoPatch.correoEliminar === previo.correo
        && validarContrasegna(objetoPatch.contrasegnaEliminar);
    }

    const enviar = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (validarEdicion()) {
            setErrorFormulario("");
            const objetoEdicion = {...objetoPatch, correo: objetoPatch.correo === previo.correo ? undefined : objetoPatch.correo, contrasegna: objetoPatch.contrasegna === previo.contrasegna ? undefined : objetoPatch.contrasegna, nickname: objetoPatch.nickname === previo.nickname ? undefined : objetoPatch.nickname, contrasegna2: undefined, verContrasegna: undefined, contrasegnaEliminar: undefined, correoEliminar: undefined }
            const resultado = await editarUsuario(objetoEdicion);
            if (resultado?.ok && !error) {
                reset();
                navegar("/user");
                window.location.reload();
                lanzarMensaje(traduccion("mensajes", "editarUsuarioBien"), 1);
            } else {
                if (resultado?.error?.result?.data?.doubleNickname) {
                    setErrorFormulario(traduccion("errores", "nicknameRepetido"));
                } else if (resultado?.error?.result?.data?.doubleEmail) {
                    setErrorFormulario(traduccion("errores", "correoRepetido"));
                } else if (resultado?.error?.result?.data?.failedPassword) {
                    setErrorFormulario(traduccion("errores", "malaContrasegna"));
                } else {
                    setErrorFormulario(traduccion("errores", "noUsuarioEdit"));
                }
                lanzarMensaje(traduccion("mensajes", "editarUsuarioMal"), 2);
            }
            resetEstados();
        } else {
            lanzarMensaje(traduccion("mensajes", "editarUsuarioMal"), 2);
            setErrorFormulario(traduccion("errores", "noUsuarioEdit"));
            if (objetoPatch.cambiarContrasegna && objetoPatch.contrasegna !== objetoPatch.contrasegna2) setErrorFormulario(traduccion("errores", "dobleContrasegna"));
        }
        if (objetoPatch.contrasegna2 !== objetoPatch.contrasegna) setErrorFormulario(traduccion("errores", "dobleContrasegna"));
    }

    const enviarEliminarCuenta = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (quiereEliminar && validarBorrado()) {
            const resultado = await borrarUsuario(objetoPatch.contrasegnaEliminar);
            if (resultado.ok) {
                lanzarMensaje(traduccion("mensajes", "borrarUsuario"), 3);
                navegar("/");
                return;
            }
        }
        setErrorFormulario(traduccion("errores", "noUsuarioDelete"));
    }

    return (
        <>
            <Titulo magnitud={3}><Icono numero={9} color="var(--color-resaltado)" /> <Texto tipo="titulos" nombre="editarUsuario" /></Titulo>
            <form onChange={cambio}>
                <InputBasico nombre="nickname" placeholder={nicknameFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nickname" />} valor={objetoPatch.nickname} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNickname" />} validador={validarNickname} />
                <InputBasico nombre="correo" placeholder={correoFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="correo" />} valor={objetoPatch.correo} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionEmail" />} validador={validarCorreo} />
                <InputBasico nombre="nombre" placeholder={nombreFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nombre" />} valor={objetoPatch.nombre} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNombre" />} validador={validarNombre} />
                <InputBasico inline={true} nombre="urlFoto" placeholder={''} titulo={<Texto tipo="formularios" nombre="urlFoto" />} valor={objetoPatch.urlFoto} tipo="url" mensajeError={<Texto tipo="errores" nombre="validacionUrl" />} validador={validarUrl} />
                <img src={objetoPatch.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className='h-auto w-[10%] max-w-50 mb-2 border-4 border-principal aspect-square object-cover inline ml-5'/>
                <InputBasico nombre="descripcion" placeholder={'...'} titulo={<Texto tipo="formularios" nombre="descripcion" />} valor={objetoPatch.descripcion} tipo="textarea" markdown={true} mensajeError={<Texto tipo="errores" nombre="validacionDescripcion" />} validador={validarDescripcion} />
                <InputBasico nombre="cumpleagnos" titulo={<Texto tipo="formularios" nombre="cumpleagnos" />} valor={objetoPatch.cumpleagnos} tipo="date" mensajeError={<Texto tipo="errores" nombre="validacionCumpleagnos" />} validador={validarFechaInput} />
                <InputBasico inline={true} nombre="cambiarContrasegna" titulo={<Texto tipo="formularios" nombre="cambiarContrasegna" />} estaChecked={objetoPatch.cambiarContrasegna} tipo="checkbox" />
                {objetoPatch.cambiarContrasegna && (<span>
                    <InputBasico inline={true} nombre="contrasegna" titulo={<Texto tipo="formularios" nombre="contrasegna" />} valor={objetoPatch.contrasegna} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········"  mensajeError={<Texto tipo="errores" nombre="validacionContrasegna" />} validador={validarContrasegna} />
                    <InputBasico inline={true} nombre="contrasegna2" titulo={<Texto tipo="formularios" nombre="contrasegna2" />} valor={objetoPatch.contrasegna2} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········" />
                    <InputBasico inline={true} nombre="verContrasegna" titulo={<Texto tipo="formularios" nombre="contrasegnaMostrar" />} estaChecked={objetoPatch.verContrasegna} tipo="checkbox" />
                </span>)}
                <InputBasico iconoA={11} nombre="contrasegnaAntigua" titulo={<Texto tipo="formularios" nombre="contrasegnaAntigua" />} valor={objetoPatch.contrasegnaAntigua} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········" />
                <BotonFuncion titulo={<Texto tipo="botones" nombre="editarPerfil" />} funcion={enviar} tipo={1} hueco={false} ><Icono numero={12} color="var(--color-fondo1)" /></BotonFuncion>
                <BotonFuncion titulo={<Texto tipo="botones" nombre="reset" />} funcion={reset} tipo={2} ><Icono numero={10} color="var(--color-error)" /></BotonFuncion>

                {!quiereEliminar ? (<BotonFuncion titulo={<Texto tipo="botones" nombre="eliminarCuenta1" />} funcion={() => {setQuiereEliminar(true)}} tipo={2} hueco={false} ><Icono numero={10} color="var(--color-fondo1)" /></BotonFuncion>) : (<div className='border border-error'>
                    <InputBasico inline={true} nombre="correoEliminar" titulo={<Texto tipo="formularios" nombre="correoAntiguo" />} valor={objetoPatch.correoEliminar} tipo="text" placeholder="" />
                    <InputBasico nombre="contrasegnaEliminar" titulo={<Texto tipo="formularios" nombre="contrasegnaAntigua" />} valor={objetoPatch.contrasegnaEliminar} tipo="password" placeholder="········" />
                    <BotonFuncion titulo={<Texto tipo="botones" nombre="eliminarCuenta2" />} funcion={enviarEliminarCuenta} tipo={2} hueco={false} ><Icono numero={10} color="var(--color-fondo1)" /></BotonFuncion>
                </div>)}
                <CajaError texto={errorFormulario ?? ''} nivel="input" />
                {cargando && (<ImgCargando />)}
            </form>
        </>
    )
}

export default FormularioEditarPerfil;
