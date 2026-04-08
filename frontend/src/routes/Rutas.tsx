import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ImgCargando from '../components/Principal/ImgCargando';
const ViewGame = lazy(() => import('../pages/ViewGame'));
const RenewPremium = lazy(() => import('../pages/RenewPremium'));
const CreateGame = lazy(() => import('../pages/CreateGame'));
const ViewUser = lazy(() => import('../pages/ViewUser'));
const Browse = lazy(() => import('../pages/Browse'));
const ErrorNotFound = lazy(() => import('../pages/ErrorNotFound'));
const FeaturedForums = lazy(() => import('../pages/FeaturedForums'));
const FeaturedGames = lazy(() => import('../pages/FeaturedGames'));
const Info = lazy(() => import('../pages/Info'));
const Inicio = lazy(() => import('../pages/Inicio'));
const InicioDocumentacion = lazy(() => import('../pages/InicioDocumentacion'));
const Login = lazy(() => import('../pages/Login'));
const Logout = lazy(() => import('../pages/Logout'));
const Premium = lazy(() => import('../pages/Premium'));
const Register = lazy(() => import('../pages/Register'));
const Settings = lazy(() => import('../pages/Settings'));

/**
 * Las distintas rutas de la aplicacion
 */
function Rutas() {

  return (
    <Suspense fallback={<ImgCargando />}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/info" element={<Info />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/featuredGames" element={<FeaturedGames />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/featuredForums" element={<FeaturedForums />} />
        <Route path="/magna" element={<Premium />} />
        <Route path="/renewMagna" element={<RenewPremium />} />
        <Route path="/docs">
          <Route index element={<InicioDocumentacion />} />

        </Route>
        {/*<Route path="/user" element={<ViewUser />} />*/}
        <Route path="/user/:id" element={<ViewUser />} />
        <Route path="/user" element={<ViewUser />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/game/:id" element={<ViewGame />} />
        <Route path="/createGame" element={<CreateGame />} />
        <Route path="/error" element={<ErrorNotFound />} />
        <Route path="/*" element={<ErrorNotFound />} />
      </Routes>
    </Suspense>
  )
}

export default Rutas;