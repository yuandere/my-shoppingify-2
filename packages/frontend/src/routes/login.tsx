import * as React from 'react';
import {
	createFileRoute,
	redirect,
	useRouter,
	useRouterState,
} from '@tanstack/react-router';
import { z } from 'zod';

import { useAuth } from '../hooks/useAuth';

const fallback = '/items' as const;

export const Route = createFileRoute('/login')({
	validateSearch: z.object({
		redirect: z.string().optional().catch(''),
	}),
	beforeLoad: ({ context, search }) => {
		if (context.auth.isInitializing) {
			return;
		}
		if (context.auth.isAuthenticated) {
			throw redirect({ to: search.redirect || fallback });
		}
	},
	component: LoginComponent,
});

function LoginComponent() {
	const auth = useAuth();
	const router = useRouter();
	const isLoading = useRouterState({ select: (s) => s.isLoading });
	const navigate = Route.useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [isSubmitted, setIsSubmitted] = React.useState(false);

	const search = Route.useSearch();

	const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
		setIsSubmitting(true);
		try {
			evt.preventDefault();
			const data = new FormData(evt.currentTarget);
			const fieldValue = data.get('email');

			if (!fieldValue) return;
			const email = fieldValue.toString();
			await auth.loginWithEmail(email);

			await router.invalidate();

			await navigate({ to: search.redirect || fallback });
		} catch (error) {
			console.error('Error logging in: ', error);
		} finally {
			setIsSubmitting(false);
			setIsSubmitted(true);
		}
	};

	const isLoggingIn = isLoading || isSubmitting;

	return (
		<div className='p-2 grid gap-2 place-items-center'>
			<h3 className='text-xl'>Register/Login page</h3>
			{search.redirect ? (
				<p className='text-red-500'>You need to login to access this page.</p>
			) : (
				<p>Login to see all the cool content in here.</p>
			)}
			<form className='mt-4 max-w-lg' onSubmit={onFormSubmit}>
				<fieldset disabled={isLoggingIn} className='w-full grid gap-2'>
					<div className='grid gap-2 items-center min-w-[300px]'>
						<label htmlFor='username-input' className='text-sm font-medium'>
							Email
						</label>
						<input
							id='email-input'
							name='email'
							placeholder='Enter your email'
							type='text'
							className='border rounded-md p-2 w-full'
							required
						/>
					</div>
					<button
						type='submit'
						className='bg-blue-500 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500'
					>
						{isLoggingIn ? 'Loading...' : 'Register/Login'}
					</button>
				</fieldset>
			</form>
			<div className=''>
				{isSubmitted && (
					<p className='text-red-500'>Email sent. Please check your inbox.</p>
				)}
			</div>
		</div>
	);
}
