
interface ImagenProps {
    imagen: any;
    tamagno?: number;
    alterno?: string;
}

function Imagen({ imagen, tamagno, alterno }: ImagenProps) {

    return (
        <>
            <img src={imagen ?? '#'} alt={alterno ?? ''} className={`h-auto w-${tamagno ?? 'max'}`} style={{width: tamagno ?? 'auto', height: 'auto'}} />
        </>
    )
}

export default Imagen;
