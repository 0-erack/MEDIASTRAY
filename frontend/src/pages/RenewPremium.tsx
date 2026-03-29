
import { memo } from 'react';
import Titulo from '../components/Elements/Titulo';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina para comprar premium
 */
const RenewPremium = memo(function RenewPremium() {

  useTituloDinamico("renovar");

  return (
    <>
      <Titulo>renovar</Titulo>
    </>
  )
});

export default RenewPremium;