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
              <div className="flex justify-center w-full">

                <div className="w-full max-w-[1440px] bg-fondo1 min-h-screen px-2 lg:px-10">
                  <Contenido />
                </div>

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
