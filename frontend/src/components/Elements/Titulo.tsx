import { JSX, memo } from "react";

interface TituloProps {
    children?: React.ReactNode|string;
    magnitud?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Componente para mostrar un titulo
 * @param magnitud si es h1, h2, h3...
 * @param children
 */
const Titulo = memo(function Titulo({children, magnitud = 2}: TituloProps) {

  const Tag = `h${magnitud}` as keyof JSX.IntrinsicElements;
  const tamagno = ['text-6xl', 'text-5xl', 'text-4xl', 'text-3xl', 'text-2xl', 'text-xl'][magnitud];

  return (
    <Tag className={`fuente2 ${tamagno} m-4`}>
      {children ?? ''}
    </Tag>
  );
})

export default Titulo;
