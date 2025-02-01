import { Link } from '@tanstack/react-router';
import {
	ChartLine,
	ListCheck,
	ShoppingCart,
	Settings,
	LogOut,
	type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import ThemeToggle from './ThemeToggle';
import CartButton from './CartButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
	title: string;
	to: string;
	icon: LucideIcon;
}

const navItems: NavItem[] = [
	{
		title: 'Items',
		to: '/items',
		icon: ShoppingCart,
	},
	{
		title: 'Lists',
		to: '/lists',
		icon: ListCheck,
	},
	{
		title: 'Stats',
		to: '/stats',
		icon: ChartLine,
	},
];

export function NavBar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const isMobile = useIsMobile();
	return (
		<Sidebar
			collapsible='none'
			className={clsx(
				'flex flex-col',
				!isMobile && 'w-14 h-screen border-r',
				isMobile &&
					'absolute z-10 left-0 bottom-0 w-screen h-14 border-t flex-row'
			)}
			{...props}
		>
			<SidebarHeader className={clsx('flex', isMobile && 'flex-row')}>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar className="cursor-pointer">
							<AvatarImage src='https://github.com/shadcn.png' />
							<AvatarFallback>DL</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<Link to="/settings" className="flex items-center gap-2">
								<Settings className="size-4" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
							<LogOut className="size-4" />
							<span>Logout</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<ThemeToggle />
			</SidebarHeader>

			<SidebarContent
				className={clsx(
					'flex flex-col items-center justify-center gap-4',
					isMobile && 'flex-row'
				)}
			>
				{navItems.map((item) => (
					<SidebarMenuItem key={item.to}>
						<SidebarMenuButton asChild className='relative h-10 w-10'>
							<Link
								to={item.to}
								activeProps={{
									className: 'bg-primary/10 text-primary',
								}}
								className={
									'flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
								}
							>
								{({ isActive }) => (
									<>
										<item.icon className='h-5 w-5' />
										<span className='sr-only'>{item.title}</span>
										{isActive && (
											<span className='absolute inset-x-0 -bottom-px h-[2px] bg-primary' />
										)}
									</>
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarContent>

			<SidebarFooter className={clsx('pb-4 flex', isMobile && 'flex-row')}>

				<CartButton />
			</SidebarFooter>
		</Sidebar>
	);
}
