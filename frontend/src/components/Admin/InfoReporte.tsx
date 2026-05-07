import { memo, useMemo } from "react";
import useIdioma from "../../hooks/useIdioma";
import { timestampAFecha } from "../../libraries/extraFechas";
import BotonFuncion from "../Elements/BotonFuncion";
import EnlaceFuncion from "../Elements/EnlaceFuncion";
import Icono from "../Principal/Icono";

interface InfoReporteProps {
  reporte: Record<string, any>;
  funcionEliminar: (id: string) => Promise<void>;
}

/**
 * Representacion de un reporte
 */
const InfoReporte = memo(function InfoReporte({ reporte, funcionEliminar }: InfoReporteProps) {

  const ruta = useMemo(() =>
    reporte.type === "comment" ? "" : ("/" + reporte.type + "/" + reporte.idReportee),
    [reporte.type, reporte.idReportee]);
  const traduccion = useIdioma();

  return (
    <div className="border p-2 m-3 border-principal">
      <p className="*:mx-1">
        <Icono numero={11} color="var(--color-principal)" /> {reporte.type} <EnlaceFuncion color={1} titulo={reporte.idReportee} funcion={ruta} />
        <Icono numero={1} color="var(--color-principal)" /> {reporte.idReporter ? (<EnlaceFuncion color={1} titulo={reporte.idReporter} funcion={"/user/" + reporte.idReporter} />) : (traduccion("palabras", "anonimo"))}
      </p>
      <p>{timestampAFecha(reporte.fecha)}: {reporte.text ?? "N/A"}</p>
      <BotonFuncion tipo={2} funcion={() => { funcionEliminar(reporte.id) }} titulo={traduccion("botones", "eliminar")}><Icono color="var(--color-principal)" numero={10} /></BotonFuncion>
    </div>
  )
});

export default InfoReporte;
