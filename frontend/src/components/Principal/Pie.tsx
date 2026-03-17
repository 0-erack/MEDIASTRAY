import logo from '../../assets/images/LogoC.png';
import useAjustes from '../../hooks/useAjustes';
import useIdioma from '../../hooks/useIdioma';

function Pie() {
  
  const { PUBLIC_URL } = useAjustes();
  const traduccion = useIdioma();

  return (
    <>
        <footer className="bg-fondo2 text-fondo-especial-2 min-h-20 text-center items-center">
          <span><img src={logo ?? PUBLIC_URL + '/LogoC.png'} alt="MEDIASTRAY" /></span>
          <span className='html-container' dangerouslySetInnerHTML={{__html: traduccion("parrafos", "footer")}} />
        </footer>
    </>
  )
}

export default Pie;
