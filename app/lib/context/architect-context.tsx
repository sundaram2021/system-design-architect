"use client";

import React, { createContext, useContext, useReducer, useMemo, type ReactNode } from "react";
import { ArchitectContextValue } from "./types";
import { initialState, reducer } from "./reducer";
import { useArchitectLogic } from "./use-architect-logic";

const ArchitectContext = createContext<ArchitectContextValue | null>(null);

export function ArchitectProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const logic = useArchitectLogic(state, dispatch);

    const value: ArchitectContextValue = useMemo(() => ({
        ...state,
        ...logic
    }), [state, logic]);

    return (
        <ArchitectContext.Provider value={value}>
            {children}
        </ArchitectContext.Provider>
    );
}

export function useArchitect() {
    const context = useContext(ArchitectContext);
    if (!context) {
        throw new Error("useArchitect must be used within an ArchitectProvider");
    }
    return context;
}
