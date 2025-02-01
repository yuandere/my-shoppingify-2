import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

export const Route = createFileRoute('/auth/confirm')({
	component: RouteComponent,
});

function RouteComponent() {
	const auth = useAuth();
	const urlParams = new URLSearchParams(window.location.search);
	const tokenHash = urlParams.get('token_hash');
	if (tokenHash) {
		auth.verifyOtp(tokenHash);
	}
	Navigate({ to: '/items' });
	return 'Redirecting...';
}
