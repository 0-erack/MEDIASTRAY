
import { memo } from 'react';
import EnlaceFuncion from '../components/Elements/EnlaceFuncion';
import Titulo from '../components/Elements/Titulo';
import Icono from '../components/Principal/Icono';
import useAjustes from '../hooks/useAjustes';
import useIdioma from '../hooks/useIdioma';
import useTituloDinamico from '../hooks/useTituloDinamico';

/**
 * Pagina de informacion sobre Mediastray
 */
const Info = memo(function Info() {

  useTituloDinamico("info");
  const traduccion = useIdioma();
  const { PUBLIC_URL } = useAjustes();

  return (<>
    <Titulo><Icono numero={6} tamagno={16} color="var(--color-resaltado)" /> {traduccion("titulos", "info")}</Titulo>
    <div className='text-center *:m-5 text-lg'>
      <p>{traduccion("parrafos", "info1")}</p>
      <p>{traduccion("parrafos", "info2")}</p>
      <p>{traduccion("parrafos", "info3")}</p>
      <p>{traduccion("parrafos", "info4")}</p>
      <p >
        <span><EnlaceFuncion titulo={traduccion("parrafos", "infoEnlace1")} funcion="/docs" /></span><wbr />
        <span><EnlaceFuncion pestagna='_blank' titulo={traduccion("parrafos", "infoEnlace2")} funcion="https://github.com/0-erack/MEDIASTRAY" /></span><wbr />
        <span><EnlaceFuncion pestagna='_blank' titulo={traduccion("parrafos", "infoEnlace3")} funcion="https://mit-license.org/" /></span>
      </p>
      <div>
        <img className='relative z-10 sm:w-5xl w-lg m-auto mt-5' src={PUBLIC_URL + "/LogoE.png"} alt="Logo" style={{ imageRendering: 'pixelated' }} />
      </div>
    </div>
    <div className='text-left m-0 p-0'>
      <Titulo magnitud={3}><Icono numero={8} tamagno={16} color="var(--color-resaltado)" /> {traduccion("parrafos", "infoNormas1")}</Titulo>
    </div>
    <div className='text-lg mb-5 text-center'>
      <p>{traduccion("parrafos", "infoNormas2")}</p>
    </div>
    <div className='text-info1 text-left m-0 p-0'>
      <Titulo magnitud={3}><Icono numero={7} tamagno={16} color="var(--color-info1)" /> {traduccion("parrafos", "infoPremium1")}</Titulo>
    </div>
    <div className='text-lg mb-5'>
      <p className='text-center'>{traduccion("parrafos", "infoPremium2")}</p>
      <ul className='list-disc pl-20 *:my-4'>
        <li>{traduccion("parrafos", "infoPremium3")}</li>
        <li>{traduccion("parrafos", "infoPremium4")}</li>
        <li>{traduccion("parrafos", "infoPremium5")}</li>
        <li>{traduccion("parrafos", "infoPremium6")}</li>
        <li>{traduccion("parrafos", "infoPremium7")}</li>
        <li>{traduccion("parrafos", "infoPremium8")}</li>
        <li>{traduccion("parrafos", "infoPremium9")}</li>
        <li>{traduccion("parrafos", "infoPremium10")}</li>
      </ul>
      <p><EnlaceFuncion titulo={traduccion("parrafos", "infoPremium11")} funcion="/magna" /></p>
    </div>
  </>
  )
});

export default Info;