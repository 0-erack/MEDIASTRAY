/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import TarjetaUsuarioGrande from './TarjetaUsuarioGrande';
import useAjustes from '../../hooks/useAjustes';
import useApi from '../../hooks/useApi';
import ImgCargando from '../Principal/ImgCargando';
import CajaError from '../Principal/CajaError';

interface VerUsuarioCompletoProps {
  id: string;
}

function VerUsuarioCompleto({ id }: VerUsuarioCompletoProps) {

  const { usuarioActual } = useAjustes();
  const [usuarioCargado, setUsuarioCargado] = useState({uuid: null});
  const uuidBuscar = id ?? usuarioActual.uuid;
  const [soyYo, setSoyYo] = useState(false);
  const { verUsuario, cargando, error } = useApi();
  const [fallo, setFallo] = useState(false);

  const cargaInicial = async () => {
    if (!id && !usuarioActual.uuid) {
      setFallo(true);
    } else {
      if (usuarioActual.uuid === id || usuarioActual.nickname === id || (!id && usuarioActual.uuid)) {
        setSoyYo(true);
        setUsuarioCargado(usuarioActual);
      } else {
        const usuarioAjeno = await verUsuario(id);
        setUsuarioCargado({...usuarioAjeno, correo: "", contrasegna: "", cumpleagnos: "", disponibilidad: ""});
      }
    }
  }
  useEffect(() => {
    cargaInicial();
  }, [id]);

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
