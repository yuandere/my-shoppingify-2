import { createClient, SupportedStorage } from '@supabase/supabase-js';

const supportsLocalStorage = () => {
	try {
		const storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch {
		return false;
	}
};

const customStorageAdapter: SupportedStorage = {
	getItem: (key) => {
		if (!supportsLocalStorage()) {
			const cookie = document.cookie
				.split('; ')
				.find((row) => row.startsWith(`${key}=`));
			return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
		}
		return globalThis.localStorage.getItem(key);
	},
	setItem: (key, value) => {
		if (!supportsLocalStorage()) {
			const expires = new Date();
			expires.setFullYear(expires.getFullYear() + 1);
			document.cookie = `${key}=${encodeURIComponent(
				value
			)}; expires=${expires.toUTCString()}; path=/`;
			return;
		}
		globalThis.localStorage.setItem(key, value);
	},
	removeItem: (key) => {
		if (!supportsLocalStorage()) {
			document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
			return;
		}
		globalThis.localStorage.removeItem(key);
	},
};

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
	auth: {
		detectSessionInUrl: true,
		flowType: 'pkce',
		storage: customStorageAdapter,
	},
});

supabase.auth.onAuthStateChange((event, session) => {
	if (session && session.provider_token) {
		window.localStorage.setItem('oauth_provider_token', session.provider_token);
	}

	if (session && session.provider_refresh_token) {
		window.localStorage.setItem(
			'oauth_provider_refresh_token',
			session.provider_refresh_token
		);
	}

	if (event === 'SIGNED_OUT') {
		window.localStorage.removeItem('oauth_provider_token');
		window.localStorage.removeItem('oauth_provider_refresh_token');
	}
});
