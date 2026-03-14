import './App.css';
import Contenido from './routes/Contenido';
import Cabecera from './components/Principal/Cabecera';
import Pie from './components/Principal/Pie';
import AjustesProvider from './contexts/AjustesProvider';
import MensajesProviders from './contexts/MensajesProvider';
import { SesionProvider } from './contexts/SesionProvider';

function App() {


  return (
    <>
      <MensajesProviders>
        <AjustesProvider>
          <SesionProvider>
            <Cabecera />
            <Contenido />
          </SesionProvider>
          <Pie />
        </AjustesProvider>
      </MensajesProviders>
    </>
  )
}

export default App
