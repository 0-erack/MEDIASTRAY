
import BotonNavegacion from '../Elements/BotonNavegacion';
import imgLogo from '../../assets/images/logoA.png';
import { useNavigate } from 'react-router-dom';
import './Cabecera.css';
import EnlaceFuncion from '../Elements/EnlaceFuncion';
import { cambiarIdiomaHtml } from '../../libraries/accionesIndex';
import useAjustes from '../../hooks/useAjustes';

function Cabecera() {
  
  const { idiomaActual, idiomasAdmitidos, cambiarIdiomaActual, usuarioActual, textosInterfazEnlacesCabecera, PUBLIC_URL } = useAjustes();
  const navegar = useNavigate();
  //usuarioActual.id = "si"; usuarioActual.nickname = "sisisi";
  return (
    <>
        <header id="cabecera">
          {usuarioActual.id}
            <img id="logo-cabecera" src={imgLogo ?? PUBLIC_URL + "/logoA.png"} alt="MEDIASTRAY" onClick={()=>{navegar("/")}} />
            {textosInterfazEnlacesCabecera[(usuarioActual.id ? "si" : "no") + "Usuario"][idiomaActual]?.map((e:any, i:number) => {
              return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} />)
            })}
            {textosInterfazEnlacesCabecera[idiomaActual]?.map((e:any, i:number) => {
              return (<BotonNavegacion key={i} cabecera={true} direccion={e.direccion} titulo={e.titulo} />)
            })}
            {usuarioActual.id ? (
              <span className="usuario-cabecera">
                <BotonNavegacion cabecera={true} direccion={"/user"} titulo={usuarioActual.nickname ?? "User"} />
              </span>
            ) : ""}
            <span id="cambiar-idioma">
              {idiomasAdmitidos?.map((e, i) => {
                if (e !== idiomaActual) return (<EnlaceFuncion key={i} cabecera={true} titulo={e} funcion={() => {
                  cambiarIdiomaActual(e);
                  cambiarIdiomaHtml((e[0]+e[1]).toLowerCase());
                }}/>)
              })}
            </span>
        </header>
    </>
  )
}

export default Cabecera;
