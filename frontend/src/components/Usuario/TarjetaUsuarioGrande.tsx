import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useApiJuegos from '../../hooks/api/useApiJuegos';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useAjustes from '../../hooks/useAjustes';
import useIdioma from '../../hooks/useIdioma';
import useJuegos from '../../hooks/useJuegos';
import useMensajes from '../../hooks/useMensajes';
import useSesion from '../../hooks/useSesion';
import useTituloDinamico from '../../hooks/useTituloDinamico';
import { timestampAFecha } from '../../libraries/extraFechas';
import IndicadorPagina from '../Busqueda/IndicadorPagina';
import ElementoReporte from '../Comentarios/ElementoReporte';
import BotonFuncion from '../Elements/BotonFuncion';
import EnlaceFuncion from '../Elements/EnlaceFuncion';
import MarkdownDisplay from '../Elements/MarkdownDisplay';
import Titulo from '../Elements/Titulo';
import FormularioEditarPerfil from '../Forms/FormularioEditarPerfil';
import TarjetaJuego from '../Juego/TarjetaJuego';
import Icono from '../Principal/Icono';
import ImgCargando from '../Principal/ImgCargando';

interface TarjetaUsuarioGrandeProps {
  usuario: Record<string, any>;
  soyYo: boolean | null;
  esPremium: boolean;
}

interface FormValues {
  paginaMios: number;
  paginaSeguidos?: number;
}

/**
 * Componente para mostrar todos los datos de un usuario
 * @param usuario datos a mostrar
 * @param soyYo si se renderiza como si ese usuario fuese quien ve el componente
 * @param esPremium si el usuario seria premium
 */
function TarjetaUsuarioGrande({ usuario, soyYo, esPremium }: TarjetaUsuarioGrandeProps) {

  const { usuario: usuarioActual, esAdmin: soyAdmin } = useSesion();
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
  const [juegosCreados, setJuegosCreados] = useState<Array<Record<string, any>>>([]);
  const [juegosSeguidos, setJuegosSeguidos] = useState<Array<Record<string, any>>>([]);
  const { misJuegos } = useJuegos();
  const { buscarJuegosUsuario, buscarJuegosSeguidos, cargando } = useApiJuegos();
  const formBaseJuegos = { paginaMios: 0, paginaSeguidos: 0 }
  const { control, watch, formState: { errors }, setValue } = useForm<FormValues>({ defaultValues: formBaseJuegos });
  const datosPaginasJuegos = watch();
  const { TAMAGNO_PAGINA } = useAjustes();
  useTituloDinamico("", usuario.nickname);

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

  /**
   * Busca los juegos de ese usuario en x pagina para mostrarlos
   * @param pagina cual buscar
   */
  const buscarJuegosAjenos = async (pagina = 0) => {
    if (!soyYo) {
      const juegos = await buscarJuegosUsuario(usuario.id, pagina);
      setJuegosCreados(juegos ?? []);
    } else {
      if (misJuegos.length) {
        setJuegosCreados(misJuegos.slice(0, typeof Number.parseInt(TAMAGNO_PAGINA + '') == "number" ? Number.parseInt(TAMAGNO_PAGINA + '') : 50));
      } else {
        setJuegosCreados([]);
      }
    }
  }

  /**
   * Busca los juegos que sigue este usuario en x pagina para mostrarlos
   * @param pagina cual buscar
   */
  const buscarJuegosAjenosSeguidos = useCallback(async (pagina = 0) => {
    const juegos = await buscarJuegosSeguidos(pagina);
    setJuegosSeguidos(juegos ?? []);
  }, []);

  const cargaInicial = useCallback(async () => {
    if (usuarioActual && !soyYo) {
      setSiguiendo(await verSiguiendo());
      setTeSigue(await verSiguiendo(true));
    }
    if (soyYo) {
      if (misJuegos.length) setJuegosCreados(misJuegos.slice(0, 50));
      await buscarJuegosAjenosSeguidos(0);
    } else {
      await buscarJuegosAjenos(0);
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

  useEffect(() => {
    buscarJuegosAjenos(datosPaginasJuegos.paginaMios);
  }, [datosPaginasJuegos.paginaMios, usuario, soyYo, misJuegos]);
  useEffect(() => {
    buscarJuegosAjenosSeguidos(datosPaginasJuegos.paginaSeguidos);
  }, [datosPaginasJuegos.paginaSeguidos, usuario, soyYo, misJuegos]);

  return (
    <div className="tarjeta-usuario-grande xl:flex gap-4">
      <div className='sm:min-w-[50%]'>
        <Titulo><Icono numero={1} tamagno={16} color="var(--color-resaltado)" /> {(soyYo ? (traduccion("titulosHtml", "saludo") + ", ") : '') + usuario.nombre}</Titulo>
        {(soyAdmin > 0 && usuario) && (<p><EnlaceFuncion titulo={traduccion("extra", "moderar")} funcion={"/admin/user_" + usuario.id} /></p>)}

        <img src={usuario.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className={`h-auto w-[10%] min-w-20 max-w-50 mb-2 border-4 ${esPremium ? 'border-info1' : 'border-resaltado'} aspect-square object-cover`} />

        <p>{"( "}{usuario.nickname}{" ) "}{soyYo && (<span className='fuente2'>{usuario.correo}</span>)}</p>

        <div className='my-2'><div>{usuario.descripcion?.length ? (esPremium ? (<MarkdownDisplay text={usuario.descripcion} />) : (<div className='overflow-y-scroll w-auto border border-principal p-2 bg-fondo-especial-1' style={{ maxHeight: '400px' }}>{usuario.descripcion}</div>)) : traduccion("errores", "noDescripcion")}</div></div>

        {soyYo && (<p><span className='font-black'>{traduccion("formularios", "cumpleagnos")}</span> {fechaCumpleagnos}</p>)}

        <p><span className='font-black'>{traduccion("formularios", "fechaCreacion")}</span> {fechaCreacion}</p>

        <p><span className='font-black'>{traduccion("formularios", "premium")}</span> {esPremium ? (<><Icono numero={7} color='var(--color-info1)' /> {traduccion("palabras", "si")}</>) : (<><Icono numero={10} color='var(--color-principal)' /> {traduccion("palabras", "no")}</>)}</p>

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
        </div>) : (<ElementoReporte idObjeto={usuario.id} tipoObjeto="user" />)}
      </div>

      {editandoPerfil ? "" : (<div className='w-full'>
        {cargando && <ImgCargando />}
        <Titulo magnitud={4}>{traduccion("titulos", "juegosPropios")}</Titulo>
        <div className={`pr-3 pb-4 border border-principal pl-2 overflow-y-scroll ${soyYo ? 'sm:max-h-[60vh]' : 'sm:max-h-[80vh]'}`}>
          <IndicadorPagina control={control} setValue={setValue} nombre="paginaMios" /><br />
          {juegosCreados.length ? juegosCreados.map((e, i) => {
            return (<TarjetaJuego key={i} juego={e} />)
          }) : traduccion("errores", "noHayJuegos")}
        </div>
        {soyYo && (<>
          <Titulo magnitud={4}>{traduccion("titulos", "juegosSeguidos")}</Titulo>
          <div className='pr-3 pb-4 border border-principal pl-2 overflow-y-scroll sm:max-h-[60vh]'>
            <IndicadorPagina control={control} setValue={setValue} nombre="paginaSeguidos" /><br />
            {juegosSeguidos.length ? juegosSeguidos.map((e, i) => {
              return (<TarjetaJuego key={i} juego={e} />)
            }) : traduccion("errores", "noHayJuegos")}
          </div>
        </>)}
      </div>)}

      {editandoPerfil && soyYo && (<span><FormularioEditarPerfil usuario={usuario} /></span>)}
    </div>
  )
}

export default TarjetaUsuarioGrande; 
