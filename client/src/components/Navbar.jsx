import {
	Dumbbell,
	History,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NAV_LINKS = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/workout", label: "Workout", icon: Dumbbell },
	{ to: "/history", label: "History", icon: History },
	{ to: "/settings", label: "Settings", icon: Settings },
];

const getInitials = (name = "") =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

const NavItem = ({ to, label, icon: Icon, onClick }) => (
	<NavLink
		to={to}
		onClick={onClick}
		className={({ isActive }) =>
			[
				"relative overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-300",
				"before:absolute before:inset-0 before:rounded-lg",
				"before:bg-primary before:transition-transform before:duration-300",
				"before:origin-center before:z-0",
				isActive
					? "before:scale-x-100 text-primary-foreground hover:text-foreground"
					: "before:scale-x-0 text-muted-foreground hover:text-accent-foreground hover:bg-accent",
			].join(" ")
		}
	>
		<Icon className="relative z-10 w-5 h-5 shrink-0" />
		<span className="relative z-10">{label}</span>
	</NavLink>
);

const SidebarContent = ({ onNavClick }) => {
	const { user, logout, theme, setTheme } = useAuth();

	return (
		<div className="flex flex-col h-full py-4">
			<div className="flex items-center gap-2 px-4 mb-6">
				<div className="w-8 h-8 rounded-lg flex items-center justify-center">
					<Zap className="w-7 h-7 text-primary-foreground fill-primary" />
				</div>
				<span className="text-xl font-bold tracking-tight">NeuralFit</span>
			</div>

			<nav className="flex-1 px-2 space-y-1">
				{NAV_LINKS.map((link) => (
					<NavItem key={link.to} {...link} onClick={onNavClick} />
				))}
			</nav>

			<Separator className="my-4" />

			<div className="px-2 space-y-1">
				<div className="flex items-center justify-between px-3 py-2">
					<span className="text-sm text-muted-foreground">Theme</span>
					<ThemeToggle theme={theme} onChange={setTheme} compact />
				</div>
				<div className="flex items-center gap-3 px-3 py-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src={user?.avatar} alt={user?.name} />
						<AvatarFallback className="text-xs">
							{getInitials(user?.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">{user?.name}</p>
						<p className="text-xs text-muted-foreground truncate">
							{user?.email}
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={logout}
					className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
				>
					<LogOut className="w-5 h-5 shrink-0" />
					Log out
				</button>
			</div>
		</div>
	);
};

const Navbar = () => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<>
			<aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:bg-background z-30">
				<SidebarContent />
			</aside>

			<div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-background flex items-center px-4 z-30">
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="Open menu">
							<Menu className="w-5 h-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-60 p-0">
						<SidebarContent onNavClick={() => setMobileOpen(false)} />
					</SheetContent>
				</Sheet>

				<span className="ml-3 font-bold text-lg">NeuralFit</span>
			</div>
		</>
	);
};

export default Navbar;
