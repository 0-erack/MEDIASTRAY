import logo from '../../assets/images/LogoC.png';
import useAjustes from '../../hooks/useAjustes';
import useIdioma from '../../hooks/useIdioma';

function Pie() {
  
  const { PUBLIC_URL } = useAjustes();
  const traduccion = useIdioma();

  return (
    <>
        <footer className="bg-fondo2 text-fondo-especial-2 min-h-20 flex py-3 px-1 sm:px-10">
          <div><img className='h-auto w-70 pr-5' style={{ imageRendering: 'pixelated' }} src={logo ?? PUBLIC_URL + '/LogoC.png'} alt="MEDIASTRAY" /></div>
          <div className='html-container' dangerouslySetInnerHTML={{__html: traduccion("parrafos", "footer")}} />
        </footer>
    </>
  )
}

export default Pie;
