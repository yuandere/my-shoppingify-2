import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import './main.css';

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	);
}
