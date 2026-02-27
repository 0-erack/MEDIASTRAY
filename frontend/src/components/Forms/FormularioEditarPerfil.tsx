import { useState, useMemo } from 'react';
import Texto from '../Texto';
import useApi from '../../hooks/useApi';
import InputBasico from '../Elements/InputBasico';
import BotonFuncion from '../Elements/BotonFuncion';
import { correo as validarCorreo, contrasegna as validarContrasegna, nickname as validarNickname, nombre as validarNombre, cumpleagnos as validarCumpleagnos, url as validarUrl, descripcionUsuario as validarDescripcion } from '../../libraries/validacionesBackend';
import { TextoTraducido } from '../../libraries/traducir';
import { nicknameFalso, nombreFalso, correoFalso } from '../../libraries/datosFalsos';
import useAjustes from '../../hooks/useAjustes';
import ImgCargando from '../Principal/ImgCargando';
import { timestampAInputDate } from '../../libraries/extraFechas';
import { useNavigate } from 'react-router-dom';
import useMensajes from '../../hooks/useMensajes';

function FormularioEditarPerfil({usuario}: {usuario: any}) {

    const previo = usuario;
    const { editarUsuario, borrarUsuario, cargando, error, resetEstados } = useApi();
    //const objetoPatchBasico = useMemo(() => {return {correo: previo.correo ?? "", nickname: previo.nickname ?? "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: previo.nombre ?? "", cumpleagnos: timestampAInputDate(previo.cumpleagnos) ?? "", descripcion: previo.descripcion ?? "", url_foto: previo.url_foto ?? "", cambiarContrasegna: false, contrasegnaAntigua: "", contrasegnaEliminar: "", correoEliminar: "" }}, [previo]);
    const objetoPatchBasico = {correo: previo.correo ?? "", nickname: previo.nickname ?? "", contrasegna: "", verContrasegna: false, contrasegna2: "", nombre: previo.nombre ?? "", cumpleagnos: timestampAInputDate(previo.cumpleagnos) ?? "", descripcion: previo.descripcion ?? "", url_foto: previo.url_foto ?? "", cambiarContrasegna: false, contrasegnaAntigua: "", contrasegnaEliminar: "", correoEliminar: "" }
    const [objetoPatch, setObjetoPatch] = useState(objetoPatchBasico);
    const [errorFormulario, setErrorFormulario] = useState("");
    const { idiomaActual } = useAjustes();
    const nombreFalsoPlaceholder = useMemo(() => nombreFalso(), []);
    const nicknameFalsoPlaceholder = useMemo(() => nicknameFalso(), []);
    const correoFalsoPlaceholder = useMemo(() => correoFalso(), []);
    const [quiereEliminar, setQuiereEliminar] = useState(false);
    const navegar = useNavigate();
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

    const validarEdicion = () => {
        const contrasegnasBien = objetoPatch.cambiarContrasegna ? (validarContrasegna(objetoPatch.contrasegna) && objetoPatch.contrasegna === objetoPatch.contrasegna2 && validarContrasegna(objetoPatch.contrasegnaAntigua)) : true;
        return contrasegnasBien
            && objetoPatch.contrasegna2 === objetoPatch.contrasegna
            && validarNombre(objetoPatch.nombre)
            && validarCorreo(objetoPatch.correo)
            && validarNickname(objetoPatch.nickname)
            && validarCumpleagnos(objetoPatch.cumpleagnos)
            && validarUrl(objetoPatch.url_foto)
            && validarDescripcion(objetoPatch.descripcion);
    }

    const validarBorrado = () => {
        return objetoPatch.correoEliminar === previo.correo
        && validarContrasegna(objetoPatch.contrasegnaEliminar);
    }

    const enviar = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        //validar correctamente, mirar que no haya uniques en uso (a no ser que sean propios), enviar al servidor, si es correcto setear datos nuevos, si no mostrar error
        if (validarEdicion()) {
            setErrorFormulario("");
            const resultado = await editarUsuario(objetoPatch);
            if (resultado?.ok && !error) {
                reset();
                //navegar("/user/" + resultado.user.nickname);
                window.location.reload();
                lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "editarUsuarioBien"), 1);
            } else {
                if (resultado?.error?.result?.data.doubleNickname) {
                    setErrorFormulario(TextoTraducido("errores", idiomaActual, "nicknameRepetido"));
                } else if (resultado?.error?.result?.data.doubleEmail) {
                    setErrorFormulario(TextoTraducido("errores", idiomaActual, "correoRepetido"));
                } else if (resultado?.error?.result?.data.failedPassword) {
                    setErrorFormulario(TextoTraducido("errores", idiomaActual, "noLogin"));
                } else {
                    setErrorFormulario(TextoTraducido("errores", idiomaActual, "noUsuarioEdit"));
                }
                lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "editarUsuarioMal"), 2);
            }
            resetEstados();
        } else {
            lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "editarUsuarioMal"), 2);
            setErrorFormulario(TextoTraducido("errores", idiomaActual, "noUsuarioEdit"));
            if (objetoPatch.cambiarContrasegna && objetoPatch.contrasegna !== objetoPatch.contrasegna2) setErrorFormulario(TextoTraducido("errores", idiomaActual, "dobleContrasegna"));
        }
        if (objetoPatch.contrasegna2 !== objetoPatch.contrasegna) setErrorFormulario(TextoTraducido("errores", idiomaActual, "dobleContrasegna"));
    }

    const enviarEliminarCuenta = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (quiereEliminar && validarBorrado()) {
            const resultado = await borrarUsuario(objetoPatch.contrasegnaEliminar);
            if (resultado.ok) {
                lanzarMensaje(TextoTraducido("mensajes", idiomaActual, "borrarUsuario"), 3);
                navegar("/");
                return;
            }
        }
        setErrorFormulario(TextoTraducido("errores", idiomaActual, "noUsuarioDelete"));
    }

    return (
        <>
            <h3><Texto tipo="titulos" nombre="editarUsuario" /></h3>
            <form onChange={cambio}>
                <InputBasico nombre="nickname" placeholder={nicknameFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nickname" />} valor={objetoPatch.nickname} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNickname" />} validador={validarNickname} />
                <InputBasico nombre="correo" placeholder={correoFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="correo" />} valor={objetoPatch.correo} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionEmail" />} validador={validarCorreo} />
                <InputBasico nombre="nombre" placeholder={nombreFalsoPlaceholder} titulo={<Texto tipo="formularios" nombre="nombre" />} valor={objetoPatch.nombre} tipo="text" mensajeError={<Texto tipo="errores" nombre="validacionNombre" />} validador={validarNombre} />
                <InputBasico nombre="url_foto" placeholder={''} titulo={<Texto tipo="formularios" nombre="urlFoto" />} valor={objetoPatch.url_foto} tipo="url" mensajeError={<Texto tipo="errores" nombre="validacionUrl" />} validador={validarUrl} />
                <InputBasico nombre="descripcion" placeholder={'...'} titulo={<Texto tipo="formularios" nombre="descripcion" />} valor={objetoPatch.descripcion} tipo="textarea" mensajeError={<Texto tipo="errores" nombre="validacionDescripcion" />} validador={validarDescripcion} />
                <InputBasico nombre="cumpleagnos" titulo={<Texto tipo="formularios" nombre="cumpleagnos" />} valor={objetoPatch.cumpleagnos} tipo="date" mensajeError={<Texto tipo="errores" nombre="validacionCumpleagnos" />} validador={validarCumpleagnos} />
                <InputBasico nombre="cambiarContrasegna" titulo={<Texto tipo="formularios" nombre="cambiarContrasegna" />} estaChecked={objetoPatch.cambiarContrasegna} tipo="checkbox" />
                {objetoPatch.cambiarContrasegna && (<div>
                    <InputBasico nombre="contrasegnaAntigua" titulo={<Texto tipo="formularios" nombre="contrasegnaAntigua" />} valor={objetoPatch.contrasegnaAntigua} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········" />
                    <InputBasico nombre="contrasegna" titulo={<Texto tipo="formularios" nombre="contrasegna" />} valor={objetoPatch.contrasegna} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········"  mensajeError={<Texto tipo="errores" nombre="validacionContrasegna" />} validador={validarContrasegna} />
                    <InputBasico nombre="contrasegna2" titulo={<Texto tipo="formularios" nombre="contrasegna2" />} valor={objetoPatch.contrasegna2} tipo={objetoPatch.verContrasegna ? "text" : "password"} placeholder="········" />
                    <InputBasico nombre="verContrasegna" titulo={<Texto tipo="formularios" nombre="contrasegnaMostrar" />} estaChecked={objetoPatch.verContrasegna} tipo="checkbox" />
                </div>)}
                <BotonFuncion titulo={<Texto tipo="botones" nombre="editarPerfil" />} funcion={enviar} />
                <BotonFuncion titulo={<Texto tipo="botones" nombre="reset" />} funcion={reset} />

                {!quiereEliminar ? (<BotonFuncion titulo={<Texto tipo="botones" nombre="eliminarCuenta1" />} funcion={() => {setQuiereEliminar(true)}} />) : (<div>
                    <InputBasico nombre="correoEliminar" titulo={<Texto tipo="formularios" nombre="correoAntiguo" />} valor={objetoPatch.correoEliminar} tipo="text" placeholder="" />
                    <InputBasico nombre="contrasegnaEliminar" titulo={<Texto tipo="formularios" nombre="contrasegnaAntigua" />} valor={objetoPatch.contrasegnaEliminar} tipo="password" placeholder="········" />
                    <BotonFuncion titulo={<Texto tipo="botones" nombre="eliminarCuenta2" />} funcion={enviarEliminarCuenta} />
                </div>)}

                <div className="caja-errores">{errorFormulario}</div>
                {cargando && (<ImgCargando />)}
            </form>
        </>
    )
}

export default FormularioEditarPerfil;
