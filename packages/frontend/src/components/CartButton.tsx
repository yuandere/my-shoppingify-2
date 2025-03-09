import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/useIsMobile';

function CartButton() {
	const { toggleSidebar } = useSidebar();
	const isMobile = useIsMobile();
	const [isFlashing, setIsFlashing] = useState(false);

	useEffect(() => {
		const handleFlash = () => setIsFlashing(true);
		const handleFlashEnd = () => setIsFlashing(false);

		window.addEventListener('flash-cart', handleFlash);
		window.addEventListener('flash-cart-end', handleFlashEnd);

		return () => {
			window.removeEventListener('flash-cart', handleFlash);
			window.removeEventListener('flash-cart-end', handleFlashEnd);
		};
	}, []);

	const handleClick = () => {
		if (isMobile) {
			toggleSidebar();
		}
	};

	return (
		<Button 
			onClick={handleClick} 
			disabled={!isMobile}
			className={clsx(
				'w-9 h-9 grid place-items-center p-2 transition-all duration-300 relative isolate',
				isFlashing && [
					'animate-flash bg-primary text-primary-foreground',
					'after:absolute after:inset-0 after:rounded-md',
					'after:animate-flash after:z-[-1]'
				]
			)}
		>
			<ShoppingCart className='h-4 w-4' />
		</Button>
	);
}

export default CartButton;
