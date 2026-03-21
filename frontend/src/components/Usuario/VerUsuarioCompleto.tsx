/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import useApiUsuarios from '../../hooks/api/useApiUsuarios';
import useIdioma from '../../hooks/useIdioma';
import useSesion from '../../hooks/useSesion';
import { Usuario } from '../../types/Usuario';
import CajaError from '../Elements/CajaError';
import EnlaceFuncion from '../Elements/EnlaceFuncion';
import ImgCargando from '../Principal/ImgCargando';
import TarjetaUsuarioGrande from './TarjetaUsuarioGrande';

interface VerUsuarioCompletoProps {
  id: string;
}

/**
 * Componente para cargar los datos de un usuario a partir de un id
 * @param id del usuario
 */
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
  const traduccion = useIdioma();

  const cargaInicial = useCallback(async () => {
    if (!id && !usuario) {
      setFallo(true);
    } else {
      if (idUsuario === id || nicknameUsuario === id || (!id && idUsuario)) {
        setSoyYo(true);
        setUsuarioCargado(usuario! as Partial<Usuario>);
        setUsuarioEsPremium(premium);
      } else {
        const usuarioAjeno = await verUsuario(id);
        if (usuarioAjeno?.fallo) {
          setFallo(usuarioAjeno);
          return;
        }
        setUsuarioCargado({...usuarioAjeno, correo: "", contrasegna: "", cumpleagnos: "", disponibilidad: "", premiumExpirationDate: undefined});
        setUsuarioEsPremium(await verPremium(usuarioAjeno.id));
      }
    }
  }, []);
  useEffect(() => {
    cargaInicial();
  }, [id]);

  return (
    <>
      {idBuscar ? (<div>
        {(fallo || error) ? (<>
          <CajaError nombre="usuarioNoEncontrado" />
          <EnlaceFuncion titulo={traduccion("botones", "irInicio")} funcion="/" />
        </>) : (<div>
          {(usuarioCargado && !cargando) ? (<div className="ver-usuario">
            <TarjetaUsuarioGrande usuario={usuarioCargado} soyYo={soyYo} esPremium={usuarioEsPremium} />
          </div>) : (<ImgCargando />)}
        </div>)}
      </div>) : (<CajaError nombre="usuarioNoEncontrado" />)}
    </>
  )
}

export default VerUsuarioCompleto;
