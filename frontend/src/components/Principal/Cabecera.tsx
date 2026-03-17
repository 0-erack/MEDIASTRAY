
import { useNavigate } from 'react-router-dom';
import imgLogo from '../../assets/images/logoA.png';
import imgLogoHover from '../../assets/images/logoAhover.png';
import useAjustes from '../../hooks/useAjustes';
import useSesion from '../../hooks/useSesion';
import { cambiarIdiomaHtml } from '../../libraries/accionesIndex';
import BotonNavegacion from '../Elements/BotonNavegacion';
import EnlaceFuncion from '../Elements/EnlaceFuncion';

function Cabecera() {

  const { idiomaActual, idiomasAdmitidos, cambiarIdiomaActual, textosInterfazEnlacesCabecera, PUBLIC_URL } = useAjustes();
  const { usuario } = useSesion();
  const navegar = useNavigate();
  //usuarioActual.id = "si"; usuarioActual.nickname = "sisisi";
  return (
    <>
      <header id="cabecera" className='flex items-center justify-start gap-4 p-1 bg-fondo2 fuente2'>
        <div className='shrink-0 group relative min-w-50 max-w-60 h-auto'>
          <img src={imgLogo ?? PUBLIC_URL + "/logoA.png"} className="w-full cursor-pointer block group-hover:hidden" style={{ imageRendering: 'pixelated' }} alt="Logo" onClick={() => navegar("/")}/>
          <img src={imgLogoHover ?? PUBLIC_URL + "/logoAhover.png"} className="w-full cursor-pointer hidden group-hover:block" style={{ imageRendering: 'pixelated' }} alt="Logo Hover" onClick={() => navegar("/")}/>        
        </div>
        <nav className='flex flex-1 min-h-18 flex-wrap items-center content-center gap-2 *:bg-principal *:text-fondo-especial-1 *:hover:bg-resaltado *:p-2 *:hover:underline *:transition-all *:duration-100 *:hover:scale-y-120'>
          {textosInterfazEnlacesCabecera[(usuario ? "si" : "no") + "Usuario"][idiomaActual]?.map((e: any, i: number) => {
            return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} />)
          })}
          {textosInterfazEnlacesCabecera[idiomaActual]?.map((e: any, i: number) => {
            return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} />)
          })}
          
        </nav>
        <div>
          {usuario ? (
            <span className="usuario-cabecera">
              <img src="" alt="" />
              <BotonNavegacion cabecera={true} direccion={"/user"} titulo={(typeof usuario === 'object' && usuario !== null) ? usuario?.nickname : "User"} />
            </span>
          ) : ""}
          <div id="cambiar-idioma *:block ml-auto">
            {idiomasAdmitidos?.map((e, i) => {
              if (e !== idiomaActual) return (<div><EnlaceFuncion key={i} cabecera={true} titulo={e} funcion={() => {
                cambiarIdiomaActual(e);
                cambiarIdiomaHtml((e[0] + e[1]).toLowerCase());
              }} /></div>)
            })}
          </div>
        </div>
      </header>
    </>
  )
}

export default Cabecera;
