import './App.css';
import Cabecera from './components/Principal/Cabecera';
import Pie from './components/Principal/Pie';
import AjustesProvider from './contexts/AjustesProvider';
import MensajesProviders from './contexts/MensajesProvider';
import { SesionProvider } from './contexts/SesionProvider';
import Contenido from './routes/Contenido';

function App() {


  return (
    <>
      <MensajesProviders>
        <div className="min-h-screen flex flex-col bg-fondo-especial-1 *:text-principal">
          <AjustesProvider>
            <SesionProvider>
              <Cabecera />
              <div className="flex-1 bg-fondo1 mx-0 lg:mx-10 sm:mx-2">
                <Contenido />
              </div>
            </SesionProvider>
            <Pie />
          </AjustesProvider>
        </div>
      </MensajesProviders>
    </>
  )
}

export default App
