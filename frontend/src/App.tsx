import './App.css';
import Contenido from './routes/Contenido';
import Cabecera from './components/Principal/Cabecera';
import Pie from './components/Principal/Pie';
import AjustesProvider from './contexts/AjustesProvider';
import MensajesProviders from './contexts/MensajesProvider';

function App() {
  

  return (
    <>
      <AjustesProvider>
        <MensajesProviders>
          <Cabecera />
          <Contenido />
        </MensajesProviders>
        <Pie />
      </AjustesProvider>
    </>
  )
}

export default App
