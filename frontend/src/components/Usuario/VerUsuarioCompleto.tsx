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

  const { usuario, premium } = useSesion();
  const [usuarioEsPremium, setUsuarioEsPremium] = useState(false);
  const idUsuario = (typeof usuario === 'object' && usuario) ? usuario!.id! : '';
  const nicknameUsuario = (typeof usuario === 'object' && usuario) ? usuario!.nickname! : '';
  const [usuarioCargado, setUsuarioCargado] = useState<Partial<Usuario>|null>(null);
  const idBuscar = id ?? (idUsuario ?? 'x');
  const [soyYo, setSoyYo] = useState(false);
  const { verUsuario, cargando, error, verPremium } = useApiUsuarios();
  const [fallo, setFallo] = useState(false);

  const cargaInicial = async () => {
    if (!id && !usuario) {
      setFallo(true);
    } else {
      if (idUsuario === id || nicknameUsuario === id || (!id && idUsuario)) {
        setSoyYo(true);
        setUsuarioCargado(usuario! as Partial<Usuario>);
        setUsuarioEsPremium(premium);
      } else {
        const usuarioAjeno = await verUsuario(id);
        setUsuarioCargado({...usuarioAjeno, correo: "", contrasegna: "", cumpleagnos: "", disponibilidad: "", premiumExpirationDate: undefined});
        setUsuarioEsPremium(await verPremium(usuarioAjeno.id));
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
            <TarjetaUsuarioGrande usuario={usuarioCargado} soyYo={soyYo} esPremium={usuarioEsPremium} />
          </div>) : (<ImgCargando />)}
        </div>)}
      </div>) : (<CajaError nombre="usuarioNoEncontrado" />)}
    </>
  )
}

export default VerUsuarioCompleto;
