import { useState } from "react";
import useIdioma from "../../hooks/useIdioma";
import { url } from "../../libraries/validacionesBackend";
import BotonFuncion from "../Elements/BotonFuncion";
import CajaError from "../Elements/CajaError";
import InputBasico from "../Elements/InputBasico";

function ImagesInputExtra({ index, setValue, urlsPrevias = [] }: { index: number, setValue: any, urlsPrevias?: string[] }) {
  
    const traduccion = useIdioma();

      const [urls, setUrls] = useState<string[]>(urlsPrevias.length ? [...urlsPrevias, ''] : ['']);
  const [urlsValidas, setUrlsValidas] = useState<boolean[]>(urlsPrevias.length ? [...urlsPrevias.map(() => true), true] : [true]);

  const handleChange = (valor: string, pos: number) => {
    const nuevas = [...urls];
    nuevas[pos] = valor;

    const nuevasValidas = [...urlsValidas];
    nuevasValidas[pos] = !valor || url(valor);

    if (pos === nuevas.length - 1 && valor && nuevas.length < 32) {
      nuevas.push('');
      nuevasValidas.push(true);
    }

    setUrls(nuevas);
    setUrlsValidas(nuevasValidas);
    setValue(`adiciones.${index}.data.images`, nuevas.filter(Boolean));
  };

  const handleRemove = (pos: number) => {
    const nuevas = urls.filter((_, j) => j !== pos);
    const nuevasValidas = urlsValidas.filter((_, j) => j !== pos);
    setUrls(nuevas.length ? nuevas : ['']);
    setUrlsValidas(nuevas.length ? nuevasValidas : [true]);
    setValue(`adiciones.${index}.data.images`, nuevas.filter(Boolean));
  };

  return (
    <>
      {urls.map((e, j) => (
        <div key={j} className="sm:flex items-center gap-2">
          <InputBasico
            titulo=""
            nombre={`adiciones.${index}.data.images.${j}`}
            ancho='full'
            tipo="text"
            placeholder="https://..."
            valor={e}
            validador={(v) => !v || url(v)}
            objetoHook={{
              onChange: (ev: any) => handleChange(ev.target.value, j),
              value: e
            }}
            mensajeError={!urlsValidas[j] ? "X" : ''}
          />
          {!urlsValidas[j] ? (<CajaError>{traduccion("errores", "validacionUrl")}</CajaError>) : ''}
          {urls.length > 1 && (
            <BotonFuncion titulo="X" funcion={() => handleRemove(j)} tipo={2} />
          )}
          {e && (<><br /><img src={e} className="object-cover relative z-100 m-4 h-[220px] w-auto object-contain" /></>)}
          <hr />
        </div>
      ))}
    </>
  );
}

export default ImagesInputExtra;