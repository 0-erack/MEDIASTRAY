
import BotonFuncion from '../components/Elements/BotonFuncion.js';
import EnlaceFuncion from '../components/Elements/EnlaceFuncion.js';
import Titulo from '../components/Elements/Titulo.js';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Settings() {

  useTituloDinamico("settings");

  return (
    <>
      <Titulo magnitud={2}>Settings</Titulo>
      <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={true} tipo={0} />
      <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={false} tipo={0} />
        <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={true} tipo={1} />
      <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={false} tipo={1} />
        <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={true} tipo={2} />
      <BotonFuncion titulo="asdlfd" funcion={() => {}} hueco={false} tipo={2} />
      <br />
      <EnlaceFuncion titulo="asdlfd" funcion={() => {}} />
    </>
  )
}

export default Settings;