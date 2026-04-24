
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PanelAdministracion from '../components/Admin/PanelAdministracion.js';
import Titulo from '../components/Elements/Titulo.js';
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

  useEffect(() => {
    if (!esAdmin || !usuario) navegar("/");
  }, []);

  return (
    <>
      <Titulo magnitud={2}>{traduccion("botones", "panelAdmin")}</Titulo>
      <PanelAdministracion />
    </>
  )
});

export default PaginaAdmin;