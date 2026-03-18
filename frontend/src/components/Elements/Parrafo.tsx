interface ParrafoProps {
    children?: React.ReactNode|string;
}

function Parrafo({children}: ParrafoProps) {

  return (
    <p>
      {children ?? ''}
    </p>
  );
}

export default Parrafo;
