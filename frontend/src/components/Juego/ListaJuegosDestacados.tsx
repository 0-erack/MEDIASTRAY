import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiJuegos from "../../hooks/api/useApiJuegos";
import useIdioma from "../../hooks/useIdioma";
import IndicadorPagina from "../Busqueda/IndicadorPagina";
import CajaError from "../Elements/CajaError";
import ImgCargando from "../Principal/ImgCargando";
import TarjetaJuego from "./TarjetaJuego";

interface ListaJuegosDestacadosProps {
  infinito?: boolean;
}

interface FormValues {
  pagina: number;
}

/**
 * Componente para mostrar los juegos destacados
 * @param infinito si en lugar de mostrar los juegos paginados se aplica un scroll infinito
 */
function ListaJuegosDestacados({ infinito = false }: ListaJuegosDestacadosProps) {
  const [juegosCargados, setJuegosCargados] = useState<Array<Record<string, any>> | null>(null);
  const [hayMas, setHayMas] = useState(true);
  const [paginaInfinita, setPaginaInfinita] = useState(0);
  const { verJuegosDestacados, cargando } = useApiJuegos();
  const traduccion = useIdioma();
  const formBase: FormValues = { pagina: 0 };
  const { control, watch, setValue } = useForm<FormValues>({ defaultValues: formBase });
  const datos = watch();

  const cargaJuegos = async (pagina = 0) => {
    const resultado = await verJuegosDestacados(pagina) ?? [];
    setJuegosCargados(resultado);
    setHayMas(resultado.length > 0);
  }

  const cargarMas = async () => {
    if (cargando || !hayMas) return;
    const nuevaPagina = paginaInfinita + 1;
    const resultado = await verJuegosDestacados(nuevaPagina) ?? [];
    if (resultado.length === 0) {
      setHayMas(false);
      return;
    }
    setPaginaInfinita(nuevaPagina);
    setJuegosCargados(prev => [...(prev ?? []), ...resultado]);
  }

  useEffect(() => {
    cargaJuegos();
  }, []);

  useEffect(() => {
    if (!infinito) cargaJuegos(datos.pagina);
  }, [datos.pagina]);

  useEffect(() => {
    if (!infinito) return;
    const handleScroll = () => {
      const cercaDelFinal = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (cercaDelFinal) cargarMas();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infinito, cargando, hayMas, paginaInfinita]);

  return (
    <div className="mr-4 pr-4">
      {cargando && (<ImgCargando />)}
      {!infinito && (<IndicadorPagina control={control} setValue={setValue} />)}
      {juegosCargados ? (<div className="*:border *:border-principal *:m-2 *:my-4">
        {juegosCargados.map((e, i) => (
          <TarjetaJuego key={i} juego={e} mediano={true} />
        ))}
      </div>) : (<CajaError>{traduccion("errores", "noHayJuegos")}</CajaError>)}
      {(!infinito && juegosCargados?.length != 0) && (<IndicadorPagina control={control} setValue={setValue} />)}
      {(infinito && !hayMas) && (<p className="text-center">{traduccion("errores", "noHayMasJuegos")}</p>)}
    </div>
  );
}

export default ListaJuegosDestacados; 
