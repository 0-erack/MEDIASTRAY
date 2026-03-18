import logo from '../../assets/images/LogoD.png';
import useAjustes from '../../hooks/useAjustes';
import useIdioma from '../../hooks/useIdioma';

function Pie() {
  
  const { PUBLIC_URL } = useAjustes();
  const traduccion = useIdioma();

  return (
    <>
        <footer className="bg-fondo2 text-fondo-especial-2 min-h-20 block lg:flex py-3 px-1 sm:px-10">
          <div className='html-container mr-2' dangerouslySetInnerHTML={{__html: traduccion("parrafos", "footer")}} />
          <div className='pt-2 mx-auto text-center lg:mx-0'><img className='h-auto w-70 pr-5' style={{ imageRendering: 'pixelated' }} src={logo ?? PUBLIC_URL + '/LogoD.png'} alt="MEDIASTRAY" /></div>
        </footer>
    </>
  )
}

export default Pie;
