import useIdioma from "../../hooks/useIdioma";
import useSesion from "../../hooks/useSesion";

interface FormValues {

}

interface FormularioAdicionesProps {
  id: string;
  adicionesPrevias: Array<Record<string, any>> | null;
}


function FormularioAdiciones({ id, adicionesPrevias }: FormularioAdicionesProps) {

  const { premium } = useSesion();
  const traduccion = useIdioma();


  return (
    <div>
        EDITAR ADICIONES EEIJAOIDFASDOPIFUAYHSDFHL
    </div>
  );
}

export default FormularioAdiciones;
