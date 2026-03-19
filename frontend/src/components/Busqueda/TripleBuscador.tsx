import { useState } from "react";
import { useForm } from 'react-hook-form';
import useIdioma from "../../hooks/useIdioma";
import InputBasico from "../Elements/InputBasico";
import Titulo from "../Elements/Titulo";

interface FormValues {
    busquedaActual: string;
}

function TripleBuscador() {

  const traduccion = useIdioma();
  const [datos, setDatos] = useState<FormValues|null>(null);
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>();

  const actualizar = async (data:FormValues) => {
    setDatos(data);
  }

  return (
    <span >
      <div>
        <form onChange={handleSubmit(actualizar)}>

            <input {...register("busquedaActual", {required: "Busca algo", minLength: {value: 1, message: "minimo 1"}})} />
            {errors.busquedaActual && <p className='text-error'>{errors.busquedaActual.message}</p>}
            <InputBasico nombre="busquedaActual" titulo={"adfasfsdf"} tipo="text" validador={() => true} objetoHook={register("busquedaActual", {required: "Busca algo", minLength: {value: 1, message: "minimo 1"}})} mensajeError={errors?.busquedaActual?.message ?? ''} />

            <button type="submit">enviar</button>
            {JSON.stringify(datos)}
        </form>
      </div>
      <div className="flex space-between">
        <div>
            <Titulo magnitud={3}>{traduccion("titulos", "parteUsuarios")}</Titulo>

        </div>
        <div>
            <Titulo magnitud={3}>{traduccion("titulos", "parteJuegos")}</Titulo>

        </div>
        <div>
            <Titulo magnitud={3}>{traduccion("titulos", "parteForos")}</Titulo>

        </div>
      </div>
    </span>
  );
}

export default TripleBuscador;
