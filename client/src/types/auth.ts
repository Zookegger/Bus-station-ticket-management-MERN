interface User {
	id: string;
	username: string;
	email: string;
	emailConfirmed: boolean;
}
interface LoginTokens {
	user: User;
	accessToken: string;
	refreshToken: string;
}

interface AuthContextType {
	user: User | null;
	login: (tokens: LoginTokens) => void;
	logout: () => void;
	isLoading: boolean;
}

export type { User, LoginTokens, AuthContextType };
