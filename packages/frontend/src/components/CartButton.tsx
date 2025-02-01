import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/useIsMobile';

function CartButton() {
	const { toggleSidebar } = useSidebar();
	const isMobile = useIsMobile();

	const handleClick = () => {
		if (isMobile) {
			toggleSidebar();
		}
	};

	return (
		<Button onClick={handleClick} disabled={!isMobile}>
			<ShoppingCart className='h-4 w-4' />
		</Button>
	);
}

export default CartButton;
