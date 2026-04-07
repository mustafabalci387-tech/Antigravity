/**
 * useSocket.js — React Native için Socket.IO custom kancası (hook).
 *
 * Mobil platform özelliklerine (App state changes) duyarlı Socket.io bağlantısı.
 * Arka plana atıldığında socket'i korur veya yeniden açıldığında tekrar bağlanır.
 */

import { useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

// IP'nin emulator veya dış IP olabileceğini unutmayın (api.js'deki adresi örnek alabilirsiniz)
// Local test için dışarıya 10.31.231.121 açmıştınız
const SOCKET_URL = "http://10.0.2.2:5000";

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        let socket;

        const connectSocket = async () => {
            const token = await SecureStore.getItemAsync("token");
            console.log("📱 [Socket] Token durumu:", token ? "VAR" : "YOK");
            console.log("📱 [Socket] Bağlanıyor:", SOCKET_URL);
            if (!token) return; // Oturum yoksa bağlanma

            socket = io(SOCKET_URL, {
                auth: { token },
                transports: ["polling", "websocket"],
                reconnection: true,
                reconnectionAttempts: 10,
            });

            socket.on("connect", () => {
                console.log("📱 [Mobile Socket] Bağlandı:", socket.id);
                setIsConnected(true);
            });

            socket.on("disconnect", () => {
                console.log("📱 [Mobile Socket] Bağlantı koptu.");
                setIsConnected(false);
            });

            socket.on("connect_error", (err) => {
                console.error("📱 [Mobile Socket] Hata:", err.message, "| Type:", err.type, "| Description:", err.description);
            });

            socketRef.current = socket;
        };

        connectSocket();

        // Arka plan/ön plan (background/foreground) yönetimi
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                // Uygulama ön plana geldiğinde kopuksa tekrar bağlanmayı dene
                if (socketRef.current && !socketRef.current.connected) {
                    socketRef.current.connect();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return { socket: socketRef.current, isConnected };
};
