import { ReactNode, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/shared/supabaseClient';
import { AuthContext } from './AuthContext';

const useAuthQuery = () => {
	return useQuery({
		queryKey: ['auth'],
		queryFn: async () => {
			try {
				const { data } = await supabase.auth.getSession();
				return data.session?.user ?? null;
			} catch {
				return null;
			}
		},
		retry: false,
	});
};

const clearLocalStorage = () => {
	[window.localStorage, window.sessionStorage].forEach((storage) => {
		Object.entries(storage).forEach(([key]) => {
			storage.removeItem(key);
		});
	});
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const { data, isLoading, isFetching } = useAuthQuery();

	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
		undefined
	);
	const isInitializing =
		isLoading || isFetching || isAuthenticated === undefined;

	const handleStoreAuth = useCallback(
		(user: User | null) => {
			setUser(user);
			queryClient.setQueryData(['auth'], user);
			setIsAuthenticated(!!user);
		},
		[queryClient]
	);

	const loginWithEmail = async (email: string) => {
		const { data, error } = await supabase.auth.signInWithOtp({
			email: email,
			options: {
				emailRedirectTo: import.meta.env.VITE_EMAIL_REDIRECT_TO,
			},
		});
		console.log('LOGINWITHEMAIL', data);
		if (error) throw new Error(error.message);
		handleStoreAuth(data.user);
	};

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw new Error(error.message);
		handleStoreAuth(null);
	};

	const verifyOtp = async (tokenHash: string) => {
		const { data, error } = await supabase.auth.verifyOtp({
			token_hash: tokenHash,
			type: 'email',
		});
		if (error) throw new Error(error.message);
		handleStoreAuth(data.user);
	};

	const contextValue = {
		isAuthenticated,
		user,
		loginWithEmail,
		logout,
		verifyOtp,
	};

	useEffect(() => {
		if (data !== undefined) {
			handleStoreAuth(data);
		}
	}, [data, handleStoreAuth]);

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			console.log('AUTHEVENT', event);
			console.log('AUTHSESSION', session);
			handleStoreAuth(session?.user ?? null);
			if (event === 'INITIAL_SESSION') {
				// handle initial session
				// const urlParams = new URLSearchParams(window.location.search);
				// const tokenHash = urlParams.get('token_hash');
				// if (tokenHash) {
				// 	verifyOtp(tokenHash);
				// }
			} else if (event === 'SIGNED_IN' && session) {
				// handle signed in
			} else if (event === 'SIGNED_OUT') {
				clearLocalStorage();
			} else if (event === 'TOKEN_REFRESHED') {
				// handle token refreshed event
			} else if (event === 'USER_UPDATED') {
				// handle user updated event
			}
		});
		return () => {
			data.subscription.unsubscribe();
		};
	}, [handleStoreAuth]);

	return (
		<AuthContext.Provider value={{ ...contextValue, isInitializing }}>
			{isInitializing ? null : children}
		</AuthContext.Provider>
	);
}
