"use client";

import { ReactNode } from "react";
import { NextAuthSessionProvider } from "./child-providers/SessionProvider";
import { ConfirmationDialogueProvider } from "./child-providers/ConfirmationDialogProvider";

export default function RootProvider({ children }: { children: ReactNode }) {
    return (
        <NextAuthSessionProvider>
            <ConfirmationDialogueProvider>
                {children}
            </ConfirmationDialogueProvider>
        </NextAuthSessionProvider>
    );
}
