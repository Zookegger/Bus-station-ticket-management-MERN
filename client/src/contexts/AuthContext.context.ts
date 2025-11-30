import { createContext } from "react";
import type { AuthContextType } from "@my-types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);