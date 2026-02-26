/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import TarjetaUsuarioGrande from './TarjetaUsuarioGrande.jsx';
import useAjustes from '../../hooks/useAjustes.js';
import useApi from '../../hooks/useApi.js';
import ImgCargando from '../Principal/ImgCargando.jsx';
import CajaError from '../Principal/CajaError.jsx';

function VerUsuarioCompleto(props) {

  const { usuarioActual } = useAjustes();
  const [usuarioCargado, setUsuarioCargado] = useState({});
  const uuidBuscar = props.id ?? usuarioActual.uuid;
  const [soyYo, setSoyYo] = useState(false);
  const { verUsuario, cargando, error } = useApi();
  const [fallo, setFallo] = useState(false);

  const cargaInicial = async () => {
    if (!props.id && !usuarioActual.uuid) {
      setFallo(true);
    } else {
      if (usuarioActual.uuid === props.id || usuarioActual.nickname === props.id || (!props.id && usuarioActual.uuid)) {
        setSoyYo(true);
        setUsuarioCargado(usuarioActual);
      } else {
        const usuarioAjeno = await verUsuario(props.id);
        setUsuarioCargado({...usuarioAjeno, correo: "", contrasegna: "", cumpleagnos: "", disponibilidad: ""});
      }
    }
  }
  useEffect(() => {
    cargaInicial();
  }, [props.id]);

  return (
    <>
      {uuidBuscar ? (<div>
        {(fallo || error) ? (<CajaError nombre="usuarioNoEncontrado" />) : (<div>
          {(usuarioCargado.uuid && !cargando) ? (<div className="ver-usuario">
            <TarjetaUsuarioGrande usuario={usuarioCargado} soyYo={soyYo} />
          </div>) : (<ImgCargando />)}
        </div>)}
      </div>) : (<CajaError nombre="usuarioNoEncontrado" />)}
    </>
  )
}

export default VerUsuarioCompleto;
