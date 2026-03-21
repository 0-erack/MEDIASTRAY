import { useEffect, useState } from 'react';
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
  soyYo: boolean|null;
  esPremium: boolean;
}

function TarjetaUsuarioGrande({ usuario, soyYo, esPremium }: TarjetaUsuarioGrandeProps) {

  const { usuario: usuarioActual } = useSesion();
  const fechaCumpleagnos = timestampAFecha(usuario.cumpleagnos);
  const fechaCreacion = timestampAFecha(usuario.fechaCreacion);
  const [siguiendo, setSiguiendo] = useState(false);
  const [teSigue, setTeSigue] = useState(false);
  const { verSeguir, seguir } = useApiUsuarios();
  const [seguidoresSimulados, setSeguidoresSimulados] = useState(usuario.cantidadSeguidores);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const { lanzarMensaje } = useMensajes();
  const traduccion = useIdioma();
  const navegar = useNavigate();

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

  const verSiguiendo = async (deVuelta?:boolean):Promise<boolean> => {
    if (soyYo || !usuarioActual) return false;
    if (deVuelta) {
      const siguiendo = await verSeguir(usuario.id, (typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '');
      return siguiendo;
    } else {
      const siguiendo = await verSeguir((typeof usuarioActual === 'object' && usuarioActual) ? usuarioActual!.id! : '', usuario.id);
      return siguiendo;
    }
  }

  const cargaInicial = async () => {
    if (usuarioActual && !soyYo) {
      setSiguiendo(await verSiguiendo());
      setTeSigue(await verSiguiendo(true));
    }
  }
  useEffect(() => {
    cargaInicial();
  }, []);

  return (
    <div className="tarjeta-usuario-grande">
        <Titulo><Icono numero={1} color="var(--color-resaltado)" /> {(soyYo ? (traduccion("titulosHtml", "saludo") + ", " ) : '') + usuario.nombre}</Titulo>

        <img src={usuario.urlFoto ?? "#"} alt={traduccion("errores", "nopfp")} className='h-auto w-[10%] max-w-50 mb-2 border-4 border-resaltado aspect-square object-cover'/>

        <p>{"( "}{usuario.nickname}{" ) "}{soyYo && (<span className='fuente2'>{usuario.correo}</span>)}</p>

        <div className='my-2'><div>{usuario.descripcion?.length ? (<MarkdownDisplay text={usuario.descripcion} />) : traduccion("errores", "noDescripcion")}</div></div>
        
        {soyYo && (<p><span className='font-black'>{traduccion("formularios", "cumpleagnos")}</span> {fechaCumpleagnos}</p>)}

        <p><span className='font-black'>{traduccion("formularios", "fechaCreacion")}</span> {fechaCreacion}</p>

        <p><span className='font-black'>{traduccion("formularios", "premium")}</span> {esPremium ? (<><Icono numero={7} color='var(--color-especial)' /> {traduccion("palabras", "si")}</>) : (<><Icono numero={10} color='var(--color-principal)' /> {traduccion("palabras", "no")}</>)}</p>

        <p><span className='font-black'><Icono numero={2} color='var(--color-principal)' /> {traduccion("formularios", "seguidores")}</span> {seguidoresSimulados} {(!soyYo && usuarioActual) && (<span>
          <BotonFuncion funcion={alternarSeguir} titulo={traduccion("botones", siguiendo ? "noSeguir" : "seguir")} >{siguiendo ? (<Icono numero={18} color='var(--color-info1)' />) : (<Icono numero={19} color='var(--color-principal)' />)}</BotonFuncion>
          <span>{usuario.nombre} {traduccion("formularios", teSigue ? "teSigue" : "noTeSigue")}</span>
        </span>)}</p>

        {(soyYo) ? (<div>
          {!editandoPerfil && (<BotonFuncion funcion={() => {setEditandoPerfil(true)}} titulo={traduccion("botones", "editarPerfil")} />)}
          <EnlaceFuncion titulo={traduccion("botones", "logout")} funcion={()=>{navegar("/logout")}} />
        </div>) : (<p>REPORTAR USUARIO</p>) /*//TODO: */}

        {editandoPerfil && soyYo && (<FormularioEditarPerfil usuario={usuario} />)}
    </div>
  )
}

export default TarjetaUsuarioGrande; 
