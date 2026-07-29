"use client"

import { createContext, useContext, useState, ReactNode } from "react";

export type ConfirmationDialogueContextType = {
    isOpen: boolean;
    title: string;
    message: string;
    openPopup: () => void;
    closePopup: () => void;
    setTitle: (title: string) => void;
    setMessage: (message: string) => void;
    callback: () => Promise<void>;
    setCallback: () => void;
};

const ConfirmationDialogueContext = createContext<ConfirmationDialogueContextType | undefined>(undefined);

export function ConfirmationDialogueProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [callback, setCallback] = useState<(() => void) | (() => Promise<void>)>(() => () => { });


    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (<ConfirmationDialogueContext.Provider value={{ isOpen, openPopup, closePopup, title, message, setTitle, setMessage, callback, setCallback }}>
        {children}
    </ConfirmationDialogueContext.Provider>);
}

export function useConfirmationDialogue() {
    const context = useContext(ConfirmationDialogueContext);

    if (!context) {
        throw new Error("ConfirmationDialogueProvider not detected; please check it is in a parent component");
    }

    return context;

}