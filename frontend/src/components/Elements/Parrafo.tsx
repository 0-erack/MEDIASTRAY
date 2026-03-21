import { memo } from "react";

interface ParrafoProps {
    children?: React.ReactNode|string;
}

/**
 * Parrafo sencillo general
 * @param children
 */
const Parrafo = memo(function Parrafo({children}: ParrafoProps) {

  return (
    <p>
      {children ?? ''}
    </p>
  );
})

export default Parrafo;
