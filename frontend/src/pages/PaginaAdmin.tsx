
import { memo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelAdministracion from '../components/Admin/PanelAdministracion.js';
import Titulo from '../components/Elements/Titulo.js';
import Icono from '../components/Principal/Icono.js';
import useIdioma from '../hooks/useIdioma.js';
import useSesion from '../hooks/useSesion.js';
import useTituloDinamico from '../hooks/useTituloDinamico.js';

/**
 * Pagina de administracion
 */
const PaginaAdmin = memo(function PaginaAdmin() {

  const traduccion = useIdioma();
  const { esAdmin, usuario } = useSesion();
  const navegar = useNavigate();
  useTituloDinamico("","ADMIN");
  const {id} = useParams();

  useEffect(() => {
    if (!esAdmin || !usuario) navegar("/");
  }, []);

  return (
    <>
      <Titulo magnitud={2}><Icono numero={13} tamagno={16} color="var(--color-resaltado)" /> {traduccion("botones", "panelAdmin")}</Titulo>
      <PanelAdministracion id={id ?? ''} />
    </>
  )
});

export default PaginaAdmin;