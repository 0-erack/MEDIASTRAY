import { createContext, useState, ReactNode } from "react";

interface SesionContextoType {
    usuario: any;
    setUsuario: (usuario: any) => void;
}

const SesionContext = createContext<SesionContextoType | null>(null);

export const SesionProvider = ({ children }: { children: ReactNode }) => {
    
    


    return (
        <SesionContext.Provider value={{  }}>
            {children}
        </SesionContext.Provider>
    );
};
