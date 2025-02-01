import { createContext } from 'react';

import { User } from '@supabase/supabase-js';

export interface IAuthContext {
	isAuthenticated: boolean | undefined;
	isInitializing: boolean;
	loginWithEmail: (email: string) => Promise<void>;
	logout: () => Promise<void>;
	user: User | null;
	// retrieveSession: () => Promise<void>;
	verifyOtp: (tokenHash: string) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | null>(null);
