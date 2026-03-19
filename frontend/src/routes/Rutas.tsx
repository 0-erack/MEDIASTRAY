
import { Route, Routes } from 'react-router-dom';
import Browse from '../pages/Browse';
import ErrorNotFound from '../pages/ErrorNotFound';
import FeaturedForums from '../pages/FeaturedForums';
import FeaturedGames from '../pages/FeaturedGames';
import Info from '../pages/Info';
import Inicio from '../pages/Inicio';
import InicioDocumentacion from '../pages/InicioDocumentacion';
import Login from '../pages/Login';
import Logout from '../pages/Logout';
import Premium from '../pages/Premium';
import Register from '../pages/Register';
import Settings from '../pages/Settings';
import ViewUser from '../pages/ViewUser';


function Rutas() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/info" element={<Info />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/featuredGames" element={<FeaturedGames />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/featuredForums" element={<FeaturedForums />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/docs">
          <Route index element={<InicioDocumentacion />} />

        </Route>
        {/*<Route path="/user" element={<ViewUser />} />*/}
        <Route path="/user/:id" element={<ViewUser />} />
        <Route path="/user" element={<ViewUser />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/error" element={<ErrorNotFound />} />
        <Route path="/*" element={<ErrorNotFound />} />
      </Routes>
    </>
  )
}

export default Rutas;