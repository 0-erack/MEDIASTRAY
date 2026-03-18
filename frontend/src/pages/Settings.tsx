
import BotonFuncion from '../components/Elements/BotonFuncion.js';
import EnlaceFuncion from '../components/Elements/EnlaceFuncion.js';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

function Settings() {

  useTituloDinamico("settings");

  return (
    <>
      <h2>Settings</h2>
      <BotonFuncion titulo="asdlfd" funcion={() => {}} />
      <br />
      <EnlaceFuncion titulo="asdlfd" funcion={() => {}} />
    </>
  )
}

export default Settings;