import { useMemo } from "react";
import useWebsocket from "@hooks/useWebsocket";
import { SocketContext } from "./SocketContext.context";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const ws = useWebsocket({
      namespace: "/realtime",
      auto_connect: true,
      debug: false,
      max_reconnect_attempts: 5,
      reconnect_delay: 1000,
      events: {
         "notification:new": (n) => {/* update notification state */},
         "seat:update": (s) => {/* update seat map cache */},
         "dashboard:metrics": (d) => {/* update dashboard store */},
      },
   });

   const value = useMemo(() => ({
      joinRoom: (room: string) => ws.emitEvent("room:join", { room }),
      leaveRoom: (room: string) => ws.emitEvent("room:leave", { room }),
   }), [ws]);

   return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}