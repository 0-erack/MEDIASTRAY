
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import imgLogo from '../../assets/images/logoA.png';
import imgLogoHover from '../../assets/images/logoAhover.png';
import useAjustes from '../../hooks/useAjustes';
import useIdioma from '../../hooks/useIdioma';
import useSesion from '../../hooks/useSesion';
import { cambiarIdiomaHtml } from '../../libraries/accionesIndex';
import BotonNavegacion from '../Elements/BotonNavegacion';
import Icono from './Icono';

/**
 * Cabecera principal de la pagina
 */
function Cabecera() {

  const { idiomaActual, idiomasAdmitidos, cambiarIdiomaActual, textosInterfazEnlacesCabecera, PUBLIC_URL } = useAjustes();
  const { usuario, esAdmin } = useSesion();
  const navegar = useNavigate();
  const traduccion = useIdioma();
  const slug = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const handlerCambiarIdioma = (e: string) => {
                  cambiarIdiomaActual(e);
                  cambiarIdiomaHtml((e[0] + e[1]).toLowerCase());
                }
  const enlaces = () => (<><BotonNavegacion key={-1} cabecera={true} direccion={"/"} titulo={traduccion("botones", "inicio")} >
    <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={0} color="var(--color-fondo1)" /></span>
  </BotonNavegacion>
    {textosInterfazEnlacesCabecera[(usuario ? "si" : "no") + "Usuario"][idiomaActual]?.map((e: any, i: number) => {
      return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} >
        <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={e.numeroIcono} color="var(--color-fondo1)" /></span>
      </BotonNavegacion>)
    })}
    {textosInterfazEnlacesCabecera[idiomaActual]?.map((e: any, i: number) => {
      return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} >
        <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={e.numeroIcono} color={`var(--color-${e.numeroIcono === 7 ? 'info1' : 'fondo1'})`} /></span>
      </BotonNavegacion>)
    })}
    {(esAdmin > 0) && (<BotonNavegacion cabecera={true} direccion={"/admin"} titulo={traduccion("botones", "panelAdmin")} >
        <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={13} color={`var(--color-fondo1`} /></span>
      </BotonNavegacion>)}
    </>);

  return (
    <>
      <header id="cabecera" className='flex items-center justify-start gap-1 sm:gap-4 p-1 sm:pr-10 bg-fondo2 fuente2 z-200'>
        <div className='shrink-0 group relative min-w-50 max-w-60 h-auto m-2 sm:m-2'>
          <img src={imgLogo ?? PUBLIC_URL + "/logoA.png"} className="w-full cursor-pointer block group-hover:hidden" style={{ imageRendering: 'pixelated' }} alt="Logo" onClick={() => navegar("/")} />
          <img src={imgLogoHover ?? PUBLIC_URL + "/logoAhover.png"} className="w-full cursor-pointer hidden group-hover:block" style={{ imageRendering: 'pixelated' }} alt="Logo Hover" onClick={() => navegar("/")} />
        </div>

        <div className='hidden sm:block'>
          <nav className='py-1 flex min-w-80 flex-1 min-h-18 flex-wrap items-center content-center gap-2 *:bg-principal *:text-fondo-especial-1 *:hover:bg-resaltado *:p-2 *:hover:underline *:transition-all *:duration-100 *:hover:scale-y-120'>
            {enlaces()}
          </nav>
        </div>
        {menuAbierto && (
          <div className="bg-fondo-especial-2 sm:hidden scale-130 translate-y-13 absolute items-start top-16 right-4 z-50 flex flex-col gap-1 md:hidden p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-2 *:w-full *:text-left" onClick={() => setMenuAbierto(false)}>
              {enlaces()}
            </div>
          </div>
        )}
        <div className={`block sm:hidden transition-all duration-200 cursor-pointer z-40 ml-auto ${menuAbierto ? 'bg-resaltado scale-80' : 'bg-principal scale-100'} p-1`}>
          <button className='z-500 pr-1 translate-y-0.5 inline-block' onClick={(e) => {
            e.preventDefault();
            setMenuAbierto(!menuAbierto);
          }}><Icono numero={25} color="var(--color-fondo1)" tamagno={16} /></button>
        </div>
        <div className='text-right sm:m-0 mr-4 sm:ml-auto'>
          {usuario ? (
            <span className="usuario-cabecera cursor-pointer min-w-fit w-max whitespace-nowrap flex bg-principal text-fondo-especial-1 fuente2 text-lg! hover:bg-resaltado hover:underline transition-all duration-100 hover:scale-x-110">
              <img className='w-8 h-8' src={(typeof usuario === 'object' && usuario) ? usuario!.urlFoto! : PUBLIC_URL + '/nopfp.png'} alt="" onClick={() => navegar("/user")} />
              <BotonNavegacion cabecera={true} direccion={"/user"} titulo={(typeof usuario === 'object' && usuario !== null) ? usuario?.nickname : "User"} />
            </span>
          ) : <div className='block text-center'>
            <div className={`my-1 mt-4 usuario-cabecera min-w-fit whitespace-nowrap flex bg-principal text-fondo-especial-1 fuente2 text-lg! hover:bg-resaltado hover:underline transition-all duration-100 hover:scale-x-110 ${((slug.pathname.includes('/register')) ? 'bg-resaltado! text-fondo1' : '')}`}>
              <BotonNavegacion cabecera={true} direccion={"/register"} titulo={traduccion("titulosHtml", "register")} >
                <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={1} color={`var(--color-fondo1)`} /></span>
              </BotonNavegacion>
            </div>
            <div className={`my-1 usuario-cabecera min-w-fit whitespace-nowrap flex bg-principal text-fondo-especial-1 fuente2 text-lg! hover:bg-resaltado hover:underline transition-all duration-100 hover:scale-x-110 ${((slug.pathname.includes('/login')) ? 'bg-resaltado! text-fondo1' : '')}`}>
              <BotonNavegacion cabecera={true} direccion={"/login"} titulo={traduccion("titulosHtml", "login")} >
                <span className='pr-1 translate-y-0.5 inline-block'><Icono numero={2} color={`var(--color-fondo1)`} /></span>
              </BotonNavegacion>
            </div>
          </div>}
          <div id="cambiar-idioma *:block ml-auto">
            <select name="selector-idioma" id="selector-idioma" className='cursor-pointer'>
              <option value={idiomaActual}>{idiomaActual}</option>
              {idiomasAdmitidos?.map((e, i) => {
                if (e !== idiomaActual) return (<option key={i} value={e} onChange={() => handlerCambiarIdioma(e)} onClick={() => handlerCambiarIdioma(e)}>{e}</option>)
              })}
            </select>
          </div>
        </div>
        
      </header>
    </>
  )
}

export default Cabecera;
//0123456789. ;;; 