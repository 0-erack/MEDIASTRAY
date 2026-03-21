import { useController } from "react-hook-form";
import useIdioma from "../../hooks/useIdioma";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import InputBasico from "../Elements/InputBasico";

function IndicadorPagina({ control, setValue }: { control: any, setValue: any }) {
    const traduccion = useIdioma();
    const { field } = useController({
        name: "pagina",
        control,
        defaultValue: 0,
        rules: { min: 0 }
    });

    const cambiarValor = (delta: number) => {
        const nuevo = Math.max(0, (Number(field.value) || 0) + delta);
        setValue("pagina", nuevo, { shouldDirty: true });
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