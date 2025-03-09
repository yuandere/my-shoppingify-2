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
			className='w-9 h-9 grid place-items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400'
		>
			{isDarkMode ? (
				<Moon className='w-5 h-5 text-gray-200' />
			) : (
				<Sun className='w-5 h-5 text-yellow-500' />
			)}
		</button>
	);
};

export default ThemeToggle;
