/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import TarjetaUsuarioGrande from './TarjetaUsuarioGrande';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import ImgCargando from '../Principal/ImgCargando';
import CajaError from '../Principal/CajaError';
import useSesion from '../../hooks/useSesion';
import { Usuario } from '../../types/Usuario';

interface VerUsuarioCompletoProps {
  id: string;
}

function VerUsuarioCompleto({ id }: VerUsuarioCompletoProps) {

  const { usuario } = useSesion();
  const [usuarioCargado, setUsuarioCargado] = useState<Partial<Usuario>|null>(null);
  const idBuscar = id ?? (usuario?.id ?? '');
  const [soyYo, setSoyYo] = useState(false);
  const { verUsuario, cargando, error } = useApiUsuarios();
  const [fallo, setFallo] = useState(false);

  const cargaInicial = async () => {
    if (!id && !usuario) {
      setFallo(true);
    } else {
      if (usuario!?.id === id || usuario!?.nickname === id || (!id && usuario!?.id)) {
        setSoyYo(true);
        setUsuarioCargado(usuario!);
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
      {idBuscar ? (<div>
        {(fallo || error) ? (<CajaError nombre="usuarioNoEncontrado" />) : (<div>
          {(usuarioCargado && !cargando) ? (<div className="ver-usuario">
            <TarjetaUsuarioGrande usuario={usuarioCargado} soyYo={soyYo} />
          </div>) : (<ImgCargando />)}
        </div>)}
      </div>) : (<CajaError nombre="usuarioNoEncontrado" />)}
    </>
  )
}

export default VerUsuarioCompleto;
