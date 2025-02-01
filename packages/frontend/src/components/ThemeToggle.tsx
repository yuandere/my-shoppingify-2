import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
	const queryClient = useQueryClient();
	const themeInit =
		queryClient.getQueryData(['ui', 'theme-dark']) ??
		window.matchMedia('(prefers-color-scheme: dark)').matches;
	const [isDarkMode, setIsDarkMode] = useState<boolean | unknown>(themeInit);

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			queryClient.setQueryData(['ui', 'theme-dark'], true);
		} else {
			document.documentElement.classList.remove('dark');
			queryClient.setQueryData(['ui', 'theme-dark'], false);
		}
	}, [isDarkMode, queryClient]);

	return (
		<button
			onClick={() => setIsDarkMode((prevMode: unknown) => !prevMode)}
			className='p-2 rounded-full focus:outline-none'
		>
			{isDarkMode ? (
				<Moon className='text-gray-800 dark:text-gray-200' />
			) : (
				<Sun className='text-yellow-500 dark:text-yellow-300' />
			)}
		</button>
	);
};

export default ThemeToggle;
