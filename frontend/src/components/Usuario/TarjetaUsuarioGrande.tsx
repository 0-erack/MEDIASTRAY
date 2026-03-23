import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useMensajes from '../../hooks/useMensajes';
import useSesion from '../../hooks/useSesion';
import { timestampAFecha } from '../../libraries/extraFechas';
import BotonFuncion from '../Elements/BotonFuncion';
import EnlaceFuncion from '../Elements/EnlaceFuncion';
import MarkdownDisplay from '../Elements/MarkdownDisplay';
import Titulo from '../Elements/Titulo';
import FormularioEditarPerfil from '../Forms/FormularioEditarPerfil';
import Icono from '../Principal/Icono';

interface TarjetaUsuarioGrandeProps {
  usuario: Record<string, any>;
  soyYo: boolean | null;
  esPremium: boolean;
}

/**
 * Componente para mostrar todos los datos de un usuario
 * @param usuario datos a mostrar
 * @param soyYo si se renderiza como si ese usuario fuese quien ve el componente
 * @param esPremium si el usuario seria premium
 */
function TarjetaUsuarioGrande({ usuario, soyYo, esPremium }: TarjetaUsuarioGrandeProps) {

  const { usuario: usuarioActual } = useSesion();
  const fechaCumpleagnos = timestampAFecha(usuario.cumpleagnos);
  const fechaCreacion = timestampAFecha(usuario.fechaCreacion);
  const [siguiendo, setSiguiendo] = useState(false);
  const [teSigue, setTeSigue] = useState(false);
  const { verSeguir, seguir, verSeguimientos } = useApiUsuarios();
  const [seguidoresSimulados, setSeguidoresSimulados] = useState(usuario.cantidadSeguidores);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const { lanzarMensaje } = useMensajes();
  const traduccion = useIdioma();
  const navegar = useNavigate();
  const [verSeguidores, setVerSeguidores] = useState(false);
  const [verSeguidos, setVerSeguidos] = useState(false);
  const [seguidos, setSeguidos] = useState<Array<Record<string, any>>>([]);
  const [seguidores, setSeguidores] = useState<Array<Record<string, any>>>([]);

  /**
   * Funcionalidad para el boton de seguir
   */
  const alternarSeguir = async () => {
    if (soyYo || !usuarioActual) return false;
    if (siguiendo) {
      const resultado = await seguir(usuario.id, -1);
      if (resultado && !resultado.error) {
        lanzarMensaje(traduccion("mensajes", "noSeguirUsuario"), 3);
        setSiguiendo(!siguiendo);
        setSeguidoresSimulados(seguidoresSimulados - 1);
      }
    } else {
      const resultado = await seguir(usuario.id, 1);
      if (resultado && !resultado.error) {
        lanzarMensaje(traduccion("mensajes", "seguirUsuario"), 1);
        setSiguiendo(!siguiendo);
        setSeguidoresSimulados(seguidoresSimulados + 1);
      }
    }
  }

  /**
   * Funcion para saber si se sigue al usuario o el usuario sigue al usuario actual
   * @param deVuelta en que orden funciona el seguimiento
   * @returns si le sigue o no
   */
  const verSiguiendo = async (deVuelta?: boolean): Promise<boolean> => {
    if (soyYo || !usuarioActual) return false;
    if (deVuelta) {
      const siguiendo = await verSeguir(usuario.id, (typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '');
      return siguiendo;
    } else {
      const siguiendo = await verSeguir((typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '', usuario.id);
      return siguiendo;
    }
  }

  /**
   * Establece la lista de nicknames de los usuarios seguidos/seguidores
   * @param seguidores en que orden funciona el seguimiento
   */
  const consultarSeguimientos = async (seguidores: boolean) => {
    if (seguidores) {
      setVerSeguidores(true);
      const listaSeguidores = await verSeguimientos(true, usuario.id);
      setSeguidores(listaSeguidores ?? []);
    } else {
      setVerSeguidos(true);
      const listaSeguidos = await verSeguimientos(false, usuario.id);
      setSeguidos(listaSeguidos ?? []);
    }
  }

  const cargaInicial = useCallback(async () => {
    if (usuarioActual && !soyYo) {
      setSiguiendo(await verSiguiendo());
      setTeSigue(await verSiguiendo(true));
    }
  }, []);
  useEffect(() => {
    cargaInicial();
  }, []);
  
  useEffect(() => {
    setVerSeguidores(false);
    setVerSeguidos(false);
    setSeguidos([]);
    setSeguidores([]);
  }, [usuario]);

  return (
    <div className="tarjeta-usuario-grande">
      <Titulo><Icono numero={1} color="var(--color-resaltado)" /> {(soyYo ? (traduccion("titulosHtml", "saludo") + ", ") : '') + usuario.nombre}</Titulo>

      <img src={usuario.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className={`h-auto w-[10%] max-w-50 mb-2 border-4 ${esPremium ? 'border-info1' : 'border-resaltado'} aspect-square object-cover`} />

      <p>{"( "}{usuario.nickname}{" ) "}{soyYo && (<span className='fuente2'>{usuario.correo}</span>)}</p>

      <div className='my-2'><div>{usuario.descripcion?.length ? (esPremium ? (<MarkdownDisplay text={usuario.descripcion} />) : (<div className='overflow-y-scroll w-auto border border-principal p-2 bg-fondo-especial-1' style={{maxHeight: '400px'}}>{usuario.descripcion}</div>)) : traduccion("errores", "noDescripcion")}</div></div>

      {soyYo && (<p><span className='font-black'>{traduccion("formularios", "cumpleagnos")}</span> {fechaCumpleagnos}</p>)}

      <p><span className='font-black'>{traduccion("formularios", "fechaCreacion")}</span> {fechaCreacion}</p>

      <p><span className='font-black'>{traduccion("formularios", "premium")}</span> {esPremium ? (<><Icono numero={7} color='var(--color-especial)' /> {traduccion("palabras", "si")}</>) : (<><Icono numero={10} color='var(--color-principal)' /> {traduccion("palabras", "no")}</>)}</p>

      <p><span className='font-black'><Icono numero={2} color='var(--color-principal)' /> {traduccion("formularios", "seguidores")}</span> {seguidoresSimulados} {(!soyYo && usuarioActual) && (<span>
        <BotonFuncion funcion={alternarSeguir} titulo={traduccion("botones", siguiendo ? "noSeguir" : "seguir")} >{siguiendo ? (<Icono numero={18} color='var(--color-info1)' />) : (<Icono numero={19} color='var(--color-principal)' />)}</BotonFuncion>
        <span>{usuario.nombre} {traduccion("formularios", teSigue ? "teSigue" : "noTeSigue")}</span>
      </span>)}</p>
      {seguidoresSimulados > 0 ? (<>
        {verSeguidores ? (<div>
          <Titulo magnitud={4}>{traduccion("extra", "labelSeguidores")}</Titulo>
          <span className='border border-principal p-2'>
            {seguidores.length ? seguidores.map((e) => (<span key={e.id}><EnlaceFuncion color={1} key={e.id} titulo={e.nickname} funcion={"/user/" + e.nickname} />{" "}</span>)) : (<span>{traduccion("errores", "noSeguidores")}</span>)}
          </span>
        </div>) : (<><EnlaceFuncion color={1} titulo={traduccion("botones", "verSeguidores")} funcion={() => consultarSeguimientos(true)} /> {" "}</>)}
      </>) : ('')}
      {verSeguidos ? (<div className='mb-4'>
        <Titulo magnitud={4}>{traduccion("extra", "labelSeguidos")}</Titulo>
        <span className='border border-principal p-2'>
          {seguidos.length ? seguidos.map((e) => (<span key={e.id}><EnlaceFuncion color={1} key={e.id} titulo={e.nickname} funcion={"/user/" + e.nickname} />{" "}</span>)) : (<span>{traduccion("errores", "noSeguidos")}</span>)}
        </span>
      </div>) : (<EnlaceFuncion color={1} titulo={traduccion("botones", "verSeguidos")} funcion={() => consultarSeguimientos(false)} />)}



      {(soyYo) ? (<div>
        {!editandoPerfil && (<BotonFuncion funcion={() => { setEditandoPerfil(true) }} titulo={traduccion("botones", "editarPerfil")} />)}
        <EnlaceFuncion titulo={traduccion("botones", "logout")} funcion={() => { navegar("/logout") }} />
      </div>) : (<p>REPORTAR USUARIO</p>) /*//TODO: */}

      {editandoPerfil && soyYo && (<FormularioEditarPerfil usuario={usuario} />)}
    </div>
  )
}

export default TarjetaUsuarioGrande; 
