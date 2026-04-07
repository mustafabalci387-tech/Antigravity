"use client";

import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }) {
    // OTURUM SİLME KODUNU KALDIRDIK! 
    // ARTIK GİRİŞ YAPTIĞINDA SİSTEM SENİ UNUTMAYACAK.

    return (
        <HeroUIProvider>
            {children}
        </HeroUIProvider>
    );
}