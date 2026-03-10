//Respuesta exitosa de la API
export const exito = (mensaje:string = '', datos:any = null, codigo:number = 200):Record<string,any> => {
    return {ok: true, data: datos, message: mensaje, code: codigo};
}

//Respuesta de error de la API
export const fallo = (mensaje:string = "error", datos:any = null, codigo:number = 400):Record<string,any> => {
    return {ok: false, data: datos, message: mensaje, code: codigo};
}

//Respuesta de error interno del backend
export const falloInterno = (mensaje:string = "Server error", datos:any = null, codigo:number = 500):Record<string, any> => {
    return {ok:false, message: mensaje, datos: datos, code: codigo};
}

//Manejador de errores para las rutas
export const manejadorRuta = async (req, res, funcion:Function) => {
    try {
        return await funcion();
    } catch (error:any) {
        try {
            console.log(error);
            return res.status(error?.code ?? 400).json(fallo(error?.message, error?.data ?? null, error?.code ?? 400));
        } catch (error2:any) {
            console.log(error2);
            return res.status(error2?.code ?? 500).json(falloInterno(error2?.message));
        }
    }
}