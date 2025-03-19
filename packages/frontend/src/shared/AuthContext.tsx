import { createContext } from 'react';

import { User } from '@supabase/supabase-js';

export interface IAuthContext {
	isAuthenticated: boolean | undefined;
	isInitializing: boolean;
	loginWithDemo: (captchaToken: string) => Promise<User | null>;
	loginWithEmail: (email: string, captchaToken: string) => Promise<void>;
	logout: () => Promise<void>;
	user: User | null;
	verifyOtp: (tokenHash: string) => Promise<void>;
	handleStoreAuth: (user: User | null) => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);
