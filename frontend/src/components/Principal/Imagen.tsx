
interface ImagenProps {
    imagen: any;
    tamagno?: number;
    alterno?: string;
}

function Imagen({ imagen, tamagno, alterno }: ImagenProps) {

    return (
        <>
            <img src={imagen ?? '#'} alt={alterno ?? ''} className={`h-auto ${tamagno ? "w-" + tamagno : 'w-max'}`} style={{width: tamagno ?? 'auto', height: 'auto'}} />
        </>
    )
}

export default Imagen;
