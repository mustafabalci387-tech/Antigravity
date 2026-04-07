import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import AuthService from '@/src/features/auth/services/authService';

// URL'i merkezi yerden almak en iyisidir, şimdilik sabit ama temiz kalsın
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined" || !AuthService.isAuthenticated()) return;

        const token = sessionStorage.getItem("token");
        if (!token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"], // Sadece websocket zorlamak performansı artırır
            reconnection: true,
            reconnectionAttempts: 10,
        });

        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        socketRef.current = socket;

        // Cleanup: Bellek sızıntısını önler
        return () => {
            if (socket) {
                socket.off(); // Tüm dinleyicileri kaldır
                socket.disconnect();
            }
        };
    }, []);

    return { socket: socketRef.current, isConnected };
};