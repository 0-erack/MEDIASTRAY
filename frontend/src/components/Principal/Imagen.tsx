import { memo } from "react";

interface ImagenProps {
    imagen: any;
    tamagno?: number;
    alterno?: string;
}

/**
 * Componente unificado general para mostrar una imagen
 * @param imagen a mostrar
 * @param tamagno de la imagen
 * @param alterno propiedad alt
 */
const Imagen = memo(function Imagen({ imagen, tamagno, alterno }: ImagenProps) {

    return (
        <>
            <img src={imagen ?? '#'} alt={alterno ?? ''} className={`h-auto ${tamagno ? "w-" + tamagno : 'w-max'}`} style={{width: tamagno ?? 'auto', height: 'auto'}} />
        </>
    )
})

export default Imagen;
