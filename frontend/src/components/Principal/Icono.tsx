import atlas from '../../assets/images/iconos.png';

interface IconoProps {
    numero: number;
    tamagno?: number;
    color?: string;
}

function Icono({ numero, tamagno = 8, color = 'var(--color-resaltado)' }: IconoProps) {

    const TAMAGNO = 8;
    const LIMITE = 16;
    const ESCALA = (tamagno ?? 8) / 4;
    const x = numero % LIMITE;
    const TAMAGNO_ATLAS = 128;
    const y = Math.floor(numero / LIMITE);
    const imageUrl = atlas ?? `/public/iconos.png`;

    return (
        <>
            <span
            className={`inline-block rendering-pixelated min-w-${tamagno ?? 8} min-h-${tamagno ?? 8}`}
            style={{
                width: `${tamagno * 2}px`,
                height: `${tamagno * 2}px`,
                backgroundColor: color,
                
                // Using Mask to allow tinting
                WebkitMaskImage: `url(${imageUrl})`,
                maskImage: `url(${imageUrl})`,
                
                // Position the "stencil"
                WebkitMaskPosition: `-${x * TAMAGNO * ESCALA}px -${y * TAMAGNO * ESCALA}px`,
                maskPosition: `-${x * TAMAGNO * ESCALA}px -${y * TAMAGNO * ESCALA}px`,
                
                // Scale the "stencil"
                WebkitMaskSize: `${TAMAGNO_ATLAS * ESCALA}px ${TAMAGNO_ATLAS * ESCALA}px`,
                maskSize: `${TAMAGNO_ATLAS * ESCALA}px ${TAMAGNO_ATLAS * ESCALA}px`,
                
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                imageRendering: 'pixelated'
            }}
        />
        </>
    )
}

export default Icono;
