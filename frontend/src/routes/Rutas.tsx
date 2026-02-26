import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inicio from '../pages/Inicio.jsx';
import ErrorNotFound from '../pages/ErrorNotFound.jsx';
import Info from '../pages/Info.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ViewUser from '../pages/ViewUser.jsx';
import Settings from '../pages/Settings.jsx';
import Premium from '../pages/Premium.jsx';
import Logout from '../pages/Logout.jsx';
import FeaturedGames from '../pages/FeaturedGames.jsx';
import BrowseGames from '../pages/BrowseGames.jsx';
import FeaturedForums from '../pages/FeaturedForums.jsx';
import BrowseForums from '../pages/BrowseForums.jsx';
import BrowseUsers from '../pages/BrowseUsers.jsx';
import InicioDocumentacion from '../pages/InicioDocumentacion.jsx';


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
        <Route path="/browseGames" element={<BrowseGames />} />
        <Route path="/featuredForums" element={<FeaturedForums />} />
        <Route path="/browseForums" element={<BrowseForums />} />
        <Route path="/browseUsers" element={<BrowseUsers />} />
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