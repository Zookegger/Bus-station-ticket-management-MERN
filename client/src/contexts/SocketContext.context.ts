import type { SocketCtx } from "@my-types/websocket";
import { createContext } from "react";

export const SocketContext = createContext<SocketCtx | null>(null);
