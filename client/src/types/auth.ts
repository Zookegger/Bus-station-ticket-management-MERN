interface User {
	id: string;
	username: string;
	email: string;
	emailConfirmed: boolean;
}
interface LoginTokens {
	user: User;
	csrfToken: string;
}

interface AuthContextType {
	user: User | null;
	login: (data: LoginTokens) => void;
	logout: () => void;
	isLoading: boolean;
}

export type { User, LoginTokens, AuthContextType };
