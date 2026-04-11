import { useController } from "react-hook-form";
import useIdioma from "../../hooks/useIdioma";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import InputBasico from "../Elements/InputBasico";

/**
 * Indicador de paginado, se usa con react-hook-form, se puede elegir a mano o usar botones de atajo
 * @param control usado por ract-hook-form
 * @param setValue usado por react-hook-form
 * @param nombre del valor de la propiedad del form
 */
function IndicadorPagina({ control, setValue, nombre = "pagina" }: { control: any, setValue: any, nombre?: string }) {
    const traduccion = useIdioma();
    const { field } = useController({
        name: nombre ?? "pagina",
        control,
        defaultValue: 0,
        rules: { min: 0 }
    });

    const cambiarValor = (delta: number) => {
        const nuevo = Math.max(0, (Number(field.value) || 0) + delta);
        setValue(nombre, nuevo, { shouldDirty: true, shouldValidate: true, shouldTouch: true });
    };

    return (
        <span>
            <InputBasico
                placeholder={0}
                ancho='2'
                nombre="pagina"
                titulo={traduccion("formularios", "pagina")}
                inline={true}
                tipo="number"
                objetoHook={field}
                iconoA={8}
            >
                <span className="mr-2 font-black"><EnlaceFuncion titulo="-10" funcion={() => cambiarValor(-10)} subrallado={false} color={1} /></span>
                <span className="mr-2 font-black"><EnlaceFuncion titulo="-1" funcion={() => cambiarValor(-1)} subrallado={false} color={1} /></span>
                <span className="mr-2 font-black"><EnlaceFuncion titulo="=0" funcion={() => setValue("pagina", 0, { shouldDirty: true })} subrallado={false} color={1} /></span>
            </InputBasico>
            <span className="mr-2 font-black"><EnlaceFuncion titulo="+1" funcion={() => cambiarValor(1)} subrallado={false} color={1} /></span>
            <span className="font-black"><EnlaceFuncion titulo="+10" funcion={() => cambiarValor(10)} subrallado={false} color={1} /></span>
        </span>
    );
}

export default IndicadorPagina;